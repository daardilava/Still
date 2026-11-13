import React, { useState } from 'react';
import { useApp, SheetTitle, Stepper } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { AVATAR_BGS, PROGRAMS, dayKey } from '../data.js';

/* ---------- Mo avatar: the profile picture is Mo, wearing what you chose, on your colour ---------- */
export function MoAvatar({ size = 72, bg = 'lilac', mood = 'happy' }) {
  const [a, b] = AVATAR_BGS[bg] || AVATAR_BGS.lilac;
  return (
    <span className="raised" style={{ width: size, height: size, borderRadius: '50%', padding: Math.round(size * 0.07), flexShrink: 0, display: 'block' }}>
      <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(150deg,${a},${b})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ marginBottom: -Math.round(size * 0.06), display: 'flex' }}><Mo size={Math.round(size * 0.8)} mood={mood} glow={false} label="" /></span>
      </span>
    </span>
  );
}

export function BgPicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Avatar background" className="row" style={{ gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
      {Object.keys(AVATAR_BGS).map((k) => {
        const [a, b, name] = AVATAR_BGS[k];
        return (
          <button key={k} type="button" role="radio" aria-checked={value === k} aria-label={name} className="press" onClick={() => onChange(k)}
            style={{ width: 48, height: 48, borderRadius: '50%', border: 0, padding: 0, background: 'var(--base)', boxShadow: value === k ? 'var(--down-sm)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(150deg,${a},${b})`, outline: value === k ? '3px solid var(--accent)' : 'none', outlineOffset: 2 }} />
          </button>
        );
      })}
    </div>
  );
}

export function sinceLine(s) {
  if (!s.since) return 'Just getting started';
  const d = new Date(s.since + 'T12:00:00'), now = new Date();
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'Started this month';
  return 'Meditating since ' + d.toLocaleString('en', { month: 'long' }) + (d.getFullYear() !== now.getFullYear() ? ' ' + d.getFullYear() : '');
}

/* ---------- Intention ---------- */
const IDEAS = ['Fall asleep without my phone', 'Pause before I react', 'Be kinder to myself', 'Start the day calm'];
export function IntentionSheet() {
  const { s, set, closeSheet, toast } = useApp();
  const [v, setV] = useState(s.intention || '');
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Your intention" sub="One sentence on why you’re here. Mo keeps it in view." />
      <label className="col" style={{ gap: 8, marginTop: 6 }}>
        <span className="sr-only">Your intention</span>
        <textarea value={v} maxLength={80} rows={2} onChange={(e) => setV(e.target.value)} placeholder="I want to…" className="pressed"
          style={{ border: 0, outline: 'none', resize: 'none', borderRadius: 22, padding: '14px 18px', fontSize: 16, lineHeight: 1.4, fontFamily: 'inherit', color: 'var(--ink)' }} />
      </label>
      <span className="muted tnum" style={{ alignSelf: 'flex-end', fontSize: 12, fontWeight: 700, marginTop: 6 }}>{v.length}/80</span>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
        {IDEAS.map((i) => <button key={i} type="button" className="chip press" style={{ fontSize: 14 }} onClick={() => setV(i)}>{i}</button>)}
      </div>
      <button className="btn btn-primary press" style={{ marginTop: 18 }} onClick={() => { set({ intention: v.trim() }); closeSheet(); toast(v.trim() ? 'Mo will keep it in mind.' : 'Intention cleared.'); }}>Save</button>
    </>
  );
}

/* ---------- Weekly goal ---------- */
export function GoalSheet() {
  const { s, set, closeSheet, toast } = useApp();
  const [days, setDays] = useState(s.weeklyGoal || 3);
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Weekly goal" sub="Pick what fits your life. A goal you choose is one you keep." />
      <div className="pressed" style={{ marginTop: 8, padding: '14px 18px', borderRadius: 26 }}>
        <Stepper label="Days per week" value={days} min={1} max={7} unit="" onChange={setDays} />
        <p className="accent" style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700 }}>{days === 7 ? 'Every day' : days <= 2 ? 'A gentle start' : days <= 4 ? 'A steady habit' : 'A strong practice'}</p>
      </div>
      <p className="muted" style={{ margin: '12px 4px 0', fontSize: 13, lineHeight: 1.4 }}>Any session, story or timer over one minute counts as a day.</p>
      <button className="btn btn-primary press" style={{ marginTop: 16 }} onClick={() => { set({ weeklyGoal: days }); closeSheet(); toast(`Goal set: ${days} ${days === 1 ? 'day' : 'days'} a week.`); }}>Set goal</button>
    </>
  );
}

