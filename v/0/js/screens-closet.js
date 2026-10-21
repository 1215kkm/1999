/* area — 옷장 · 옷 상세 · 옷 선택 피커 */

ui.closet = { loc: '전체', q: '', season: '전체', status: '전체', owner: 'me', cat: '전체', sort: 'recent', cols: 4, fav: false, adv: false, select: false, sel: [] };

function closetBase(ignoreCat = false) {
  const C = ui.closet, q = C.q.trim().toLowerCase();
  return Store.state.items.filter(i =>
    (C.owner === 'all' || i.owner === C.owner) &&
    (C.loc === '전체' || i.loc === C.loc) &&
    (C.season === '전체' || (i.seasons || []).includes(C.season)) &&
    (C.status === '전체' || (C.status === '사용 가능' ? i.status === '사용 가능' : i.status !== '사용 가능')) &&
    (!C.fav || i.fav) &&
    (ignoreCat || C.cat === '전체' || i.cat === C.cat) &&
    (!q || [i.name, i.colorName, i.cat, i.sub, i.loc, ...(i.styles || [])].join(' ').toLowerCase().includes(q)));
}
function closetSorted() {
  const a = closetBase();
  const s = ui.closet.sort;
  if (s === 'recent') a.sort((x, y) => y.createdAt - x.createdAt);
  if (s === 'old') a.sort((x, y) => x.createdAt - y.createdAt);
  if (s === 'name') a.sort((x, y) => x.name.localeCompare(y.name, 'ko'));
  if (s === 'wear') a.sort((x, y) => (y.wear || 0) - (x.wear || 0));
  if (s === 'color') a.sort((x, y) => COLORS.findIndex(c => c.name === x.colorName) - COLORS.findIndex(c => c.name === y.colorName));
  return a;
}
function advCount() { const C = ui.closet; return (C.season !== '전체') + (C.status !== '전체') + (C.owner !== 'me'); }

function itemCard(it, cols, selectMode, selected) {
  const isNew = Date.now() - it.createdAt < 3 * 864e5;
  const big = cols <= 4;
  return `<div class="icard c${cols} ${selected ? 'sel' : ''}" data-act="${selectMode ? 'toggleSel' : 'openItem'}" data-arg="${it.id}">
    <div class="ithumb">${itemArt(it)}
      ${big && !selectMode ? `<button class="fav ${it.fav ? 'on' : ''}" data-act="toggleFav" data-arg="${it.id}" aria-label="즐겨찾기">${ic('heart', cols === 2 ? 18 : 15)}</button>` : ''}
      ${big && isNew ? '<span class="badge new">NEW</span>' : ''}
      ${big && it.status !== '사용 가능' ? `<span class="badge st">${esc(it.status)}</span>` : ''}
      ${selectMode ? `<span class="selmark">${ic('check', 13)}</span>` : ''}
    </div>
    ${cols === 2 ? `<b class="iname">${esc(it.name)}</b><span class="imeta">${esc(it.cat)} · ${esc(it.sub)}</span>` : cols === 4 ? `<span class="iname sm">${esc(it.name)}</span>` : ''}
  </div>`;
}
function closetResultsHtml() {
  const C = ui.closet;
  const list = closetSorted();
  if (!list.length) return emptyState(C.q ? `'${esc(C.q)}'에 맞는 옷이 없어요` : '조건에 맞는 옷이 없어요', `<button class="btn ghost" data-act="closetResetFilters">필터 초기화</button>`);
  return `<div class="igrid c${C.cols}">${list.map(it => itemCard(it, C.cols, C.select, C.sel.includes(it.id))).join('')}</div>`;
}
function closetCountHtml() {
  const C = ui.closet;
  const total = Store.state.items.filter(i => C.owner === 'all' || i.owner === C.owner).length;
  const shown = closetBase().length;
  return `모든 옷 <b>${total}</b>${shown !== total ? ` · 표시 <b class="accent">${shown}</b>` : ''}`;
}
function updateCloset() {
  const r = $('#closetResults'); if (r) r.innerHTML = closetResultsHtml();
  const c = $('#closetCount'); if (c) c.innerHTML = closetCountHtml();
}

