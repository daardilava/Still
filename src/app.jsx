import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppCtx } from './ui.jsx';
import { Splash, Welcome, Goals, FirstIntro, Account, SignUp, SignIn, Forgot, Reminder, Paywall } from './screens/onboarding.jsx';
import { Tabs } from './screens/tabs.jsx';
import { Session, Player, Complete } from './screens/session.jsx';
import { Settings, EditProfile, Downloads, Feedback, Legal, DeleteAccount, Support } from './screens/settings.jsx';
import { demoHistory } from './data.js';
import { Program, Story } from './screens/programs.jsx';
import { Insights } from './screens/insights.jsx';
import { Journey, Breathe } from './screens/journey.jsx';
import { Compose } from './screens/compose.jsx';
import { Practice } from './screens/practices.jsx';
import { Progress } from './screens/progress.jsx';
import { TimerScreen } from './screens/tabs.jsx';
import { registerCustom } from './data.js';
import { QUIET_SCREENS, TEST_NOTES, Banner, quietName } from './screens/quiet.jsx';
import { WearCtx } from './mo.jsx';
import { milestones } from './screens/profile.jsx';
import { dayKey } from './data.js';

const KEY = 'still-prototype-v2';

const INITIAL = {
  onboarded: false,
  user: { name: '', email: '', signedIn: false, plus: false },
  goals: ['Sleep better'], level: 'New',
  reminder: { on: false, slot: 'Evening', time: '21:30', days: [0, 1, 2, 3, 4, 5, 6], permission: 'unknown' },
  /* A brand-new user starts empty; Sign in or "Load sample history" fills in a returning user. */
  saved: [], downloads: [], recent: [], moodLog: [], resume: null,
  streak: 0, lastDone: null, restWeek: null, monthMin: 0, sessionsDone: 0, week: [0, 0, 0, 0, 0, 0, 0],
  askedReview: false, lastCompletion: 0, lastResult: null,
  programs: {}, mixes: [], windDown: false,
  aiSessions: [], aiUses: [], aiChapters: {}, letters: {}, moVoice: true, aiSim: false,
  quietOn: false, quietReady: false, quietAsked: false, quietFavs: true,
  kindness: 0,
  answers: {}, readChapters: [], lastPlace: null, breathsWithMo: 0, tapBreathe: false,
  since: null, intention: '', weeklyGoal: 3, avatarBg: 'lilac', earned: {}, totalMin: 0,
  history: [], bestStreak: 0, moWear: null, lastUnlock: null, checkIn: true, pre: null,
  mix: { voice: 80, rain: 30, forest: 0, ocean: 0 }, pace: 'calm', customPace: { in: 4, hold: 2, out: 6 }, autoDim: true, healthSync: false,
  matchDevice: true, dark: false,
  haptics: true, autoplay: false, wifiOnly: true, defaultLen: 12, bell: 'Off',
  tab: 'home',
  platform: /android/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') ? 'android' : 'ios',
  deviceAppearance: 'auto', offline: false, fast: false
};

const SCREENS = {
  splash: { C: Splash, anim: 'fade' },
  welcome: { C: Welcome, anim: 'fade' },
  goals: { C: Goals },
  firstIntro: { C: FirstIntro },
  support: { C: Support },
  account: { C: Account },
  signup: { C: SignUp },
  signin: { C: SignIn },
  forgot: { C: Forgot },
  reminder: { C: Reminder },
  paywall: { C: Paywall, anim: 'modal' },
  tabs: { C: Tabs, own: true, anim: 'fade' },
  session: { C: Session },
  player: { C: Player, anim: 'modal' },
  complete: { C: Complete, anim: 'fade' },
  settings: { C: Settings },
  editProfile: { C: EditProfile },
  downloads: { C: Downloads },
  feedback: { C: Feedback },
  legal: { C: Legal },
  deleteAccount: { C: DeleteAccount },
  program: { C: Program },
  insights: { C: Insights },
  journey: { C: Journey },
  compose: { C: Compose },
  practice: { C: Practice, anim: 'modal' },
  progress: { C: Progress },
  timer: { C: TimerScreen },
  breathe: { C: Breathe, anim: 'modal' },
  story: { C: Story, anim: 'modal' }
};
export const SCREEN_NAMES = Object.keys(SCREENS);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...INITIAL, ...JSON.parse(raw) };
  } catch (e) { /* storage unavailable */ }
  return INITIAL;
}

let uid = 1;

