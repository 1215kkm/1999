/* area — 앱 시작 · 이벤트 위임 */

A.go = name => { closeAllSheets(); if (ui.route.name !== name) go(name); };
A.back = () => back();
A.closeSheet = () => dismissSheet();
A.noop = () => { };

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.act];
  if (!fn) return;
  if (el.tagName === 'BUTTON' || el.dataset.act !== 'noop') e.stopPropagation();
  if (el.dataset.act === 'noop') return;
  fn(el.dataset.arg, el, e);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-in]');
  if (el && A[el.dataset.in]) A[el.dataset.in](el.value, el, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el && A[el.dataset.change]) A[el.dataset.change](el, e);
});

/* PC: 가로 탭 메뉴를 마우스 휠 · 드래그로 넘기기 */
const DRAG_SEL = '.scroll-x, .hscroll, .hero-track, .carousel, .det-track';
document.addEventListener('wheel', e => {
  const el = e.target.closest('.scroll-x, .hscroll');
  if (!el || el.scrollWidth <= el.clientWidth + 1 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const max = el.scrollWidth - el.clientWidth;
  if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
  el.scrollLeft += e.deltaY; e.preventDefault();
}, { passive: false });
let drag = null, eatClick = false;
document.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  const el = e.target.closest(DRAG_SEL);
  if (!el || el.scrollWidth <= el.clientWidth + 1) return;
  drag = { el, x: e.clientX, l: el.scrollLeft, moved: false };
});
document.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 5) return;
  if (!drag.moved) { drag.moved = true; drag.el.style.scrollSnapType = 'none'; drag.el.style.scrollBehavior = 'auto'; }
  drag.el.scrollLeft = drag.l - dx;
});
document.addEventListener('pointerup', () => {
  if (!drag) return;
  const { el, moved, l } = drag; drag = null;
  if (!moved) return;
  eatClick = true; setTimeout(() => { eatClick = false; }, 0);
  el.style.scrollBehavior = '';
  if (el.matches('.scroll-x, .hscroll')) { el.style.scrollSnapType = ''; return; }
  // 한 장씩 넘기는 슬라이드는 한 칸만 이동하고, 다 넘어간 뒤에 스냅을 되돌려 중간에 멈추지 않게
  const w = el.clientWidth, max = Math.round((el.scrollWidth - w) / w), from = Math.round(l / w);
  const dx = el.scrollLeft - l, to = Math.max(0, Math.min(max, Math.abs(dx) > w * 0.12 ? from + Math.sign(dx) : from));
  el.scrollTo({ left: to * w, behavior: 'smooth' });
  setTimeout(() => { el.style.scrollSnapType = ''; }, 450);
});
document.addEventListener('click', e => { if (eatClick) { e.stopPropagation(); e.preventDefault(); eatClick = false; } }, true);

/* 키보드가 올라오면 하단 메뉴를 숨겨 화면이 같이 밀려 올라가지 않게 */
document.addEventListener('focusin', e => { if (e.target.matches('input:not([type=file]):not([type=color]), textarea')) $('#app').classList.add('typing'); });
document.addEventListener('focusout', () => $('#app').classList.remove('typing'));

(async function boot() {
  Store.load();
  I18N.init();
  // 브라우저가 저장 공간이 부족할 때 사진을 지우지 않도록 요청 (홈 화면에 추가한 앱은 대부분 허용)
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
  await IMG.open();
  await IMG.loadAll();
  ui.route = parseHash();
  // 새로고침 시 등록 중이던 화면이면 임시 데이터가 없으므로 홈으로
  if (!SCREENS[ui.route.name] || (['camera', 'regEdit'].includes(ui.route.name) && !ui.reg)) ui.route = { name: 'home', arg: null };
  render();
  Weather.fetch();
  // 홈 화면에 추가했을 때 오프라인에서도 열리도록 (수정 기록 페이지 안의 미리보기에서는 등록 안 함)
  if ('serviceWorker' in navigator && location.protocol === 'https:' && window.top === window && !/\/v\/\d+\//.test(location.pathname)) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
