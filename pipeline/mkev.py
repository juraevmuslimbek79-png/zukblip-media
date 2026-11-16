# usage: mkev.py <proj> <out.json> '{"key":[line,"prefix"],...}'
import json, sys
v = json.load(open(sys.argv[1] + '/vo.json')); L = v['lines']; spec = json.loads(sys.argv[3])
def w(i, p):
    for x in L[i]['words']:
        if x['w'].lower().strip('.,?!:\'"').startswith(p): return x['t']
    raise Exception(f'{i} {p}')
ev = {f's{i}': l['t'] for i, l in enumerate(L)}; ev.update({f'e{i}': l['end'] for i, l in enumerate(L)}); ev['end'] = round(L[-1]['end'] + 0.9, 3)
for k, (i, p) in spec.items(): ev[k] = w(i, p)
json.dump(ev, open(sys.argv[2], 'w')); print(ev)
