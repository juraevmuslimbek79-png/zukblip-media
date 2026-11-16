import { THREE, scene, add, toon, canvasTex, hash } from './kit.js';
// indoor arena: hoop at z = HZ, free-throw line at z = FTZ
export const HZ = -14, FTZ = -9.8, RIM = 3.05;
const floorT = canvasTex(1024, 2048, (g, w, h) => {
  for (let i = 0; i < 64; i++) { g.fillStyle = `hsl(${30 + hash(i) * 6},${55 + hash(i + 1) * 10}%,${58 + hash(i + 2) * 8}%)`; g.fillRect(i * 16, 0, 16, h); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,70,30,${hash(i) * 0.12})`; g.fillRect(hash(i + 3) * w, hash(i + 4) * h, 2, 30 + hash(i + 5) * 60); }
  const P = (x, z) => [512 + x * 34, 1024 + (z + 1.6) * 34]; // 1 m = 34 px ; court from z=-15.6 to 12.4
  g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.strokeRect(...P(-7.5, -15.6), 15 * 34, 28 * 34);
  g.beginPath(); g.moveTo(...P(-7.5, -1.6)); g.lineTo(...P(7.5, -1.6)); g.stroke(); g.beginPath(); g.arc(...P(0, -1.6), 1.8 * 34, 0, 7); g.stroke();
  const key = (bz, d) => { g.fillStyle = 'rgba(200,40,40,0.85)'; const [x0, y0] = P(-2.45, bz), [x1, y1] = P(2.45, bz + d * 5.8); g.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)); g.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)); g.beginPath(); g.arc(...P(0, bz + d * 5.8), 1.8 * 34, 0, 7); g.stroke();
    g.beginPath(); g.arc(...P(0, bz + d * 1.6), 6.75 * 34, d > 0 ? 0.2 : Math.PI + 0.2, d > 0 ? Math.PI - 0.2 : 2 * Math.PI - 0.2); g.stroke(); };
  key(-15.6, 1); key(12.4, -1);
  g.fillStyle = 'rgba(30,60,160,0.7)'; g.beginPath(); g.arc(...P(0, -1.6), 1.75 * 34, 0, 7); g.fill(); });
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), toon(0xffffff, floorT)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.01, -1.6); f.receiveShadow = true; scene.add(f);
  const g2 = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon(0x2a2a3a)); g2.rotation.x = -Math.PI / 2; g2.receiveShadow = true; scene.add(g2); }
// hoop
export const hoop = new THREE.Group(); scene.add(hoop);
{ const bbT = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#f8f8f8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d83a2a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.strokeRect(88, 70, 80, 60); });
  add(new THREE.BoxGeometry(1.83, 1.07, 0.06), 0xffffff, 0, RIM + 0.45, HZ - 0.4, 0.03, hoop, bbT);
  add(new THREE.CylinderGeometry(0.12, 0.12, RIM + 1.0, 10), 0x3a4458, 0, (RIM + 1.0) / 2, HZ - 1.6, 0.03, hoop); add(new THREE.BoxGeometry(0.15, 0.15, 1.2), 0x3a4458, 0, RIM + 0.9, HZ - 1.0, 0.03, hoop);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.022, 8, 28), toon(0xff6a1a)); rim.rotation.x = Math.PI / 2; rim.position.set(0, RIM, HZ); hoop.add(rim); rim.layers.enable(1);
  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.15, 0.42, 14, 3, true), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, fog: false })); net.position.set(0, RIM - 0.21, HZ); hoop.add(net); }
// arena bowl with crowd
const crowdT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#1a2040'; g.fillRect(0, 0, w, h); const C = ['#e8453a', '#f2c23a', '#3a7ae8', '#ffffff', '#3aa84a', '#a86ad8', '#e88a3a', '#f2c8d8']; for (let r = 0; r < 8; r++) for (let i = 0; i < 40; i++) { const x = i * 13 + (r % 2) * 6, y = r * 32 + 6; g.fillStyle = C[Math.floor(hash(i * 9 + r * 31) * 8)]; g.beginPath(); g.roundRect(x, y + 12, 11, 16, 3); g.fill(); g.fillStyle = '#f7f2ea'; g.beginPath(); g.arc(x + 5.5, y + 8, 5, 0, 7); g.fill(); } }, [4, 1]);
function stand(x, z, ry, w, tiers = 5) { const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G); add(new THREE.BoxGeometry(w, 1.2, 0.6), 0x1a3a8a, 0, 0.6, 0, 0.04, G); add(new THREE.BoxGeometry(w, 0.15, 0.7), 0xffd23a, 0, 1.25, 0, 0.02, G);
  for (let k = 0; k < tiers; k++) add(new THREE.BoxGeometry(w, 3.0, 3.4), 0xffffff, 0, 1.8 + k * 2.4, -2 - k * 3.2, 0.04, G, crowdT); }
stand(0, -19, 0, 30); stand(0, 15, Math.PI, 30); stand(-10.5, -2, Math.PI / 2, 40); stand(10.5, -2, -Math.PI / 2, 40);
// dark roof + lights
const roof = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x0a0c1a, side: THREE.DoubleSide, fog: false })); roof.rotation.x = Math.PI / 2; roof.position.y = 24; scene.add(roof);
for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.CircleGeometry(1.0, 16), new THREE.MeshBasicMaterial({ color: 0xfffbe0, fog: false })); l.rotation.x = Math.PI / 2; l.position.set(sx * 5, 23.5, -18 + i * 7); scene.add(l); }
// scoreboard (centre-hung)
const sbT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#0a1020'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffd23a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#ffd23a'; g.font = 'bold 50px Arial'; g.textAlign = 'center'; g.fillText('HOME  169', w / 2, 100); g.fillStyle = '#ff6a5a'; g.fillText('AWAY  147', w / 2, 170); g.fillStyle = '#fff'; g.font = 'bold 30px Arial'; g.fillText('FINAL', w / 2, 225); });
add(new THREE.BoxGeometry(6, 3, 6), 0xffffff, 0, 14, -2, 0.05, scene, sbT);
