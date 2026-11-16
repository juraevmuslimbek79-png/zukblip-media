#!/bin/bash
# usage: render2.sh <name> <end>   (uses ev_<name>.json, <name>.html -> ../<name>/out/raw.mp4)
cd "$(dirname "$(readlink -f "$0")")"
n=$1; end=$2; mid=$(python3 -c "print(round($end/2,3))"); mkdir -p r_$n v/$n/out
# each run needs its own ev.json: run from a per-video dir with symlinks
for f in kit.js chars3.js set_*.js three toonrender.js cams_none.json $n.html; do ln -sf ../$f r_$n/$f; done; cp ev_$n.json r_$n/ev.json; mkdir -p r_$n/st
cd r_$n
node toonrender.js $n.html cams_none.json video 0 $mid ../v/$n/out/a.mp4 > a.log 2>&1 &
node toonrender.js $n.html cams_none.json video $mid $end ../v/$n/out/b.mp4 > b.log 2>&1 &
wait
cd ../v/$n/out && printf "file a.mp4\nfile b.mp4\n" > l.txt && ffmpeg -v error -y -f concat -i l.txt -c copy raw.mp4 && echo RENDERED $n
