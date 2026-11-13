import React, { useEffect, useRef, useState } from 'react';
import { useApp, TopBar, SheetTitle, Slider, Field, SwitchVisual } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { PROGRAMS, STORIES, PRESET_MIXES, SOUNDS, GOAL_CAT, findProgram, findStory, findSession, findPractice, fmt } from '../data.js';
import { TranscriptPanel } from './extras.jsx';
import { SleepSheet } from './session.jsx';
import { QuietLabel } from './quiet.jsx';
import { MoreSheet } from './more.jsx';
import { OptionList } from '../ui.jsx';

const PlusTag = () => <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span>;
const FreeTag = () => <span className="tag">Free</span>;

/* ---------- Program detail ---------- */
export function Program({ id }) {
  const { s, nav, toast } = useApp();
  const p = findProgram(id) || PROGRAMS[0];
  const done = (s.programs || {})[p.id] || 0;
  const total = p.days.length;
  const next = Math.min(done + 1, total);
  const finished = done >= total;
  const locked = (n) => p.plus && n > 1 && !s.user.plus;
  const open = (n) => {
    if (n > done + 1) { toast(`Finish day ${done + 1} first. One day at a time.`); return; }
    if (locked(n)) { nav.push('paywall', { source: 'program', name: p.title }); return; }
    nav.push('player', { id: `prog:${p.id}:${n}`, minutes: p.days[n - 1].min });
  };
  return (
    <div className="pad">
      <TopBar />
      <div className="raised frame" style={{ marginTop: 16 }}>
        <div className="frame-in" style={{ height: 190 }}><img src={p.img} alt="" style={{ objectPosition: p.pos }} /></div>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <span className="tag">Program</span><span className="tag tnum">{total} days</span>
        {p.plus && !s.user.plus ? <PlusTag /> : null}
      </div>
      <h1 className="h1" style={{ marginTop: 12, fontSize: 28 }}>{p.title}</h1>
      <p className="lead">{p.desc}</p>

      <div className="raised" style={{ marginTop: 18, padding: '14px 16px', borderRadius: 22 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>{finished ? 'Program complete' : done ? `Day ${done} of ${total} done` : 'Not started yet'}</span>
          <span className="tnum accent" style={{ fontWeight: 800 }}>{Math.round((done / total) * 100)}%</span>
        </div>
        <div className="track" style={{ marginTop: 10 }} role="progressbar" aria-label={`${done} of ${total} days done`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: (done / total) * 100 + '%' }} />
        </div>
        <p className="muted" style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.4 }}>Missing a day just pauses the program. Mo keeps your place.</p>
      </div>

      <h2 className="label">Days</h2>
      <div className="group">
        {p.days.map((d) => {
          const isDone = d.n <= done, isNext = d.n === done + 1, isLocked = locked(d.n), waiting = d.n > done + 1;
          return (
            <button key={d.n} type="button" className="lrow press" onClick={() => open(d.n)} aria-label={`Day ${d.n}, ${d.title}, ${d.min} minutes${isDone ? ', done' : isLocked ? ', needs Still Plus' : waiting ? ', not unlocked yet' : ''}`}>
              <span className="ico" style={isNext ? { background: 'var(--primary)', color: 'var(--onp)', boxShadow: 'none' } : undefined}>
                {isDone ? <Icon name="check" size={18} sw={2.6} /> : isNext && !isLocked ? <Icon name="play" size={14} /> : isLocked ? <Icon name="lock" size={16} /> : <span className="tnum" style={{ fontWeight: 800, fontSize: 14 }}>{d.n}</span>}
              </span>
              <span className="col grow" style={{ minWidth: 0 }}>
                <span className="t" style={{ color: waiting && !isLocked ? 'var(--muted)' : undefined }}>Day {d.n} · {d.title}</span>
                <span className="s">{d.min} min · {d.focus}</span>
              </span>
              {d.n === 1 && p.plus && !s.user.plus ? <FreeTag /> : null}
            </button>
          );
        })}
      </div>
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" style={{ marginTop: 20 }} onClick={() => (finished ? open(1) : open(next))}>
        {finished ? 'Start again from day 1' : locked(next) ? <><Icon name="lock" sw={2.2} />Unlock day {next} with Plus</> : <><Icon name="play" size={16} />{done ? 'Continue' : 'Start'} · Day {next}</>}
      </button>
    </div>
  );
}

