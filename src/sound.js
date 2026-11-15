/* Still's soundscapes: rain, ocean and forest, synthesised on the phone with the Web Audio API.
   No audio files and no licences. Each sound is rendered once (about 0.1 s of work) into a loop whose
   tail is crossfaded into its head, so it repeats with no audible seam. It works the same in a browser
   and in the Expo app's webview.

   API (levels are 0–100, matching the app's sliders):
     setAmbience({ rain, forest, ocean }, fadeSec)   fade each layer to its level
     stopAmbience(fadeSec)                           fade everything out, then free it
     previewAmbience(mix, seconds)                   short taste, e.g. when picking a sound
     mixFor(name, savedMixes)                        'Rain' | 'Rainy cabin' | … → levels */

import { PRESET_MIXES } from './data.js';

export const AMBIENT_KEYS = ['rain', 'forest', 'ocean'];
const LOOP = { rain: 19, ocean: 31, forest: 37 }; // loop length in seconds; different lengths so blends don't repeat together
const XF = 2.5; // crossfade length at the loop point, in seconds
const SR = 24000; // render rate: plenty for these sounds, and a quarter of the memory of 48 kHz
const LOUD = { rain: 0.11, ocean: 0.13, forest: 0.1 }; // RMS each sound is normalised to, so a slider at 50% feels alike for all

let ctx = null;
let master = null;
const layers = {}; // key → { gain, src, target, stopTimer }
const cache = {}; // key → AudioBuffer
let token = 0; // bumps on every change, so an old preview can't stop newer sound

function ac() {
  if (ctx) return ctx;
  const C = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!C) return null;
  try { ctx = new C(); } catch (e) { return null; }
  master = ctx.createGain();
  /* A gentle limiter, so a loud blend never clips. */
  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -8; lim.knee.value = 6; lim.ratio.value = 6; lim.attack.value = 0.005; lim.release.value = 0.25;
  master.connect(lim);
  lim.connect(ctx.destination);
  return ctx;
}

/* Phones only let audio start during a tap. Unlock on any touch, and resume after a phone call or Siri. */
export function unlockAudio() {
  const c = ac();
  if (c && c.state !== 'running') c.resume().catch(() => {});
}
if (typeof window !== 'undefined') {
  for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, unlockAudio, { capture: true, passive: true });
}

/* ---------- Small DSP helpers ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const lpCoef = (fc) => Math.exp((-2 * Math.PI * fc) / SR); // one-pole low-pass: y = x + a·(y − x)

/* Noise, generated in one tight loop with plain local variables: much faster on phones than calling a
   small function per sample. xorshift32 stands in for Math.random, which is several times slower. */
const WHITE = 0, PINK = 1, BROWN = 2;
let seed = (Math.random() * 4294967295) >>> 0 || 1;
function noise(n, kind) {
  const out = new Float32Array(n);
  let s = seed, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, br = 0;
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const w = (s >>> 0) / 2147483648 - 1;
    if (kind === WHITE) out[i] = w;
    else if (kind === PINK) { // Paul Kellet's pink filter
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    } else { br = (br + 0.02 * w) / 1.02; out[i] = br * 3.5; }
  }
  seed = s;
  return out;
}
const panGains = (p) => [Math.cos(p * Math.PI / 2), Math.sin(p * Math.PI / 2)]; // p: 0 = left, 1 = right

