import React from 'react';

const P = {
  back_ios: 'M15 5l-7 7 7 7',
  back_android: 'M20 12H5M11 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
  down: 'M6 9l6 6 6-6',
  updown: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4',
  timer: 'M12 5a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM12 9v4l2.5 2.5M9 2h6',
  profile: 'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  rew: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
  fwd: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  check: 'M5 12l5 5 9-10',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
  mail: 'M3 6h18v13H3zM4 7l8 6 8-6',
  chat: 'M4 5h16v11H9l-5 4z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  speaker: 'M5 17a9 9 0 1 1 14 0M8.5 14.5a5 5 0 1 1 7 0M12 15l-3 5h6z',
  wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
  offline: 'M3 3l18 18M8.5 16a5 5 0 0 1 6.2-.6M5 12.5a10 10 0 0 1 4.3-2.4M16 10.6a10 10 0 0 1 3 1.9M2 9a15 15 0 0 1 4.6-2.9M11 5.1A15 15 0 0 1 22 9M12 19.5h.01',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  help: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01',
  doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  clock: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM12 8v4l3 2',
  chime: 'M12 3v2M5 12a7 7 0 0 1 14 0v4H5zM3 16h18M10 20h4',
  wave: 'M3 12c3-6 6-6 9 0s6 6 9 0',
  pulse: 'M3 12h3l3-7 4 14 3-7h5',
  playo: 'M7 4.5v15l13-7.5z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  crown: 'M3 8l4 4 5-7 5 7 4-4-2 11H5z',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  target: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z',
  list: 'M4 6h16M4 12h16M4 18h10',
  sparkle: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  plus: 'M12 5v14M5 12h14',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 14zM5 19l8-8',
  tower: 'M9 21l1-11h4l1 11zM8 10h8M10 10V6l2-3 2 3v4M7 21h10M3 6l4 1M21 6l-4 1',
  cloud: 'M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z',
  peak: 'M3 20l6-11 3.5 5.5L15 11l6 9zM9 9l1.5 2.5',
  hand: 'M12 21a7 7 0 0 0 7-7V9.5a1.5 1.5 0 0 0-3 0V8a1.5 1.5 0 0 0-3 0V6.5a1.5 1.5 0 0 0-3 0V14l-1.6-2.1a1.6 1.6 0 0 0-2.6 1.9l2.4 4A7 7 0 0 0 12 21z',
  minus: 'M5 12h14',
  gear: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'
};

export function Icon({ name, size = 20, sw = 1.9, style, label }) {
  if (name === 'play') {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style}><path d="M7 4.5v15l13-7.5z" /></svg>;
  }
  if (name === 'pause') {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style}><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>;
  }
  const filled = name === 'bookmark-fill' || name === 'heart-fill';
  const key = filled ? name.replace('-fill', '') : name;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined} aria-label={label} style={style}>
      <path d={P[key]} />
    </svg>
  );
}
