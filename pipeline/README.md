# ZukBlip stickman 2.5D Shorts pipeline

Vertical 9:16 YouTube Shorts: three.js toon world + canvas billboard stickman characters (chars3.js) + 2D fx overlay,
rendered headless (Playwright Chromium, swiftshader) at 720x1280, upscaled to 1080x1920 with one-word captions.

## Setup (fresh session)
    git clone https://github.com/juraevmuslimbek79-png/zukblip-media && cd zukblip-media/pipeline
    npm i playwright && npx playwright install chromium   # if not present
    pip install numpy scipy pillow --break-system-packages ; ffmpeg must exist

## Make one video (name = curve as example)
1. Script: ~8 English lines, ~45-50 s. Formula: paradox hook -> "Imagine you're..." -> mystery -> science payoff -> strong "Follow" CTA.
2. VO: Speko audio_synthesize, voice "Puck", provider google, one call per line. Then
   `VO_DIR=<dir with the wav blobs> python3 vo_build2.py v/curve "<blob1,blob2,...>" '<json list of the 8 lines>'`
3. Events: `python3 mkev.py v/curve ev_curve.json '{"key":[line_idx,"wordprefix"],...}'` -> s0..s7, e0..e7, end + named word times.
4. Scene: copy a file from scenes/ (curve.html = baseball, wilt.html = basketball, golf.html = golf, flop.html = high jump,
   lemon.html = ship, gorilla.html = cafe). Pattern: `window.renderAt = t => { hideAll(); put(...); CAM = cm(...); fx.push(()=>text2d(...)); return render(t, CAM, fx); }`
   Sets: set_stadium.js, set_court.js, set_golf.js, set_ship.js, set_cafe.js.
5. Check stills: `./stills.sh curve 1,5,10,...` -> sheet_curve.jpg (fix framing before full render).
6. Audio: scenes/aud_curve.py (sfxlib Mix: whoosh/thud/ding/sparkle/clang/pop...) -> v/curve/out/mix.wav
7. Render: `./render2.sh curve <end>` (2 parallel chunks, ~20 min for 50 s) then `python3 gpost.py curve` -> v/curve/out/curve.mp4
8. Publish: push.sh copies to repo videos/ and prints a raw GitHub URL; Metricool createScheduledPost (blogId 7681146, YouTube short,
   madeForKids false, category EDUCATION, question in firstCommentText). Metricool free plan = 20 posts/month; when it is used up,
   send the user a 720p phone copy (ffmpeg scale=720:1280 crf 24 faststart) + title/description to upload by hand.

## Characters (chars3.js)
bill({shirt, trim, num, hair, hairStyle, hat: cap|helmet|bowler|top|tricorn|bandana|mask, hatC, coat, beard, mustache, skin, shoes, glove})
poses: stand walk run sit crouch bat swing set windup yawn point tray think shrug grope hold cheer sword hips cover write
state: f (facing 1/-1), back, eyes (normal/half/wide/closed/angry), lid, mouth (smile/smirk/grin/o/yawn/talk/frown/grit/flat),
armF/armB [upper, lower] angles (0 = down, PI = up), dy, rz, sweat, look, item (ball/mug/tray/pad/lantern/sword/bill)