/* ---------- Sleep story player ---------- */
export function Story({ id }) {
  const { s, set, nav, sheet, dialog, toast, platform, speed } = useApp();
  const st = findStory(id) || STORIES[0];
  const total = st.min * 60;
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [bg, setBg] = useState('Rain');
  const [showText, setShowText] = useState(false);
  /* Sleep timer: stop (with a fade in the real app) some minutes after it was set. */
  const [stop, setStop] = useState({ label: 'Off', at: null });
  const pickStop = (label) => { const m = parseInt(label, 10); setStop({ label, at: m ? Math.min(total, elapsedRef.current + m * 60) : null }); if (m) toast(`The story fades out in ${m} minutes.`); };
  const [dimmed, setDimmed] = useState(false);
  const [poke, setPoke] = useState(0);
  const doneRef = useRef(false);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed((e) => Math.min(total, e + 1)), 1000 / speed);
    return () => clearInterval(t);
  }, [playing, speed, total]);
  useEffect(() => {
    if (!s.autoDim || !playing || dimmed || showText) return;
    const t = setTimeout(() => setDimmed(true), 12000 / Math.min(speed, 4));
    return () => clearTimeout(t);
  }, [poke, playing, dimmed, showText, speed, s.autoDim]);
  const finish = (sec) => { doneRef.current = true; nav.replace('complete', { id: 'story:' + st.id, minutes: st.min, elapsedSec: sec, token: Date.now() }); };
  useEffect(() => { if (!doneRef.current && (elapsed >= total || (stop.at && elapsed >= stop.at))) finish(elapsed); }, [elapsed]);

  const quit = () => (elapsed <= 5 ? nav.back() : dialog({
    title: 'Stop the story?', message: elapsed >= 60 ? 'Mo will count the minutes you listened.' : 'Stories count toward your streak after one minute.',
    actions: [{ label: 'Keep listening', bold: true }, { label: 'Stop', destructive: true, onPress: () => finish(elapsedRef.current) }]
  }));
  const pct = elapsed / total;
  return (
    <div className="pad" style={{ alignItems: 'center' }} onPointerDown={() => setPoke((p) => p + 1)} onKeyDown={() => setPoke((p) => p + 1)}>
      <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
        <button className="icon-btn press" aria-label="Close story" onClick={quit}><Icon name={platform === 'ios' ? 'down' : 'back_android'} sw={2.2} /></button>
        <QuietLabel text="Sleep story" />
        <span style={{ width: 48 }} />
      </div>
      <div className="raised frame" style={{ marginTop: 20, width: '100%', position: 'relative' }}>
        <div className="frame-in" style={{ height: 250 }}><img src={st.img} alt="" style={{ objectPosition: st.pos, filter: s.dark ? 'brightness(.85)' : undefined }} /></div>
        <div style={{ position: 'absolute', right: 18, bottom: 8 }}><Mo size={96} mood={pct > 0.5 ? 'sleepy' : 'calm'} glow={false} /></div>
      </div>
      <h1 style={{ margin: '22px 0 0', fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.01em' }}>{st.title}</h1>
      <p className="muted" style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>Read by {st.narrator}</p>

      <div style={{ width: '100%', marginTop: 18 }}>
        <div className="track" role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={elapsed} aria-valuetext={`${fmt(elapsed)} of ${fmt(total)}`}>
          <span style={{ width: pct * 100 + '%', transition: 'width 1s linear' }} />
        </div>
        <div className="row tnum muted" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 13, fontWeight: 800 }}>
          <span className="accent">{fmt(elapsed)}</span>
          {stop.at ? <span className="tag"><Icon name="moon" size={11} sw={2.4} />Stops in {fmt(Math.max(0, stop.at - elapsed))}</span> : null}
          <span>−{fmt(total - elapsed)}</span>
        </div>
      </div>

      <div className="row ctrls" style={{ marginTop: 18, width: '100%', justifyContent: 'space-between', padding: '0 6px' }}>
        <button className={'icon-btn press ctrl-skip' + (stop.at ? ' on' : '')} style={{ width: 56, height: 56, color: 'var(--accent)' }} aria-label="More controls" aria-haspopup="dialog"
          onClick={() => sheet(<MoreSheet title="Story controls" items={[
            { icon: 'clock', label: 'Sleep timer', value: stop.at ? stop.label : null, onClick: () => sheet(<SleepSheet value={stop.label} onPick={pickStop} options={['Off', '10 minutes', '15 minutes', '30 minutes']} />) },
            { icon: 'wave', label: 'Sound', value: bg === 'Silence' ? 'None' : bg, onClick: () => sheet(<BgSheet value={bg} onPick={setBg} />) },
            { icon: 'book', label: 'Read along', on: showText, onClick: () => setShowText(true) },
            { icon: 'rew', label: 'Back 15 s', keep: true, onClick: () => setElapsed((e) => Math.max(0, e - 15)) },
            { icon: 'fwd', label: 'Forward 15 s', keep: true, onClick: () => setElapsed((e) => Math.min(total, e + 15)) }
          ]} />)}><Icon name="more" size={24} sw={3.4} /></button>
        <button className="btn press ctrl-play" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}
          style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', boxShadow: 'var(--up), var(--glow)' }}>
          <Icon name={playing ? 'pause' : 'play'} size={30} />
        </button>
        <button className="icon-btn press ctrl-skip" style={{ width: 56, height: 56, color: 'var(--accent)' }} aria-label="Dim the screen now" onClick={() => setDimmed(true)}><Icon name="moon" size={22} /></button>
      </div>
      <div className="grow" style={{ minHeight: 12 }} />
      <p className="muted" style={{ fontSize: 13, textAlign: 'center', margin: '12px 0 0' }}>{s.autoDim ? 'The screen dims on its own after a few quiet seconds.' : 'Tip: turn on “Dim screen in sleep sessions” in Settings.'}</p>

      {showText ? <TranscriptPanel elapsed={elapsed} total={total} title={st.title} lines={st.lines} onClose={() => setShowText(false)} /> : null}
      {dimmed ? (
        <button className="dimmer" aria-label={`Screen dimmed for sleep. ${fmt(total - elapsed)} left. Tap to wake.`} onClick={() => { setDimmed(false); setPoke((p) => p + 1); }}>
          <span style={{ opacity: 0.4 }}><Mo size={96} mood="sleepy" glow={false} /></span>
          <span className="tnum">{fmt(total - elapsed)} left · tap to wake</span>
        </button>
      ) : null}
    </div>
  );
}

