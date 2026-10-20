/* area — 앱 시작 · 이벤트 위임 */

A.go = name => { closeAllSheets(); if (ui.route.name !== name) go(name); };
A.back = () => back();
A.closeSheet = () => closeSheet();
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

(async function boot() {
  Store.load();
  await IMG.open();
  await IMG.loadAll();
  ui.route = parseHash();
  // 새로고침 시 등록 중이던 화면이면 임시 데이터가 없으므로 옷장으로
  if (!SCREENS[ui.route.name] || (['camera', 'regEdit'].includes(ui.route.name) && !ui.reg)) ui.route = { name: 'home', arg: null };
  render();
  Weather.fetch();
})();
