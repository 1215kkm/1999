/* area — 아이콘 · 로고 · 옷 일러스트 */

const I = {
  home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  closet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9.5 11v2M14.5 11v2"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3M9 8h7M9 11.5h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.5 2.8 3.5 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  heartPlus: '<path d="M11 19.5S3.5 15 3.5 9.6A4.2 4.2 0 0 1 11 7a4.2 4.2 0 0 1 7.4 2"/><path d="M18 13v7M14.5 16.5h7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevR: '<path d="m9 6 6 6-6 6"/>', chevL: '<path d="m15 6-6 6 6 6"/>', chevD: '<path d="m6 9 6 6 6-6"/>', chevU: '<path d="m6 15 6-6 6 6"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  hanger: '<path d="M12 7.5a2 2 0 1 1 2-2c0 1-1 1.5-2 2.3V9l8.6 6.1A1.6 1.6 0 0 1 19.7 18H4.3a1.6 1.6 0 0 1-.9-2.9L12 9"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
  grid1: '<rect x="5" y="5" width="14" height="14" rx="2.5"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  shrink: '<path d="M19 11h-6V5M5 13h6v6M13 11l7-7M11 13l-7 7"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-1a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v1.5m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.7-2.3L5 16c-.7-1-.4-2.3.6-2.8.8-.4 1.7-.2 2.3.4L8 14"/>',
  grid2: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  grid4: '<rect x="3.5" y="3.5" width="4" height="4" rx="1"/><rect x="10" y="3.5" width="4" height="4" rx="1"/><rect x="16.5" y="3.5" width="4" height="4" rx="1"/><rect x="3.5" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="16.5" y="10" width="4" height="4" rx="1"/><rect x="3.5" y="16.5" width="4" height="4" rx="1"/><rect x="10" y="16.5" width="4" height="4" rx="1"/><rect x="16.5" y="16.5" width="4" height="4" rx="1"/>',
  grid8: '<g fill="currentColor" stroke="none"><circle cx="5" cy="5" r="1.4"/><circle cx="9.7" cy="5" r="1.4"/><circle cx="14.3" cy="5" r="1.4"/><circle cx="19" cy="5" r="1.4"/><circle cx="5" cy="9.7" r="1.4"/><circle cx="9.7" cy="9.7" r="1.4"/><circle cx="14.3" cy="9.7" r="1.4"/><circle cx="19" cy="9.7" r="1.4"/><circle cx="5" cy="14.3" r="1.4"/><circle cx="9.7" cy="14.3" r="1.4"/><circle cx="14.3" cy="14.3" r="1.4"/><circle cx="19" cy="14.3" r="1.4"/><circle cx="5" cy="19" r="1.4"/><circle cx="9.7" cy="19" r="1.4"/><circle cx="14.3" cy="19" r="1.4"/><circle cx="19" cy="19" r="1.4"/></g>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  shuffle: '<path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.5 0 2.7-1.4 3.8-3.2M13.2 10.2C14.3 8.4 15.5 7 17 7h3M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  eyedrop: '<path d="m14.5 4.5 5 5-2 2-5-5zM12.5 6.5l-8 8V19h4.5l8-8"/>',
  store: '<path d="M4 9 5.5 4h13L20 9M4 9v11h16V9M4 9h16"/><path d="M9 20v-6h6v6"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  drawer: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M10 8h4M10 16h4"/>',
  shoe: '<path d="M3 17c0-3 .5-7 2-9h4c.5 2 2 3 4 3.5l5 1.3c2 .5 3 2 3 3.7V18H3z"/><path d="M3 18h18"/>',
  shirtI: '<path d="M8 3 4 5.5 2.5 10l3 1.2L6.5 9v12h11V9l1 2.2 3-1.2L20 5.5 16 3c-.5 1.6-2 2.5-4 2.5S8.5 4.6 8 3z"/>',
  pantsI: '<path d="M6 3h12l1 18h-5l-2-11-2 11H5z"/><path d="M6 6.5h12"/>',
  coatI: '<path d="M8 3 4 5v16h5v-9l3-3 3 3v9h5V5l-4-2-4 6z"/>',
  dressI: '<path d="M9 3h6l-1 5 5 13H5l5-13z"/>',
  suit: '<path d="M8 3 4 5v16h16V5l-4-2-4 7z"/><path d="m12 10-2 3 2 8 2-8z"/>',
  run: '<circle cx="14" cy="4.5" r="1.8"/><path d="m7 21 3-6 3 2v4M6 11l3-3h4l3 4h3M10 15l2-5"/>',
  capI: '<path d="M4 15a8 8 0 0 1 16 0z"/><path d="M14 15h7"/>',
  leaf: '<path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z"/><path d="M5 19 13 11"/>',
  thermo: '<path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0z"/>',
  gps: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  watch: '<rect x="7" y="7" width="10" height="10" rx="3"/><path d="M9 7l.6-4h4.8l.6 4M9 17l.6 4h4.8l.6-4M12 10v2.2l1.4 1"/>',
  sparkO: '<path d="M12 3c.5 4.5 4 8 8.5 8.5-4.5.5-8 4-8.5 8.5-.5-4.5-4-8-8.5-8.5C8 11 11.5 7.5 12 3z"/>',
};