/* ---------- Rain: a soft hiss, a low roof rumble, and thousands of single drops ---------- */
function synthRain(L, R, sec) {
  const n = L.length;
  for (const ch of [L, R]) {
    const P = noise(n, PINK), B = noise(n, BROWN);
    const aHi = lpCoef(5500), aLo = lpCoef(350), aRum = lpCoef(160);
    let hi = 0, lo = 0, rum = 0;
    const ph = rnd(0, 6.28);
    let swell = 1;
    for (let i = 0; i < n; i++) {
      if ((i & 31) === 0) swell = 1 + 0.12 * Math.sin((2 * Math.PI * i) / (SR * 7.3) + ph); // rain comes and goes a little
      const x = P[i];
      hi = x + aHi * (hi - x); lo = hi + aLo * (lo - hi);
      const b = B[i]; rum = b + aRum * (rum - b);
      ch[i] = ((hi - lo) * 0.55 + rum * 0.35) * swell;
    }
  }
  /* Fine drops: many, quiet, bright. Large drops: fewer, a little louder, lower and longer. */
  const W = noise(65536, WHITE); // each drop reads a random stretch of this
  const drop = (amp, freq, tauMs, q) => {
    const t0 = Math.floor(Math.random() * n), tau = (tauMs / 1000) * SR, len = Math.floor(tau * 6);
    const [gl, gr] = panGains(Math.random()), decay = Math.exp(-1 / tau), off = Math.floor(Math.random() * 65536);
    /* band-pass biquad (RBJ, 0 dB peak), state kept in locals */
    const w0 = (2 * Math.PI * freq) / SR, al = Math.sin(w0) / (2 * q), a0 = 1 + al;
    const c0 = al / a0, c2 = -al / a0, a1 = (-2 * Math.cos(w0)) / a0, a2 = (1 - al) / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, env = amp;
    for (let j = 0; j < len && t0 + j < n; j++) {
      const x = W[(off + j) & 65535] * env;
      const y = c0 * x + c2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y; env *= decay;
      L[t0 + j] += y * gl; R[t0 + j] += y * gr;
    }
  };
  for (let k = 0; k < sec * 120; k++) { const a = Math.random() ** 3; drop(0.25 + 0.75 * a, 5200 - 2600 * a, rnd(1.5, 4), 1.4); }
  for (let k = 0; k < sec * 5; k++) drop(rnd(0.6, 1.1), rnd(700, 1400), rnd(6, 12), 3); // drops on leaves and sills
}

/* ---------- Ocean: waves that build, break and wash back, over a low undertow ---------- */
function synthOcean(L, R, sec) {
  const n = L.length;
  /* The wave envelope changes slowly, so it is computed every 32 samples (about 1.3 ms). */
  const nc = (n >> 5) + 1, env = new Float32Array(nc), cr = SR / 32;
  for (let t = rnd(0, 2); t < sec + XF; t += rnd(7.5, 11.5)) {
    const rise = rnd(2.4, 3.8), fall = rnd(4.5, 7), peak = rnd(0.6, 1);
    const c0 = Math.floor(t * cr), c1 = Math.min(nc, Math.floor((t + rise + fall * 1.6) * cr));
    for (let k = c0; k < c1; k++) {
      const u = k / cr - t;
      const e = u < rise ? Math.sin((u / rise) * Math.PI / 2) ** 2 : Math.exp(-(u - rise) / (fall / 2.6));
      env[k] = Math.min(1, env[k] + e * peak);
    }
  }
  const lag = Math.floor(0.18 * cr); // the right ear hears each wave a moment later: a wide beach
  [L, R].forEach((ch, c) => {
    const P = noise(n, PINK), B = noise(n, BROWN), B2 = noise(n, BROWN), W = noise(n, WHITE);
    const aUnder = lpCoef(110), aFoamLo = lpCoef(2200);
    let body = 0, under = 0, foamLo = 0, e = 0, a = 0, e3 = 0;
    for (let i = 0; i < n; i++) {
      if ((i & 31) === 0) {
        e = env[Math.max(0, (i >> 5) - c * lag)];
        a = lpCoef(220 + 2800 * e ** 1.6); // the wave brightens as it breaks
        e3 = e * e * e;
      }
      const x = P[i] * 0.6 + B[i] * 0.4;
      body = x + a * (body - x);
      const b = B2[i]; under = b + aUnder * (under - b);
      const w = W[i]; foamLo = w + aFoamLo * (foamLo - w);
      ch[i] = body * (0.18 + 0.82 * e) * 1.4 + under * 0.45 + (w - foamLo) * e3 * 0.22; // last term: foam fizzing at the crash
    }
  });
}

