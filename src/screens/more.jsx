import React from 'react';
import { useApp, SheetTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';

/* The quiet player shows only play/pause; everything else lives here. */
export function MoreSheet({ title = 'More', items }) {
  const { closeSheet } = useApp();
  return (
    <>
      <div className="grabber" />
      <SheetTitle title={title} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginTop: 4 }}>
        {items.filter(Boolean).map((it) => (
          <button key={it.label} type="button" className={'tool press' + (it.on ? ' on' : '')} aria-pressed={it.on === undefined ? undefined : !!it.on}
            aria-disabled={it.disabled || undefined} style={it.disabled ? { opacity: 0.45 } : undefined}
            onClick={() => { if (!it.keep) closeSheet(); it.onClick(); }}>
            <Icon name={it.icon} size={20} />{it.label}
            {it.value ? <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{it.value}</span> : null}
          </button>
        ))}
      </div>
    </>
  );
}