function ic(name, size = 20, cls = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ''}</svg>`;
}

let _gid = 0;
function sparkle(size = 22) {
  const id = 'sg' + (++_gid);
  return `<svg class="sparkle" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F8BFF"/><stop offset=".45" stop-color="#9B6BFF"/><stop offset=".75" stop-color="#FF6FA8"/><stop offset="1" stop-color="#FFB547"/></linearGradient></defs><path fill="url(#${id})" d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5z"/></svg>`;
}

function logo(cls = '') { return `<span class="logo ${cls}">area<i></i></span>`; }

/* ---------- 색 유틸 ---------- */
function hexRgb(hex) {
  let c = String(hex || '#999').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgbHex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function shade(hex, amt) {
  const f = v => amt < 0 ? v * (1 + amt) : v + (255 - v) * amt;
  const [r, g, b] = hexRgb(hex);
  return rgbHex(f(r), f(g), f(b));
}
function lum(hex) { const [r, g, b] = hexRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function colorDist(a, b) {
  const [r1, g1, b1] = a, [r2, g2, b2] = b; const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
}
function nearestColor(hex) {
  const rgb = hexRgb(hex); let best = COLORS[0], bd = 1e9;
  COLORS.forEach(c => { const d = colorDist(rgb, hexRgb(c.hex)); if (d < bd) { bd = d; best = c; } });
  return best;
}

/* ---------- 옷 일러스트 (사진이 없을 때) ---------- */
const LONG_D = 'M31 17 L43 12 Q50 19 57 12 L69 17 Q79 22 83 38 L91 78 L81 80 L71 45 L70 88 L30 88 L29 45 L19 80 L9 78 L17 38 Q21 22 31 17 Z';
const COLLAR_D = 'M31 17 L42 12 L58 12 L69 17 Q79 22 83 38 L91 78 L81 80 L71 45 L70 88 L30 88 L29 45 L19 80 L9 78 L17 38 Q21 22 31 17 Z';
const CUFFS = '<path d="M81.6 75.6 90.3 73.9M18.4 75.6 9.7 73.9" stroke="DET" fill="none"/>';
const SHAPES = {
  tee: { d: 'M31 17 L43 12 Q50 19 57 12 L69 17 L87 31 L79 43 L70 37 L70 88 L30 88 L30 37 L21 43 L13 31 Z', x: '<path d="M43 12 Q50 21 57 12" fill="none" stroke="DET" stroke-width="2.2"/>' },
  long: { d: LONG_D, x: '<path d="M43 12 Q50 21 57 12" fill="none" stroke="DET" stroke-width="2.2"/>' + CUFFS },
  tank: { d: 'M37 10 L43 10 Q50 26 57 10 L63 10 Q63 26 71 33 L71 88 L29 88 L29 33 Q37 26 37 10 Z', x: '' },
  shirt: { d: COLLAR_D, x: '<path d="M50 27 V88" stroke="DET" fill="none"/><path d="M42 12 L50 22 L58 12 L61 19 L50 27 L39 19 Z" fill="FILL" stroke="DET"/>' + [38, 50, 62, 74].map(y => `<circle cx="52.6" cy="${y}" r="1.3" fill="DET" stroke="none"/>`).join('') + CUFFS },
  knit: { d: LONG_D, x: '<path d="M42.5 12.5 Q50 22 57.5 12.5" fill="none" stroke="DET" stroke-width="3"/><path d="M30 83 H70" stroke="DET"/><path d="M40 28 V81 M50 24 V81 M60 28 V81" stroke="DET" stroke-opacity=".22"/>' + CUFFS },
  hoodie: { d: LONG_D, x: '<path d="M40 15 Q36 2 50 2 Q64 2 60 15 Q50 23 40 15 Z" fill="FILL" stroke="DET"/><path d="M46 20 V33 M54 20 V33" stroke="DET"/><path d="M37 62 H63 L67 78 H33 Z" fill="none" stroke="DET"/><path d="M30 83 H70" stroke="DET"/>' + CUFFS },
  jacket: { d: COLLAR_D, x: '<path d="M42 12 L37 27 L43 31 L50 46 L57 31 L63 27 L58 12" fill="none" stroke="DET"/><path d="M50 46 V88" stroke="DET"/><circle cx="52.5" cy="57" r="1.5" fill="DET" stroke="none"/><circle cx="52.5" cy="69" r="1.5" fill="DET" stroke="none"/><path d="M34 66 H44 M56 66 H66" stroke="DET"/>' + CUFFS },
  coat: { d: 'M31 15 L42 10 L58 10 L69 15 Q79 20 83 36 L90 84 L80 86 L72 46 L74 96 L26 96 L28 46 L20 86 L10 84 L17 36 Q21 20 31 15 Z', x: '<path d="M42 10 L36 26 L43 30 L50 44 L57 30 L64 26 L58 10" fill="none" stroke="DET"/><path d="M50 44 V96" stroke="DET"/><path d="M28 58 H72" stroke="DET" stroke-width="3.2"/><circle cx="45" cy="50" r="1.5" fill="DET" stroke="none"/><circle cx="55" cy="50" r="1.5" fill="DET" stroke="none"/>' },
  padding: { d: 'M31 15 L42 10 L58 10 L69 15 Q79 20 83 36 L90 84 L80 86 L72 46 L74 96 L26 96 L28 46 L20 86 L10 84 L17 36 Q21 20 31 15 Z', x: '<path d="M27 30 H73 M27 42 H73 M28 54 H72 M27 66 H73 M26 78 H74 M26 90 H74" stroke="DET" stroke-opacity=".55"/><path d="M50 12 V96" stroke="DET"/><path d="M40 11 Q50 19 60 11" fill="none" stroke="DET" stroke-width="2.4"/>' },
  cardigan: { d: LONG_D, x: '<path d="M43 12 L50 40 V88" fill="none" stroke="DET"/>' + [48, 58, 68, 78].map(y => `<circle cx="53" cy="${y}" r="1.4" fill="DET" stroke="none"/>`).join('') + '<path d="M30 83 H70" stroke="DET"/>' + CUFFS },
  pants: { d: 'M29 10 H71 L75 92 H55 L50 34 L45 92 H25 Z', x: '<path d="M29 17 H71" stroke="DET"/><path d="M50 17 V30" stroke="DET"/><path d="M38 21 L36 91 M62 21 L64 91" stroke="DET" stroke-opacity=".35"/>' },
  jeans: { d: 'M29 10 H71 L77 92 H55 L50 34 L45 92 H23 Z', x: '<path d="M29 17 H71" stroke="DET"/><path d="M32 17 Q34 27 43 25 M68 17 Q66 27 57 25" fill="none" stroke="DET"/><path d="M50 17 V32" stroke="DET" stroke-dasharray="2 2"/><path d="M26 86 H44 M56 86 H74" stroke="DET" stroke-opacity=".5"/>' },
  shorts: { d: 'M27 16 H73 L78 64 H54 L50 36 L46 64 H22 Z', x: '<path d="M27 23 H73" stroke="DET"/><path d="M50 23 V34" stroke="DET"/>' },
  skirt: { d: 'M33 14 H67 L80 86 H20 Z', x: '<path d="M33 21 H67" stroke="DET"/><path d="M42 21 L35 86 M50 21 V86 M58 21 L65 86" stroke="DET" stroke-opacity=".55"/>' },
  dress: { d: 'M38 8 L44 8 Q50 17 56 8 L62 8 L64 26 Q62 34 59 40 L79 92 H21 L41 40 Q38 34 36 26 Z', x: '<path d="M41 40 H59" stroke="DET"/><path d="M46 44 L38 90 M54 44 L62 90" stroke="DET" stroke-opacity=".3"/>' },
  sneaker: { d: 'M8 64 Q9 47 21 45 L35 47 Q45 57 62 58 Q85 59 92 69 L92 74 H8 Z', x: '<path d="M7 74 H93 V79 Q93 83 89 83 H11 Q7 83 7 79 Z" fill="SOLE" stroke="DET"/><path d="M30 50 L38 55 M35 48 L43 53 M40 51 L47 56" stroke="DET"/><path d="M68 61 Q82 62 88 70" fill="none" stroke="DET"/>' },
  loafer: { d: 'M8 68 Q9 54 24 53 Q44 54 64 59 Q87 61 92 71 L92 76 H8 Z', x: '<path d="M7 76 H93 V80 Q93 83 90 83 H10 Q7 83 7 80 Z" fill="SOLEDK" stroke="DET"/><path d="M34 55 Q44 64 56 58" fill="none" stroke="DET"/>' },
  boots: { d: 'M30 12 H54 L55 56 Q80 58 86 70 L86 80 H30 Z', x: '<path d="M29 80 H87 V84 Q87 87 84 87 H32 Q29 87 29 84 Z" fill="SOLEDK" stroke="DET"/><path d="M44 24 Q48 40 44 54" fill="none" stroke="DET"/><path d="M50 8 V16" stroke="DET" stroke-width="2.4"/>' },
  tote: { d: 'M18 40 H82 L76 90 H24 Z', x: '<path d="M34 40 Q34 14 50 14 Q66 14 66 40" fill="none" stroke="DET" stroke-width="4"/><path d="M19.4 48 H80.6" stroke="DET"/>' },
  cross: { d: 'M20 46 H80 Q84 46 84 50 V84 Q84 88 80 88 H20 Q16 88 16 84 V50 Q16 46 20 46 Z', x: '<path d="M22 47 L50 8 L78 47" fill="none" stroke="DET" stroke-width="2.4"/><path d="M16 52 H84 V62 Q50 72 16 62 Z" fill="FILL" stroke="DET"/><circle cx="50" cy="66" r="2.6" fill="DET" stroke="none"/>' },
  backpack: { d: 'M28 28 Q28 14 50 14 Q72 14 72 28 V88 Q72 92 68 92 H32 Q28 92 28 88 Z', x: '<path d="M35 58 H65 V82 H35 Z" fill="none" stroke="DET"/><path d="M44 14 Q44 6 50 6 Q56 6 56 14" fill="none" stroke="DET" stroke-width="2.4"/>' },
  cap: { d: 'M20 62 Q20 28 50 28 Q80 28 80 62 Z', x: '<path d="M56 62 Q80 58 95 68 Q80 72 56 68 Z" fill="FILL" stroke="DET"/><path d="M50 28 V62 M35 32 Q40 46 38 62 M65 32 Q60 46 62 62" fill="none" stroke="DET" stroke-opacity=".5"/><circle cx="50" cy="28" r="2.4" fill="DET" stroke="none"/>' },
  necklace: { d: '', x: '<path d="M28 16 Q50 76 72 16" fill="none" stroke="DET" stroke-width="2.6"/><circle cx="50" cy="56" r="7" fill="FILL" stroke="DET" stroke-width="2"/>' },
  scarf: { d: 'M28 16 Q50 26 72 16 L70 34 Q50 42 30 34 Z M40 36 L36 88 H48 L52 40 Z M56 38 L60 82 H70 L64 36 Z', x: '<path d="M37 90 V95 M41 90 V95 M45 90 V95 M61 84 V89 M65 84 V89 M69 84 V89" stroke="DET"/>' },
  belt: { d: 'M6 44 H94 V56 H6 Z', x: '<rect x="22" y="40" width="14" height="20" rx="2" fill="none" stroke="#C9A24A" stroke-width="2.6"/><circle cx="62" cy="50" r="1.4" fill="DET" stroke="none"/><circle cx="70" cy="50" r="1.4" fill="DET" stroke="none"/><circle cx="78" cy="50" r="1.4" fill="DET" stroke="none"/>' },
  glasses: { d: '', x: '<circle cx="31" cy="52" r="13" fill="none" stroke="DET" stroke-width="3"/><circle cx="69" cy="52" r="13" fill="none" stroke="DET" stroke-width="3"/><path d="M44 50 Q50 45 56 50" fill="none" stroke="DET" stroke-width="3"/>' },
};

let _svgId = 0;
function garmentSVG(it, view = 'front') {
  const key = SHAPE_OF[it.sub] || CAT_SHAPE[it.cat] || 'tee';
  const S = SHAPES[key];
  const fill = it.color || '#CCCCCC';
  const L = lum(fill);
  const stroke = L > 0.86 ? '#C3C8D1' : L < 0.2 ? shade(fill, 0.3) : shade(fill, -0.3);
  const det = L > 0.86 ? '#B5BBC6' : L < 0.2 ? shade(fill, 0.26) : shade(fill, -0.24);
  const id = 'gm' + (++_svgId);
  let body = '';
  if (S.d) {
    body = `<path d="${S.d}" fill="${fill}"/>`;
    if (it.pattern === 'stripe') body += `<path d="${S.d}" fill="url(#${id}p)" stroke="none"/>`;
    body += `<path d="${S.d}" fill="url(#${id}s)" stroke="none"/>`;
  }
  const isShoe = key === 'sneaker' || key === 'loafer' || key === 'boots';
  const extras = view === 'back' && S.d && !isShoe ? '' : S.x;
  const x = extras.replaceAll('FILL', fill).replaceAll('SOLEDK', '#3A3532').replaceAll('SOLE', L > 0.86 ? '#E6E7EA' : '#F5F4F0').replaceAll('DET', det);
  const tf = view === 'side' ? ' transform="translate(50 0) scale(.74 1) translate(-50 0)"' : '';
  return `<svg class="garment" viewBox="0 0 100 100" aria-hidden="true"><defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>
    <pattern id="${id}p" width="100" height="7" patternUnits="userSpaceOnUse"><rect y="2" width="100" height="2.6" fill="#fff" fill-opacity=".8"/></pattern>
  </defs><g${tf} stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${body}${x}</g></svg>`;
}
