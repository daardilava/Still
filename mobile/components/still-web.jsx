'use dom';

// The whole Still prototype (../../src), running as an Expo DOM component:
// a webview on Android/iOS, plain React on web. This is step 3 of the web-to-native
// migration; screens get rebuilt natively one by one (see ../MIGRATION.md).
import { useEffect } from 'react';
import './figtree-font.css';
import '../../src/theme.css';
import { App } from '../../src/app.jsx';
import { ErrorBoundary } from '../../src/safety.jsx';

export default function StillWeb({ platform, scheme, insets, backSignal, haptic, onTheme, exitApp }) {
  if (typeof window !== 'undefined') {
    window.__stillNative = { platform, scheme, haptic, onTheme, exitApp };
    const root = document.documentElement;
    root.classList.add('native-shell');
    root.style.setProperty('--native-top', `${(insets && insets.top) || 0}px`);
    root.style.setProperty('--native-bottom', `${(insets && insets.bottom) || 0}px`);
  }

  // Android back button pressed in the native shell.
  useEffect(() => {
    if (backSignal && typeof window !== 'undefined' && window.__stillBack) window.__stillBack();
  }, [backSignal]);

  return (
    <ErrorBoundary>
      <App nativeScheme={scheme} />
    </ErrorBoundary>
  );
}
