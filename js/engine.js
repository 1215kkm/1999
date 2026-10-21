/* area — 날씨 · 코디 추천 엔진 · 이미지 처리 */

/* ---------- 날씨 (Open-Meteo, 키 없이 사용) ---------- */
function codeToCond(c) {
  if (c == null) return '맑음';
  if (c === 0) return '맑음';
  if (c <= 2) return '구름 조금';
  if (c === 3) return '흐림';
  if (c === 45 || c === 48) return '안개';
  if (c >= 71 && c <= 77) return '눈';
  if (c >= 95) return '뇌우';
  return '비';
}
const COND_EMOJI = { '맑음': '☀️', '구름 조금': '⛅', '흐림': '☁️', '안개': '🌫️', '비': '🌧️', '눈': '❄️', '뇌우': '⛈️' };
const CONDS = ['맑음', '구름 조금', '흐림', '비', '눈'];

const Weather = {
  data: null,
  sel: 0, // 고른 예보 날짜 (0 = 오늘)
  days() {
    if (this.data && this.data.days && this.data.days.length) return this.data.days;
    const base = this.data ? this.data.temp : 16;
    const wob = [0, -1, -3, -2, 1, 2, -4, -5, -2, 0], codes = [0, 1, 3, 61, 2, 0, 3, 0, 1, 2];
    return wob.map((w, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { date: dayKey(d), max: base + 4 + w, min: base - 4 + w, code: i ? codes[i] : (this.data ? this.data.code : 0) }; });
  },
  current() {
    const base = this.data || { temp: 16, code: 0, place: '서울', live: false };
    const d = this.sel > 0 && this.days()[this.sel];
    if (d) return { temp: Math.round((d.max + d.min) / 2 + 1), max: d.max, min: d.min, cond: codeToCond(d.code), place: base.place, live: base.live, date: d.date, future: true };
    return { ...base, cond: codeToCond(base.code), date: dayKey(Date.now()), future: false };
  },
  async fetch(lat = 37.5665, lon = 126.978, place = '서울') {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=10`;
      const j = await (await fetch(url)).json();
      const days = j.daily.time.map((t, i) => ({ date: t, max: Math.round(j.daily.temperature_2m_max[i]), min: Math.round(j.daily.temperature_2m_min[i]), code: j.daily.weather_code[i] }));
      this.data = { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, place, live: true, max: days[0].max, min: days[0].min, days };
      invalidateRecs();
      if (ui.ai) ui.ai.list = null;
      render();
    } catch (e) { /* 오프라인이면 예시 예보 사용 */ }
  },
  locate() {
    if (!navigator.geolocation) { toast('위치 정보를 쓸 수 없어요'); return; }
    navigator.geolocation.getCurrentPosition(
      p => { this.fetch(p.coords.latitude, p.coords.longitude, '현재 위치'); toast('현재 위치 날씨를 불러왔어요'); },
      () => toast('위치 권한이 없어 서울 날씨를 보여드려요'),
      { timeout: 8000 });
  },
};

function tempBand(t) { return t >= 24 ? 'hot' : t >= 18 ? 'mild' : t >= 10 ? 'cool' : 'cold'; }
function weatherMsg(t, cond) {
  let m = t >= 27 ? '많이 더워요. 통기성 좋은 얇은 옷을 추천해요.'
    : t >= 23 ? '반팔이 잘 어울리는 날씨예요.'
      : t >= 18 ? '얇은 긴팔이나 가벼운 겉옷이면 충분해요.'
        : t >= 12 ? '가벼운 겉옷을 더하면 좋은 날씨예요.'
          : t >= 5 ? '코트나 두께감 있는 니트가 필요해요.'
            : '패딩과 보온 아이템을 꼭 챙기세요.';
  if (cond === '비' || cond === '뇌우') m += ' 우산을 챙기세요.';
  if (cond === '눈') m += ' 미끄럽지 않은 신발을 신으세요.';
  return m;
}

/* ---------- 코디 추천 엔진 ---------- */
const SLOT_OF_CAT = { '상의': 'top', '하의': 'bottom', '아우터': 'outer', '원피스': 'dress', '신발': 'shoes', '가방': 'bag', '모자': 'acc', '시계': 'acc', '기타': 'acc' };
const SLOT_ORDER = ['outer', 'top', 'dress', 'bottom', 'shoes', 'bag', 'acc'];
const SLOT_LABEL = { outer: '아우터', top: '상의', dress: '원피스', bottom: '하의', shoes: '신발', bag: '가방', acc: '액세서리' };
function slotOf(it) { return SLOT_OF_CAT[it.cat] || 'acc'; }

const FORMAL = {
  '반팔 티셔츠': -1, '긴팔 티셔츠': -0.5, '민소매': -2, '셔츠': 2, '블라우스': 2, '니트': 1, '맨투맨': -1, '후드': -2,
  '슬랙스': 2, '청바지': -0.5, '면바지': 0.5, '반바지': -2, '스커트': 1, '트레이닝': -3,
  '재킷': 1, '블레이저': 3, '코트': 2, '패딩': -1, '카디건': 0.5, '점퍼': -1,
  '미니 원피스': 1, '롱 원피스': 2, '셔츠 원피스': 1,
  '스니커즈': -1, '로퍼': 2, '부츠': 0.5, '샌들': -1, '구두': 3,
  '힐': 3, '플랫': 1, '슬립온': -1.5, '볼캡': -2, '비니': -1.5, '버킷햇': -1.5, '페도라': 1.5, '베레모': 0.5, '헌팅캡': 0.5, '썬햇': 0,
  '메탈 시계': 1.5, '가죽 시계': 2, '스마트워치': -1, '전자시계': -2,
  '토트백': 1, '크로스백': 0, '숄더백': 1, '백팩': -2, '더플백': -1.5, '힙색': -2, '캐리어': -1, '클러치': 3, '모자': -2, '목걸이': 1, '스카프': 1, '벨트': 1, '안경': 0,
};
const STYLE_FORMAL = { '정장': 3, '캐주얼': 0, '스포츠': -3, '스트릿': -1, '미니멀': 1, '기타': 0 };
const MOOD_FORMAL = { '예식장': 3, '출근': 2, '카페': 0, '데이트': 1, '여행': -1, '캠핑': -2, '파티': 1, '운동': -3, '캠퍼스': -0.5 };
const LOOK_FORMAL = { '데일리룩': 0, '데이트룩': 1, '오피스룩': 2, '여행룩': -1, '편안룩': -2 };
const MOOD_STYLE = { '예식장': '하객', '출근': '출근', '데이트': '데이트', '여행': '여행', '운동': '운동', '캠핑': '여행', '카페': '데일리', '파티': '데이트', '캠퍼스': '데일리' };
const LOOK_STYLE = { '데일리룩': '데일리', '데이트룩': '데이트', '오피스룩': '출근', '여행룩': '여행', '편안룩': '데일리' };

function warmth(it) {
  if (it.virtual) return it.warm ?? 1;
  const t = { '얇음': 0, '보통': 1, '두꺼움': 2 }[it.thickness] ?? 1;
  const l = ['기모', '누빔', '퍼'].includes(it.lining) ? 1 : 0;
  const base = it.cat === '아우터' ? 1 : (it.cat === '상의' || it.cat === '하의' || it.cat === '원피스') ? 0.5 : 0;
  return base + t + l + (it.sub === '패딩' ? 2 : it.sub === '코트' ? 1 : 0);
}
function isNeutral(it) { return NEUTRALS.includes(it.colorName || nearestColor(it.color).name); }

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ctx: {temp, season, style, mood, look, fixed:[ids], exclude:[ids], avoid:Set, variety, aiExtra, owners:[ids]} */
function recommend(ctx, count = 8, exclude = new Set()) {
  const s = Store.state;
  const t = ctx.temp ?? Weather.current().temp;
  const band = tempBand(t);
  const season = ctx.season || curSeason();
  const owners = ctx.owners || ['me'];
  const targets = [];
  if (ctx.style && STYLE_FORMAL[ctx.style] != null) targets.push(STYLE_FORMAL[ctx.style]);
  if (ctx.mood && MOOD_FORMAL[ctx.mood] != null) targets.push(MOOD_FORMAL[ctx.mood] * 1.2);
  if (ctx.look && LOOK_FORMAL[ctx.look] != null) targets.push(LOOK_FORMAL[ctx.look]);
  const target = targets.length ? targets.reduce((a, b) => a + b, 0) / targets.length : 0;
  const wantStyles = [MOOD_STYLE[ctx.mood], LOOK_STYLE[ctx.look]].filter(Boolean);

  const fixedItems = (ctx.fixed || []).map(id => s.items.find(i => i.id === id)).filter(Boolean);
  const fixedBy = {};
  fixedItems.forEach(it => { const sl = slotOf(it); (fixedBy[sl] = fixedBy[sl] || []).push(it); });
  const fixed = new Proxy({}, { get: (_, sl) => sl === 'acc' ? fixedBy.acc : fixedBy[sl] && fixedBy[sl][Math.floor(rng() * fixedBy[sl].length)] });
  const multiFixed = new Set(Object.values(fixedBy).filter(a => a.length > 1).flat());

  const banned = new Set(ctx.exclude || []);
  const male = s.user.gender === '남성';
  const avail = s.items.filter(i => i.status === '사용 가능' && !banned.has(i.id) && (owners.includes(i.owner) || i.ownership === '공용') && !(male && i.owner === 'me' && (i.cat === '원피스' || i.sub === '스커트')));
  const okSeason = i => !i.seasons || !i.seasons.length || i.seasons.includes(season);
  const okTemp = i => {
    const w = warmth(i);
    if (band === 'hot') return !(i.cat === '아우터') && w <= 1.5 && i.sub !== '후드' && i.sub !== '니트';
    if (band === 'cold') return !(['반팔 티셔츠', '민소매', '반바지'].includes(i.sub));
    if (band === 'cool') return !(['민소매', '반바지'].includes(i.sub)) && i.sub !== '패딩';
    return i.sub !== '패딩';
  };
  const pools = {};
  SLOT_ORDER.forEach(sl => {
    const all = avail.filter(i => slotOf(i) === sl);
    let p = all.filter(i => okSeason(i) && okTemp(i));
    if (!p.length) p = all.filter(okTemp);
    if (!p.length && sl !== 'outer') p = all;
    if (target >= 1.5) { const f = p.filter(i => (FORMAL[i.sub] ?? 0) > -1.5 && !((i.styles || []).length && (i.styles || []).every(x => x === '운동'))); if (f.length) p = f; }
    if (target <= -2) { const f = p.filter(i => (FORMAL[i.sub] ?? 0) < 2.5); if (f.length) p = f; }
    pools[sl] = p;
  });

  const needOuter = band === 'cold' || band === 'cool' || (band === 'mild' && t < 21);
  const rng = mulberry((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const desiredWarm = { hot: 1, mild: 3, cool: 4.5, cold: 6.5 }[band];

  const pickVirtual = (slot, avoid = []) => {
    let list = (VIRTUAL_ITEMS[slot] || []).filter(v => !avoid.includes(v.name));
    if (slot === 'outer') list = list.filter(v => band === 'cold' ? v.warm >= 2 : v.warm <= 2);
    if (slot === 'acc' && band === 'hot') list = list.filter(v => !v.cold);
    if (!list.length) return null;
    list.sort((a, b) => Math.abs(a.f - target) - Math.abs(b.f - target));
    const v = list[Math.floor(rng() * Math.min(2, list.length))];
    return { ...v, virtual: true, id: 'v:' + v.name, colorName: nearestColor(v.color).name };
  };

  const scoreCombo = items => {
    let sc = 0;
    items.forEach(it => {
      sc -= Math.abs((FORMAL[it.sub] ?? 0) - target) * 0.7;
      if (it.fav) sc += 0.35;
      if (!it.virtual && wantStyles.some(w => (it.styles || []).includes(w))) sc += 0.9;
      if (it.virtual) sc -= 0.4;
    });
    const w = items.filter(i => slotOf(i) !== 'acc' && slotOf(i) !== 'bag').reduce((a, i) => a + warmth(i), 0);
    sc -= Math.abs(w - desiredWarm) * 0.6;
    const nonNeutral = new Set(items.filter(i => !isNeutral(i)).map(i => i.colorName || nearestColor(i.color).name));
    sc += [1.4, 2, -0.6, -2.4][Math.min(nonNeutral.size, 3)];
    const top = items.find(i => slotOf(i) === 'top'), bottom = items.find(i => slotOf(i) === 'bottom');
    if (top && bottom && top.color === bottom.color && !isNeutral(top)) sc -= 1;
    if (top && bottom && top.sub === '셔츠' && bottom.sub === '트레이닝') sc -= 2;
    // 새로고침하면 직전 추천에 나온 옷은 덜 고르도록
    if (ctx.avoid) items.forEach(it => { if (ctx.avoid.has(it.id) && !fixedItems.includes(it)) sc -= 1.6; });
    return sc + rng() * (ctx.variety || 0.6);
  };

  const seen = new Map();
  const N = 700;
  for (let k = 0; k < N; k++) {
    const c = [];
    const useDress = fixed.dress || (!fixed.top && !fixed.bottom && pools.dress.length && rng() < (target >= 1 ? 0.35 : 0.18) && band !== 'cold');
    if (useDress) { const d = fixed.dress || pick(pools.dress); if (d) c.push(d); }
    else {
      const tp = fixed.top || pick(pools.top); if (tp) c.push(tp);
      const bt = fixed.bottom || pick(pools.bottom); if (bt) c.push(bt);
    }
    if (fixed.outer) c.push(fixed.outer);
    else if (needOuter) {
      const o = pools.outer.length && !(ctx.aiExtra && rng() < 0.15) ? pick(pools.outer) : (ctx.aiExtra ? pickVirtual('outer') : null);
      if (o) c.push(o);
    }
    const sh = fixed.shoes || (pools.shoes.length ? pick(pools.shoes) : ctx.aiExtra ? pickVirtual('shoes') : null);
    if (sh) c.push(sh);
    if (fixed.bag) c.push(fixed.bag);
    else if (pools.bag.length && rng() < 0.65) c.push(pick(pools.bag));
    // 모자 · 시계 · 기타 액세서리는 종류별로 하나씩만
    if (fixed.acc) c.push(...fixed.acc);
    else [['모자', 0.3], ['시계', 0.4], ['기타', 0.15]].forEach(([cat, pr]) => { const p = pools.acc.filter(i => i.cat === cat); if (p.length && rng() < pr) c.push(pick(p)); });
    if (ctx.aiExtra && !c.some(i => i.virtual) && rng() < 0.45) { const v = pickVirtual('acc'); if (v && !c.some(i => slotOf(i) === 'acc')) c.push(v); }
    if (!c.length) continue;
    const key = c.map(i => i.id).sort().join(',');
    if (exclude.has(key) || seen.has(key)) continue;
    seen.set(key, { items: c, score: scoreCombo(c), key });
  }

  // 같은 옷이 계속 반복되지 않도록 다양성 보정하며 고르기
  const cands = [...seen.values()].sort((a, b) => b.score - a.score);
  const used = {};
  const out = [];
  while (out.length < count && cands.length) {
    let bi = 0, bs = -1e9;
    for (let i = 0; i < Math.min(cands.length, 120); i++) {
      const pen = cands[i].items.reduce((a, it) => a + (used[it.id] || 0) * (fixedItems.includes(it) && !multiFixed.has(it) ? 0 : 1.1), 0);
      const v = cands[i].score - pen;
      if (v > bs) { bs = v; bi = i; }
    }
    const best = cands.splice(bi, 1)[0];
    best.items.forEach(it => { used[it.id] = (used[it.id] || 0) + 1; });
    out.push(decorate(best, { t, band, season, target, ctx }));
  }
  return out;
}

function sortSlots(items) { return [...items].sort((a, b) => SLOT_ORDER.indexOf(slotOf(a)) - SLOT_ORDER.indexOf(slotOf(b))); }

function decorate(c, { t, band, season, target, ctx }) {
  const items = sortSlots(c.items);
  const look = ctx.look || (ctx.mood === '출근' ? '오피스룩' : ctx.mood === '데이트' ? '데이트룩' : ctx.mood === '여행' ? '여행룩' : '데일리룩');
  const adj = target >= 2 ? '포멀한' : target >= 0.8 ? '깔끔한' : target <= -2 ? '활동적인' : target <= -0.8 ? '편안한' : ['편안한', '산뜻한', '차분한', '자연스러운'][Math.floor(Math.random() * 4)];
  const title = ctx.mood ? `${ctx.mood} 가기 좋은 ${look}` : `${adj} ${look}`;
  const tags = [`#${look}`, ctx.style ? `#${ctx.style}` : null, `#${season}`, ctx.mood ? `#${ctx.mood}` : null, `#${t}도`].filter(Boolean);
  const outer = items.find(i => slotOf(i) === 'outer');
  const names = [...new Set(items.filter(i => !i.virtual).map(i => i.colorName))].slice(0, 3);
  const bandTxt = { hot: '더운 날씨', mild: '선선한 날씨', cool: '쌀쌀한 날씨', cold: '추운 날씨' }[band];
  let reason = `${t}°C ${bandTxt}에 맞췄어요. `;
  reason += outer ? `${outer.name}${outer.virtual ? '(AI 추천)' : ''}로 일교차에 대비하고, ` : '겉옷 없이 가볍게 입고, ';
  reason += names.length ? `${names.join(' · ')} 톤으로 색을 정리했어요.` : '색 조합을 차분하게 맞췄어요.';
  const virtual = items.filter(i => i.virtual);
  const caption = ['가볍게, 편안하게, 나답게.', '오늘 하루도 단정하게.', '내 옷으로 완성한 하루.', '작은 포인트로 산뜻하게.'][Math.floor(Math.random() * 4)];
  return { key: c.key, items, score: c.score, title, tags, reason, virtual, look, caption, temp: t };
}

/* ---------- 이미지 처리 ---------- */
function loadImg(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    if (/^https?:/.test(src)) im.crossOrigin = 'anonymous';
    im.onload = () => res(im); im.onerror = rej; im.src = src;
  });
}
function fileToDataURL(file) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
}
async function downscale(src, max = 1000, type = 'image/jpeg', q = 0.86) {
  const im = await loadImg(src);
  const s = Math.min(1, max / Math.max(im.width, im.height));
  const c = document.createElement('canvas');
  c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(type, q);
}

