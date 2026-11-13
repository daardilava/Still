import React, { useState } from 'react';
import { useApp, TopBar, Group, LinkRow, SwitchRow, Field, Segment, OptionList, SheetTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo, MoDisc } from '../mo.jsx';
import { SESSIONS, demoHistory } from '../data.js';
import { Spinner } from './onboarding.jsx';
import { PaceSheet, WidgetSheet, askHealth } from './extras.jsx';
import { MoAvatar, BgPicker } from './profile.jsx';
import { QuietSettings } from './quiet.jsx';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function PickSheet({ title, sub, options, value, onPick }) {
  const { closeSheet } = useApp();
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={title} sub={sub} />
      <OptionList label={title} options={options} value={value} onChange={(v) => { onPick(v); setTimeout(closeSheet, 180); }} />
    </>
  );
}

/* ---------- Settings ---------- */
export function Settings() {
  const { s, set, nav, sheet, dialog, toast, platform, dark, deviceDark, resetAll } = useApp();
  const ios = platform === 'ios';
  return (
    <div className="pad">
      <TopBar title="Settings" />

      <h2 className="label">Appearance</h2>
      <Group>
        <SwitchRow icon="moon" title="Dark mode" sub="Easier on the eyes at night" on={dark}
          onChange={(v) => set({ matchDevice: false, dark: v })} />
        <SwitchRow icon="phone" title="Match device setting" on={s.matchDevice}
          onChange={(v) => set({ matchDevice: v, dark: v ? s.dark : dark })} />
      </Group>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.45, margin: '12px 12px 0' }}>
        {s.matchDevice ? `Following your phone’s ${ios ? 'appearance' : 'dark theme'} setting (currently ${deviceDark ? 'dark' : 'light'}). Turn on Dark mode to choose it yourself.` : `Still will stay ${dark ? 'dark' : 'light'} whatever your phone is set to.`}
      </p>

      <h2 className="label">Account</h2>
      <Group>
        <LinkRow icon="profile" title={s.user.name || 'Your profile'} value={s.user.signedIn ? s.user.email : 'Guest'} onClick={() => nav.push('editProfile')} />
        <LinkRow icon="crown" title="Subscription" value={s.user.plus ? 'Still Plus' : 'Free'}
          onClick={() => (s.user.plus
            ? dialog({ title: 'Manage subscription', message: `Plans are managed in your ${ios ? 'App Store' : 'Google Play'} account. Mo will open it for you.`, actions: [{ label: 'Cancel' }, { label: 'Open', bold: true, onPress: () => toast(`Opening ${ios ? 'App Store' : 'Google Play'} subscriptions…`) }] })
            : nav.push('paywall', { source: 'settings' }))} />
      </Group>

      <h2 className="label">Practice</h2>
      <Group>
        <LinkRow icon="bell" title="Daily reminder" value={s.reminder.on ? s.reminder.time : 'Off'} onClick={() => nav.push('reminder', { mode: 'edit' })} />
        <LinkRow icon="clock" title="Default session length" value={s.defaultLen + ' min'}
          onClick={() => sheet(<PickSheet title="Default length" sub="Used when a session offers several lengths." options={[5, 10, 12, 15, 20].map((m) => ({ value: m, label: m + ' minutes' }))} value={s.defaultLen} onPick={(v) => set({ defaultLen: v })} />)} />
        <LinkRow icon="pulse" title="Breathing rhythm" value={s.pace === 'custom' ? 'Your own' : s.pace[0].toUpperCase() + s.pace.slice(1)} onClick={() => sheet(<PaceSheet />)} />
        <LinkRow icon="chime" title="Interval bell" value={s.bell}
          onClick={() => sheet(<PickSheet title="Interval bell" sub="A soft chime during silent sessions." options={['Off', 'Every 5 min', 'Halfway']} value={s.bell} onPick={(v) => set({ bell: v })} />)} />
      </Group>

      <h2 className="label">Sound & playback</h2>
      <Group>
        <SwitchRow icon="pulse" title="Haptics" sub="Gentle taps for breath cues" on={s.haptics} onChange={(v) => set({ haptics: v })} />
        <SwitchRow icon="heart" title="Check in before sessions" sub="Mo asks how you feel, for your insights" on={s.checkIn !== false} onChange={(v) => set({ checkIn: v })} />
        <QuietSettings />
        <SwitchRow icon="moon" title="Dim screen in sleep sessions" sub="Mo dims the screen after a few quiet seconds" on={s.autoDim} onChange={(v) => set({ autoDim: v })} />
        <SwitchRow icon="playo" title="Autoplay next session" on={s.autoplay} onChange={(v) => set({ autoplay: v })} />
        <SwitchRow icon="wifi" title="Download on Wi-Fi only" on={s.wifiOnly} onChange={(v) => set({ wifiOnly: v })} />
        <LinkRow icon="download" title="Downloads" value={s.downloads.length + (s.downloads.length === 1 ? ' session' : ' sessions')} onClick={() => nav.push('downloads')} />
      </Group>

      <h2 className="label">Connections</h2>
      <Group>
        <SwitchRow icon="heart" title={ios ? 'Save to Apple Health' : 'Save to Health Connect'} sub="Mindful minutes from every session you finish" on={s.healthSync}
          onChange={(v) => (v ? askHealth({ platform, dialog, set, toast }) : set({ healthSync: false }))} />
        <LinkRow icon="phone" title="Home screen widget" value="Mo + streak" onClick={() => sheet(<WidgetSheet />)} />
      </Group>

      <h2 className="label">Support</h2>
      <Group>
        <LinkRow icon="heart" title="Need more support?" sub="Crisis lines and other help" onClick={() => nav.push('support')} />
        <LinkRow icon="help" title="Help & feedback" onClick={() => nav.push('feedback')} />
        <LinkRow icon="star" title="Rate Still" onClick={() => dialog({ title: 'Enjoying Still?', message: 'A quick rating helps other people find a quiet minute too.', actions: [{ label: 'Not now' }, { label: 'Rate', bold: true, onPress: () => toast('Thank you! Mo is blushing.') }] })} />
        <LinkRow icon="lock" title="Privacy policy" onClick={() => nav.push('legal', { doc: 'privacy' })} />
        <LinkRow icon="doc" title="Terms of use" onClick={() => nav.push('legal', { doc: 'terms' })} />
      </Group>

      <h2 className="label">Prototype controls</h2>
      <Group>
        <div style={{ padding: '10px 12px' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14 }}>Show as</p>
          <Segment label="Platform" options={[{ value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]} value={platform} onChange={(v) => set({ platform: v })} />
        </div>
        <SwitchRow icon="offline" title="Simulate offline" on={s.offline} onChange={(v) => set({ offline: v })} />
        <SwitchRow icon="crown" title="Plus member" on={s.user.plus} onChange={(v) => set({ user: { ...s.user, plus: v } })} />
        <SwitchRow icon="fwd" title="Fast playback (20×)" sub="Finish sessions quickly while testing" on={s.fast} onChange={(v) => set({ fast: v })} />
        <LinkRow icon="pulse" title="Load sample history" sub="A returning user with a 6-day streak and check-ins" onClick={() => { set(demoHistory()); toast('Sample history loaded.'); }} />
        <LinkRow icon="rew" title="Restart onboarding" onClick={() => dialog({ title: 'Restart the prototype?', message: 'This clears everything and starts again from the splash screen.', actions: [{ label: 'Cancel' }, { label: 'Restart', destructive: true, onPress: resetAll }] })} />
      </Group>

      {s.user.signedIn ? (
        <>
          <button className="btn btn-soft press" style={{ marginTop: 28, color: 'var(--danger)' }}
            onClick={() => dialog({ title: 'Sign out?', message: 'Your downloads stay on this phone. Mo will be here when you’re back.', actions: [{ label: 'Cancel' }, { label: 'Sign out', destructive: true, onPress: () => { set({ user: { name: '', email: '', signedIn: false, plus: false }, onboarded: false, tab: 'home' }); nav.reset('welcome'); toast('Signed out.'); } }] })}>
            <Icon name="logout" />Sign out
          </button>
          <button className="btn-text btn-danger" style={{ marginTop: 6, fontSize: 14 }} onClick={() => nav.push('deleteAccount')}>Delete account</button>
        </>
      ) : (
        <button className="btn btn-primary press" style={{ marginTop: 28 }} onClick={() => nav.push('account')}>Create a free account</button>
      )}
      <p className="muted" style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, margin: '14px 0 0' }}>Still · Version [1.0.0] · Prototype</p>
    </div>
  );
}

