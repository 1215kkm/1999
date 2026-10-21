/* area — 날씨 서버 (Cloudflare Worker)
   한국: 기상청 공공데이터 API (단기예보 · 초단기실황 · 중기예보)
   해외: MET Norway Locationforecast (무료 · 상업 사용 가능, 출처 표기 필요)
   응답 모양은 앱(Weather.data)과 같음: { temp, code, max, min, days: [{ date, max, min, code }], source }
   code 는 앱이 원래 쓰던 WMO 날씨 코드 (0 맑음, 2 구름 조금, 3 흐림, 61 비, 71 눈, 95 뇌우)

   설정 (Cloudflare 대시보드 → Workers → Settings → Variables):
     KMA_KEY   : 공공데이터포털 '일반 인증키 (Decoding)'  ← Secret 으로 저장
     CONTACT   : MET Norway 가 요구하는 연락처 (예: 9look.app@gmail.com)
     ORIGINS   : 허용할 사이트 (예: https://1215kkm.github.io) — 비우면 모두 허용 */

const KMA = 'https://apis.data.go.kr/1360000';
const CACHE_MIN = 30;

export default {
  async fetch(req, env, ctx) {
    const cors = corsHeaders(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const u = new URL(req.url);
    const lat = Number(u.searchParams.get('lat')), lon = Number(u.searchParams.get('lon'));
    const tz = Number(u.searchParams.get('tz') || 540); // 해외 일별 집계용: UTC 와의 차이(분)
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return json({ error: 'lat, lon 이 필요해요' }, 400, cors);

    // 같은 동네(소수점 1자리) · 30분 단위로 캐시 → 기상청 호출 횟수 절약 (하루 1만 회 제한)
    const slot = Math.floor(Date.now() / (CACHE_MIN * 60e3));
    const key = new Request(`https://cache.area/w?lat=${lat.toFixed(1)}&lon=${lon.toFixed(1)}&tz=${tz}&s=${slot}`);
    const cache = caches.default;
    const hit = await cache.match(key);
    if (hit) return withCors(hit, cors);

    let body;
    try {
      body = inKorea(lat, lon) && env.KMA_KEY ? await kmaWeather(lat, lon, env.KMA_KEY) : await metWeather(lat, lon, tz, env.CONTACT);
    } catch (e) {
      // 기상청이 잠시 안 되면 해외용 예보로라도 응답
      try { body = await metWeather(lat, lon, tz, env.CONTACT); } catch (e2) { return json({ error: String(e2.message || e2) }, 502, cors); }
    }
    const res = json(body, 200, { ...cors, 'Cache-Control': `public, max-age=${CACHE_MIN * 60}` });
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  },
};

/* ---------- 공통 ---------- */
function corsHeaders(req, env) {
  const origin = req.headers.get('Origin') || '*';
  const allow = (env.ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    'Access-Control-Allow-Origin': !allow.length ? '*' : allow.includes(origin) ? origin : allow[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  };
}
function withCors(res, cors) { const r = new Response(res.body, res); Object.entries(cors).forEach(([k, v]) => r.headers.set(k, v)); return r; }
function json(o, status, headers) { return new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } }); }
const pad = n => String(n).padStart(2, '0');
function ymd(d) { return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`; }
function dash(s) { return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`; }
function inKorea(lat, lon) { return lat > 32.8 && lat < 38.9 && lon > 124 && lon < 131.2; }

