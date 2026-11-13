import React, { useEffect, useRef, useState } from 'react';
import { useApp, TopBar, SheetTitle, SwitchRow, OptionList } from '../ui.jsx';
import { getSample, writeParas, STORY_RULES } from '../ai.js';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { QuietLabel } from './quiet.jsx';
import { JOURNEY, placeIndex, chapter, todaysQuestion, factsOf, dayKey, fmt } from '../data.js';

const grad = (p) => `linear-gradient(150deg,${p.colors[0]},${p.colors[1]})`;
const onGrad = (p) => (p.id === 'peak' ? '#fff' : '#2A1E52');

/* ---------- Chapter (bottom sheet) ---------- */
export function ChapterSheet({ id }) {
  const { s, set, closeSheet } = useApp();
  const i = JOURNEY.findIndex((p) => p.id === id), p = JOURNEY[i];
  const [title, outline] = chapter(id, s, factsOf(s));
  const cached = (s.aiChapters || {})[id];
  const [paras, setParas] = useState(cached || null);
  const [writing, setWriting] = useState(false);
  useEffect(() => { set((prev) => ((prev.readChapters || []).includes(id) ? {} : { readChapters: [...(prev.readChapters || []), id] })); }, [id]);
  /* Mo writes the chapter for this person with AI (once, then it's kept); otherwise the built-in story is used. */
  useEffect(() => {
    if (cached) return;
    let off = false;
    const ctl = new AbortController();
    (async () => {
      const sample = s.aiSim ? null : await getSample();
      if (off) return;
      if (!sample) { setParas(outline); return; }
      setWriting(true);
      const prompt = `You are Mo, a small piece of the moon who came down to earth to learn how to be still, and the mascot of the meditation app "Still". You are writing chapter ${i + 1} of ${JOURNEY.length}, "${title}", of the story of your journey with this person. This chapter takes place at ${p.name}, where you both find a keepsake: ${p.keepsake}.

Keep these plot beats, but make them vivid and personal:
${outline.map((x) => '- ' + x).join('\n')}

True details about the person (use only these, never invent others):
- Name: ${s.user.name || 'not given (say "you")'}
- Intention: ${s.intention || 'not given'}
- Sessions so far: ${s.sessionsDone}; best streak: ${Math.max(s.bestStreak || 0, s.streak || 0)} days; mindful minutes: ${Math.max(s.totalMin || 0, s.monthMin || 0)}
- Things they told Mo: ${factsOf(s).join(' ') || 'nothing yet'}

${STORY_RULES} Write it as a story about Mo and the person (third person for Mo, "you" for the person).`;
      try {
        const r = await writeParas({ prompt, fallback: outline, signal: ctl.signal, onParas: (x) => !off && setParas(x) });
        if (off) return;
        setParas(r.paras); setWriting(false);
        if (r.source === 'claude') set((prev) => ({ aiChapters: { ...(prev.aiChapters || {}), [id]: r.paras } }));
      } catch (e) { if (!off) { setParas(outline); setWriting(false); } }
    })();
    return () => { off = true; ctl.abort(); };
  }, [id]);
  const shown = paras || [];
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={title} sub={`Chapter ${i + 1} · ${p.name}`} />
      <div style={{ borderRadius: 26, background: grad(p), height: 150, position: 'relative', overflow: 'hidden', marginTop: 4, flexShrink: 0 }}>
        <span style={{ position: 'absolute', left: 20, top: 18, color: onGrad(p), opacity: 0.55 }}><Icon name={p.icon} size={54} sw={1.4} /></span>
        <span style={{ position: 'absolute', right: 18, bottom: -6 }}><Mo size={120} mood={id === 'peak' ? 'happy' : id === 'meadow' ? 'wink' : 'calm'} glow={false} /></span>
      </div>
      <div className="col" style={{ gap: 12, marginTop: 16, minHeight: 120 }} aria-busy={writing}>
        {!shown.length ? <p className="muted row" style={{ margin: 0, gap: 8, fontSize: 15, fontWeight: 700 }}><span className="spin" aria-hidden="true" />Mo is writing your chapter…</p> : null}
        {shown.map((t, k) => <p key={k} className="bubble-in" style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: 'var(--body)', fontWeight: 500 }}>{t}</p>)}
        {cached || (writing && shown.length) ? <span className="tag" style={{ alignSelf: 'flex-start' }}><Icon name="sparkle" size={11} sw={2.4} />Written for you by Mo with AI</span> : null}
      </div>
      <div className="pressed row" style={{ marginTop: 16, padding: '12px 14px', borderRadius: 20, gap: 10 }}>
        <Icon name="sparkle" size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--body)' }}>Keepsake: {p.keepsake}</span>
      </div>
      <button className="btn btn-primary press" style={{ marginTop: 16 }} onClick={closeSheet}>Close the book</button>
    </>
  );
}

