import React, { useEffect, useState } from 'react';
import { useApp, TopBar, SheetTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { UNLOCKS, JOURNEY, placeIndex, factsOf } from '../data.js';
import { CollectionSheet, computeInsights } from './insights.jsx';
import { Milestones } from './profile.jsx';
import { MoodTrend } from './tabs.jsx';
import { getSample, getTts, writeParas } from '../ai.js';

const monthKey = () => new Date().toISOString().slice(0, 7);
const monthName = () => new Date().toLocaleString('en', { month: 'long' });
const SLOT = ['in the morning', 'in the afternoon', 'in the evening', 'late at night'];

function letterData(s) {
  const I = computeInsights(s.history || []);
  const slot = I.mins.some((m) => m) ? SLOT[I.mins.indexOf(Math.max(...I.mins))] : null;
  return {
    name: s.user.name, month: monthName(), minutes: s.monthMin, sessions: s.sessionsDone,
    streak: s.streak, best: Math.max(s.bestStreak || 0, s.streak || 0), slot,
    eased: I.hard ? `${I.eased} of ${I.hard}` : null, top: I.top, intention: s.intention,
    facts: factsOf(s), place: JOURNEY[placeIndex(s.sessionsDone || 0)].name,
    programs: Object.keys(s.programs || {}).length
  };
}

function templateLetter(d) {
  const hi = d.name ? `Dear ${d.name},` : 'Dear you,';
  return [
    `${hi} it’s Mo. ${d.month} is nearly ${new Date().getDate() > 20 ? 'over' : 'halfway'}, and I wanted to write down what I’ve noticed before I forget (I have a very small head).`,
    d.minutes ? `You spent ${d.minutes} quiet minutes with me this month${d.slot ? `, mostly ${d.slot}` : ''}.${d.eased ? ` On the days you started stressed or tired, you finished calmer ${d.eased} times.` : ''} That isn’t nothing. That’s you, choosing yourself.` : 'We haven’t sat together much yet this month, and that’s okay. I’m not going anywhere.',
    d.intention ? `You told me you’re here to “${d.intention.replace(/\.$/, '')}”. I think about that on the path. We’re at ${d.place} now, and it suits you.` : `We’re at ${d.place} now. Next month, tell me why you’re here, and I’ll carry it for you.`,
    'See you tomorrow, or whenever you’re ready. — Mo'
  ];
}

export function LetterSheet() {
  const { s, set, closeSheet } = useApp();
  const key = monthKey();
  const cached = (s.letters || {})[key];
  const [paras, setParas] = useState(cached || null);
  const [writing, setWriting] = useState(false);
  const [tts, setTts] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { getTts().then((t) => { setTts(t); if (t) t.onState(({ state }) => setSpeaking(state !== 'idle')); }); }, []);
  useEffect(() => () => { if (tts) tts.stop().catch(() => {}); }, [tts]);
  useEffect(() => {
    if (cached) return;
    let off = false;
    const ctl = new AbortController();
    const d = letterData(s);
    const fallback = templateLetter(d);
    (async () => {
      const sample = s.aiSim ? null : await getSample();
      if (off) return;
      if (!sample) { setParas(fallback); return; }
      setWriting(true);
      const prompt = `You are Mo, a small, gentle piece of the moon and the mascot of the meditation app "Still". Write this month's short letter to the person you meditate with.

Use only these true facts (leave out anything empty, never invent numbers):
${JSON.stringify(d, null, 1)}

Write in English, warm, a little playful, never preachy. 3–4 short paragraphs separated by a blank line; plain text, no headings or lists or emojis. Start with "Dear ${d.name || 'you'}," and end with a line signed "— Mo". Notice one real pattern from the facts and gently suggest one small thing for next month. No medical or therapy claims.`;
      try {
        const r = await writeParas({ prompt, fallback, signal: ctl.signal, onParas: (x) => !off && setParas(x) });
        if (off) return;
        setParas(r.paras); setWriting(false);
        if (r.source === 'claude') set((prev) => ({ letters: { ...(prev.letters || {}), [key]: r.paras } }));
      } catch (e) { if (!off) { setParas(fallback); setWriting(false); } }
    })();
    return () => { off = true; ctl.abort(); };
  }, []);
  const read = () => {
    if (!tts || !paras) return;
    if (speaking) { tts.stop().catch(() => {}); return; }
    tts.speak(paras.map((t) => ({ text: t, voice: 'airy', rate: 0.9, language: 'en' }))).catch(() => {});
  };
  const shown = paras || [];
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={`A letter from Mo`} sub={`${monthName()} ${new Date().getFullYear()}`} />
      <div className="paper" style={{ marginTop: 4, padding: '20px 20px 18px', borderRadius: 24, position: 'relative' }} aria-busy={writing}>
        <span style={{ position: 'absolute', right: 12, bottom: -24 }}><Mo size={60} mood="happy" glow={false} /></span>
        {!shown.length ? <p className="muted row" style={{ margin: 0, gap: 8, fontSize: 15, fontWeight: 700 }}><span className="spin" aria-hidden="true" />Mo is writing to you…</p> : null}
        <div className="col" style={{ gap: 12 }}>
          {shown.map((t, k) => <p key={k} className="bubble-in" style={{ margin: 0, fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>{t}</p>)}
        </div>
      </div>
      {cached || (writing && shown.length) ? <span className="tag" style={{ alignSelf: 'flex-start', marginTop: 16 }}><Icon name="sparkle" size={11} sw={2.4} />Written by Mo with AI, from your own data</span> : null}
      {tts && shown.length && !writing ? (
        <button className="btn btn-soft press" style={{ marginTop: 14, color: 'var(--accent)' }} onClick={read}><Icon name={speaking ? 'pause' : 'speaker'} size={18} />{speaking ? 'Stop reading' : 'Read it to me'}</button>
      ) : null}
      <button className="btn btn-primary press" style={{ marginTop: 12 }} onClick={closeSheet}>Close</button>
    </>
  );
}

export function Progress() {
  const { s, nav, sheet } = useApp();
  const tile = { border: 0, borderRadius: 22, padding: '14px 16px', gap: 6, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' };
  return (
    <div className="pad">
      <TopBar title="Your progress" />
      <button className="raised press row" onClick={() => sheet(<LetterSheet />)} style={{ marginTop: 18, width: '100%', border: 0, borderRadius: 26, padding: '12px 16px 12px 8px', gap: 10, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <Mo size={74} mood="wink" glow={false} />
        <span className="col grow" style={{ gap: 3, minWidth: 0 }}>
          <span className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>{monthName()}</span>
          <span style={{ fontWeight: 800, fontSize: 17 }}>A letter from Mo</span>
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>{(s.letters || {})[monthKey()] ? 'Read it again' : 'Mo wrote down what it noticed this month'}</span>
        </span>
        <Icon name="mail" size={20} style={{ color: 'var(--accent)' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, marginTop: 18 }}>
        <button className="raised press col" style={tile} onClick={() => nav.push('insights')}>
          <span className="row" style={{ gap: 8, width: '100%', justifyContent: 'space-between' }}><Icon name="target" size={22} style={{ color: 'var(--accent)' }} />{!s.user.plus ? <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span> : null}</span>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Insights</span>
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>What works best for you</span>
        </button>
        <button className="raised press col" style={tile} onClick={() => sheet(<CollectionSheet />)}>
          <Icon name="sparkle" size={22} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Mo’s collection</span>
          <span className="muted tnum" style={{ fontSize: 13, lineHeight: 1.35 }}>{UNLOCKS.filter((u) => Math.max(s.bestStreak || 0, s.streak) >= u.days).length} of {UNLOCKS.length} unlocked</span>
        </button>
      </div>
      <Milestones />
      <h2 className="label">How you feel after sessions</h2>
      <MoodTrend log={s.moodLog || []} />
    </div>
  );
}