function BgSheet({ value, onPick }) {
  const { closeSheet } = useApp();
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Background sound" sub="Plays softly under the story." />
      <OptionList label="Background sound" options={Object.keys(SOUNDS).map((k) => ({ value: k, label: k === 'Silence' ? 'None' : k }))} value={value} onChange={(v) => { onPick(v); closeSheet(); }} />
    </>
  );
}

/* ---------- Save a soundscape mix ---------- */
export function MixSheet({ edit }) {
  const { set, closeSheet, toast, dialog } = useApp();
  const [name, setName] = useState(edit ? edit.name : '');
  const [mix, setMix] = useState(edit ? { rain: edit.rain, forest: edit.forest, ocean: edit.ocean } : { rain: 50, forest: 20, ocean: 0 });
  const remove = () => dialog({
    title: `Delete “${edit.name}”?`, message: 'This soundscape will be removed from Sleep.',
    actions: [{ label: 'Cancel' }, { label: 'Delete', destructive: true, onPress: () => { set((prev) => ({ mixes: (prev.mixes || []).filter((m) => m.id !== edit.id) })); closeSheet(); toast('Soundscape deleted.'); } }]
  });
  const put = (k) => (v) => setMix({ ...mix, [k]: v });
  const fmtv = (v) => (v === 0 ? 'Off' : v + '%');
  const ok = name.trim().length > 0 && (mix.rain + mix.forest + mix.ocean) > 0;
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={edit ? 'Edit soundscape' : 'New soundscape'} sub="Blend sounds, name it, and play it any night." />
      <Field label="Name" value={name} onChange={setName} placeholder="e.g. Rainy cabin" />
      <div className="pressed col" style={{ gap: 18, marginTop: 18, padding: '18px 18px 14px', borderRadius: 26 }}>
        <Slider label="Rain" value={mix.rain} onChange={put('rain')} format={fmtv} />
        <Slider label="Forest" value={mix.forest} onChange={put('forest')} format={fmtv} />
        <Slider label="Ocean" value={mix.ocean} onChange={put('ocean')} format={fmtv} />
      </div>
      <button className="btn btn-primary press" style={{ marginTop: 16 }} disabled={!ok}
        onClick={() => {
          set((prev) => ({ mixes: edit ? (prev.mixes || []).map((m) => (m.id === edit.id ? { ...m, name: name.trim(), ...mix } : m)) : [...(prev.mixes || []), { id: 'm' + Date.now(), name: name.trim(), ...mix }] }));
          closeSheet(); toast(edit ? 'Soundscape updated.' : 'Saved. Mo will keep it in Sleep.');
        }}>
        {edit ? 'Save changes' : 'Save soundscape'}
      </button>
      {edit ? <button className="btn-text" style={{ marginTop: 4, alignSelf: 'center', color: 'var(--danger, #C2416B)' }} onClick={remove}>Delete soundscape</button> : null}
    </>
  );
}

