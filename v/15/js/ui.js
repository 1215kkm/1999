/* 5poom — 공통 UI · 라우터 · 시트 */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => n.toLocaleString('ko-KR') + '원';

const APP_VERSION = '1.0.0';
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
  t.textContent = T(msg); t.classList.add('show');
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

/* 가로 탭 메뉴: 선택한 탭이 바뀌었을 때만 그 탭이 화면 안에 보이도록 */
const XSEL = '.scroll-x, .hscroll';
function captureX(root) { return $$(XSEL, root).map(e => ({ left: e.scrollLeft, on: $$(':scope > *', e).findIndex(c => c.classList.contains('on')) })); }
function restoreX(root, mem) {
  $$(XSEL, root).forEach((e, i) => {
    const m = mem[i];
    if (m && Math.abs(e.scrollLeft - m.left) > 1) e.scrollLeft = m.left;
    const kids = $$(':scope > *', e), onIdx = kids.findIndex(c => c.classList.contains('on'));
    if (onIdx < 0 || (m && m.on === onIdx)) return;
    const on = kids[onIdx], r = e.getBoundingClientRect(), c = on.getBoundingClientRect();
    const to = c.left < r.left + 8 ? e.scrollLeft - (r.left - c.left + 24) : c.right > r.right - 8 ? e.scrollLeft + (c.right - r.right + 24) : null;
    if (to != null) e.scrollTo({ left: to, behavior: m ? 'smooth' : 'auto' });
  });
}

/* 같은 화면을 다시 그릴 때는 바뀐 부분만 고쳐서 이미지가 깜빡이지 않게 */
function morphNode(a, b) {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName || (a.nodeType === 1 && a.getAttribute('data-key') !== b.getAttribute('data-key'))) { a.replaceWith(b); return; }
  if (a.nodeType !== 1) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
  for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && document.activeElement !== a && a.value !== b.value) a.value = b.value;
  morphChildren(a, b);
}
function morphChildren(a, b) {
  const ac = [...a.childNodes], bc = [...b.childNodes];
  bc.forEach((n, i) => { if (i < ac.length) morphNode(ac[i], n); else a.appendChild(n); });
  for (let i = bc.length; i < ac.length; i++) ac[i].remove();
}
function patchHTML(el, html) { const t = document.createElement('div'); t.innerHTML = I18N.html(html); morphChildren(el, t); }

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
  if (same) patchHTML(scr, S.render(r.arg));
  else { setHTML(scr, S.render(r.arg)); if (scr.firstElementChild) scr.firstElementChild.classList.add(ui.swipeIn || 'enter'); }
  ui.swipeIn = null;
  const nav = $('#nav');
  if (!S.nav) nav.innerHTML = '';
  else if ($('.nav', nav)) patchHTML(nav, navBar(S.nav)); // 메뉴 배경이 미끄러지듯 이동하도록 유지
  else setHTML(nav, navBar(S.nav));
  const sc2 = $('#screen .scroll');
  if (sc2 && same && scrollMem[key] != null && sc2.scrollTop !== scrollMem[key]) sc2.scrollTop = scrollMem[key];
  restoreX(scr, xs);
  mountedScreen = { S, key };
  bindBars(same, S.nav);
  if (S.mount) S.mount(r.arg);
  renderOverlay();
}

/* 독바: 항상 펼쳐 둠. 숨은 설정에서 '선으로 접기'를 고르면 홈에서만 가운데 선으로 접힘(누르면 열림, 아래로 쓸면 다시 선)
   홈 상단 요약은 화면을 아래로 쓸 때만 보이고 맨 위에서는 숨김 */
