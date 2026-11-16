import { THREE, scene, add, toon, canvasTex, hash } from './kit.js';
// tee at origin, fairway runs toward -z, green at z = GZ
export const GZ = -150;
const grassT = canvasTex(512, 2048, (g, w, h) => { for (let i = 0; i < 32; i++) { g.fillStyle = i % 2 ? '#5ac84a' : '#4ab83e'; g.fillRect(0, i * 64, w, 64); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${30 + hash(i) * 40},${110 + hash(i + 1) * 70},30,0.25)`; g.fillRect(hash(i + 2) * w, hash(i + 3) * h, 2, 5); } });
const roughT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#3a9a36'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${20 + hash(i) * 40},${90 + hash(i + 1) * 60},20,0.4)`; g.fillRect(hash(i + 2) * w, hash(i + 3) * h, 2, 6); } }, [40, 40]);
{ const r = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon(0xffffff, roughT)); r.rotation.x = -Math.PI / 2; r.receiveShadow = true; scene.add(r);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(26, 200), toon(0xffffff, grassT)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.02, -80); f.receiveShadow = true; scene.add(f);
  const gr = new THREE.Mesh(new THREE.CircleGeometry(14, 40), toon(0x6ad85a)); gr.rotation.x = -Math.PI / 2; gr.position.set(0, 0.03, GZ); gr.receiveShadow = true; scene.add(gr);
  const tee = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), toon(0x6ad85a)); tee.rotation.x = -Math.PI / 2; tee.position.set(0, 0.03, 0); tee.receiveShadow = true; scene.add(tee); }
for (const [x, z, r] of [[9, -70, 4], [-10, -110, 5], [7, -138, 4]]) { const b = new THREE.Mesh(new THREE.CircleGeometry(r, 28), toon(0xf2dca0)); b.rotation.x = -Math.PI / 2; b.scale.set(1.4, 1, 1); b.position.set(x, 0.04, z); b.receiveShadow = true; scene.add(b); }
// pin
add(new THREE.CylinderGeometry(0.06, 0.06, 4, 8), 0xf4f4f0, 0, 2, GZ, 0.02); { const fl = add(new THREE.BoxGeometry(1.6, 1.0, 0.05), 0xe8302a, 0.8, 3.5, GZ, 0.02); }
// trees both sides
for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, z = 20 - i * 4.4 - hash(i) * 3, x = side * (17 + hash(i + 3) * 14);
  if (hash(i + 7) > 0.45) { add(new THREE.CylinderGeometry(0.4, 0.55, 3, 8), 0x7a4a24, x, 1.5, z, 0.05); add(new THREE.ConeGeometry(3, 8, 10), 0x2a7a3a, x, 7, z, 0.06); }
  else { add(new THREE.CylinderGeometry(0.45, 0.6, 3.4, 8), 0x7a4a24, x, 1.7, z, 0.05); add(new THREE.SphereGeometry(3.2, 14, 10), 0x3a9a3a, x, 5.6, z, 0.06); } }
// low dunes/hills far away
for (let i = 0; i < 9; i++) add(new THREE.SphereGeometry(40 + hash(i) * 30, 20, 12), 0x5aa84a, -200 + i * 50, -20, -320 - hash(i + 1) * 60, 0.08);
