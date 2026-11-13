import React from 'react';
import { useApp, TopBar, SheetTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { PRE_MOODS, MOOD_COLORS, UNLOCKS } from '../data.js';

/* ---------- One-tap check-in before a session (rendered inside the player) ---------- */
export function CheckIn({ onPick, onSkip }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return (
    <>
      <div className="scrim" aria-hidden="true" onClick={onSkip} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="How do you feel right now?" tabIndex={-1} ref={ref} style={{ outline: 'none' }}>
        <div className="grabber" />
        <div className="row" style={{ gap: 6, marginTop: 10 }}>
          <Mo size={72} mood="curious" glow={false} />
          <div className="col" style={{ gap: 2 }}>
            <h2 className="h2" style={{ fontSize: 20 }}>How do you feel right now?</h2>
            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>One tap. Mo compares it with how you feel after.</p>
          </div>
        </div>
        <div role="group" aria-label="How you feel right now" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginTop: 16 }}>
          {Object.keys(PRE_MOODS).map((m) => (
            <button key={m} type="button" className="press" onClick={() => onPick(m)}
              style={{ minHeight: 76, padding: '10px 4px', borderRadius: 20, border: 0, background: 'var(--base)', boxShadow: 'var(--up-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: 'var(--ink)', cursor: 'pointer' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: PRE_MOODS[m] }} />{m}
            </button>
          ))}
        </div>
        <button className="btn-text" style={{ marginTop: 6, alignSelf: 'center' }} onClick={onSkip}>Skip</button>
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
      <button type="button" role="radio" aria-checked={on} aria-disabled={!open} className="press"
        aria-label={`${name}${open ? '' : `, unlocks at a ${days}-day streak`}`}
        onClick={() => (open ? set({ moWear: id }) : toast(`Reach a ${days}-day streak to unlock the ${name.toLowerCase()}.`))}
        style={{ border: 0, borderRadius: 22, padding: '10px 6px 12px', background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: 'var(--ink)' }}>
        <span style={{ opacity: open ? 1 : 0.35, filter: open ? undefined : 'grayscale(1)', padding: '14px 0 0' }}><Mo size={84} mood={open ? 'happy' : 'calm'} wear={id} glow={false} label="" /></span>
        <span style={{ fontSize: 14, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)' }}>{name}</span>
        <span className="muted row" style={{ fontSize: 12, fontWeight: 700, gap: 4 }}>{open ? (on ? 'Wearing' : days ? `${days}-day streak` : 'Just Mo') : <><Icon name="lock" size={11} sw={2.4} />Day {days}</>}</span>
      </button>
    );
  };
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Mo’s collection" sub={next ? `Next: ${next.name} at a ${next.days}-day streak. Your best so far is ${best}.` : 'You unlocked everything. Mo is speechless.'} />
      <div role="radiogroup" aria-label="What Mo wears" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginTop: 6 }}>
        {UNLOCKS.map((u) => <Tile key={u.id} {...u} />)}
      </div>
      <button type="button" className="btn btn-soft press" style={{ marginTop: 16, color: 'var(--accent)' }} disabled={!s.moWear} onClick={() => set({ moWear: null })}>Just Mo, nothing on</button>
      <p className="muted" style={{ margin: '12px 4px 0', fontSize: 13, lineHeight: 1.4, textAlign: 'center' }}>Unlocks are yours to keep, even if a streak ends.</p>
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
    <>
      <div className="raised" style={{ marginTop: 18, padding: '16px 18px', borderRadius: 26 }}>
        <h2 className="h2" style={{ fontSize: 16 }}>When you practise</h2>
        <div role="img" aria-label={'Minutes by time of day: ' + SLOTS.map(([n], i) => `${n} ${I.mins[i]}`).join(', ')} className="col" style={{ gap: 10, marginTop: 14 }}>
          {SLOTS.map(([n], i) => (
            <div key={n} className="row" style={{ gap: 10 }}>
              <span style={{ width: 78, fontSize: 13, fontWeight: 700, color: i === I.best ? 'var(--accent)' : 'var(--body)' }}>{n}</span>
              <span className="track grow"><span style={{ width: (I.mins[i] / maxMin) * 100 + '%' }} /></span>
              <span className="tnum muted" style={{ width: 52, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{I.mins[i]} min</span>
            </div>
          ))}
        </div>
        {I.best >= 0 ? <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.45, fontWeight: 600, color: 'var(--body)' }}>You end up calmer after <b style={{ color: 'var(--accent)' }}>{SLOTS[I.best][0].toLowerCase()}</b> sessions more than at any other time ({I.bestPct}% of them).</p> : null}
      </div>

      <div className="raised" style={{ marginTop: 18, padding: '16px 18px', borderRadius: 26 }}>
        <h2 className="h2" style={{ fontSize: 16 }}>Before and after</h2>
        {I.hard ? (
          <>
            <div className="row" style={{ gap: 14, marginTop: 12, alignItems: 'center' }}>
              <span className="tnum accent" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{I.easedPct}%</span>
              <span style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 600, color: 'var(--body)' }}>of the times you started stressed or tired, you finished calmer or ready to sleep ({I.eased} of {I.hard}).</span>
            </div>
            <div className="col" style={{ gap: 10, marginTop: 14 }}>
              {Object.keys(PRE_MOODS).filter((p) => I.flow[p]).map((p) => {
                const row = I.flow[p], n = Object.values(row).reduce((a, b) => a + b, 0);
                return (
                  <div key={p} className="row" style={{ gap: 10 }}>
                    <span className="row" style={{ width: 86, gap: 6, fontSize: 13, fontWeight: 700 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: PRE_MOODS[p] }} />{p}</span>
                    <span role="img" aria-label={`Started ${p}: ` + Object.keys(row).map((k) => `${row[k]} ended ${k}`).join(', ')} className="pressed-sm grow" style={{ display: 'flex', height: 16, borderRadius: 8, padding: 3, gap: 2 }}>
                      {Object.keys(MOOD_COLORS).filter((k) => row[k]).map((k) => <span key={k} style={{ flex: row[k], background: MOOD_COLORS[k], borderRadius: 5 }} />)}
                    </span>
                    <span className="tnum muted" style={{ width: 20, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="row" style={{ gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              {Object.keys(MOOD_COLORS).map((k) => <span key={k} className="row muted" style={{ gap: 5, fontSize: 12, fontWeight: 700 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: MOOD_COLORS[k] }} />{k}</span>)}
            </div>
          </>
        ) : <p className="muted" style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.45 }}>Tell Mo how you feel before and after a few sessions and the difference shows up here.</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, marginTop: 18 }}>
        <div className="raised" style={{ padding: '14px 16px', borderRadius: 22 }}><span className="tnum" style={{ display: 'block', fontSize: 26, fontWeight: 800 }}>{best}</span><span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>longest streak, days</span></div>
        <div className="raised" style={{ padding: '14px 16px', borderRadius: 22 }}><span className="tnum" style={{ display: 'block', fontSize: 26, fontWeight: 800 }}>{history.length ? Math.round(I.total / history.length) : 0}</span><span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>minutes per session</span></div>
      </div>

      <h2 className="label">{month} recap</h2>
      <div style={{ borderRadius: 28, padding: '18px 20px 16px', background: 'linear-gradient(150deg,#5B32C4,#2A1E52)', color: '#fff', boxShadow: 'var(--up)' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#D9CDFA' }}>My {month} with Still</span>
            <span className="tnum" style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{s.monthMin}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#E6DDFC' }}>mindful minutes</span>
          </div>
          <Mo size={92} mood="happy" glow={false} />
        </div>
        <div className="row tnum" style={{ gap: 18, marginTop: 12, fontSize: 13, fontWeight: 700, color: '#E6DDFC', flexWrap: 'wrap' }}>
          <span><b style={{ color: '#fff', fontSize: 16 }}>{s.sessionsDone}</b> sessions</span>
          <span><b style={{ color: '#fff', fontSize: 16 }}>{best}</b> day best streak</span>
          {I.top ? <span>mostly <b style={{ color: '#fff', fontSize: 16 }}>{I.top.toLowerCase()}</b> after</span> : null}
        </div>
      </div>
      <button className="btn btn-soft press" style={{ marginTop: 14, color: 'var(--accent)' }} onClick={share}>Share recap</button>
    </>
  );
  return (
    <div className="pad">
      <TopBar title="Insights" />
      <p className="lead" style={{ marginTop: 14 }}>What Mo has noticed from your last {history.length} {history.length === 1 ? 'session' : 'sessions'}.</p>
      {!enough ? (
        <div className="col" style={{ alignItems: 'center', textAlign: 'center', marginTop: 40 }}>
          <Mo size={150} mood="curious" />
          <h2 className="h2" style={{ marginTop: 16 }}>Mo needs a little more to go on</h2>
          <p className="lead">Finish three sessions and tell Mo how you feel before and after. Patterns appear here.</p>
          <button className="btn btn-primary press" style={{ marginTop: 20 }} onClick={() => nav.reset('tabs')}>Find a session</button>
        </div>
      ) : plus ? body : (
        <div style={{ position: 'relative' }}>
          <div aria-hidden="true" inert style={{ filter: 'blur(7px)', opacity: 0.7, pointerEvents: 'none', maxHeight: 560, overflow: 'hidden' }}>{body}</div>
          <div className="raised col" style={{ position: 'absolute', left: 8, right: 8, top: 90, borderRadius: 28, padding: '20px 20px 18px', alignItems: 'center', textAlign: 'center' }}>
            <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span>
            <h2 className="h2" style={{ marginTop: 12 }}>See what works for you</h2>
            <p className="lead" style={{ marginTop: 6 }}>Your best time of day, how sessions change your mood, and a monthly recap to share.</p>
            <button className="btn btn-primary press" style={{ marginTop: 16 }} onClick={() => nav.push('paywall', { source: 'insights' })}>Unlock insights</button>
          </div>
        </div>
      )}
    </div>
  );
}