function setDock(open) {
  ui.dockOpen = open;
  const n = $('#nav'); if (n) n.classList.toggle('show', open || !(mountedScreen && mountedScreen.S.nav === 'home' && dockLine()));
}
function dockLine() { return Store.state.prefs.homeDock === 'line'; }
function setStats(show) { ui.bars = show; const hs = $('.home-stats'); if (hs) hs.classList.toggle('show', show); }
function bindBars(keep, navType) {
  setDock(keep ? !!ui.dockOpen : false);
  setStats(keep ? !!ui.bars : false);
  const sc = $('#screen .scroll');
  if (sc) sc.classList.toggle('scrolled', sc.scrollTop > 4); // 다시 그린 뒤에도 고정 줄 그림자 유지
  const hs = $('.home-stats'), tb = sc && $(':scope > .topbar', sc); if (hs && tb) hs.style.top = (tb.offsetHeight + 4) + 'px'; // 홈 요약은 고정된 제목 줄 바로 아래
  if (!sc || sc._bars) return;
  sc._bars = true;
  let last = sc.scrollTop;
  sc.addEventListener('scroll', () => {
    const st = sc.scrollTop, dy = st - last;
    sc.classList.toggle('scrolled', st > 4);
    if (st <= 4) setStats(false);
    else if (dy < -4) { setStats(true); if (navType === 'home') setDock(false); }
    else if (dy > 4) setStats(false);
    last = st;
  }, { passive: true });
}
A.navShow = () => setDock(true);
/* 열린 독바를 아래로 쓸면 다시 선으로 */
(function bindDockSwipe() {
  let y0 = null;
  document.addEventListener('touchstart', e => { y0 = e.target.closest('#nav .nav') ? e.touches[0].clientY : null; }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (y0 == null || !mountedScreen || mountedScreen.S.nav !== 'home') return;
    if (e.touches[0].clientY - y0 > 28) { y0 = null; setDock(false); }
  }, { passive: true });
})();

function navBar(active) {
  const keys = ['home', 'closet', null, 'ai', 'codibook'];
  const b = (k, icon, label) => `<button class="nav-btn ${active === k ? 'on' : ''}" data-act="go" data-arg="${k}">${icon}<span>${label}</span></button>`;
  return `<button class="nav-line" data-act="navShow" aria-label="메뉴 열기"><i></i></button>
  <nav class="nav">
    <i class="nav-ind" style="--i:${Math.max(0, keys.indexOf(active))}"></i>
    ${b('home', ic('home', 22), '홈')}
    ${b('closet', ic('closet', 22), '옷장')}
    <div class="nav-mid"><button class="nav-reg" data-act="regStart" aria-label="옷 등록"><span class="reg-ring"></span><span class="reg-fill"></span>${ic('hanger', 26)}</button></div>
    ${b('ai', sparkle(22), 'AI 코디')}
    ${b('codibook', ic('book', 22), '코디북')}
  </nav>`;
}

/* ---------- 메뉴 화면 좌우로 쓸어 넘기기 (홈 · 옷장 · AI 코디 · 코디북) ----------
   가로로 넘어가는 목록 · 코디 판 · 입력칸 위에서는 동작하지 않음. 숨은 설정에서 끌 수 있음 */
