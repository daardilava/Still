import React, { useState } from 'react';
import { useApp, TopBar, SwitchRow, LinkRow, Group } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { dayKey } from '../data.js';

/* GDPR: mood/health data and AI use are opt-in (default off), separate from each other, and can be withdrawn anytime. */
export const CONSENT_VERSION = 1;
export const moodOK = (s) => !!(s.consent && s.consent.mood);
export const aiOK = (s) => !!(s.consent && s.consent.ai);

export function Consent({ existing }) {
  const { s, set, nav, dialog } = useApp();
  const [age, setAge] = useState(!!(s.consent && s.consent.age));
  const [mood, setMood] = useState(moodOK(s));
  const [ai, setAi] = useState(aiOK(s));
  const [err, setErr] = useState(false);
  const save = () => {
    if (!age) { setErr(true); return; }
    set({ consent: { v: CONSENT_VERSION, age: true, mood, ai, at: dayKey() } });
    if (existing) nav.back(); else nav.push('firstIntro');
  };
  const under16 = () => dialog({
    title: 'Still is for people 16 and older',
    message: 'For now, Still isn’t available to younger people. If you’re going through something hard, a trusted adult or a free helpline can help.',
    actions: [{ label: 'Find support', onPress: () => nav.push('support') }, { label: 'OK', bold: true }]
  });
  return (
    <div className="pad">
      {existing ? <div style={{ height: 8 }} /> : <TopBar />}
      <div className="col" style={{ alignItems: 'center', textAlign: 'center', marginTop: existing ? 24 : 6 }}>
        <Mo size={76} mood="calm" glow={false} />
        <h1 className="h1" style={{ marginTop: 6 }}>Your data, your choice</h1>
        <p className="lead" style={{ marginTop: 6, marginBottom: 6 }}>{existing ? 'We’ve added privacy choices. Pick what Still may keep.' : 'Your practice stays private. Change these anytime.'}</p>
      </div>
      <Group>
        <SwitchRow icon="check" title="I’m 16 or older" sub="Required to use Still" on={age} onChange={(v) => { setAge(v); setErr(false); }} />
      </Group>
      {err ? <p role="alert" style={{ margin: '8px 12px 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--danger, #C2416B)' }}>Please confirm your age to continue.</p> : null}
      <Group>
        <SwitchRow icon="heart" title="Save how I feel" sub="Check-ins, moods and answers to Mo, kept on this phone for insights. Health data." on={mood} onChange={setMood} />
        <SwitchRow icon="sparkle" title="Personal sessions with AI" sub="What you write to Mo is sent to an AI service to write sessions, chapters and letters." on={ai} onChange={setAi} />
      </Group>
      <p className="muted" style={{ margin: '12px 12px 0', fontSize: '0.8125rem', lineHeight: 1.45 }}>Both stay off unless you turn them on. Everything else works either way.</p>
      <div className="row" style={{ justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        <button className="btn-text" style={{ fontSize: '0.875rem' }} onClick={() => nav.push('legal', { doc: 'privacy' })}>Privacy policy</button>
        <button className="btn-text" style={{ fontSize: '0.875rem' }} onClick={under16}>I’m younger than 16</button>
      </div>
      <div className="grow" style={{ minHeight: 12 }} />
      <button className="btn btn-primary press" style={{ marginTop: 12 }} onClick={save}>Continue</button>
    </div>
  );
}

/* ---------- Download my data ---------- */
export function exportData(s) {
  const pick = (o, ks) => Object.fromEntries(ks.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
  return {
    app: 'Still', format: 1, exportedAt: new Date().toISOString(),
    account: { name: s.user.name, email: s.user.email, plus: s.user.plus, memberSince: s.since },
    choices: { consent: s.consent, reminder: s.reminder, goals: s.goals, level: s.level, intention: s.intention, weeklyGoal: s.weeklyGoal },
    practice: pick(s, ['sessionsDone', 'monthMin', 'totalMin', 'streak', 'bestStreak', 'lastDone', 'programs', 'saved', 'downloads', 'kindness', 'readChapters']),
    sessions: s.history || [],
    moods: s.moodLog || [],
    answersToMo: s.answers || {},
    madeByMo: (s.aiSessions || []).map((x) => ({ title: x.title, made: x.made, practice: x.practice, youWrote: x.feeling })),
    soundscapes: s.mixes || [],
    settings: pick(s, ['dark', 'matchDevice', 'textSize', 'haptics', 'autoplay', 'wifiOnly', 'defaultLen', 'bell', 'autoDim', 'quietOn', 'moVoice', 'pace'])
  };
}

export async function downloadData(s, toast) {
  const data = JSON.stringify(exportData(s), null, 2);
  const filename = `still-my-data-${dayKey()}.json`;
  try {
    const c = typeof window !== 'undefined' && window.claude;
    const dl = c && c.use ? await c.use('downloads') : null;
    if (dl) {
      await dl.save({ filename, data });
      toast('Your data is saved.');
      return;
    }
  } catch (e) {
    if (e && e.code === 'declined') return;
  }
  try {
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Your data is downloading.');
  } catch (e) { toast('Couldn’t create the file here. Try on another device.'); }
}

/* ---------- Settings › Privacy ---------- */
export function PrivacySettings() {
  const { s, set, dialog, toast } = useApp();
  const setConsent = (patch) => set((prev) => ({ consent: { v: CONSENT_VERSION, age: true, at: dayKey(), ...(prev.consent || {}), ...patch } }));
  const moodOff = () => dialog({
    title: 'Stop saving how you feel?',
    message: 'Mo won’t ask how you feel and insights will pause. You can also delete what’s already saved.',
    actions: [
      { label: 'Cancel' },
      { label: 'Stop, keep history', onPress: () => setConsent({ mood: false }) },
      { label: 'Stop and delete', destructive: true, onPress: () => { set((prev) => ({ consent: { ...(prev.consent || {}), mood: false }, moodLog: [], answers: {}, pre: null, history: (prev.history || []).map((e) => ({ ...e, pre: null, post: null })) })); toast('Mood data deleted.'); } }
    ]
  });
  return (
    <>
      <h2 className="label">Privacy</h2>
      <Group>
        <SwitchRow icon="heart" title="Save how I feel" sub="Check-ins, moods and answers to Mo (health data)" on={moodOK(s)} onChange={(v) => (v ? setConsent({ mood: true }) : moodOff())} />
        <SwitchRow icon="sparkle" title="Personal sessions with AI" sub="Sends what you write to an AI service" on={aiOK(s)} onChange={(v) => setConsent({ ai: v })} />
        <LinkRow icon="download" title="Download my data" sub="A file with everything Still keeps about you" onClick={() => downloadData(s, toast)} />
      </Group>
    </>
  );
}

/* ---------- Inline nudge where a feature needs a choice ---------- */
export function NeedsChoice({ kind }) {
  const { set, s } = useApp();
  const ai = kind === 'ai';
  return (
    <div className="pressed col" role="note" style={{ marginTop: 14, padding: '14px 16px', borderRadius: 22, gap: 8 }}>
      <span className="row" style={{ gap: 10, fontWeight: 800, fontSize: '0.9375rem' }}><Icon name={ai ? 'sparkle' : 'heart'} size={18} style={{ color: 'var(--accent)' }} />{ai ? 'This uses AI' : 'Mood saving is off'}</span>
      <span className="muted" style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>{ai ? 'To write your session, what you type is sent to an AI service. Mo can still use built-in words if you’d rather not.' : 'Turn it on to see how sessions change how you feel.'}</span>
      <button className="chip press on" style={{ alignSelf: 'flex-start', fontSize: '0.875rem' }} onClick={() => set((prev) => ({ consent: { v: CONSENT_VERSION, age: true, at: dayKey(), ...(prev.consent || {}), [ai ? 'ai' : 'mood']: true } }))}>{ai ? 'Allow AI for personal sessions' : 'Save how I feel'}</button>
    </div>
  );
}
