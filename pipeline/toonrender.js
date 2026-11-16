const { chromium } = require('playwright'); const fs = require('fs'); const { spawn } = require('child_process');
// usage: node toonrender.js page.html cams.json mode a z out
const [page, camsF, mode, a, z, out] = process.argv.slice(2);
const CAMS = JSON.parse(fs.readFileSync(camsF)); const EV = fs.existsSync('ev.json') ? fs.readFileSync('ev.json', 'utf8') : '{}';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('pageerror', e => console.log('E', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('C', m.text()); });
  await p.addInitScript(`window.CAMS=${JSON.stringify(CAMS)};window.EV=${EV};`);
  await p.goto('file://' + __dirname + '/' + page); await p.waitForFunction('window.ready', null, { timeout: 60000 });
  await p.evaluate('renderAt(0)'); await new Promise(r => setTimeout(r, 800));
  if (mode === 'stills') { for (const t of a.split(',').map(Number)) { const d = await p.evaluate(`renderAt(${t})`); fs.writeFileSync(`st/${t}.jpg`, Buffer.from(d.split(',')[1], 'base64')); } await b.close(); return; }
  const FPS = 30; const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', out]);
  const t0 = Date.now();
  for (let f = Math.round(+a * FPS); f < Math.round(+z * FPS); f++) { const d = await p.evaluate(`renderAt(${f / FPS})`); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 60 === 0) console.log(f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out);
})();