/* ---------- 기상청 ---------- */
/* 위경도 → 기상청 격자(nx, ny): 기상청 제공 람베르트 정각원추도법 */
function toGrid(lat, lon) {
  const RE = 6371.00877, GRID = 5.0, SLAT1 = 30, SLAT2 = 60, OLON = 126, OLAT = 38, XO = 43, YO = 136, R = Math.PI / 180;
  const re = RE / GRID, s1 = SLAT1 * R, s2 = SLAT2 * R, olon = OLON * R, olat = OLAT * R;
  let sn = Math.log(Math.cos(s1) / Math.cos(s2)) / Math.log(Math.tan(Math.PI * 0.25 + s2 * 0.5) / Math.tan(Math.PI * 0.25 + s1 * 0.5));
  let sf = Math.pow(Math.tan(Math.PI * 0.25 + s1 * 0.5), sn) * Math.cos(s1) / sn;
  let ro = re * sf / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);
  let ra = re * sf / Math.pow(Math.tan(Math.PI * 0.25 + lat * R * 0.5), sn);
  let th = lon * R - olon;
  if (th > Math.PI) th -= 2 * Math.PI;
  if (th < -Math.PI) th += 2 * Math.PI;
  th *= sn;
  return { nx: Math.floor(ra * Math.sin(th) + XO + 0.5), ny: Math.floor(ro - ra * Math.cos(th) + YO + 0.5) };
}

/* 하늘상태(SKY) · 강수형태(PTY) → 날씨 코드 */
function kmaCode(sky, pty) {
  pty = Number(pty || 0);
  if (pty === 3 || pty === 7) return 71;               // 눈 · 눈날림
  if (pty === 1 || pty === 2 || pty === 4 || pty === 5 || pty === 6) return 61; // 비 · 비/눈 · 소나기 · 빗방울
  sky = Number(sky || 1);
  return sky >= 4 ? 3 : sky === 3 ? 2 : 0;
}
/* 중기예보 글자(맑음 · 구름많음 · 흐리고 비 …) → 날씨 코드 */
function midCode(wf = '') {
  if (/눈/.test(wf)) return 71;
  if (/비|소나기/.test(wf)) return 61;
  if (/흐림/.test(wf)) return 3;
  if (/구름/.test(wf)) return 2;
  return 0;
}

async function kmaGet(path, params, key) {
  const q = new URLSearchParams({ serviceKey: key, pageNo: '1', numOfRows: '1500', dataType: 'JSON', ...params });
  const r = await fetch(`${KMA}/${path}?${q}`, { cf: { cacheTtl: 600 } });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch (e) { throw new Error('기상청 응답 오류: ' + t.slice(0, 120)); } // 키 오류는 XML 로 옴
  const h = j.response && j.response.header;
  if (!h || h.resultCode !== '00') throw new Error('기상청 ' + (h ? `${h.resultCode} ${h.resultMsg}` : '응답 없음'));
  const it = j.response.body.items.item;
  return Array.isArray(it) ? it : [it];
}

/* 한국 시간 기준으로, 지금 받을 수 있는 가장 최근 발표 시각 */
function kst() { return new Date(Date.now() + 9 * 36e5); }
function vilageBase() { // 단기예보: 매일 02시 발표분(그날 최저 · 최고 포함), 02:10 전이면 전날 23시
  const n = kst(), mins = n.getUTCHours() * 60 + n.getUTCMinutes();
  if (mins >= 2 * 60 + 15) return { base_date: ymd(n), base_time: '0200' };
  const y = new Date(n.getTime() - 864e5);
  return { base_date: ymd(y), base_time: '2300' };
}
function ncstBase() { // 초단기실황: 매시 정각 자료, 40분 이후 제공
  const n = new Date(kst().getTime() - 45 * 60e3);
  return { base_date: ymd(n), base_time: pad(n.getUTCHours()) + '00' };
}
function midBase() { // 중기예보: 06시 · 18시 발표
  const n = kst(), h = n.getUTCHours();
  if (h >= 18) return { tmFc: ymd(n) + '1800', base: n };
  if (h >= 6) return { tmFc: ymd(n) + '0600', base: n };
  const y = new Date(n.getTime() - 864e5);
  return { tmFc: ymd(y) + '1800', base: y };
}

