# usage: python3 vo_build.py <project_dir> <ids_csv> <json_texts> [gaps_json]
import sys, json, subprocess, numpy as np, wave, scipy.io.wavfile as wf, os
proj, ids, TX = sys.argv[1], sys.argv[2].split(','), json.loads(sys.argv[3])
GAPS = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
D=os.environ.get('VO_DIR', '.')
os.makedirs(f'{proj}/vo', exist_ok=True); os.makedirs(f'{proj}/assets', exist_ok=True)
t=0.3; lines=[]; full=[]
for i,(fid,txt) in enumerate(zip(ids,TX)):
    pass
    import shutil; shutil.copy(f'{D}/{fid}', f'{proj}/vo/l{i}.bin')
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'{proj}/vo/l{i}.bin','-ar','48000','-ac','1','-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',f'{proj}/vo/l{i}.wav'],check=True)
    w=wave.open(f'{proj}/vo/l{i}.wav'); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
    dur=len(x)/sr; hop=int(sr*0.01)
    env=np.array([np.sqrt(np.mean(x[k:k+hop]**2)) for k in range(0,len(x)-hop,hop)]); env=np.convolve(env,np.ones(3)/3,'same')
    act=np.where(env>0.02*env.max())[0]; s0=act[0]*0.01; s1=(act[-1]+1)*0.01
    words=txt.split(); wt=[max(2,len(''.join(c for c in wd if c.isalnum())))+(3 if wd[-1] in '.?!,:' else 0) for wd in words]
    wt=[w_*(2.2 if any(ch.isdigit() for ch in wd) else 1) for w_,wd in zip(wt,words)]
    cum=np.cumsum([0]+wt)/sum(wt); b=[s0]
    for k in range(1,len(words)):
        c=s0+cum[k]*(s1-s0); lo=int(max(0,(c-0.09)/0.01)); hi=int(min(len(env)-1,(c+0.09)/0.01)); b.append((lo+int(np.argmin(env[lo:hi+1])))*0.01)
    b.append(s1)
    lines.append({'t':round(t,3),'end':round(t+dur,3),'text':txt,'who':'narrator','words':[{'w':words[k],'t':round(t+b[k],3),'end':round(t+b[k+1],3)} for k in range(len(words))]})
    full.append((t,x)); t+=dur+GAPS.get(str(i),0.45)
DUR=t+1.8
out=np.zeros(int(DUR*48000))
for t0,x in full: i0=int(t0*48000); out[i0:i0+len(x)]+=x
wf.write(f'{proj}/assets/vo.wav',48000,(out*32767).astype(np.int16))
json.dump({'lines':lines,'duration':round(DUR,3)},open(f'{proj}/vo.json','w'),indent=1)
for l in lines: print(l['t'],l['end'],l['text'])
print('DUR',round(DUR,2))
