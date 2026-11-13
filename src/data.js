export const IMG = { room: 'img/room.svg', night: 'img/night.svg', land: 'img/landscape.svg' };

export const SESSIONS = [
  { id: 'unwind', title: 'Unwind into Evening', cat: 'Sleep', lengths: [6, 12, 20], img: IMG.room, pos: 'center 60%', plus: false,
    desc: 'A slow body scan and soft breathing to help you set down the day and drift toward sleep.' },
  { id: 'night', title: 'Under the Night Sky', cat: 'Sleep', lengths: [10, 20, 30], img: IMG.night, pos: 'center 40%', plus: true,
    desc: 'Lie back under an imagined sky and let each breath get a little slower and a little longer.' },
  { id: 'clear', title: 'Clear Mind', cat: 'Focus', lengths: [5, 8, 12], img: IMG.land, pos: 'center 72%', plus: false,
    desc: 'A short reset before work: notice where your attention is, then gently bring it back.' },
  { id: 'soften', title: 'Soften the Edges', cat: 'Stress', lengths: [5, 10, 15], img: IMG.room, pos: 'left 40%', plus: false,
    desc: 'For tense moments. Loosen the jaw, drop the shoulders and let the breath do the rest.' },
  { id: 'box', title: 'Box Breathing', cat: 'Breath', lengths: [2, 4, 8], img: IMG.land, pos: 'right 82%', plus: false, pattern: 'box',
    desc: 'Breathe in, hold, out, hold — four counts each. Mo shows you the rhythm.' },
  { id: 'moon', title: 'Moonlit Body Scan', cat: 'Sleep', lengths: [12, 18, 25], img: IMG.night, pos: 'right 80%', plus: true,
    desc: 'A long, slow scan from head to toe, with Mo dimming the screen as you go.' },
  { id: 'calm5', title: 'Calm in Five', cat: 'Stress', lengths: [5], img: IMG.land, pos: 'left 60%', plus: false,
    desc: 'Five minutes to come back to yourself, anywhere.' },
  { id: 'deep', title: 'Deep Work Primer', cat: 'Focus', lengths: [8, 15], img: IMG.night, pos: 'left 50%', plus: true,
    desc: 'Settle your mind before a long stretch of focused work.' }
];

export const FIRST = { id: 'first', title: 'Your first breath with Mo', cat: 'Breath', lengths: [2], img: IMG.land, pos: 'center 70%', plus: false,
  desc: 'Two minutes to meet Mo and find a slower rhythm. No experience needed.' };
