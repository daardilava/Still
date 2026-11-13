import React, { useEffect, useRef, useState } from 'react';
import { useApp, TopBar, Segment, OptionList, SheetTitle, SwitchRow } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { findSession, findProgram, UNLOCKS, JOURNEY, PATTERNS, customPattern, fmt, dayKey, daysBetween, weekKey, MOOD_COLORS } from '../data.js';
import { SoundsSheet, PaceSheet, TranscriptPanel } from './extras.jsx';
import { Spinner } from './onboarding.jsx';
import { CheckIn } from './insights.jsx';
import { QuietLabel, QuietNudge } from './quiet.jsx';
import { MoreSheet } from './more.jsx';
import { getTts } from '../ai.js';

/* ---------- Session detail ---------- */
export function Session({ id }) {
  const { s, set, nav, toast } = useApp();
  const ses = findSession(id) || findSession('unwind');
  const [len, setLen] = useState(ses.lengths.includes(s.defaultLen) ? s.defaultLen : ses.lengths[Math.min(1, ses.lengths.length - 1)]);
  const [dl, setDl] = useState(0);
  const saved = s.saved.includes(ses.id);
  const downloaded = s.downloads.includes(ses.id);
  const locked = ses.plus && !s.user.plus;
  const offlineBlocked = s.offline && !downloaded;
  const download = () => {
    if (locked) { nav.push('paywall', { source: 'download' }); return; }
    if (s.offline) { toast('You’re offline. Connect to download.'); return; }
    let p = 0;
    const t = setInterval(() => {
      p += 0.2; setDl(p);
      if (p >= 1) { clearInterval(t); setDl(0); set((prev) => ({ downloads: [...prev.downloads, ses.id] })); toast('Downloaded. Mo will keep it for offline.'); }
    }, 260);
  };
  return (
    <div className="pad">
      <TopBar right={
        <button className={'icon-btn press' + (saved ? ' on' : '')} aria-label={saved ? 'Remove from saved' : 'Save session'} aria-pressed={saved}
          onClick={() => { set({ saved: saved ? s.saved.filter((x) => x !== ses.id) : [...s.saved, ses.id] }); toast(saved ? 'Removed from saved.' : 'Saved to your profile.'); }}>
          <Icon name={saved ? 'bookmark-fill' : 'bookmark'} />
        </button>} />
      <div className="raised frame" style={{ marginTop: 18 }}>
        <div className="frame-in" style={{ height: 240 }}><img src={ses.img} alt="" style={{ objectPosition: ses.pos }} /></div>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
        <span className="tag">{ses.cat}</span><span className="tag">Guided</span>
        {downloaded ? <span className="tag"><Icon name="download" size={11} sw={2.6} />Offline</span> : null}
        {locked ? <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span> : null}
      </div>
      <h1 className="h1" style={{ marginTop: 12, fontSize: 28 }}>{ses.title}</h1>
      <p className="muted" style={{ margin: '4px 0 0', fontSize: 15 }}>Guided by [GUIDE NAME]</p>
      <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--body)' }}>{ses.desc}</p>
      {ses.lengths.length > 1 ? (
        <div style={{ marginTop: 18 }}>
          <Segment label="Session length" options={ses.lengths.map((m) => ({ value: m, label: m + ' min' }))} value={len} onChange={setLen} />
        </div>
      ) : null}
      <button className="btn btn-soft press" style={{ marginTop: 16, height: 52 }} onClick={downloaded ? () => nav.push('downloads') : download} disabled={dl > 0}>
        {dl > 0 ? <><Spinner /> Downloading {Math.round(dl * 100)}%</> : downloaded ? <><Icon name="check" sw={2.4} />Available offline</> : <><Icon name="download" />Download for offline</>}
      </button>
      <div className="grow" style={{ minHeight: 16 }} />
      {offlineBlocked ? <p className="muted" style={{ textAlign: 'center', fontSize: 13, margin: '0 0 10px' }} role="status">You’re offline and this session isn’t downloaded.</p> : null}
      <button className="btn btn-primary press" disabled={offlineBlocked}
        onClick={() => (locked ? nav.push('paywall', { source: 'session' }) : nav.push('player', { id: ses.id, minutes: len }))}>
        {locked ? <><Icon name="lock" sw={2.2} />Unlock with Plus</> : <><Icon name="play" size={16} />Begin · {len} min</>}
      </button>
      {!locked ? <QuietNudge /> : null}
    </div>
  );
}