/* 단색 배경 제거: 가장자리에서 배경색을 추정해 flood-fill 로 지움 */
async function removeBg(src) {
  const im = await loadImg(src);
  const max = 560, s = Math.min(1, max / Math.max(im.width, im.height));
  const w = Math.round(im.width * s), h = Math.round(im.height * s);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, w, h);
  const img = x.getImageData(0, 0, w, h), d = img.data;
  const at = p => [d[p * 4], d[p * 4 + 1], d[p * 4 + 2]];
  const border = [];
  for (let i = 0; i < w; i += 2) border.push(at(i), at((h - 1) * w + i));
  for (let j = 0; j < h; j += 2) border.push(at(j * w), at(j * w + w - 1));
  const med = k => { const a = border.map(v => v[k]).sort((p, q) => p - q); return a[a.length >> 1]; };
  const bg = [med(0), med(1), med(2)];
  let dev = 0; border.forEach(v => { dev += colorDist(v, bg); }); dev /= border.length;
  const thr = Math.max(40, Math.min(110, dev * 2.2 + 36));

  const mask = new Uint8Array(w * h);
  const q = new Int32Array(w * h); let qh = 0, qt = 0;
  const tryPush = (p, from) => {
    if (mask[p]) return;
    const px = at(p);
    const db = colorDist(px, bg);
    if (db < thr || (from >= 0 && db < thr * 1.9 && colorDist(px, at(from)) < 14)) { mask[p] = 1; q[qt++] = p; }
  };
  for (let i = 0; i < w; i++) { tryPush(i, -1); tryPush((h - 1) * w + i, -1); }
  for (let j = 0; j < h; j++) { tryPush(j * w, -1); tryPush(j * w + w - 1, -1); }
  while (qh < qt) {
    const p = q[qh++], px = p % w, py = (p / w) | 0;
    if (px > 0) tryPush(p - 1, p); if (px < w - 1) tryPush(p + 1, p);
    if (py > 0) tryPush(p - w, p); if (py < h - 1) tryPush(p + w, p);
  }
  let fg = 0, minX = w, minY = h, maxX = 0, maxY = 0;
  for (let p = 0; p < w * h; p++) {
    if (mask[p]) { d[p * 4 + 3] = 0; continue; }
    fg++;
    const px = p % w, py = (p / w) | 0;
    if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py;
    const edge = (px > 0 && mask[p - 1]) || (px < w - 1 && mask[p + 1]) || (py > 0 && mask[p - w]) || (py < h - 1 && mask[p + w]);
    if (edge) d[p * 4 + 3] = 150;
  }
  const ratio = fg / (w * h);
  if (ratio < 0.03 || ratio > 0.97) return null;
  x.putImageData(img, 0, 0);
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.05);
  const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad + 1) - cx, ch = Math.min(h, maxY + pad + 1) - cy;
  const o = document.createElement('canvas'); o.width = cw; o.height = ch;
  o.getContext('2d').drawImage(c, cx, cy, cw, ch, 0, 0, cw, ch);
  return { url: o.toDataURL('image/png'), w: cw, h: ch };
}

/* 사진에서 대표 색상 찾기 */
async function dominantColor(src) {
  const im = await loadImg(src);
  const n = 64, c = document.createElement('canvas'); c.width = n; c.height = n;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, n, n);
  const d = x.getImageData(0, 0, n, n).data;
  let hasAlpha = false;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 200) { hasAlpha = true; break; }
  const buckets = {};
  for (let y = 0; y < n; y++) for (let xx = 0; xx < n; xx++) {
    if (!hasAlpha && (xx < n * 0.3 || xx > n * 0.7 || y < n * 0.3 || y > n * 0.7)) continue;
    const i = (y * n + xx) * 4;
    if (d[i + 3] < 200) continue;
    const k = (d[i] >> 5) << 6 | (d[i + 1] >> 5) << 3 | (d[i + 2] >> 5);
    const b = buckets[k] || (buckets[k] = [0, 0, 0, 0]);
    b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++;
  }
  let best = null;
  Object.values(buckets).forEach(b => { if (!best || b[3] > best[3]) best = b; });
  if (!best) return COLORS[2];
  return nearestColor(rgbHex(best[0] / best[3], best[1] / best[3], best[2] / best[3]));
}