/* ---------- Programs: short guided series. Day 1 of every program is free. ---------- */
const days = (rows) => rows.map(([title, min, focus], i) => ({ n: i + 1, title, min, focus }));
export const PROGRAMS = [
  { id: 'sleep7', title: '7 nights to better sleep', short: 'Better sleep', cat: 'Sleep', goal: 'Sleep better', img: IMG.night, pos: 'center 45%', plus: true,
    desc: 'A week of short evening sessions that teach your body to slow down before bed. Do one each night, ideally in bed with the lights low.',
    days: days([['Settling the body', 8, 'Body scan'], ['A longer out-breath', 8, 'Breathing'], ['Letting thoughts pass', 10, 'Noticing'], ['Putting worries down', 10, 'Reflection'], ['Warm and heavy', 12, 'Relaxation'], ['Counting down', 12, 'Breathing'], ['Your own routine', 10, 'Putting it together']]) },
  { id: 'anxiety10', title: 'Anxiety basics', short: 'Anxiety basics', cat: 'Stress', goal: 'Feel less anxious', img: IMG.room, pos: 'center 55%', plus: true,
    desc: 'Ten days of simple skills for anxious moments: noticing worry early, using the breath as an anchor, and being gentler with yourself.',
    days: days([['Noticing worry', 6, 'Awareness'], ['Breath as an anchor', 7, 'Breathing'], ['Naming feelings', 7, 'Noticing'], ['The body under stress', 8, 'Body scan'], ['Soft attention', 8, 'Focus'], ['Making room for worry', 9, 'Reflection'], ['Kindness to yourself', 9, 'Compassion'], ['Living with not knowing', 10, 'Acceptance'], ['Steady in the moment', 10, 'Grounding'], ['Carrying it forward', 10, 'Putting it together']]) },
  { id: 'focus5', title: 'Focus at work', short: 'Focus at work', cat: 'Focus', goal: 'Focus', img: IMG.land, pos: 'center 70%', plus: true,
    desc: 'Five short sessions to start your workday clearly, notice distraction sooner and close the day properly.',
    days: days([['Arriving', 5, 'Grounding'], ['One thing at a time', 6, 'Focus'], ['Noticing distraction', 6, 'Awareness'], ['A working breath', 7, 'Breathing'], ['Closing the day', 8, 'Reflection']]) },
  { id: 'kind7', title: 'Be kinder to yourself', short: 'Self-kindness', cat: 'Stress', goal: 'Be kinder to myself', img: IMG.room, pos: 'left 40%', plus: true,
    desc: 'A week of practices for the inner critic: talking to yourself the way you would to a friend.',
    days: days([['Meeting the critic', 6, 'Awareness'], ['A kind hand', 7, 'Compassion'], ['What a friend would say', 7, 'Reflection'], ['Good enough', 8, 'Acceptance'], ['Small wins', 8, 'Gratitude'], ['Forgiving a slip', 9, 'Compassion'], ['Your own words', 9, 'Putting it together']]) }
];
export const findProgram = (id) => PROGRAMS.find((p) => p.id === id);

/* ---------- Sleep stories (one free sample) ---------- */
export const STORIES = [
  { id: 'lake', title: 'Mo and the Still Lake', narrator: '[NARRATOR NAME]', min: 18, img: IMG.night, pos: 'center 60%', plus: false,
    blurb: 'Mo drifts across a quiet lake at night, counting slow ripples until everything is still.',
    lines: ['The lake was very quiet that night, and the moon sat low above the hills.', 'Mo floated near the shore, glowing softly, the way Mo always did when the day was done.', 'A small ripple spread out across the water. Then another, slower than the first.', 'Mo began to count them. One… and a long, easy pause… two…', 'Somewhere a reed bent in the breeze and straightened again.', 'The ripples grew wider and lazier, until they were hard to tell apart from the water itself.', 'Mo’s glow dimmed a little, like a lamp turned down for the night.', 'And the lake, and the hills, and Mo, were still.'] },
  { id: 'lighthouse', title: 'The Lighthouse Garden', narrator: '[NARRATOR NAME]', min: 24, img: IMG.land, pos: 'right 75%', plus: true,
    blurb: 'An old keeper tends a small garden by the sea while the light turns slowly through the night.',
    lines: ['At the end of the path there was a lighthouse, and beside it, a garden.', 'The keeper walked its rows each evening with a small watering can.', 'Above, the great light turned, once, and once again, never in a hurry.', 'Lavender, then rosemary, then a row of sleepy poppies, already closed.', 'The sea breathed against the rocks below. In, and out.', 'When the last plant was watered, the keeper sat on the bench by the door.', 'The light went on turning, keeping watch, so nobody else had to.'] },
  { id: 'train', title: 'The Slow Night Train', narrator: '[NARRATOR NAME]', min: 30, img: IMG.night, pos: 'right 70%', plus: true,
    blurb: 'A sleeper train winds through snowy valleys. Nobody on board is in a hurry.',
    lines: ['The night train left the city just after dark.', 'In your small cabin the blanket is heavy and warm, and the lamp is turned low.', 'Outside, snow falls past the window in slow, soft lines.', 'The wheels keep their gentle rhythm. Da-dum… da-dum…', 'A village slides by, a few lit windows, then only fields again.', 'The train leans into a long, slow curve through the valley.', 'There is nowhere you need to be until morning.'] },
  { id: 'reading', title: 'Rain on the Reading Room', narrator: '[NARRATOR NAME]', min: 22, img: IMG.room, pos: 'center 55%', plus: true,
    blurb: 'An old library after closing time, a chair by the window and rain on the glass.',
    lines: ['The library closed at six, but you were allowed to stay a while.', 'Rain tapped at the tall windows, steady and soft.', 'You found the deep chair by the radiator, the one nobody else ever chose.', 'The pages of your book felt thin and cool between your fingers.', 'Down the long room, a lamp clicked off, then another.', 'The rain kept going, patient, filling the quiet.'] }
];
export const findStory = (id) => STORIES.find((x) => x.id === id);

