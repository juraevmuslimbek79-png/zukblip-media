import * as THREE from 'three';
import { drawChar3 } from './chars3.js';
export { THREE };
export const E = window.EV, Wd = 720, Hd = 1280;
const canvas = document.getElementById('c');
export const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: true });
R.setSize(Wd, Hd); R.setPixelRatio(1); R.outputColorSpace = THREE.SRGBColorSpace; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
export const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xffe2b8, 70, 260);
export const cam = new THREE.PerspectiveCamera(40, Wd / Hd, 0.1, 2000);
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u, ease = u => u * u * (3 - 2 * u), easeOut = u => 1 - (1 - u) ** 3, k01 = (t, a, b) => clamp((t - a) / (b - a));
export const V = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
export const hash = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const grad = (() => { const t = new THREE.DataTexture(new Uint8Array([140, 200, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
export const toon = (c, map) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, map: map || null });
export const outlineMat = new THREE.MeshBasicMaterial({ color: 0x17121c, side: THREE.BackSide, fog: false });
export function add(geo, color, x, y, z, ol = 0.04, parent = scene, map) {
  const m = new THREE.Mesh(geo, toon(color, map)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m);
  if (ol) { const o = new THREE.Mesh(geo, outlineMat); geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s); o.scale.set(1 + ol * 2 / Math.max(s.x, 0.01), 1 + ol * 2 / Math.max(s.y, 0.01), 1 + ol * 2 / Math.max(s.z, 0.01)); m.add(o); }
  return m; }
export function canvasTex(w, h, fn, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; }
// ---- sky with time-of-day uniforms
const skyU = { top: { value: new THREE.Color(0x2a84f2) }, bot: { value: new THREE.Color(0xffdca8) } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 p; void main(){ float e = clamp(p.y,0.,1.); gl_FragColor = vec4(mix(bot, top, pow(e,0.45)),1.); }' })); scene.add(sky);
export const sunDir = new THREE.Vector3(-0.55, 0.42, -0.72).normalize();
export const sunL = new THREE.DirectionalLight(0xffd9a0, 3.0); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 200 }); sunL.shadow.bias = -0.0006; scene.add(sunL); scene.add(sunL.target);
export const hemi = new THREE.HemisphereLight(0xbfe0ff, 0xf0c890, 1.25); scene.add(hemi);
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,235,1)'); gr.addColorStop(0.22, 'rgba(255,240,180,1)'); gr.addColorStop(0.3, 'rgba(255,200,110,0.6)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending })); sunSprite.scale.set(300, 300, 1); scene.add(sunSprite);
const clouds = []; { const ct = canvasTex(512, 256, (g) => { g.fillStyle = '#fff'; [[120, 160, 70], [200, 120, 90], [300, 130, 80], [380, 165, 60], [250, 180, 70]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); g.fillRect(120, 160, 260, 70); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,190,140,0.45)'; g.fillRect(0, 185, 512, 90); });
  for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, fog: false })); const a = hash(i) * Math.PI * 2; s.position.set(Math.cos(a) * 420, 50 + hash(i + 1) * 80, Math.sin(a) * 420); s.scale.set(110, 55, 1); scene.add(s); clouds.push(s); } }
