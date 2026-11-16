#!/bin/bash
# usage: push.sh <name>
set -e
S=$(dirname "$(readlink -f "$0")")/v; REPO=${REPO:-/home/claude/zukblip-media}
cd $REPO
cp $S/$1/out/$1.mp4 videos/
git add videos/$1.mp4
git commit -qm "Add $1 cinematic short

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01U8wm5RevEdhAt1Broo926a"
git push -q 2>&1 | tail -1
SHA=$(git rev-parse HEAD); URL="https://raw.githubusercontent.com/juraevmuslimbek79-png/zukblip-media/$SHA/videos/$1.mp4"
for i in $(seq 1 30); do c=$(curl -sI -o /dev/null -w '%{http_code}' $URL); [ "$c" = 200 ] && break; sleep 3; done
echo $c $URL
