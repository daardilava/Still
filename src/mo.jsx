import React from 'react';

const INK = '#2A1E52';

/** Whatever Mo is wearing app-wide (a streak unlock). A `wear` prop overrides it. */
export const WearCtx = React.createContext(null);

function Wear({ id }) {
  if (id === 'scarf') return (
    <g>
      <path d="M40 142 Q100 170 160 142 L162 158 Q100 188 38 158Z" fill="#D9779F" />
      <path d="M122 166 l20 -6 6 30 -18 6z" fill="#C7608B" />
      <path d="M52 152 Q100 174 148 152" fill="none" stroke="#F4A6C6" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
    </g>
  );
  if (id === 'cap') return (
    <g>
      <path d="M56 62 Q98 14 150 58 Q176 40 178 76 Q160 60 146 70 Q100 44 56 62Z" fill="#5B32C4" />
      <path d="M52 66 Q100 40 150 66" fill="none" stroke="#F5F1FF" strokeWidth="9" strokeLinecap="round" />
      <circle cx="178" cy="80" r="9" fill="#FFD27A" />
    </g>
  );
  if (id === 'stars') return (
    <g fill="#FFD27A">
      <path d="M100 2 l4 11 11 4 -11 4 -4 11 -4 -11 -11 -4 11 -4z" />
      <path d="M56 18 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
      <path d="M144 18 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
    </g>
  );
  if (id === 'crown') return (
    <g>
      <path d="M66 50 L72 16 L88 36 L100 10 L112 36 L128 16 L134 50 Q100 38 66 50Z" fill="#FFD27A" stroke="#E0A93B" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="100" cy="34" r="5" fill="#8C7BE0" />
    </g>
  );
  return null;
}

function eye(type, cx, cy) {
  if (type === 'open') return { d: `M${cx - 8} ${cy}a8 8 0 1 0 16 0a8 8 0 1 0 -16 0`, fill: INK };
  if (type === 'happy') return { d: `M${cx - 10} ${cy + 3} Q${cx} ${cy - 10} ${cx + 10} ${cy + 3}`, fill: 'none' };
  if (type === 'calm') return { d: `M${cx - 10} ${cy - 3} Q${cx} ${cy + 8} ${cx + 10} ${cy - 3}`, fill: 'none' };
  return { d: `M${cx - 9} ${cy + 2} L${cx + 9} ${cy + 2}`, fill: 'none' };
}
function mouth(type, cx, cy) {
  if (type === 'big') return { d: `M${cx - 14} ${cy - 2} Q${cx} ${cy + 18} ${cx + 14} ${cy - 2} Z`, fill: INK };
  if (type === 'o') return { d: `M${cx - 6} ${cy + 2}a6 7 0 1 0 12 0a6 7 0 1 0 -12 0`, fill: INK };
  if (type === 'small-o') return { d: `M${cx - 4} ${cy + 3}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`, fill: INK };
  if (type === 'sleepy') return { d: `M${cx - 6} ${cy + 2} Q${cx} ${cy + 5} ${cx + 6} ${cy + 2}`, fill: 'none' };
  return { d: `M${cx - 10} ${cy} Q${cx} ${cy + 9} ${cx + 10} ${cy}`, fill: 'none' };
}

const MOODS = {
  calm: { l: 'calm', r: 'calm', m: 'smile', cheek: 0.5 },
  happy: { l: 'happy', r: 'happy', m: 'big', cheek: 0.9, spark: true },
  hello: { l: 'open', r: 'open', m: 'big', cheek: 0.8, wave: true },
  curious: { l: 'open', r: 'open', m: 'smile', cheek: 0.6 },
  oops: { l: 'open', r: 'open', m: 'small-o', cheek: 0.4 },
  sleepy: { l: 'sleepy', r: 'sleepy', m: 'sleepy', cheek: 0.35, zz: true },
  wink: { l: 'open', r: 'happy', m: 'smile', cheek: 0.75, spark: true },
  breathe: { l: 'calm', r: 'calm', m: 'o', cheek: 0.8 }
};