export function App() {
  const [s, setS] = useState(load);
  const [stack, setStack] = useState([{ id: uid++, name: 'splash', params: {} }]);
  const [sheetEl, setSheetEl] = useState(null);
  const [dialogCfg, setDialogCfg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const sheetRef = useRef(null);
  /* Move focus into a sheet when it opens; Escape closes the top sheet or dialog. */
  useEffect(() => { if (sheetEl && sheetRef.current) sheetRef.current.focus(); }, [sheetEl]);
  const [mqDark, setMqDark] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const fn = (e) => setMqDark(e.matches);
    mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', fn) : mq.removeListener(fn));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }, [s]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setDialogCfg((d) => { if (d) return null; setSheetEl(null); return d; });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const set = useCallback((patch) => setS((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })), []);
  const deviceDark = s.deviceAppearance === 'auto' ? mqDark : s.deviceAppearance === 'dark';
  const dark = s.matchDevice ? deviceDark : s.dark;
  const platform = s.platform;

  useEffect(() => { document.body.classList.toggle('page-dark', dark); }, [dark]);
  /* Stamp the join date once, and the date each milestone is first reached. */
  useEffect(() => {
    const fresh = milestones(s).filter((m) => m.done && !(s.earned || {})[m.id]);
    if (!s.since || fresh.length) set((prev) => ({ since: prev.since || dayKey(), earned: { ...(prev.earned || {}), ...Object.fromEntries(fresh.map((m) => [m.id, dayKey()])) } }));
  }, [s.sessionsDone, s.bestStreak, s.monthMin, s.programs, s.since]);

  const nav = useMemo(() => ({
    push: (name, params = {}) => { setSheetEl(null); setStack((st) => [...st, { id: uid++, name, params }]); },
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    replace: (name, params = {}) => setStack((st) => [...st.slice(0, -1), { id: uid++, name, params }]),
    reset: (name, params = {}) => { setSheetEl(null); setStack([{ id: uid++, name, params }]); }
  }), []);

  const toast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg({ msg, k: uid++ });
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const haptic = useCallback((kind) => {
    if (!s.haptics || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try { navigator.vibrate(kind === 'success' ? [12, 60, 18] : 8); } catch (e) { /* ignore */ }
  }, [s.haptics]);

  const resetAll = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    setS((prev) => ({ ...INITIAL, platform: prev.platform, deviceAppearance: prev.deviceAppearance }));
    setSheetEl(null); setDialogCfg(null);
    setStack([{ id: uid++, name: 'splash', params: {} }]);
  }, []);

  const ctx = {
    s, set, nav, platform, dark, deviceDark, toast, haptic, resetAll,
    speed: s.fast ? 20 : 1,
    sheet: (el) => setSheetEl(el), closeSheet: () => setSheetEl(null),
    dialog: (cfg) => setDialogCfg(cfg), closeDialog: () => setDialogCfg(null)
  };

  registerCustom(s.aiSessions);
  const top = stack[stack.length - 1];
  const def = SCREENS[top.name] || SCREENS.tabs;

  /* Quiet mode: while practising, banners are held (system DND / Focus) and Still's own reminders are never sent. */
  const practising = QUIET_SCREENS.includes(top.name);
  const quiet = s.quietOn && s.quietReady;
  const [banner, setBanner] = useState(null);
  const [held, setHeld] = useState([]);
  const noteIdx = useRef(0);
  const bannerTimer = useRef(null);
  const showBanner = (n) => { clearTimeout(bannerTimer.current); setBanner({ ...n, k: uid++ }); bannerTimer.current = setTimeout(() => setBanner(null), 4000); };
  const notify = () => {
    const n = TEST_NOTES[noteIdx.current++ % TEST_NOTES.length];
    if (practising && (quiet || n.own)) { setHeld((h) => [...h, n]); return; }
    showBanner(n);
  };
  const wasPractising = useRef(false);
  useEffect(() => {
    if (practising) { setBanner(null); }
    if (wasPractising.current && !practising && held.length) {
      const n = held.length, others = held.filter((x) => !x.own).length;
      setTimeout(() => toast(`While you were still, ${n} ${n === 1 ? 'notification' : 'notifications'} waited${others && quiet ? ` · ${quietName(platform)} is off again` : ''}.`), 900);
      setHeld([]);
    }
    wasPractising.current = practising;
  }, [practising]);
  const anim = def.anim === 'fade' ? 'enter-fade' : def.anim === 'modal' ? 'enter-modal' : platform === 'ios' ? 'enter-ios' : 'enter-android';
  const C = def.C;

  return (
    <AppCtx.Provider value={ctx}>
      <WearCtx.Provider value={s.moWear || null}>
      <div className={'stage ' + (dark ? 'theme-dark' : 'theme-light')}>
        <div className={'phone ' + platform + ' ' + (dark ? 'theme-dark' : 'theme-light')} data-screen={top.name}>
          <div key={top.id} className={anim} style={{ position: 'absolute', inset: 0 }}>
            {def.own ? <C {...top.params} /> : <div className="screen"><C {...top.params} /></div>}
          </div>

          {sheetEl ? (
            <>
              <div className="scrim" aria-hidden="true" onClick={() => setSheetEl(null)} />
              <div className="sheet" role="dialog" aria-modal="true" ref={sheetRef} tabIndex={-1} style={{ outline: 'none' }}>{sheetEl}</div>
            </>
          ) : null}

          {dialogCfg ? <Dialog cfg={dialogCfg} platform={platform} onClose={() => setDialogCfg(null)} /> : null}
          {toastMsg ? <div key={toastMsg.k} className="toast" role="status">{toastMsg.msg}</div> : null}
          {banner ? <Banner key={banner.k} note={banner} platform={platform} onClose={() => setBanner(null)} /> : null}
          <div className="phone-notch" aria-hidden="true" />
          <div className="home-ind" aria-hidden="true" />
        </div>
        <DevPanel ctx={ctx} current={top.name} notify={notify} held={held.length} quiet={practising && quiet} />
      </div>
      </WearCtx.Provider>
    </AppCtx.Provider>
  );
}

