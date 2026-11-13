# Still — clickable MVP prototype

A click-through prototype of the Still meditation app: neumorphic (soft UI) design, light and dark mode,
iOS and Android looks, and Mo the moon-pebble mascot, animated throughout. All data is sample data;
nothing is sent anywhere.

## Run it on localhost (no install needed)

The app is already built in `public/`. Pick one:

- Python (macOS/Linux have it):   `cd public && python3 -m http.server 8080`  →  open http://localhost:8080
- Node:                           `npx serve public -l 8080`                  →  open http://localhost:8080
- Or just double-click `public/index.html`.

On your phone: run one of the above on your computer, then open `http://<your-computer-ip>:8080`
on a phone on the same Wi-Fi. On a phone it fills the screen; on a computer it shows inside a phone
frame with a control panel beside it.

## Prototype controls

Desktop: the panel beside the phone. Phone: Settings › Prototype controls.
- Platform iOS / Android · phone appearance Auto / Light / Dark
- Simulate offline · Plus member · Fast playback (20×)
- Jump to any screen · Restart from splash

## What's in it

Splash · Welcome (Mo waves) · Goals · Create account (Apple / Google / email) · Email sign-up with validation ·
Sign in (type the password `wrong` to see the error) · Forgot password · Daily reminder + notification
permission prompt · Paywall (Still Plus, trial, restore) · Home · Search (loading, results, empty state) ·
Session detail (save, download, Plus lock, offline block) · Player (Mo is the breathing guide, real timer,
±15 s, sleep timer sheet, audio output sheet, end/leave confirmations) · Session complete (confetti, streak,
mood check-in) · Silent timer · Profile & progress · Settings (dark mode toggle + match device, reminder,
default length, interval bell, haptics, downloads, subscription) · Edit profile · Downloads · Help & feedback ·
Privacy / Terms (placeholders) · Sign out · Delete account (required by the App Store).

Text in [BRACKETS] is placeholder copy to replace (prices, guide names, legal text, company details).

## Product rules built in (v2)

- Onboarding shows value first: Welcome → Goals → a 2-minute first session with Mo → save progress (optional) → reminder → Still Plus.
- A session counts toward the streak after 60 seconds. One missed day per week is covered by a rest day; otherwise the streak restarts at 1 and total minutes are kept. (Rules live in `nextStreak()` in `src/screens/session.jsx`.)
- Leaving a session saves your place; Home offers "Continue where you left off".
- Home recommends sessions from the goals picked in onboarding.
- Mood check-ins build a trend on Profile ("You usually feel calmer after evening sessions").
- The store rating prompt appears once, after a session where you felt calmer and at least 3 sessions done.
- Support screen with crisis-line guidance (Settings › Need more support?, and after a "Restless" check-in).
- Accessibility: 48px tap areas, a 3:1 edge on dark-mode controls, breathing cues announced to screen readers for the first cycle only.

## v3: neumorphic controls and player tools

- Tactile press: raised controls sink into the surface while held.
- Neumorphic slider (a real range input) and stepper components in `src/ui.jsx`.
- Player tools: Sounds mixer (voice, rain, forest, ocean), a Text transcript that follows playback, and Pace: four breathing rhythms (Calm 4·1·6, Even 5·5, Box 4·4·4·4, Relax 4·7·8) or your own, with a live Mo preview.
- Sleep mode: in sleep sessions, or when a sleep timer is set, the screen goes dark after a few quiet seconds; tap to wake. Toggle in Settings.
- Search filters by length and "Downloaded".
- Settings › Connections: save mindful minutes to Apple Health / Health Connect (permission prompt), and a home-screen widget preview.
- Sheets take keyboard focus when they open; Escape closes sheets and dialogs.

New users start with no history. To see a returning user, sign in with any email, or use "Load sample history".

## Edit and rebuild

