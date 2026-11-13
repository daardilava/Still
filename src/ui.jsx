import React, { createContext, useContext } from 'react';
import { Icon } from './icons.jsx';

export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

/* Standard top bar: back button, optional title, optional right action. */
export function TopBar({ title, right, onBack, back = true }) {
  const { platform, nav } = useApp();
  const ios = platform === 'ios';
  return (
    <div className="row" style={{ gap: 14, minHeight: 48 }}>
      {back ? (
        <button className="icon-btn press" aria-label="Back" onClick={onBack || nav.back}>
          <Icon name={'back_' + platform} />
        </button>
      ) : null}
      {title ? (
        <h1 style={{ flex: 1, margin: 0, fontSize: ios ? 18 : 22, fontWeight: 800, textAlign: ios ? 'center' : 'left' }}>{title}</h1>
      ) : <span className="grow" />}
      {right || (ios && title && back ? <span style={{ width: 48, flexShrink: 0 }} /> : null)}
    </div>
  );
}

export function Steps({ n, of = 3 }) {
  return (
    <div role="progressbar" aria-label={`Step ${n} of ${of}`} aria-valuemin={1} aria-valuemax={of} aria-valuenow={n} className="track grow">
      <span style={{ width: (n / of) * 100 + '%' }} />
    </div>
  );
}

export function SwitchVisual({ on }) {
  const { platform } = useApp();
  return (
    <span className={'switch' + (on ? ' on' : '')} aria-hidden="true">
      <span className="thumb">{platform === 'android' && on ? <Icon name="check" size={14} sw={3} style={{ color: '#4A24B0' }} /> : null}</span>
    </span>
  );
}

