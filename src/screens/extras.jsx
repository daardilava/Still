import React, { useEffect, useState } from 'react';
import { useApp, SheetTitle, Slider, Stepper } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { Mo } from '../mo.jsx';
import { PATTERNS, PACES, customPattern, SCRIPT, findSession } from '../data.js';

/* ---------- Sound mixer ---------- */
export function SoundsSheet({ timer }) {
  const { s, set } = useApp();
  const mix = s.mix;
  const put = (k) => (v) => set((prev) => ({ mix: { ...prev.mix, [k]: v } }));
  const fmt = (v) => (v === 0 ? 'Off' : v + '%');
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Sounds" sub="Mix the guide’s voice with background sounds." />
      <div className="pressed col" style={{ gap: 18, marginTop: 16, padding: '18px 18px 14px', borderRadius: 26 }}>
        {!timer ? <Slider label="Voice" value={mix.voice} onChange={put('voice')} format={fmt} /> : null}
        <Slider label="Rain" value={mix.rain} onChange={put('rain')} format={fmt} />
        <Slider label="Forest" value={mix.forest} onChange={put('forest')} format={fmt} />
        <Slider label="Ocean" value={mix.ocean} onChange={put('ocean')} format={fmt} />
      </div>
      <button className="btn-text" style={{ marginTop: 6 }} onClick={() => set({ mix: { voice: 80, rain: 30, forest: 0, ocean: 0 } })}>Reset to default</button>
    </>
  );
}

/* A tiny breathing preview so people can feel a rhythm before choosing it. */
function Preview({ pattern }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [pattern]);
  useEffect(() => { const t = setTimeout(() => setI((x) => (x + 1) % pattern.length), pattern[i % pattern.length][1]); return () => clearTimeout(t); }, [i, pattern]);
  const step = pattern[i % pattern.length];
  return (
    <div className="pressed col" style={{ alignItems: 'center', borderRadius: 26, padding: '10px 0 12px', marginTop: 16 }}>
      <Mo size={110} mood="breathe" breath={step[2]} breathMs={step[1]} glow={false} />
      <span className="accent" aria-hidden="true" style={{ fontWeight: 800, fontSize: 16 }}>{step[0]} · {Math.round(step[1] / 1000)}s</span>
    </div>
  );
}

/* ---------- Breathing rhythm ---------- */
export function PaceSheet() {
  const { s, set, nav, closeSheet, toast } = useApp();
  const [pace, setPace] = useState(s.pace);
  const needsPlus = pace !== 'calm' && !s.user.plus;
  const [custom, setCustom] = useState(s.customPace);
  const pattern = pace === 'custom' ? customPattern(custom) : PATTERNS[pace];
  const Card = ({ id, name, steps, note }) => {
    const on = pace === id;
    return (
      <button type="button" role="radio" aria-checked={on} onClick={() => setPace(id)} className="press"
        style={{ border: 0, borderRadius: 20, padding: '12px 14px', textAlign: 'left', cursor: 'pointer', background: 'var(--base)', boxShadow: on ? 'var(--down)' : 'var(--up-sm)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: on ? 'var(--accent)' : 'var(--ink)' }}>{name}</span>
          {id !== 'calm' && !s.user.plus ? <span className="tag plus" style={{ fontSize: 11 }}>Plus</span> : <span className="tnum muted" style={{ fontWeight: 800, fontSize: 13 }}>{steps}</span>}
        </span>
        <span className="muted" style={{ fontSize: 12, lineHeight: 1.35 }}>{note}</span>
      </button>
    );
  };
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Breathing rhythm" sub="Mo grows, holds and settles to this pace." />
      <Preview pattern={pattern} />
      <div role="radiogroup" aria-label="Breathing rhythm" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, marginTop: 16 }}>
        {PACES.map((p) => <Card key={p.id} {...p} />)}
      </div>
      <div style={{ marginTop: 12 }}><Card id="custom" name="Your own" steps={`${custom.in} · ${custom.hold} · ${custom.out}`} note="Set each part yourself." /></div>
      {pace === 'custom' ? (
        <div className="pressed col" style={{ gap: 12, marginTop: 14, padding: 14, borderRadius: 24 }}>
          <Stepper label="Breathe in" value={custom.in} min={2} max={8} onChange={(v) => setCustom({ ...custom, in: v })} />
          <Stepper label="Hold" value={custom.hold} min={0} max={8} onChange={(v) => setCustom({ ...custom, hold: v })} />
          <Stepper label="Breathe out" value={custom.out} min={2} max={10} onChange={(v) => setCustom({ ...custom, out: v })} />
        </div>
      ) : null}
      {needsPlus ? <p className="muted" style={{ margin: '14px 4px 0', fontSize: 13, lineHeight: 1.4 }}>Try the preview for free. Calm is always included.</p> : null}
      <button className="btn btn-primary press" style={{ marginTop: 12 }} onClick={() => {
        if (needsPlus) { closeSheet(); nav.push('paywall', { source: 'pace' }); return; }
        set({ pace, customPace: custom }); closeSheet(); toast('Mo will follow this rhythm.');
      }}>{needsPlus ? <><Icon name="crown" size={16} sw={2.2} />Unlock with Plus</> : 'Use this rhythm'}</button>
    </>
  );
}