/* Built-in soundscapes everyone can use; people can save their own mixes too. */
export const PRESET_MIXES = [
  { id: 'p-rain', name: 'Rainy cabin', rain: 75, forest: 15, ocean: 0, preset: true },
  { id: 'p-forest', name: 'Forest night', rain: 10, forest: 80, ocean: 0, preset: true },
  { id: 'p-ocean', name: 'Ocean drift', rain: 0, forest: 0, ocean: 85, preset: true }
];

/* Sessions, the first-run session, program days (prog:<id>:<day>) and stories (story:<id>) all play through one player. */
/* Personal sessions Mo made with AI live in app state; the app registers them here so every screen can find them. */
export const CUSTOM = {};
export function registerCustom(list) { (list || []).forEach((x) => { CUSTOM[x.id] = x; }); }

export function findSession(id) {
  const base = SESSIONS.find((x) => x.id === id);
  if (base) return base;
  if (id && String(id).startsWith('ai:')) return CUSTOM[id] || null;
  if (id === FIRST.id) return FIRST;
  if (id && id.startsWith('prog:')) {
    const [, pid, n] = id.split(':');
    const p = findProgram(pid);
    const d = p && p.days[Number(n) - 1];
    if (!d) return null;
    return { id, title: `Day ${d.n} · ${d.title}`, cat: p.cat, lengths: [d.min], img: p.img, pos: p.pos, plus: p.plus && d.n > 1, desc: p.desc, programId: p.id, day: d.n, programTitle: p.title };
  }
  if (id && id.startsWith('practice:')) {
    const pr = PRACTICE_LIB.find((x) => x.id === id.slice(9));
    if (!pr) return null;
    return { id, title: pr.name, cat: pr.cat, lengths: [pr.min], img: IMG.room, pos: '50% 50%', plus: pr.plus, desc: pr.what, practice: pr.id };
  }
  if (id && id.startsWith('story:')) {
    const st = findStory(id.slice(6));
    if (!st) return null;
    return { id, title: st.title, cat: 'Sleep', lengths: [st.min], img: st.img, pos: st.pos, plus: st.plus, desc: st.blurb, story: true };
  }
  return null;
}

/* Which category each onboarding goal points to, for the Home recommendations. */
export const GOAL_CAT = { 'Sleep better': 'Sleep', 'Feel less anxious': 'Stress', 'Focus': 'Focus', 'Be kinder to myself': 'Stress', 'Build a habit': 'Breath', 'Just curious': 'All' };

/* Local-date helpers for streaks (keys like 2026-11-06, weeks keyed by their Monday). */
export const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const daysBetween = (a, b) => {
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
};
export const weekKey = (d = new Date()) => { const m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dayKey(m); };

