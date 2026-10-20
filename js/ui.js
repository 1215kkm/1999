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

/* 가로 탭 메뉴: 다시 그려도 스크롤 위치를 유지하고, 선택한 탭이 화면 안에 보이게 */
const XSEL = '.scroll-x, .hscroll';
function captureX(root) { return $$(XSEL, root).map(e => e.scrollLeft); }
function restoreX(root, mem) {
  $$(XSEL, root).forEach((e, i) => {
    if (mem[i] != null) e.scrollLeft = mem[i];
    const on = $('.on', e); if (!on) return;
    const r = e.getBoundingClientRect(), c = on.getBoundingClientRect();
    if (c.left < r.left + 8) e.scrollLeft -= r.left - c.left + 24;
    else if (c.right > r.right - 8) e.scrollLeft += c.right - r.right + 24;
  });
}

function render() {
  const r = ui.route;
  let S = SCREENS[r.name];
  if (!Store.state.loggedIn) S = SCREENS.login;
  if (!S) S = SCREENS.home;
  const key = routeKey(r);
  const scr = $('#screen');
  const same = mountedScreen && mountedScreen.key === key && mountedScreen.S === S;
  const sc = $('#screen .scroll');
  if (sc && mountedScreen) scrollMem[mountedScreen.key] = sc.scrollTop;
  const xs = same ? captureX(scr) : [];
  if (mountedScreen && mountedScreen.S !== S && mountedScreen.S.unmount) mountedScreen.S.unmount();
  scr.innerHTML = S.render(r.arg);
  if (!same && scr.firstElementChild) scr.firstElementChild.classList.add('enter');
  $('#nav').innerHTML = S.nav ? navBar(S.nav) : '';
  const sc2 = $('#screen .scroll');
  if (sc2 && same && scrollMem[key] != null) sc2.scrollTop = scrollMem[key];
  restoreX(scr, xs);
  mountedScreen = { S, key };
  bindBars(same);
  if (S.mount) S.mount(r.arg);
  renderOverlay();
}

/* 독바 · 홈 요약: 평소엔 숨김(독바는 가운데 선만), 화면을 아래로 쓸면 나타나고 맨 위로 가면 다시 숨김 */
function setBars(show) {
  ui.bars = show;
  const n = $('#nav'); if (n) n.classList.toggle('show', show);
  const hs = $('.home-stats'); if (hs) hs.classList.toggle('show', show);
}
function bindBars(keep) {
  setBars(keep ? !!ui.bars : false);
  const sc = $('#screen .scroll'); if (!sc) return;
  let last = sc.scrollTop;
  sc.addEventListener('scroll', () => {
    const st = sc.scrollTop, dy = st - last;
    if (st <= 4) setBars(false);
    else if (dy < -4) setBars(true);
    else if (dy > 4) setBars(false);
    last = st;
  }, { passive: true });
}
A.navShow = () => { const n = $('#nav'); ui.bars = true; if (n) n.classList.add('show'); };

function navBar(active) {
  const b = (k, icon, label) => `<button class="nav-btn ${active === k ? 'on' : ''}" data-act="go" data-arg="${k}">${icon}<span>${label}</span></button>`;
  return `<button class="nav-line" data-act="navShow" aria-label="메뉴 열기"><i></i></button>
  <nav class="nav">
    ${b('home', ic('home', 22), '홈')}
    ${b('closet', ic('closet', 22), '옷장')}
    <div class="nav-mid"><button class="nav-reg" data-act="regStart" aria-label="옷 등록"><span class="reg-ring"></span><span class="reg-fill"></span>${ic('hanger', 26)}</button></div>
    ${b('ai', active === 'ai' ? sparkle(22) : ic('sparkO', 22), 'AI 코디')}
    ${b('codibook', ic('book', 22), '코디북')}
  </nav>`;
}