SCREENS.closet = {
  nav: 'closet',
  render() {
    const s = Store.state, C = ui.closet;
    const ownerItems = s.items.filter(i => C.owner === 'all' || i.owner === C.owner);
    const base = closetBase(true);
    const cats = ['전체', ...s.categories];
    const w = Weather.current();
    const recs = s.items.filter(i => i.owner === 'me').length >= 2 ? getHomeRecs() : [];
    const ownerLabel = C.owner === 'all' ? '가족 전체' : famOf(C.owner).label;
    return `<div class="screen has-nav"><div class="scroll" id="closetScroll">
      <header class="topbar pad">
        <div class="tb-left"><div><h1 class="tb-title">내 옷장</h1><p class="tb-sub0">${C.owner === 'me' ? '' : esc(ownerLabel) + ' · '}총 ${ownerItems.length}개의 아이템이 있어요</p></div></div>
        <div class="tb-right"><button class="pill-btn ${C.select ? 'on' : ''}" data-act="closetSelect">${C.select ? '취소' : '선택'}</button>${avatar()}</div>
      </header>

      <div class="loc-row">
        <div class="chips scroll-x pad-l">${['전체', ...s.locations].map(l => chip(l === '전체' ? '전체 위치' : `${ic(locIcon(l), 14)} ${esc(l)}`, C.loc === l, 'closetLoc', l)).join('')}</div>
        <button class="loc-add" data-act="addLocation" aria-label="위치 추가">${ic('plus', 16)}<span>위치</span></button>
      </div>

      <div class="pad mt12">
        <div class="search">${ic('search', 18)}<input id="closetQ" placeholder="옷 이름이나 색상으로 검색" value="${esc(C.q)}" data-in="closetSearch">${C.q ? `<button class="sx" data-act="closetClearQ">${ic('x', 14)}</button>` : ''}</div>
      </div>

      <div class="pad mt12 row gap8">
        <button class="adv-btn ${C.adv ? 'open' : ''} ${advCount() ? 'active' : ''}" data-act="closetAdv">${ic('sliders', 16)} 상세 옵션${advCount() ? ` <b>${advCount()}</b>` : ''} ${ic(C.adv ? 'chevU' : 'chevD', 14)}</button>
        <button class="adv-btn ${C.fav ? 'active' : ''}" data-act="closetFav">${ic('heart', 15, C.fav ? 'filled' : '')} 즐겨찾기</button>
      </div>
      ${C.adv ? `<div class="pad"><div class="adv-panel">
        <div class="adv-row"><span>계절</span><div class="chips wrap">${['전체', ...SEASONS].map(x => chip(x === '전체' ? '전체' : `${SEASON_ICON[x]} ${x}`, C.season === x, 'closetSeason', x, 'sm')).join('')}</div></div>
        <div class="adv-row"><span>상태</span>${seg(['전체', '사용 가능', '사용 불가'], C.status, 'closetStatus')}</div>
        <div class="adv-row"><span>소유자</span><div class="chips wrap">${[{ id: 'all', label: '가족 전체' }, ...s.family].map(f => chip(esc(f.label), C.owner === f.id, 'closetOwner', f.id, 'sm')).join('')}</div></div>
        ${advCount() ? '<button class="link mt8" data-act="closetResetFilters">옵션 초기화</button>' : ''}
      </div></div>` : ''}

      <div class="chips scroll-x pad mt12 cat-tabs">${cats.map(c => {
        const n = c === '전체' ? base.length : base.filter(i => i.cat === c).length;
        return chip(`${esc(c)} <small>${n}</small>`, C.cat === c, 'closetCat', c);
      }).join('')}<button class="chip dashed" data-act="addCategory">${ic('plus', 14)}</button></div>

      ${recs.length && !C.select ? `<div class="pad mt16"><div class="today-strip">
        <button class="ts-weather" data-act="weatherSheet"><span class="we">${COND_EMOJI[w.cond] || '☀️'}</span><b>${w.temp}°</b><span>${weatherMsg(w.temp, w.cond).split('.')[0]}</span></button>
        <div class="ts-recs">${recs.map((r, i) => `<button class="ts-rec" data-act="openHomeRec" data-arg="${i}">${board(r.items)}</button>`).join('')}
          <button class="ts-more" data-act="go" data-arg="ai">${sparkle(16)}<span>추천 코디<br>더 보기</span></button></div>
      </div></div>` : ''}

      <div class="pad mt16 toolbar">
        <div class="select-wrap"><select data-change="closetSort">${[['recent', '최근 등록순'], ['old', '오래된순'], ['name', '이름순'], ['wear', '자주 입은 순'], ['color', '색상순']].map(([v, l]) => `<option value="${v}" ${C.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>${ic('chevD', 14)}</div>
        <span class="count" id="closetCount">${closetCountHtml()}</span>
        <div class="cols">${[[2, 'grid2'], [4, 'grid4'], [8, 'grid8']].map(([n, icn]) => `<button class="${C.cols === n ? 'on' : ''}" data-act="closetCols" data-arg="${n}" aria-label="${n}열">${ic(icn, 18)}</button>`).join('')}</div>
      </div>

      <div class="pad mt8" id="closetResults">${closetResultsHtml()}</div>
      <div class="h40"></div>
    </div>
    ${C.select ? `<div class="selbar">
      <span><b>${C.sel.length}</b>개 선택</span>
      <div class="row gap6">
        <button class="btn sm ghost" data-act="selMove" ${C.sel.length ? '' : 'disabled'}>${ic('pin', 15)} 위치</button>
        <button class="btn sm ghost" data-act="selManual" ${C.sel.length ? '' : 'disabled'}>${ic('hanger', 15)} 직접</button>
        <button class="btn sm primary" data-act="selAI" ${C.sel.length ? '' : 'disabled'}>${sparkle(14)} 고정하고 AI 코디</button>
      </div>
    </div>` : ''}
    </div>`;
  },
};

A.closetLoc = l => { ui.closet.loc = l; render(); };
A.closetSearch = v => { ui.closet.q = v; updateCloset(); };
A.closetClearQ = () => { ui.closet.q = ''; render(); };
A.closetAdv = () => { ui.closet.adv = !ui.closet.adv; render(); };
A.closetFav = () => { ui.closet.fav = !ui.closet.fav; render(); };
A.closetSeason = v => { ui.closet.season = v; render(); };
A.closetStatus = v => { ui.closet.status = v; render(); };
A.closetOwner = v => { ui.closet.owner = v; render(); };
A.closetCat = v => { ui.closet.cat = v; render(); };
A.closetCols = n => { ui.closet.cols = Number(n); render(); };
A.closetSort = el => { ui.closet.sort = el.value; updateCloset(); };
A.closetResetFilters = () => { Object.assign(ui.closet, { loc: '전체', q: '', season: '전체', status: '전체', owner: 'me', cat: '전체', fav: false }); render(); };
A.closetSelect = () => { ui.closet.select = !ui.closet.select; ui.closet.sel = []; render(); };
A.toggleSel = id => { const a = ui.closet.sel; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); render(); };
A.selAI = () => { ui.ai.fixed = [...ui.closet.sel]; ui.closet.select = false; ui.closet.sel = []; ui.ai.list = null; go('ai'); };
A.selManual = () => { manualPreload(ui.closet.sel); ui.closet.select = false; ui.closet.sel = []; go('manual'); };
A.selMove = () => openSheet('moveLoc');
SHEETS.moveLoc = () => `<div class="sheet-body"><h3 class="sheet-title">${ui.closet.sel.length}벌의 보관 위치 변경</h3>
  <div class="loc-tiles">${Store.state.locations.map(l => `<button class="loc-tile" data-act="selMoveTo" data-arg="${esc(l)}">${ic(locIcon(l), 22)}<span>${esc(l)}</span></button>`).join('')}</div></div>`;
A.selMoveTo = l => {
  ui.closet.sel.forEach(id => { const it = itemById(id); if (it) it.loc = l; });
  Store.save(); toast(`${ui.closet.sel.length}벌을 '${l}'(으)로 옮겼어요`);
  ui.closet.select = false; ui.closet.sel = []; closeSheet(); render();
};
A.toggleFav = id => {
  const it = itemById(id); if (!it) return;
  it.fav = !it.fav; Store.save();
  if (topSheet()) renderOverlay();
  if (ui.route.name === 'closet') updateCloset(); else render();
};
A.addCategory = () => askText('종류 추가', '예) 수영복, 잠옷', v => {
  const s = Store.state; if (!s.categories.includes(v)) s.categories.push(v); Store.save();
  if (ui.reg) { ui.reg.cat = v; ui.reg.sub = ''; }
  render();
});

/* ---------- 옷 상세 시트 ---------- */
function itemViews(it) {
  const photos = (it.photos || []).filter(id => IMG.get(id));
  if (photos.length) return photos.map((id, i) => ({ html: `<img src="${IMG.get(id)}" alt="" draggable="false">`, label: photos.length > 1 ? `${i + 1} / ${photos.length}` : '' }));
  if (it.img) return [{ html: itemArt(it), label: '' }];
  return [{ html: garmentSVG(it), label: 'FRONT' }, { html: garmentSVG(it, 'back'), label: 'BACK' }, { html: garmentSVG(it, 'side'), label: 'SIDE' }];
}
A.openItem = id => openSheet('item', { id });
SHEETS.item = sh => {
  const it = itemById(sh.id); if (!it) return '<div class="sheet-body">삭제된 옷이에요.</div>';
  const v = itemViews(it);
  const sale = Store.state.sales.find(x => x.itemId === it.id);
  return `<div class="sheet-body">
    <div class="carousel" id="itemCar">${v.map(x => `<div class="slide">${x.html}${x.label ? `<span class="slide-tag">${x.label}</span>` : ''}</div>`).join('')}</div>
    ${dotsHtml(v.length, 0, 'itemDots')}
    ${v.length > 1 ? '<p class="hint center">손가락으로 밀어 다른 각도 보기 · 3초 뒤 첫 사진으로 돌아가요</p>' : ''}
    <div class="row between mt12">
      <div><h2 class="h2">${esc(it.name)}</h2><p class="sub">${esc(it.cat)} · ${esc(it.sub || '')}${it.size ? ' · ' + esc(it.size) : ''}</p></div>
      <button class="fav-lg ${it.fav ? 'on' : ''}" data-act="toggleFav" data-arg="${it.id}" aria-label="즐겨찾기">${ic('heart', 22)}</button>
    </div>
    <div class="info-grid mt12">
      <div class="info">${ic('pin', 18)}<span>위치</span><b>${esc(it.loc)}</b></div>
      <div class="info">${ic('check', 18)}<span>상태</span><b class="${it.status === '사용 가능' ? 'ok' : 'warn'}">${esc(it.status)}</b></div>
      <div class="info">${ic('user', 18)}<span>소유자</span><b>${esc(famOf(it.owner).name)}${it.ownership !== '내 옷' ? ` · ${esc(it.ownership)}` : ''}</b></div>
    </div>
    <label class="field-label mt16">상태 변경</label>
    ${seg(STATUSES, it.status, 'setItemStatus', it.id + '|')}
    <div class="kv mt16">
      <div><span>색상</span><b><i class="dot" style="background:${it.color}"></i>${esc(it.colorName || '')}</b></div>
      <div><span>계절</span><b>${(it.seasons || []).map(x => SEASON_ICON[x] + ' ' + x).join(' · ') || '-'}</b></div>
      ${(it.styles || []).length ? `<div><span>스타일</span><b>${it.styles.map(esc).join(' · ')}</b></div>` : ''}
      <div><span>보온성</span><b>${esc(it.thickness)}${it.lining && it.lining !== '없음' ? ' · ' + esc(it.lining) : ''}</b></div>
      <div><span>착용</span><b>${it.wear || 0}회</b></div>
      ${it.memo ? `<div><span>메모</span><b>${esc(it.memo)}</b></div>` : ''}
      ${sale ? `<div><span>판매</span><b class="accent">${won(sale.price)}에 판매 중</b></div>` : ''}
    </div>
    <button class="btn primary block mt16" data-act="codiWithItem" data-arg="${it.id}">${sparkle(16)} 이 옷으로 AI 코디 추천</button>
    <div class="row gap8 mt8">
      <button class="btn ghost flex1" data-act="editItem" data-arg="${it.id}">${ic('edit', 16)} 수정</button>
      <button class="btn ghost flex1" data-act="sellItem" data-arg="${it.id}">${ic('tag', 16)} ${sale ? '판매 취소' : '판매 등록'}</button>
      <button class="btn ghost flex1 danger-t" data-act="deleteItem" data-arg="${it.id}">${ic('trash', 16)} 삭제</button>
    </div>
  </div>`;
};
SHEET_MOUNT.item = () => bindCarousel($('#itemCar'), $('#itemDots'), { resetAfter: 3000 });
A.setItemStatus = arg => {
  const [id, st] = arg.split('|'); const it = itemById(id); if (!it) return;
  it.status = st; Store.save(); invalidateRecs(); renderOverlay();
  if (ui.route.name === 'closet') updateCloset();
};
A.codiWithItem = id => { ui.ai.fixed = [id]; ui.ai.list = null; closeAllSheets(); go('ai'); };
A.deleteItem = id => {
  const it = itemById(id);
  askConfirm('옷 삭제', `'${it.name}'을(를) 옷장에서 삭제할까요?`, '삭제', () => {
    const s = Store.state;
    (it.photos || []).forEach(p => IMG.del(p));
    s.items = s.items.filter(i => i.id !== id);
    s.codis.forEach(c => { c.items = c.items.filter(x => x !== id); });
    s.sales = s.sales.filter(x => x.itemId !== id);
    Store.save(); invalidateRecs(); closeAllSheets(); render(); toast('삭제했어요');
  }, true);
};
A.sellItem = id => {
  const s = Store.state, i = s.sales.findIndex(x => x.itemId === id);
  if (i >= 0) { s.sales.splice(i, 1); Store.save(); renderOverlay(); toast('판매를 취소했어요'); return; }
  askText('판매 가격 (원)', '예) 15000', v => {
    const price = parseInt(v.replace(/[^0-9]/g, ''), 10);
    if (!price) { toast('가격을 숫자로 입력해 주세요'); return; }
    s.sales.push({ itemId: id, price, createdAt: Date.now() }); Store.save(); renderOverlay();
    toast('코디북 > 둘러보기의 개인 판매에 올렸어요');
  });
};

/* ---------- 옷 선택 피커 (고정할 옷 · 가족 옷 · 직접 조합) ---------- */
/* props: {mode:'multi'|'single', owner, sel:[], title, desc, filters:bool, onDone(ids)} */
function pickerList(sh) {
  const q = (sh.q || '').trim().toLowerCase();
  return Store.state.items.filter(i =>
    (sh.owner === 'all' || i.owner === sh.owner) &&
    (sh.cat === '전체' || i.cat === sh.cat) &&
    (!sh.season || sh.season === '전체' || (i.seasons || []).includes(sh.season)) &&
    (!sh.color || i.colorName === sh.color) &&
    (!q || [i.name, i.colorName, i.sub].join(' ').toLowerCase().includes(q)));
}
function pickerGridHtml(sh) {
  const list = pickerList(sh);
  if (!list.length) return emptyState('조건에 맞는 옷이 없어요');
  return `<div class="igrid c4">${list.map(it => `<div class="icard c4 pk ${sh.sel.includes(it.id) ? 'sel' : ''}" data-act="pickToggle" data-arg="${it.id}">
    <div class="ithumb">${itemArt(it)}<span class="selmark">${ic('check', 13)}</span></div><span class="iname sm">${esc(it.name)}</span></div>`).join('')}</div>`;
}
function openPicker(props) {
  openSheet('picker', { full: true, cat: '전체', q: '', season: '전체', color: null, sel: [], mode: 'multi', owner: 'me', ...props, sel: [...(props.sel || [])] });
}
SHEETS.picker = sh => {
  const ownerItems = Store.state.items.filter(i => sh.owner === 'all' || i.owner === sh.owner);
  const colorsHere = [...new Set(ownerItems.map(i => i.colorName))];
  return `<div class="sheet-head">
      <div><h3 class="sheet-title">${ic('hanger', 20)} ${esc(sh.title || '내 옷장 옷 선택하기')}</h3><p class="sub">${esc(sh.desc || (sh.mode === 'multi' ? '여러 개의 옷을 동시에 선택할 수 있어요. (다중 선택 가능)' : '옷을 하나 선택하면 창이 닫혀요.'))}</p></div>
      <button class="icon-btn" data-act="closeSheet">${ic('x', 22)}</button>
    </div>
    <div class="sheet-body">
      <div class="search sm">${ic('search', 16)}<input id="pickQ" placeholder="옷 이름을 입력해주세요 (예: 티셔츠, 자켓)" value="${esc(sh.q)}" data-in="pickSearch"></div>
      <div class="chips scroll-x mt12">${['전체', ...Store.state.categories].map(c => chip(`${c !== '전체' && CAT_ICON[c] ? ic(CAT_ICON[c], 15) : ''} ${esc(c)}`, sh.cat === c, 'pickCat', c, 'sm')).join('')}</div>
      ${sh.filters ? `<div class="chips scroll-x mt8">${['전체', ...SEASONS].map(x => chip(x === '전체' ? '모든 계절' : SEASON_ICON[x] + ' ' + x, sh.season === x, 'pickSeason', x, 'sm')).join('')}</div>
      <div class="color-filter mt8">${colorsHere.map(n => `<button class="cf ${sh.color === n ? 'on' : ''}" data-act="pickColorF" data-arg="${esc(n)}" title="${esc(n)}"><i style="background:${colorHex(n)}"></i></button>`).join('')}</div>` : ''}
      <div class="mt12" id="pickerGrid">${pickerGridHtml(sh)}</div>
    </div>
    ${sh.mode === 'multi' ? `<div class="pick-tray">
      <div class="row between"><b>선택한 옷 (${sh.sel.length}개)</b>${sh.sel.length ? `<button class="link sm" data-act="pickClear">${ic('trash', 13)} 전체 삭제</button>` : ''}</div>
      <div class="tray">${sh.sel.map(id => { const it = itemById(id); return it ? `<div class="tray-it"><div class="ithumb">${itemArt(it)}</div><button class="x" data-act="pickToggle" data-arg="${id}">${ic('x', 11)}</button><span>${esc(it.name)}</span></div>` : ''; }).join('') || '<span class="sub">아직 선택한 옷이 없어요</span>'}</div>
      <button class="btn primary block mt8" data-act="pickDone">선택완료</button>
    </div>` : ''}`;
};
A.pickSearch = v => { const sh = topSheet(); sh.q = v; $('#pickerGrid').innerHTML = pickerGridHtml(sh); };
A.pickCat = c => { topSheet().cat = c; renderOverlay(); };
A.pickSeason = c => { topSheet().season = c; renderOverlay(); };
A.pickColorF = c => { const sh = topSheet(); sh.color = sh.color === c ? null : c; renderOverlay(); };
A.pickClear = () => { topSheet().sel = []; renderOverlay(); };
A.pickToggle = id => {
  const sh = topSheet();
  if (sh.mode === 'single') { const cb = sh.onDone; closeSheet(); cb && cb([id]); return; }
  const i = sh.sel.indexOf(id); if (i >= 0) sh.sel.splice(i, 1); else sh.sel.push(id);
  renderOverlay();
};
A.pickDone = () => { const sh = topSheet(); const cb = sh.onDone; const sel = [...sh.sel]; closeSheet(); cb && cb(sel); };