/* Sample history for a returning user (used by Sign in and "Load sample history"). */
export function demoHistory() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const back = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); };
  const ago = (n, mood, hour) => { const d = new Date(); d.setDate(d.getDate() - n); return { d: dayKey(d), mood, hour }; };
  return {
    streak: 6, lastDone: dayKey(y), restWeek: null, monthMin: 142, sessionsDone: 18, week: [10, 15, 5, 20, 10, 12, 0],
    recent: [{ id: 'unwind', when: 'Yesterday', min: 12 }, { id: 'clear', when: 'Tue', min: 8 }],
    saved: ['unwind'], downloads: ['unwind', 'calm5'], programs: { sleep7: 2 }, bestStreak: 9, totalMin: 356,
    answers: { place: { a: 'By the sea', d: back(3) }, quiet: { a: 'In the evening', d: back(2) }, need: { a: 'Rest', d: back(1) } }, readChapters: ['door', 'lake', 'forest', 'garden'],
    since: back(240), intention: 'Fall asleep without my phone', weeklyGoal: 4,
    earned: { first: back(240), streak3: back(231), streak7: back(190), ten: back(120), min100: back(96) },
    history: [[13, 7, 10, 'Tired', 'Same'], [12, 21, 12, 'Stressed', 'Calmer'], [11, 22, 18, 'Tired', 'Sleepy'], [9, 8, 5, 'Okay', 'Same'], [8, 21, 12, 'Stressed', 'Calmer'], [7, 13, 5, 'Stressed', 'Same'],
      [6, 13, 8, 'Stressed', 'Restless'], [5, 22, 15, 'Tired', 'Calmer'], [4, 22, 24, 'Tired', 'Sleepy'], [3, 21, 12, 'Stressed', 'Calmer'], [2, 8, 8, 'Okay', 'Same'], [1, 21, 12, 'Okay', 'Calmer']]
      .map(([n, hour, min, pre, post]) => { const d = new Date(); d.setDate(d.getDate() - n); return { d: dayKey(d), hour, min, pre, post }; }),
    moodLog: [ago(9, 'Same', 8), ago(8, 'Calmer', 21), ago(6, 'Restless', 13), ago(5, 'Calmer', 22), ago(4, 'Sleepy', 22), ago(3, 'Calmer', 21), ago(2, 'Same', 8), ago(1, 'Calmer', 21)]
  };
}

export const MOOD_COLORS ={ Calmer: '#8C7BE0', Same: '#B7A6EA', Sleepy: '#5B32C4', Restless: '#D9779F' };

export const AVATAR_BGS = {
  lilac: ['#E3D9FF', '#B7A6EA', 'Lilac'], night: ['#4A3796', '#1E1640', 'Night'], dawn: ['#FFE0CC', '#F4A6C6', 'Dawn'],
  mint: ['#D6F3E6', '#8FD3B6', 'Mint'], sky: ['#D6E7FF', '#9DBDF5', 'Sky'], gold: ['#FFF0C9', '#FFD27A', 'Gold']
};
export const PRE_MOODS = { Stressed: '#D9779F', Tired: '#5B32C4', Okay: '#B7A6EA', Calm: '#8C7BE0' };
export const UNLOCKS = [
  { id: 'scarf', days: 3, name: 'Cozy scarf' },
  { id: 'cap', days: 7, name: 'Night cap' },
  { id: 'stars', days: 30, name: 'Star halo' },
  { id: 'crown', days: 100, name: 'Moon crown' }
];

export const CATS = ['All', 'Sleep', 'Focus', 'Stress', 'Breath'];

export const GOALS = [
  ['Sleep better', 'moon'], ['Feel less anxious', 'wave'], ['Focus', 'target'],
  ['Be kinder to myself', 'heart'], ['Build a habit', 'list'], ['Just curious', 'sparkle']
];

export const WEEK = [['M', 10], ['T', 15], ['W', 5], ['T', 20], ['F', 10], ['S', 12], ['S', 0]];

export const TIPS = [
  'Mo says: three slow breaths count. You don’t need a full session to begin.',
  'Mo says: if your mind wanders, that’s not failing — noticing it is the practice.',
  'Mo says: a longer out-breath tells your body it’s safe to rest.'
];

export const SOUNDS = { Silence: 'transparent', Rain: '#8C7BE0', Forest: '#2E8A73', Ocean: '#5B8FD9' };

