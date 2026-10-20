/* area — 공통 UI · 라우터 · 시트 */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => n.toLocaleString('ko-KR') + '원';

const SCREENS = {};
const SHEETS = {};
const SHEET_MOUNT = {};
const A = {}; // 액션 핸들러: data-act="이름" data-arg="값"

/* 화면 사이에서 공유되는 메모리 상태 (저장 안 함) */
const ui = {
  route: { name: 'home', arg: null },
  sheets: [],
  results: { list: [], ctx: {}, source: 'ai' },
  detailIdx: 0,
};

let toastTimer;
function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function itemById(id) { return Store.state.items.find(i => i.id === id); }
function famOf(id) { return Store.state.family.find(f => f.id === id) || { id, name: '나', label: '내 옷' }; }

/* ---------- 라우터 ---------- */
/* 화면 이동은 앱 안의 스택으로 관리 (공유 페이지 iframe에서도 동작하도록) */
const navStack = [];
function setRoute(r) {
  ui.route = r; ui.sheets = [];
  try { history.replaceState(null, '', '#/' + r.name + (r.arg != null ? '/' + encodeURIComponent(r.arg) : '')); } catch (e) { /* 샌드박스에서는 무시 */ }
  render();
}
function go(name, arg = null, opts = {}) {
  if (!opts.replace) navStack.push(ui.route);
  setRoute({ name, arg: arg != null ? String(arg) : null });
}
function back(fallback = 'home') {
  const r = navStack.pop();
  setRoute(r || { name: fallback, arg: null });
}
function parseHash() {
  const [, name, arg] = (location.hash || '').match(/^#\/([^/]+)(?:\/(.+))?/) || [];
  return { name: name || 'home', arg: arg ? decodeURIComponent(arg) : null };
}

/* ---------- 렌더링 ---------- */
const scrollMem = {};
let mountedScreen = null;
function routeKey(r) { return r.name + ':' + (r.arg || ''); }

function render() {
  const r = ui.route;
  let S = SCREENS[r.name];
  if (!Store.state.loggedIn) S = SCREENS.login;
  if (!S) S = SCREENS.home;
  const key = routeKey(r);
  const sc = $('#screen .scroll');
  if (sc && mountedScreen) scrollMem[mountedScreen.key] = sc.scrollTop;
  if (mountedScreen && mountedScreen.S !== S && mountedScreen.S.unmount) mountedScreen.S.unmount();
  $('#screen').innerHTML = S.render(r.arg);
  $('#nav').innerHTML = S.nav ? navBar(S.nav) : '';
  const sc2 = $('#screen .scroll');
  if (sc2 && scrollMem[key] != null && mountedScreen && mountedScreen.key === key) sc2.scrollTop = scrollMem[key];
  mountedScreen = { S, key };
  if (S.mount) S.mount(r.arg);
  renderOverlay();
}

function navBar(active) {
  const b = (k, icon, label) => `<button class="nav-btn ${active === k ? 'on' : ''}" data-act="go" data-arg="${k}">${icon}<span>${label}</span></button>`;
  return `<nav class="nav">
    ${b('home', ic('home', 22), '홈')}
    ${b('closet', ic('closet', 22), '옷장')}
    <div class="nav-mid"><button class="nav-reg" data-act="regStart" aria-label="옷 등록">${ic('hanger', 26)}<b class="nav-reg-plus">${ic('plus', 12)}</b></button><span>등록</span></div>
    ${b('ai', active === 'ai' ? sparkle(22) : ic('sparkO', 22), 'AI 코디')}
    ${b('codibook', ic('book', 22), '코디북')}
  </nav>`;
}

/* ---------- 시트 (하단 모달, 스택) ---------- */
function openSheet(type, props = {}) { ui.sheets.push({ type, _new: true, ...props }); renderOverlay(); }
function topSheet() { return ui.sheets[ui.sheets.length - 1]; }
function closeSheet() { const s = ui.sheets.pop(); if (s && s.onClose) s.onClose(); renderOverlay(); }
function closeAllSheets() { ui.sheets = []; renderOverlay(); }
function renderOverlay() {
  const o = $('#overlay');
  const sh = topSheet();
  if (!sh) { o.innerHTML = ''; o.className = ''; return; }
  const prev = $('.sheet-body', o);
  const keepScroll = prev && o.dataset.sid === String(ui.sheets.length) + sh.type ? prev.scrollTop : 0;
  o.className = 'open';
  o.dataset.sid = String(ui.sheets.length) + sh.type;
  o.innerHTML = `<div class="backdrop ${sh._new ? 'anim' : ''}" data-act="closeSheet"></div>
    <div class="sheet ${sh.full ? 'full' : ''} ${sh.cls || ''} ${sh._new ? 'anim' : ''}" data-act="noop">
      ${sh.full ? '' : '<div class="grab"></div>'}${SHEETS[sh.type](sh)}</div>`;
  sh._new = false;
  const nb = $('.sheet-body', o); if (nb) nb.scrollTop = keepScroll;
  if (SHEET_MOUNT[sh.type]) SHEET_MOUNT[sh.type](sh);
}

/* ---------- 공통 컴포넌트 ---------- */
function avatar() {
  const n = Store.state.user.name || '나';
  return `<button class="avatar" data-act="go" data-arg="my" aria-label="마이페이지">${esc(n.slice(0, 1))}</button>`;
}
function topbar(title, { backBtn = false, right = '', sub = '' } = {}) {
  return `<header class="topbar pad">
    <div class="tb-left">${backBtn ? `<button class="icon-btn" data-act="back">${ic('chevL', 24)}</button>` : ''}<h1 class="tb-title">${title}</h1></div>
    <div class="tb-right">${right}</div>
  </header>${sub ? `<p class="tb-sub pad">${sub}</p>` : ''}`;
}

function itemArt(it, opts = {}) {
  const pid = it.photos && it.photos[opts.photo || 0];
  const src = pid && IMG.get(pid);
  if (src) return `<img src="${src}" alt="${esc(it.name)}" draggable="false">`;
  return garmentSVG(it, opts.view);
}

/* 플랫레이 보드: 아이템들을 겹쳐 배치한 코디 이미지 */
function board(items, opts = {}) {
  const list = sortSlots(items.filter(Boolean));
  const by = {}; list.forEach(it => { const sl = slotOf(it); (by[sl] = by[sl] || []).push(it); });
  const H = 115, pos = [];
  const put = (it, x, y, w, z) => pos.push({ it, x, y, w, z });
  const outer = by.outer?.[0], top = by.top?.[0], bottom = by.bottom?.[0], dress = by.dress?.[0], shoes = by.shoes?.[0], bag = by.bag?.[0];
  const accs = by.acc || [];
  if (list.length === 1) put(list[0], 14, 14, 72, 2);
  else if (dress) {
    put(dress, 22, 3, 58, 2);
    if (outer) put(outer, 0, 6, 46, 1);
    if (shoes) put(shoes, 6, 78, 34, 3);
    if (bag) put(bag, 64, 64, 34, 3);
    accs.slice(0, 2).forEach((a, i) => put(a, 72, 4 + i * 26, 24, 4));
  } else {
    if (outer) put(outer, 1, 4, 52, 1);
    if (top) put(top, outer ? 36 : 22, 2, outer ? 48 : 54, 2);
    if (bottom) put(bottom, 26, 44, 48, 1.5);
    if (shoes) put(shoes, 1, 80, 32, 3);
    if (bag) put(bag, 67, 58, 31, 3);
    accs.slice(0, 2).forEach((a, i) => put(a, i ? 76 : 3, i ? 32 : 57, 22, 4));
  }
  return `<div class="board ${opts.cls || ''}">${pos.map(p => `<div class="bitem ${p.it.virtual ? 'virtual' : ''}" style="left:${p.x}%;top:${p.y / H * 100}%;width:${p.w}%;z-index:${Math.round(p.z * 2)}">${itemArt(p.it)}${p.it.virtual && opts.badge !== false ? `<span class="vbadge">${sparkle(11)}</span>` : ''}</div>`).join('')}</div>`;
}
function colorDots(items) {
  const cols = [...new Set(items.filter(Boolean).map(i => i.color))].slice(0, 4);
  return `<div class="cdots">${cols.map(c => `<i style="background:${c}"></i>`).join('')}</div>`;
}

function chip(label, on, act, arg, extra = '') {
  return `<button class="chip ${on ? 'on' : ''} ${extra}" data-act="${act}" data-arg="${esc(arg)}">${label}</button>`;
}
function seg(list, active, act, prefix = '') {
  return `<div class="seg">${list.map(v => `<button class="${v === active ? 'on' : ''}" data-act="${act}" data-arg="${esc(prefix + v)}">${esc(v)}</button>`).join('')}</div>`;
}
function toggle(on, act, arg = '') { return `<button class="switch ${on ? 'on' : ''}" data-act="${act}" data-arg="${arg}" role="switch" aria-checked="${on}"><i></i></button>`; }
function emptyState(msg, btn = '') { return `<div class="empty">${ic('hanger', 34)}<p>${msg}</p>${btn}</div>`; }
function locIcon(name) {
  if (/신발/.test(name)) return 'shoe';
  if (/서랍/.test(name)) return 'drawer';
  if (/드레스|행거/.test(name)) return 'hanger';
  if (/옷장/.test(name)) return 'closet';
  return 'pin';
}

/* ---------- 공용 시트 ---------- */
let promptCb = null, confirmCb = null;
function askText(title, placeholder, cb, value = '') { promptCb = cb; openSheet('prompt', { title, placeholder, value }); }
function askConfirm(title, msg, okLabel, cb, danger = false) { confirmCb = cb; openSheet('confirm', { title, msg, okLabel, danger }); }

SHEETS.prompt = sh => `<div class="sheet-body">
  <h3 class="sheet-title">${esc(sh.title)}</h3>
  <input class="input" id="promptInput" placeholder="${esc(sh.placeholder || '')}" value="${esc(sh.value || '')}" maxlength="20">
  <div class="row gap8 mt16"><button class="btn ghost flex1" data-act="closeSheet">취소</button><button class="btn primary flex1" data-act="promptOk">추가</button></div>
</div>`;
SHEET_MOUNT.prompt = () => { const i = $('#promptInput'); if (i) { i.focus(); i.onkeydown = e => { if (e.key === 'Enter') A.promptOk(); }; } };
A.promptOk = () => {
  const v = ($('#promptInput')?.value || '').trim();
  if (!v) { toast('내용을 입력해 주세요'); return; }
  const cb = promptCb; promptCb = null; closeSheet(); cb && cb(v);
};
SHEETS.confirm = sh => `<div class="sheet-body center">
  <h3 class="sheet-title">${esc(sh.title)}</h3><p class="sub">${esc(sh.msg)}</p>
  <div class="row gap8 mt16"><button class="btn ghost flex1" data-act="closeSheet">취소</button><button class="btn ${sh.danger ? 'danger' : 'primary'} flex1" data-act="confirmOk">${esc(sh.okLabel)}</button></div>
</div>`;
A.confirmOk = () => { const cb = confirmCb; confirmCb = null; closeSheet(); cb && cb(); };

/* 날씨 직접 설정 */
SHEETS.weather = () => {
  const w = Weather.current();
  return `<div class="sheet-body">
    <h3 class="sheet-title">날씨 설정</h3>
    <p class="sub">${w.live ? `${esc(w.place)} 실시간 ${Weather.data.temp}°C · ${codeToCond(Weather.data.code)}` : '실시간 날씨를 불러오지 못해 기본값을 쓰고 있어요.'}</p>
    <div class="temp-ctrl"><button class="icon-btn lg" data-act="wTemp" data-arg="-1">${ic('chevL', 22)}</button><b id="wTempV">${w.temp}°C</b><button class="icon-btn lg" data-act="wTemp" data-arg="1">${ic('chevR', 22)}</button></div>
    <input type="range" min="-15" max="38" value="${w.temp}" class="range" data-in="wTempRange">
    <div class="chips wrap mt12">${CONDS.map(c => chip(`${COND_EMOJI[c]} ${c}`, w.cond === c, 'wCond', c)).join('')}</div>
    <div class="row gap8 mt16">
      <button class="btn ghost flex1" data-act="wLive">${ic('gps', 18)} 현재 위치 날씨</button>
      <button class="btn primary flex1" data-act="closeSheet">완료</button>
    </div>
  </div>`;
};
function setManualWeather(patch) {
  const w = Weather.current();
  Store.state.weatherManual = { temp: w.temp, cond: w.cond, ...patch };
  Store.save(); invalidateRecs();
}
A.weatherSheet = () => openSheet('weather', { onClose: () => render() });
A.wTemp = d => { setManualWeather({ temp: Weather.current().temp + Number(d) }); renderOverlay(); };
A.wTempRange = v => { setManualWeather({ temp: Number(v) }); const b = $('#wTempV'); if (b) b.textContent = v + '°C'; };
A.wCond = c => { setManualWeather({ cond: c }); renderOverlay(); };
A.wLive = () => { Store.state.weatherManual = null; Store.save(); invalidateRecs(); Weather.locate(); closeSheet(); };

/* 날씨 카드 (AI 코디 · 직접 조합) */
function weatherCard(compact = false) {
  const w = Weather.current();
  const season = curSeason();
  if (compact) return `<button class="wmini" data-act="weatherSheet"><span class="we">${COND_EMOJI[w.cond] || '☀️'}</span><b>${w.temp}°</b><span>${season} · ${w.cond}</span>${ic('chevD', 14)}</button>`;
  return `<button class="wcard" data-act="weatherSheet">
    <span class="we big">${COND_EMOJI[w.cond] || '☀️'}</span>
    <div class="wtxt"><span class="wmeta">${season} · ${w.cond} / ${w.manual ? '직접 설정' : esc(w.place)}</span>
      <b class="wtemp">${w.temp}<small>°C</small></b>
      <span class="wmsg">${weatherMsg(w.temp, w.cond)}</span></div>
    <span class="wedit">${ic('edit', 16)}</span>
  </button>`;
}

/* 캐러셀: 스크롤 스냅 + 점 표시, 옵션으로 몇 초 뒤 첫 장으로 복귀 */
function bindCarousel(track, dotsEl, { resetAfter = 0, onChange } = {}) {
  if (!track) return;
  let timer = null, last = 0;
  const idx = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  track.addEventListener('scroll', () => {
    const i = idx();
    if (dotsEl) $$('i', dotsEl).forEach((d, k) => d.classList.toggle('on', k === i));
    if (i !== last) { last = i; onChange && onChange(i); }
    if (resetAfter) {
      clearTimeout(timer);
      if (track.scrollLeft > 4) timer = setTimeout(() => track.scrollTo({ left: 0, behavior: 'smooth' }), resetAfter);
    }
  }, { passive: true });
  track.addEventListener('touchstart', () => clearTimeout(timer), { passive: true });
}
function dotsHtml(n, on = 0, id = '') { return n > 1 ? `<div class="dots" ${id ? `id="${id}"` : ''}>${Array.from({ length: n }, (_, i) => `<i class="${i === on ? 'on' : ''}"></i>`).join('')}</div>` : ''; }