/* ---------- Edit profile ---------- */
export function EditProfile() {
  const { s, set, nav, toast } = useApp();
  const [name, setName] = useState(s.user.name);
  const [email, setEmail] = useState(s.user.email);
  const [busy, setBusy] = useState(false);
  const [bg, setBg] = useState(s.avatarBg || 'lilac');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !s.user.signedIn;
  const initials = (name || 'You').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="pad">
      <TopBar title="Profile" />
      <div style={{ alignSelf: 'center', marginTop: 20 }}><MoAvatar size={116} bg={bg} /></div>
      <p className="muted" style={{ textAlign: 'center', margin: '12px 0 6px', fontSize: 13, fontWeight: 700 }}>Your Mo. Change what Mo wears in Mo’s collection.</p>
      <BgPicker value={bg} onChange={setBg} />
      <Field label="Name" value={name} onChange={setName} placeholder="[YOUR NAME]" autoComplete="name" />
      {s.user.signedIn ? <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={valid ? '' : 'Enter a valid email address.'} /> : (
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.45, marginTop: 18 }}>You’re using Still as a guest. <button className="btn-text" style={{ minHeight: 0, padding: 0 }} onClick={() => nav.push('account')}>Create an account</button> to keep your progress.</p>
      )}
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" disabled={!valid || busy} onClick={async () => { setBusy(true); await wait(700); set({ avatarBg: bg, user: { ...s.user, name: name.trim(), email } }); toast('Profile saved.'); nav.back(); }}>{busy ? <Spinner /> : 'Save'}</button>
    </div>
  );
}