/* Breathing rhythms Mo can guide. Each step: [cue, milliseconds, Mo's breath state]. */
export const PATTERNS = {
  calm: [['Breathe in', 4000, 'in'], ['Hold', 1500, 'hold'], ['Breathe out', 6000, 'out']],
  box: [['Breathe in', 4000, 'in'], ['Hold', 4000, 'hold'], ['Breathe out', 4000, 'out'], ['Hold', 4000, 'hold']],
  relax: [['Breathe in', 4000, 'in'], ['Hold', 7000, 'hold'], ['Breathe out', 8000, 'out']],
  even: [['Breathe in', 5000, 'in'], ['Breathe out', 5000, 'out']]
};
export const PACES = [
  { id: 'calm', name: 'Calm', steps: '4 · 1 · 6', note: 'A longer out-breath to settle down. The default.' },
  { id: 'even', name: 'Even', steps: '5 · 5', note: 'Equal in and out, about six breaths a minute.' },
  { id: 'box', name: 'Box', steps: '4 · 4 · 4 · 4', note: 'In, hold, out, hold. Steady and focusing.' },
  { id: 'relax', name: 'Relax', steps: '4 · 7 · 8', note: 'Long hold and slow exhale, for winding down at night.' }
];
export const customPattern = (c) => [['Breathe in', c.in * 1000, 'in'], ...(c.hold ? [['Hold', c.hold * 1000, 'hold']] : []), ['Breathe out', c.out * 1000, 'out']];

/* Sample guided script, shown as a transcript that follows the audio. */
export const SCRIPT = [
  'Find a comfortable position. Let your eyes close, or soften your gaze.',
  'Take a slow breath in through your nose.',
  'And let it go, a little longer on the way out.',
  'Notice where your body meets the bed or the chair.',
  'Let your shoulders drop. Unclench your jaw.',
  'If a thought pulls you away, that’s fine. Come back to the next breath.',
  'Breathe in for four, hold gently, and out for six.',
  'Let the day settle, like sand in still water.',
  'Stay here as long as you like. Mo will keep you company.'
];

export const LENGTHS = [['Any', () => true], ['Under 5 min', (x) => x.lengths[0] < 5], ['5–10 min', (x) => x.lengths.some((m) => m >= 5 && m <= 10)], ['10+ min', (x) => x.lengths[x.lengths.length - 1] >= 10]];

export const fmt = (s) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
};

/* ---------- Mo's journey: every finished session is one step along the path ---------- */
export const JOURNEY = [
  { id: 'door', steps: 0, name: 'Mo’s Doorstep', icon: 'home', colors: ['#D9CDFA', '#A98BFF'], keepsake: 'Mo’s first hello' },
  { id: 'lake', steps: 1, name: 'The Still Lake', icon: 'wave', colors: ['#BFD9FF', '#7C9BEA'], keepsake: 'A smooth lake stone' },
  { id: 'forest', steps: 3, name: 'The Whispering Forest', icon: 'leaf', colors: ['#C9EEDB', '#5DBB8A'], keepsake: 'A leaf that hums' },
  { id: 'garden', steps: 6, name: 'The Lighthouse Garden', icon: 'tower', colors: ['#FFE0CC', '#F4A6C6'], keepsake: 'A jar of lighthouse light' },
  { id: 'meadow', steps: 10, name: 'Star Meadow', icon: 'star', colors: ['#FFF0C9', '#FFD27A'], keepsake: 'A pocketful of stars' },
  { id: 'bridge', steps: 16, name: 'The Cloud Bridge', icon: 'cloud', colors: ['#E6ECFF', '#B7A6EA'], keepsake: 'A thread of cloud' },
  { id: 'peak', steps: 24, name: 'Moon Peak', icon: 'peak', colors: ['#5B32C4', '#2A1E52'], keepsake: 'A piece of the moon, to keep' }
];
export const placeIndex = (steps) => JOURNEY.reduce((acc, p, i) => (steps >= p.steps ? i : acc), 0);