const SWIPE_ORDER = ['home', 'closet', 'ai', 'codibook'];
const NO_SWIPE = 'input, textarea, select, .switch, .board, .mboard, .sheet, [data-noswipe]';
function swipeBlocked(t) {
  if (t.closest(NO_SWIPE)) return true;
  for (let el = t; el && el.id !== 'screen'; el = el.parentElement) {
    if (el.scrollWidth > el.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(el).overflowX)) return true;
  }
  return false;
}
(function bindScreenSwipe() {
  let st = null;
  const scr = () => $('#screen > .screen');
  document.addEventListener('touchstart', e => {
    st = null;
    if (e.touches.length !== 1 || !Store.state.prefs.swipe || ui.sheets.length || !mountedScreen) return;
    const i = SWIPE_ORDER.indexOf(mountedScreen.S.nav); if (i < 0 || !e.target.closest('#screen') || swipeBlocked(e.target)) return;
    const t = e.touches[0]; st = { x: t.clientX, y: t.clientY, t: Date.now(), i, lock: null, dx: 0 };
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!st) return;
    const t = e.touches[0], dx = t.clientX - st.x, dy = t.clientY - st.y;
    if (st.lock == null) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { st = null; return; }
      if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      st.lock = true;
    }
    e.preventDefault();
    const has = SWIPE_ORDER[st.i - Math.sign(dx)] != null;
    st.dx = has ? dx : dx * 0.25; // 끝 화면에서는 살짝만 끌림
    const s = scr(); if (s) { s.style.transition = 'none'; s.style.transform = `translateX(${st.dx}px)`; s.style.opacity = String(1 - Math.min(0.35, Math.abs(st.dx) / 900)); }
  }, { passive: false });
  document.addEventListener('touchend', () => {
    if (!st || !st.lock) { st = null; return; }
    const { dx, t, i } = st; st = null;
    const s = scr(), w = window.innerWidth, v = Math.abs(dx) / Math.max(1, Date.now() - t);
    const next = SWIPE_ORDER[i - Math.sign(dx)];
    if (next && (Math.abs(dx) > w * 0.28 || (v > 0.45 && Math.abs(dx) > 40))) {
      if (s) { s.style.transition = 'transform .16s ease-in, opacity .16s'; s.style.transform = `translateX(${Math.sign(dx) * w * 0.5}px)`; s.style.opacity = '0'; }
      setTimeout(() => { ui.swipeIn = dx < 0 ? 'swipe-l' : 'swipe-r'; A.go(next); }, 120);
    } else if (s) { s.style.transition = 'transform .3s cubic-bezier(.34, 1.4, .5, 1), opacity .2s'; s.style.transform = ''; s.style.opacity = ''; }
  });
})();

/* ---------- 시트 (하단 모달 · 오른쪽 패널 · 작은 팝업, 스택) ---------- */
function openSheet(type, props = {}) { ui.sheets.push({ type, _new: true, ...props }); renderOverlay(); }
function topSheet() { return ui.sheets[ui.sheets.length - 1]; }
function closeSheet() { const s = ui.sheets.pop(); if (s && s.onClose) s.onClose(); renderOverlay(); }
function closeAllSheets() { ui.sheets = []; renderOverlay(); }
/* 사용자가 닫을 때: 아래로(오른쪽 패널은 오른쪽으로) 미끄러지며 닫힘 */
function dismissSheet() {
  const o = $('#overlay'), sh = $('.sheet', o), top = topSheet();
  if (o.dataset.closing) return;
  if (!sh) { closeSheet(); return; }
  o.dataset.closing = '1';
  sh.style.transition = 'transform .22s ease-in, opacity .2s';
  sh.style.transform = top && top.side ? 'translateX(105%)' : top && top.pop ? 'scale(.9)' : 'translateY(105%)';
  if (top && top.pop) sh.style.opacity = '0';
  const bd = $('.backdrop', o); if (bd && ui.sheets.length === 1) { bd.style.transition = 'opacity .2s'; bd.style.opacity = '0'; }
  setTimeout(() => { delete o.dataset.closing; closeSheet(); }, 200);
}
function renderOverlay() {
  const o = $('#overlay');
  const sh = topSheet();
  if (!sh) { o.innerHTML = ''; o.className = ''; delete o.dataset.sid; return; }
  const sid = String(ui.sheets.length) + sh.type;
  const same = o.dataset.sid === sid && $('.sheet', o);
  const xs = same ? captureX(o) : [];
  o.className = 'open';
  o.dataset.sid = sid;
  const kind = sh.side ? 'side' : sh.pop ? 'popover' : '';
  const html = `<div class="backdrop ${sh._new ? 'anim' : ''} ${sh.pop ? 'clear' : ''}" data-act="closeSheet"></div>
    <div class="sheet ${kind} ${sh.full ? 'full' : ''} ${sh.cls || ''} ${sh._new ? 'anim' : ''}" data-act="noop">
      ${sh.full || sh.side || sh.pop ? '' : '<div class="grab-zone" aria-label="닫기"><div class="grab"></div></div>'}${SHEETS[sh.type](sh)}</div>`;
  if (same) patchHTML(o, html); else setHTML(o, html);
  sh._new = false;
  restoreX(o, xs);
  if (!sh.side && !sh.pop) bindSheetDrag(o);
  if (SHEET_MOUNT[sh.type]) SHEET_MOUNT[sh.type](sh);
}
/* 손잡이를 아래로 끌거나 누르면 닫힘. 내용이 맨 위일 때는 본문을 끌어내려도 닫힘 */
function bindSheetDrag(o) {
  const sheet = $('.sheet', o); if (!sheet || sheet._drag) return;
  sheet._drag = true;
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
    if (e.target.closest(XSEL + ', input, textarea, .th-chat, .th-people')) return;
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
  return size ? ic('user', size) : esc(T(n).slice(0, 1));
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
  // 직접 조합에서 옮긴 위치(옷별 이동량)를 반영
  const L = opts.layout || {};
  pos.forEach(p => { const d = L[p.it.id]; if (d) { p.x += d.dx; p.y += d.dy; } });
  return `<div class="board ${opts.cls || ''}">${pos.map(p => `<div class="bitem ${p.it.virtual ? 'virtual' : ''}" data-id="${esc(p.it.id)}" style="left:${p.x}%;top:${(p.y / H * 100).toFixed(2)}%;width:${p.w}%;height:${(p.h / H * 100).toFixed(2)}%;z-index:${Math.round(p.z * 2)}${p.rot ? `;transform:rotate(${p.rot}deg)` : ''}">${itemArt(p.it)}${p.it.virtual && opts.badge !== false ? `<span class="vbadge">${sparkle(11)}</span>` : ''}</div>`).join('')}</div>`;
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
    ${Weather.data && Weather.data.live ? `<p class="hint center">${esc(Weather.data.place)} 예보 · 출처: ${esc(Weather.data.source || 'Open-Meteo')}</p>` : '<p class="hint center">실시간 예보를 불러오지 못해 예시 날씨를 보여드려요.</p>'}
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
  const i = Weather.sel || 0, d = w.date;
  const label = i === 0 ? '오늘' : i === 1 ? '내일' : `${mdLabel(d)}(${WEEK[new Date(d + 'T00:00').getDay()]})`;
  return `<button class="wchip" data-act="weatherSheet"><b class="wday">${label}</b>${COND_EMOJI[w.cond] || '☀️'} ${w.temp}°</button>`;
}