export const TIMES = {
  day: { top: 0x2a84f2, bot: 0xffdca8, sun: 0xffd9a0, si: 3.0, hs: 0xbfe0ff, hg: 0xf0c890, hi: 1.25, fog: 0xffe2b8, cloud: 0xffffff, dir: [-0.55, 0.42, -0.72] },
  sunset: { top: 0x3a3a9a, bot: 0xff9a4a, sun: 0xff8a3a, si: 3.4, hs: 0x9a8ae0, hg: 0xd08060, hi: 1.0, fog: 0xff9a5a, cloud: 0xffb090, dir: [-0.7, 0.16, -0.6] },
  night: { top: 0x0a0e3a, bot: 0x2a3a8a, sun: 0x8aa8ff, si: 1.3, hs: 0x4a5ac8, hg: 0x2a2a5a, hi: 1.1, fog: 0x1a2460, cloud: 0x4a5aa8, dir: [0.4, 0.6, 0.5] },
};
export function setTime(n, ov = {}) { const T = Object.assign({}, TIMES[n], ov); skyU.top.value.set(T.top); skyU.bot.value.set(T.bot); sunL.color.set(T.sun); sunL.intensity = T.si; hemi.color.set(T.hs); hemi.groundColor.set(T.hg); hemi.intensity = T.hi; scene.fog.color.set(T.fog); sunDir.set(...T.dir).normalize(); clouds.forEach(c => c.material.color.set(T.cloud)); sunSprite.visible = n !== 'night'; sky.visible = !T.noSky; }
// ---- billboards
export const bills = [];
export function bill(o, h = 3.4) { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1536; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; const w = h * 2 / 3;
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: false }));
  m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }); m.layers.enable(1); scene.add(m);
  const b = { m, g: cv.getContext('2d'), tex, o, st: {}, vis: false }; bills.push(b); return b; }
