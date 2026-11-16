import { THREE, scene, add, toon, canvasTex, hash } from './kit.js';
export const MZ = -20;
// ---------- field

const fieldT = canvasTex(1024, 1024, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#58c44a' : '#46b03e'; g.fillRect(0, i * 64, w, 64); }
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${30 + hash(i) * 40},${110 + hash(i + 1) * 70},30,0.25)`; g.fillRect(hash(i + 2) * w, hash(i + 3) * h, 2, 5); }
  const P = (x, z) => [512 + x * 8, 760 + z * 8]; g.fillStyle = '#d99a5a'; g.beginPath(); g.arc(...P(0, 0), 64, 0, 7); g.fill(); g.beginPath(); g.arc(...P(0, MZ), 30, 0, 7); g.fill();
  g.strokeStyle = '#d99a5a'; g.lineWidth = 26; g.beginPath(); g.moveTo(...P(0, 0)); g.lineTo(...P(30, -30)); g.lineTo(...P(0, -60)); g.lineTo(...P(-30, -30)); g.closePath(); g.stroke();
  for (let i = 0; i < 2500; i++) { const a = hash(i) * 7, r = hash(i + 5) * 62; g.fillStyle = `rgba(150,95,45,${0.2 + hash(i + 7) * 0.25})`; g.fillRect(P(0, 0)[0] + Math.cos(a) * r, P(0, 0)[1] + Math.sin(a) * r, 3, 3); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); g.moveTo(...P(0, 0)); g.lineTo(...P(64, -64)); g.moveTo(...P(0, 0)); g.lineTo(...P(-64, -64)); g.stroke();
  g.fillStyle = '#fff'; for (const [x, z] of [[30, -30], [0, -60], [-30, -30]]) { g.save(); g.translate(...P(x, z)); g.rotate(Math.PI / 4); g.fillRect(-9, -9, 18, 18); g.restore(); } g.strokeRect(P(-2.6, 0)[0] - 14, P(0, 0)[1] - 24, 28, 48); g.strokeRect(P(2.6, 0)[0] - 14, P(0, 0)[1] - 24, 28, 48); });
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(128, 128), toon(0xffffff, fieldT)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.01, -31); f.receiveShadow = true; scene.add(f);
  const g2 = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon(0x4ab842)); g2.rotation.x = -Math.PI / 2; g2.receiveShadow = true; scene.add(g2); }
add(new THREE.CylinderGeometry(3.4, 4.2, 0.36, 28), 0xd99a5a, 0, 0.18, MZ, 0); add(new THREE.BoxGeometry(1.2, 0.06, 0.3), 0xffffff, 0, 0.4, MZ, 0.02);
{ const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0.5, 0.5); s.lineTo(0, 1); s.lineTo(-0.5, 0.5); const hp = add(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }), 0xffffff, 0, 0.06, -0.5, 0.02); hp.rotation.x = Math.PI / 2; }
// stands with crowd
const crowdT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#2a3a6a'; g.fillRect(0, 0, w, h); const C = ['#e8453a', '#f2c23a', '#3a7ae8', '#ffffff', '#3aa84a', '#a86ad8', '#e88a3a', '#f2c8d8']; for (let r = 0; r < 8; r++) for (let i = 0; i < 40; i++) { const x = i * 13 + (r % 2) * 6, y = r * 32 + 6; g.fillStyle = C[Math.floor(hash(i * 9 + r * 31) * 8)]; g.beginPath(); g.roundRect(x, y + 12, 11, 16, 3); g.fill(); g.fillStyle = '#f7f2ea'; g.beginPath(); g.arc(x + 5.5, y + 8, 5, 0, 7); g.fill(); } }, [4, 1]);
function stand(x, z, ry, w, tiers = 5) { const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G); add(new THREE.BoxGeometry(w, 3.2, 1), 0x1f6a3a, 0, 1.6, 0, 0.05, G); add(new THREE.BoxGeometry(w, 0.3, 1.1), 0xffd23a, 0, 3.3, 0, 0.02, G);
  for (let k = 0; k < tiers; k++) add(new THREE.BoxGeometry(w, 3.4, 5), 0xffffff, 0, 4.4 + k * 3.2, -3 - k * 4.6, 0.05, G, crowdT); add(new THREE.BoxGeometry(w, 1.2, 6), 0xd8463a, 0, 4.4 + tiers * 3.2, -3 - tiers * 4.6 + 2, 0.05, G); }
for (let i = -3; i <= 3; i++) { const a = i * 0.36; stand(Math.sin(a) * 86, -Math.cos(a) * 86 + 6, -a, 33); }
for (let i = -1; i <= 1; i++) { const a = Math.PI + i * 0.6; stand(Math.sin(a) * 20, -Math.cos(a) * 20 - 4, -a, 24, 4); }
for (const sx of [-1, 1]) { stand(sx * 34, -8, -sx * Math.PI / 2 * 1.25, 40, 4); }
// light towers + scoreboard
for (const [x, z] of [[-58, -66], [58, -66], [-40, 22], [40, 22]]) { add(new THREE.CylinderGeometry(0.5, 0.7, 34, 8), 0x8a94a8, x, 17, z, 0.06); const p = add(new THREE.BoxGeometry(9, 5, 0.8), 0x3a4458, x, 36, z, 0.06); p.lookAt(0, 10, -20); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.8, 12), new THREE.MeshBasicMaterial({ color: 0xfffbe0, fog: false })); l.position.set(-3.3 + c * 2.2, -1.1 + r * 2.2, 0.45); p.add(l); } }
const sbT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#12203a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffd23a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#ffd23a'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.fillText('HOME   0', w / 2, 90); g.fillStyle = '#ff6a5a'; g.fillText('AWAY   0', w / 2, 160); g.fillStyle = '#fff'; g.font = 'bold 34px Arial'; g.fillText('INNING 9', w / 2, 220); });
add(new THREE.BoxGeometry(20, 10, 1), 0xffffff, -20, 26, -96, 0.08, scene, sbT);
