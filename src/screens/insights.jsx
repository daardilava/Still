import React from 'react';
import { useApp, TopBar, SheetTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { PRE_MOODS, MOOD_COLORS, UNLOCKS } from '../data.js';

/* Reference screen for the design system: sizes come only from theme.css tokens and classes
   (.t-*, .card, .tile, var(--sp-*), var(--r-*)). Remaining numbers are layout, not style:
   column widths, Mo sizes, chart bar thickness. */

/* ---------- One-tap check-in before a session (rendered inside the player) ---------- */
export function CheckIn({ onPick, onSkip }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return (
    <>
      <div className="scrim" aria-hidden="true" onClick={onSkip} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="How do you feel right now?" tabIndex={-1} ref={ref} style={{ outline: 'none' }}>
        <div className="grabber" />
        <div className="row" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <Mo size={72} mood="curious" glow={false} />
          <div className="col" style={{ gap: 'var(--sp-1)' }}>
            <h2 className="t-title3" style={{ margin: 0 }}>How do you feel right now?</h2>
            <p className="muted t-footnote" style={{ margin: 0 }}>One tap. Mo compares it with how you feel after.</p>
          </div>
        </div>
        <div role="group" aria-label="How you feel right now" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
          {Object.keys(PRE_MOODS).map((m) => (
            <button key={m} type="button" className="tile press t-footnote w-heavy" onClick={() => onPick(m)}
              style={{ minHeight: 76, padding: 'var(--sp-3) var(--sp-1)' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: PRE_MOODS[m] }} />{m}
            </button>
          ))}
        </div>
        <button className="btn-text" style={{ display: 'block', margin: 'var(--sp-2) auto 0' }} onClick={onSkip}>Skip</button>
      </div>
    </>
  );
}

/* ---------- Mo's collection (streak unlocks) ---------- */
export function unlockedCount(s) { return UNLOCKS.filter((u) => (s.bestStreak || 0) >= u.days).length; }

export function CollectionSheet() {
  const { s, set, toast } = useApp();
  const best = Math.max(s.bestStreak || 0, s.streak || 0);
  const next = UNLOCKS.find((u) => best < u.days);
  const Tile = ({ id, name, days }) => {
    const open = !days || best >= days, on = (s.moWear || null) === id;
    return (
      <button type="button" role="radio" aria-checked={on} aria-disabled={!open} className={'tile press' + (on ? ' on' : '')}
        aria-label={`${name}${open ? '' : `, unlocks at a ${days}-day streak`}`}
        onClick={() => (open ? set({ moWear: id }) : toast(`Reach a ${days}-day streak to unlock the ${name.toLowerCase()}.`))}
        style={{ gap: 'var(--sp-1)', padding: 'var(--sp-4) var(--sp-2) var(--sp-3)' }}>
        <span style={{ opacity: open ? 1 : 0.35, filter: open ? undefined : 'grayscale(1)' }}><Mo size={84} mood={open ? 'happy' : 'calm'} wear={id} glow={false} label="" /></span>
        <span className="t-subhead w-heavy">{name}</span>
        <span className="muted row t-caption" style={{ gap: 'var(--sp-1)' }}>{open ? (on ? 'Wearing' : days ? `${days}-day streak` : 'Just Mo') : <><Icon name="lock" size={11} sw={2.4} />Day {days}</>}</span>
      </button>
    );
  };
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Mo’s collection" sub={next ? `Next: ${next.name} at a ${next.days}-day streak. Your best so far is ${best}.` : 'You unlocked everything. Mo is speechless.'} />
      <div role="radiogroup" aria-label="What Mo wears" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'var(--sp-4)', marginTop: 'var(--sp-2)' }}>
        {UNLOCKS.map((u) => <Tile key={u.id} {...u} />)}
      </div>
      <button type="button" className="btn btn-soft press" style={{ marginTop: 'var(--sp-4)', color: 'var(--accent)' }} disabled={!s.moWear} onClick={() => set({ moWear: null })}>Just Mo, nothing on</button>
      <p className="muted t-footnote" style={{ margin: 'var(--sp-3) var(--sp-1) 0', textAlign: 'center' }}>Unlocks are yours to keep, even if a streak ends.</p>
    </>
  );
}

/* ---------- Insights (Plus) ---------- */
const SLOTS = [['Morning', 5, 12], ['Afternoon', 12, 18], ['Evening', 18, 22], ['Night', 22, 29]];
const slotOf = (h) => SLOTS.findIndex(([, a, b]) => { const x = h < 5 ? h + 24 : h; return x >= a && x < b; });

