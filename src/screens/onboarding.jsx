import React, { useEffect, useState } from 'react';
import { useApp, TopBar, Steps, Segment, Field } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo, MoDisc } from '../mo.jsx';
import { GOALS, IMG, demoHistory } from '../data.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Spinner() {
  return <span className="spin" aria-hidden="true" />;
}

/* ---------- Splash ---------- */
export function Splash() {
  const { s, nav } = useApp();
  useEffect(() => {
    /* Returning users skip straight through; only the very first launch lingers for Mo's entrance. */
    const t = setTimeout(() => nav.reset(s.onboarded ? 'tabs' : 'welcome'), s.onboarded ? 450 : 1300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="pad" style={{ alignItems: 'center', justifyContent: 'center' }} aria-busy="true">
      <Mo mood="calm" size={170} enter />
      <p style={{ margin: '22px 0 0', fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em' }}>Still</p>
      <p className="muted" style={{ margin: '6px 0 0', fontWeight: 600 }}>Finding a quiet minute…</p>
    </div>
  );
}

/* ---------- Welcome ---------- */
export function Welcome() {
  const { nav } = useApp();
  return (
    <div className="pad">
      <div className="row" style={{ gap: 12 }}>
        <span className="raised-sm" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mo size={34} glow={false} mood="calm" />
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Still</span>
      </div>
      <div style={{ position: 'relative', alignSelf: 'center', marginTop: 46 }}>
        <MoDisc size={280} mood="hello" enter />
        <div className="raised" style={{ position: 'absolute', left: -14, top: -30, maxWidth: 200, padding: '12px 16px', borderRadius: '20px 20px 20px 6px', fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
          Hi, I’m Mo. Let’s find a quiet minute.
        </div>
      </div>
      <h1 className="h1" style={{ marginTop: 40, fontSize: 32 }}>Breathe in. Slow down. Begin again.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Guided sessions for sleep, focus and stress relief — a few quiet minutes a day.</p>
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" onClick={() => nav.push('goals')}>Start your journey</button>
      <button className="btn-text" style={{ marginTop: 8, color: 'var(--muted)', fontWeight: 500 }} onClick={() => nav.push('signin')}>
        Already have an account? <span className="accent" style={{ fontWeight: 800 }}>Sign in</span>
      </button>
    </div>
  );
}

/* ---------- Goals ---------- */
export function Goals() {
  const { s, set, nav } = useApp();
  const picked = s.goals;
  const toggle = (g) => set({ goals: picked.includes(g) ? picked.filter((x) => x !== g) : [...picked, g] });
  return (
    <div className="pad">
      <div className="row" style={{ gap: 18 }}>
        <button className="icon-btn press" aria-label="Back" onClick={nav.back}><Icon name={'back_' + useApp().platform} /></button>
        <Steps n={1} of={4} />
      </div>
      <div className="row" style={{ gap: 12, marginTop: 26, alignItems: 'flex-start' }}>
        <div className="grow">
          <h1 className="h1">What brings you to Still?</h1>
          <p className="lead">Pick as many as you like. Mo will shape your daily session around them.</p>
        </div>
        <Mo size={64} mood={picked.length ? 'happy' : 'curious'} glow={false} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginTop: 20 }}>
        {GOALS.map(([g, icon]) => {
          const on = picked.includes(g);
          return (
            <button key={g} type="button" aria-pressed={on} onClick={() => toggle(g)} className="press"
              style={{ position: 'relative', minHeight: 96, padding: 14, borderRadius: 24, border: 0, background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--primary)' : 'var(--base)', color: on ? 'var(--onp)' : 'var(--accent)', boxShadow: on ? 'none' : 'var(--down-sm)' }}>
                <Icon name={icon} size={20} />
              </span>
              <span style={{ fontSize: 15, fontWeight: on ? 800 : 700, color: on ? 'var(--accent)' : 'var(--ink)', lineHeight: 1.2 }}>{g}</span>
              {on ? <span style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} sw={3} /></span> : null}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '22px 0 12px', fontSize: 14, fontWeight: 700 }}>How familiar are you with meditation?</p>
      <Segment label="Experience" options={['New', 'Some', 'Regular']} value={s.level} onChange={(v) => set({ level: v })} />
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" disabled={!picked.length} onClick={() => nav.push('firstIntro')}>{picked.length ? 'Continue' : 'Pick at least one'}</button>
    </div>
  );
}

/* ---------- First session intro (value before sign-up) ---------- */
export function FirstIntro() {
  const { nav, platform } = useApp();
  const tips = [['sparkle', 'Find a comfortable seat, or lie down'], ['speaker', 'Sound on, or headphones in'], ['heart', 'Your mind will wander. That’s part of it.']];
  return (
    <div className="pad">
      <div className="row" style={{ gap: 18 }}>
        <button className="icon-btn press" aria-label="Back" onClick={nav.back}><Icon name={'back_' + platform} /></button>
        <Steps n={2} of={4} />
      </div>
      <div style={{ alignSelf: 'center', marginTop: 30 }}><MoDisc size={240} mood="calm" enter /></div>
      <h1 className="h1" style={{ marginTop: 30 }}>Let’s try two minutes together</h1>
      <p className="lead">No experience needed. Breathe in as Mo grows, and out as Mo settles.</p>
      <div className="col" style={{ gap: 12, marginTop: 18 }}>
        {tips.map(([i, t]) => (
          <div key={t} className="row" style={{ gap: 12, fontSize: 15, fontWeight: 700 }}>
            <span className="pressed-sm" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}><Icon name={i} size={18} /></span>{t}
          </div>
        ))}
      </div>
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" onClick={() => nav.push('player', { id: 'first', minutes: 2, onboarding: true })}><Icon name="play" size={16} />Start · 2 min</button>
      <button className="btn-text" style={{ marginTop: 6 }} onClick={() => nav.push('account')}>Skip for now</button>
    </div>
  );
}

/* ---------- Create account ---------- */
export function Account() {
  const { platform, set, nav, s, dark } = useApp();
  const [busy, setBusy] = useState(null);
  const provider = async (name) => {
    setBusy(name);
    await wait(900);
    set({ user: { ...s.user, signedIn: true, name: s.user.name || '', email: s.user.email || 'you@example.com', provider: name } });
    setBusy(null);
    nav.push('reminder', { mode: 'onboarding' });
  };
  const base = { height: 56, borderRadius: 28, fontSize: 16, width: '100%', boxShadow: 'var(--up-sm)' };
  const apple = <button key="a" className="btn press" style={{ ...base, background: dark ? '#fff' : '#000', color: dark ? '#000' : '#fff' }} onClick={() => provider('Apple')} disabled={!!busy}>{busy === 'Apple' ? <Spinner /> : 'Continue with Apple'}</button>;
  const google = <button key="g" className="btn press" style={{ ...base, background: 'var(--base)', color: 'var(--ink)' }} onClick={() => provider('Google')} disabled={!!busy}>{busy === 'Google' ? <Spinner /> : 'Continue with Google'}</button>;
  const email = <button key="e" className="btn press" style={{ ...base, background: 'var(--base)', color: 'var(--accent)' }} onClick={() => nav.push('signup')} disabled={!!busy}><Icon name="mail" />Continue with email</button>;
  return (
    <div className="pad">
      <div className="row" style={{ gap: 18 }}>
        <button className="icon-btn press" aria-label="Back" onClick={nav.back}><Icon name={'back_' + platform} /></button>
        <Steps n={3} of={4} />
      </div>
      <div className="raised frame" style={{ marginTop: 22 }}>
        <div className="frame-in" style={{ height: 200, position: 'relative' }}>
          <img src={IMG.night} alt="Illustration of a crescent moon over purple mountains and a still lake" />
          <div style={{ position: 'absolute', right: 18, bottom: 4 }}><Mo size={110} mood="calm" glow={false} /></div>
        </div>
      </div>
      <h1 className="h1" style={{ marginTop: 24, fontSize: 28 }}>Keep your progress safe</h1>
      <p className="lead">Create a free account so Mo can remember your streak and favourites on every device.</p>
      <div className="col" style={{ gap: 14, marginTop: 20 }}>{platform === 'ios' ? [apple, google, email] : [google, email]}</div>
      <div className="grow" style={{ minHeight: 12 }} />
      <button className="btn-text" onClick={() => nav.push('reminder', { mode: 'onboarding' })}>Skip for now</button>
      <p className="muted" style={{ textAlign: 'center', fontSize: 12, lineHeight: 1.5, margin: '2px 0 0' }}>By continuing you agree to our terms and privacy policy.</p>
      <div className="row" style={{ justifyContent: 'center', gap: 4 }}>
        <button className="btn-text" style={{ fontSize: 13 }} onClick={() => nav.push('legal', { doc: 'terms' })}>Terms</button>
        <button className="btn-text" style={{ fontSize: 13 }} onClick={() => nav.push('legal', { doc: 'privacy' })}>Privacy Policy</button>
      </div>
    </div>
  );
}

/* ---------- Email sign-up ---------- */
export function SignUp() {
  const { set, nav, s } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const errs = {
    name: !name.trim() ? 'Tell Mo what to call you.' : '',
    email: !EMAIL_RE.test(email) ? 'Enter a valid email address.' : '',
    pw: pw.length < 8 ? 'Use at least 8 characters.' : ''
  };
  const ok = !errs.name && !errs.email && !errs.pw;
  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!ok) return;
    setBusy(true);
    await wait(1000);
    set({ user: { ...s.user, signedIn: true, name: name.trim(), email, provider: 'Email' } });
    nav.push('reminder', { mode: 'onboarding' });
  };
  return (
    <form className="pad" onSubmit={submit} noValidate>
      <TopBar title="Create account" />
      <Field label="Your name" value={name} onChange={setName} autoComplete="given-name" placeholder="[YOUR NAME]" error={touched ? errs.name : ''} />
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="you@example.com" error={touched ? errs.email : ''} />
      <Field label="Password" type="password" value={pw} onChange={setPw} autoComplete="new-password" hint="At least 8 characters." error={touched ? errs.pw : ''} />
      <div className="grow" style={{ minHeight: 24 }} />
      <button type="submit" className="btn btn-primary press" disabled={busy}>{busy ? <Spinner /> : 'Create account'}</button>
      <button type="button" className="btn-text" onClick={() => nav.replace('signin')}>I already have an account</button>
    </form>
  );
}

/* ---------- Sign in ---------- */
export function SignIn() {
  const { set, nav, s } = useApp();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email) || !pw) { setErr('Enter your email and password.'); return; }
    setBusy(true); setErr('');
    await wait(1000);
    setBusy(false);
    if (pw.toLowerCase() === 'wrong') { setErr('That email and password don’t match. Try again or reset your password.'); return; }
    set({ onboarded: true, ...demoHistory(), user: { ...s.user, signedIn: true, email, name: s.user.name || '', provider: 'Email' } });
    nav.reset('tabs');
  };
  return (
    <form className="pad" onSubmit={submit} noValidate>
      <TopBar title="Sign in" />
      <div style={{ alignSelf: 'center', marginTop: 20 }}><Mo size={120} mood="hello" /></div>
      <h1 className="h1" style={{ textAlign: 'center', fontSize: 26, marginTop: 10 }}>Welcome back</h1>
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="you@example.com" />
      <Field label="Password" type="password" value={pw} onChange={setPw} autoComplete="current-password" error={err} />
      <button type="button" className="btn-text" style={{ alignSelf: 'flex-end', marginTop: 4 }} onClick={() => nav.push('forgot')}>Forgot password?</button>
      <div className="grow" style={{ minHeight: 24 }} />
      <button type="submit" className="btn btn-primary press" disabled={busy}>{busy ? <Spinner /> : 'Sign in'}</button>
      <button type="button" className="btn-text" onClick={() => nav.replace('account')}>New here? Create an account</button>
    </form>
  );
}