/* ---------- Transcript (rendered inside the player so it follows playback live) ---------- */
export function TranscriptPanel({ elapsed, total, title, onClose, lines }) {
  const SCRIPT_ = lines || SCRIPT;
  const current = Math.min(SCRIPT_.length - 1, Math.floor((elapsed / total) * SCRIPT_.length));
  useEffect(() => {
    const el = document.getElementById('tl-' + current);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [current]);
  return (
    <>
      <div className="scrim" aria-hidden="true" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Transcript" style={{ maxHeight: '72%' }}>
        <div className="grabber" />
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
          <div><h2 className="h2" style={{ fontSize: 22 }}>Transcript</h2><p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>{title}</p></div>
          <button className="icon-btn press" aria-label="Close" onClick={onClose}><Icon name="close" size={14} sw={2.6} /></button>
        </div>
        <ol className="pressed" style={{ listStyle: 'none', margin: '16px 0 0', padding: '8px 16px', borderRadius: 24 }}>
          {SCRIPT_.map((line, i) => (
            <li key={i} id={'tl-' + i} aria-current={i === current ? 'true' : undefined}
              style={{ padding: '10px 0', fontSize: 16, lineHeight: 1.5, fontWeight: i === current ? 800 : 500, color: i === current ? 'var(--accent)' : i < current ? 'var(--muted)' : 'var(--body)', borderTop: i ? '1px solid var(--line)' : 0, transition: 'color .3s' }}>
              {line}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/* ---------- Home-screen widget preview ---------- */
export function WidgetSheet() {
  const { s, platform } = useApp();
  const tonight = findSession('unwind');
  const ios = platform === 'ios';
  return (
    <>
      <div className="grabber" />
      <SheetTitle title="Add Mo to your home screen" sub="A gentle nudge every time you unlock your phone." />
      <div className="pressed" style={{ marginTop: 16, padding: 16, borderRadius: 28, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div className="row" style={{ gap: 16, width: '100%' }}>
          <div className="raised col" style={{ width: 146, height: 146, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} role="img" aria-label={`Small widget: Mo with a ${s.streak}-day streak`}>
            <Mo size={78} mood={s.streak >= 7 ? 'happy' : 'calm'} glow={false} />
            <span className="tnum accent" style={{ fontWeight: 800, fontSize: 17 }}>{s.streak} {s.streak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.45, margin: 0 }}>Small: Mo and your streak. Mo glows brighter as it grows.</p>
        </div>
        <div className="raised row" style={{ width: '100%', height: 146, borderRadius: 26, padding: '0 16px', gap: 12 }} role="img" aria-label={`Medium widget: tonight’s session ${tonight.title}, 12 minutes, with a play button`}>
          <Mo size={84} mood="calm" glow={false} />
          <span className="col grow" style={{ gap: 2 }}>
            <span className="muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>Tonight</span>
            <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25 }}>{tonight.title}</span>
            <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>12 min · Day {s.streak + 1}</span>
          </span>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'var(--onp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="play" size={15} /></span>
        </div>
      </div>
      <h3 style={{ margin: '18px 0 8px', fontSize: 15, fontWeight: 800 }}>How to add it</h3>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>
        {(ios
          ? ['Touch and hold an empty spot on your Home Screen.', 'Tap Edit, then Add Widget.', 'Search for Still and pick a size.']
          : ['Touch and hold an empty spot on your home screen.', 'Tap Widgets.', 'Find Still, then drag a widget into place.']
        ).map((step) => <li key={step}>{step}</li>)}
      </ol>
    </>
  );
}

/* ---------- Health permission prompt (mindful minutes) ---------- */
export function askHealth({ platform, dialog, set, toast }) {
  const grant = (ok) => {
    set({ healthSync: ok });
    toast(ok ? `Mindful minutes will be saved to ${platform === 'ios' ? 'Apple Health' : 'Health Connect'}.` : 'Health sync stays off.');
  };
  dialog(platform === 'ios'
    ? { title: '“Still” Would Like to Update Your Health Data', message: 'Turn on: Mindful Minutes. Still only writes the length of each session you finish.', actions: [{ label: 'Don’t Allow', onPress: () => grant(false) }, { label: 'Allow', bold: true, onPress: () => grant(true) }] }
    : { title: 'Allow Still to write mindful minutes to Health Connect?', message: 'Only the length of each session you finish is shared.', actions: [{ label: 'Deny', onPress: () => grant(false) }, { label: 'Allow', onPress: () => grant(true) }] });
}