export function computeInsights(history) {
  const mins = [0, 0, 0, 0], calm = [0, 0, 0, 0], rated = [0, 0, 0, 0];
  history.forEach((e) => { const i = slotOf(e.hour); mins[i] += e.min; if (e.post) { rated[i]++; if (e.post === 'Calmer') calm[i]++; } });
  const withBoth = history.filter((e) => e.pre && e.post);
  const hard = withBoth.filter((e) => e.pre === 'Stressed' || e.pre === 'Tired');
  const eased = hard.filter((e) => e.post === 'Calmer' || e.post === 'Sleepy').length;
  let best = -1;
  rated.forEach((n, i) => { if (n >= 2 && (best < 0 || calm[i] / n > calm[best] / rated[best])) best = i; });
  const flow = {};
  withBoth.forEach((e) => { flow[e.pre] = flow[e.pre] || {}; flow[e.pre][e.post] = (flow[e.pre][e.post] || 0) + 1; });
  const posts = {};
  history.forEach((e) => { if (e.post) posts[e.post] = (posts[e.post] || 0) + 1; });
  const top = Object.keys(posts).sort((a, b) => posts[b] - posts[a])[0];
  return { mins, best, bestPct: best >= 0 ? Math.round((calm[best] / rated[best]) * 100) : 0, hard: hard.length, eased, easedPct: hard.length ? Math.round((eased / hard.length) * 100) : 0, flow, top, total: mins.reduce((a, b) => a + b, 0) };
}

/* A small dot or square in a chart legend; its colour is data. */
const Swatch = ({ color, round }) => <span style={{ width: 10, height: 10, flexShrink: 0, borderRadius: round ? '50%' : 'var(--r-xs)', background: color }} />;