/* Chapters are written from what the app knows: name, intention, habits, answers to Mo's questions. */
export function chapter(id, s, facts) {
  const N = s.user.name || 'you', Ncap = s.user.name || 'You';
  const best = Math.max(s.bestStreak || 0, s.streak || 0);
  const total = Math.max(s.totalMin || 0, s.monthMin || 0);
  const hist = s.history || [];
  const slots = [0, 0, 0, 0];
  hist.forEach((e) => { const h = e.hour; slots[h >= 5 && h < 12 ? 0 : h >= 12 && h < 18 ? 1 : h >= 18 && h < 22 ? 2 : 3]++; });
  const slot = ['in the morning', 'in the afternoon', 'in the evening', 'late at night'][slots.indexOf(Math.max(...slots))];
  const posts = {};
  hist.forEach((e) => { if (e.post) posts[e.post] = (posts[e.post] || 0) + 1; });
  const top = Object.keys(posts).sort((a, b) => posts[b] - posts[a])[0];
  const feel = { Calmer: 'a little calmer', Same: 'steady, the same as before, which is its own kind of calm', Sleepy: 'soft and sleepy', Restless: 'restless, and came back anyway' }[top];
  switch (id) {
    case 'door': return ['How it began', [
      'Mo is a small piece of the moon who rolled all the way down to earth to learn one thing: how to be still.',
      s.intention ? `On the doorstep Mo found ${N}. “${s.intention},” ${N} said. Mo didn’t fully understand yet, but nodded very seriously.` : `On the doorstep Mo found ${N}. Mo asked why ${N} had come. “I’m not sure yet.” Mo thought that was a fine place to start.`,
      '“Then we’ll learn together,” said Mo. “One breath at a time. I’ll count. I’m good at counting to four.”']];
    case 'lake': return ['The first quiet', [
      `After the very first session, Mo led the way to a lake so still it held the whole sky. ${Ncap} sat down, and for a few minutes nothing needed fixing.`,
      'Mo dropped a pebble in and watched the rings spread. “Look,” Mo whispered. “That’s what a breath looks like.”',
      'They kept one smooth stone to remember that the first step was the hardest, and it is already done.']];
    case 'forest': return ['Coming back', [
      `The forest only whispers to people who come back. ${Ncap} came back${hist.length >= 3 ? ', most often ' + slot : ''}.`,
      feel ? `Mo noticed something along the path: most days ${N} left feeling ${feel}.` : 'Mo noticed something along the path: the walking itself was the point.',
      '“The trees don’t hurry,” said Mo, “and they get taller anyway.”']];
    case 'garden': return ['The light you keep', [
      `Up the hill there is a garden around an old lighthouse. By now ${N} had ${best > 1 ? `kept a ${best}-day streak` : 'practised six times'}, and Mo had started to glow brighter without noticing.`,
      'The keeper told them a secret: the light is not there to stop the storm. It is there so you can find your way home in it.',
      s.intention ? `Mo thought about what ${N} had said on the doorstep: “${s.intention}.” It made more sense now.` : `Mo asked ${N} what the light was for. ${Ncap} smiled and didn’t answer. Not yet.`]];
    case 'meadow': return ['What Mo knows', [
      `In Star Meadow you can lie back and the sky comes down close. Mo used the time to count what it had learned about ${N}.`,
      facts.length ? facts.slice(0, 3).join(' ') : `Mo realised it still had questions. Lots of them. Mo decided to ask ${N} one each day.`,
      '“I’m keeping all of it,” said Mo, and tucked a few small stars into a pocket nobody knew Mo had.']];
    case 'bridge': return ['Above the weather', [
      `The Cloud Bridge sways. From up here ${N} could see the whole way back: the doorstep, the lake, the forest, the lighthouse. ${total} mindful minutes, laid end to end.`,
      'Below them some clouds were stormy and some were bright. “They’re all just weather,” said Mo. “You’re the sky.”',
      'Mo had read that somewhere and was very pleased to finally use it.']];
    default: return ['Home', [
      `At the top of Moon Peak the moon is close enough to touch. Mo could step across and go home. ${Ncap} waited.`,
      `Mo looked at the moon, then at ${N}, then at the long path they had walked together.`,
      '“I came down to learn how to be still,” said Mo. “Turns out it’s not a place. It’s this.” And Mo stayed.']];
  }
}