/* ---------- Downloads ---------- */
export function Downloads() {
  const { s, set, nav, toast } = useApp();
  const list = s.downloads.map((id) => SESSIONS.find((x) => x.id === id)).filter(Boolean);
  return (
    <div className="pad">
      <TopBar title="Downloads" />
      {list.length ? (
        <>
          <p className="muted" style={{ fontSize: 14, margin: '18px 8px 0' }}><span className="tnum">{list.length}</span> sessions · about <span className="tnum">{list.length * 28}</span> MB on this phone</p>
          <div className="col" style={{ gap: 14, marginTop: 14 }}>
            {list.map((x) => (
              <div key={x.id} className="raised row" style={{ borderRadius: 22, padding: 10, gap: 12 }}>
                <img src={x.img} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', objectPosition: x.pos }} />
                <button className="col grow" onClick={() => nav.push('session', { id: x.id })} style={{ border: 0, background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', padding: 0, minHeight: 52, justifyContent: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{x.title}</span><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{x.cat} · 28 MB</span>
                </button>
                <button className="icon-btn press" aria-label={'Remove ' + x.title} onClick={() => { set({ downloads: s.downloads.filter((d) => d !== x.id) }); toast('Removed from this phone.'); }} style={{ color: 'var(--danger)' }}><Icon name="trash" /></button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="col grow" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <MoDisc size={200} mood="sleepy" />
          <h2 className="h2" style={{ marginTop: 22 }}>Nothing downloaded yet</h2>
          <p className="lead">Download a session and Mo will keep it here for flights, trains and quiet places with no signal.</p>
          <button className="btn btn-soft press" style={{ marginTop: 18, width: 'auto', padding: '0 24px' }} onClick={() => { nav.reset('tabs'); set({ tab: 'search' }); }}>Browse sessions</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Help & feedback ---------- */
export function Feedback() {
  const { nav } = useApp();
  const [topic, setTopic] = useState('Idea');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="pad" style={{ alignItems: 'center', textAlign: 'center' }}>
        <TopBar />
        <div className="grow" />
        <MoDisc size={220} mood="happy" enter />
        <h1 className="h1" style={{ marginTop: 24, fontSize: 26 }}>Thank you</h1>
        <p className="lead">Mo passed your note to the team. We read every message.</p>
        <div className="grow" />
        <button className="btn btn-primary press" onClick={nav.back}>Done</button>
      </div>
    );
  }
  return (
    <div className="pad">
      <TopBar title="Help & feedback" />
      <button className="pressed row press" onClick={() => nav.push('support')} style={{ marginTop: 18, width: '100%', border: 0, borderRadius: 22, padding: 14, gap: 12, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <Icon name="heart" style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span className="col grow"><span style={{ fontWeight: 800, fontSize: 15 }}>Need more support?</span><span className="muted" style={{ fontSize: 13 }}>If things feel heavy, Mo can point you to people who can help.</span></span>
        <Icon name="chevron" size={16} sw={2.4} style={{ color: 'var(--muted)' }} />
      </button>
      <h2 className="label">Common questions</h2>
      <Group>
        <LinkRow icon="help" title="How do downloads work?" onClick={() => nav.push('legal', { doc: 'faq-downloads' })} />
        <LinkRow icon="help" title="How do I cancel Plus?" onClick={() => nav.push('legal', { doc: 'faq-cancel' })} />
      </Group>
      <h2 className="label">Send us a note</h2>
      <Segment label="Topic" options={['Idea', 'Problem', 'Praise']} value={topic} onChange={setTopic} />
      <Field label="Message" textarea value={msg} onChange={setMsg} placeholder={topic === 'Problem' ? 'What happened? What did you expect?' : 'Tell Mo anything…'} />
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" disabled={msg.trim().length < 3 || busy} onClick={async () => { setBusy(true); await wait(900); setSent(true); }}>{busy ? <Spinner /> : 'Send'}</button>
    </div>
  );
}

/* ---------- Legal & FAQ (placeholder copy) ---------- */
const DOCS = {
  privacy: ['Privacy policy', ['[PLACEHOLDER — replace with your real privacy policy before launch.]', 'What we collect: [LIST THE DATA YOU COLLECT, e.g. account email, session history, crash reports].', 'How we use it: [EXPLAIN PURPOSES].', 'Your choices: you can export or delete your data at any time from Settings › Delete account.', 'Contact: [PRIVACY CONTACT EMAIL].']],
  terms: ['Terms of use', ['[PLACEHOLDER — replace with your real terms of use before launch.]', 'Still is a wellbeing app and is not a medical service. [ADD YOUR DISCLAIMER].', 'Subscriptions: [DESCRIBE BILLING, TRIALS AND CANCELLATION].', 'Company: [COMPANY NAME, ADDRESS].']],
  'faq-downloads': ['How do downloads work?', ['Open a session and tap “Download for offline”. Downloaded sessions play without a connection and show an offline badge.', 'Manage or remove them in Settings › Downloads.']],
  'faq-cancel': ['How do I cancel Plus?', ['Subscriptions are managed by the App Store or Google Play, not inside Still.', 'iOS: Settings › your name › Subscriptions. Android: Google Play › Profile › Payments & subscriptions.', 'You keep Plus until the end of the period you paid for.']]
};
export function Legal({ doc = 'privacy' }) {
  const [title, paras] = DOCS[doc] || DOCS.privacy;
  return (
    <div className="pad">
      <TopBar title={title} />
      <div className="raised" style={{ marginTop: 20, padding: '8px 20px', borderRadius: 26 }}>
        {paras.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)' }}>{p}</p>)}
      </div>
    </div>
  );
}

/* ---------- Delete account (required by App Store when accounts can be created) ---------- */
export function DeleteAccount() {
  const { resetAll, toast } = useApp();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="pad">
      <TopBar title="Delete account" />
      <div style={{ alignSelf: 'center', marginTop: 18 }}><Mo size={120} mood="oops" /></div>
      <h1 className="h1" style={{ fontSize: 24, textAlign: 'center', marginTop: 8 }}>Mo will miss you</h1>
      <p className="lead">Deleting your account permanently removes your profile, streak, history, saved sessions and downloads. This can’t be undone.</p>
      <p className="lead">If you have Still Plus, cancel it in your app store account first — deleting your account doesn’t stop billing.</p>
      <Field label='Type DELETE to confirm' value={text} onChange={setText} autoComplete="off" />
      <div className="grow" style={{ minHeight: 20 }} />
      <button className="btn btn-primary press" style={{ background: text === 'DELETE' ? 'var(--danger)' : undefined }} disabled={text !== 'DELETE' || busy}
        onClick={async () => { setBusy(true); await wait(1200); resetAll(); setTimeout(() => toast('Your account was deleted.'), 50); }}>
        {busy ? <Spinner /> : 'Delete my account'}
      </button>
    </div>
  );
}

/* ---------- Support & crisis resources ---------- */
export function Support() {
  return (
    <div className="pad">
      <TopBar title="Need more support?" />
      <div style={{ alignSelf: 'center', marginTop: 16 }}><MoDisc size={170} mood="calm" /></div>
      <p className="lead" style={{ textAlign: 'center' }}>Still can help you slow down, but it isn’t a substitute for professional care.</p>
      <div className="raised" style={{ marginTop: 20, padding: '16px 18px', borderRadius: 24 }}>
        <h2 className="h2" style={{ fontSize: 17 }}>If you’re in crisis</h2>
        <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--body)' }}>If you’re in danger or might act on thoughts of harming yourself, call your local emergency number now.</p>
        <p style={{ margin: '8px 0 14px', fontSize: 15, lineHeight: 1.5, color: 'var(--body)' }}>To talk to someone, you can find a free, confidential helpline for your country.</p>
        <a className="btn btn-primary press" style={{ height: 52 }} href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">Find a helpline</a>
        <p className="muted" style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.45 }}>findahelpline.com lists crisis lines worldwide. [ADD LOCAL NUMBERS FOR YOUR LAUNCH COUNTRIES]</p>
      </div>
      <div className="raised" style={{ marginTop: 18, padding: '16px 18px', borderRadius: 24 }}>
        <h2 className="h2" style={{ fontSize: 17 }}>Talking to someone</h2>
        <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--body)' }}>If stress, worry or poor sleep keeps getting in the way, a doctor, a therapist or someone you trust can help.</p>
      </div>
    </div>
  );
}