/* ---------- Forgot password ---------- */
export function Forgot() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { nav } = useApp();
  const ok = EMAIL_RE.test(email);
  return (
    <div className="pad">
      <TopBar title="Reset password" />
      {sent ? (
        <div className="col grow" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <MoDisc size={220} mood="wink" />
          <h1 className="h1" style={{ marginTop: 28, fontSize: 26 }}>Check your inbox</h1>
          <p className="lead">If an account exists for {email}, you’ll get a link to reset your password in a minute or two.</p>
          <div className="grow" />
          <button className="btn btn-primary press" onClick={nav.back}>Back to sign in</button>
        </div>
      ) : (
        <>
          <p className="lead" style={{ marginTop: 18 }}>Enter the email you signed up with and we’ll send you a reset link.</p>
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="you@example.com" />
          <div className="grow" />
          <button className="btn btn-primary press" disabled={!ok || busy} onClick={async () => { setBusy(true); await wait(900); setSent(true); }}>{busy ? <Spinner /> : 'Send reset link'}</button>
        </>
      )}
    </div>
  );
}

/* ---------- Reminder (onboarding + edit from Settings) ---------- */
export function Reminder({ mode = 'onboarding' }) {
  const { s, set, nav, platform, dialog, toast } = useApp();
  const onb = mode === 'onboarding';
  const [slot, setSlot] = useState(s.reminder.slot);
  const [days, setDays] = useState(s.reminder.days);
  const slots = [['Morning', '07:30'], ['Midday', '12:30'], ['Evening', '21:30']];
  const time = slots.find((x) => x[0] === slot)[1];
  const names = [['M', 'Monday'], ['T', 'Tuesday'], ['W', 'Wednesday'], ['T', 'Thursday'], ['F', 'Friday'], ['S', 'Saturday'], ['S', 'Sunday']];
  const finish = () => {
    if (onb) { set({ onboarded: true }); nav.reset('tabs'); nav.push('paywall', { source: 'onboarding' }); }
    else nav.back();
  };
  const enable = () => {
    const save = (granted) => {
      set({ reminder: { ...s.reminder, on: granted, slot, time, days, permission: granted ? 'granted' : 'denied' } });
      toast(granted ? `Mo will nudge you at ${time}.` : 'No problem — you can turn reminders on in Settings.');
      finish();
    };
    if (s.reminder.permission === 'granted') { save(true); return; }
    dialog(platform === 'ios'
      ? { title: '“Still” Would Like to Send You Notifications', message: 'Notifications may include alerts, sounds and icon badges. These can be configured in Settings.', actions: [{ label: 'Don’t Allow', onPress: () => save(false) }, { label: 'Allow', bold: true, onPress: () => save(true) }] }
      : { title: 'Allow Still to send you notifications?', actions: [{ label: 'Don’t allow', onPress: () => save(false) }, { label: 'Allow', onPress: () => save(true) }] });
  };
  return (
    <div className="pad">
      {onb ? (
        <div className="row" style={{ gap: 18 }}>
          <button className="icon-btn press" aria-label="Back" onClick={nav.back}><Icon name={'back_' + platform} /></button>
          <Steps n={4} of={4} />
        </div>
      ) : <TopBar title="Daily reminder" />}
      <div className="row" style={{ gap: 12, marginTop: 26, alignItems: 'flex-start' }}>
        <div className="grow">
          <h1 className="h1">A gentle nudge, once a day</h1>
          <p className="lead">A daily reminder makes the habit easier to keep. Pick a time that’s usually quiet.</p>
        </div>
        <Mo size={64} mood="wink" glow={false} />
      </div>
      <div role="radiogroup" aria-label="Reminder time" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14, marginTop: 22 }}>
        {slots.map(([l, t]) => {
          const on = slot === l;
          return (
            <button key={l} type="button" role="radio" aria-checked={on} onClick={() => setSlot(l)} className="press"
              style={{ height: 80, borderRadius: 22, border: 0, background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}>
              <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{l}</span>
              <span className="tnum" style={{ fontSize: 22, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)' }}>{t}</span>
            </button>
          );
        })}
      </div>
      <p style={{ margin: '22px 0 12px', fontSize: 14, fontWeight: 700 }}>On these days</p>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        {names.map(([d, full], i) => {
          const on = days.includes(i);
          return (
            <button key={full} type="button" aria-pressed={on} aria-label={full} onClick={() => setDays(on ? days.filter((x) => x !== i) : [...days, i].sort())} className="press"
              style={{ width: 48, height: 48, padding: 0, border: 0, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, background: on ? 'var(--primary)' : 'var(--base)', color: on ? 'var(--onp)' : 'var(--muted)', boxShadow: on ? 'var(--up-sm)' : 'var(--down-sm)' }}>{d}</span>
            </button>
          );
        })}
      </div>
      <div className="raised" style={{ marginTop: 24, padding: 14, borderRadius: 24, display: 'flex', gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: 11, background: '#5B32C4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}><Mo size={40} glow={false} mood="calm" /></span>
        <span className="col grow" style={{ gap: 2 }}>
          <span className="row muted" style={{ justifyContent: 'space-between', fontSize: 13 }}><b style={{ color: 'var(--ink)' }}>Still</b><span className="tnum">{time}</span></span>
          <span style={{ fontSize: 14, fontWeight: 800 }}>Mo saved you a quiet spot</span>
          <span style={{ fontSize: 13, color: 'var(--body)' }}>Your {slot.toLowerCase()} session is ready. 12 minutes?</span>
        </span>
      </div>
      <div className="grow" style={{ minHeight: 20 }} />
      {s.reminder.permission !== 'granted' ? <p className="muted" style={{ textAlign: 'center', fontSize: 13, margin: '0 0 12px' }}>Next, {platform === 'ios' ? 'iOS' : 'Android'} will ask to allow notifications.</p> : null}
      <button className="btn btn-primary press" disabled={!days.length} onClick={enable}>{onb ? 'Turn on reminders' : 'Save reminder'}</button>
      {onb ? <button className="btn-text" style={{ marginTop: 6 }} onClick={() => { set({ reminder: { ...s.reminder, on: false } }); finish(); }}>Not now</button>
        : s.reminder.on ? <button className="btn-text btn-danger" style={{ marginTop: 6 }} onClick={() => { set({ reminder: { ...s.reminder, on: false } }); toast('Reminder turned off.'); nav.back(); }}>Turn off reminder</button> : null}
    </div>
  );
}

/* ---------- Paywall (Still Plus) ---------- */
export function Paywall({ source, name }) {
  const { s, set, nav, dialog, toast } = useApp();
  const [plan, setPlan] = useState('year');
  const [busy, setBusy] = useState(false);
  const close = () => (source === 'onboarding' ? nav.reset('tabs') : nav.back());
  const buy = async () => {
    setBusy(true);
    await wait(1300);
    setBusy(false);
    set({ user: { ...s.user, plus: true } });
    dialog({ title: 'Welcome to Still Plus', message: 'Mo unlocked every session, program and story for you. Enjoy the quiet.', actions: [{ label: 'Lovely', bold: true, onPress: close }] });
  };
  const perks = [['layers', 'Programs: 7 nights to better sleep and more'], ['book', 'Sleep stories and unlimited soundscapes'], ['sparkle', 'Unlimited sessions made for you by Mo'], ['sparkle', 'Every session, with new ones weekly'], ['pulse', 'All breathing rhythms with Mo'], ['target', 'Deeper insights on mood and minutes']];
  const lead = {
    program: `Keep going with ${name || 'this program'}. Day 1 was on us.`,
    story: `${name || 'This story'} and every sleep story are part of Plus.`,
    pace: 'Breathe to Box, Even, Relax or your own rhythm.',
    mix: 'Save as many soundscapes as you like.',
    winddown: 'Let Mo guide your whole wind-down each night.',
    insights: 'See your best time of day and how sessions change your mood.',
    ai: 'Unlimited sessions Mo makes for exactly how you feel.',
    practice: `${name || 'This practice'} and every hands-on practice are part of Plus.`
  }[source] || 'More quiet minutes, whenever you need them.';
  const free = ['A daily session picked by Mo', 'Silent timer with sounds', 'Calm breathing', 'Streaks, rest days and mood check-ins', 'Mo, the widget and reminders', 'Day 1 of every program, one sleep story, one saved mix', 'Downloads of free sessions', 'Support resources, always'];
  const Plan = ({ id, title, price, note, badge }) => {
    const on = plan === id;
    return (
      <button type="button" role="radio" aria-checked={on} onClick={() => setPlan(id)} className="press"
        style={{ position: 'relative', width: '100%', minHeight: 76, padding: '14px 18px', borderRadius: 24, border: on ? '2px solid var(--accent)' : '2px solid transparent', background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up-sm)', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid ' + (on ? 'var(--accent)' : 'var(--muted)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: on ? 'var(--accent)' : 'transparent' }} />
        </span>
        <span className="col grow"><span style={{ fontSize: 16, fontWeight: 800 }}>{title}</span><span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{note}</span></span>
        <span className="tnum" style={{ fontSize: 15, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)' }}>{price}</span>
        {badge ? <span className="tag plus" style={{ position: 'absolute', top: -10, right: 16 }}>{badge}</span> : null}
      </button>
    );
  };
  return (
    <div className="pad">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn-text" style={{ padding: 0, color: 'var(--muted)' }} onClick={async () => { toast('Checking your purchases…'); await wait(900); toast('No previous purchases found.'); }}>Restore</button>
        <button className="icon-btn press" aria-label="Close" onClick={close}><Icon name="close" size={16} sw={2.4} /></button>
      </div>
      <div style={{ alignSelf: 'center', marginTop: 4 }}><MoDisc size={170} mood="happy" enter /></div>
      <h1 className="h1" style={{ textAlign: 'center', marginTop: 18 }}>Still Plus</h1>
      <p className="lead" style={{ textAlign: 'center' }}>{lead}</p>
      <div className="col" style={{ gap: 12, marginTop: 18 }}>
        {perks.map(([i, t]) => (
          <div key={t} className="row" style={{ gap: 12, fontSize: 15, fontWeight: 700 }}>
            <span className="pressed-sm" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}><Icon name={i} size={18} /></span>{t}
          </div>
        ))}
      </div>
      <div role="radiogroup" aria-label="Plan" className="col" style={{ gap: 16, marginTop: 22 }}>
        <Plan id="year" title="Yearly" price="[PRICE]/yr" note="7 days free, then billed yearly" badge="Best value" />
        <Plan id="month" title="Monthly" price="[PRICE]/mo" note="Billed monthly, cancel anytime" />
      </div>
      {plan === 'year' && !s.user.plus ? (
        <div className="pressed" style={{ marginTop: 18, padding: '12px 16px', borderRadius: 22 }}>
          <p className="muted" style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>How your free trial works</p>
          {[['sparkle', 'Today', 'Full access to every session'], ['bell', 'Day 5', 'Mo reminds you the trial is ending'], ['crown', 'Day 7', 'Billing starts. Cancel before then and pay nothing.']].map(([i, d, t], k) => (
            <div key={d} className="row" style={{ gap: 12, alignItems: 'flex-start', padding: '6px 0' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: k === 0 ? 'var(--primary)' : 'var(--base)', color: k === 0 ? 'var(--onp)' : 'var(--accent)', boxShadow: k === 0 ? 'none' : 'var(--up-sm)' }}><Icon name={i} size={15} /></span>
              <span className="col"><span style={{ fontSize: 14, fontWeight: 800 }}>{d}</span><span className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>{t}</span></span>
            </div>
          ))}
        </div>
      ) : null}
      <details className="pressed freelist" style={{ marginTop: 16, padding: '0 16px', borderRadius: 22 }}>
        <summary style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, cursor: 'pointer', listStyle: 'none' }}>
          What stays free<span className="chev" style={{ display: "flex" }}><Icon name="down" size={16} sw={2.4} /></span>
        </summary>
        <ul style={{ margin: 0, padding: '0 0 14px', listStyle: 'none' }}>
          {free.map((f) => <li key={f} className="row" style={{ gap: 10, padding: '5px 0', fontSize: 14, fontWeight: 600, color: 'var(--body)' }}><Icon name="check" size={15} sw={2.6} style={{ color: 'var(--accent)', flexShrink: 0 }} />{f}</li>)}
        </ul>
      </details>
      <div className="grow" style={{ minHeight: 18 }} />
      <button className="btn btn-primary press" disabled={busy || s.user.plus} onClick={buy}>{busy ? <Spinner /> : s.user.plus ? 'You’re already on Plus' : plan === 'year' ? 'Start 7-day free trial' : 'Subscribe'}</button>
      <p className="muted" style={{ fontSize: 11, lineHeight: 1.45, textAlign: 'center', margin: '10px 0 0' }}>
        Subscription renews automatically unless cancelled at least 24 hours before the end of the period. Manage or cancel anytime in your {useApp().platform === 'ios' ? 'App Store' : 'Google Play'} account settings.
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn-text" style={{ fontSize: 13 }} onClick={() => nav.push('legal', { doc: 'terms' })}>Terms</button>
        <button className="btn-text" style={{ fontSize: 13 }} onClick={() => nav.push('legal', { doc: 'privacy' })}>Privacy</button>
        {source === 'onboarding' ? <button className="btn-text" style={{ fontSize: 13, color: 'var(--muted)' }} onClick={close}>Not now</button> : null}
      </div>
    </div>
  );
}
