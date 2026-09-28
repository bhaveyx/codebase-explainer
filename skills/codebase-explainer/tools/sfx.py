# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""Synthesize UI sound effects and a lo-fi music loop (no licensing to worry about).

Usage: uv run tools/sfx.py <out_dir>
"""
import numpy as np, soundfile as sf, os, sys
SR = 44100
out = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)
def t(sec): return np.arange(int(SR*sec))/SR
def env(n, a=0.005, r=0.2):
    e = np.ones(n); na = int(SR*a); e[:na] = np.linspace(0,1,na)
    return e * np.exp(-np.arange(n)/(SR*r))
def lp(x, k):  # one-pole lowpass, k in (0,1)
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += k*(v-acc); y[i] = acc
    return y
def save(name, x, g=0.8):
    x = x/ (np.max(np.abs(x)) or 1) * g
    sf.write(f"{out}/{name}.wav", np.stack([x,x],1).astype(np.float32), SR)

# whoosh: filtered noise with swept lowpass
n = rng.standard_normal(int(SR*0.6)); k = np.linspace(0.02, 0.35, len(n))**1.5
y = np.zeros_like(n); acc=0
for i,v in enumerate(n): acc += k[i]*(v-acc); y[i]=acc
save("whoosh", y*np.sin(np.linspace(0,np.pi,len(y)))**2, 0.5)
# pop
tt=t(0.12); save("pop", np.sin(2*np.pi*(900-5000*tt)*tt)*env(len(tt),0.001,0.03), 0.6)
# click
tt=t(0.04); save("click", rng.standard_normal(len(tt))*env(len(tt),0.0005,0.004), 0.4)
# impact: sub drop + noise
tt=t(1.2); f=np.linspace(90,35,len(tt)); ph=2*np.pi*np.cumsum(f)/SR
save("impact", np.sin(ph)*env(len(tt),0.002,0.35) + 0.3*lp(rng.standard_normal(len(tt)),0.1)*env(len(tt),0.001,0.08), 0.9)
# ding
tt=t(1.0); save("ding", sum(np.sin(2*np.pi*f0*tt)*a for f0,a in [(1318.5,1),(2637,0.3),(3951,0.1)])*env(len(tt),0.002,0.25), 0.45)
# riser
tt=t(2.0); f=200*2**(tt*1.6); ph=2*np.pi*np.cumsum(f)/SR
save("riser", (np.sin(ph)*0.4+lp(rng.standard_normal(len(tt)), 0.2)*0.6)*(tt/2)**2, 0.5)
# error buzz
tt=t(0.35); save("buzz", np.sign(np.sin(2*np.pi*110*tt))*env(len(tt),0.002,0.2), 0.3)
# typing ticks
tt=t(1.5); x=np.zeros(len(tt))
for s in np.cumsum(rng.uniform(0.05,0.12,20)):
    i=int(s*SR)
    if i+400<len(x): x[i:i+400]+=rng.standard_normal(400)*np.exp(-np.arange(400)/60)
save("typing", x, 0.3)

# --- music: 88 BPM lofi loop, 4 chords x 2 bars, repeated to 64 bars ---
bpm=88; beat=60/bpm; bar=4*beat
chords=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]]  # Am7 Fmaj7 Cmaj7 G7
mid=lambda m: 440*2**((m-69)/12)
L=int(SR*bar*8); song=np.zeros(L)
tb=t(bar*2)
for ci,ch in enumerate(chords):
    pad=sum(np.sin(2*np.pi*mid(m)*tb + 0.3*np.sin(2*np.pi*0.3*tb))*(0.6 if j else 1) for j,m in enumerate(ch))
    pad+=0.5*np.sin(2*np.pi*mid(ch[0]-24)*tb)
    e=np.minimum(1,tb/0.4)*np.minimum(1,(tb[::-1])/0.3)
    s=int(ci*SR*bar*2); song[s:s+len(tb)]+=pad*e*0.12
song=lp(song,0.08)
kick=np.sin(2*np.pi*np.cumsum(np.linspace(110,45,int(SR*0.25)))/SR)*env(int(SR*0.25),0.001,0.09)
hat=lp(rng.standard_normal(int(SR*0.05)),0.9)*env(int(SR*0.05),0.0005,0.012)
snare=(lp(rng.standard_normal(int(SR*0.2)),0.5)*0.7+np.sin(2*np.pi*190*t(0.2))*0.3)*env(int(SR*0.2),0.001,0.06)
for b in range(32):
    s=int(b*beat*SR)
    if b%4 in (0,) or (b%8==6): song[s:s+len(kick)]+=kick*0.55
    if b%4 in (1,3): song[s:s+len(snare)]+=snare*0.22
    for h in (0,0.5):
        hs=int((b+h+ (0.06 if h else 0))*beat*SR)
        if hs+len(hat)<L: song[hs:hs+len(hat)]+=hat*(0.12 if h else 0.08)
vinyl=lp(rng.standard_normal(L),0.05)*0.015
song=song+vinyl
loop=np.tile(song,8)
save("music", loop, 0.6)
print("sfx+music ok", len(loop)/SR, "s")