export function Segment({ options, value, onChange, label, cols }) {
  return (
    <div role="radiogroup" aria-label={label} className="segment" style={{ gridTemplateColumns: `repeat(${cols || options.length}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const on = v === value;
        return (
          <button key={String(v)} type="button" role="radio" aria-checked={on} className={'press' + (on ? ' on' : '')} onClick={() => onChange(v)}>{l}</button>
        );
      })}
    </div>
  );
}

export function Field({ label, id, type = 'text', value, onChange, error, hint, placeholder, autoComplete, textarea, inputMode }) {
  const fid = id || 'f-' + label.toLowerCase().replace(/[^a-z]+/g, '-');
  const describedBy = error ? fid + '-err' : hint ? fid + '-hint' : undefined;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      {textarea ? (
        <textarea id={fid} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={describedBy} />
      ) : (
        <input id={fid} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={describedBy} />
      )}
      {error ? <span className="err" id={fid + '-err'}>{error}</span> : hint ? <span className="hint" id={fid + '-hint'}>{hint}</span> : null}
    </div>
  );
}

export function Group({ children }) {
  return <div className="group">{children}</div>;
}

export function LinkRow({ icon, title, value, sub, onClick, danger }) {
  const { platform } = useApp();
  const ios = platform === 'ios';
  return (
    <button type="button" className="lrow press" onClick={onClick}>
      {icon ? <span className="ico" style={danger ? { color: 'var(--danger)' } : undefined}><Icon name={icon} size={18} /></span> : null}
      <span className="col grow" style={{ minWidth: 0 }}>
        <span className="t" style={danger ? { color: 'var(--danger)' } : undefined}>{title}</span>
        {sub ? <span className="s">{sub}</span> : null}
        {!ios && value ? <span className="s">{value}</span> : null}
      </span>
      {ios && value ? <span className="v tnum">{value}</span> : null}
      {ios ? <Icon name="chevron" size={16} sw={2.4} style={{ color: 'var(--muted)', flexShrink: 0 }} /> : null}
    </button>
  );
}

export function SwitchRow({ icon, title, sub, on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="lrow press" onClick={() => onChange(!on)}>
      {icon ? <span className="ico"><Icon name={icon} size={18} /></span> : null}
      <span className="col grow" style={{ minWidth: 0 }}>
        <span className="t">{title}</span>
        {sub ? <span className="s">{sub}</span> : null}
      </span>
      <SwitchVisual on={on} />
    </button>
  );
}

export function TabBar({ tab, onTab }) {
  const items = [['home', 'Home', 'home'], ['sleep', 'Sleep', 'moon'], ['search', 'Explore', 'compass'], ['profile', 'Profile', 'profile']];
  return (
    <div className="tabbar">
      <nav aria-label="Main">
        {items.map(([id, label, icon]) => {
          const on = tab === id;
          return (
            <button key={id} type="button" className={'tb press' + (on ? ' on' : '')} aria-current={on ? 'page' : undefined} onClick={() => onTab(id)}>
              <span className="pill"><Icon name={icon} size={22} sw={on ? 2.2 : 1.7} /></span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function SheetTitle({ title, sub }) {
  const { closeSheet } = useApp();
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
      <div>
        <h2 className="h2" style={{ fontSize: 22 }}>{title}</h2>
        {sub ? <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>{sub}</p> : null}
      </div>
      <button className="icon-btn press" aria-label="Close" onClick={closeSheet}><Icon name="close" size={14} sw={2.6} /></button>
    </div>
  );
}

/* A list of options in a pressed well; selected option pops out. iOS = checkmark, Android = radio. */
export function OptionList({ options, value, onChange, label }) {
  const { platform } = useApp();
  const ios = platform === 'ios';
  return (
    <div role="radiogroup" aria-label={label} className="pressed" style={{ marginTop: 16, padding: 8, borderRadius: 26, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const on = v === value;
        return (
          <button key={String(v)} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)} className="press"
            style={{ minHeight: 50, padding: '0 16px', borderRadius: 20, border: 0, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontSize: 16,
              fontWeight: on ? 800 : 600, color: on ? 'var(--accent)' : 'var(--ink)', background: 'var(--base)', boxShadow: on ? 'var(--up-sm)' : 'none' }}>
            {!ios ? (
              <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (on ? 'var(--accent)' : 'var(--muted)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: on ? 'var(--accent)' : 'transparent' }} />
              </span>
            ) : null}
            <span className="grow" style={{ textAlign: 'left' }}>{l}</span>
            {ios && on ? <Icon name="check" size={20} sw={2.8} /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function Img({ src, pos, h, r = 21, alt = '' }) {
  return <img src={src} alt={alt} style={{ width: '100%', height: h || '100%', objectFit: 'cover', objectPosition: pos || 'center', borderRadius: r }} />;
}

/* Neumorphic slider: a real range input styled as a pressed track with a raised thumb. */
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, format }) {
  const id = 's-' + label.toLowerCase().replace(/[^a-z]+/g, '-');
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="col" style={{ gap: 6 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <label htmlFor={id} style={{ fontSize: 15, fontWeight: 800 }}>{label}</label>
        <span className="tnum muted" style={{ fontSize: 13, fontWeight: 800 }}>{format ? format(value) : value}</span>
      </div>
      <input id={id} className="nslider" type="range" min={min} max={max} step={step} value={value}
        aria-valuetext={format ? format(value) : String(value)} onChange={(e) => onChange(Number(e.target.value))} style={{ '--fill': pct + '%' }} />
    </div>
  );
}

/* Neumorphic stepper: raised − / + buttons around a pressed value well. */
export function Stepper({ label, value, onChange, min = 1, max = 10, unit = 's' }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{label}</span>
      <div className="row" style={{ gap: 8 }} role="group" aria-label={label}>
        <button type="button" className="icon-btn press" style={{ width: 48, height: 48 }} aria-label={`Less ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Icon name="minus" size={16} sw={2.4} /></button>
        <span className="pressed-sm tnum" aria-live="polite" style={{ minWidth: 56, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent)' }}>{value}{unit}</span>
        <button type="button" className="icon-btn press" style={{ width: 48, height: 48 }} aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Icon name="plus" size={16} sw={2.4} /></button>
      </div>
    </div>
  );
}