/* ---------- Forest: gusting wind, leaves rustling, and birds calling now and then ---------- */
function synthForest(L, R, sec) {
  const n = L.length;
  const p = [rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28)];
  const gust = (t) => Math.max(0.3, Math.min(1, 0.6 + 0.2 * Math.sin(2 * Math.PI * t / 13 + p[0]) + 0.12 * Math.sin(2 * Math.PI * t / 5.7 + p[1]) + 0.06 * Math.sin(2 * Math.PI * t / 2.3 + p[2])));
  [L, R].forEach((ch, c) => {
    const B = noise(n, BROWN), P = noise(n, PINK);
    const aLeafLo = lpCoef(1800), aLeafHi = lpCoef(6500);
    let wind = 0, leafLo = 0, leafHi = 0, g = 0, a = 0, g3 = 0;
    for (let i = 0; i < n; i++) {
      if ((i & 31) === 0) { g = gust(i / SR + c * 0.35); a = lpCoef(180 + 650 * g); g3 = g * g * g; }
      const b = B[i];
      wind = b + a * (wind - b);
      const x = P[i]; leafHi = x + aLeafHi * (leafHi - x); leafLo = leafHi + aLeafLo * (leafLo - leafHi);
      ch[i] = wind * g * 0.9 + (leafHi - leafLo) * g3 * 0.9;
    }
  });

  /* Birds: a few made-up species, each a short phrase of sine "notes" with pitch glides. */
  const note = (t0, dur, f0, f1, amp, pan, trill = 0) => {
    const s0 = Math.floor(t0 * SR), len = Math.floor(dur * SR), [gl, gr] = panGains(pan);
    let ph = 0;
    for (let j = 0; j < len; j++) {
      const u = j / len, f = f0 + (f1 - f0) * u;
      ph += (2 * Math.PI * f) / SR;
      let y = Math.sin(ph) * Math.sin(Math.PI * u) ** 2 * amp;
      if (trill) y *= 0.55 + 0.45 * Math.sin(2 * Math.PI * trill * j / SR);
      /* a soft echo off the trees, on the other side */
      const i = s0 + j, e = i + Math.floor(0.16 * SR);
      if (i < n) { L[i] += y * gl; R[i] += y * gr; }
      if (e < n) { L[e] += y * gr * 0.22; R[e] += y * gl * 0.22; }
    }
  };
  const species = [
    (t, a, pn) => { note(t, 0.26, 3300, 3150, a, pn); note(t + 0.34, 0.32, 2650, 2550, a * 0.9, pn); }, // two-note whistle
    (t, a, pn) => { const k = 3 + Math.floor(Math.random() * 4); for (let i = 0; i < k; i++) note(t + i * 0.14, 0.07, 2600, 4400, a * 0.8, pn); }, // quick chirps
    (t, a, pn) => note(t, rnd(0.6, 1), 4300, 3900, a * 0.55, pn, rnd(28, 42)), // trill
    (t, a, pn) => { let f = rnd(2400, 3600); for (let i = 0; i < 6; i++) { const g = rnd(2100, 4300); note(t + i * 0.11, 0.1, f, g, a * 0.75, pn); f = g; } } // warble
  ];
  for (let t = rnd(1, 3); t < sec + XF - 1.5; t += rnd(2.8, 6.5)) {
    species[Math.floor(Math.random() * species.length)](t, rnd(0.05, 0.16), rnd(0.15, 0.85));
  }
}

const SYNTH = { rain: synthRain, ocean: synthOcean, forest: synthForest };