/**
 * Mo — the Still mascot. A small glowing moon pebble.
 * breath: null | 'in' | 'out' | 'hold'  → drives a slow scale (the breathing guide)
 */
export function Mo({ mood = 'calm', size = 160, breath = null, breathMs = 4000, enter = false, label, glow = true, wear }) {
  const ctxWear = React.useContext(WearCtx);
  const wearing = wear === undefined ? ctxWear : wear;
  const M = MOODS[mood] || MOODS.calm;
  const L = eye(M.l, 76, 106), R = eye(M.r, 124, 106), Mm = mouth(M.m, 100, 132);
  const blink = M.l === 'open' || M.r === 'open';
  const breathScale = breath === 'in' ? 1.1 : breath === 'out' ? 0.88 : breath === 'hold' ? undefined : undefined;
  const bodyClass = breath ? 'mo-breath' : enter ? 'mo-bounce' : 'mo-float';
  const bodyStyle = breath ? { transform: breathScale ? `scale(${breathScale})` : undefined, transitionDuration: breathMs + 'ms' } : undefined;
  const glowOpacity = breath === 'in' ? 0.5 : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={label || `Mo the moon pebble, ${mood}`} style={{ overflow: 'visible' }}>
      {glow && <circle className="mo-glow" cx="100" cy="106" r="94" fill="#B9A3FF" style={glowOpacity ? { opacity: glowOpacity, animation: 'none', transition: 'opacity 1s' } : undefined} />}
      <g className={bodyClass} style={bodyStyle}>
        <ellipse cx="34" cy="128" rx="9" ry="14" fill="#E6DDFC" transform="rotate(24 34 128)" />
        <g className={M.wave ? 'mo-wave' : undefined}>
          <ellipse cx="166" cy="128" rx="9" ry="14" fill="#D6C9FA" transform="rotate(-24 166 128)" />
        </g>
        <path d="M100 36 C150 36 172 74 170 112 C168 152 138 174 100 174 C62 174 32 152 30 112 C28 74 50 36 100 36Z" fill="#F5F1FF" />
        <path d="M128 44 C160 60 172 96 166 128 C160 158 132 174 100 174 C140 160 156 128 152 96 C148 70 138 54 128 44Z" fill="#D9CDFA" />
        <circle cx="68" cy="70" r="8" fill="#E6DDFC" />
        <circle cx="88" cy="56" r="4" fill="#E6DDFC" />
        <circle cx="138" cy="150" r="5" fill="#C9BAF5" />
        <ellipse cx="62" cy="126" rx="11" ry="7" fill="#F4A6C6" opacity={M.cheek} />
        <ellipse cx="138" cy="126" rx="11" ry="7" fill="#F4A6C6" opacity={M.cheek} />
        <g className={blink ? 'mo-blink' : undefined}>
          <path d={L.d} fill={L.fill} stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d={R.d} fill={R.fill} stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path d={Mm.d} fill={Mm.fill} stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {wearing ? <Wear id={wearing} /> : null}
      </g>
      {M.zz && (
        <g fill="#7C5AE8" fontFamily="Figtree, sans-serif" fontWeight="800">
          <text className="mo-zz" x="148" y="48" fontSize="26">z</text>
          <text className="mo-zz d2" x="166" y="28" fontSize="18">z</text>
        </g>
      )}
      {M.spark && (
        <g fill="#FFD27A">
          <path className="mo-spark" d="M172 64 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path className="mo-spark d2" d="M28 52 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
        </g>
      )}
    </svg>
  );
}

/** Mo inside a soft raised + pressed disc, the standard way Mo appears on screens. */
export function MoDisc({ size = 280, moSize, ...rest }) {
  const inner = Math.round(size * 0.82);
  return (
    <div className="raised" style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div className="pressed" style={{ width: inner, height: inner, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Mo size={moSize || Math.round(size * 0.68)} {...rest} />
      </div>
    </div>
  );
}
