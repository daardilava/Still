# Still: web prototype → native app

The Expo app runs the whole prototype as one DOM component today (`components/still-web.jsx`),
so it already works on Android and iPhone through Expo Go. Screens then move to real React Native,
one at a time, most valuable first (Expo's "web to native" approach). The app stays shippable
after every step.

Native shell already in place: real platform look (iOS / Android), phone dark mode, safe areas,
native haptics (`expo-haptics`), status bar follows the app theme, Android back button.

## Worklist

| # | Screen | Plan | Why | Status |
|---|---|---|---|---|
| 1 | Player (guided + timer) | Nativize now | Core loop; needs background audio (`expo-audio` / track player), lock-screen controls, Reanimated breathing ring | ☐ |
| 2 | Home | Nativize now | First impression, scroll performance | ☐ |
| 3 | Tab bar + navigation | Nativize now | `expo-router` NativeTabs, native transitions and gestures | ☐ |
| 4 | Sleep story player | Nativize now | Background audio, sleep timer that works with the screen off | ☐ |
| 5 | Breathe with Mo | Nativize now | Press-and-hold + haptics feel best natively (Gesture Handler) | ☐ |
| 6 | Check-in, More, Sounds sheets | Nativize now | Native bottom sheets (`@expo/ui` BottomSheet) | ☐ |
| 7 | Onboarding + consent | Nativize later | Runs once; native permission prompts for notifications | ☐ |
| 8 | Paywall | Nativize later | Must use store purchases (RevenueCat), not web payments | ☐ |
| 9 | Explore / search | Nativize later | FlashList for long content lists | ☐ |
| 10 | Settings | Nativize later | `@expo/ui` grouped lists, Dynamic Type | ☐ |
| 11 | Profile, progress, insights | Nativize later | Charts can stay as DOM components | ☐ |
| 12 | Journey map, chapters, letter | Hybrid | Native screen around the illustrated map / text | ☐ |
| 13 | Practices (STOP, grounding, body scan, kindness) | Nativize later | Haptics, SVG via `react-native-svg` | ☐ |
| 14 | Compose (AI) | Nativize later | Needs a backend for AI (no `window.claude` in the app) | ☐ |
| 15 | Legal, feedback, downloads | Port as-is | Simple text screens | ☐ |

## Data, auth, storage (after the screens)

- `localStorage` → MMKV (or SQLite) in the native app; same state shape (`sanitize()` in `src/app.jsx`).
- Accounts and sync → Supabase; health data encrypted at rest.
- AI → a small server endpoint (Claude API) with the same practice list and safety rules as `src/ai.js`.
- Purchases → RevenueCat. Notifications → `expo-notifications`. Do Not Disturb → native module (Android) / Focus filter (iOS).
- "Download my data" → `expo-file-system` + `expo-sharing`.
