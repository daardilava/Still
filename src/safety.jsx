import React from 'react';

/* If any screen throws, show a calm recovery screen instead of a blank page. */
export class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    /* In the real app: report to crash reporting (Sentry / EAS Observe) without personal data. */
    this.info = info;
  }
  render() {
    if (!this.state.error) return this.props.children;
    const reset = () => { try { localStorage.removeItem('still-prototype-v2'); } catch (e) { /* ignore */ } location.reload(); };
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', background: '#E9E5F3', color: '#2A1E52', fontFamily: 'Figtree, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="#F5F1FF" stroke="#2A1E52" strokeWidth="4" /><path d="M36 46q4-4 8 0M56 46q4-4 8 0" fill="none" stroke="#2A1E52" strokeWidth="4" strokeLinecap="round" /><path d="M42 62q8 5 16 0" fill="none" stroke="#2A1E52" strokeWidth="4" strokeLinecap="round" /></svg>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Mo tripped over something</h1>
        <p style={{ margin: 0, maxWidth: 320, lineHeight: 1.5 }}>Something went wrong on this screen. Your progress is safe. Try again, and if it keeps happening, reset the app.</p>
        <button onClick={() => this.setState({ error: null })} style={{ minHeight: 52, minWidth: 220, borderRadius: 26, border: 0, background: '#5B32C4', color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>Try again</button>
        <button onClick={reset} style={{ minHeight: 48, border: 0, background: 'none', color: '#5B32C4', fontSize: '0.9375rem', fontWeight: 800, cursor: 'pointer' }}>Reset app data</button>
      </div>
    );
  }
}
