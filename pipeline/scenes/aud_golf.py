import json; from sfxlib import *
E = json.load(open('ev_golf.json')); M = Mix(E['end'])
M.bed(300, 3000, 0.07); M.pulse(0.5, 0.22)
for c in [E['s1'], E['hit']-0.6, E['s2'], E['farther']-0.5, E['s3'], E['s4'], E['s5'], E['s6'], E['smooth2']-0.4, E['s7']]: M.add(c - 0.18, whoosh(), 0.26)
t = 0.5
while t < E['s1']: M.add(t + 0.35, clang(), 0.3); M.add(t + 0.35, thud(), 0.4); t += 0.7
M.add(E['purpose'] - 0.15, ding(1046), 0.2); M.add(E['s1'], ding(784), 0.2); M.add(E['smooth'] - 0.2, sparkle(), 0.3)
M.add(E['hit'] - 0.15, whoosh(0.35, 500, 6000), 0.4); M.add(E['hit'], crack(), 0.35); M.add(E['hit'] + 0.05, whoosh(1.5, 800, 5000), 0.2)
M.add(E['ducks'] - 0.1, sweep(700, 200, 0.5, 2), 0.3); M.add(E['ducks'] + 0.5, thud(), 0.3)
M.add(E['nicks'] - 0.15, pop(), 0.25); M.add(E['farther'] - 0.5, whoosh(2.0, 600, 5000), 0.25); M.add(E['farther'] - 0.2, sparkle(), 0.3)
for i in range(3):
    t = E['s3'] - 0.23 * i
    while t < E['s4']:
        if t > E['s3']: M.add(t + 0.3, clang(), 0.18, -0.5 + i * 0.5)
        t += 0.6
M.add(E['breaks'] - 0.2, sweep(400, 900, 0.3, 3), 0.2); M.add(E['wake'] - 0.1, whoosh(1.2, 200, 1500), 0.3)
M.add(E['s5'], ding(1046), 0.25); M.add(E['hugs'] - 0.2, swish(), 0.3); M.add(E['half'] - 0.2, sparkle(), 0.35); M.add(E['half'] - 0.2, ding(1568), 0.3)
M.add(E['s6'], ding(784), 0.2); M.add(E['three'] - 0.2, sparkle(), 0.3)
M.add(E['smooth2'] - 0.4, crack(), 0.3); M.add(E['smooth2'] - 0.35, whoosh(1.8, 600, 5000), 0.25); M.add(E['halfas'] - 0.2, thud(), 0.4)
M.bed(250, 2600, 0.12, [(E['s7'], E['end'], 1)]); M.add(E['beat'] - 0.3, sparkle(), 0.3); M.add(E['follow'] - 0.15, ding(1568), 0.3); M.add(E['follow'] - 0.1, pop(), 0.35)
M.finish('golf')
