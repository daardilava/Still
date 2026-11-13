import React, { useEffect, useMemo, useState } from 'react';
import { useApp, TabBar, OptionList, SheetTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { SESSIONS, PROGRAMS, STORIES, UNLOCKS, CATS, TIPS, SOUNDS, IMG, GOAL_CAT, MOOD_COLORS, LENGTHS, findSession, fmt, weekKey } from '../data.js';
import { WidgetSheet } from './extras.jsx';
import { SleepTab, PlanCard, ProgramsRow } from './programs.jsx';
import { CollectionSheet } from './insights.jsx';
import { JourneyTiles, TapMo } from './journey.jsx';
import { ComposeEntry } from './compose.jsx';
import { PracticesRow } from './practices.jsx';
import { TopBar } from '../ui.jsx';
import { MoAvatar, sinceLine, IntentionSheet, GoalSheet, GoalRing, MoonCalendar, Milestones, milestones } from './profile.jsx';
const milestoneCount = (s) => milestones(s).filter((m) => m.done).length;

let searchSeen = false;

export function Tabs() {
  const { s, set } = useApp();
  const tab = s.tab || 'home';
  return (
    <>
      <div className="screen" key={tab}>
        {tab === 'home' ? <Home /> : tab === 'sleep' ? <SleepTab /> : tab === 'search' || tab === 'timer' ? <Search /> : <Profile />}
      </div>
      <TabBar tab={tab} onTab={(t) => set({ tab: t })} />
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function OfflineBanner() {
  const { s } = useApp();
  if (!s.offline) return null;
  return (
    <div className="banner" role="status">
      <Icon name="offline" size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      You’re offline. Downloaded sessions still work.
    </div>
  );
}

function PlusTag() {
  return <span className="tag plus"><Icon name="crown" size={11} sw={2.4} />Plus</span>;
}

/* ---------- Home ---------- */
function Home() {
  const { s, nav } = useApp();
  const resume = s.resume ? findSession(s.resume.id) : null;
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const name = s.user.name ? ', ' + s.user.name : '';
  return (
    <div className="pad-tabs">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="col">
          <span className="muted" style={{ fontSize: 14, fontWeight: 700 }}>{greeting()}{name}</span>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Still</span>
        </span>
        <button className="icon-btn press" aria-label="Reminder settings" onClick={() => nav.push('reminder', { mode: 'edit' })}><Icon name="bell" /></button>
      </div>
      <OfflineBanner />

      {resume ? (
        <button className="raised press row" onClick={() => nav.push('player', { id: resume.id, minutes: s.resume.minutes, startAt: s.resume.elapsed })}
          style={{ marginTop: 16, width: '100%', border: 0, borderRadius: 24, padding: 10, gap: 12, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
          <img src={resume.img} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', objectPosition: resume.pos }} />
          <span className="col grow" style={{ minWidth: 0 }}>
            <span className="muted" style={{ fontSize: 12, fontWeight: 800 }}>Continue where you left off</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{resume.title}</span>
            <span className="muted tnum" style={{ fontSize: 12, fontWeight: 600 }}>At {fmt(s.resume.elapsed)} of {fmt(s.resume.minutes * 60)}</span>
          </span>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="play" size={15} /></span>
        </button>
      ) : null}

      <TapMo tip={tip} />
      <PlanCard />
      <ComposeEntry />
      <JourneyTiles />
    </div>
  );
}

/* ---------- Explore: browse when nothing is typed ---------- */
function Browse() {
  const { s, nav } = useApp();
  const goal = s.goals.find((g) => GOAL_CAT[g] && GOAL_CAT[g] !== 'All') || s.goals[0] || 'Just curious';
  const goalCat = GOAL_CAT[goal] || 'All';
  const picks = SESSIONS.filter((x) => goalCat === 'All' || x.cat === goalCat).slice(0, 4);
  const tile = { border: 0, borderRadius: 24, padding: '14px 14px 12px', gap: 6, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' };
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, marginTop: 8 }}>
        <button className="raised press col" style={tile} onClick={() => nav.push('timer')}>
          <span className="pressed-sm" style={{ width: 44, height: 44, borderRadius: 15, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="timer" size={22} /></span>
          <span style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>Timer</span>
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>Silence or soft sound</span>
        </button>
        <button className="raised press col" style={tile} onClick={() => nav.push('compose')}>
          <span className="pressed-sm" style={{ width: 44, height: 44, borderRadius: 15, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkle" size={22} /></span>
          <span style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>Made by Mo</span>
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>A session for right now</span>
        </button>
      </div>
      <PracticesRow />
      <ProgramsRow />
      {picks.length ? (
        <>
          <div style={{ marginTop: 24 }}>
            <h2 className="h2" style={{ fontSize: 17 }}>Picked for you</h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600 }}>Because you chose “{goal}”</p>
          </div>
          <div className="hscroll">
            {picks.map((x) => (
              <button key={x.id} className="raised press" onClick={() => nav.push('session', { id: x.id })}
                style={{ flexShrink: 0, width: 150, border: 0, borderRadius: 22, padding: 8, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
                <img src={x.img} alt="" style={{ width: '100%', height: 88, objectFit: 'cover', borderRadius: 16, objectPosition: x.pos }} />
                <span style={{ display: 'block', margin: '8px 4px 0', fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>{x.title}</span>
                <span className="muted" style={{ display: 'block', margin: '2px 4px 4px', fontSize: 12, fontWeight: 600 }}>{x.lengths[0]}+ min{x.plus && !s.user.plus ? ' · Plus' : ''}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

/* ---------- Search ---------- */
function Search() {
  const { s, nav } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [len, setLen] = useState('Any');
  const [dlOnly, setDlOnly] = useState(false);
  const [loading, setLoading] = useState(!searchSeen);
  useEffect(() => { if (!loading) return; const t = setTimeout(() => { searchSeen = true; setLoading(false); }, 600); return () => clearTimeout(t); }, []);
  const lenTest = (LENGTHS.find((l) => l[0] === len) || LENGTHS[0])[1];
  const ql = q.trim().toLowerCase();
  /* Programs and sleep stories are searchable too; they show above sessions. */
  const extra = useMemo(() => (dlOnly ? [] : [
    ...PROGRAMS.map((p) => ({ key: 'p' + p.id, title: p.title, cat: p.cat, lengths: p.days.map((d) => d.min), img: p.img, pos: p.pos, kind: 'Program', sub: `${p.days.length} days · Program`, locked: false, go: () => nav.push('program', { id: p.id }) })),
    ...STORIES.map((st) => ({ key: 's' + st.id, title: st.title, cat: 'Sleep', lengths: [st.min], img: st.img, pos: st.pos, kind: 'Story', sub: `${st.min} min · Sleep story`, locked: st.plus && !s.user.plus, go: () => (st.plus && !s.user.plus ? nav.push('paywall', { source: 'story', name: st.title }) : nav.push('story', { id: st.id })) }))
  ].filter((x) => (cat === 'All' || x.cat === cat) && lenTest(x) && (ql ? (x.title + ' ' + x.sub + ' ' + x.cat).toLowerCase().includes(ql) : cat !== 'All'))), [ql, cat, len, dlOnly, s.user.plus]);
  const res = useMemo(() => SESSIONS.filter((x) => (cat === 'All' || x.cat === cat) && lenTest(x) && (!dlOnly || s.downloads.includes(x.id)) && (x.title + ' ' + x.cat).toLowerCase().includes(q.trim().toLowerCase())), [q, cat, len, dlOnly, s.downloads]);
  const browsing = !ql && cat === 'All' && len === 'Any' && !dlOnly;
  return (
    <div className="pad-tabs">
      <h1 className="h1">Explore</h1>
      <OfflineBanner />
      <label className="pressed" style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, height: 54, padding: '0 18px', borderRadius: 27, color: 'var(--muted)' }}>
        <Icon name="search" size={18} />
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Search sessions</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sessions, stories, programs"
          style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--ink)', minWidth: 0 }} />
        {q ? <button className="btn-text" style={{ minHeight: 44, minWidth: 44, padding: 0, marginRight: -12 }} onClick={() => setQ('')} aria-label="Clear search"><Icon name="close" size={16} sw={2.4} /></button> : null}
      </label>
      <div className="hscroll" style={{ paddingTop: 18 }}>
        {CATS.map((c) => <button key={c} type="button" aria-pressed={cat === c} className={'chip press' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="hscroll" style={{ paddingTop: 2 }} role="group" aria-label="Filter by length">
        {LENGTHS.map(([l]) => <button key={l} type="button" aria-pressed={len === l} className={'chip press' + (len === l ? ' on' : '')} style={{ fontSize: 14 }} onClick={() => setLen(l)}>{l}</button>)}
        <button type="button" aria-pressed={dlOnly} className={'chip press' + (dlOnly ? ' on' : '')} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setDlOnly(!dlOnly)}><Icon name="download" size={15} sw={2.2} />Downloaded</button>
      </div>
      {browsing && !loading ? <Browse /> : null}
      {browsing && !loading ? <h2 className="label">All sessions</h2> : null}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '18px 16px', marginTop: 6 }} aria-busy="true" aria-label="Loading sessions">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 176 }} />)}
        </div>
      ) : res.length || extra.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '18px 16px', marginTop: 6 }}>
          {extra.map((x) => (
            <button key={x.key} className="raised press" onClick={x.go}
              style={{ border: 0, padding: '8px 8px 12px', borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', position: 'relative', opacity: s.offline ? 0.55 : 1 }}>
              <img src={x.img} alt="" style={{ width: '100%', height: 108, objectFit: 'cover', borderRadius: 18, objectPosition: x.pos }} />
              <span style={{ margin: '8px 4px 0', fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>{x.title}</span>
              <span className="muted" style={{ margin: '0 4px', fontSize: 12, fontWeight: 600 }}>{x.sub}</span>
              <span style={{ position: 'absolute', top: 14, left: 14 }}>{x.locked ? <PlusTag /> : <span className="tag" style={{ background: 'var(--base)' }}>{x.kind}</span>}</span>
            </button>
          ))}
          {res.map((x) => {
            const offlineLocked = s.offline && !s.downloads.includes(x.id);
            return (
              <button key={x.id} className="raised press" onClick={() => nav.push('session', { id: x.id })}
                style={{ border: 0, padding: '8px 8px 12px', borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', position: 'relative', opacity: offlineLocked ? 0.55 : 1 }}>
                <img src={x.img} alt="" style={{ width: '100%', height: 108, objectFit: 'cover', borderRadius: 18, objectPosition: x.pos }} />
                <span style={{ margin: '8px 4px 0', fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>{x.title}</span>
                <span className="muted" style={{ margin: '0 4px', fontSize: 12, fontWeight: 600 }}>{x.lengths[0]}–{x.lengths[x.lengths.length - 1]} min · {x.cat}</span>
                {x.plus && !s.user.plus ? <span style={{ position: 'absolute', top: 14, left: 14 }}><PlusTag /></span> : null}
                {s.downloads.includes(x.id) ? <span className="raised-sm" style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }} aria-label="Downloaded" role="img"><Icon name="download" size={14} sw={2.4} /></span> : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="col" style={{ alignItems: 'center', textAlign: 'center', marginTop: 30 }}>
          <Mo size={130} mood="oops" />
          <h2 className="h2" style={{ marginTop: 14 }}>Mo couldn’t find that</h2>
          <p className="lead">Try a shorter word, or browse a category instead.</p>
          <button className="btn btn-soft press" style={{ width: 'auto', padding: '0 24px', marginTop: 16 }} onClick={() => { setQ(''); setCat('All'); setLen('Any'); setDlOnly(false); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Timer ---------- */
function BellSheet({ value, onPick }) {
  const { closeSheet } = useApp();
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Interval bell" sub="A soft chime during silent sessions." />
      <OptionList label="Interval bell" options={['Off', 'Every 5 min', 'Halfway']} value={value} onChange={(v) => { onPick(v); closeSheet(); }} />
    </>
  );
}

export function TimerScreen() {
  const { s, set, nav, sheet, platform } = useApp();
  const [mins, setMins] = useState(s.defaultLen || 15);
  const [sound, setSound] = useState('Rain');
  const circ = 2 * Math.PI * 92;
  return (
    <div className="pad">
      <TopBar title="Timer" />
      <p className="lead" style={{ marginTop: 10 }}>Sit in silence, or with a soft sound. Mo keeps time.</p>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <button className="icon-btn press" style={{ width: 52, height: 52 }} aria-label="One minute less" onClick={() => setMins(Math.max(1, mins - 1))}><Icon name="minus" sw={2.2} /></button>
        <div className="raised" style={{ width: 210, height: 210, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="210" height="210" viewBox="0 0 210 210" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="105" cy="105" r="92" fill="none" stroke="var(--muted)" strokeOpacity=".18" strokeWidth="6" />
            <circle cx="105" cy="105" r="92" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(circ * Math.min(mins, 60)) / 60} ${circ}`} transform="rotate(-90 105 105)" style={{ transition: 'stroke-dasharray .25s ease-out' }} />
          </svg>
          <div className="pressed" aria-live="polite" style={{ width: 150, height: 150, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="tnum accent" style={{ fontSize: 54, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{mins}</span>
            <span className="muted" style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>minutes</span>
          </div>
        </div>
        <button className="icon-btn press" style={{ width: 52, height: 52 }} aria-label="One minute more" onClick={() => setMins(Math.min(90, mins + 1))}><Icon name="plus" sw={2.2} /></button>
      </div>
      <div role="radiogroup" aria-label="Quick lengths" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 10, marginTop: 20 }}>
        {[5, 10, 15, 20, 30].map((v) => (
          <button key={v} type="button" role="radio" aria-checked={mins === v} className={'chip press tnum' + (mins === v ? ' on' : '')} style={{ padding: 0 }} onClick={() => setMins(v)}>{v}</button>
        ))}
      </div>
      <p style={{ margin: '20px 0 12px', fontSize: 14, fontWeight: 800 }}>Ambient sound</p>
      <div role="radiogroup" aria-label="Ambient sound" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
        {Object.keys(SOUNDS).map((k) => {
          const on = sound === k;
          return (
            <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setSound(k)} className="press"
              style={{ height: 78, borderRadius: 22, border: 0, background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)', cursor: 'pointer' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: SOUNDS[k], border: k === 'Silence' ? '2px dashed var(--muted)' : 0 }} />{k}
            </button>
          );
        })}
      </div>
      <div className="raised row" style={{ marginTop: 18, height: 64, borderRadius: 22, padding: '0 8px 0 16px', justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: 10, fontWeight: 800, fontSize: 15 }}><Icon name="bell" style={{ color: 'var(--accent)' }} />Interval bell</span>
        <button className="pressed-sm press" aria-haspopup="dialog" onClick={() => sheet(<BellSheet value={s.bell} onPick={(v) => set({ bell: v })} />)}
          style={{ height: 48, padding: '0 12px 0 16px', borderRadius: 24, border: 0, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 14, color: 'var(--accent)', cursor: 'pointer' }}>
          {s.bell}<Icon name={platform === 'ios' ? 'updown' : 'down'} size={16} sw={2.2} />
        </button>
      </div>
      <button className="btn btn-primary press" style={{ marginTop: 18 }} onClick={() => nav.push('player', { timer: true, minutes: mins, sound })}>Start {mins} min</button>
    </div>
  );
}

/* ---------- Profile ---------- */
function Profile() {
  const { s, nav, sheet } = useApp();
  const max = Math.max(20, ...s.week);
  const today = (new Date().getDay() + 6) % 7;
  const saved = s.saved.map((id) => SESSIONS.find((x) => x.id === id)).filter(Boolean);
  const goal = s.weeklyGoal || 3;
  const daysDone = s.week.filter((m) => m > 0).length;
  return (
    <div className="pad-tabs">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 className="h1">Your journey</h1>
        <button className="icon-btn press" aria-label="Settings" onClick={() => nav.push('settings')}><Icon name="gear" size={20} sw={1.8} /></button>
      </div>
      <div className="raised" style={{ marginTop: 18, borderRadius: 28, padding: 12 }}>
        <button className="press row" onClick={() => nav.push('editProfile')} aria-label={`Edit profile, ${s.user.name || 'Guest'}`} style={{ width: '100%', border: 0, background: 'none', padding: 0, gap: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
          <MoAvatar size={76} bg={s.avatarBg} />
          <span className="col grow" style={{ gap: 3, minWidth: 0 }}>
            <span className="row" style={{ gap: 8 }}><span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' }}>{s.user.name || (s.user.signedIn ? 'Add your name' : 'Guest')}</span>{s.user.plus ? <PlusTag /> : null}</span>
            <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{sinceLine(s)}</span>
            <span className="muted tnum" style={{ fontSize: 13 }}>{s.sessionsDone} {s.sessionsDone === 1 ? 'session' : 'sessions'} · {Math.max(s.totalMin || 0, s.monthMin)} minutes</span>
          </span>
          <Icon name="edit" size={18} style={{ color: 'var(--muted)', marginRight: 6 }} />
        </button>
        <button className="pressed press row" onClick={() => sheet(<IntentionSheet />)} style={{ width: '100%', marginTop: 12, border: 0, borderRadius: 20, padding: '12px 14px', minHeight: 52, gap: 10, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
          <Icon name="heart" size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span className="col grow" style={{ gap: 1, minWidth: 0 }}>
            <span className="muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>My intention</span>
            <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, color: s.intention ? 'var(--ink)' : 'var(--accent)' }}>{s.intention ? `“${s.intention}”` : 'Add one sentence on why you’re here'}</span>
          </span>
        </button>
      </div>

      <button className="raised press row" onClick={() => sheet(<GoalSheet />)} aria-label={`Weekly goal: ${daysDone} of ${goal} days. Current streak ${s.streak} days. Change goal`} style={{ marginTop: 18, width: '100%', border: 0, borderRadius: 26, padding: '14px 16px', gap: 16, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <GoalRing done={daysDone} goal={goal} />
        <span className="col grow" style={{ gap: 3, minWidth: 0 }}>
          <span className="muted" style={{ fontSize: 13, fontWeight: 800 }}>This week’s goal</span>
          <span style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>{daysDone >= goal ? 'Goal reached. Mo is proud.' : daysDone ? `${goal - daysDone} more ${goal - daysDone === 1 ? 'day' : 'days'} to go` : `${goal} days with Mo`}</span>
          <span className="muted tnum" style={{ fontSize: 13 }}>{s.streak ? `${s.streak}-day streak` : 'No streak yet'} · {s.restWeek === weekKey() ? 'rest day used' : '1 rest day left'}</span>
        </span>
        <Icon name="chevron" size={16} sw={2.4} style={{ color: 'var(--muted)' }} />
      </button>

      <MoonCalendar history={s.history || []} />

      <button className="raised press row" onClick={() => nav.push('progress')} style={{ marginTop: 18, width: '100%', border: 0, borderRadius: 24, padding: '14px 16px', minHeight: 64, gap: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <span className="pressed-sm" style={{ width: 44, height: 44, borderRadius: 15, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="target" size={22} /></span>
        <span className="col grow" style={{ gap: 2, minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Your progress</span>
          <span className="muted tnum" style={{ fontSize: 13 }}>Letter from Mo · insights · {milestoneCount(s)} milestones · Mo’s collection</span>
        </span>
        <Icon name="chevron" size={16} sw={2.4} style={{ color: 'var(--muted)' }} />
      </button>

      <h2 className="label">Saved</h2>
      {saved.length ? (
        <div className="col" style={{ gap: 14 }}>
          {saved.map((x) => (
            <button key={x.id} className="raised press row" onClick={() => nav.push('session', { id: x.id })} style={{ border: 0, borderRadius: 22, padding: 10, gap: 12, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
              <img src={x.img} alt="" style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', objectPosition: x.pos }} />
              <span className="col grow"><span style={{ fontWeight: 800, fontSize: 15 }}>{x.title}</span><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{x.cat} · {x.lengths.join('/')} min</span></span>
              <Icon name="bookmark-fill" size={18} style={{ color: 'var(--accent)' }} />
            </button>
          ))}
        </div>
      ) : (
        <div className="pressed row" style={{ borderRadius: 24, padding: 14, gap: 12 }}>
          <Mo size={60} mood="sleepy" glow={false} />
          <span className="muted" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>Nothing saved yet. Tap the bookmark on any session and Mo will keep it here.</span>
        </div>
      )}
    </div>
  );
}

export function MoodTrend({ log }) {
  const recent = log.slice(-14);
  if (!recent.length) {
    return (
      <div className="pressed row" style={{ borderRadius: 24, padding: 14, gap: 12 }}>
        <Mo size={60} mood="curious" glow={false} />
        <span className="muted" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>After each session Mo asks how you feel. Your answers will show up here.</span>
      </div>
    );
  }
  const counts = Object.keys(MOOD_COLORS).map((m) => [m, recent.filter((e) => e.mood === m).length]);
  const max = Math.max(...counts.map((x) => x[1]));
  const top = counts.reduce((a, b) => (b[1] > a[1] ? b : a));
  const ofTop = recent.filter((e) => e.mood === top[0]);
  const eve = ofTop.filter((e) => e.hour >= 18).length, morn = ofTop.filter((e) => e.hour < 12).length;
  const when = eve > ofTop.length / 2 ? ' after evening sessions' : morn > ofTop.length / 2 ? ' after morning sessions' : '';
  return (
    <div className="raised" style={{ borderRadius: 26, padding: '16px 18px' }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>You usually feel <span className="accent">{top[0].toLowerCase()}</span>{when}.</p>
      <div role="img" aria-label={`Last ${recent.length} check-ins: ` + counts.map(([m, n]) => `${m} ${n}`).join(', ')} className="col" style={{ gap: 10, marginTop: 14 }}>
        {counts.map(([m, n]) => (
          <div key={m} className="row" style={{ gap: 10 }}>
            <span style={{ width: 70, fontSize: 13, fontWeight: 700 }}>{m}</span>
            <div className="pressed-sm grow" style={{ height: 14, borderRadius: 7, padding: 3 }}>
              <div style={{ height: 8, borderRadius: 4, width: max ? (n / max) * 100 + '%' : 0, background: MOOD_COLORS[m] }} />
            </div>
            <span className="tnum muted" style={{ width: 20, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{n}</span>
          </div>
        ))}
      </div>
      <p className="muted" style={{ margin: '12px 0 0', fontSize: 12 }}>Based on your last {recent.length} check-ins. Stored only on this device.</p>
    </div>
  );
}
