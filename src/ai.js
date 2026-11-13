/* Still × Claude
 * Real AI when the page runs inside Claude (artifact `sample` + `tts` capabilities),
 * a built-in writer everywhere else (localhost, other browsers, consent declined).
 * The AI never writes a practice from scratch: it picks one of the teacher-reviewed
 * PRACTICES below and personalises the words around its fixed steps. */

let sampleP = null, ttsP = null;
const use = (name) => {
  try {
    const c = typeof window !== 'undefined' && window.claude;
    if (!c || typeof c.use !== 'function') return Promise.resolve(null);
    return c.use(name).catch(() => null);
  } catch (e) { return Promise.resolve(null); }
};
export const getSample = () => (sampleP = sampleP || use('sample'));
export const getTts = () => (ttsP = ttsP || use('tts'));
let declined = false; // the viewer said no to Claude in this view: stop asking

/* ---------- Teacher-reviewed building blocks ---------- */
export const PRACTICES = {
  breath: { name: 'Longer out-breath', cat: 'Stress', for: 'stress, tension, racing heart, before something big',
    steps: ['settle the body', 'notice the breath without changing it', 'lengthen the out-breath (in for 4, out for 6)', 'let the shoulders drop on each out-breath', 'rest in the slower rhythm', 'return to normal breathing and notice how you feel'] },
  ground: { name: '5-4-3-2-1 grounding', cat: 'Anxiety', for: 'anxiety, panic, overwhelm, feeling unreal',
    steps: ['feet on the floor, eyes open', 'name 5 things you can see', '4 things you can feel', '3 things you can hear', '2 things you can smell', '1 slow breath you can taste or feel', 'notice you are here, now'] },
  body: { name: 'Body scan', cat: 'Sleep', for: 'tiredness, can’t sleep, restless body, tension',
    steps: ['lie or sit comfortably', 'attention to the feet', 'slowly up through legs, belly, chest', 'hands, arms, shoulders', 'neck, jaw, face', 'feel the whole body at once', 'rest'] },
  metta: { name: 'Loving-kindness', cat: 'Self-kindness', for: 'sadness, loneliness, conflict, being hard on yourself',
    steps: ['hand on heart', 'wish yourself well: may I be safe, may I be at ease', 'bring to mind someone dear and wish them well', 'if it feels right, someone difficult', 'widen the wish to everyone', 'return to yourself'] },
  stop: { name: 'STOP pause', cat: 'Focus', for: 'busy day, scattered, between tasks, short on time',
    steps: ['Stop what you are doing', 'Take one slow breath', 'Observe body, feelings and thoughts', 'Proceed with one small, clear next step'] },
  noting: { name: 'Noting', cat: 'Focus', for: 'overthinking, rumination, mind won’t stop',
    steps: ['anchor on the breath', 'when the mind wanders, softly note “thinking”, “planning” or “worrying”', 'return to the breath without judging', 'repeat, kindly', 'notice the space between thoughts'] },
  compassion: { name: 'Self-compassion break', cat: 'Self-kindness', for: 'shame, failure, criticism, a hard moment',
    steps: ['This is a moment of difficulty', 'Difficulty is part of being human', 'hand on heart: may I be kind to myself', 'what would you say to a friend?', 'offer yourself that'] },
  focus: { name: 'Single-point focus', cat: 'Focus', for: 'distraction, need to concentrate, before work or study',
    steps: ['sit upright, eyes soft', 'count ten breaths, one to ten', 'when you lose count, start again at one', 'notice the mind sharpening', 'set one intention for the next task'] }
};

