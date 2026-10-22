"""Original, locally synthesized score and motion sound effects. No samples."""
from pathlib import Path
import wave
import numpy as np

SR = 48000
DURATION = 60
rng = np.random.default_rng(739000)
mix = np.zeros((SR * DURATION, 2), dtype=np.float64)
OUT = Path(__file__).resolve().parents[1] / 'exports'
OUT.mkdir(exist_ok=True)


def add(signal, when, gain=1, pan=0):
    start = int(when * SR)
    if start >= len(mix):
        return
    signal = np.asarray(signal)
    if start < 0:
        signal = signal[-start:]
        start = 0
    size = min(len(signal), len(mix) - start)
    if size <= 0:
        return
    theta = (pan + 1) * np.pi / 4
    mix[start:start+size, 0] += signal[:size] * gain * np.cos(theta)
    mix[start:start+size, 1] += signal[:size] * gain * np.sin(theta)


def pluck(when, freq, gain=.1, pan=0, length=.8):
    t = np.arange(int(SR * length)) / SR
    signal = (np.sin(2*np.pi*freq*t) + .23*np.sin(2*np.pi*freq*2*t) + .05*np.sin(2*np.pi*freq*3*t))
    signal *= (1-np.exp(-t*800)) * np.exp(-t*7)
    add(signal, when, gain, pan)
    add(signal, when+.375, gain*.23, -pan)
    add(signal, when+.75, gain*.10, pan)


def kick(when, gain=.42):
    t = np.arange(int(SR * .48)) / SR
    phase = 2*np.pi*(48*t + 8*(1-np.exp(-t*28)))
    s = np.sin(phase)*np.exp(-t*11)*(1-np.exp(-t*900))
    s += .10 * rng.normal(size=len(t))*np.exp(-t*180)
    add(s, when, gain)


def hat(when, gain=.024, pan=0):
    t = np.arange(int(SR*.085)) / SR
    noise = rng.normal(size=len(t))
    s = noise - np.roll(noise, 1)
    s *= np.exp(-t*66)*(1-np.exp(-t*1400))
    add(s, when, gain, pan)


def snap(when, gain=.065):
    t = np.arange(int(SR*.16)) / SR
    noise = rng.normal(size=len(t))
    noise = (noise + np.roll(noise, 1))*.5
    s = noise*np.exp(-t*36)*(1-np.exp(-t*1800))
    s += .34*np.sin(2*np.pi*185*t)*np.exp(-t*48)
    add(s, when, gain, .1)


def transition(when, bright=True):
    t = np.arange(int(SR*.8)) / SR
    noise = rng.normal(size=len(t))
    # A soft moving band rather than harsh full-band white noise.
    filt = np.convolve(noise, np.ones(9)/9, mode='same')
    envelope = np.sin(np.pi*np.clip(t/.8,0,1))**2
    signal = filt*envelope
    add(signal, when-.66, .105, -.45)
    add(signal[::-1], when-.64, .055, .45)
    pluck(when, 587.33 if bright else 146.83, .10, .15, .9)
    kick(when, .30)


# Warm, wide chord bed: Dm9 / Fmaj7 / Am7 / Cmaj9.
chords = [
    (0, 14, [146.83,174.61,220,261.63,329.63]),
    (14, 26, [130.81,174.61,220,261.63,329.63]),
    (26, 40, [110,164.81,196,261.63,329.63]),
    (40, 51.5, [130.81,164.81,196,246.94,293.66]),
    (51.5, 60, [146.83,174.61,220,261.63,329.63]),
]
for start, end, chord in chords:
    t = np.arange(int(SR*(end-start+1.25))) / SR
    env = np.minimum(1,t/1.25)*np.minimum(1,np.maximum(0,end-start+1.25-t)/1.35)
    # Sidechain breathing on the half-second pulse.
    pump = .62 + .38*(1-np.exp(-np.mod(t+start,.5)*12))
    for i,freq in enumerate(chord):
        s = np.sin(2*np.pi*freq*t+.12*np.sin(2*np.pi*.17*t+i))
        s += .18*np.sin(2*np.pi*freq*2*t+.2)
        s *= env*pump*(.83+.17*np.sin(2*np.pi*.08*t+i))
        add(s,start,.021,(i-2)*.35)

# The first act acquires a heartbeat. The second act opens into a beat.
for beat in np.arange(4,55.5,.5):
    if 23 <= beat < 26:
        continue
    if beat < 14 and int(beat*2)%2:
        continue
    kick(float(beat),.29 if beat<14 else .39)
    if beat>=14 and int(beat*2)%2:
        snap(float(beat),.065)
    if beat>=26:
        freq=73.416 if beat<40 else 65.406 if beat<51.5 else 73.416
        t=np.arange(int(SR*.40))/SR
        s=(np.sin(2*np.pi*freq*t)+.2*np.sin(2*np.pi*freq*2*t))*np.exp(-t*7)*(1-np.exp(-t*350))
        add(s,float(beat)+.015,.16)

for j,when in enumerate(np.arange(12,55.5,.25)):
    if 23<=when<26:
        continue
    hat(float(when),.014 if j%2 else .023,(-1 if j%2 else 1)*.35)

motif=[293.66,440,523.25,392,349.23,440,587.33,523.25]
for j,when in enumerate(np.arange(.5,55.5,.25)):
    if when<8 and j%4:
        continue
    if 8<=when<14 and j%2:
        continue
    if 23<=when<26:
        continue
    amp=.05 if when<14 else .065 if when<26 else .080
    if j%8 in (3,7):
        amp*=.48
    pluck(float(when),motif[j%8],amp,np.sin(j*1.7)*.55,.72)

cuts=[4,8,14,23,26,29.5,33,36.5,40,43.5,47.5,51.5,55.5]
for when in cuts:
    transition(when,when>=14)

# Small tactile accents coincide with units, gates and prefab pieces.
for when in [1.55,6.05,10.4,18.55,24.5,24.66,24.82,24.98,25.14,25.30,25.46,27.85,31.65,35.2,38.1,41.5,44.6,48.0,48.39,48.78,49.17,49.56]:
    pluck(when,1174.66,.04,-.25,.32)

# Resolved final chord and a deliberate tail, held under the final title.
for i,freq in enumerate([146.83,220,293.66,349.23,440,587.33]):
    t=np.arange(int(SR*4.5))/SR
    s=np.sin(2*np.pi*freq*t)*(1-np.exp(-t*14))*np.exp(-t*.8)
    add(s,55.5,.053,(i-2.5)*.24)

timeline=np.arange(len(mix))/SR
fadein=np.clip(timeline/.18,0,1)
fadeout=np.clip((DURATION-timeline)/1.15,0,1)
mix *= (fadein*fadeout)[:,None]
mix=np.tanh(mix*1.15)
mix *= .86/max(.001,np.abs(mix).max())
with wave.open(str(OUT/'score.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
    f.writeframes((mix*32767).astype('<i2').tobytes())
print('Original stereo score:', OUT/'score.wav', '· 60 seconds')