export const fxObjs = []; // layer-1 3D objects (props that should stay sharp)
export function sharp(obj) { obj.traverse(o => o.layers.set(1)); fxObjs.push(obj); return obj; }
export const hideAll = () => { bills.forEach(b => { b.vis = false; b.st = {}; b.m.scale.set(1, 1, 1); b.m.rotation.set(0, 0, 0); b.tint = null; }); fxObjs.forEach(o => o.visible = false); };
export const put = (b, x, y, z, st, s = 1) => { b.vis = true; b.m.position.set(x, y, z); b.st = st || {}; b.m.scale.set(s, s, s); return b; };
export const cm = (p0, p1, l0, l1, f0, f1, u, o = {}) => Object.assign({ p: V(p0, p1, u), l: V(l0, l1, u), f: lerp(f0, f1 ?? f0, u) }, o);
// ---- compositor + 2D fx
const out = document.createElement('canvas'); out.width = Wd; out.height = Hd; export const ctx = out.getContext('2d');
const wb = document.createElement('canvas'); wb.width = Wd; wb.height = Hd; const wctx = wb.getContext('2d');
const cb = document.createElement('canvas'); cb.width = Wd; cb.height = Hd; const cctx = cb.getContext('2d');
const _v = new THREE.Vector3();
export function proj(x, y, z) { _v.set(x, y, z).project(cam); return [(_v.x * 0.5 + 0.5) * Wd, (-_v.y * 0.5 + 0.5) * Hd, _v.z < 1]; }
export function speedLines(t, n, col, cxp, cyp, rot) { ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(rot); ctx.strokeStyle = col; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const y = (hash(i) - 0.5) * 1500, k = (t * (2 + hash(i + 3) * 2) + hash(i + 1)) % 1, x = 900 - k * 1800, L = 120 + hash(i + 2) * 260; ctx.lineWidth = 2 + hash(i + 4) * 5; ctx.globalAlpha = 0.5 * Math.sin(k * Math.PI); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; }
export function star(x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a; ctx.fillStyle = '#fff6c0'; ctx.strokeStyle = '#17121c'; ctx.lineWidth = 8; ctx.beginPath(); for (let i = 0; i < 16; i++) { const ang = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.42 : r; ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); } ctx.closePath(); ctx.stroke(); ctx.fill(); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.4); gr.addColorStop(0, 'rgba(255,240,170,0.9)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(-r * 3, -r * 3, r * 6, r * 6); ctx.restore(); ctx.globalAlpha = 1; }
export function flash(a, col = '255,255,255') { if (a > 0) { ctx.fillStyle = `rgba(${col},${Math.min(1, a)})`; ctx.fillRect(0, 0, Wd, Hd); } }
export function glow2d(x, y, r, col, a = 1) { const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
export function rays(x, y, n, len, col, t) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + t * 0.15, w = 0.05 + 0.03 * Math.sin(k * 5); ctx.fillStyle = `rgba(${col},${0.05 + 0.03 * Math.sin(t * 2 + k * 2)})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - w) * len, y + Math.sin(a - w) * len); ctx.lineTo(x + Math.cos(a + w) * len, y + Math.sin(a + w) * len); ctx.fill(); } ctx.restore(); }
export function text2d(txt, x, y, size, col = '#fff', a = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.font = `900 ${size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#17121c'; ctx.lineWidth = size * 0.16; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore(); }
// CAM: {p,l,f, roll, blur, focus, tint:'rgb()' multiply over everything, charTint: multiply over characters only, dark: 0..1 black overlay}
export function render(t, CAM, fx = []) {
  cam.position.set(...CAM.p); cam.up.set(0, 1, 0); cam.lookAt(...CAM.l); cam.rotateZ(CAM.roll || 0); cam.fov = CAM.f; cam.updateProjectionMatrix();
  for (const b of bills) { b.m.visible = b.vis; if (!b.vis) continue; drawChar3(b.g, t, b.o, b.st); b.tex.needsUpdate = true; b.m.rotation.y = Math.atan2(cam.position.x - b.m.position.x, cam.position.z - b.m.position.z); if (b.st.rz) b.m.rotation.z = b.st.rz; }
  sunSprite.position.copy(cam.position).addScaledVector(sunDir, 600); sunL.position.copy(cam.position).addScaledVector(sunDir, 60); _v.set(0, 0, -6).applyQuaternion(cam.quaternion); sunL.target.position.copy(cam.position).add(_v).setY(0);
  bills.forEach(b => { b.m.material.colorWrite = false; b.m.material.depthWrite = false; }); cam.layers.set(0); R.setClearColor(CAM.bg ?? 0x000000, 1); R.render(scene, cam);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.drawImage(canvas, 0, 0);
  if (CAM.blur) { wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.globalCompositeOperation = 'source-over'; wctx.clearRect(0, 0, Wd, Hd); wctx.filter = `blur(${CAM.blur}px)`; wctx.drawImage(canvas, 0, 0); wctx.filter = 'none';
    const fy = (CAM.focus ?? 0.8) * Hd; const gr = wctx.createLinearGradient(0, fy - 260, 0, fy); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); wctx.globalCompositeOperation = 'destination-in'; wctx.fillStyle = gr; wctx.fillRect(0, 0, Wd, Hd); ctx.drawImage(wb, 0, 0); }
  (CAM.under || []).forEach(f => f());
  bills.forEach(b => { b.m.material.colorWrite = true; b.m.material.depthWrite = true; }); cam.layers.set(1); R.setClearColor(0x000000, 0); R.render(scene, cam);
  if (CAM.charTint) { cctx.setTransform(1, 0, 0, 1, 0, 0); cctx.globalCompositeOperation = 'source-over'; cctx.clearRect(0, 0, Wd, Hd); cctx.drawImage(canvas, 0, 0); cctx.globalCompositeOperation = 'source-atop'; cctx.fillStyle = CAM.charTint; cctx.globalCompositeOperation = 'multiply'; cctx.fillRect(0, 0, Wd, Hd); cctx.globalCompositeOperation = 'destination-in'; cctx.drawImage(canvas, 0, 0); ctx.drawImage(cb, 0, 0); } else ctx.drawImage(canvas, 0, 0);
  if (CAM.tint) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = CAM.tint; ctx.fillRect(0, 0, Wd, Hd); ctx.globalCompositeOperation = 'source-over'; }
  if (CAM.dark) flash(CAM.dark, '4,4,14');
  fx.forEach(f => f());
  return out.toDataURL('image/jpeg', 0.93);
}
scene.traverse(o => { if (o.isLight) o.layers.enable(1); });