function MixDots({ m }) {
  return (
    <span className="row" style={{ gap: 4 }} aria-hidden="true">
      {['rain', 'forest', 'ocean'].map((k) => m[k] > 0 ? <span key={k} style={{ width: 10, height: 10, borderRadius: '50%', background: SOUNDS[k[0].toUpperCase() + k.slice(1)], opacity: 0.4 + m[k] / 170 }} /> : null)}
    </span>
  );
}

/* ---------- Sleep tab ---------- */
export function SleepTab() {
  const { s, set, nav, sheet, toast } = useApp();
  const plus = s.user.plus;
  const tonight = STORIES[0];
  const mixes = s.mixes || [];
  const sleepProgram = findProgram('sleep7');
  const spDone = (s.programs || {}).sleep7 || 0;
  const openStory = (st) => (st.plus && !plus ? nav.push('paywall', { source: 'story', name: st.title }) : nav.push('story', { id: st.id }));
  const newMix = () => (mixes.length >= 1 && !plus ? nav.push('paywall', { source: 'mix' }) : sheet(<MixSheet />));
  const playMix = (m) => nav.push('player', { timer: true, minutes: 30, sound: m.name });
  return (
    <div className="pad-tabs">
      <h1 className="h1">Sleep</h1>
      <p className="lead" style={{ marginTop: 4 }}>Wind down with Mo. Everything here dims and fades on its own.</p>

      <button type="button" role="switch" aria-checked={!!s.windDown} className="raised press row"
        onClick={() => (!plus ? nav.push('paywall', { source: 'winddown' }) : (set({ windDown: !s.windDown }), toast(!s.windDown ? 'Mo will start your wind-down at 22:30.' : 'Wind-down turned off.')))}
        style={{ marginTop: 18, width: '100%', border: 0, borderRadius: 26, padding: '12px 16px 12px 6px', gap: 8, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <Mo size={72} mood="sleepy" glow={false} />
        <span className="col grow" style={{ gap: 3, minWidth: 0 }}>
          <span className="row" style={{ gap: 8 }}><span style={{ fontWeight: 800, fontSize: 16 }}>Wind-down at 22:30</span>{!plus ? <PlusTag /> : null}</span>
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>A reminder, 3 minutes of slow breathing, then a story. The screen dims by itself.</span>
        </span>
        <SwitchVisual on={!!s.windDown} />
      </button>

      <h2 className="label">Tonight’s story</h2>
      <button className="raised press" onClick={() => openStory(tonight)} style={{ width: '100%', border: 0, borderRadius: 30, padding: 10, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
        <span className="frame-in" style={{ display: 'block', height: 150, width: '100%', position: 'relative' }}>
          <img src={tonight.img} alt="" style={{ objectPosition: tonight.pos }} />
        </span>
        <span className="row" style={{ gap: 12, padding: '12px 8px 4px', width: '100%' }}>
          <span className="col grow" style={{ gap: 4, minWidth: 0 }}>
            <span className="row" style={{ gap: 8 }}><span className="tag tnum">{tonight.min} min</span><FreeTag /></span>
            <span style={{ fontSize: 19, fontWeight: 800 }}>{tonight.title}</span>
            <span className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>{tonight.blurb}</span>
          </span>
          <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--up-sm), var(--glow)' }}><Icon name="play" size={17} /></span>
        </span>
      </button>

      <h2 className="label">Sleep stories</h2>
      <div className="col" style={{ gap: 14 }}>
        {STORIES.slice(1).map((st) => (
          <button key={st.id} className="raised press row" onClick={() => openStory(st)} style={{ border: 0, borderRadius: 22, padding: 10, gap: 12, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
            <img src={st.img} alt="" style={{ width: 58, height: 58, borderRadius: 16, objectFit: 'cover', objectPosition: st.pos }} />
            <span className="col grow" style={{ minWidth: 0, gap: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{st.title}</span>
              <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{st.min} min · {st.narrator}</span>
            </span>
            {st.plus && !plus ? <PlusTag /> : <Icon name="play" size={15} style={{ color: 'var(--accent)' }} />}
          </button>
        ))}
      </div>

      <h2 className="label">Soundscapes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
        {[...PRESET_MIXES, ...mixes].map((m) => (
          <div key={m.id} style={{ position: 'relative', display: 'flex' }}>
            <button className="raised press col" onClick={() => playMix(m)} style={{ flex: 1, border: 0, borderRadius: 22, padding: '14px 14px 12px', gap: 8, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', minHeight: 92 }}>
              <MixDots m={m} />
              <span style={{ fontWeight: 800, fontSize: 15, paddingRight: m.preset ? 0 : 34 }}>{m.name}</span>
              <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{m.preset ? 'Built in' : 'Your mix'}</span>
            </button>
            {!m.preset ? <button className="press" aria-label={`Edit ${m.name}`} onClick={() => sheet(<MixSheet edit={m} />)}
              style={{ position: 'absolute', top: 2, right: 2, width: 48, height: 48, border: 0, background: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer' }}><Icon name="edit" size={17} /></button> : null}
          </div>
        ))}
        <button className="pressed press col" onClick={newMix} style={{ border: 0, borderRadius: 22, padding: 14, gap: 6, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent)', minHeight: 92, fontWeight: 800, fontSize: 14 }}>
          <Icon name="plus" size={20} sw={2.4} />New mix
          {mixes.length >= 1 && !plus ? <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Plus: unlimited</span> : <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{plus ? 'Unlimited' : '1 free mix'}</span>}
        </button>
      </div>

      <h2 className="label">Program for sleep</h2>
      <ProgramCard p={sleepProgram} done={spDone} wide />
    </div>
  );
}

/* ---------- Program card (Home + Sleep) ---------- */
export function ProgramCard({ p, done = 0, wide }) {
  const { s, nav } = useApp();
  const total = p.days.length;
  return (
    <button className="raised press" onClick={() => nav.push('program', { id: p.id })}
      style={{ flexShrink: 0, width: wide ? '100%' : 230, border: 0, borderRadius: 24, padding: 8, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      <img src={p.img} alt="" style={{ width: '100%', height: wide ? 120 : 96, objectFit: 'cover', borderRadius: 18, objectPosition: p.pos }} />
      <span className="row" style={{ gap: 6, margin: '10px 6px 0' }}><span className="tag tnum">{total} days</span>{p.plus && !s.user.plus ? <span className="tag">Day 1 free</span> : null}</span>
      <span style={{ display: 'block', margin: '8px 6px 0', fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>{p.title}</span>
      <span className="row" style={{ gap: 10, margin: '10px 6px 6px', width: 'calc(100% - 12px)' }}>
        <span className="track grow" style={{ height: 10, padding: 2 }}><span style={{ height: 6, width: (done / total) * 100 + '%' }} /></span>
        <span className="tnum muted" style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{done ? `${done}/${total}` : 'Start'}</span>
      </span>
    </button>
  );
}

export function ProgramsRow() {
  const { s } = useApp();
  const goal = s.goals.find((g) => GOAL_CAT[g] && GOAL_CAT[g] !== 'All') || s.goals[0];
  const sorted = [...PROGRAMS].sort((a, b) => (b.goal === goal) - (a.goal === goal));
  return (
    <>
      <div style={{ marginTop: 24 }}>
        <h2 className="h2" style={{ fontSize: 17 }}>Programs</h2>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600 }}>Short daily series with a clear goal. Day 1 is always free.</p>
      </div>
      <div className="hscroll">
        {sorted.map((p) => <ProgramCard key={p.id} p={p} done={(s.programs || {})[p.id] || 0} />)}
      </div>
    </>
  );
}

/* ---------- Mo's plan for today ---------- */
export function dailyPlan(s) {
  const h = new Date().getHours();
  const last = (s.moodLog || []).slice(-2);
  /* How you said you felt at today's check-in decides first. */
  const today = new Date().toISOString().slice(0, 10);
  const feel = (s.pre && Date.now() - s.pre.t < 6 * 3600e3 && s.pre.mood) || ((s.history || []).filter((e) => e.d === today && e.pre).slice(-1)[0] || {}).pre;
  if (feel === 'Stressed') return { kind: 'practice', id: h < 12 ? 'stop' : 'ground', reason: 'You said you felt stressed today. Let’s bring you back to the room.' };
  if (feel === 'Tired') return { kind: 'practice', id: 'body', reason: 'You said you felt tired. A slow body scan, no effort needed.' };
  if (last.some((e) => e.mood === 'Restless')) return { kind: 'practice', id: 'ground', reason: 'You felt restless after your last session. Grounding helps with that.' };
  if (last.some((e) => e.mood === 'Restless')) return { kind: 'session', id: 'calm5', reason: 'You felt restless recently. Five minutes to come back to yourself.' };
  const active = PROGRAMS.find((p) => { const d = (s.programs || {})[p.id] || 0; return d > 0 && d < p.days.length; });
  if (active) { const d = s.programs[active.id]; return { kind: 'program', id: active.id, title: `Day ${d + 1} · ${active.days[d].title}`, reason: `Next step in ${active.title}.` }; }
  if (h >= 20 || h < 5) return { kind: 'story', id: STORIES[0].id, reason: 'It’s late. A slow story to help you drift off.' };
  if (h < 12) return { kind: 'session', id: 'clear', reason: 'A short reset to start the day clearly.' };
  const goal = s.goals[0] || 'Just curious';
  return { kind: 'session', id: 'soften', reason: s.intention ? `A pause for your intention: “${s.intention}”.` : `A midday pause, because you chose “${goal}”.` };
}

export function PlanCard() {
  const { s, nav } = useApp();
  const plan = dailyPlan(s);
  const title = plan.kind === 'program' ? plan.title : plan.kind === 'story' ? findStory(plan.id).title : plan.kind === 'practice' ? findPractice(plan.id).name : findSession(plan.id).title;
  const go = () => (plan.kind === 'program' ? nav.push('program', { id: plan.id }) : plan.kind === 'story' ? nav.push('story', { id: plan.id }) : plan.kind === 'practice' ? nav.push('practice', { id: plan.id }) : nav.push('session', { id: plan.id }));
  return (
    <button className="raised press row" onClick={go} style={{ marginTop: 16, width: '100%', border: 0, borderRadius: 26, padding: '14px 14px', gap: 12, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
      <span className="pressed" style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}><Icon name={plan.kind === 'program' ? 'layers' : plan.kind === 'story' ? 'book' : plan.kind === 'practice' ? 'leaf' : 'sparkle'} size={22} /></span>
      <span className="col grow" style={{ gap: 3, minWidth: 0 }}>
        <span className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>Mo’s plan for today</span>
        <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>{title}</span>
        <span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>{plan.reason}</span>
      </span>
      <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="play" size={15} /></span>
    </button>
  );
}
