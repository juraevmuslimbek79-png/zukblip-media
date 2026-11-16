// v2 characters: big shaded head, capsule torso with gradient, thick outline, expressive face. Canvas 768x1536 (design space 512x1024).
const K = '#17121c';
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
export function drawChar3(g, t, o, st) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1024, 1536); g.setTransform(1.5, 0, 0, 1.5, 0, 0); g.lineCap = 'round'; g.lineJoin = 'round';
  const pose = st.pose || 'stand', f = st.f ?? 1, back = !!st.back, ph = o.ph || 0;
  const walk = pose === 'walk' || pose === 'run', run = pose === 'run', wph = t * (st.speed || 8) + ph;
  const breathe = Math.sin(t * 2.2 + ph) * 3, bob = (pose === 'crouch' ? 150 : pose === 'sit' ? 120 : 0) - (walk ? Math.abs(Math.sin(wph)) * (run ? 26 : 14) : 0) + (st.dy || 0);
  const cx = 341 + (st.lean || 0) * 30, hipY = 600 + bob, shY = 372 + bob - breathe * 0.5, headY = 232 + bob - breathe + (st.nod || 0) * 26, R = 122;
  const LW = 21;
  const limb = (pts, w = LW, c = K) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
  // ---- legs
  for (const s of [-1, 1]) { let kx = cx + s * 34, ky = hipY + 185, fx = cx + s * 46, fy = 975;
    if (pose === 'crouch') { kx = cx + s * 105; ky = hipY + 60; fx = cx + s * 70; fy = 975; }
    if (pose === 'swing') { const k = st.sw || 0; kx = cx + s * 50 + k * 20 * f; fx = cx + s * (70 + (s === f ? 30 * k : 0)); }
    if (pose === 'windup' && s === f) { const k = st.wu || 0; kx = cx + s * 40 + f * 60 * k; ky = hipY + 185 - 150 * k; fx = kx + f * 20; fy = 975 - 230 * k; }
    if (walk) { const p = wph + (s > 0 ? 0 : Math.PI), a = Math.sin(p) * (run ? 0.85 : 0.5), kb = (run ? 1.2 : 0.7) * Math.max(0, Math.sin(p + 1)); kx = cx + s * 20 + Math.sin(a) * 185 * f; ky = hipY + Math.cos(a) * 185; fx = kx + Math.sin(a - kb) * 190 * f; fy = Math.min(975, ky + Math.cos(a - kb) * 190); }
    if (pose === 'sit') { kx = cx + f * 120 + s * 22; ky = hipY + 24; fx = kx + f * 14; fy = hipY + 215; }
    if (o.coat && s === -1) { g.fillStyle = shade(o.coat, -0.25); g.strokeStyle = K; g.lineWidth = 11; g.beginPath(); g.roundRect(cx - 86, hipY - 70, 172, 210, 30); g.fill(); g.stroke(); }
    limb([cx + s * 26, hipY, kx, ky, fx, fy]);
    g.fillStyle = o.shoes || '#2a2230'; g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.ellipse(fx + f * 16, fy + 4, 40, 19, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(fx + f * 22, fy - 3, 20, 6, 0, 0, 7); g.fill(); }
  // ---- arms (back arm first)
  const sh = s => [cx + s * 58, shY + 22];
  const hand = (x, y, glove) => { if (glove) { g.fillStyle = '#a8642c'; g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.ellipse(x, y, 40, 46, 0.3, 0, 7); g.fill(); g.stroke(); g.strokeStyle = '#6a3a14'; g.lineWidth = 5; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * 14, y - 36); g.lineTo(x + k * 12, y - 8); g.stroke(); } return; }
    g.fillStyle = o.skin || '#f7f2ea'; g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.arc(x, y, 19, 0, 7); g.fill(); g.stroke(); };
  let arms = { [-1]: [cx - 80, shY + 130, cx - 74, shY + 235], [1]: [cx + 80, shY + 130, cx + 74, shY + 235] }; let batA = null, batAt = null;
  const AA = (s, a1, a2) => { const [sx, sy] = sh(s); const ex = sx + Math.sin(a1) * 112 * f, ey = sy + Math.cos(a1) * 112; return [ex, ey, ex + Math.sin(a2) * 108 * f, ey + Math.cos(a2) * 108]; };
  if (walk) { const am = run ? 1.1 : 0.6, q = Math.sin(wph); arms[f] = AA(f, -q * am, -q * am + 0.8); arms[-f] = AA(-f, q * am, q * am + 0.8); }
  const jt = 0.12 * Math.sin(t * 6 + ph);
  const PRE = { point: [[1.5, 1.55], null], tray: [[1.7, 3.05], null], think: [[0.45, 2.75], null], shrug: [[1.15, 2.5], [-1.15, -2.5]], grope: [[1.35 + jt, 1.6 - jt], [1.0 - jt, 1.4 + jt]], hold: [[0.85, 1.85], null], cheer: [[2.7 + jt, 3.0], [-2.7 - jt, -3.0]], sword: [[1.25 + jt * 0.5, 1.75], [-0.5, -0.2]], hips: [[0.9, -0.6], [-0.9, 0.6]], cover: [[1.0, 2.95], [0.6, 2.9]], write: [[0.7, 2.0], [0.5, 1.7]] };
  if (PRE[pose]) { if (PRE[pose][0]) arms[f] = AA(f, ...PRE[pose][0]); if (PRE[pose][1]) arms[-f] = AA(-f, ...PRE[pose][1]); }
  if (st.armF) arms[f] = AA(f, ...st.armF); if (st.armB) arms[-f] = AA(-f, ...st.armB);
  if (pose === 'bat') { const hx = cx + f * 62, hy = shY + 118 + Math.sin(t * 2 + ph) * 3; arms[f] = [cx + f * 104, shY + 96, hx + f * 4, hy + 8]; arms[-f] = [cx - f * 20, shY + 130, hx - f * 10, hy - 14]; batAt = [hx, hy]; batA = -f * (1.02 + 0.03 * Math.sin(t * 2 + ph)); }
  if (pose === 'swing') { const k = st.sw || 0; const a = (-2.2 + k * 4.4) * f; const hx = cx + f * (40 + 70 * Math.sin(k * Math.PI)), hy = shY + 110; arms[f] = [cx + f * 96, shY + 80, hx, hy]; arms[-f] = [cx + f * 10, shY + 110, hx - f * 8, hy - 10]; batAt = [hx, hy]; batA = a; }
  if (pose === 'set' || pose === 'windup') { const k = st.wu || 0; arms[-f] = [cx - f * 70, shY + 90, cx - f * 10, shY + 70 - k * 120]; arms[f] = [cx + f * 80, shY + 100 - k * 60, cx + f * 20 + f * k * 110, shY + 84 - k * 190]; }
  if (pose === 'yawn') { arms[f] = [cx + f * 110, shY + 60, cx + f * 70, shY - 70]; }
  if (pose === 'crouch') { arms[-1] = [cx - 96, shY + 110, cx - 40, shY + 190]; arms[1] = [cx + 96, shY + 110, cx + 40, shY + 190]; }
  const drawArm = s => { const [ex, ey, wx, wy] = arms[s]; limb([...sh(s), ex, ey, wx, wy]); if (!(batAt && pose !== 'yawn')) hand(wx, wy, (pose === 'set' || pose === 'windup' || pose === 'crouch') && s === -f && o.glove); else hand(wx, wy); };
  const bat = () => { const [hx, hy] = batAt; g.save(); g.translate(hx, hy); g.rotate(batA); if (pose === 'swing' && st.sw > 0.05 && st.sw < 0.98) { for (let k = 1; k <= 5; k++) { g.save(); g.rotate(-f * k * 0.16); g.globalAlpha = 0.16 - k * 0.025; g.fillStyle = '#fff2c8'; g.beginPath(); g.moveTo(-8, 20); g.lineTo(-19, -330); g.lineTo(19, -330); g.lineTo(8, 20); g.fill(); g.restore(); } }
    const gr = g.createLinearGradient(-20, 0, 20, 0); gr.addColorStop(0, '#f6d49a'); gr.addColorStop(0.5, '#d9a45c'); gr.addColorStop(1, '#9a6a30'); g.fillStyle = gr; g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.moveTo(-8, 34); g.lineTo(-10, -120); g.quadraticCurveTo(-22, -250, -20, -330); g.quadraticCurveTo(0, -352, 20, -330); g.quadraticCurveTo(22, -250, 10, -120); g.lineTo(8, 34); g.closePath(); g.fill(); g.stroke(); g.fillStyle = K; g.beginPath(); g.ellipse(0, 36, 14, 8, 0, 0, 7); g.fill(); g.restore(); };
  drawArm(-f);
  // ---- torso
  const tw = 136, tx = cx - tw / 2, ty = shY - 6, th = hipY - shY + 26; const c = o.shirt || '#e23d3d';
  const gr = g.createLinearGradient(tx, 0, tx + tw, 0); gr.addColorStop(0, shade(c, f > 0 ? -0.28 : 0.18)); gr.addColorStop(0.45, c); gr.addColorStop(1, shade(c, f > 0 ? 0.2 : -0.28)); g.fillStyle = gr; g.strokeStyle = K; g.lineWidth = 13; g.beginPath(); g.roundRect(tx, ty, tw, th, 62); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(tx + 6, ty + 6, tw - 12, th - 12, 56); g.clip();
  if (o.stripes) { g.strokeStyle = shade(c, -0.3); g.lineWidth = 3; for (let x = tx + 14; x < tx + tw; x += 20) { g.beginPath(); g.moveTo(x, ty); g.lineTo(x, ty + th); g.stroke(); } }
  g.fillStyle = o.trim || '#ffffff'; if (!back) { g.fillRect(cx + f * 14 - 5, ty, 10, th - 40); g.fillStyle = K; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(cx + f * 14, ty + 60 + k * 44, 5, 0, 7); g.fill(); } }
  g.fillStyle = '#2a2230'; g.fillRect(tx, ty + th - 44, tw, 26); if (!back) { g.fillStyle = '#ffd24a'; g.strokeStyle = K; g.lineWidth = 4; g.beginPath(); g.roundRect(cx + f * 14 - 16, ty + th - 48, 32, 34, 6); g.fill(); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(cx + f * 40, ty + 70, 14, 60, 0, 0, 7); g.fill();
  if (o.coat && !back) { g.fillStyle = o.coat; g.fillRect(tx, ty, 34, th); g.fillRect(tx + tw - 34, ty, 34, th); g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.moveTo(tx + 34, ty); g.lineTo(tx + 34, ty + th); g.moveTo(tx + tw - 34, ty); g.lineTo(tx + tw - 34, ty + th); g.stroke(); g.fillStyle = '#ffd24a'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(tx + 20, ty + 70 + k * 50, 7, 0, 7); g.fill(); } }
  if (o.coat && back) { g.fillStyle = o.coat; g.fillRect(tx, ty, tw, th); }
  if (o.apron) { g.fillStyle = '#fbfbf6'; g.fillRect(tx, ty + th - 100, tw, 100); g.strokeStyle = K; g.lineWidth = 5; g.beginPath(); g.moveTo(tx, ty + th - 100); g.lineTo(tx + tw, ty + th - 100); g.stroke(); }
  if (o.sash) { g.strokeStyle = o.sash; g.lineWidth = 26; g.beginPath(); g.moveTo(tx - 10, ty + 40); g.lineTo(tx + tw + 10, ty + th - 70); g.stroke(); }
  if (o.num) { g.fillStyle = o.trim || '#fff'; g.strokeStyle = K; g.lineWidth = 5; g.font = `900 ${back ? 96 : 54}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; const nx = back ? cx : cx - f * 26, ny = back ? ty + 105 : ty + 78; g.strokeText(o.num, nx, ny); g.fillText(o.num, nx, ny); }
  g.restore();
  if (batAt && pose === 'bat') bat();
  if (o.bowtie && !back) { g.fillStyle = o.bowtie; g.strokeStyle = K; g.lineWidth = 6; const by = shY + 26; g.beginPath(); g.moveTo(cx + f * 14, by); g.lineTo(cx + f * 14 - 30, by - 18); g.lineTo(cx + f * 14 - 30, by + 18); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(cx + f * 14, by); g.lineTo(cx + f * 14 + 30, by - 18); g.lineTo(cx + f * 14 + 30, by + 18); g.closePath(); g.fill(); g.stroke(); }
  // ---- head
  const hx = cx + (st.tiltX || 0), hy = headY; const skin = o.skin || '#f7f2ea';
  const hg = g.createRadialGradient(hx + f * 40, hy - 50, 14, hx, hy, R * 1.08); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.55, skin); hg.addColorStop(1, shade(skin, -0.22)); g.fillStyle = hg; g.strokeStyle = K; g.lineWidth = 14; g.beginPath(); g.arc(hx, hy, R, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(hx + f * 58, hy - 70, 22, 12, f * 0.7, 0, 7); g.fill();
  if (o.beard && !back) { g.fillStyle = o.beard; g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.arc(hx, hy, R - 5, 0.08 * Math.PI, 0.92 * Math.PI); g.quadraticCurveTo(hx, hy + R + 46, hx + (R - 5) * Math.cos(0.08 * Math.PI), hy + (R - 5) * Math.sin(0.08 * Math.PI)); g.fill(); g.stroke(); }
  if (o.hair) { g.fillStyle = o.hair; g.strokeStyle = K; g.lineWidth = 10; g.beginPath(); g.arc(hx, hy - 4, R + 3, Math.PI * (back ? 0.9 : 1.08), Math.PI * (back ? 2.1 : 1.92)); if (o.hairStyle === 'bob') { g.lineTo(hx + R + 12, hy + 70); g.lineTo(hx + R - 26, hy - 20); g.lineTo(hx - R + 26, hy - 20); g.lineTo(hx - R - 12, hy + 70); } g.closePath(); g.fill(); g.stroke(); if (o.hairStyle === 'bun') { g.beginPath(); g.arc(hx - f * 30, hy - R - 22, 40, 0, 7); g.fill(); g.stroke(); } }
  let patchAt = null;
  if (!back) { const ex = hx + f * 22 + (st.look || 0) * 12, ey = hy + 4; const eyes = st.eyes || 'normal';
    for (const s of [-1, 1]) { const x = ex + s * 46, rx = 27, ry = eyes === 'wide' ? 36 : 31;
      if (o.patch && st.patch === s) { patchAt = [x, ey]; continue; }
      if (eyes === 'closed') { g.strokeStyle = K; g.lineWidth = 9; g.beginPath(); g.arc(x, ey - 4, 24, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); continue; }
      g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.ellipse(x, ey, rx, ry, 0, 0, 7); g.fill(); g.stroke();
      if (st.glow) { g.fillStyle = st.glowC || '#ffd24a'; g.beginPath(); g.ellipse(x, ey, rx - 8, ry - 8, 0, 0, 7); g.fill(); }
      g.fillStyle = K; g.beginPath(); g.arc(x + f * 6 + (st.look || 0) * 8, ey + (eyes === 'half' ? 8 : 2), eyes === 'wide' ? 8 : 11, 0, 7); g.fill();
      if (eyes === 'half' || eyes === 'angry') { const lid = st.lid ?? 0.5; g.save(); g.beginPath(); g.ellipse(x, ey, rx + 5, ry + 5, 0, 0, 7); g.clip(); g.fillStyle = shade(skin, -0.08); g.fillRect(x - 40, ey - ry - 8, 80, (ry * 2 + 8) * lid); g.restore(); g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); const ly = ey - ry + (ry * 2) * lid; g.moveTo(x - rx - 2, ly + (eyes === 'angry' ? -s * 8 : 0)); g.lineTo(x + rx + 2, ly + (eyes === 'angry' ? s * 8 : 0)); g.stroke(); }
      const bro = st.brow ?? (eyes === 'angry' ? 1 : eyes === 'wide' ? -1 : 0); g.strokeStyle = K; g.lineWidth = 11; g.beginPath(); g.moveTo(x - 26, ey - 48 - s * bro * 9 - (eyes === 'wide' ? 12 : 0)); g.lineTo(x + 26, ey - 48 + s * bro * 9 - (eyes === 'wide' ? 12 : 0)); g.stroke(); }
    const mx = ex, my = hy + 66, m = st.mouth || 'flat'; g.strokeStyle = K; g.lineWidth = 9;
    if (o.beak) { g.fillStyle = '#ff9a2a'; g.lineWidth = 8; g.beginPath(); g.moveTo(mx - 26, my - 26); g.lineTo(mx + f * 86, my - 6); g.lineTo(mx - 26, my + 22); g.closePath(); g.fill(); g.stroke(); }
    else if (m === 'talk') { const k = Math.abs(Math.sin(t * 11 + ph)); g.fillStyle = '#5a1a2a'; g.beginPath(); g.ellipse(mx, my - 2, 20, 5 + k * 17, 0, 0, 7); g.fill(); g.stroke(); }
    else if (m === 'frown') { g.beginPath(); g.arc(mx, my + 22, 28, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
    else if (m === 'grin') { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(mx - 36, my - 12); g.quadraticCurveTo(mx, my + 44, mx + 36, my - 12); g.closePath(); g.fill(); g.stroke(); }
    else if (m === 'smirk') { g.beginPath(); g.moveTo(mx - 26, my); g.quadraticCurveTo(mx + 6, my + 14, mx + 34, my - 10); g.stroke(); }
    else if (m === 'smile') { g.beginPath(); g.arc(mx, my - 12, 30, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    else if (m === 'grit') { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(mx - 30, my - 12, 60, 26, 8); g.fill(); g.stroke(); g.lineWidth = 4; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(mx + k * 15, my - 12); g.lineTo(mx + k * 15, my + 14); g.stroke(); } g.beginPath(); g.moveTo(mx - 30, my + 1); g.lineTo(mx + 30, my + 1); g.stroke(); }
    else if (m === 'o' || m === 'yawn') { const k = m === 'yawn' ? (st.yawn ?? 1) : 0.45; g.fillStyle = '#5a1a2a'; g.beginPath(); g.ellipse(mx, my - 4 + k * 6, 16 + k * 14, 8 + k * 30, 0, 0, 7); g.fill(); g.stroke(); if (k > 0.5) { g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(mx, my + 18 + k * 8, 14, 10, 0, 0, 7); g.fill(); } }
    else { g.beginPath(); g.moveTo(mx - 24, my); g.lineTo(mx + 24, my); g.stroke(); }
    if (st.gum) { const r = 10 + st.gum * 34; g.fillStyle = 'rgba(255,130,190,0.9)'; g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.arc(mx + f * 30, my + 4, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(mx + f * 30 + r * 0.35, my + 4 - r * 0.4, r * 0.25, r * 0.14, 0.6, 0, 7); g.fill(); }
    if (o.patch) { g.strokeStyle = K; g.lineWidth = 9; g.beginPath(); g.moveTo(hx - R + 6, hy - 62); g.lineTo(hx + R - 6, hy - 30); g.stroke(); const [px, py] = patchAt || [ex, hy - 66]; g.fillStyle = K; g.beginPath(); g.roundRect(px - 34, py - 30, 68, 62, 20); g.fill(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(px - 10, py - 12, 14, 7, -0.5, 0, 7); g.fill(); }
    if (o.mustache) { g.fillStyle = '#4a3020'; g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.moveTo(mx - 44, my - 14); g.quadraticCurveTo(mx, my - 44, mx + 44, my - 14); g.quadraticCurveTo(mx, my - 20, mx - 44, my - 14); g.fill(); g.stroke(); }
    if (st.sweat) for (let k = 0; k < 3; k++) { const d = (t * 1.2 + k / 3) % 1; const sx = hx - f * (70 + k * 22), sy = hy - 60 + d * 70; g.fillStyle = '#8ad8ff'; g.strokeStyle = K; g.lineWidth = 5; g.beginPath(); g.moveTo(sx, sy - 16); g.quadraticCurveTo(sx + 12, sy + 4, sx, sy + 10); g.quadraticCurveTo(sx - 12, sy + 4, sx, sy - 16); g.fill(); g.stroke(); }
    if (st.zzz) { g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 7; g.textAlign = 'center'; for (let k = 0; k < 3; k++) { const d = (t * 0.5 + k / 3) % 1; g.globalAlpha = Math.sin(d * Math.PI); g.font = `900 ${28 + d * 30}px Arial`; const zx = hx - f * (60 + d * 70), zy = hy - 120 - d * 100; g.strokeText('Z', zx, zy); g.fillText('Z', zx, zy); } g.globalAlpha = 1; }
  }
  // ---- headwear
  const hc = o.hatC || '#2a6ad8';
  if (o.hat === 'helmet' || o.hat === 'cap') { const hgc = g.createLinearGradient(hx - R, 0, hx + R, 0); hgc.addColorStop(0, shade(hc, f > 0 ? -0.3 : 0.25)); hgc.addColorStop(0.5, hc); hgc.addColorStop(1, shade(hc, f > 0 ? 0.3 : -0.3)); g.fillStyle = hgc; g.strokeStyle = K; g.lineWidth = 13;
    const a0 = Math.PI * (o.hat === 'helmet' ? 0.98 : 1.06), a1 = Math.PI * (o.hat === 'helmet' ? 2.02 : 1.94); g.beginPath(); g.arc(hx, hy - 6, R + 8, a0, a1); g.closePath(); g.fill(); g.stroke();
    if (!back) { g.beginPath(); g.ellipse(hx + f * (R * 0.78), hy - 30, 70, 17, f * 0.12, 0, 7); g.fill(); g.stroke(); }
    if (o.hat === 'helmet') { g.beginPath(); g.ellipse(hx - f * (R - 22), hy + 22, 34, 44, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = K; g.beginPath(); g.arc(hx - f * (R - 22), hy + 22, 8, 0, 7); g.fill(); }
    else { g.fillStyle = K; g.beginPath(); g.arc(hx, hy - R - 12, 9, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(hx + f * 44, hy - R + 26, 34, 12, f * 0.5, 0, 7); g.fill();
    if (o.logo && !back) { g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 5; g.font = '900 46px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText(o.logo, hx + f * 26, hy - R + 52); g.fillText(o.logo, hx + f * 26, hy - R + 52); } }
  if (o.hat === 'tricorn') { g.fillStyle = hc; g.strokeStyle = K; g.lineWidth = 13; g.beginPath(); g.moveTo(hx - R - 56, hy - 62); g.quadraticCurveTo(hx - 70, hy - R - 120, hx, hy - R - 66); g.quadraticCurveTo(hx + 70, hy - R - 120, hx + R + 56, hy - 62); g.quadraticCurveTo(hx, hy - 118, hx - R - 56, hy - 62); g.fill(); g.stroke(); g.strokeStyle = '#ffd24a'; g.lineWidth = 8; g.beginPath(); g.moveTo(hx - R - 40, hy - 66); g.quadraticCurveTo(hx, hy - 116, hx + R + 40, hy - 66); g.stroke(); if (o.skull && !back) { g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 5; g.beginPath(); g.arc(hx, hy - R - 34, 20, 0, 7); g.fill(); g.stroke(); g.fillStyle = K; g.beginPath(); g.arc(hx - 7, hy - R - 36, 4.5, 0, 7); g.arc(hx + 7, hy - R - 36, 4.5, 0, 7); g.fill(); } }
  if (o.hat === 'bandana') { g.fillStyle = hc; g.strokeStyle = K; g.lineWidth = 12; g.beginPath(); g.arc(hx, hy - 4, R + 5, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(hx - f * (R + 2), hy - 20); g.lineTo(hx - f * (R + 60), hy - 4); g.lineTo(hx - f * (R + 44), hy + 36); g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.8)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(hx - 70 + k * 36, hy - 70 - (k % 2) * 24, 6, 0, 7); g.fill(); } }
  if (o.hat === 'bowler') { g.fillStyle = hc; g.strokeStyle = K; g.lineWidth = 12; g.beginPath(); g.arc(hx, hy - R + 30, 96, Math.PI, Math.PI * 2); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.ellipse(hx, hy - R + 32, 150, 20, 0, 0, 7); g.fill(); g.stroke(); }
  if (o.hat === 'mask') { g.strokeStyle = K; g.lineWidth = 9; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(hx - 84, hy + k * 38); g.lineTo(hx + 84, hy + k * 38); g.stroke(); } for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(hx + k * 44, hy - 76); g.lineTo(hx + k * 44, hy + 76); g.stroke(); } }
  drawArm(f); if (batAt && pose === 'swing') bat();
  if (st.item) { const [ex, ey, wx, wy] = arms[f]; const it = st.item; g.save(); g.translate(wx, wy);
    if (it === 'sword') { g.rotate(Math.atan2(wy - ey, wx - ex) - Math.PI / 2 + f * 0.5); const bg = g.createLinearGradient(-10, 0, 14, 0); bg.addColorStop(0, '#f4f8ff'); bg.addColorStop(1, '#9aa8c0'); g.fillStyle = bg; g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.moveTo(-9, 0); g.lineTo(-7, 210); g.quadraticCurveTo(10, 262, 26 * 1, 276); g.quadraticCurveTo(20, 220, 12, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ffd24a'; g.beginPath(); g.roundRect(-30, -10, 60, 20, 8); g.fill(); g.stroke(); g.fillStyle = '#5a3a1a'; g.beginPath(); g.roundRect(-9, -46, 18, 40, 6); g.fill(); g.stroke(); }
    if (it === 'lantern') { g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.stroke(); const lg2 = g.createRadialGradient(0, 74, 4, 0, 74, 44); lg2.addColorStop(0, '#fff8c0'); lg2.addColorStop(1, '#ffa62a'); g.fillStyle = lg2; g.lineWidth = 8; g.beginPath(); g.roundRect(-30, 34, 60, 80, 12); g.fill(); g.stroke(); g.fillStyle = '#3a2a1a'; g.fillRect(-36, 28, 72, 12); g.fillRect(-36, 110, 72, 12); }
    if (it === 'tray') { g.fillStyle = '#dfe6f2'; g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.ellipse(0, -14, 120, 20, 0, 0, 7); g.fill(); g.stroke(); const n = st.plates ?? 3; for (let k = 0; k < n; k++) { const px = -70 + k * (140 / Math.max(1, n - 1 || 1)); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(px, -34, 36, 9, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = ['#e8453a', '#f2c23a', '#6ab04a', '#c88a4a'][k % 4]; g.beginPath(); g.arc(px, -40, 24, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); } }
    if (it === 'mug') { g.fillStyle = '#f2c23a'; g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.roundRect(-24, -56, 48, 60, 8); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, -58, 26, 12, 0, 0, 7); g.fill(); g.stroke(); }
    if (it === 'ball') { g.fillStyle = '#fbf7ee'; g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.arc(f * 10, 0, 24, 0, 7); g.fill(); g.stroke(); g.strokeStyle = '#d8342a'; g.lineWidth = 4; g.beginPath(); g.arc(f * 10 - 20, 0, 22, -0.7, 0.7); g.stroke(); g.beginPath(); g.arc(f * 10 + 20, 0, 22, Math.PI - 0.7, Math.PI + 0.7); g.stroke(); }
    if (it === 'pad') { g.fillStyle = '#fff'; g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.roundRect(-30, -50, 60, 76, 6); g.fill(); g.stroke(); g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-20, -34 + k * 14); g.lineTo(20, -34 + k * 14); g.stroke(); } }
    if (it === 'bill') { g.fillStyle = '#8ad88a'; g.strokeStyle = K; g.lineWidth = 6; g.beginPath(); g.roundRect(-40, -24, 80, 44, 6); g.fill(); g.stroke(); g.fillStyle = K; g.font = '900 30px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0); }
    g.restore(); }
  // warm rim light on the sun side
  g.globalCompositeOperation = 'source-atop'; const rim = g.createLinearGradient(cx - 150, 0, cx + 150, 0); rim.addColorStop(f > 0 ? 1 : 0, 'rgba(255,214,150,0.28)'); rim.addColorStop(0.5, 'rgba(255,214,150,0)'); rim.addColorStop(f > 0 ? 0 : 1, 'rgba(60,50,140,0.22)'); g.fillStyle = rim; g.fillRect(0, 0, 683, 1024); g.globalCompositeOperation = 'source-over';
}
