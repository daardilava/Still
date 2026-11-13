import React, { useState } from 'react';
import { useApp, SheetTitle, SwitchRow } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';

/* Screens where Still keeps things quiet: guided/timer player, sleep stories, Breathe with Mo. */
export const QUIET_SCREENS = ['player', 'story', 'breathe', 'practice'];
export const quietName = (platform) => (platform === 'ios' ? 'Focus' : 'Do Not Disturb');

/* Sample notifications for the prototype's "send a test notification" button. */
export const TEST_NOTES = [
  { app: 'Messages', icon: 'chat', title: 'Lena', body: 'Are we still on for dinner tonight?', own: false },
  { app: 'Still', icon: 'bell', title: 'Mo', body: 'Time for your evening wind-down.', own: true },
  { app: 'Mail', icon: 'mail', title: 'Weekly report', body: 'Your Q4 numbers are ready to review.', own: false },
  { app: 'News', icon: 'sparkle', title: 'Breaking', body: 'Something happened somewhere. It can wait.', own: false }
];

/* ---------- Small label under the player title ---------- */
export function QuietLabel({ text }) {
  const { s, platform } = useApp();
  const on = s.quietOn && s.quietReady;
  return (
    <span className="col" style={{ alignItems: 'center', gap: 3 }}>
      <span className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{text}</span>
      {on ? (
        <span className="row accent" style={{ gap: 4, fontSize: 11, fontWeight: 800 }}>
          <Icon name="moon" size={11} sw={2.6} />{quietName(platform)} on
        </span>
      ) : null}
    </span>
  );
}

