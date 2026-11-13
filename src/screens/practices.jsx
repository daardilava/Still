import React, { useEffect, useRef, useState } from 'react';
import { useApp, TopBar } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { PRACTICE_LIB, findPractice, fmt } from '../data.js';
import { QuietLabel } from './quiet.jsx';

const grad = (p) => `linear-gradient(150deg,${p.colors[0]},${p.colors[1]})`;

/* Seconds that have passed while the practice was running (fast mode for testing = 20×). */
function useClock(running, speed) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSec((x) => x + 1), 1000 / speed);
    return () => clearInterval(t);
  }, [running, speed]);
  return sec;
}

/* ---------- Shell: intro → practice → complete ---------- */
export function Practice({ id }) {
  const { s, nav, dialog, platform, speed } = useApp();
  const p = findPractice(id) || PRACTICE_LIB[0];
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const sec = useClock(started && !paused, speed);
  const secRef = useRef(0);
  secRef.current = sec;
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    nav.replace('complete', { id: 'practice:' + p.id, minutes: p.min, elapsedSec: Math.max(secRef.current, 1), token: Date.now() });
  };
  const quit = () => (!started || sec < 5 ? nav.back() : dialog({
    title: 'End this practice?', message: sec >= 60 ? 'Mo will count the minutes you’ve done.' : 'Practices count toward your streak after one minute.',
    actions: [{ label: 'Keep going', bold: true }, { label: 'End', destructive: true, onPress: finish }]
  }));
  const locked = p.plus && !s.user.plus;

  if (!started) return (
    <div className="pad">
      <TopBar />
      <div style={{ marginTop: 14, borderRadius: 30, background: grad(p), height: 190, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <span style={{ position: 'absolute', left: 22, top: 20, color: '#2A1E52', opacity: 0.5 }}><Icon name={p.icon} size={56} sw={1.4} /></span>
        <span style={{ position: 'absolute', right: 16, bottom: -8 }}><Mo size={140} mood="calm" glow={false} /></span>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <span className="tag">Practice</span><span className="tag tnum">{p.min} min</span>
        {locked ? <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span> : <span className="tag">Free</span>}
      </div>
      <h1 className="h1" style={{ marginTop: 12, fontSize: 28 }}>{p.name}</h1>
      <p className="lead">{p.what}</p>
      <div className="pressed col" style={{ marginTop: 16, padding: '12px 16px', borderRadius: 20, gap: 6 }}>
        <span className="row" style={{ gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--body)' }}><Icon name="sparkle" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />Helps when you feel {p.fit}</span>
        <span className="row" style={{ gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--body)' }}><Icon name="book" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />{p.origin}</span>
        {p.id === 'body' ? <span className="row" style={{ gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--body)' }}><Icon name="heart" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />Eyes open is fine. Skip any part that doesn’t feel okay.</span> : null}
      </div>
      {p.id === 'metta' ? <KindnessSky count={s.kindness || 0} small /> : null}
      <div className="grow" style={{ minHeight: 18 }} />
      <button className="btn btn-primary press" style={{ marginTop: 18 }} onClick={() => (locked ? nav.push('paywall', { source: 'practice', name: p.name }) : setStarted(true))}>
        {locked ? <><Icon name="lock" sw={2.2} />Unlock with Plus</> : <><Icon name="play" size={16} />Begin · {p.min} min</>}
      </button>
    </div>
  );

  const Body = { stop: StopPractice, ground: Grounding, body: BodyScan, metta: Metta }[p.id] || StopPractice;
  return (
    <div className="pad" style={{ alignItems: 'center' }}>
      <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
        <button className="icon-btn press" aria-label="Close practice" onClick={quit}><Icon name={platform === 'ios' ? 'down' : 'back_android'} sw={2.2} /></button>
        <QuietLabel text={p.name} />
        <button className="icon-btn press" aria-label={paused ? 'Resume' : 'Pause'} onClick={() => setPaused(!paused)}><Icon name={paused ? 'play' : 'pause'} size={18} /></button>
      </div>
      <Body sec={sec} paused={paused} onDone={finish} speed={speed} />
      <span className="sr-only" role="timer" aria-label={`${fmt(sec)} so far`} />
    </div>
  );
}

/* ---------- STOP ---------- */
const STOP_STEPS = [
  { l: 'S', t: 'Stop', cue: 'Pause whatever you’re doing. Let your hands rest.' },
  { l: 'T', t: 'Take a breath', cue: 'One slow breath in… and a long breath out.' },
  { l: 'O', t: 'Observe', cue: 'What’s here right now? Tap what fits. There’s no right answer.' },
  { l: 'P', t: 'Proceed', cue: 'Choose one small, kind next step.' }
];
const OBS = { Body: ['Tense', 'Tired', 'Okay', 'Relaxed'], Feelings: ['Stressed', 'Flat', 'Calm', 'Grateful'], Thoughts: ['Racing', 'Busy', 'Quiet'] };
const NEXT = ['Drink some water', 'Do one thing at a time', 'Step outside', 'Back to it, slower'];
function StopPractice({ sec, paused, onDone }) {
  const STEP = 16;
  const i = Math.min(3, Math.floor(sec / STEP));
  const [obs, setObs] = useState({});
  const [next, setNext] = useState(null);
  const left = STEP - (sec % STEP);
  useEffect(() => { if (sec >= STEP * 4 && next) onDone(); }, [sec, next]);
  const st = STOP_STEPS[i];
  return (
    <>
      <div className="row" style={{ gap: 12, marginTop: 26 }} aria-hidden="true">
        {STOP_STEPS.map((x, k) => (
          <span key={x.l} className={k === i ? '' : 'pressed-sm'} style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, background: k === i ? 'var(--primary)' : undefined, color: k === i ? 'var(--onp)' : k < i ? 'var(--accent)' : 'var(--muted)', transition: 'all .4s' }}>{x.l}</span>
        ))}
      </div>
      <div style={{ marginTop: 18 }} className={i === 1 && !paused ? 'breathe-slow' : ''}><Mo size={i === 1 ? 150 : i === 2 ? 84 : 120} mood={i === 1 ? 'breathe' : i === 3 ? 'happy' : 'calm'} /></div>
      <h1 className="h1" style={{ marginTop: 12, textAlign: 'center' }} aria-live="polite">{st.t}</h1>
      <p className="lead" style={{ textAlign: 'center', marginTop: 6 }}>{st.cue}</p>
      {i === 2 ? (
        <div className="col" style={{ gap: 10, width: '100%', marginTop: 12 }}>
          {Object.entries(OBS).map(([k, opts]) => (
            <div key={k} role="radiogroup" aria-label={k} className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="muted" style={{ width: '100%', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>{k}</span>
              {opts.map((o) => <button key={o} type="button" role="radio" aria-checked={obs[k] === o} className={'chip press' + (obs[k] === o ? ' on' : '')} style={{ fontSize: 14 }} onClick={() => setObs({ ...obs, [k]: o })}>{o}</button>)}
            </div>
          ))}
        </div>
      ) : null}
      {i === 3 ? (
        <div role="radiogroup" aria-label="Next step" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, width: '100%', marginTop: 12 }}>
          {NEXT.map((o) => <button key={o} type="button" role="radio" aria-checked={next === o} className={'chip press' + (next === o ? ' on' : '')} style={{ fontSize: 14, padding: '0 8px' }} onClick={() => setNext(o)}>{o}</button>)}
        </div>
      ) : null}
      <div className="grow" />
      {i < 3 || sec < STEP * 4 ? <p className="muted tnum" style={{ fontSize: 13, fontWeight: 700, margin: '14px 0 0' }}>{paused ? 'Paused' : `Next step in ${left} s`}</p> : null}
      {i === 3 ? <button className="btn btn-primary press" style={{ marginTop: 12 }} disabled={!next} onClick={onDone}>{next ? `Proceed: ${next.toLowerCase()}` : 'Pick a next step'}</button> : null}
    </>
  );
}

/* ---------- 5-4-3-2-1 grounding ---------- */
const SENSES = [
  { n: 5, verb: 'see', hint: 'A colour, a shape, something small you hadn’t noticed.' },
  { n: 4, verb: 'feel', hint: 'Your feet, your clothes, the air, the chair under you.' },
  { n: 3, verb: 'hear', hint: 'Near or far. Even the quiet hum of a room.' },
  { n: 2, verb: 'smell', hint: 'Or two smells you like, if nothing is around.' },
  { n: 1, verb: 'taste', hint: 'Or one slow breath you can feel in your chest.' }
];
function Grounding({ onDone, paused }) {
  const { haptic } = useApp();
  const [stage, setStage] = useState(0);
  const [got, setGot] = useState(0);
  const [pop, setPop] = useState(0);
  const S = SENSES[stage];
  const tap = () => {
    if (paused) return;
    haptic('select'); setPop((x) => x + 1);
    if (got + 1 < S.n) { setGot(got + 1); return; }
    if (stage === SENSES.length - 1) { setGot(S.n); setTimeout(onDone, 900); return; }
    setGot(S.n); setTimeout(() => { setStage(stage + 1); setGot(0); }, 650);
  };
  return (
    <>
      <div className="row" style={{ gap: 8, marginTop: 22 }} aria-hidden="true">
        {SENSES.map((x, k) => <span key={x.verb} style={{ width: k === stage ? 28 : 10, height: 10, borderRadius: 5, background: k <= stage ? 'var(--primary)' : 'var(--line)', transition: 'all .3s' }} />)}
      </div>
      <p className="muted" style={{ margin: '18px 0 0', fontSize: 13, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Step {stage + 1} of 5</p>
      <h1 className="h1" style={{ marginTop: 6, textAlign: 'center', fontSize: 30 }} aria-live="polite">Notice {S.n} {S.n === 1 ? 'thing' : 'things'} you can {S.verb}</h1>
      <p className="lead" style={{ textAlign: 'center', marginTop: 6 }}>{S.hint}</p>
      <div className="grow" style={{ minHeight: 12 }} />
      <button type="button" className="raised press" onClick={tap} aria-label={`I noticed one. ${got} of ${S.n}`}
        style={{ width: 220, height: 220, borderRadius: '50%', border: 0, cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--ink)', flexShrink: 0 }}>
        <span key={pop} className={pop ? 'mo-poke' : ''} style={{ display: 'flex' }}><Mo size={120} mood={got ? 'happy' : 'curious'} glow={false} label="" /></span>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent)' }}>I noticed one</span>
      </button>
      <div className="row" style={{ gap: 10, marginTop: 18 }} role="img" aria-label={`${got} of ${S.n}`}>
        {Array.from({ length: S.n }).map((_, k) => <span key={k} className={k < got ? '' : 'pressed-sm'} style={{ width: 18, height: 18, borderRadius: '50%', background: k < got ? 'var(--primary)' : undefined, transition: 'background .3s' }} />)}
      </div>
      <div className="grow" style={{ minHeight: 12 }} />
      <p className="muted" style={{ fontSize: 13, margin: '10px 0 0', textAlign: 'center' }}>Say them in your head or out loud. Take your time.</p>
    </>
  );
}

/* ---------- Body scan with a body map ---------- */
const REGIONS = [
  { id: 'feet', name: 'Feet and legs', cue: 'Feel the weight of your feet and legs. Let them be heavy.', d: 'M76 250H108L105 338Q105 350 93 350H80Q71 350 73 338ZM114 250H146L149 338Q151 350 142 350H129Q117 350 117 338Z' },
  { id: 'belly', name: 'Belly', cue: 'Notice your belly rise and fall. Let it soften.', d: 'M70 180H152L147 248H75Z' },
  { id: 'chest', name: 'Chest and back', cue: 'Feel your chest and back. Let the breath move freely.', d: 'M64 116H158L152 178H70Z' },
  { id: 'hands', name: 'Hands and arms', cue: 'Bring attention to your arms and hands. Let the fingers uncurl.', d: 'M60 116C48 120 44 128 43 140L34 232C33 244 39 251 46 251C53 251 56 245 57 235L66 142ZM162 116C174 120 178 128 179 140L188 232C189 244 183 251 176 251C169 251 166 245 165 235L156 142Z' },
  { id: 'shoulders', name: 'Shoulders and neck', cue: 'Let your shoulders drop away from your ears. Soften the neck.', d: 'M99 80H123V92Q150 96 160 114H62Q72 96 99 92Z' },
  { id: 'head', name: 'Face and jaw', cue: 'Unclench the jaw. Soften the eyes and the space between the eyebrows.', d: 'M111 16C127 16 139 30 139 48C139 66 127 78 111 78C95 78 83 66 83 48C83 30 95 16 111 16Z' }
];
function BodyScan({ sec, paused, onDone, speed }) {
  const [phase, setPhase] = useState('map'); // map → scan
  const [tense, setTense] = useState([]);
  const [i, setI] = useState(0);
  const [t0, setT0] = useState(0);
  const toggle = (id) => setTense(tense.includes(id) ? tense.filter((x) => x !== id) : [...tense, id]);
  const dur = (r) => (tense.includes(r.id) ? 45 : 30);
  const cur = REGIONS[i];
  const inRegion = sec - t0;
  useEffect(() => {
    if (phase !== 'scan' || paused) return;
    if (inRegion >= dur(cur)) { if (i + 1 < REGIONS.length) { setI(i + 1); setT0(sec); } else onDone(); }
  }, [sec]);
  const next = () => { if (i + 1 < REGIONS.length) { setI(i + 1); setT0(sec); } else onDone(); };
  const fill = (r) => (phase === 'scan' ? (r.id === cur.id ? 'var(--primary)' : REGIONS.indexOf(r) < i ? 'rgba(140,123,224,.32)' : 'rgba(140,123,224,.1)') : tense.includes(r.id) ? '#F4A6C6' : 'rgba(140,123,224,.16)');
  return (
    <>
      <h1 className="h2" style={{ marginTop: 18, textAlign: 'center', fontSize: 22 }} aria-live="polite">{phase === 'map' ? 'Where do you feel tension today?' : cur.name}</h1>
      <p className="lead" style={{ textAlign: 'center', marginTop: 6, minHeight: 48 }}>{phase === 'map' ? 'Tap the body or the names. Mo will stay longer there.' : cur.cue + (tense.includes(cur.id) ? ' Mo will stay here a little longer.' : '')}</p>
      <div className="row" style={{ gap: 4, marginTop: 6, alignItems: 'flex-end' }}>
        <svg viewBox="0 0 222 360" width="170" height="276" aria-hidden="true" style={{ flexShrink: 0 }}>
          {REGIONS.map((r) => (
            <path key={r.id} d={r.d} fill={fill(r)} stroke="var(--muted)" strokeOpacity=".4" strokeWidth="2" strokeLinejoin="round" className={phase === 'scan' && r.id === cur.id ? 'region-glow' : ''} style={{ cursor: phase === 'map' ? 'pointer' : 'default', transition: 'fill .6s' }}
              onClick={() => phase === 'map' && toggle(r.id)} />
          ))}
        </svg>
        {phase === 'scan' ? <span style={{ marginLeft: -30, marginBottom: 8 }}><Mo size={74} mood="breathe" glow={false} /></span> : null}
      </div>
      {phase === 'map' ? (
        <>
          <div role="group" aria-label="Where you feel tension" className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            {REGIONS.map((r) => <button key={r.id} type="button" aria-pressed={tense.includes(r.id)} className={'chip press' + (tense.includes(r.id) ? ' on' : '')} style={{ fontSize: 14 }} onClick={() => toggle(r.id)}>{r.name}</button>)}
          </div>
          <div className="grow" style={{ minHeight: 12 }} />
          <button className="btn btn-primary press" style={{ marginTop: 14 }} onClick={() => { setPhase('scan'); setT0(sec); }}>{tense.length ? 'Start the scan' : 'Nowhere in particular · start'}</button>
        </>
      ) : (
        <>
          <div className="track" style={{ width: '100%', marginTop: 14 }} role="progressbar" aria-label="Body scan progress" aria-valuemin={0} aria-valuemax={REGIONS.length} aria-valuenow={i}>
            <span style={{ width: ((i + Math.min(1, inRegion / dur(cur))) / REGIONS.length) * 100 + '%', transition: 'width 1s linear' }} />
          </div>
          <div className="grow" style={{ minHeight: 12 }} />
          <button className="btn btn-soft press" style={{ marginTop: 12, color: 'var(--accent)' }} onClick={next}>{i + 1 < REGIONS.length ? 'Skip to next part' : 'Finish'}</button>
        </>
      )}
    </>
  );
}

/* ---------- Loving-kindness with a kindness sky ---------- */
const ROUNDS = [
  { who: 'Yourself', p: ['May I be safe.', 'May I be at ease.', 'May I be kind to myself.'] },
  { who: 'Someone you love', p: ['Picture their face.', 'May you be happy.', 'May you be well.'] },
  { who: 'Someone neutral', p: ['Someone you see but don’t know. A neighbour, a barista.', 'May you be happy too.'] },
  { who: 'Someone difficult', optional: true, p: ['Only if it feels okay. Skip anytime.', 'May you be free from suffering.'] },
  { who: 'Everyone', p: ['Everyone feeling what you feel today.', 'May we all be safe. May we all be at ease.'] }
];
export function KindnessSky({ count, small, fresh = 0 }) {
  const n = Math.min(count, 120);
  const stars = Array.from({ length: n }).map((_, k) => ({ x: 12 + ((k * 97 + k * k * 31) % 150), y: 10 + ((k * 53 + k * k * 17) % 64), r: 1.6 + ((k * 13) % 10) / 6 }));
  return (
    <div className="sky" style={{ marginTop: small ? 16 : 0, height: small ? 96 : 150, borderRadius: 22, position: 'relative', overflow: 'hidden', width: '100%', flexShrink: 0 }} role="img" aria-label={`Your kindness sky: ${count} ${count === 1 ? 'wish' : 'wishes'} sent`}>
      <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">
        <circle cx="176" cy="22" r="11" fill="#FFF3D1" opacity=".9" /><circle cx="181" cy="18" r="10" fill="#3B2A7A" />
        {stars.map((st, k) => <path key={k} d={`M${st.x} ${st.y - st.r * 1.8}L${st.x + st.r * 0.5} ${st.y - st.r * 0.5}L${st.x + st.r * 1.8} ${st.y}L${st.x + st.r * 0.5} ${st.y + st.r * 0.5}L${st.x} ${st.y + st.r * 1.8}L${st.x - st.r * 0.5} ${st.y + st.r * 0.5}L${st.x - st.r * 1.8} ${st.y}L${st.x - st.r * 0.5} ${st.y - st.r * 0.5}Z`} fill="#FFE9A8" opacity={k >= n - fresh ? 1 : 0.8} className={k >= n - fresh ? 'star-new' : ''} />)}
      </svg>
      <span style={{ position: 'absolute', left: 14, bottom: 10, color: '#F3EEFF', fontSize: 13, fontWeight: 800 }}>{count ? `${count} kind ${count === 1 ? 'wish' : 'wishes'} in your sky` : 'Your kindness sky is waiting'}</span>
    </div>
  );
}
function Metta({ onDone, paused }) {
  const { s, set, haptic } = useApp();
  const [r, setR] = useState(0);
  const [hold, setHold] = useState(0); // 0..1
  const [sent, setSent] = useState(0);
  const timer = useRef(null);
  const R = ROUNDS[r];
  const start = () => {
    if (paused || timer.current) return;
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const v = Math.min(1, (Date.now() - t0) / 2200);
      setHold(v);
      if (v >= 1) { stop(true); }
    }, 50);
  };
  const stop = (full) => {
    clearInterval(timer.current); timer.current = null;
    if (full === true) {
      haptic('success'); setSent((x) => x + 1); set((prev) => ({ kindness: (prev.kindness || 0) + 1 }));
      setTimeout(() => { setHold(0); if (r + 1 < ROUNDS.length) setR(r + 1); else onDone(); }, 900);
    } else setHold(0);
  };
  useEffect(() => () => clearInterval(timer.current), []);
  const c = 2 * Math.PI * 70;
  return (
    <>
      <div style={{ width: '100%', marginTop: 16 }}><KindnessSky count={s.kindness || 0} fresh={sent} /></div>
      <p className="muted" style={{ margin: '16px 0 0', fontSize: 13, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{r + 1} of {ROUNDS.length} · {R.who}</p>
      <div className="col" style={{ gap: 4, marginTop: 8, alignItems: 'center', minHeight: 76 }} aria-live="polite">
        {R.p.map((x) => <p key={x} style={{ margin: 0, fontSize: 18, fontWeight: 700, textAlign: 'center', lineHeight: 1.4, color: 'var(--ink)' }}>{x}</p>)}
      </div>
      <div className="grow" style={{ minHeight: 8 }} />
      <button type="button" aria-label={`Hold to send kindness to ${R.who.toLowerCase()}`}
        onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } start(); }}
        onPointerUp={() => stop(false)} onPointerCancel={() => stop(false)} onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } }}
        onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') stop(false); }}
        style={{ width: 170, height: 170, borderRadius: '50%', border: 0, background: 'none', padding: 0, position: 'relative', cursor: 'pointer', touchAction: 'none', userSelect: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="170" height="170" viewBox="0 0 170 170" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="85" cy="85" r="70" fill="none" stroke="var(--muted)" strokeOpacity=".18" strokeWidth="6" />
          <circle cx="85" cy="85" r="70" fill="none" stroke="#F4A6C6" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * hold} ${c}`} transform="rotate(-90 85 85)" />
        </svg>
        <span className={hold > 0 ? 'pressed' : 'raised'} style={{ width: 128, height: 128, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: 'var(--ink)' }}>
          <Icon name="heart" size={30} style={{ color: '#D9779F' }} />
          <span style={{ fontSize: 13, fontWeight: 800 }}>{hold >= 1 ? 'Sent' : 'Hold to send'}</span>
        </span>
      </button>
      {R.optional ? <button className="btn-text" style={{ marginTop: 6 }} onClick={() => setR(r + 1)}>Skip this one</button> : <span style={{ height: 50 }} />}
    </>
  );
}

/* ---------- Explore row ---------- */
export function PracticesRow() {
  const { s, nav } = useApp();
  return (
    <>
      <div style={{ marginTop: 24 }}>
        <h2 className="h2" style={{ fontSize: 17 }}>Practices</h2>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600 }}>Short, hands-on mindfulness. You do them with Mo.</p>
      </div>
      <div className="hscroll">
        {PRACTICE_LIB.map((p) => (
          <button key={p.id} className="raised press col" onClick={() => nav.push('practice', { id: p.id })}
            style={{ flexShrink: 0, width: 156, border: 0, borderRadius: 22, padding: 8, gap: 6, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', alignItems: 'stretch' }}>
            <span style={{ height: 76, borderRadius: 16, background: grad(p), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1E52' }}><Icon name={p.icon} size={30} sw={1.6} /></span>
            <span style={{ margin: '4px 4px 0', fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>{p.name}</span>
            <span className="muted tnum" style={{ margin: '0 4px 4px', fontSize: 12, fontWeight: 600 }}>{p.min} min{p.plus && !s.user.plus ? ' · Plus' : ' · Free'}</span>
          </button>
        ))}
      </div>
    </>
  );
}