/* ---------- 시트 (하단 모달, 스택) ---------- */
function openSheet(type, props = {}) { ui.sheets.push({ type, _new: true, ...props }); renderOverlay(); }
function topSheet() { return ui.sheets[ui.sheets.length - 1]; }
function closeSheet() { const s = ui.sheets.pop(); if (s && s.onClose) s.onClose(); renderOverlay(); }
function closeAllSheets() { ui.sheets = []; renderOverlay(); }
/* 사용자가 닫을 때: 아래로 미끄러지며 닫힘 */
function dismissSheet() {
  const o = $('#overlay'), sh = $('.sheet', o);
  if (o.dataset.closing) return;
  if (!sh) { closeSheet(); return; }
  o.dataset.closing = '1';
  sh.style.transition = 'transform .2s ease-in'; sh.style.transform = 'translateY(105%)';
  const bd = $('.backdrop', o); if (bd && ui.sheets.length === 1) { bd.style.transition = 'opacity .2s'; bd.style.opacity = '0'; }
  setTimeout(() => { delete o.dataset.closing; closeSheet(); }, 190);
}
function renderOverlay() {
  const o = $('#overlay');
  const sh = topSheet();
  if (!sh) { o.innerHTML = ''; o.className = ''; return; }
  const prev = $('.sheet-body', o);
  const keepScroll = prev && o.dataset.sid === String(ui.sheets.length) + sh.type ? prev.scrollTop : 0;
  const xs = o.dataset.sid === String(ui.sheets.length) + sh.type ? captureX(o) : [];
  o.className = 'open';
  o.dataset.sid = String(ui.sheets.length) + sh.type;
  o.innerHTML = `<div class="backdrop ${sh._new ? 'anim' : ''}" data-act="closeSheet"></div>
    <div class="sheet ${sh.full ? 'full' : ''} ${sh.cls || ''} ${sh._new ? 'anim' : ''}" data-act="noop">
      ${sh.full ? '' : '<div class="grab-zone" aria-label="닫기"><div class="grab"></div></div>'}${SHEETS[sh.type](sh)}</div>`;
  sh._new = false;
  const nb = $('.sheet-body', o); if (nb) nb.scrollTop = keepScroll;
  restoreX(o, xs);
  bindSheetDrag(o);
  if (SHEET_MOUNT[sh.type]) SHEET_MOUNT[sh.type](sh);
}
/* 손잡이를 아래로 끌거나 누르면 닫힘. 내용이 맨 위일 때는 본문을 끌어내려도 닫힘 */
function bindSheetDrag(o) {
  const sheet = $('.sheet', o); if (!sheet) return;
  const body = $('.sheet-body', sheet);
  let y0 = null, dy = 0, grip = false, t0 = 0;
  const start = (y, isGrip) => { y0 = y; dy = 0; grip = isGrip; t0 = Date.now(); };
  const move = (y, e) => {
    if (y0 == null) return;
    dy = y - y0;
    if (!grip && body && body.scrollTop > 0) { y0 = null; return; }
    if (dy <= 0) { sheet.style.transform = ''; if (!grip) y0 = null; return; }
    sheet.style.transition = 'none'; sheet.style.transform = `translateY(${dy}px)`;
    if (e && e.cancelable) e.preventDefault();
  };
  const end = () => {
    if (y0 == null) return; y0 = null;
    const tapGrip = grip === 'zone' && dy < 6;
    if (dy > 100 || (dy > 40 && Date.now() - t0 < 250) || tapGrip) dismissSheet();
    else { sheet.style.transition = 'transform .3s cubic-bezier(.34,1.5,.6,1)'; sheet.style.transform = ''; }
  };
  sheet.addEventListener('touchstart', e => {
    const zone = e.target.closest('.grab-zone') ? 'zone' : e.target.closest('.sheet-head') ? 'head' : false;
    if (!zone && !(body && body.scrollTop <= 0 && body.contains(e.target))) return;
    if (e.target.closest(XSEL + ', input, textarea')) return;
    start(e.touches[0].clientY, zone);
  }, { passive: true });
  sheet.addEventListener('touchmove', e => move(e.touches[0].clientY, e), { passive: false });
  sheet.addEventListener('touchend', end);
  const gz = $('.grab-zone', sheet);
  if (gz) gz.addEventListener('mousedown', e => {
    e.preventDefault(); start(e.clientY, 'zone');
    const mm = ev => move(ev.clientY);
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); end(); };
    document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu);
  });
}

/* ---------- 공통 컴포넌트 ---------- */
function avatarInner(size = 0) {
  const src = IMG.get('avatar');
  if (src) return `<img src="${src}" alt="">`;
  const n = Store.state.user.name || '나';
  return size ? ic('user', size) : esc(n.slice(0, 1));
}
function avatar() {
  return `<button class="avatar" data-act="go" data-arg="my" aria-label="마이페이지">${avatarInner()}</button>`;
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
  if (it.img) return `<img src="img/items/${it.img}.webp" alt="${esc(it.name)}" loading="lazy" draggable="false">`;
  return garmentSVG(it, opts.view);
}