export function Insights() {
  const { s, nav, toast } = useApp();
  const plus = s.user.plus;
  const history = s.history || [];
  const I = computeInsights(history);
  const best = Math.max(s.bestStreak || 0, s.streak || 0);
  const enough = history.length >= 3;
  const maxMin = Math.max(1, ...I.mins);
  const month = new Date().toLocaleString('en', { month: 'long' });
  const share = async () => {
    const text = `My ${month} with Still: ${s.monthMin} mindful minutes, ${s.sessionsDone} sessions, best streak ${best} days.`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { return; }
    toast('This opens the system share sheet with your recap card.');
  };
  const body = (
    <div className="col" style={{ gap: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
      <section className="raised card">
        <h2 className="h3">When you practise</h2>
        <div role="img" aria-label={'Minutes by time of day: ' + SLOTS.map(([n], i) => `${n} ${I.mins[i]}`).join(', ')} className="col" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-3)' }}>
          {SLOTS.map(([n], i) => (
            <div key={n} className="row" style={{ gap: 'var(--sp-3)' }}>
              <span className="t-footnote w-bold" style={{ width: 78, color: i === I.best ? 'var(--accent)' : 'var(--body)' }}>{n}</span>
              <span className="track grow"><span style={{ width: (I.mins[i] / maxMin) * 100 + '%' }} /></span>
              <span className="tnum muted t-footnote w-heavy" style={{ width: 52, textAlign: 'right' }}>{I.mins[i]} min</span>
            </div>
          ))}
        </div>
        {I.best >= 0 ? <p className="t-subhead w-semibold" style={{ margin: 'var(--sp-3) 0 0', color: 'var(--body)' }}>You end up calmer after <b className="accent">{SLOTS[I.best][0].toLowerCase()}</b> sessions more than at any other time ({I.bestPct}% of them).</p> : null}
      </section>

      <section className="raised card">
        <h2 className="h3">Before and after</h2>
        {I.hard ? (
          <>
            <div className="row" style={{ gap: 'var(--sp-4)', marginTop: 'var(--sp-3)' }}>
              <span className="tnum accent t-display">{I.easedPct}%</span>
              <span className="t-subhead w-semibold" style={{ color: 'var(--body)' }}>of the times you started stressed or tired, you finished calmer or ready to sleep <span style={{ whiteSpace: 'nowrap' }}>({I.eased} of {I.hard}).</span></span>
            </div>
            <div className="col" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
              {Object.keys(PRE_MOODS).filter((p) => I.flow[p]).map((p) => {
                const row = I.flow[p], n = Object.values(row).reduce((a, b) => a + b, 0);
                return (
                  <div key={p} className="row" style={{ gap: 'var(--sp-3)' }}>
                    <span className="row t-footnote w-bold" style={{ width: 86, gap: 'var(--sp-2)' }}><Swatch color={PRE_MOODS[p]} round />{p}</span>
                    {/* stacked bar: same 3px inset and height as .track */}
                    <span role="img" aria-label={`Started ${p}: ` + Object.keys(row).map((k) => `${row[k]} ended ${k}`).join(', ')} className="pressed-sm grow" style={{ display: 'flex', height: 16, borderRadius: 'var(--r-sm)', padding: 3, gap: 2 }}>
                      {Object.keys(MOOD_COLORS).filter((k) => row[k]).map((k) => <span key={k} style={{ flex: row[k], background: MOOD_COLORS[k], borderRadius: 'var(--r-xs)' }} />)}
                    </span>
                    <span className="tnum muted t-footnote w-heavy" style={{ width: 20, textAlign: 'right' }}>{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="row" style={{ gap: 'var(--sp-3)', marginTop: 'var(--sp-3)', flexWrap: 'wrap' }}>
              {Object.keys(MOOD_COLORS).map((k) => <span key={k} className="row muted t-caption" style={{ gap: 'var(--sp-1)' }}><Swatch color={MOOD_COLORS[k]} />{k}</span>)}
            </div>
          </>
        ) : <p className="muted t-subhead" style={{ margin: 'var(--sp-2) 0 0' }}>Tell Mo how you feel before and after a few sessions and the difference shows up here.</p>}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'var(--sp-4)' }}>
        <div className="raised card"><span className="tnum t-title1" style={{ display: 'block' }}>{best}</span><span className="muted t-footnote w-semibold">longest streak, days</span></div>
        <div className="raised card"><span className="tnum t-title1" style={{ display: 'block' }}>{history.length ? Math.round(I.total / history.length) : 0}</span><span className="muted t-footnote w-semibold">minutes per session</span></div>
      </div>

      <section aria-labelledby="recap-title">
        <h2 className="label" id="recap-title" style={{ marginTop: 'var(--sp-2)' }}>{month} recap</h2>
        <div className="brand-card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="col" style={{ gap: 'var(--sp-1)' }}>
              <span className="t-eyebrow" style={{ color: 'var(--on-brand-faint)' }}>My {month} with Still</span>
              <span className="tnum t-display">{s.monthMin}</span>
              <span className="t-subhead w-bold" style={{ color: 'var(--on-brand-muted)' }}>mindful minutes</span>
            </div>
            <Mo size={92} mood="happy" glow={false} />
          </div>
          <div className="row tnum t-footnote w-bold" style={{ gap: 'var(--sp-4)', marginTop: 'var(--sp-3)', color: 'var(--on-brand-muted)', flexWrap: 'wrap' }}>
            <span><b className="t-body w-heavy" style={{ color: 'var(--on-brand)' }}>{s.sessionsDone}</b> sessions</span>
            <span><b className="t-body w-heavy" style={{ color: 'var(--on-brand)' }}>{best}</b> day best streak</span>
            {I.top ? <span>mostly <b className="t-body w-heavy" style={{ color: 'var(--on-brand)' }}>{I.top.toLowerCase()}</b> after</span> : null}
          </div>
        </div>
        <button className="btn btn-soft press" style={{ marginTop: 'var(--sp-4)', color: 'var(--accent)' }} onClick={share}>Share recap</button>
      </section>
    </div>
  );
  return (
    <div className="pad">
      <div className="sticky-top"><TopBar title="Insights" /></div>
      <p className="lead" style={{ marginTop: 'var(--sp-1)' }}>What Mo has noticed from your last {history.length} {history.length === 1 ? 'session' : 'sessions'}.</p>
      {!enough ? (
        <div className="col" style={{ alignItems: 'center', textAlign: 'center', marginTop: 'var(--sp-8)' }}>
          <Mo size={150} mood="curious" />
          <h2 className="h2" style={{ marginTop: 'var(--sp-4)' }}>Mo needs a little more to go on</h2>
          <p className="lead">Finish three sessions and tell Mo how you feel before and after. Patterns appear here.</p>
          <button className="btn btn-primary press" style={{ marginTop: 'var(--sp-5)' }} onClick={() => nav.reset('tabs')}>Find a session</button>
        </div>
      ) : plus ? body : (
        <div style={{ position: 'relative' }}>
          {/* A blurred preview of the real insights behind the upgrade card. */}
          <div aria-hidden="true" inert style={{ filter: 'blur(7px)', opacity: 0.7, pointerEvents: 'none', maxHeight: 560, overflow: 'hidden' }}>{body}</div>
          <div className="raised card col" style={{ position: 'absolute', left: 'var(--sp-2)', right: 'var(--sp-2)', top: 90, borderRadius: 'var(--r-3xl)', padding: 'var(--sp-5)', alignItems: 'center', textAlign: 'center' }}>
            <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span>
            <h2 className="h2" style={{ marginTop: 'var(--sp-3)' }}>See what works for you</h2>
            <p className="lead">Your best time of day, how sessions change your mood, and a monthly recap to share.</p>
            <button className="btn btn-primary press" style={{ marginTop: 'var(--sp-4)' }} onClick={() => nav.push('paywall', { source: 'insights' })}>Unlock insights</button>
          </div>
        </div>
      )}
    </div>
  );
}