/* 캐러셀: 스크롤 스냅 + 점 표시, 옵션으로 몇 초 뒤 첫 장으로 복귀 */
function bindCarousel(track, dotsEl, { resetAfter = 0, onChange } = {}) {
  if (!track || track._car) return;
  track._car = true;
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

/* ---------- 두 손가락으로 열 수 조절 (아이폰 사진첩처럼 손가락을 따라 부드럽게) ---------- */
function animateCols(grid, scale0, ox = 0, oy = 0) {
  grid.style.transition = 'none';
  grid.style.transformOrigin = `${ox}px ${oy}px`;
  grid.style.transform = `scale(${scale0})`;
  void grid.offsetWidth;
  grid.style.transition = 'transform .38s cubic-bezier(.2, .9, .3, 1)';
  grid.style.transform = 'scale(1)';
}
function bindPinchCols(grid, { steps, get, set }) {
  if (!grid || grid._pinch) return;
  grid._pinch = true;
  let d0 = 0, r = 1, ox = 0, oy = 0;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const nearest = want => steps.reduce((a, b) => Math.abs(b - want) < Math.abs(a - want) ? b : a);
  const finish = (cur, next, scale) => {
    if (next !== cur) set(next);
    animateCols(grid, scale * next / cur, ox, oy);
  };
  grid.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) return;
    d0 = dist(e.touches); r = 1;
    const b = grid.getBoundingClientRect();
    ox = (e.touches[0].clientX + e.touches[1].clientX) / 2 - b.left; oy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - b.top;
    grid.style.transition = 'none'; grid.style.transformOrigin = `${ox}px ${oy}px`;
  }, { passive: true });
  grid.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !d0) return;
    e.preventDefault();
    r = Math.max(0.4, Math.min(2.4, dist(e.touches) / d0));
    grid.style.transform = `scale(${r})`;
  }, { passive: false });
  grid.addEventListener('touchend', e => {
    if (!d0 || e.touches.length >= 2) return;
    d0 = 0;
    const cur = get(); finish(cur, nearest(cur / r), r);
  });
  let acc = 0, wt = null;
  grid.addEventListener('wheel', e => {
    if (!e.ctrlKey) return; // PC 트랙패드 핀치
    e.preventDefault();
    const b = grid.getBoundingClientRect(); ox = e.clientX - b.left; oy = e.clientY - b.top;
    acc += e.deltaY; clearTimeout(wt);
    wt = setTimeout(() => { const cur = get(), i = steps.indexOf(cur); const next = steps[Math.max(0, Math.min(steps.length - 1, (i < 0 ? 0 : i) + Math.sign(acc)))]; acc = 0; finish(cur, next, 1); }, 120);
  }, { passive: false });
}