/* Render a sound, fold its tail into its head (equal-power crossfade), and normalise its loudness. */
function render(key) {
  const sec = LOOP[key], N = Math.floor(sec * SR), X = Math.floor(XF * SR);
  const L = new Float32Array(N + X), R = new Float32Array(N + X);
  SYNTH[key](L, R, sec);
  for (const ch of [L, R]) {
    for (let i = 0; i < X; i++) {
      const g = (i / X) * Math.PI / 2;
      ch[i] = ch[i] * Math.sin(g) + ch[N + i] * Math.cos(g);
    }
  }
  let sum = 0, peak = 0;
  for (let i = 0; i < N; i++) { sum += L[i] * L[i] + R[i] * R[i]; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
  const rms = Math.sqrt(sum / (2 * N)) || 1;
  const k = Math.min(LOUD[key] / rms, 0.9 / (peak || 1));
  const buf = ctx.createBuffer(2, N, SR);
  const outL = buf.getChannelData(0), outR = buf.getChannelData(1);
  for (let i = 0; i < N; i++) { outL[i] = L[i] * k; outR[i] = R[i] * k; }
  return buf;
}

function layer(key) {
  if (layers[key]) return layers[key];
  if (!cache[key]) cache[key] = render(key);
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const src = ctx.createBufferSource();
  src.buffer = cache[key];
  src.loop = true;
  src.connect(gain);
  src.start(0, Math.random() * src.buffer.duration);
  return (layers[key] = { gain, src, target: 0, stopTimer: null });
}

/* Slider level (0–100) → gain. Squared, so the low end of the slider stays usable for quiet sleep sounds. */
const toGain = (v) => (Math.max(0, Math.min(100, v || 0)) / 100) ** 2 * 1.6;

function fadeTo(key, target, fade) {
  const l = layers[key];
  if (!l) return;
  const now = ctx.currentTime, g = l.gain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.setTargetAtTime(target, now, Math.max(0.02, fade / 3));
  l.target = target;
  clearTimeout(l.stopTimer);
  /* A layer that has faded out stops and is freed; its rendered loop stays cached for next time. */
  if (target === 0) {
    l.stopTimer = setTimeout(() => {
      if (layers[key] !== l || l.target !== 0) return;
      try { l.src.stop(); } catch (e) { /* already stopped */ }
      l.src.disconnect(); l.gain.disconnect();
      delete layers[key];
    }, (fade + 0.6) * 1000);
  }
}

/* Render a sound ahead of time (e.g. while a screen opens) so pressing play starts instantly. Returns its loop. */
export function prepareAmbience(key) {
  if (!ac() || !SYNTH[key]) return null;
  if (!cache[key]) cache[key] = render(key);
  return cache[key];
}

/* Pre-render sounds a screen is likely to play, one per idle moment, so the screen stays smooth. */
export function warmAmbience(keys = AMBIENT_KEYS) {
  if (typeof window === 'undefined') return;
  const todo = keys.filter((k) => SYNTH[k] && !cache[k]);
  const later = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 120));
  const step = () => { const k = todo.shift(); if (!k) return; prepareAmbience(k); later(step); };
  if (todo.length) setTimeout(() => later(step), 400); // after the screen's entry animation
}

export function setAmbience(mix, fade = 1.2) {
  if (!ac()) return;
  token++;
  unlockAudio();
  for (const key of AMBIENT_KEYS) {
    const target = toGain((mix || {})[key]);
    if (target > 0) layer(key);
    fadeTo(key, target, fade);
  }
}

export function stopAmbience(fade = 1.5) {
  if (!ctx) return;
  token++;
  for (const key of AMBIENT_KEYS) fadeTo(key, 0, fade);
}

export function previewAmbience(mix, seconds = 3) {
  setAmbience(mix, 0.35);
  const mine = token;
  setTimeout(() => { if (token === mine) stopAmbience(1.2); }, seconds * 1000);
}

/* Levels for a sound name: a single sound ('Rain'), a preset or saved soundscape ('Rainy cabin'), or silence. */
export function mixFor(name, saved = [], level = 60) {
  const key = String(name || '').toLowerCase();
  const out = { rain: 0, forest: 0, ocean: 0 };
  if (AMBIENT_KEYS.includes(key)) return { ...out, [key]: level };
  const m = [...PRESET_MIXES, ...(saved || [])].find((x) => x.name === name);
  return m ? { rain: m.rain || 0, forest: m.forest || 0, ocean: m.ocean || 0 } : out;
}
