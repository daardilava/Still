import React, { useEffect, useRef, useState } from 'react';
import { useApp, TopBar, Segment, SwitchVisual } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { SESSIONS, dayKey } from '../data.js';
import { composeSession, looksLikeCrisis, PRACTICES, getTts } from '../ai.js';

const QUICK = ['Can’t switch off tonight', 'Nervous before a meeting', 'My mind won’t stop', 'Feeling low today', 'Need to focus', 'Angry after an argument'];
const FREE_PER_WEEK = 1;
const WEEK = 7 * 864e5;
export const aiLeft = (s) => (s.user.plus ? Infinity : Math.max(0, FREE_PER_WEEK - (s.aiUses || []).filter((t) => Date.now() - t < WEEK).length));

const STEPS = ['Listening to what you wrote…', 'Choosing a practice…', 'Writing your words…', 'Almost ready…'];

export function Compose({ preset }) {
  const { s, set, nav, toast } = useApp();
  const [text, setText] = useState(preset || '');
  const [mins, setMins] = useState(5);
  const [phase, setPhase] = useState('edit'); // edit | making | done
  const [step, setStep] = useState(0);
  const [made, setMade] = useState(null);
  const ctl = useRef(null);
  const left = aiLeft(s);
  const mine = (s.aiSessions || []).slice(-3).reverse();
  const [voice, setVoice] = useState(false);
  useEffect(() => { getTts().then((t) => setVoice(!!t)); }, []);
  useEffect(() => () => ctl.current && ctl.current.abort(), []);
  useEffect(() => {
    if (phase !== 'making') return;
    const t = setInterval(() => setStep((x) => Math.min(STEPS.length - 1, x + 1)), 1400);
    return () => clearInterval(t);
  }, [phase]);

  const make = async (again) => {
    const words = text.trim();
    if (!words) return;
    if (looksLikeCrisis(words)) { nav.push('support', { from: 'compose' }); return; }
    if (left < 1) { nav.push('paywall', { source: 'ai' }); return; }
    ctl.current = new AbortController();
    setPhase('making'); setStep(0);
    try {
      const r = await composeSession({ text: words, minutes: mins, name: s.user.name, intention: s.intention, sim: s.aiSim, signal: ctl.current.signal });
      if (r.crisis) { setPhase('edit'); nav.push('support', { from: 'compose' }); return; }
      const twin = SESSIONS.find((x) => x.cat === PRACTICES[r.practice].cat) || SESSIONS[0];
      const ses = {
        id: 'ai:' + Date.now(), title: r.title, lines: r.lines, practice: r.practice, why: r.why, note: r.note || null,
        cat: PRACTICES[r.practice].cat, lengths: [mins], img: twin.img, pos: twin.pos, plus: false, desc: r.why,
        ai: true, source: r.source, made: dayKey(), feeling: words.slice(0, 60)
      };
      set((prev) => ({ aiSessions: [...(prev.aiSessions || []), ses].slice(-12), aiUses: [...(prev.aiUses || []), Date.now()].slice(-30) }));
      setMade(ses); setPhase('done');
    } catch (e) {
      setPhase('edit');
      if (!e || e.code !== 'cancelled') toast('Mo couldn’t make that one. Try again in a moment.');
    }
  };

  if (phase === 'making') return (
    <div className="pad" style={{ alignItems: 'center', textAlign: 'center' }}>
      <TopBar back={false} />
      <div className="grow" />
      <span className="mo-think"><Mo size={170} mood="curious" /></span>
      <p aria-live="polite" style={{ margin: '24px 0 0', fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{STEPS[step]}</p>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>This takes a few seconds.</p>
      <div className="grow" />
      <button className="btn btn-soft press" style={{ color: 'var(--accent)' }} onClick={() => ctl.current && ctl.current.abort()}>Stop</button>
    </div>
  );

  if (phase === 'done' && made) return (
    <div className="pad">
      <TopBar title="Made for you" onBack={() => setPhase('edit')} />
      <div className="raised" style={{ marginTop: 16, borderRadius: 28, padding: '18px 18px 16px' }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="tag"><Icon name="sparkle" size={11} sw={2.4} />Made by Mo with AI</span>
          <span className="tag tnum">{mins} min</span>
          <span className="tag">{PRACTICES[made.practice].name}</span>
        </div>
        <h1 className="h1" style={{ marginTop: 14, fontSize: 28 }}>{made.title}</h1>
        <p className="lead" style={{ marginTop: 6 }}>{made.why}</p>
        <div className="pressed" style={{ marginTop: 14, padding: '14px 16px', borderRadius: 22 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--body)', fontWeight: 500 }}>{made.lines[0]}</p>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700 }}>+ {made.lines.length - 1} more, read slowly with pauses</p>
        </div>
        {made.note ? <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>{made.note}</p> : null}
      </div>
      {voice ? (
        <button type="button" role="switch" aria-checked={s.moVoice !== false} className="lrow press raised" style={{ marginTop: 16, borderRadius: 22 }} onClick={() => set({ moVoice: s.moVoice === false })}>
          <span className="ico"><Icon name="speaker" size={18} /></span>
          <span className="col grow"><span className="t">Mo reads it aloud</span><span className="s">Or read along on screen</span></span>
          <SwitchVisual on={s.moVoice !== false} />
        </button>
      ) : null}
      <div className="grow" style={{ minHeight: 18 }} />
      <button className="btn btn-primary press" style={{ marginTop: 18 }} onClick={() => nav.replace('player', { id: made.id, minutes: mins })}><Icon name="play" size={16} />Begin · {mins} min</button>
      <button className="btn-text" style={{ alignSelf: 'center', marginTop: 4 }} onClick={() => make(true)}>{left >= 1 || s.user.plus ? 'Try a different one' : 'Try a different one (Plus)'}</button>
    </div>
  );

  return (
    <div className="pad">
      <TopBar title="A session for right now" />
      <div className="row" style={{ gap: 6, marginTop: 14, alignItems: 'flex-end' }}>
        <Mo size={86} mood="curious" glow={false} />
        <div className="raised bubble" style={{ padding: '12px 14px', borderRadius: '20px 20px 20px 6px', fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 14 }}>
          {s.user.name ? `What’s going on, ${s.user.name}?` : 'What’s going on?'} A few words is enough.
        </div>
      </div>
      <label className="col" style={{ marginTop: 14 }}>
        <span className="sr-only">How you are right now</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={280} rows={3} placeholder="e.g. Big presentation in 10 minutes and my heart is racing"
          className="pressed" style={{ border: 0, outline: 'none', resize: 'none', borderRadius: 22, padding: '14px 18px', fontSize: 16, lineHeight: 1.45, fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--base)' }} />
      </label>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {QUICK.map((q) => <button key={q} type="button" className={'chip press' + (text === q ? ' on' : '')} style={{ fontSize: 14 }} onClick={() => setText(q)}>{q}</button>)}
      </div>
      <p style={{ margin: '18px 0 10px', fontSize: 14, fontWeight: 800 }}>How long?</p>
      <Segment label="Length" value={mins} onChange={setMins} options={[{ value: 3, label: '3 min' }, { value: 5, label: '5 min' }, { value: 10, label: '10 min' }]} />

      {mine.length ? (
        <>
          <h2 className="label">Made for you before</h2>
          <div className="col" style={{ gap: 12 }}>
            {mine.map((x) => (
              <button key={x.id} className="raised press row" onClick={() => nav.push('player', { id: x.id, minutes: x.lengths[0] })} style={{ border: 0, borderRadius: 20, padding: '10px 14px', minHeight: 56, gap: 12, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
                <Icon name="sparkle" size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span className="col grow" style={{ minWidth: 0 }}><span style={{ fontWeight: 800, fontSize: 15 }}>{x.title}</span><span className="muted" style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.lengths[0]} min · “{x.feeling}”</span></span>
                <Icon name="play" size={14} style={{ color: 'var(--accent)' }} />
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="grow" style={{ minHeight: 18 }} />
      <p className="muted" style={{ margin: '16px 4px 0', fontSize: 12, lineHeight: 1.45, textAlign: 'center' }}>
        Mo uses AI to write your session from practices a meditation teacher approved. Mo isn’t a therapist.
      </p>
      <button className="btn-text" style={{ alignSelf: 'center', minHeight: 44, fontSize: 13 }} onClick={() => nav.push('support')}>Need more support?</button>
      <button className="btn btn-primary press" style={{ marginTop: 4 }} disabled={!text.trim()} onClick={() => make(false)}>
        <Icon name="sparkle" size={16} />{left >= 1 ? 'Make my session' : 'Unlock with Plus'}
      </button>
      <p className="muted tnum" style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{s.user.plus ? 'Unlimited with Plus' : left >= 1 ? `${left} free personal session this week` : 'Your free one this week is used · Plus: unlimited'}</p>
    </div>
  );
}

/* ---------- Home entry ---------- */
export function ComposeEntry() {
  const { nav } = useApp();
  return (
    <button className="pressed press row" onClick={() => nav.push('compose')}
      style={{ width: '100%', marginTop: 12, border: 0, borderRadius: 22, padding: '0 16px', minHeight: 56, gap: 10, textAlign: 'left', cursor: 'pointer', color: 'var(--muted)' }}>
      <Icon name="sparkle" size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <span className="grow" style={{ fontSize: 15, fontWeight: 600 }}>Or tell Mo how you are right now…</span>
      <span className="tag" style={{ fontSize: 11 }}>AI</span>
    </button>
  );
}