/* ---------- 스크롤 남은 양 표시 ---------- */
function bindScrollBar(el, bar) {
  if (!el || !bar) return;
  const upd = () => {
    const h = el.clientHeight, sh = el.scrollHeight, th = bar.firstElementChild;
    if (sh <= h + 1) { bar.style.opacity = '0'; return; }
    bar.style.opacity = '1';
    const tH = Math.max(28, h * h / sh);
    th.style.height = tH + 'px';
    th.style.transform = `translateY(${(el.scrollTop / (sh - h)) * (bar.clientHeight - tH)}px)`;
  };
  if (!el._sb) { el._sb = true; el.addEventListener('scroll', () => el._sbUpd(), { passive: true }); }
  el._sbUpd = upd; upd();
}

/* ---------- 홈 화면에 앱 추가 (아이폰: Safari 공유 → 홈 화면에 추가, 안드로이드: 설치 버튼) ---------- */
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (mountedScreen) render(); });
window.addEventListener('appinstalled', () => { installEvt = null; Store.state.prefs.installHide = true; Store.save(); render(); });
/* 수정 기록 페이지 미리보기 · 이미 설치한 경우는 안내 안 함 */
function canInstall() { return !IS_STANDALONE && window.top === window && location.protocol === 'https:'; }
function installBanner() {
  if (!canInstall() || Store.state.prefs.installHide) return '';
  return `<div class="pad"><div class="install-card">
    <span class="ic-wrap">${ic('plus', 18)}</span>
    <button class="flex1 left" data-act="installOpen"><b>홈 화면에 추가하기</b><span>앱처럼 바로 열리고, 사진도 안전하게 보관돼요</span></button>
    <button class="icon-btn sm" data-act="installHide" aria-label="닫기">${ic('x', 16)}</button>
  </div></div>`;
}
A.installHide = () => { Store.state.prefs.installHide = true; Store.save(); render(); };
A.installOpen = async () => {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); installEvt = null; if (r && r.outcome === 'accepted') A.installHide(); return; }
  openSheet('install');
};
SHEETS.install = () => {
  const step = (n, t) => `<div class="inst-step"><b>${n}</b><span>${t}</span></div>`;
  return `<div class="sheet-body"><h3 class="sheet-title">${ic('plus', 20)} 홈 화면에 추가하기</h3>
    ${IS_IOS ? `<p class="sub">아이폰은 앱스토어 없이 Safari에서 바로 설치할 수 있어요.</p>
      <div class="inst-list mt12">${step(1, 'Safari로 이 페이지를 열어요')}${step(2, '아래쪽 공유 버튼(네모에 위쪽 화살표)을 눌러요')}${step(3, "목록을 내려 '홈 화면에 추가'를 눌러요")}${step(4, "오른쪽 위 '추가'를 누르면 끝!")}</div>
      <p class="hint">홈 화면에 추가하지 않고 Safari에서만 쓰면, 7일 넘게 열지 않을 때 등록한 옷 사진이 지워질 수 있어요.</p>`
    : `<p class="sub">설치하면 앱처럼 홈 화면에서 바로 열려요.</p>
      <div class="inst-list mt12">${step(1, 'Chrome으로 이 페이지를 열어요')}${step(2, '오른쪽 위 메뉴(⋮)를 눌러요')}${step(3, "'앱 설치' 또는 '홈 화면에 추가'를 눌러요")}</div>`}
    <button class="btn primary block mt16" data-act="closeSheet">확인</button></div>`;
};