export function GoalRing({ done, goal, size = 96 }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r, pct = Math.min(1, done / goal);
  return (
    <span className="pressed" role="img" aria-label={`${done} of ${goal} days this week`} style={{ width: size, height: size, borderRadius: '50%', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .5s ease-out' }} />
      </svg>
      <span className="col" style={{ alignItems: 'center', lineHeight: 1.1 }} aria-hidden="true">
        {done >= goal ? <Icon name="check" size={26} sw={3} style={{ color: 'var(--accent)' }} /> : <span className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>{done}<span className="muted" style={{ fontSize: 15 }}>/{goal}</span></span>}
        <span className="muted" style={{ fontSize: 11, fontWeight: 800 }}>{done >= goal ? 'done' : 'days'}</span>
      </span>
    </span>
  );
}

/* ---------- Moon calendar: each practised day is a moon, fuller with more minutes ---------- */
function Moon({ level, today, future }) {
  const lit = 'var(--primary)';
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={{ opacity: future ? 0.35 : 1 }}>
      <defs><clipPath id="mc"><circle cx="15" cy="15" r="10" /></clipPath></defs>
      <circle cx="15" cy="15" r="10" fill={level ? lit : 'none'} stroke={level ? 'none' : 'var(--muted)'} strokeOpacity=".45" strokeWidth="1.5" strokeDasharray={level ? undefined : '2 3'} />
      {level && level < 3 ? <circle cx={level === 1 ? 11 : 3} cy="15" r="10.5" fill="var(--base)" clipPath="url(#mc)" /> : null}
      {today ? <circle cx="15" cy="15" r="13.5" fill="none" stroke="var(--accent)" strokeWidth="2" /> : null}
    </svg>
  );
}

export function MoonCalendar({ history }) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const mins = {};
  history.forEach((e) => { mins[e.d] = (mins[e.d] || 0) + e.min; });
  const cells = [];
  let practised = 0;
  for (let d = 1; d <= days; d++) {
    const k = dayKey(new Date(y, m, d)), n = mins[k] || 0;
    if (n) practised++;
    cells.push({ d, n, level: !n ? 0 : n < 10 ? 1 : n < 20 ? 2 : 3, today: d === now.getDate(), future: d > now.getDate() });
  }
  const month = now.toLocaleString('en', { month: 'long' });
  return (
    <div className="raised" style={{ marginTop: 18, padding: '16px 14px 14px', borderRadius: 26 }}>
      <div className="row" style={{ justifyContent: 'space-between', padding: '0 4px' }}>
        <h2 className="h2" style={{ fontSize: 16 }}>{month}</h2>
        <span className="muted tnum" style={{ fontSize: 13, fontWeight: 600 }}>{practised} {practised === 1 ? 'day' : 'days'} with Mo</span>
      </div>
      <div role="img" aria-label={`${month}: you practised on ${practised} days. ` + cells.filter((c) => c.n).map((c) => `${c.d}: ${c.n} minutes`).join(', ')}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', rowGap: 4, marginTop: 10, justifyItems: 'center' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={'h' + i} className="muted" style={{ fontSize: 11, fontWeight: 800, paddingBottom: 2 }}>{d}</span>)}
        {Array.from({ length: lead }).map((_, i) => <span key={'e' + i} />)}
        {cells.map((c) => (
          <span key={c.d} className="col" style={{ alignItems: 'center' }}>
            <Moon level={c.level} today={c.today} future={c.future} />
            <span className="tnum" style={{ fontSize: 10, fontWeight: c.today ? 800 : 600, color: c.today ? 'var(--accent)' : 'var(--muted)', marginTop: -2 }}>{c.d}</span>
          </span>
        ))}
      </div>
      <div className="row muted" style={{ gap: 14, marginTop: 10, justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
        <span className="row" style={{ gap: 2 }}><Moon level={1} />under 10 min</span>
        <span className="row" style={{ gap: 2 }}><Moon level={2} />10–19</span>
        <span className="row" style={{ gap: 2 }}><Moon level={3} />20+</span>
      </div>
    </div>
  );
}

/* ---------- Milestones ---------- */
export function milestones(s) {
  const best = Math.max(s.bestStreak || 0, s.streak || 0);
  const total = Math.max(s.totalMin || 0, s.monthMin || 0);
  const progs = PROGRAMS.filter((p) => ((s.programs || {})[p.id] || 0) >= p.days.length).length;
  const mk = (id, title, icon, have, need, unit) => ({ id, title, icon, done: have >= need, have: Math.min(have, need), need, unit });
  return [
    mk('first', 'First session', 'play', s.sessionsDone, 1, 'session'),
    mk('streak3', '3 days in a row', 'sparkle', best, 3, 'days'),
    mk('streak7', 'A full week', 'sparkle', best, 7, 'days'),
    mk('ten', '10 sessions', 'heart', s.sessionsDone, 10, 'sessions'),
    mk('min100', '100 mindful minutes', 'clock', total, 100, 'minutes'),
    mk('program', 'First program finished', 'layers', progs, 1, 'program'),
    mk('streak30', '30 days in a row', 'crown', best, 30, 'days'),
    mk('min600', '10 hours of calm', 'moon', total, 600, 'minutes')
  ];
}

export function Milestones() {
  const { s } = useApp();
  const [all, setAll] = useState(false);
  const list = milestones(s);
  const earned = list.filter((m) => m.done), open = list.filter((m) => !m.done);
  const shown = all ? list : [...earned.slice(-2), ...open.slice(0, 2)];
  const date = (id) => { const k = (s.earned || {})[id]; return k ? new Date(k + 'T12:00:00').toLocaleString('en', { day: 'numeric', month: 'short' }) : 'Earned'; };
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 className="label">Milestones</h2>
        <span className="muted tnum" style={{ fontSize: 13, fontWeight: 700, margin: '0 6px 10px 0' }}>{earned.length} of {list.length}</span>
      </div>
      <div className="raised" style={{ borderRadius: 26, padding: '6px 16px' }}>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {shown.map((m, i) => (
            <li key={m.id} className="row" style={{ gap: 12, padding: '10px 0', position: 'relative' }}>
              {i < shown.length - 1 ? <span aria-hidden="true" style={{ position: 'absolute', left: 19, top: 50, bottom: -10, width: 2, borderRadius: 1, background: m.done && shown[i + 1].done ? 'var(--primary)' : 'var(--line)' }} /> : null}
              <span className={m.done ? '' : 'pressed-sm'} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.done ? 'var(--primary)' : undefined, color: m.done ? 'var(--onp)' : 'var(--muted)', zIndex: 1 }}>
                <Icon name={m.done ? 'check' : m.icon} size={m.done ? 18 : 16} sw={m.done ? 2.8 : 2} />
              </span>
              <span className="col grow" style={{ gap: 4, minWidth: 0 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: m.done ? 'var(--ink)' : 'var(--body)' }}>{m.title}</span>
                {m.done ? <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{date(m.id)}</span> : (
                  <span className="row" style={{ gap: 10 }}>
                    <span className="track grow" style={{ height: 10, padding: 2 }} role="progressbar" aria-label={m.title} aria-valuemin={0} aria-valuemax={m.need} aria-valuenow={m.have}><span style={{ height: 6, width: (m.have / m.need) * 100 + '%' }} /></span>
                    <span className="muted tnum" style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{m.have}/{m.need}</span>
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
        <button className="btn-text" style={{ width: '100%', justifyContent: 'center' }} aria-expanded={all} onClick={() => setAll(!all)}>{all ? 'Show less' : `See all ${list.length}`}</button>
      </div>
    </>
  );
}