function Dialog({ cfg, platform, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const b = ref.current && ref.current.querySelector('button'); b && b.focus(); }, []);
  const acts = cfg.actions && cfg.actions.length ? cfg.actions : [{ label: 'OK', bold: true }];
  const run = (a) => { onClose(); a.onPress && a.onPress(); };
  return (
    <>
      <div className="scrim dialog-scrim" aria-hidden="true" />
      <div ref={ref} className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby={cfg.message ? 'dlg-m' : undefined}>
        <div className="dt" id="dlg-t">{cfg.title}</div>
        {cfg.message ? <div className="dm" id="dlg-m">{cfg.message}</div> : <div style={{ height: platform === 'ios' ? 14 : 0 }} />}
        <div className={'da' + (platform === 'ios' && acts.length > 2 ? ' stack' : '')}>
          {acts.map((a) => (
            <button key={a.label} type="button" className={(a.bold ? 'b ' : '') + (a.destructive ? 'd' : '')} onClick={() => run(a)}>{a.label}</button>
          ))}
        </div>
      </div>
    </>
  );
}

function DevPanel({ ctx, current, notify, held, quiet }) {
  const { s, set, nav, resetAll, platform } = ctx;
  const jump = (name) => {
    if (name === 'tabs' || name === 'splash' || name === 'welcome') { nav.reset(name); return; }
    const params = name === 'session' ? { id: 'unwind' } : name === 'player' ? { id: 'unwind', minutes: 12 } : name === 'complete' ? { id: 'unwind', minutes: 12 } : name === 'reminder' ? { mode: 'edit' } : name === 'paywall' ? { source: 'settings' } : name === 'program' ? { id: 'sleep7' } : name === 'story' ? { id: 'lake' } : name === 'practice' ? { id: 'ground' } : name === 'legal' ? { doc: 'privacy' } : {};
    nav.reset('tabs');
    nav.push(name, params);
  };
  const Seg = ({ value, options, onChange }) => (
    <div className="seg">{options.map(([v, l]) => <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>
  );
  return (
    <aside className="devpanel" aria-label="Prototype controls">
      <h2>Still · clickable MVP</h2>
      <p>Everything is sample data. Use these controls to test states; on a phone they live in Settings › Prototype controls.</p>
      <div className="dl">Platform</div>
      <Seg value={platform} options={[['ios', 'iOS'], ['android', 'Android']]} onChange={(v) => set({ platform: v })} />
      <div className="dl">Phone appearance</div>
      <Seg value={s.deviceAppearance} options={[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]} onChange={(v) => set({ deviceAppearance: v })} />
      <div className="dl">States</div>
      <label className="tg"><span>Offline</span><input type="checkbox" checked={s.offline} onChange={(e) => set({ offline: e.target.checked })} /></label>
      <label className="tg"><span>Plus member</span><input type="checkbox" checked={s.user.plus} onChange={(e) => set({ user: { ...s.user, plus: e.target.checked } })} /></label>
      <label className="tg"><span>Simulate AI (no Claude)</span><input type="checkbox" checked={!!s.aiSim} onChange={(e) => set({ aiSim: e.target.checked })} /></label>
      <label className="tg"><span>Fast playback (20×)</span><input type="checkbox" checked={s.fast} onChange={(e) => set({ fast: e.target.checked })} /></label>
      <div className="dl">Jump to screen</div>
      <select value={current} onChange={(e) => jump(e.target.value)} aria-label="Jump to screen">
        {SCREEN_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <div className="dl">Notifications</div>
      <button className="reset" onClick={notify}>Send a test notification</button>
      <p style={{ marginTop: 6 }}>{held ? `${held} held while practising${quiet ? ' (quiet mode on)' : ''}.` : 'Try it on Home, then during a session.'}</p>
      <button className="reset" onClick={() => set(demoHistory())}>Load sample history</button>
      <button className="reset" style={{ marginTop: 8 }} onClick={resetAll}>Restart from splash</button>
    </aside>
  );
}
