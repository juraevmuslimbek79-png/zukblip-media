import json, numpy as np, scipy.io.wavfile as wf, scipy.signal as sg
SR = 48000; rng = np.random.default_rng(4)
def nz(d): return rng.uniform(-1, 1, int(d * SR))
def bp(x, lo, hi): b, a = sg.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f): b, a = sg.butter(2, f / (SR / 2)); return sg.lfilter(b, a, x)
def env(d, k): return np.exp(-np.linspace(0, 1, int(d * SR)) * k)
def tone(f, d, k=6): n = int(d * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(d, k)
def sweep(f0, f1, d, k=3): n = int(d * SR); f = np.linspace(f0, f1, n); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, k)
def whoosh(d=0.4, lo=300, hi=5000): x = nz(d); return bp(x, lo, hi) * np.sin(np.linspace(0, np.pi, len(x))) ** 2
def crack(): d = 0.35; return nz(d) * env(d, 28) * 1.2 + tone(950, d, 16) * 0.9 + tone(180, d, 10)
def thud(): return lp(nz(0.3), 220) * env(0.3, 9) * 2.4 + tone(70, 0.3, 8)
def ding(f=1320): return tone(f, 0.5, 7) + tone(f * 1.5, 0.5, 9) * 0.4 + tone(f * 2, 0.5, 12) * 0.2
def sparkle():
    out = np.zeros(int(0.6 * SR))
    for k in range(5):
        x = tone(1800 + k * 420, 0.25, 10); i = int(k * 0.05 * SR); out[i:i + len(x)] += x
    return out * 0.5
def boing(): return sweep(260, 620, 0.28, 4)
def pop(): return sweep(900, 300, 0.09, 5)
def riser(d=0.8): n = int(d * SR); return bp(nz(d), 500, 6000) * np.linspace(0, 1, n) ** 2 + sweep(200, 900, d, 0) * np.linspace(0, 1, n) ** 2 * 0.4
def swish(): return whoosh(0.18, 800, 6000)
def clang(): return sum(tone(f, 0.6, 7) for f in (820, 1370, 2210, 3100)) * 0.35 + nz(0.6) * env(0.6, 40) * 0.5
def splash(): return bp(nz(0.9), 400, 5000) * env(0.9, 5)
class Mix:
    def __init__(s, dur): s.N = int(dur * SR); s.b = np.zeros((s.N, 2)); s.dur = dur
    def add(s, t, x, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= s.N or i < 0: return
        x = x[:s.N - i]; s.b[i:i + len(x)] += np.stack([x * (1 - pan) ** 0.5, x * (1 + pan) ** 0.5], 1) * g / 1.2
    def bed(s, lo, hi, g, segs=None):  # ambience noise bed, segs = [(t0,t1,level)]
        x = bp(nz(s.dur), lo, hi); e = np.zeros(s.N) if segs else np.ones(s.N)
        for a, b_, l in (segs or []): e[int(a * SR):int(b_ * SR)] = l
        e = np.convolve(e, np.ones(SR // 3) / (SR // 3), 'same'); tt = np.arange(s.N) / SR; s.add(0, x[:s.N] * e * (0.8 + 0.2 * np.sin(tt * 4.7)), g)
    def pulse(s, step=0.5, g=0.26, t0=0, t1=None, f=58):
        t1 = t1 or s.dur; k = 0
        while t0 + k * step < t1: tk = np.arange(int(0.22 * SR)) / SR; s.add(t0 + k * step, np.sin(2 * np.pi * (f + 30 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 16), g if k % 2 == 0 else g * 0.5); k += 1
    def finish(s, name):
        vo = wf.read(f'v/{name}/assets/vo.wav')[1].astype(float) / 32768
        if vo.ndim > 1: vo = vo.mean(1)
        vo = np.pad(vo, (0, max(0, s.N - len(vo))))[:s.N]; mix = s.b + np.stack([vo, vo], 1) * 1.15; mix *= 0.9 / np.max(np.abs(mix)); wf.write(f'v/{name}/out/mix.wav', SR, (mix * 32767).astype(np.int16)); print('audio ok', name)