/* 중기예보 지역: 가까운 도시의 기온 코드 · 육상 코드 */
const MID_CITIES = [
  ['서울', 37.57, 126.98, '11B10101', '11B00000'], ['인천', 37.46, 126.71, '11B20201', '11B00000'], ['수원', 37.26, 127.03, '11B20601', '11B00000'],
  ['춘천', 37.88, 127.73, '11D10301', '11D10000'], ['강릉', 37.75, 128.88, '11D20501', '11D20000'],
  ['대전', 36.35, 127.38, '11C20401', '11C20000'], ['청주', 36.64, 127.49, '11C10301', '11C10000'],
  ['전주', 35.82, 127.15, '11F10201', '11F10000'], ['광주', 35.16, 126.85, '11F20501', '11F20000'],
  ['대구', 35.87, 128.6, '11H10701', '11H10000'], ['부산', 35.18, 129.08, '11H20201', '11H20000'],
  ['울산', 35.54, 129.31, '11H20101', '11H20000'], ['창원', 35.23, 128.68, '11H20301', '11H20000'],
  ['제주', 33.5, 126.53, '11G00201', '11G00000'],
];
function nearestCity(lat, lon) {
  return MID_CITIES.reduce((b, c) => { const d = (c[1] - lat) ** 2 + ((c[2] - lon) * Math.cos(lat * Math.PI / 180)) ** 2; return d < b.d ? { c, d } : b; }, { c: MID_CITIES[0], d: Infinity }).c;
}

async function kmaWeather(lat, lon, key) {
  const { nx, ny } = toGrid(lat, lon);
  const [fc, nc, mid] = await Promise.all([
    kmaGet('VilageFcstInfoService_2.0/getVilageFcst', { ...vilageBase(), nx, ny }, key),
    kmaGet('VilageFcstInfoService_2.0/getUltraSrtNcst', { ...ncstBase(), nx, ny }, key).catch(() => []),
    kmaMid(lat, lon, key).catch(() => []),
  ]);
  return buildKma(fc, nc, mid, ymd(kst()), pad(kst().getUTCHours()) + '00');
}

/* 단기예보 · 실황 · 중기예보를 하루 단위로 합침 (따로 떼어 테스트할 수 있게 순수 함수) */
function buildKma(fc, nc, mid, today, nowHHMM) {
  const by = {};
  for (const it of fc) {
    const d = (by[it.fcstDate] = by[it.fcstDate] || { tmp: [], sky: {}, pty: {} });
    if (it.category === 'TMP') d.tmp.push(Number(it.fcstValue));
    if (it.category === 'TMN') d.tmn = Number(it.fcstValue);
    if (it.category === 'TMX') d.tmx = Number(it.fcstValue);
    if (it.category === 'SKY') d.sky[it.fcstTime] = it.fcstValue;
    if (it.category === 'PTY') d.pty[it.fcstTime] = it.fcstValue;
  }
  // 하루 대표 날씨: 낮(09~18시)에 비 · 눈이 있으면 그것, 아니면 가장 흐린 하늘
  const dayCode = d => {
    const hours = Object.keys(d.sky).filter(t => t >= '0900' && t <= '1800');
    const hs = hours.length ? hours : Object.keys(d.sky);
    const wet = hs.map(t => kmaCode(1, d.pty[t])).filter(c => c >= 61);
    if (wet.length) return Math.max(...wet);
    const skies = hs.map(t => Number(d.sky[t] || 1));
    const avg = skies.reduce((a, b) => a + b, 0) / Math.max(1, skies.length);
    return kmaCode(avg >= 3.5 ? 4 : avg >= 2.2 ? 3 : 1, 0);
  };
  const days = Object.keys(by).sort().filter(k => k >= today).map(k => {
    const d = by[k];
    const max = d.tmx != null ? d.tmx : Math.max(...d.tmp), min = d.tmn != null ? d.tmn : Math.min(...d.tmp);
    return { date: dash(k), max: Math.round(max), min: Math.round(min), code: dayCode(d) };
  });
  mid.forEach(m => { if (!days.some(d => d.date === m.date)) days.push(m); });
  days.sort((a, b) => a.date.localeCompare(b.date));

  // 지금 기온 · 날씨: 실황(T1H, PTY) → 없으면 가장 가까운 시각의 예보
  const n = {}; nc.forEach(it => { n[it.category] = it.obsrValue; });
  const t0 = by[today] || {};
  const near = Object.keys(t0.sky || {}).sort().find(t => t >= nowHHMM) || Object.keys(t0.sky || {}).sort().pop();
  const temp = n.T1H != null ? Number(n.T1H) : (t0.tmp && t0.tmp.length ? t0.tmp[0] : days[0] ? (days[0].max + days[0].min) / 2 : 15);
  const code = Number(n.PTY || 0) > 0 ? kmaCode(1, n.PTY) : kmaCode(near ? t0.sky[near] : 1, near ? t0.pty[near] : 0);
  const d0 = days[0] || { max: Math.round(temp), min: Math.round(temp) };
  return { temp: Math.round(temp), code, max: d0.max, min: d0.min, days: days.slice(0, 10), source: '기상청' };
}