/* ---------- 알림 종 ---------- */
function notifs() {
  const s = Store.state, out = [];
  s.codis.filter(c => c.from && !c.seen).forEach(c => out.push({ kind: 'codi', id: c.id, icon: 'send', text: `${famOf(c.from).name}님이 '${c.name}' 코디를 보냈어요`, at: c.createdAt }));
  myMsgs().filter(m => m.unread).forEach(m => out.push({ kind: 'msg', id: m.id, icon: 'chat', text: `${m.with} · ${m.msgs[m.msgs.length - 1].text}`, at: m.at }));
  return out.sort((a, b) => b.at - a.at);
}
function bellBtn() {
  const n = notifs().length;
  return `<button class="bell ${n ? 'ring' : ''}" data-act="bellOpen" aria-label="알림 ${n}개">${ic('bell', 22)}${n ? `<b>${n}</b>` : ''}</button>`;
}
A.bellOpen = () => openSheet('notif', { pop: true });
SHEETS.notif = () => {
  const list = notifs();
  return `<div class="pop-body"><b class="pop-title">알림</b>
    ${list.length ? list.map(n => `<button class="notif" data-act="notifGo" data-arg="${n.kind}|${n.id}"><span class="notif-ic">${ic(n.icon, 16)}</span><span class="flex1">${esc(n.text)}</span>${ic('chevR', 14)}</button>`).join('') : '<p class="sub">새 알림이 없어요</p>'}</div>`;
};
A.notifGo = arg => {
  const [k, id] = arg.split('|');
  closeAllSheets();
  if (k === 'codi') { const c = findCodi(id); if (c) { c.seen = true; Store.save(); } render(); A.openCodi(id); }
  else A.openThread(id);
};

/* ---------- 확인 단어를 입력해야 지워지는 안전 삭제 ---------- */
let typedCb = null;
function askTyped(title, msg, word, cb) { typedCb = cb; openSheet('typed', { title, msg, word }); }
SHEETS.typed = sh => `<div class="sheet-body">
  <h3 class="sheet-title">${ic('trash', 20)} ${esc(sh.title)}</h3><p class="sub">${esc(sh.msg)}</p>
  <label class="field-label">확인을 위해 <em>'${esc(sh.word)}'</em> 를 입력해 주세요</label>
  <input class="input" id="typedIn" placeholder="${esc(sh.word)}" data-in="typedIn" autocomplete="off">
  <div class="row gap8 mt16"><button class="btn ghost flex1" data-act="closeSheet">취소</button><button class="btn danger flex1" id="typedOk" data-act="typedOk" disabled>삭제</button></div>
</div>`;
/* 화면 언어로 보이는 확인 단어도, 한글 원래 단어도 받아 줌 */
const typedMatch = v => { const w = topSheet().word; v = (v || '').trim(); return v === w || v.toLowerCase() === T(w).toLowerCase(); };
A.typedIn = v => { const b = $('#typedOk'); if (b) b.disabled = !typedMatch(v); };
A.typedOk = () => { if (!typedMatch($('#typedIn').value)) return; const cb = typedCb; typedCb = null; closeAllSheets(); cb && cb(); };

/* 오른쪽에서 나오는 패널의 머리 */
function sideHead(title, right = '') {
  return `<header class="side-head"><button class="icon-btn" data-act="closeSheet" aria-label="뒤로">${ic('chevL', 24)}</button><b>${title}</b><div class="row gap6">${right}</div></header>`;
}