/* 플랫레이 보드: 왼쪽 위 상의 · 오른쪽 하의(살짝 기울임) · 왼쪽 아래 가방 · 오른쪽 아래 신발 */
function board(items, opts = {}) {
  const list = sortSlots(items.filter(Boolean));
  const by = {}; list.forEach(it => { const sl = slotOf(it); (by[sl] = by[sl] || []).push(it); });
  const H = 115, pos = [];
  const put = (it, x, y, w, h, z, rot = 0) => it && pos.push({ it, x, y, w, h, z, rot });
  const outer = by.outer?.[0], top = by.top?.[0], bottom = by.bottom?.[0], dress = by.dress?.[0], shoes = by.shoes?.[0], bag = by.bag?.[0];
  const accs = by.acc || [];
  if (list.length === 1) put(list[0], 12, 12, 76, 91, 2);
  else if (dress) {
    put(dress, 2, 3, 50, 84, 2);
    put(outer, 50, 3, 48, 54, 1);
    put(bag, 56, outer ? 56 : 18, 38, 36, 3);
    put(shoes, 52, 84, 44, 28, 3);
    accs.slice(0, 2).forEach((a, i) => put(a, 4 + i * 24, 89, 20, 22, 4));
  } else {
    const wide = !bottom;
    if (outer) { put(outer, 0, 2, 46, 54, 1); put(top, 24, 8, 36, 42, 3); }
    else put(top, wide ? 14 : 2, 3, wide ? 72 : 52, wide ? 66 : 56, 2);
    put(bottom, 53, 5, 45, 78, 1.5, 5);
    put(bag, 5, 62, 36, 42, 3);
    put(shoes, bottom ? 54 : 52, 84, 42, 28, 3);
    accs.slice(0, 2).forEach((a, i) => put(a, i ? 38 : 39, i ? 58 : 88, 17, 20, 4));
  }
  return `<div class="board ${opts.cls || ''}">${pos.map(p => `<div class="bitem ${p.it.virtual ? 'virtual' : ''}" style="left:${p.x}%;top:${(p.y / H * 100).toFixed(2)}%;width:${p.w}%;height:${(p.h / H * 100).toFixed(2)}%;z-index:${Math.round(p.z * 2)}${p.rot ? `;transform:rotate(${p.rot}deg)` : ''}">${itemArt(p.it)}${p.it.virtual && opts.badge !== false ? `<span class="vbadge">${sparkle(11)}</span>` : ''}</div>`).join('')}</div>`;
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
/* 하트를 누르면 톡 튀는 효과 */
function popHeart(sel) { requestAnimationFrame(() => $$(sel).forEach(el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); })); }

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

/* ---------- 날씨: 10일 예보에서 날짜 고르기 → AI 코디에 적용 ---------- */
const WEEK = '일월화수목금토';
function mdLabel(key) { return `${Number(key.slice(5, 7))}/${Number(key.slice(8))}`; }
function dayName(key, i) { return i === 0 ? '오늘' : i === 1 ? '내일' : WEEK[new Date(key + 'T00:00').getDay()] + '요일'; }
SHEETS.weather = () => {
  const days = Weather.days();
  return `<div class="sheet-body">
    <h3 class="sheet-title">${ic('calendar', 20)} 날씨 예보</h3>
    <p class="sub">날짜를 고르면 그날 날씨에 맞는 옷으로 AI 코디를 추천해요. (최대 10일)</p>
    <div class="fc-list mt12">${days.map((d, i) => {
      const cond = codeToCond(d.code);
      return `<button class="fc-row ${Weather.sel === i ? 'on' : ''}" data-act="wPickDay" data-arg="${i}">
        <span class="fc-day"><b>${dayName(d.date, i)}</b><small>${mdLabel(d.date)}</small></span>
        <span class="we">${COND_EMOJI[cond] || '☀️'}</span><span class="fc-cond">${cond}</span>
        <span class="fc-t"><small>${d.min}°</small><b>${d.max}°</b></span></button>`;
    }).join('')}</div>
    <button class="btn ghost block mt12" data-act="wLive">${ic('gps', 18)} 현재 위치 날씨로 바꾸기</button>
    ${Weather.data && Weather.data.live ? `<p class="hint center">${esc(Weather.data.place)} 예보 · Open-Meteo</p>` : '<p class="hint center">실시간 예보를 불러오지 못해 예시 날씨를 보여드려요.</p>'}
  </div>`;
};
A.weatherSheet = () => openSheet('weather');
A.wPickDay = i => {
  Weather.sel = Number(i);
  const d = Weather.days()[Weather.sel];
  invalidateRecs();
  ui.ai.season = curSeason(new Date(d.date + 'T00:00')); ui.ai.list = null;
  closeAllSheets();
  if (ui.route.name !== 'ai') go('ai'); else render();
  toast(Weather.sel ? `${mdLabel(d.date)} 날씨(${d.min}~${d.max}°)에 맞춘 코디예요` : '오늘 날씨에 맞춘 코디예요');
};
A.wLive = () => { Weather.sel = 0; invalidateRecs(); if (ui.ai) ui.ai.list = null; Weather.locate(); closeSheet(); };

/* 상단 오른쪽 작은 날씨 표시 (모든 화면 공통) */
function weatherChip() {
  const w = Weather.current();
  const label = w.future ? mdLabel(w.date) : w.place;
  return `<button class="wchip" data-act="weatherSheet">${COND_EMOJI[w.cond] || '☀️'} ${esc(label)} ${w.temp}°</button>`;
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
