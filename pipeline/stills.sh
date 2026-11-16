#!/bin/bash
# usage: stills.sh <name> <t1,t2,...>
cd "$(dirname "$(readlink -f "$0")")"; n=$1; mkdir -p r_$n/st; for f in kit.js chars3.js set_*.js three toonrender.js cams_none.json $n.html; do ln -sf ../$f r_$n/$f; done; cp ev_$n.json r_$n/ev.json; cd r_$n; rm -f st/*.jpg
timeout 540 node toonrender.js $n.html cams_none.json stills $2 x 2>&1 | tail -4
python3 -c "
from PIL import Image
ts='$2'.split(',');n=len(ts);c=(n+1)//2;W,H=180,320;s=Image.new('RGB',(W*c,H*2))
for i,t in enumerate(ts):
    try: s.paste(Image.open(f'st/{t}.jpg').resize((W,H)),((i%c)*W,(i//c)*H))
    except Exception as e: print(t,e)
s.save('../sheet_$n.jpg')"