/* ---------- Journey map ---------- */
const ROW = 118;
export function Journey({ open }) {
  const { s, nav, sheet, toast } = useApp();
  const steps = s.sessionsDone || 0;
  const at = placeIndex(steps), here = JOURNEY[at], next = JOURNEY[at + 1];
  const read = s.readChapters || [];
  const facts = factsOf(s);
  const curRef = useRef(null);
  useEffect(() => {
    if (open) sheet(<ChapterSheet id={open} />);
    else if (curRef.current && at > 1) curRef.current.scrollIntoView({ block: 'center' });
  }, []);
  const x = (i) => (i % 2 ? 76 : 24);
  const y = (i) => i * ROW + 44;
  const seg = (i) => `M${x(i)} ${y(i)} C${x(i)} ${y(i) + ROW * 0.55} ${x(i + 1)} ${y(i + 1) - ROW * 0.55} ${x(i + 1)} ${y(i + 1)}`;
  const H = (JOURNEY.length - 1) * ROW + 100;
  return (
    <div className="pad">
      <TopBar title="Mo’s journey" />
      <div className="raised" style={{ marginTop: 16, padding: '14px 16px', borderRadius: 24 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{here.name}</span>
          <span className="muted tnum" style={{ fontSize: 13, fontWeight: 700 }}>Chapter {at + 1} of {JOURNEY.length}</span>
        </div>
        {next ? (
          <>
            <div className="track" style={{ marginTop: 10 }} role="progressbar" aria-label={`Steps to ${next.name}`} aria-valuemin={here.steps} aria-valuemax={next.steps} aria-valuenow={steps}>
              <span style={{ width: ((steps - here.steps) / (next.steps - here.steps)) * 100 + '%' }} />
            </div>
            <p className="muted tnum" style={{ margin: '8px 0 0', fontSize: 13 }}>{next.steps - steps} more {next.steps - steps === 1 ? 'session' : 'sessions'} to {next.name}. Every session is one step.</p>
          </>
        ) : <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>You and Mo walked the whole path. It’s yours to revisit.</p>}
      </div>

      <div style={{ position: 'relative', height: H, marginTop: 14, flexShrink: 0 }}>
        <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          {JOURNEY.slice(0, -1).map((p, i) => (
            <path key={p.id} d={seg(i)} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round"
              stroke={i < at ? 'var(--primary)' : 'var(--muted)'} strokeOpacity={i < at ? 1 : 0.4} strokeWidth={i < at ? 5 : 3} strokeDasharray={i < at ? undefined : '2 9'} />
          ))}
        </svg>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {JOURNEY.map((p, i) => {
            const reached = i <= at, cur = i === at, unread = reached && !read.includes(p.id), left = i % 2 === 0;
            return (
              <li key={p.id} ref={cur ? curRef : null} style={{ position: 'absolute', top: y(i) - 36, left: 0, right: 0, height: 72 }}>
                <button className="press" onClick={() => (reached ? sheet(<ChapterSheet id={p.id} />) : toast(`${p.steps - steps} more ${p.steps - steps === 1 ? 'session' : 'sessions'} to reach ${p.name}.`))}
                  aria-label={`Chapter ${i + 1}, ${p.name}. ${reached ? (unread ? 'New chapter, read it' : 'Read again') : `Locked, ${p.steps - steps} more sessions`}${cur ? '. Mo is here' : ''}`}
                  style={{ width: '100%', height: 72, border: 0, background: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink)', display: 'flex', flexDirection: left ? 'row' : 'row-reverse', alignItems: 'center', gap: 12, textAlign: left ? 'left' : 'right' }}>
                  <span style={{ width: '48%', display: 'flex', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                    <span className={reached ? 'raised-sm' : 'pressed'} style={{ width: 68, height: 68, borderRadius: '50%', padding: reached ? 5 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'var(--base)' }}>
                      {reached ? <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: grad(p), color: onGrad(p), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={p.icon} size={26} sw={1.8} /></span> : <Icon name="lock" size={20} />}
                    </span>
                    {cur ? <span style={{ position: 'absolute', top: -46, left: '50%', marginLeft: 6 }}><Mo size={62} mood="happy" glow={false} label="Mo is here" /></span> : null}
                  </span>
                  <span className="col" style={{ gap: 3, minWidth: 0, alignItems: left ? 'flex-start' : 'flex-end' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2, color: reached ? 'var(--ink)' : 'var(--muted)' }}>{p.name}</span>
                    {unread ? <span className="tag plus" style={{ fontSize: 11 }}>New chapter</span>
                      : <span className="muted tnum" style={{ fontSize: 12, fontWeight: 700 }}>{reached ? 'Read again' : `${p.steps} sessions`}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <h2 className="label">What Mo knows about you</h2>
      <div className="raised" style={{ borderRadius: 24, padding: '14px 16px' }}>
        {facts.length || s.intention ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="col">
            {s.intention ? <li className="row" style={{ gap: 10, padding: '6px 0', fontSize: 15, lineHeight: 1.4, fontWeight: 600, color: 'var(--body)' }}><Icon name="heart" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />You’re here to “{s.intention.replace(/\.$/, '')}”.</li> : null}
            {facts.map((f) => <li key={f} className="row" style={{ gap: 10, padding: '6px 0', fontSize: 15, lineHeight: 1.4, fontWeight: 600, color: 'var(--body)' }}><Icon name="sparkle" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />{f}</li>)}
          </ul>
        ) : <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>Not much yet. Mo asks one small question a day on Home, and your answers end up in the story.</p>}
      </div>

      <h2 className="label">Keepsakes</h2>
      <div className="hscroll" style={{ paddingTop: 0 }}>
        {JOURNEY.map((p, i) => (
          <div key={p.id} className={i <= at ? 'raised-sm' : 'pressed-sm'} style={{ flexShrink: 0, width: 132, borderRadius: 20, padding: '12px 12px 14px', opacity: i <= at ? 1 : 0.55 }}>
            <span style={{ width: 36, height: 36, borderRadius: 12, background: i <= at ? grad(p) : 'none', color: i <= at ? onGrad(p) : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={i <= at ? p.icon : 'lock'} size={18} /></span>
            <span style={{ display: 'block', marginTop: 8, fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: i <= at ? 'var(--ink)' : 'var(--muted)' }}>{i <= at ? p.keepsake : 'Still on the path'}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary press" style={{ marginTop: 22 }} onClick={() => nav.reset('tabs')}><Icon name="play" size={16} />Take the next step</button>
    </div>
  );
}

/* ---------- Home: journey + breathe tiles ---------- */
export function JourneyTiles() {
  const { s, nav } = useApp();
  const steps = s.sessionsDone || 0, at = placeIndex(steps), here = JOURNEY[at], next = JOURNEY[at + 1];
  const unread = JOURNEY.slice(0, at + 1).filter((p) => !(s.readChapters || []).includes(p.id)).length;
  const tile = { border: 0, borderRadius: 24, padding: '14px 14px 12px', gap: 6, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', position: 'relative' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, marginTop: 16 }}>
      <button className="raised press col" style={tile} onClick={() => nav.push('journey')}>
        <span style={{ width: 44, height: 44, borderRadius: 15, background: grad(here), color: onGrad(here), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={here.icon} size={22} sw={1.8} /></span>
        <span className="row" style={{ gap: 6, marginTop: 2, flexWrap: 'wrap' }}><span style={{ fontWeight: 800, fontSize: 15 }}>Mo’s journey</span>{unread ? <span className="tag plus" style={{ fontSize: 11 }}>{unread} new</span> : null}</span>
        <span className="muted tnum" style={{ fontSize: 13, lineHeight: 1.35 }}>{here.name}{next ? ` · ${next.steps - steps} to go` : ''}</span>
      </button>
      <button className="raised press col" style={tile} onClick={() => nav.push('breathe')}>
        <span className="pressed-sm" style={{ width: 44, height: 44, borderRadius: 15, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="hand" size={22} sw={1.8} /></span>
        <span style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>Breathe with Mo</span>
        <span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>Press, hold, let go · 1 min</span>
      </button>
    </div>
  );
}

/* ---------- Home: Mo you can tap ---------- */
export function TapMo({ tip }) {
  const { s, haptic, sheet } = useApp();
  const [n, setN] = useState(0);
  const name = s.user.name ? ', ' + s.user.name : '';
  const h = new Date().getHours();
  const here = JOURNEY[placeIndex(s.sessionsDone || 0)];
  const lines = [
    `Hi${name}! That tickles.`,
    h < 11 ? 'I love mornings. The light is so new.' : h >= 21 ? 'It’s late. Shall we get sleepy together?' : 'Good timing. I was just thinking about you.',
    s.streak > 1 ? `${s.streak} days together. I counted. Twice.` : 'One session today and I’ll glow a little brighter.',
    s.intention ? `I remember: “${s.intention.replace(/\.$/, '')}.” I’m holding on to it for you.` : 'Tell me why you’re here sometime. It’s in your profile.',
    'One slow breath with me? In… and out. There.',
    `I’m at ${here.name} today. Come and see.`,
    'I’m four and a half billion years old and I still take naps.'
  ];
  const moods = ['happy', 'wink', 'curious', 'happy', 'breathe', 'wink', 'sleepy'];
  const i = (n - 1) % lines.length;
  const q = todaysQuestion();
  const ans = (s.answers || {})[q.id];
  const asked = !ans || ans.d !== dayKey();
  const idle = asked ? q.q : `${ans.a}. ${q.reply(ans.a)}`;
  return (
    <div className="raised row" style={{ marginTop: 18, borderRadius: 26, padding: '10px 16px 10px 4px', gap: 4 }}>
      <button type="button" className="press" aria-label="Say hi to Mo" onClick={() => { setN(n + 1); haptic('select'); }}
        style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', flexShrink: 0, display: 'flex' }}>
        <span key={n} className={n ? 'mo-poke' : ''} style={{ display: 'flex' }}><Mo size={84} mood={n ? moods[i] : s.streak >= 7 ? 'happy' : 'calm'} label="" /></span>
      </button>
      <span className="col grow" style={{ gap: 5, minWidth: 0 }}>
        <span className="tag" style={{ alignSelf: 'flex-start' }}>{s.streak ? `Day ${s.streak} streak` : 'Start your streak today'}</span>
        <span aria-live="polite" key={n} className={n ? 'bubble-in' : ''} style={{ fontSize: 15, lineHeight: 1.4, fontWeight: 700, color: 'var(--ink)' }}>{n ? lines[i] : idle}</span>
        {!n && asked ? <button className="chip press on" style={{ alignSelf: 'flex-start', fontSize: 14, minHeight: 44 }} onClick={() => sheet(<QuestionSheet />)}>Answer Mo</button>
          : !n ? <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Tap Mo to say hi</span> : null}
      </span>
    </div>
  );
}

/* ---------- Mo's question of the day (answered from Mo's bubble on Home) ---------- */
export function QuestionSheet() {
  const { s, set, closeSheet, haptic, toast } = useApp();
  const q = todaysQuestion();
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={q.q} sub="Mo keeps your answers and they find their way into your story." />
      <OptionList label={q.q} options={q.opts} value={null} onChange={(o) => {
        set((prev) => ({ answers: { ...(prev.answers || {}), [q.id]: { a: o, d: dayKey() } } })); haptic('select'); closeSheet(); toast(q.reply(o));
      }} />
    </>
  );
}

/* ---------- Home: Mo's question of the day ---------- */
export function MoAsks() {
  const { s, set, nav, haptic } = useApp();
  const q = todaysQuestion();
  const ans = (s.answers || {})[q.id];
  const today = ans && ans.d === dayKey();
  return (
    <div className="raised" style={{ marginTop: 16, borderRadius: 26, padding: '14px 16px 16px' }}>
      <span className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>Mo asks</span>
      <h2 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{q.q}</h2>
      {today ? (
        <div role="status" className="bubble-in">
          <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.45, fontWeight: 600, color: 'var(--body)' }}><b style={{ color: 'var(--accent)' }}>{ans.a}.</b> {q.reply(ans.a)}</p>
          <button className="btn-text" style={{ padding: 0, marginTop: 2, alignSelf: 'flex-start' }} onClick={() => nav.push('journey')}>Mo added it to your story</button>
        </div>
      ) : (
        <div role="group" aria-label={q.q} style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginTop: 12 }}>
          {q.opts.map((o) => <button key={o} type="button" className="chip press" style={{ fontSize: 14, padding: '0 8px' }} onClick={() => { set((prev) => ({ answers: { ...(prev.answers || {}), [q.id]: { a: o, d: dayKey() } } })); haptic('select'); }}>{o}</button>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Breathe with Mo: press and hold to breathe in, let go to breathe out ---------- */
const GOAL = 6;
export function Breathe() {
  const { s, set, nav, haptic, platform } = useApp();
  const [holding, setHolding] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const [secs, setSecs] = useState(0);
  const [started, setStarted] = useState(null);
  const [last, setLast] = useState(0);
  const [done, setDone] = useState(null);
  const t0 = useRef(0);
  const viaKey = useRef(false);
  const tap = !!s.tapBreathe;

  useEffect(() => {
    if (!holding) return;
    const t = setInterval(() => setSecs(Math.floor((Date.now() - t0.current) / 1000)), 200);
    return () => clearInterval(t);
  }, [holding]);

  const down = () => { if (holding || done) return; t0.current = Date.now(); if (!started) setStarted(Date.now()); setSecs(0); setHolding(true); haptic('select'); };
  const up = () => {
    if (!holding) return;
    const held = (Date.now() - t0.current) / 1000;
    setHolding(false); setLast(held); haptic('select');
    if (held >= 1.5) {
      const n = breaths + 1; setBreaths(n);
      if (n >= GOAL) setTimeout(() => { setDone(Math.round((Date.now() - started) / 1000)); set((prev) => ({ breathsWithMo: (prev.breathsWithMo || 0) + GOAL })); }, 1800);
    }
  };
  const toggle = () => (holding ? up() : down());
  const again = () => { setDone(null); setBreaths(0); setStarted(null); setLast(0); };
  const cue = holding ? (secs >= 6 ? 'Lovely. Let go when you’re ready' : 'Breathe in…') : !started ? (tap ? 'Tap Mo to breathe in' : 'Press and hold Mo') : breaths >= GOAL ? 'Beautiful.' : last && last < 1.5 ? 'A little longer this time' : 'And slowly out…';
  const scale = holding ? 1.22 : 0.86;
  const r = 138, c = 2 * Math.PI * r;

  if (done !== null) return (
    <div className="pad" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div className="grow" />
      <Mo size={190} mood="happy" enter />
      <h1 className="h1" style={{ marginTop: 18 }}>{GOAL} slow breaths</h1>
      <p className="lead">You and Mo breathed together for {fmt(done)}. Mo feels lighter too.</p>
      <div className="grow" />
      <div className="row" style={{ gap: 14, width: '100%' }}>
        <button className="btn btn-soft press" style={{ flex: 1, color: 'var(--accent)' }} onClick={again}>Again</button>
        <button className="btn btn-primary press" style={{ flex: 1.6 }} onClick={() => nav.back()}>Done</button>
      </div>
    </div>
  );
  return (
    <div className="pad" style={{ alignItems: 'center' }}>
      <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
        <button className="icon-btn press" aria-label="Close" onClick={() => nav.back()}><Icon name={platform === 'ios' ? 'down' : 'back_android'} sw={2.2} /></button>
        <QuietLabel text="Breathe with Mo" />
        <span style={{ width: 48 }} />
      </div>
      <div className="grow" style={{ minHeight: 10 }} />
      <button type="button" aria-label={tap ? 'Tap to breathe in, tap again to breathe out' : 'Hold to breathe in, release to breathe out'} aria-pressed={holding}
        onPointerDown={(e) => { e.preventDefault(); if (tap) toggle(); else { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* older browsers */ } down(); } }}
        onPointerUp={() => { if (!tap) up(); }} onPointerCancel={() => { if (!tap) up(); }}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { viaKey.current = true; if (!e.repeat) { tap ? toggle() : down(); } } }}
        onKeyUp={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !tap) up(); }}
        onClick={(e) => { if (viaKey.current) { viaKey.current = false; return; } if (e.detail === 0) toggle(); /* screen-reader activation */ }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: 300, height: 300, borderRadius: '50%', border: 0, padding: 0, background: 'none', position: 'relative', cursor: 'pointer', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="150" cy="150" r={r} fill="none" stroke="var(--muted)" strokeOpacity=".18" strokeWidth="6" />
          <circle cx="150" cy="150" r={r} fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * (breaths / GOAL)} ${c}`} transform="rotate(-90 150 150)" style={{ transition: 'stroke-dasharray .8s ease-out' }} />
        </svg>
        <span className={holding ? 'pressed' : 'raised'} style={{ width: 236, height: 236, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'box-shadow .4s' }}>
          <span className="breathe-mo" style={{ display: 'flex', transform: `scale(${scale})`, transition: `transform ${holding ? 5 : 6}s cubic-bezier(.3,.1,.3,1)` }}>
            <Mo size={190} mood={breaths >= GOAL ? 'happy' : 'breathe'} label="" />
          </span>
        </span>
      </button>
      <p aria-live="polite" style={{ margin: '22px 0 0', fontSize: 24, fontWeight: 800, color: 'var(--accent)', minHeight: 32, textAlign: 'center' }}>{cue}{holding && secs > 0 && secs < 6 ? <span className="tnum muted" style={{ fontSize: 18 }}> {secs}</span> : null}</p>
      <div className="row" role="img" aria-label={`${breaths} of ${GOAL} breaths`} style={{ gap: 10, marginTop: 14 }}>
        {Array.from({ length: GOAL }).map((_, i) => <span key={i} className={i < breaths ? '' : 'pressed-sm'} style={{ width: 16, height: 16, borderRadius: '50%', background: i < breaths ? 'var(--primary)' : undefined, transition: 'background .4s' }} />)}
      </div>
      <p className="muted" style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.45, textAlign: 'center', maxWidth: 300 }}>{tap ? 'Tap once to breathe in, tap again to breathe out.' : 'Hold while you breathe in. Let go to breathe out. Mo follows your pace.'}</p>
      <div className="grow" style={{ minHeight: 10 }} />
      <div style={{ width: '100%' }}><SwitchRow title="Tap instead of hold" sub="Easier if holding is uncomfortable" on={tap} onChange={(v) => set({ tapBreathe: v })} /></div>
    </div>
  );
}