const CRISIS = /(suicid|kill myself|end my life|end it all|don'?t want to (live|be here)|want to die|self[- ]?harm|hurt myself|cutting myself|overdose|no reason to live|suicidarme|quiero morir|no quiero vivir|hacerme daño|umbringen|nicht mehr leben|mich verletzen)/i;
export const looksLikeCrisis = (text) => CRISIS.test(text || '');

const KEYWORDS = [
  ['ground', /(panic|anxious|anxiety|overwhelm|freak|nervous|scared|afraid|ansiedad|angst)/i],
  ['body', /(sleep|tired|exhausted|insomnia|awake|bed|can'?t rest|dormir|cansad|müde)/i],
  ['noting', /(overthink|thoughts|ruminat|can'?t stop thinking|mind (is )?racing|worry|worried|loop)/i],
  ['compassion', /(failed|failure|stupid|ashamed|shame|guilt|mistake|hate myself|not good enough|criticis)/i],
  ['metta', /(sad|lonely|alone|argument|fight|angry|anger|hurt|miss|grief|breakup|triste)/i],
  ['focus', /(focus|concentrat|study|exam|work|distract|procrastinat)/i],
  ['breath', /(stress|presentation|meeting|interview|tense|tension|deadline|big day|estr[eé]s)/i],
  ['stop', /(busy|scattered|rushed|no time|quick|between)/i]
];
export const pickPractice = (text) => (KEYWORDS.find(([, re]) => re.test(text || '')) || ['breath'])[0];

/* ---------- Built-in writer (fallback) ---------- */
const OPEN = {
  breath: 'Let’s give your body a signal that it is safe to slow down.',
  ground: 'When everything feels like too much, the fastest way back is through your senses.',
  body: 'You don’t need to fall asleep. You only need to let the body be heavy for a while.',
  metta: 'Let’s make a little room for kindness, starting with you.',
  stop: 'One minute is enough to change the next hour.',
  noting: 'Thoughts will come. Today we just learn to name them and let them pass.',
  compassion: 'This is hard, and you don’t have to be hard on yourself about it.',
  focus: 'Let’s gather your attention into one place, gently.'
};
const BODY = {
  breath: ['Sit back and let the chair hold you. Let your hands rest.', 'Notice your breath as it is. No need to change it yet.', 'Now breathe in slowly for four… and out for six. Let the out-breath be the longer one.', 'Again. In for four… out for six. Let your shoulders drop as you breathe out.', 'Keep this rhythm on your own for a few breaths. Mo is breathing with you.', 'Notice anything that has softened, even a little.'],
  ground: ['Keep your eyes open and feel your feet on the floor.', 'Look around and quietly name five things you can see.', 'Now four things you can feel. Your clothes, the air, the chair.', 'Three things you can hear, near or far.', 'Two things you can smell. One slow breath you can feel in your chest.', 'You are here. This moment is enough to hold.'],
  body: ['Let yourself be heavy. Close your eyes if that feels okay.', 'Bring your attention to your feet. Notice their weight.', 'Let it travel slowly up through your legs, your belly, your chest.', 'Into your hands, your arms, your shoulders. Let them sink.', 'Soften the jaw, the face, the space between the eyebrows.', 'Feel the whole body at once, resting. There is nothing else to do.'],
  metta: ['Place a hand on your heart, if you like.', 'Silently say: may I be safe. May I be at ease.', 'Now picture someone who makes you smile. May you be happy. May you be well.', 'If it feels right, bring in someone who is harder for you. May you be well too.', 'Let the wish grow wider, to everyone feeling what you feel today.', 'And back to you. May I be kind to myself.'],
  stop: ['Stop. Let your hands rest for a moment.', 'Take one slow breath, all the way out.', 'Observe: how does your body feel? What is your mood? What is your mind doing?', 'No need to fix anything. Just notice.', 'Now choose one small, clear next step.', 'Proceed, a little slower than before.'],
  noting: ['Rest your attention on the breath, wherever you feel it most.', 'When a thought pulls you away, softly name it: “thinking”.', 'Or “planning”. Or “worrying”. Then come back to the breath.', 'Each time you notice, that is the practice working.', 'See if you can notice the small gap after a breath, before the next thought.', 'Rest there for a moment.'],
  compassion: ['Say quietly to yourself: this is a moment of difficulty.', 'Difficulty is part of being human. Others feel this too.', 'Place a hand on your heart. Feel its warmth.', 'Ask: what would I say to a good friend right now?', 'Now offer yourself those same words.', 'May I be kind to myself in this moment.'],
  focus: ['Sit upright, eyes soft or closed.', 'Count your breaths. One on the out-breath, two on the next.', 'Up to ten, then start again at one.', 'If you lose count, simply begin again. No problem at all.', 'Notice the mind getting a little clearer and quieter.', 'Set one small intention for what you’ll do next.']
};
const TITLE = { breath: 'A slower breath', ground: 'Back to here', body: 'Heavy and soft', metta: 'Room for kindness', stop: 'One-minute reset', noting: 'Name it, let it go', compassion: 'Be kind to you', focus: 'One clear point' };
const WHY = {
  breath: 'A longer out-breath tells your body it can stand down.',
  ground: 'Naming what your senses notice pulls attention out of the spiral and into the room.',
  body: 'Moving attention slowly through the body helps it let go of the day.',
  metta: 'Kind wishes, even silent ones, soften how heavy things feel.',
  stop: 'A short pause turns autopilot into a choice.',
  noting: 'Naming a thought makes it easier to let it pass.',
  compassion: 'Treating yourself like a friend makes hard moments lighter.',
  focus: 'Counting breaths trains attention to come back.'
};
export function localSession({ text, minutes, name, practice }) {
  const p = practice || pickPractice(text);
  const hi = name ? `${name}, thank you for telling me.` : 'Thank you for telling me.';
  const lines = [`${hi} ${OPEN[p]}`, ...BODY[p], minutes >= 10 ? 'Stay with this for a few more minutes. I’ll be right here, keeping time.' : 'Take a few more breaths here.', 'When you’re ready, open your eyes and bring this calm with you.'];
  return { practice: p, title: TITLE[p], why: WHY[p], lines, source: 'local' };
}

/* ---------- Claude ---------- */
const practiceList = () => Object.entries(PRACTICES).map(([id, p]) => `- ${id}: ${p.name}. For: ${p.for}. Steps in order: ${p.steps.join('; ')}.`).join('\n');

export async function composeSession({ text, minutes, name, intention, sim, signal }) {
  if (looksLikeCrisis(text)) return { crisis: true };
  const sample = sim || declined ? null : await getSample();
  if (!sample) return localSession({ text, minutes, name });
  const prompt = `You are Mo, the gentle little moon who guides the meditation app "Still". Write a short spoken guided meditation for one person, right now.

Choose exactly ONE of these teacher-reviewed practices — the best fit for what they wrote — and follow its steps in order. Do not invent other techniques.
${practiceList()}

About the person:
- First name: ${name || '(not given)'}
- Their intention in the app: ${intention || '(not given)'}
- What they wrote just now: """${String(text).slice(0, 400)}"""
- Length: about ${minutes} minutes (${minutes <= 3 ? 7 : minutes <= 5 ? 9 : 12} paragraphs; the app adds silence between them)

Rules:
- Warm, simple, second person, calm pace. 1–2 short sentences per paragraph. No lists, no headings, no emojis.
- First paragraph: briefly acknowledge their situation in a general way (do not repeat sensitive details back). Last paragraph: a gentle close.
- No medical or therapy claims, no diagnosis, no promises of outcomes. Never mention being an AI inside the script.
- If what they wrote suggests they may be in danger or thinking of harming themselves, set "crisis": true and leave "lines" empty.

Reply with only JSON:
{"crisis": false, "practice": "<one id from the list>", "title": "<2–5 words>", "why": "<one sentence to them on why this practice fits>", "lines": ["<paragraph>", "..."]}`;
  try {
    const r = await sample.json(prompt, { signal, cache: false });
    if (r && r.crisis) return { crisis: true };
    const practice = PRACTICES[r && r.practice] ? r.practice : pickPractice(text);
    const lines = Array.isArray(r && r.lines) ? r.lines.map(String).filter((l) => l.trim()).slice(0, 14) : [];
    if (lines.length < 3) return localSession({ text, minutes, name, practice });
    return { practice, title: String(r.title || TITLE[practice]).slice(0, 40), why: String(r.why || WHY[practice]).slice(0, 180), lines, source: 'claude' };
  } catch (e) {
    if (e && e.code === 'cancelled') throw e;
    if (e && (e.code === 'not_granted' || e.code === 'sampling_disabled')) declined = true;
    return { ...localSession({ text, minutes, name }), note: e && e.code === 'rate_limited' ? 'Mo is a bit busy, so this one uses Mo’s own words.' : null };
  }
}

/* Streams plain paragraphs (blank-line separated). Falls back to `fallback` paragraphs. */
export async function writeParas({ prompt, fallback, sim, onParas, signal }) {
  const sample = sim || declined ? null : await getSample();
  if (!sample) return { paras: fallback, source: 'local' };
  const split = (t) => t.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  try {
    const { text } = await sample(prompt, { signal, cache: { gcTime: 86400000 }, onText: ({ text: t }) => onParas && onParas(split(t)) });
    const paras = split(text);
    return paras.length ? { paras, source: 'claude' } : { paras: fallback, source: 'local' };
  } catch (e) {
    if (e && e.code === 'cancelled') throw e;
    if (e && (e.code === 'not_granted' || e.code === 'sampling_disabled')) declined = true;
    return { paras: fallback, source: 'local' };
  }
}

export const STORY_RULES = `Write in English, warm and gentle, like a short illustrated children's book for grown-ups. Plain text only: 3 short paragraphs separated by one blank line, no title, no lists, no emojis. Never invent facts that are not in the data; if something is missing, leave it out. No medical or therapy claims.`;