`npm install` then `npm run dev` (rebuilds and serves on http://localhost:8080) or `npm run build`.
Source is in `src/` (React). Screens map one-to-one to the planned Expo Router routes.

## v4 — Programs, sleep stories and the free/Plus split

- **Programs** (Home → Programs, or Sleep): 4 multi-day series. Days unlock in order; day 1 of every program is free, later days need Plus. Finishing a day marks progress and offers "Back to program".
- **Sleep tab** (5th tab): Plus wind-down routine, tonight's free story, story list, soundscapes (3 built in + your own; 1 saved mix free) and the sleep program.
- **Sleep-story player**: art with sleepy Mo, ±15 s, background sound, read-along text, auto-dim. Counts toward streaks after 1 minute.
- **Mo's plan for today** on Home: restless mood → short calm session; active program → next day; late night → story; morning → reset.
- **Breathing rhythms**: Calm stays free; Box, Even, Relax and custom can be previewed, then unlock with Plus.
- **Paywall**: perks rewritten around programs, stories and rhythms; lead line changes with where you came from; "What stays free" list.
- DevPanel jump: `program` (7 nights to better sleep) and `story` (Mo and the Still Lake).

## v5 — Insights, check-in, Mo's collection and gap fixes

- **Check-in before sessions**: one tap (Stressed / Tired / Okay / Calm) or Skip when a guided session starts. Switch it off in Settings → Sound & playback.
- **Insights** (Profile → Insights, Plus): minutes by time of day, the time you most often end calmer, before/after mood, longest streak, and a monthly recap card to share. Free users see a blurred preview; under 3 sessions shows an empty state.
- **Mo's collection** (Profile): Mo unlocks a scarf, night cap, star halo and crown at 3, 7, 30 and 100-day streaks. Unlocks are kept if a streak ends. The Complete screen shows the unlock moment.
- **Search** now finds programs and sleep stories, and matches by category.
- **Story sleep timer**: stop after 10, 15 or 30 minutes; plus a "dim now" button.
- **Soundscapes** can be renamed, re-blended and deleted (pencil on your own mixes).
- "Load sample history" in the side panel fills in history so Insights has data.

## v6 — A personal Profile

- **Mo avatar**: your profile picture is Mo, wearing what you chose, on one of six backgrounds (Profile → edit).
- **Headline**: "Meditating since …", total sessions and minutes.
- **My intention**: one sentence you write (or pick a suggestion). Mo uses it in the daily plan.
- **Weekly goal**: choose 1–7 days a week; a ring shows progress next to your streak and rest day.
- **Moon calendar**: this month, one moon per day, fuller with more minutes. Replaces the weekly bars.
- **Milestones**: a timeline with dates for what you've reached and progress toward what's next.

## v7 — Mo's journey and an interactive Mo

- **Mo's journey** (Home tile): a path of 7 places. Every counted session is one step; arriving somewhere unlocks a chapter and a keepsake. Chapters are written from your name, intention, habits, mood and answers to Mo's questions.
- **Unlock moment**: the Complete screen says where Mo arrived, with a "Read" button.
- **Breathe with Mo** (Home tile): press and hold Mo to breathe in, let go to breathe out, six breaths. Works with Space/Enter; "Tap instead of hold" for people who can't hold.
- **Tap Mo** on Home: Mo squishes and says something that depends on the time, your streak, your intention and where Mo is.
- **Mo asks**: one question a day with four tap answers. Answers show under "What Mo knows about you" on the journey and feed the Star Meadow chapter.

## v7.1 — QA pass

Tested: onboarding to Home, sessions (check-in, pause, leave and resume, end early, same-day repeat, no double counting), streak rules (next day, rest day, reset), Plus gating and purchase, programs, stories, soundscapes, timer, offline, every screen on iOS/Android × light/dark, and phone widths 320, 360, 390 and 412.
Fixed: player and story controls squeezed on 320px phones, Downloads rows under 48px, "new" badge overlapping the journey icon.

## v8 — Quiet while you practise

- **Setting** (Settings › Sound & playback): "Silence notifications while practising". It covers the player (guided and timer), sleep stories and Breathe with Mo.
- **Android**: one-time "Do Not Disturb access" permission, then Still turns DND on at session start and restores the user's previous setting when they finish. Optional "Let favourite contacts through" (priority mode). Alarms always ring.
- **iPhone**: apps can't switch Focus themselves, so setup walks through a one-time Shortcuts automation (Still opened → Focus on; closed → off). The app shows "Focus on" once set up.
- **Always on**: Still never sends its own reminders during a session, even without the setting.
- **During a session**: a small "Do Not Disturb on" / "Focus on" label under the title; afterwards a toast says how many notifications waited.
- **One-time nudge** under "Begin" on the session screen, until set up or dismissed.
- Side panel › "Send a test notification": shows a banner on normal screens; held while practising.

Production notes: Android needs `ACCESS_NOTIFICATION_POLICY` + `NotificationManager.setInterruptionFilter` (save and restore the previous filter, also on crash or app kill). iOS: offer a Focus Filter (App Intents) so Still appears in Focus settings, read `INFocusStatusCenter` to show the label, and link to Shortcuts for the automation.

## v9 — Calm pass + AI with Mo

**Calm pass**
- Home: Mo (with today's question inside the bubble), Mo's plan, "tell Mo how you are", journey and breathing. 7 controls instead of 23.
- 4 tabs: Home, Sleep, Explore, Profile. Explore = search + browse (Timer, Made by Mo, programs, picked for you). Timer is a screen.
- Players: play/pause, End and "More". Everything else (sounds, read along, pace, sleep timer, ±15 s, audio output, story sound) is in the More sheet. 5 controls instead of 11.
- Profile: who you are, intention, weekly goal, moon calendar, "Your progress" (letter, insights, collection, milestones, mood), saved.

**AI (real Claude on the published page, built-in writer elsewhere)**
- **A session for right now** (Home, Explore): write how you are, pick 3/5/10 min. Mo picks one of 8 teacher-reviewed practices (longer out-breath, 5-4-3-2-1 grounding, body scan, loving-kindness, STOP, noting, self-compassion break, single-point focus) and writes the words around its fixed steps. Labelled "Made by Mo with AI".
  - Mo reads it aloud with a Claude voice, paragraph by paragraph, in time with the session (when available). Read-along shows the same text.
  - Safety: words that suggest self-harm open the Support screen instead (checked on the device first, and Claude is told to flag it too). "Mo isn't a therapist" note.
  - Free: 1 per week. Plus: unlimited. Past personal sessions can be replayed.
- **Chapters written for you**: each journey chapter is written by Claude from your real data, keeping the same plot; saved after the first time.
- **A letter from Mo** (Profile › Your progress): a monthly letter built from your minutes, times, before/after mood, intention and answers. "Read it to me" uses the Claude voice.
- Side panel › "Simulate AI (no Claude)" forces the built-in writer.

Production notes: run generation server-side or on-device (Apple Foundation Models / Gemini Nano) with the same practice list and safety rules; keep a human-reviewed library of practice steps; log nothing the user wrote unless they opt in; EU AI Act transparency (AI label) and GDPR consent for mood data.

## v10 — Interactive mindfulness practices

Four hands-on practices in Explore › Practices. Each has an intro (what it is, when it helps, where it comes from), works with Pause/End, counts as a session after one minute, and turns on quiet mode.
- **STOP pause** (1 min, free, from MBCT): Stop · Take a breath (Mo breathes with you) · Observe (tap body, feelings, thoughts) · Proceed (choose one next step).
- **5-4-3-2-1 grounding** (3 min, free): five steps through the senses; tap "I noticed one" for each thing; Mo reacts to every tap.
- **Body scan** (4 min, free, from MBSR): tap where you feel tension on a body map (or the names); the scan moves feet → head and stays longer on those parts. "Eyes open is fine, skip any part".
- **Loving-kindness** (4 min, Plus, metta): yourself → someone you love → someone neutral → someone difficult (optional, skippable) → everyone. Hold the heart to send each wish; each becomes a star in your kindness sky, kept over time.
- **Mo's plan reacts to the check-in**: stressed → STOP (morning) or grounding; tired → body scan; restless after the last session → grounding.

Scripts are placeholders to be reviewed by a certified mindfulness teacher before launch.

QA: a button crawler presses every button on every screen (and inside every sheet/dialog it opens) on a fresh app and checks each one does something with no errors; plus flow scripts for every journey.
