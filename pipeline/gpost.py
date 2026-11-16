# usage: gpost.py <name>
import json, math, subprocess, sys, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
name = sys.argv[1]; W, H, FPS = 1080, 1920, 30
VO = json.load(open(f'v/{name}/vo.json')); L = VO['lines']
chunks = []
for l in L:
    ws = l['words']
    for i, w in enumerate(ws):
        end = ws[i + 1]['t'] if i + 1 < len(ws) else l['end'] + 0.12
        chunks.append((w['t'], end, w['w'].replace('...', '').strip()))
FC = ImageFont.truetype(''+__import__('os').path.dirname(__import__('os').path.abspath(__file__))+'/Poppins-Bold.ttf', 62); cache = {}
def cap(txt):
    if txt not in cache:
        im = Image.new('RGBA', (W, 170), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.text((W // 2, 88), txt, font=FC, fill=(255, 255, 255, 255), anchor='mm', stroke_width=8, stroke_fill=(18, 14, 22, 255)); cache[txt] = np.array(im)
    return cache[txt]
def blend(fr, rgba, y, sc=1.0):
    if sc != 1.0: rgba = cv2.resize(rgba, None, fx=sc, fy=sc)
    h, w = rgba.shape[:2]; x0 = (W - w) // 2; y0 = int(y - h / 2); xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    sub = rgba[ya - y0:yb - y0, xa - x0:xb - x0]; al = sub[..., 3:4].astype(np.float32) / 255
    fr[ya:yb, xa:xb] = (fr[ya:yb, xa:xb] * (1 - al) + sub[..., 2::-1].astype(np.float32) * al).astype(np.uint8)
yy, xx = np.ogrid[:H, :W]; VIG = np.clip(1 - 0.55 * np.clip(np.sqrt(((xx - W / 2) / (W * 0.8)) ** 2 + ((yy - H / 2) / (H * 0.75)) ** 2) - 0.45, 0, 1), 0.62, 1)[..., None].astype(np.float32)
def look(fr):
    hsv = cv2.cvtColor(fr, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * 1.2, 0, 255); f = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    f = (f - 128) * 1.08 + 128 + 3
    sm = cv2.resize(f, (W // 4, H // 4)); br = np.clip(sm - 185, 0, 255) * 1.5; f += cv2.resize(cv2.GaussianBlur(br, (0, 0), 14), (W, H)) * 0.55
    return f * VIG
cin = cv2.VideoCapture(f'v/{name}/out/raw.mp4')
p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', f'v/{name}/out/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', f'v/{name}/out/{name}.mp4'], stdin=subprocess.PIPE)
n = 0
while True:
    ok, fr = cin.read()
    if not ok: break
    t = n / FPS; n += 1
    fr = cv2.resize(fr, (W, H), interpolation=cv2.INTER_LANCZOS4); fr = np.clip(look(fr), 0, 255).astype(np.uint8)
    for c0, c1, txt in chunks:
        if c0 <= t < c1: blend(fr, cap(txt), 1350, 1 + 0.14 * math.exp(-(t - c0) * 16)); break
    p.stdin.write(fr.tobytes())
p.stdin.close(); p.wait(); print('post done', n)
