/* area — 옷장 · 옷 상세 · 옷 선택 피커 */

ui.closet = { loc: '전체', q: '', color: null, season: '전체', status: '전체', owner: 'me', cat: '전체', sort: 'recent', cols: 4, fav: false, adv: false, famFrom: false };
const CLOSET_COLS = [2, 3, 4, 6, 8]; // 두 손가락으로 오갈 수 있는 열 수
const SHOW_CLOSET_TODAY_STRIP = false; // '추천 코디 더 보기' 줄 — 나중에 다시 켤 수 있게 남겨 둠

function closetBase(ignoreCat = false) {
  const C = ui.closet, q = C.q.trim().toLowerCase();
  return Store.state.items.filter(i =>
    (C.owner === 'all' || i.owner === C.owner) &&
    (C.loc === '전체' || i.loc === C.loc) &&
    (C.season === '전체' || (i.seasons || []).includes(C.season)) &&
    (C.status === '전체' || (C.status === '사용 가능' ? i.status === '사용 가능' : i.status !== '사용 가능')) &&
    (!C.fav || i.fav) &&
    (!C.color || i.colorName === C.color) &&
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
function advCount() { const C = ui.closet; return (C.season !== '전체') + (C.status !== '전체') + (C.owner !== 'me') + !!C.q.trim() + !!C.color; }

function itemCard(it, cols) {
  const isNew = Date.now() - it.createdAt < 3 * 864e5;
  const big = cols <= 4;
  return `<div class="icard c${cols}" data-act="openItem" data-arg="${it.id}">
    <div class="ithumb">${itemArt(it)}
      ${big ? `<button class="fav ${it.fav ? 'on' : ''}" data-act="toggleFav" data-arg="${it.id}" aria-label="즐겨찾기">${ic('heart', cols === 2 ? 19 : 16)}</button>` : ''}
      ${big && isNew ? '<span class="badge new">NEW</span>' : ''}
      ${big && it.status !== '사용 가능' ? `<span class="badge st">${esc(it.status)}</span>` : ''}
    </div>
    ${cols === 2 ? `<b class="iname">${esc(it.name)}</b><span class="imeta">${esc(it.cat)} · ${esc(it.sub)}</span>` : cols === 4 ? `<span class="iname sm">${esc(it.name)}</span>` : ''}
  </div>`;
}
function closetResultsHtml() {
  const C = ui.closet;
  const list = closetSorted();
  if (!list.length) return emptyState(C.q ? `'${esc(C.q)}'에 맞는 옷이 없어요` : '조건에 맞는 옷이 없어요', `<button class="btn ghost" data-act="closetResetFilters">필터 초기화</button>`);
  return `<div class="igrid c${C.cols}">${list.map(it => itemCard(it, C.cols)).join('')}</div>`;
}
function closetCountHtml() {
  const C = ui.closet;
  const total = Store.state.items.filter(i => C.owner === 'all' || i.owner === C.owner).length;
  const shown = closetBase().length;
  return `모든 옷 <b>${total}</b>${shown !== total ? ` · 표시 <b class="accent">${shown}</b>` : ''}`;
}
function updateCloset() {
  const r = $('#closetResults'); if (r) patchHTML(r, closetResultsHtml());
  const c = $('#closetCount'); if (c) c.innerHTML = closetCountHtml();
}

/* 오늘의 추천: 제휴 쇼핑몰 광고 자리. 유료 자리는 노출 순서(1·2·3순위)대로 고정, 나머지는 제휴몰 랜덤 */
let adOrder = null;
function todayAds() {
  if (!adOrder) {
    const paid = PARTNER_ADS.filter(a => a.slot).sort((x, y) => x.slot - y.slot);
    const free = PARTNER_ADS.filter(a => !a.slot).sort(() => Math.random() - 0.5);
    adOrder = [...paid, ...free];
  }
  return adOrder.map(a => ({ ...a, p: MARKET.fresh.find(x => x.id === a.prod) })).filter(a => a.p);
}
/* 대표 색상 목록: 옷장 상세 옵션 색상 = 옷 등록 대표 색상 (같은 목록을 함께 씀) */
function sharedColorNames(owner = 'me') {
  const s = Store.state;
  const names = [...new Set([...s.items.filter(i => owner === 'all' || i.owner === owner).map(i => i.colorName), ...s.recentColors.map(h => nearestColor(h).name)])];
  return names.sort((a, b) => COLORS.findIndex(c => c.name === a) - COLORS.findIndex(c => c.name === b));
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
    const ads = todayAds();
    const colorsHere = sharedColorNames(C.owner);
    return `<div class="screen has-nav"><div class="scroll" id="closetScroll">
      <header class="topbar pad">
        <div class="tb-left">${C.famFrom && C.owner !== 'me' ? `<button class="icon-btn" data-act="closetBack" aria-label="나가기">${ic('chevL', 24)}</button>` : ''}<div class="flex1"><h1 class="tb-title">${C.owner === 'me' ? '내 옷장' : esc(ownerLabel) + '장'}</h1><p class="tb-sub0">총 ${ownerItems.length}개의 아이템이 있어요</p></div></div>
        <div class="tb-right">${weatherChip()}${bellBtn()}${avatar()}</div>
      </header>

      ${ads.length ? `<section class="pad">
        <div class="hero ad-hero">
          <div class="hero-tabs"><span class="on">오늘의 추천</span><span>제휴 쇼핑몰</span><button class="hero-refresh" data-act="adInfo" aria-label="광고 안내">${ic('info', 16)}</button></div>
          <div class="hero-track" id="heroTrack">${ads.map(a => `<button class="hero-slide ad-slide" data-act="openProd" data-arg="fresh|${a.p.id}">
            <div class="ad-img">${itemArt(a.p)}</div>
            <div class="ad-txt"><span class="ad-badge">AD${a.slot ? ` · ${a.slot}순위` : ''}</span><span class="brand">${esc(a.mall)}</span><b>${esc(a.p.name)}</b><span class="price">${won(a.p.price)}</span><span class="ad-copy">${esc(a.copy)}</span></div>
          </button>`).join('')}</div>
        </div>${dotsHtml(ads.length, 0, 'heroDots')}
      </section>` : ''}

      <div class="loc-row mt16">
        <div class="chips scroll-x pad-l">${['전체', ...s.locations].map(l => chip(l === '전체' ? '전체 위치' : `${ic(locIcon(l), 14)} ${esc(l)}`, C.loc === l, 'closetLoc', l)).join('')}<span class="chip-spacer"></span></div>
        <button class="loc-add" data-act="addLocation" aria-label="위치 추가">${ic('plus', 16)}<span>위치</span></button>
      </div>

      <div class="pad mt12 row gap8">
        <button class="adv-btn ${C.adv ? 'open' : ''} ${advCount() ? 'active' : ''}" data-act="closetAdv">${ic('sliders', 16)} 상세 옵션${advCount() ? ` <b>${advCount()}</b>` : ''} ${ic(C.adv ? 'chevU' : 'chevD', 14)}</button>
        <button class="adv-btn ${C.fav ? 'active' : ''}" data-act="closetFav">${ic('heart', 15, C.fav ? 'filled' : '')} 즐겨찾기</button>
      </div>
      ${C.adv ? `<div class="pad"><div class="adv-panel">
        <div class="adv-row"><span>검색</span><div class="search sm">${ic('search', 18)}<input id="closetQ" placeholder="옷 이름이나 색상으로 검색" value="${esc(C.q)}" data-in="closetSearch">${C.q ? `<button class="sx" data-act="closetClearQ">${ic('x', 14)}</button>` : ''}</div></div>
        <div class="adv-row"><span>색상 <small>옷 등록의 대표 색상과 같아요</small></span><div class="color-filter">${colorsHere.map(n => `<button class="cf ${C.color === n ? 'on' : ''}" data-act="closetColor" data-arg="${esc(n)}" title="${esc(n)}"><i style="background:${colorHex(n)}"></i></button>`).join('')}</div></div>
        <div class="adv-row"><span>계절</span><div class="chips wrap">${['전체', ...SEASONS].map(x => chip(x === '전체' ? '전체' : `${SEASON_ICON[x]} ${x}`, C.season === x, 'closetSeason', x, 'sm')).join('')}</div></div>
        <div class="adv-row"><span>상태</span>${seg(['전체', '사용 가능', '사용 불가'], C.status, 'closetStatus')}</div>
        <div class="adv-row"><span>소유자</span><div class="chips wrap">${[{ id: 'all', label: '가족 전체' }, ...s.family].map(f => chip(esc(f.label), C.owner === f.id, 'closetOwner', f.id, 'sm')).join('')}</div></div>
        ${advCount() ? '<button class="link mt8" data-act="closetResetFilters">옵션 초기화</button>' : ''}
      </div></div>` : ''}

      <div class="loc-row mt12">
        <div class="chips scroll-x pad-l cat-tabs">${cats.map(c => {
          const n = c === '전체' ? base.length : base.filter(i => i.cat === c).length;
          return chip(`${esc(c)} <small>${n}</small>`, C.cat === c, 'closetCat', c);
        }).join('')}<span class="chip-spacer"></span></div>
        <button class="loc-add" data-act="addCategory" aria-label="종류 추가">${ic('plus', 16)}<span>종류</span></button>
      </div>

      ${SHOW_CLOSET_TODAY_STRIP && recs.length ? `<div class="pad mt16"><div class="today-strip">
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
    </div></div>`;
  },
  mount() {
    bindCarousel($('#heroTrack'), $('#heroDots'));
    bindPinchCols($('#closetResults'), { steps: CLOSET_COLS, get: () => ui.closet.cols, set: n => { ui.closet.cols = n; render(); } });
  },
};
A.adInfo = () => openSheet('adInfo');
SHEETS.adInfo = () => `<div class="sheet-body"><h3 class="sheet-title">${ic('info', 20)} 오늘의 추천 광고 안내</h3>
  <p class="sub">'오늘의 추천'은 제휴 쇼핑몰 상품이 보이는 자리예요. 앞쪽에 보일수록 광고비가 높아요.</p>
  <div class="pick-list mt12">${AD_SLOTS.map(a => `<div class="pick-row static"><b class="ad-badge">${a.slot}순위</b>${esc(a.desc)}<span class="flex1"></span><b>${esc(a.fee)}</b></div>`).join('')}
    <div class="pick-row static"><b class="ad-badge gray">일반</b>제휴몰 상품 랜덤 노출<span class="flex1"></span><b>클릭당 과금</b></div></div>
  <button class="btn primary block mt16" data-act="closeSheet">확인</button></div>`;
A.closetLoc = l => { ui.closet.loc = l; render(); };
A.closetSearch = v => { ui.closet.q = v; updateCloset(); };
A.closetClearQ = () => { ui.closet.q = ''; render(); };
A.closetColor = n => { ui.closet.color = ui.closet.color === n ? null : n; render(); };
A.closetBack = () => { Object.assign(ui.closet, { owner: 'me', famFrom: false, cat: '전체' }); back('my'); };
A.closetAdv = () => { ui.closet.adv = !ui.closet.adv; render(); };
A.closetFav = () => { ui.closet.fav = !ui.closet.fav; render(); };
A.closetSeason = v => { ui.closet.season = v; render(); };
A.closetStatus = v => { ui.closet.status = v; render(); };
A.closetOwner = v => { ui.closet.owner = v; render(); };
A.closetCat = v => { ui.closet.cat = v; render(); };
A.closetCols = n => { ui.closet.cols = Number(n); render(); };
A.closetSort = el => { ui.closet.sort = el.value; updateCloset(); };
A.closetResetFilters = () => { Object.assign(ui.closet, { loc: '전체', q: '', color: null, season: '전체', status: '전체', owner: 'me', cat: '전체', fav: false }); render(); };
A.hideReceived = () => {
  Store.state.codis.forEach(c => { if (c.from) c.hidden = true; }); Store.save(); render();
  toast('숨겼어요. 마이페이지 > 가족이 보낸 코디에서 다시 볼 수 있어요');
};
A.toggleFav = id => {
  const it = itemById(id); if (!it) return;
  it.fav = !it.fav; Store.save();
  $$(`[data-act="toggleFav"][data-arg="${id}"]`).forEach(b => b.classList.toggle('on', it.fav));
  if (ui.closet.fav && ui.route.name === 'closet') updateCloset();
  if (it.fav) popHeart(`[data-act="toggleFav"][data-arg="${id}"]`);
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
      <button class="info edit" data-act="itemLocPick" data-arg="${it.id}">${ic('pin', 18)}<span>위치 ${ic('edit', 11)}</span><b>${esc(it.loc)}</b></button>
      <button class="info edit" data-act="itemStatusPick" data-arg="${it.id}">${ic('check', 18)}<span>상태 ${ic('edit', 11)}</span><b class="${it.status === '사용 가능' ? 'ok' : 'warn'}">${esc(it.status)}</b></button>
      <div class="info">${ic('user', 18)}<span>소유자</span><b>${esc(famOf(it.owner).name)}${it.ownership !== '내 옷' ? ` · ${esc(it.ownership)}` : ''}</b></div>
    </div>
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
A.itemLocPick = id => openSheet('itemPick', { id, kind: 'loc' });
A.itemStatusPick = id => openSheet('itemPick', { id, kind: 'status' });
SHEETS.itemPick = sh => {
  const it = itemById(sh.id), loc = sh.kind === 'loc';
  return `<div class="sheet-body"><h3 class="sheet-title">${loc ? `${ic('pin', 20)} 보관 위치 바꾸기` : `${ic('check', 20)} 상태 바꾸기`}</h3><p class="sub">${esc(it.name)}</p>
    ${loc ? `<div class="loc-tiles mt12">${Store.state.locations.map(l => `<button class="loc-tile ${it.loc === l ? 'on' : ''}" data-act="itemSet" data-arg="loc|${esc(l)}">${ic(locIcon(l), 22)}<span>${esc(l)}</span></button>`).join('')}<button class="loc-tile dashed" data-act="addLocation">${ic('plus', 20)}<span>추가</span></button></div>`
    : `<div class="pick-list mt12">${STATUSES.map(x => `<button class="pick-row ${it.status === x ? 'on' : ''}" data-act="itemSet" data-arg="status|${x}"><i class="st-dot ${x === '사용 가능' ? 'ok' : 'warn'}"></i>${x}${it.status === x ? ic('check', 18) : ''}</button>`).join('')}</div>`}
  </div>`;
};
A.itemSet = arg => {
  const [k, v] = arg.split('|'), sh = topSheet(), it = itemById(sh.id); if (!it) return;
  it[k] = v; Store.save(); invalidateRecs(); closeSheet();
  if (ui.route.name === 'closet') updateCloset();
  toast(k === 'loc' ? `'${v}'(으)로 옮겼어요` : `상태를 '${v}'(으)로 바꿨어요`);
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
  if (i >= 0) { askConfirm('판매 취소', '이 상품의 판매를 취소할까요?', '판매 취소', () => { s.sales.splice(i, 1); Store.save(); renderOverlay(); render(); toast('판매를 취소했어요'); }, true); return; }
  askText('판매 가격 (원)', '예) 15000', v => {
    const price = parseInt(v.replace(/[^0-9]/g, ''), 10);
    if (!price) { toast('가격을 숫자로 입력해 주세요'); return; }
    s.sales.push({ itemId: id, price, createdAt: Date.now() }); Store.save(); renderOverlay();
    toast("코디북 > 코디SHOP의 '내가 올린 코디'에 올렸어요");
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
      <div><h3 class="sheet-title">${sh.tint ? `<span class="own-pill" style="--c:${sh.tint}">${esc(famOf(sh.owner).name)}</span>` : ic('hanger', 20)} ${esc(sh.title || '내 옷장 옷 선택하기')}</h3><p class="sub">${esc(sh.desc || (sh.mode === 'multi' ? '여러 개의 옷을 동시에 선택할 수 있어요. (다중 선택 가능)' : '옷을 하나 선택하면 창이 닫혀요.'))}</p></div>
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
A.pickClear = () => askConfirm('선택 전체 삭제', '선택한 옷을 모두 뺄까요?', '모두 빼기', () => { topSheet().sel = []; renderOverlay(); }, true);
A.pickToggle = id => {
  const sh = topSheet();
  if (sh.mode === 'single') { const cb = sh.onDone; closeSheet(); cb && cb([id]); return; }
  const i = sh.sel.indexOf(id); if (i >= 0) sh.sel.splice(i, 1); else sh.sel.push(id);
  renderOverlay(); // 바뀐 부분만 고침
};
A.pickDone = () => { const sh = topSheet(); const cb = sh.onDone; const sel = [...sh.sel]; closeSheet(); cb && cb(sel); };