/* One question a day. Answers become "what Mo knows about you" and find their way into the story. */
export const QUESTIONS = [
  { id: 'place', q: 'Where do you feel most at peace?', opts: ['By the sea', 'In the forest', 'At home', 'In the mountains'], fact: (a) => `You feel most at peace ${a.toLowerCase()}.`, reply: (a) => `${a}… Mo is imagining it right now.` },
  { id: 'weather', q: 'What’s the weather inside you today?', opts: ['Sunny', 'Cloudy', 'Stormy', 'Foggy'], fact: (a) => `Last time Mo asked, your inner weather was ${a.toLowerCase()}.`, reply: (a) => (a === 'Sunny' ? 'Mo is basking in it.' : `${a} is allowed. Mo brought a tiny umbrella, just in case.`) },
  { id: 'quiet', q: 'When is your mind the quietest?', opts: ['Early morning', 'Around midday', 'In the evening', 'Late at night'], fact: (a) => `Your mind is quietest ${a.toLowerCase()}.`, reply: () => 'Mo will tiptoe at that hour.' },
  { id: 'kind', q: 'Who could use a kind thought from you today?', opts: ['A friend', 'My family', 'Myself', 'A stranger'], fact: (a) => `You sent a kind thought to ${a.toLowerCase()}.`, reply: (a) => (a === 'Myself' ? 'Good. Mo sends one to you too.' : 'Sent. Mo watched it float off.') },
  { id: 'need', q: 'What do you need more of this week?', opts: ['Rest', 'Focus', 'Patience', 'Joy'], fact: (a) => `This week you wanted more ${a.toLowerCase()}.`, reply: (a) => `More ${a.toLowerCase()}. Mo wrote it on a leaf.` },
  { id: 'smile', q: 'What made you smile today?', opts: ['Someone I love', 'Something small', 'Good food', 'Not much yet'], fact: (a) => (a === 'Not much yet' ? 'Some days are slow to smile, and you show up anyway.' : `${a} can turn your day around.`), reply: (a) => (a === 'Not much yet' ? 'Then Mo will try. Look: Mo is smiling at you.' : 'Mo is smiling too now.') }
];
export const todaysQuestion = () => QUESTIONS[Math.floor(Date.now() / 864e5) % QUESTIONS.length];
export const factsOf = (s) => QUESTIONS.filter((q) => (s.answers || {})[q.id]).map((q) => q.fact(s.answers[q.id].a));

/* ---------- Interactive mindfulness practices (inspired by MBSR, MBCT and metta; scripts to be teacher-reviewed) ---------- */
export const PRACTICE_LIB = [
  { id: 'stop', name: 'STOP pause', min: 1, plus: false, icon: 'hand', colors: ['#E3D9FF', '#B7A6EA'], cat: 'Stress',
    what: 'Four steps to step out of autopilot: Stop, Take a breath, Observe, Proceed.', origin: 'From mindfulness-based cognitive therapy (MBCT).', fit: 'busy, scattered, between tasks' },
  { id: 'ground', name: '5-4-3-2-1 grounding', min: 3, plus: false, icon: 'target', colors: ['#D6F3E6', '#8FD3B6'], cat: 'Anxiety',
    what: 'Name what your senses notice, one tap at a time, until you’re back in the room.', origin: 'A grounding technique used for anxiety and panic.', fit: 'anxious, overwhelmed, panicky' },
  { id: 'body', name: 'Body scan', min: 4, plus: false, icon: 'leaf', colors: ['#D6E7FF', '#9DBDF5'], cat: 'Sleep',
    what: 'Tell Mo where you hold tension. Attention moves slowly through the body and stays longer there.', origin: 'From mindfulness-based stress reduction (MBSR).', fit: 'tired, tense, can’t sleep' },
  { id: 'metta', name: 'Loving-kindness', min: 4, plus: true, icon: 'heart', colors: ['#FFE0CC', '#F4A6C6'], cat: 'Self-kindness',
    what: 'Send kind wishes to yourself and others. Each one becomes a star in your kindness sky.', origin: 'Metta, a Buddhist practice studied in kindness research.', fit: 'low, lonely, hard on yourself' }
];
export const findPractice = (id) => PRACTICE_LIB.find((p) => p.id === id);