/* ---------- Sheets used by the player ---------- */
export function SleepSheet({ value, onPick, options = ['Off', 'End of session', '15 minutes', '30 minutes', '45 minutes'] }) {
  const { closeSheet } = useApp();
  const [v, setV] = useState(value);
  const [fade, setFade] = useState(true);
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Sleep timer" sub="Audio fades out, then stops." />
      <OptionList label="Stop playing after" options={options} value={v} onChange={setV} />
      <div style={{ marginTop: 10 }}><SwitchRow title="Fade out gently" on={fade} onChange={setFade} /></div>
      <button className="btn btn-primary press" style={{ marginTop: 10 }} onClick={() => { onPick(v); closeSheet(); }}>{v === 'Off' ? 'Done' : 'Set timer'}</button>
    </>
  );
}

function OutputSheet() {
  const { closeSheet, platform, toast } = useApp();
  const [v, setV] = useState('This phone');
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={platform === 'ios' ? 'AirPlay' : 'Play on'} sub="Choose where the audio plays." />
      <OptionList label="Audio output" options={['This phone', 'Headphones', '[SPEAKER NAME]']} value={v} onChange={(x) => { setV(x); toast('Playing on ' + x + '.'); setTimeout(closeSheet, 250); }} />
    </>
  );
}

/* ---------- Player ---------- */
export function Player({ id, minutes = 12, timer = false, sound = 'Silence', onboarding = false, startAt = 0 }) {
  const { s, set, nav, sheet, dialog, toast, platform, speed } = useApp();
  const ses = timer ? null : findSession(id) || findSession('unwind');
  const total = minutes * 60;
  const [elapsed, setElapsed] = useState(Math.min(startAt, total - 1));
  /* One-tap mood check-in before guided sessions; playback waits for it. */
  const [asking, setAsking] = useState(!onboarding && !timer && s.checkIn !== false && !startAt);
  const [playing, setPlaying] = useState(!asking);
  const answer = (mood) => { set({ pre: mood ? { mood, t: Date.now() } : null }); setAsking(false); setPlaying(true); setPoke((p) => p + 1); };

  /* Personal sessions: Mo reads each paragraph aloud when its moment comes (Claude voice when the page runs in Claude). */
  const lines = ses && ses.lines ? ses.lines : null;
  const wantVoice = !!lines && s.moVoice !== false;
  const ttsRef = useRef(null);
  const spokenRef = useRef(-1);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  useEffect(() => {
    if (!wantVoice) return;
    let off = false;
    getTts().then((t) => { if (!off && t) { ttsRef.current = t; setVoiceOn(true); } });
    return () => { off = true; if (ttsRef.current) ttsRef.current.stop().catch(() => {}); };
  }, [wantVoice]);
  const [sleepTimer, setSleepTimer] = useState('Off');
  const fixed = ses && ses.pattern === 'box';
  const pattern = fixed ? PATTERNS.box : s.pace === 'custom' ? customPattern(s.customPace) : PATTERNS[s.pace] || PATTERNS.calm;
  const patKey = fixed ? 'box' : s.pace + JSON.stringify(s.customPace);
  const [phase, setPhase] = useState(0);
  const [showText, setShowText] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [poke, setPoke] = useState(0);
  useEffect(() => { setPhase(0); }, [patKey]);
  const [cycles, setCycles] = useState(0);
  const doneRef = useRef(false);
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  /* In the native app the audio position is the clock; here one tick per second stands in for it. */
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed((e) => Math.min(total, e + 1)), 1000 / speed);
    return () => clearInterval(t);
  }, [playing, speed, total]);

  useEffect(() => {
    if (!playing || timer) return;
    const t = setTimeout(() => {
      const next = (phase + 1) % pattern.length;
      if (next === 0) setCycles((c) => c + 1);
      setPhase(next);
    }, pattern[phase % pattern.length][1] / Math.min(speed, 4));
    return () => clearTimeout(t);
  }, [phase, playing, timer, speed, patKey]);

  const finish = (sec) => {
    doneRef.current = true;
    nav.replace('complete', { id, minutes, timer, sound, onboarding, elapsedSec: sec, token: Date.now() });
  };
  useEffect(() => { if (elapsed >= total && !doneRef.current) finish(total); }, [elapsed]);
  useEffect(() => {
    const t = ttsRef.current;
    if (!t || !lines || !playing || asking || voiceBlocked) return;
    const idx = Math.min(lines.length - 1, Math.floor((elapsed / total) * lines.length));
    if (idx <= spokenRef.current) return;
    spokenRef.current = idx;
    const line = { text: lines[idx], voice: 'airy', rate: 0.85, language: 'en' };
    (t.active() ? t.add([line]) : t.speak([line])).catch((e) => { if (e && (e.code === 'no_gesture' || e.code === 'not_granted')) { setVoiceBlocked(e.code); spokenRef.current = idx - 1; } });
  }, [elapsed, playing, asking, voiceOn, voiceBlocked]);
  useEffect(() => { const t = ttsRef.current; if (!t) return; (playing ? t.resume() : t.pause()).catch(() => {}); }, [playing]);

  const end = () => dialog({
    title: 'End session early?', message: elapsed >= 60 ? 'Mo will still count the minutes you’ve done.' : 'Sessions count toward your streak after one minute.',
    actions: [{ label: 'Keep going', bold: true }, { label: 'End', destructive: true, onPress: () => finish(elapsedRef.current) }]
  });
  const quit = () => {
    if (onboarding || timer || elapsed <= 5) { nav.back(); return; }
    dialog({
      title: 'Leave this session?', message: 'Mo will save your place so you can continue from Home.',
      actions: [{ label: 'Stay', bold: true }, { label: 'Leave', onPress: () => { set({ resume: { id, minutes, elapsed: elapsedRef.current } }); nav.back(); toast('Saved. Continue any time from Home.'); } }]
    });
  };

  const [cue, dur, kind] = timer ? [playing ? 'Just sit' : 'Paused', 4000, null] : pattern[phase % pattern.length];
  /* Screen readers hear the cues for the first cycle only, then the rhythm continues quietly. */
  const announce = !playing ? 'Paused' : timer ? '' : cycles < 1 ? cue : cycles === 1 && phase === 0 ? 'Mo will keep the rhythm quietly now.' : '';
  const circ = 2 * Math.PI * 136;
  const pct = elapsed / total;
  const ang = pct * 2 * Math.PI;
  const kx = 150 + 136 * Math.sin(ang), ky = 150 - 136 * Math.cos(ang);
  const saved = ses && s.saved.includes(ses.id);
  const sleepy = (ses && ses.cat === 'Sleep') || sleepTimer !== 'Off';
  /* Sleep mode: in sleep sessions the screen dims itself after a short while without touches. */
  const autoDim = s.autoDim && playing && sleepy && !showText;
  useEffect(() => {
    if (!autoDim || dimmed) return;
    const t = setTimeout(() => setDimmed(true), 12000 / Math.min(speed, 4));
    return () => clearTimeout(t);
  }, [autoDim, poke, dimmed, speed]);
  return (
    <div className="pad" style={{ alignItems: 'center' }} onPointerDown={() => setPoke((p) => p + 1)} onKeyDown={() => setPoke((p) => p + 1)}>
      <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
        <button className="icon-btn press" aria-label="Close player" onClick={quit}><Icon name={platform === 'ios' ? 'down' : 'back_android'} sw={2.2} /></button>
        <QuietLabel text={timer ? 'Silent timer' : onboarding ? 'Your first session' : 'Now playing'} />
        {ses && !onboarding ? (
          <button className={'icon-btn press' + (saved ? ' on' : '')} aria-label={saved ? 'Remove from saved' : 'Save session'} aria-pressed={!!saved}
            onClick={() => set({ saved: saved ? s.saved.filter((x) => x !== ses.id) : [...s.saved, ses.id] })}><Icon name={saved ? 'heart-fill' : 'heart'} /></button>
        ) : <span style={{ width: 48 }} />}
      </div>

      <div className="raised" style={{ marginTop: 22, width: 300, height: 300, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="150" cy="150" r="136" fill="none" stroke="var(--muted)" strokeOpacity=".18" strokeWidth="6" />
          <circle cx="150" cy="150" r="136" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} transform="rotate(-90 150 150)" style={{ transition: 'stroke-dasharray 1s linear' }} />
          <circle cx={kx} cy={ky} r="9" fill="#fff" stroke="var(--primary)" strokeWidth="4" />
        </svg>
        <div className="pressed" style={{ width: 236, height: 236, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Mo size={196} mood={timer ? (playing ? 'calm' : 'sleepy') : playing ? (sleepy && pct > 0.6 ? 'sleepy' : 'breathe') : 'calm'}
            breath={!timer && playing ? kind : timer && playing ? (Math.floor(elapsed / 5) % 2 ? 'out' : 'in') : null} breathMs={timer ? 5000 : dur / Math.min(speed, 4)} />
        </div>
      </div>

      <p aria-hidden="true" style={{ margin: '20px 0 0', fontSize: 26, fontWeight: 800, color: 'var(--accent)', minHeight: 32 }}>{playing ? cue + (timer ? '' : '…') : 'Paused'}</p>
      <span className="sr-only" aria-live="polite">{announce}</span>
      <h1 style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>{timer ? `${minutes}-minute timer · ${sound}` : ses.title}</h1>
      <div className="row tnum" role="timer" aria-label={`${fmt(elapsed)} of ${fmt(total)}`} style={{ gap: 8, marginTop: 6, fontSize: 14, fontWeight: 800, color: 'var(--muted)' }}>
        <span className="accent">{fmt(elapsed)}</span><span aria-hidden="true">/</span><span>{fmt(total)}</span>
        {sleepTimer !== 'Off' ? <span className="tag" style={{ marginLeft: 6 }}><Icon name="moon" size={11} sw={2.4} />{sleepTimer}</span> : null}
      </div>

      {voiceBlocked === 'no_gesture' ? (
        <button className="chip press on" style={{ marginTop: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setVoiceBlocked(false)}><Icon name="speaker" size={15} />Hear Mo read it</button>
      ) : lines && voiceOn && s.moVoice !== false ? <span className="tag" style={{ marginTop: 12 }}><Icon name="speaker" size={11} sw={2.4} />Mo is reading</span> : null}

      <div className="row ctrls" style={{ width: '100%', justifyContent: 'space-between', marginTop: 20, padding: '0 6px' }}>
        <button className={'icon-btn press ctrl-skip' + (sleepTimer !== 'Off' || showText ? ' on' : '')} style={{ width: 56, height: 56, color: 'var(--accent)' }} aria-label="More controls" aria-haspopup="dialog"
          onClick={() => sheet(<MoreSheet title={timer ? 'Timer controls' : 'Session controls'} items={[
            { icon: 'wave', label: 'Sounds', onClick: () => sheet(<SoundsSheet timer={timer} />) },
            timer ? { icon: 'moon', label: 'Dim now', onClick: () => setDimmed(true) } : { icon: 'doc', label: 'Read along', on: showText, onClick: () => setShowText(true) },
            { icon: 'pulse', label: 'Pace', disabled: timer || fixed || !!lines, onClick: () => (timer ? toast('The silent timer has no breathing guide.') : lines ? toast('Mo sets the pace in personal sessions.') : fixed ? toast('Box Breathing always uses the 4 · 4 · 4 · 4 rhythm.') : sheet(<PaceSheet />)) },
            { icon: 'clock', label: 'Sleep timer', value: sleepTimer !== 'Off' ? sleepTimer : null, onClick: () => sheet(<SleepSheet value={sleepTimer} onPick={setSleepTimer} />) },
            { icon: 'rew', label: 'Back 15 s', keep: true, onClick: () => setElapsed((e) => Math.max(0, e - 15)) },
            { icon: 'fwd', label: 'Forward 15 s', keep: true, onClick: () => setElapsed((e) => Math.min(total, e + 15)) },
            { icon: 'speaker', label: 'Audio output', onClick: () => sheet(<OutputSheet />) }
          ]} />)}><Icon name="more" size={24} sw={3.4} /></button>
        <button className="btn press ctrl-play" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}
          style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', boxShadow: 'var(--up), var(--glow)' }}>
          <Icon name={playing ? 'pause' : 'play'} size={30} />
        </button>
        <button className="icon-btn press ctrl-skip" style={{ width: 56, height: 56 }} aria-label="End session" onClick={end}><Icon name="close" size={22} sw={2.2} /></button>
      </div>
      <div className="grow" style={{ minHeight: 16 }} />
      {asking ? <CheckIn onPick={answer} onSkip={() => answer(null)} /> : null}
      {showText ? <TranscriptPanel elapsed={elapsed} total={total} title={ses ? ses.title : ''} lines={lines || undefined} onClose={() => setShowText(false)} /> : null}
      {dimmed ? (
        <button className="dimmer" aria-label={`Screen dimmed for sleep. ${fmt(total - elapsed)} left. Tap to wake.`} onClick={() => { setDimmed(false); setPoke((p) => p + 1); }}>
          <span style={{ opacity: 0.4 }}><Mo size={96} mood="sleepy" glow={false} /></span>
          <span className="tnum">{fmt(total - elapsed)} left · tap to wake</span>
        </button>
      ) : null}
    </div>
  );
}

/* ---------- Streak rules ----------
   - A session counts once it reaches 60 seconds.
   - Same day: no change. Next day: +1.
   - One missed day per week is covered by a rest day, so the streak keeps going.
   - Otherwise the streak starts again at 1; total minutes are never lost. */
export function nextStreak(s, now = new Date()) {
  const today = dayKey(now);
  if (s.lastDone === today) return { streak: Math.max(1, s.streak), note: 'Already counted today. Nice to see you again.' };
  if (!s.lastDone) return { streak: s.streak + 1, note: s.streak ? 'Mo is glowing a little brighter.' : 'Day one. Mo is glowing.' };
  const gap = daysBetween(s.lastDone, today);
  if (gap <= 1) return { streak: s.streak + 1, note: 'Mo is glowing a little brighter.' };
  if (gap === 2 && s.restWeek !== weekKey(now)) return { streak: s.streak + 1, note: 'Mo used this week’s rest day, so your streak is safe.', restWeek: weekKey(now) };
  return { streak: 1, note: 'A fresh start. Your total minutes are all still here.' };
}

const CONFETTI = ['#FFD27A', '#F4A6C6', '#A98BFF', '#5DBB8A', '#8C7BE0'];

/* ---------- Session complete ---------- */
export function Complete({ id, minutes = 12, timer, sound, onboarding = false, elapsedSec, token = 0 }) {
  const { s, set, nav, haptic, dialog, toast, platform } = useApp();
  const ses = timer ? null : findSession(id);
  const prog = ses && ses.programId ? findProgram(ses.programId) : null;
  const sec = elapsedSec == null ? minutes * 60 : elapsedSec;
  const counted = sec >= 60;
  const mins = Math.max(1, Math.round(sec / 60));
  const [mood, setMood] = useState(null);
  const logged = useRef(false);
  /* token guards against counting twice if this screen is shown again (e.g. after Back from Support). */
  const repeat = !!token && s.lastCompletion === token;
  const [res] = useState(() => (counted ? (repeat ? s.lastResult : nextStreak(s)) : null));
  /* Each counted session is one step on Mo's journey; some steps arrive somewhere new. */
  const [place] = useState(() => (counted ? JOURNEY.find((p) => (repeat ? s.lastPlace === p.id : p.steps === (s.sessionsDone || 0) + 1)) : null) || null);
  /* A streak milestone reached for the first time unlocks something for Mo to wear. */
  const [unlock] = useState(() => (res && !onboarding ? UNLOCKS.find((u) => u.days === res.streak && (repeat ? s.lastUnlock === u.id : (s.bestStreak || 0) < u.days)) : null) || null);

  useEffect(() => {
    if (!counted || repeat) return;
    const di = (new Date().getDay() + 6) % 7;
    set((prev) => {
      const week = [...prev.week]; week[di] = (week[di] || 0) + mins;
      return {
        streak: res.streak, lastDone: dayKey(), lastCompletion: token, lastResult: res, restWeek: res.restWeek || prev.restWeek,
        monthMin: prev.monthMin + mins, totalMin: Math.max(prev.totalMin || 0, prev.monthMin) + mins, sessionsDone: prev.sessionsDone + 1, week, resume: null,
        bestStreak: Math.max(prev.bestStreak || 0, res.streak), lastUnlock: unlock ? unlock.id : null, lastPlace: place ? place.id : null, pre: null,
        history: [...(prev.history || []), { d: dayKey(), hour: new Date().getHours(), min: mins, pre: prev.pre && Date.now() - prev.pre.t < 3 * 3600e3 ? prev.pre.mood : null, post: null }].slice(-120),
        ...(ses && ses.programId ? { programs: { ...(prev.programs || {}), [ses.programId]: Math.max((prev.programs || {})[ses.programId] || 0, ses.day) } } : {}),
        recent: ses && ses.id !== 'first' && !ses.programId && !ses.story && !ses.practice && !ses.ai ? [{ id: ses.id, when: 'Today', min: mins }, ...prev.recent.filter((r) => r.id !== ses.id)].slice(0, 6) : prev.recent
      };
    });
    haptic('success');
  }, []);

  const pickMood = (m) => {
    setMood(m); haptic('select');
    const entry = { d: dayKey(), mood: m, hour: new Date().getHours() };
    set((prev) => {
      const log = [...prev.moodLog];
      if (logged.current) log[log.length - 1] = entry; else log.push(entry);
      const history = [...(prev.history || [])];
      if (history.length) history[history.length - 1] = { ...history[history.length - 1], post: m };
      return { moodLog: log.slice(-60), history };
    });
    logged.current = true;
    /* Ask for a store rating at a good moment: felt calmer, after a few sessions, only once. */
    if (m === 'Calmer' && !s.askedReview && s.sessionsDone >= 3 && !onboarding) {
      set({ askedReview: true });
      setTimeout(() => dialog({
        title: 'Enjoying Still?', message: `Tap to rate it on ${platform === 'ios' ? 'the App Store' : 'Google Play'}. This is where the system rating prompt appears.`,
        actions: [{ label: 'Not Now' }, { label: '★★★★★', bold: true, onPress: () => toast('Thank you! Mo is blushing.') }]
      }), 700);
    }
  };

  if (!counted) {
    return (
      <div className="pad" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div className="grow" />
        <div className="raised" style={{ width: 220, height: 220, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mo size={170} mood="calm" /></div>
        <h1 className="h1" style={{ marginTop: 26 }}>Every breath counts</h1>
        <p className="lead">That was {sec} {sec === 1 ? 'second' : 'seconds'}. Sessions count toward your streak after one minute, but the pause still did you good.</p>
        <div className="grow" />
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <button className="btn btn-soft press" style={{ color: 'var(--accent)' }} onClick={() => (ses && ses.story ? nav.replace('story', { id: id.slice(6) }) : ses && ses.practice ? nav.replace('practice', { id: ses.practice }) : nav.replace('player', { id, minutes, timer, sound, onboarding }))}>Try again</button>
          <button className="btn btn-primary press" onClick={() => (onboarding ? nav.replace('account') : nav.reset('tabs'))}>{onboarding ? 'Continue' : 'Done'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pad" style={{ alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="confetti" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 22 }).map((_, i) => (
          <i key={i} style={{ left: (i * 17) % 100 + '%', background: CONFETTI[i % CONFETTI.length], animationDelay: (i % 7) * 0.12 + 's', transform: `rotate(${i * 30}deg)` }} />
        ))}
      </div>
      <div className="row" style={{ width: '100%', justifyContent: 'flex-end', minHeight: 48 }}>
        {!onboarding ? <button className="icon-btn press" aria-label="Close" onClick={() => nav.reset('tabs')}><Icon name="close" size={16} sw={2.4} /></button> : null}
      </div>
      <div className="raised" style={{ width: 220, height: 220, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        <Mo size={176} mood="happy" enter wear={unlock ? unlock.id : undefined} />
      </div>
      <h1 className="h1" style={{ marginTop: 20 }}>{onboarding ? 'You did it' : 'Well done'}</h1>
      <p className="lead" style={{ textAlign: 'center' }}>{ses ? ses.title : sound === 'Silence' || !sound ? 'Silent timer' : `Timer · ${sound}`} · {mins} min</p>
      {s.healthSync ? <p className="muted" role="status" style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700 }}><Icon name="heart" size={13} sw={2.4} style={{ verticalAlign: '-2px', color: 'var(--accent)' }} /> {mins} mindful {mins === 1 ? 'minute' : 'minutes'} saved to {platform === 'ios' ? 'Apple Health' : 'Health Connect'}</p> : null}
      <div className="raised" style={{ width: '100%', marginTop: 18, padding: '14px 18px', borderRadius: 24 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="tnum accent" style={{ fontSize: 26, fontWeight: 800 }}>{res.streak} {res.streak === 1 ? 'day' : 'days'}</span>
          <span role="img" aria-label={`${Math.min(res.streak, 7)} of 7 days this week`} className="row" style={{ gap: 6 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', ...(i < Math.min(res.streak, 7) ? { background: 'var(--primary)' } : { boxShadow: 'var(--down-sm)' }) }} />
            ))}
          </span>
        </div>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600 }}>{res.note}</p>
      </div>
      {unlock ? (
        <div className="pressed row" role="status" style={{ width: '100%', marginTop: 14, padding: '10px 10px 10px 14px', borderRadius: 20, gap: 10 }}>
          <Icon name="sparkle" size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span className="grow" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: 'var(--body)' }}>{unlock.days}-day streak! Mo unlocked the <b style={{ color: 'var(--ink)' }}>{unlock.name.toLowerCase()}</b>.</span>
          {s.moWear === unlock.id ? <span className="tag">Wearing</span> : <button className="chip press on" style={{ fontSize: 13, flexShrink: 0 }} onClick={() => { set({ moWear: unlock.id }); haptic('select'); }}>Put it on</button>}
        </div>
      ) : null}
      <p style={{ alignSelf: 'flex-start', margin: '18px 0 12px', fontSize: 15, fontWeight: 800 }}>How do you feel now?</p>
      <div role="radiogroup" aria-label="How do you feel now" style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
        {Object.keys(MOOD_COLORS).map((m) => {
          const on = mood === m;
          return (
            <button key={m} type="button" role="radio" aria-checked={on} onClick={() => pickMood(m)} className="press"
              style={{ minHeight: 76, padding: '10px 4px', borderRadius: 20, border: 0, background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)', cursor: 'pointer' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: MOOD_COLORS[m] }} />{m}
            </button>
          );
        })}
      </div>
      {mood === 'Restless' ? (
        <button className="btn-text" style={{ marginTop: 8 }} onClick={() => nav.push('support')}>Feeling restless is okay. Need more support?</button>
      ) : mood ? <p className="muted" role="status" style={{ fontSize: 13, margin: '12px 0 0' }}>Thanks. Mo noted that you feel {mood.toLowerCase()}.</p> : null}
      {place ? (
        <div className="pressed row" role="status" style={{ width: '100%', marginTop: 14, padding: '10px 10px 10px 14px', borderRadius: 20, gap: 10 }}>
          <Icon name={place.icon} size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span className="grow" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: 'var(--body)' }}>Mo reached <b style={{ color: 'var(--ink)' }}>{place.name}</b>. A new chapter of your story is ready.</span>
          {!onboarding ? <button className="chip press on" style={{ fontSize: 13, flexShrink: 0 }} onClick={() => { set({ tab: 'home' }); nav.reset('tabs'); nav.push('journey', { open: place.id }); }}>Read</button> : null}
        </div>
      ) : null}
      {prog ? (
        <div className="pressed row" role="status" style={{ width: '100%', marginTop: 14, padding: '12px 14px', borderRadius: 20, gap: 12 }}>
          <Icon name="layers" size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: 'var(--body)' }}>
            {ses.day >= prog.days.length ? `${prog.title} complete. Mo is proud of you.` : `Day ${ses.day} of ${prog.days.length} done. Day ${ses.day + 1} is ready${prog.plus && !s.user.plus ? ' with Still Plus' : ' tomorrow, or whenever you are'}.`}
          </span>
        </div>
      ) : null}
      <div className="grow" style={{ minHeight: 16 }} />
      {onboarding ? (
        <>
          <button className="btn btn-primary press" onClick={() => nav.replace('account')}>Save my progress</button>
          <button className="btn-text" style={{ marginTop: 4 }} onClick={() => nav.replace('reminder', { mode: 'onboarding' })}>Continue as guest</button>
        </>
      ) : (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
          <button className="btn btn-soft press" style={{ color: 'var(--accent)' }} onClick={() => { set({ tab: 'profile' }); nav.reset('tabs'); }}>Progress</button>
          {prog ? <button className="btn btn-primary press" onClick={() => { set({ tab: 'home' }); nav.reset('tabs'); nav.push('program', { id: prog.id }); }}>Back to program</button>
            : <button className="btn btn-primary press" onClick={() => { set({ tab: ses && ses.story ? 'sleep' : 'home' }); nav.reset('tabs'); }}>Done</button>}
        </div>
      )}
    </div>
  );
}