/* ---------- Setup: Android grants DND access; iOS needs a Shortcuts automation ---------- */
export function QuietSetupSheet() {
  const { s, set, closeSheet, toast, dialog, platform } = useApp();
  const ios = platform === 'ios';
  const [step, setStep] = useState(0);
  const finish = () => {
    set({ quietOn: true, quietReady: true, quietAsked: true });
    closeSheet();
    toast(ios ? 'Done. Focus turns on when you start a session.' : 'Done. Do Not Disturb turns on when you start a session.');
  };
  const android = () => dialog({
    title: 'Do Not Disturb access',
    message: 'Allow Still to turn Do Not Disturb on during sessions and back off when you finish? You can change this in Settings › Apps › Special access.',
    actions: [{ label: 'Don’t allow' }, { label: 'Allow', bold: true, onPress: finish }]
  });
  const steps = [
    ['Open the Shortcuts app', 'Go to Automation and tap New Automation.'],
    ['Choose App › Still', 'Select “Is Opened” and “Is Closed”, then Run Immediately.'],
    ['Add “Set Focus”', 'Pick Do Not Disturb (or a Meditate Focus) and set it to turn on when Still opens, and off when it closes.']
  ];
  return (
    <>
      <div className="grabber" />
      <div className="col" style={{ alignItems: 'center', textAlign: 'center' }}>
        <Mo size={96} mood="sleepy" glow={false} />
        <h2 className="h2" style={{ marginTop: 8 }}>Quiet while you practise</h2>
        <p className="lead" style={{ marginTop: 6 }}>
          {ios ? 'iPhone lets you decide which apps can switch on Focus. A one-time shortcut lets Still do it for you.' : 'Still can switch on Do Not Disturb when a session starts and turn it off when you finish.'}
        </p>
      </div>
      {ios ? (
        <ol className="raised" style={{ listStyle: 'none', margin: '16px 0 0', padding: '6px 16px', borderRadius: 24 }}>
          {steps.map(([t, d], i) => (
            <li key={t} className="row" style={{ gap: 12, padding: '10px 0', alignItems: 'flex-start' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, background: i < step ? 'var(--primary)' : 'transparent', color: i < step ? 'var(--onp)' : 'var(--accent)', boxShadow: i < step ? 'none' : 'var(--down-sm)' }}>{i < step ? <Icon name="check" size={14} sw={3} /> : i + 1}</span>
              <span className="col" style={{ gap: 2, textAlign: 'left' }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{t}</span>
                <span className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>{d}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="pressed col" style={{ marginTop: 16, padding: '12px 16px', borderRadius: 22, gap: 8 }}>
          <span className="row" style={{ gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--body)' }}><Icon name="check" size={16} sw={2.6} style={{ color: 'var(--accent)' }} />Only during sessions, stories and breathing</span>
          <span className="row" style={{ gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--body)' }}><Icon name="check" size={16} sw={2.6} style={{ color: 'var(--accent)' }} />Your own settings come back when you finish</span>
          <span className="row" style={{ gap: 10, fontSize: 14, fontWeight: 700, color: 'var(--body)' }}><Icon name="check" size={16} sw={2.6} style={{ color: 'var(--accent)' }} />Alarms always ring</span>
        </div>
      )}
      <p className="muted" style={{ margin: '12px 4px 0', fontSize: 13, lineHeight: 1.4, textAlign: 'center' }}>Even without this, Still never sends you its own reminders while you’re practising.</p>
      {ios ? (
        step < steps.length ? (
          <button className="btn btn-primary press" style={{ marginTop: 14 }} onClick={() => { setStep(steps.length); toast('Opening Shortcuts… (in the real app)'); }}>Open Shortcuts</button>
        ) : (
          <button className="btn btn-primary press" style={{ marginTop: 14 }} onClick={finish}>I’ve set it up</button>
        )
      ) : (
        <button className="btn btn-primary press" style={{ marginTop: 14 }} onClick={android}>Allow Do Not Disturb</button>
      )}
      <button className="btn-text" style={{ marginTop: 4, alignSelf: 'center' }} onClick={() => { set({ quietAsked: true }); closeSheet(); }}>Not now</button>
    </>
  );
}

/* ---------- Settings rows ---------- */
export function QuietSettings() {
  const { s, set, sheet, platform } = useApp();
  const ios = platform === 'ios';
  const on = s.quietOn && s.quietReady;
  return (
    <>
      <SwitchRow icon="moon" title="Silence notifications while practising"
        sub={on ? `${quietName(platform)} turns on during sessions, stories and breathing` : 'Turns on ' + quietName(platform) + ', then off when you finish'}
        on={on} onChange={(v) => (v ? (s.quietReady ? set({ quietOn: true }) : sheet(<QuietSetupSheet />)) : set({ quietOn: false }))} />
      {on && !ios ? (
        <SwitchRow icon="heart" title="Let favourite contacts through" sub="Calls and messages from starred contacts still ring" on={s.quietFavs !== false} onChange={(v) => set({ quietFavs: v })} />
      ) : null}
    </>
  );
}

/* ---------- One-time nudge on the session screen ---------- */
export function QuietNudge() {
  const { s, sheet, platform } = useApp();
  if (s.quietOn || s.quietAsked) return null;
  return (
    <button type="button" className="press row" onClick={() => sheet(<QuietSetupSheet />)}
      style={{ marginTop: 10, alignSelf: 'center', minHeight: 44, border: 0, background: 'none', gap: 8, color: 'var(--accent)', fontSize: 14, fontWeight: 800, cursor: 'pointer', padding: '0 8px' }}>
      <Icon name="moon" size={16} sw={2.4} />Silence notifications while you practise
    </button>
  );
}

/* ---------- Banner (a notification arriving on the phone) ---------- */
export function Banner({ note, platform, onClose }) {
  return (
    <button type="button" className={'notif ' + platform} onClick={onClose} aria-label={`${note.app} notification: ${note.title}. ${note.body}. Dismiss`}>
      <span className="notif-ico"><Icon name={note.icon} size={16} sw={2.2} /></span>
      <span className="col grow" style={{ minWidth: 0, gap: 1, textAlign: 'left' }}>
        <span className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, textTransform: platform === 'android' ? 'none' : 'uppercase', letterSpacing: platform === 'ios' ? '.04em' : 0 }}>{note.app}</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>now</span>
        </span>
        <span style={{ fontSize: 14, fontWeight: 800 }}>{note.title}</span>
        <span style={{ fontSize: 14, lineHeight: 1.35, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.body}</span>
      </span>
    </button>
  );
}