async function kmaMid(lat, lon, key) {
  const c = nearestCity(lat, lon), { tmFc, base } = midBase();
  const [land, ta] = await Promise.all([
    kmaGet('MidFcstInfoService/getMidLandFcst', { regId: c[4], tmFc }, key),
    kmaGet('MidFcstInfoService/getMidTa', { regId: c[3], tmFc }, key),
  ]);
  return buildMid(land[0] || {}, ta[0] || {}, base);
}
/* 중기예보: n일 뒤(3~10일, 발표 시기에 따라 4일부터) 낮 날씨 · 최저 · 최고 */
function buildMid(land, ta, base) {
  const out = [];
  for (let k = 3; k <= 10; k++) {
    const wf = land[`wf${k}Pm`] || land[`wf${k}`], mn = ta[`taMin${k}`], mx = ta[`taMax${k}`];
    if (wf == null || mn == null || mx == null) continue;
    const d = new Date(base.getTime() + k * 864e5);
    out.push({ date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, max: Math.round(Number(mx)), min: Math.round(Number(mn)), code: midCode(wf) });
  }
  return out;
}

/* ---------- 해외: MET Norway ---------- */
function metCode(sym = '') {
  if (/thunder/.test(sym)) return 95;
  if (/snow|sleet/.test(sym)) return 71;
  if (/rain/.test(sym)) return 61;
  if (/fog/.test(sym)) return 45;
  if (/^cloudy/.test(sym)) return 3;
  if (/partlycloudy|fair/.test(sym)) return 2;
  return 0;
}
async function metWeather(lat, lon, tz, contact) {
  const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, {
    headers: { 'User-Agent': `area-weather/1.0 ${contact || 'https://1215kkm.github.io/1999/site/'}` },
  });
  if (!r.ok) throw new Error('MET Norway ' + r.status);
  return buildMet(await r.json(), tz);
}
function buildMet(j, tz) {
  const ts = j.properties.timeseries, by = {};
  ts.forEach(t => {
    const local = new Date(new Date(t.time).getTime() + tz * 60e3), key = local.toISOString().slice(0, 10), h = local.getUTCHours();
    const d = (by[key] = by[key] || { tmp: [], codes: [] });
    d.tmp.push(t.data.instant.details.air_temperature);
    const sym = (t.data.next_1_hours || t.data.next_6_hours || {}).summary;
    if (sym && h >= 9 && h <= 18) d.codes.push(metCode(sym.symbol_code));
  });
  const days = Object.keys(by).sort().slice(0, 10).map(k => {
    const d = by[k], wet = d.codes.filter(c => c >= 61);
    return { date: k, max: Math.round(Math.max(...d.tmp)), min: Math.round(Math.min(...d.tmp)), code: wet.length ? Math.max(...wet) : d.codes.length ? Math.max(...d.codes) : 0 };
  });
  const now = ts[0], sym = (now.data.next_1_hours || now.data.next_6_hours || {}).summary;
  return { temp: Math.round(now.data.instant.details.air_temperature), code: metCode(sym && sym.symbol_code), max: days[0].max, min: days[0].min, days, source: 'MET Norway' };
}
