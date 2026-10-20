/* area — AI 코디 · 추천 상세 · 직접 조합 · 코디북 · 코디SHOP · 히스토리 · 코디 묻기 */

ui.ai = { style: '캐주얼', mood: null, season: curSeason(), aiExtra: true, fixed: [], exclude: [], cols: 2, list: null };
ui.manual = { slots: {}, acc: [], cat: '상의', owner: 'me', forFam: null, editId: null };
ui.cb = { tab: 'mine', filter: 'all', auto: null, mix: [null, null], mixOwner: ['me', 'bro'] };
ui.hist = { view: 'list', y: new Date().getFullYear(), m: new Date().getMonth(), day: null };
ui.ask = { msgs: null };

function codiItems(c) { return [...c.items.map(itemById).filter(Boolean), ...(c.virtual || [])]; }
function aiCtx() { const a = ui.ai; return { style: a.style, mood: a.mood, season: a.season, aiExtra: true, fixed: a.fixed, exclude: a.exclude }; }
function savedKeys() { return new Set(Store.state.codis.map(c => c.key).filter(Boolean)); }

function nextCodiName() { return `${fmtDate(dayKey(Date.now()))} 코디 #${Store.state.codiSeq}`; }
function saveRec(rec, extra = {}) {
  const s = Store.state;
  const c = {
    id: uid('cd'), key: rec.key, name: extra.name || rec.title, items: rec.items.filter(i => !i.virtual).map(i => i.id),
    virtual: rec.items.filter(i => i.virtual).map(({ name, cat, sub, color, colorName }) => ({ name, cat, sub, color, colorName, virtual: true })),
    date: extra.date || null, fav: !!extra.fav, source: extra.source || 'ai', tags: rec.tags || [], sharedWith: [], from: null, createdAt: Date.now(),
  };
  s.codis.unshift(c); s.codiSeq++; Store.save();
  return c;
}

/* ---------- AI 코디 ---------- */
function genAI(more = false, avoid = null) {
  const a = ui.ai;
  const exclude = new Set((a.list || []).map(r => r.key));
  const fresh = recommend({ ...aiCtx(), avoid, variety: avoid ? 1.2 : 0.6 }, 8, more ? exclude : new Set());
  a.list = more ? [...(a.list || []), ...fresh] : fresh;
  return fresh.length;
}
function aiGridHtml() {
  const a = ui.ai, keys = savedKeys();
  if (!a.list || !a.list.length) return emptyState('조건에 맞는 코디를 만들 옷이 부족해요.<br>고정·제외한 옷이나 옵션을 바꿔 보세요.');
  return `<div class="cgrid c${a.cols}">${a.list.map((r, i) => `<div class="ccard" data-act="openAIRec" data-arg="${i}">
    ${board(r.items)}
    <button class="fav ${keys.has(r.key) ? 'on' : ''}" data-act="favRec" data-arg="${i}" aria-label="찜">${ic('heart', a.cols === 2 ? 19 : 14)}</button>
    ${r.virtual.length ? `<span class="ai-tag">${sparkle(10)} +${r.virtual.length}</span>` : ''}
    ${colorDots(r.items)}
    ${a.cols === 2 ? `<b class="ctitle">${esc(r.title)}</b>` : ''}
  </div>`).join('')}</div>${a.list.length ? `<button class="btn ghost block mt12" data-act="aiMore">${ic('refresh', 16)} 더 보기</button>` : ''}`;
}
function trayHtml(items, act) {
  return items.length ? `<div class="tray mt8">${items.map(it => `<div class="tray-it"><div class="ithumb">${itemArt(it)}</div><button class="x" data-act="${act}" data-arg="${it.id}">${ic('x', 11)}</button><span>${esc(it.name)}</span></div>`).join('')}</div>` : '';
}

SCREENS.ai = {
  nav: 'ai',
  render() {
    const a = ui.ai, w = Weather.current();
    if (a.aiExtra && !a.list) genAI();
    const fixed = a.fixed.map(itemById).filter(Boolean);
    const excl = a.exclude.map(itemById).filter(Boolean);
    return `<div class="screen has-nav"><div class="scroll">
      <header class="topbar pad"><div class="tb-left"><h1 class="tb-title">오늘, 뭐 입을까요?</h1></div><div class="tb-right">${weatherChip()}${avatar()}</div></header>
      ${w.future ? `<div class="pad"><div class="fc-banner">${COND_EMOJI[w.cond] || '☀️'} <b>${mdLabel(w.date)}(${WEEK[new Date(w.date + 'T00:00').getDay()]})</b> 예보 ${w.min}~${w.max}° 기준으로 추천해요<button class="link sm" data-act="wPickDay" data-arg="0">오늘로</button></div></div>` : ''}

      <div class="pad ${w.future ? 'mt12' : ''}"><div class="soft-card ai-toggle">
        <div class="row between"><b class="row gap6">${sparkle(18)} AI 추천 코디</b>${toggle(a.aiExtra, 'aiExtraToggle')}</div>
        <p class="sub sm">${a.aiExtra ? '날씨와 스타일에 맞춰 AI가 코디를 추천해요. 내 옷장에 없는 어울리는 옷도 함께 제안해요.' : '끄면 아래에서 내 옷으로 직접 코디를 조합할 수 있어요.'}</p>
      </div></div>

      ${a.aiExtra ? `
      <div class="pad mt12"><div class="soft-card">
        <div class="row between"><b class="row gap6">${ic('lock', 17)} 고정할 옷</b><span class="hint m0">모든 추천에 함께 들어가요</span></div>
        <button class="fix-btn mt8" data-act="aiPickFixed">${ic('shirtI', 18)} ${fixed.length ? `${fixed.length}벌 고정됨 · 다시 선택` : '고정할 옷 선택하기'} ${ic('chevR', 16)}</button>
        ${trayHtml(fixed, 'aiUnfix')}
        <div class="row between mt16"><b class="row gap6">${ic('x', 17)} 제외할 옷</b><span class="hint m0">추천에서 빼요</span></div>
        <button class="fix-btn mt8" data-act="aiPickExclude">${ic('shirtI', 18)} ${excl.length ? `${excl.length}벌 제외됨 · 다시 선택` : '제외할 옷 선택하기'} ${ic('chevR', 16)}</button>
        ${trayHtml(excl, 'aiUnexclude')}
      </div></div>

      <div class="pad mt12"><div class="soft-card">
        <b class="row gap6">${ic('user', 17)} 옷 스타일</b>
        <div class="chips scroll-x mt8">${CODI_STYLES.map(st => chip(`${a.style === st.k ? ic('check', 14) : ic(st.icon, 14)} ${st.k}`, a.style === st.k, 'aiStyle', st.k, 'sm')).join('')}</div>
        <b class="row gap6 mt12">${ic('pin', 17)} 무드 · 장소</b>
        <div class="chips scroll-x mt8">${MOODS.map(m => chip(`${m.e} ${m.k}`, a.mood === m.k, 'aiMood', m.k, 'sm')).join('')}</div>
        <b class="row gap6 mt12">${ic('calendar', 17)} 계절</b>
        <div class="chips mt8">${SEASONS.map(x => chip(`${SEASON_ICON[x]} ${x}`, a.season === x, 'aiSeason', x, 'sm')).join('')}</div>
      </div></div>

      <div class="pad mt16 sec-head"><h2 class="h2 row gap6">${ic('hanger', 18)} 추천 코디 미리보기</h2>
        <div class="row gap6"><button class="icon-btn sm" data-act="aiRefresh" aria-label="다시 추천">${ic('refresh', 18)}</button>
        <div class="cols">${[[2, 'grid2'], [4, 'grid4']].map(([n, icn]) => `<button class="${a.cols === n ? 'on' : ''}" data-act="aiCols" data-arg="${n}">${ic(icn, 18)}</button>`).join('')}</div></div></div>
      <div class="pad" id="aiGrid">${aiGridHtml()}</div>
      <div class="pad mt12"><button class="btn outline block" data-act="go" data-arg="manual">${ic('hanger', 18)} 내가 직접 조합하기</button></div>`
      : `<div class="pad mt16 sec-head"><h2 class="h2 row gap6">${ic('hanger', 18)} 직접 조합하기</h2><button class="link" data-act="go" data-arg="manual">전체 화면 ${ic('chevR', 14)}</button></div>
      ${manualTabsHtml()}
      <div class="man-wrap pad mt8"><div class="man-left"><div class="man-sticky">${manualLeftHtml()}</div></div><div class="man-right" id="manPick">${manualPickHtml()}</div></div>`}
      <div class="h40"></div>
    </div></div>`;
  },
};
A.aiExtraToggle = () => { ui.ai.aiExtra = !ui.ai.aiExtra; if (ui.ai.aiExtra) genAI(); render(); };
A.aiStyle = k => { ui.ai.style = k; genAI(); render(); };
A.aiMood = k => { ui.ai.mood = ui.ai.mood === k ? null : k; genAI(); render(); };
A.aiSeason = k => { ui.ai.season = k; genAI(); render(); };
A.aiCols = n => { ui.ai.cols = Number(n); render(); };
A.aiRefresh = () => { genAI(false, new Set((ui.ai.list || []).flatMap(r => r.items.map(i => i.id)))); render(); toast('새로운 코디를 추천했어요'); };
A.aiMore = () => { const n = genAI(true); $('#aiGrid').innerHTML = aiGridHtml(); if (!n) toast('더 만들 수 있는 조합이 없어요'); };
A.aiUnfix = id => { ui.ai.fixed = ui.ai.fixed.filter(x => x !== id); genAI(); render(); };
A.aiUnexclude = id => { ui.ai.exclude = ui.ai.exclude.filter(x => x !== id); genAI(); render(); };
A.aiPickFixed = () => openPicker({
  mode: 'multi', owner: 'me', sel: ui.ai.fixed, title: '고정할 옷 선택하기',
  onDone: ids => { ui.ai.fixed = ids; ui.ai.exclude = ui.ai.exclude.filter(x => !ids.includes(x)); genAI(); render(); if (ids.length) toast(`${ids.length}벌을 고정했어요`); },
});
A.aiPickExclude = () => openPicker({
  mode: 'multi', owner: 'me', sel: ui.ai.exclude, title: '제외할 옷 선택하기', desc: '고른 옷은 AI 추천에 나오지 않아요. (다중 선택 가능)',
  onDone: ids => { ui.ai.exclude = ids; ui.ai.fixed = ui.ai.fixed.filter(x => !ids.includes(x)); genAI(); render(); if (ids.length) toast(`${ids.length}벌을 추천에서 뺐어요`); },
});
A.openAIRec = i => openResults(ui.ai.list, aiCtx(), Number(i));
A.favRec = i => {
  const r = ui.ai.list[Number(i)]; if (!r) return;
  const s = Store.state, ex = s.codis.find(c => c.key === r.key);
  if (ex) { s.codis = s.codis.filter(c => c !== ex); Store.save(); toast('찜을 해제했어요'); }
  else { saveRec(r, { fav: true }); toast('코디북에 찜했어요 ♥'); }
  $('#aiGrid').innerHTML = aiGridHtml();
  if (!ex) popHeart(`[data-act="favRec"][data-arg="${i}"]`);
};

/* ---------- AI 코디 추천 상세 ---------- */
function detailInfoHtml(rec) {
  const saved = savedKeys().has(rec.key);
  return `<h2 class="h2">${esc(rec.title)}</h2>
    <div class="chips wrap mt8">${rec.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="reason mt12">${sparkle(16)}<p>${esc(rec.reason)}</p></div>
    ${rec.virtual.length ? `<div class="vlist mt12"><b>AI가 더한 아이템 <small>내 옷장에 없어요</small></b>${rec.virtual.map(v => `<div class="vrow"><div class="ithumb xs">${garmentSVG(v)}</div><span>${esc(v.name)}</span><button class="link sm" data-act="toastMsg" data-arg="코디SHOP에서 비슷한 상품을 찾아볼게요">비슷한 상품</button></div>`).join('')}</div>` : ''}
    <div class="row gap8 mt16">
      <button class="btn outline" data-act="recToManual">${ic('edit', 16)} 직접 수정</button>
      <button class="btn primary flex1" data-act="recSave" ${saved ? 'disabled' : ''}>${ic('heartPlus', 18)} ${saved ? '코디북에 담았어요' : '이 코디 바로 담기'}</button>
    </div>
    <button class="btn ghost block mt8" data-act="recWear">${ic('calendar', 16)} 오늘 이 코디 입기</button>`;
}
function detailThumbs(rec) {
  return rec.items.map(it => `<button class="dthumb ${it.virtual ? 'virtual' : ''}" data-act="${it.virtual ? 'toastMsg' : 'openItem'}" data-arg="${it.virtual ? 'AI 추천 아이템 · 아직 옷장에 없어요' : it.id}">${itemArt(it)}<span>${esc(SLOT_LABEL[slotOf(it)])}</span></button>`).join('');
}
SCREENS.aiDetail = {
  render() {
    const R = ui.results;
    if (!R.list || !R.list.length) { R.list = recommend({ look: '데일리룩' }, 5); R.ctx = { look: '데일리룩' }; }
    const idx = Math.min(ui.detailIdx, R.list.length - 1);
    const rec = R.list[idx];
    const look = R.ctx.look || rec.look;
    return `<div class="screen"><div class="scroll">
      ${topbar('AI 코디 추천', { backBtn: true, right: avatar() })}
      <div class="pad"><div class="ai-banner">${sparkle(30)}<p>선호하는 스타일과 날씨, 상황을 반영한<br><b>AI 맞춤 코디</b>입니다.</p></div></div>
      <div class="chips scroll-x pad mt12">${LOOKS.map(l => chip(l, look === l, 'detLook', l, 'dark')).join('')}</div>
      <div class="pad mt12"><div class="det-main">
        <div class="det-track" id="detTrack">${R.list.map(r => `<div class="det-slide">${board(r.items, { cls: 'tall' })}</div>`).join('')}</div>
        <div class="det-thumbs" id="detThumbs">${detailThumbs(rec)}</div>
      </div>${dotsHtml(R.list.length, idx, 'detDots')}</div>
      <div class="pad mt12" id="detInfo">${detailInfoHtml(rec)}</div>
      <div class="h40"></div>
    </div></div>`;
  },
  mount() {
    const t = $('#detTrack'); if (!t) return;
    t.scrollLeft = ui.detailIdx * t.clientWidth;
    bindCarousel(t, $('#detDots'), {
      onChange: i => {
        ui.detailIdx = i; const rec = ui.results.list[i]; if (!rec) return;
        $('#detThumbs').innerHTML = detailThumbs(rec); $('#detInfo').innerHTML = detailInfoHtml(rec);
      },
    });
  },
};
A.detLook = l => {
  const R = ui.results; R.ctx = { ...R.ctx, look: l };
  R.list = recommend(R.ctx, 5); ui.detailIdx = 0;
  render();
};
function curRec() { return ui.results.list[ui.detailIdx]; }
A.recSave = () => { saveRec(curRec()); $('#detInfo').innerHTML = detailInfoHtml(curRec()); toast('코디북에 담았어요'); };
A.recWear = () => {
  const r = curRec(); const s = Store.state;
  let c = s.codis.find(x => x.key === r.key);
  if (!c) c = saveRec(r);
  c.date = dayKey(Date.now());
  c.items.forEach(id => { const it = itemById(id); if (it) it.wear = (it.wear || 0) + 1; });
  Store.save(); $('#detInfo').innerHTML = detailInfoHtml(r);
  toast('오늘의 코디로 기록했어요 · 코디 히스토리에서 볼 수 있어요');
};
A.recToManual = () => { manualPreload(curRec().items.filter(i => !i.virtual).map(i => i.id)); go('manual'); };

/* ---------- 직접 조합 ---------- */
function manualPreload(ids) {
  const M = ui.manual; M.slots = {}; M.acc = []; M.editId = null; M.forFam = null;
  ids.forEach(id => { const it = itemById(id); if (it) manualPut(it); });
}
/* 가족 옷장을 열어 그 가족에게 보낼 코디 만들기 */
function startManualFor(famId) {
  manualPreload([]);
  Object.assign(ui.manual, { forFam: famId, owner: famId, cat: '상의' });
  go('manual');
}
function manualPut(it) {
  const M = ui.manual, sl = slotOf(it);
  if (sl === 'acc') { if (!M.acc.includes(it.id)) M.acc = [...M.acc, it.id].slice(-3); return; }
  if (sl === 'dress') { delete M.slots.top; delete M.slots.bottom; }
  if (sl === 'top' || sl === 'bottom') delete M.slots.dress;
  M.slots[sl] = it.id;
}
function manualItems() { const M = ui.manual; return [...Object.values(M.slots), ...M.acc].map(itemById).filter(Boolean); }
function manualTabsHtml() {
  const M = ui.manual, s = Store.state;
  const owners = [{ id: 'me', name: '내 옷' }, ...s.family.filter(f => f.id !== 'me').map(f => ({ id: f.id, name: f.label })), { id: 'all', name: '가족 전체' }];
  return `<div class="man-tabs">
    <div class="chips scroll-x pad">${s.categories.map(c => chip(`${CAT_ICON[c] ? ic(CAT_ICON[c], 15) : ''}${esc(c)}`, M.cat === c, 'manCat', c, 'sm')).join('')}</div>
    <div class="chips scroll-x pad mt8">${owners.map(f => chip(esc(f.name), M.owner === f.id, 'manOwner', f.id, 'xs')).join('')}</div>
  </div>`;
}
function manualLeftHtml() {
  const items = manualItems();
  return `${items.length ? board(items) : `<div class="board empty-board">${ic('hanger', 28)}<span>오른쪽에서<br>옷을 골라 주세요</span></div>`}
    <div class="man-list">${items.map(it => `<div class="man-it"><span>${esc(SLOT_LABEL[slotOf(it)])}</span><b>${esc(it.name)}</b><button class="x" data-act="manualToggle" data-arg="${it.id}">${ic('x', 11)}</button></div>`).join('')}</div>
    <button class="btn primary block mt8" data-act="manualDone" ${items.length ? '' : 'disabled'}>코디완료</button>
    ${items.length ? '<button class="link sm mt8" data-act="manualClear">모두 비우기</button>' : ''}`;
}
function manualPickHtml() {
  const M = ui.manual;
  const sel = new Set([...Object.values(M.slots), ...M.acc]);
  const list = Store.state.items.filter(i => i.cat === M.cat && (M.owner === 'all' || i.owner === M.owner));
  if (!list.length) return emptyState(`${esc(M.cat)}이(가) 없어요`, `<button class="btn sm ghost" data-act="regStart">${ic('plus', 14)} 등록</button>`);
  return `<div class="igrid c2 tight">${list.map(it => `<div class="icard c2 pk ${sel.has(it.id) ? 'sel' : ''}" data-act="manualToggle" data-arg="${it.id}">
    <div class="ithumb">${itemArt(it)}<span class="selmark">${ic('check', 13)}</span>${it.status !== '사용 가능' ? `<span class="badge st">${esc(it.status)}</span>` : ''}</div><span class="iname sm">${esc(it.name)}</span></div>`).join('')}</div>`;
}
/* 위쪽 메뉴와 왼쪽 코디는 고정, 오른쪽 옷 목록만 스크롤 */
SCREENS.manual = {
  render() {
    const M = ui.manual, f = M.forFam && famOf(M.forFam);
    const title = M.editId ? '코디 수정' : f ? `${esc(f.name)}님 코디 해주기` : '직접 조합';
    return `<div class="screen man-screen">
      ${topbar(title, { backBtn: true, right: weatherChip() + avatar() })}
      ${manualTabsHtml()}
      <div class="man-wrap fill pad mt8">
        <div class="man-left">${manualLeftHtml()}</div>
        <div class="man-right scroll" id="manPick">${manualPickHtml()}<div class="h40"></div></div>
      </div>
    </div>`;
  },
};
A.manCat = c => { ui.manual.cat = c; render(); };
A.manOwner = o => { ui.manual.owner = o; render(); };
A.manualClear = () => { ui.manual.slots = {}; ui.manual.acc = []; render(); };
A.manualToggle = id => {
  const M = ui.manual, it = itemById(id); if (!it) return;
  const sl = slotOf(it);
  if (M.slots[sl] === id) delete M.slots[sl];
  else if (M.acc.includes(id)) M.acc = M.acc.filter(x => x !== id);
  else manualPut(it);
  render();
};
A.manualDone = () => {
  const M = ui.manual, ed = M.editId && findCodi(M.editId);
  const mood = ed ? (MOODS.find(m => (ed.tags || []).includes('#' + m.k)) || {}).k || null : null;
  openSheet('codiSave', { name: ed ? ed.name : '', share: ed ? [...ed.sharedWith] : M.forFam ? [M.forFam] : [], fav: ed ? ed.fav : false, date: ed ? ed.date || '' : M.forFam ? '' : dayKey(Date.now()), mood });
};
SHEETS.codiSave = sh => {
  const items = manualItems(), s = Store.state, M = ui.manual;
  return `<div class="sheet-body">
    <h3 class="sheet-title">${M.editId ? '코디 수정 완료' : '코디 완료'}</h3>
    <div class="save-top">${board(items)}<div class="flex1">
      <label class="field-label m0">코디 이름</label>
      <input class="input" id="codiName" placeholder="${esc(nextCodiName())}" value="${esc(sh.name)}" maxlength="24">
      <p class="hint">비워 두면 날짜와 번호로 저장돼요.</p>
      <label class="field-label">입을 날짜</label><input class="input" type="date" id="codiDate" value="${sh.date}">
    </div></div>
    <label class="field-label">어디에 입나요? <small>무드 · 장소</small></label>
    <div class="chips wrap">${MOODS.map(m => chip(`${m.e} ${m.k}`, sh.mood === m.k, 'codiMoodT', m.k, 'sm')).join('')}</div>
    <label class="field-label">옷 위치 <small>꺼낼 곳을 확인하세요</small></label>
    <div class="loc-list">${items.map(it => `<div class="lrow"><div class="ithumb xs">${itemArt(it)}</div><b>${esc(it.name)}</b><span>${ic('pin', 13)} ${esc(it.loc)}${it.owner !== 'me' ? ` · ${esc(famOf(it.owner).name)}` : ''}</span></div>`).join('')}</div>
    <label class="field-label">가족에게 보내기 <small>코디를 정해서 보내줄 수 있어요</small></label>
    <div class="chips wrap">${s.family.filter(f => f.id !== 'me').map(f => chip(`${ic('send', 13)} ${esc(f.name)}`, sh.share.includes(f.id), 'codiShareT', f.id, 'sm')).join('')}</div>
    <div class="row gap8 mt16">
      <button class="fav-lg ${sh.fav ? 'on' : ''}" data-act="codiFavT" aria-label="즐겨찾기">${ic('heart', 22)}</button>
      <button class="btn primary flex1" data-act="codiSaveOk">${sh.share.length ? `저장하고 ${sh.share.length}명에게 보내기` : M.editId ? '수정 내용 저장' : '코디북에 저장'}</button>
    </div>
  </div>`;
};
function keepCodiForm() { const sh = topSheet(); sh.name = $('#codiName').value; sh.date = $('#codiDate').value; }
A.codiMoodT = m => { keepCodiForm(); const sh = topSheet(); sh.mood = sh.mood === m ? null : m; renderOverlay(); };
A.codiShareT = id => { keepCodiForm(); const a = topSheet().share; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); renderOverlay(); };
A.codiFavT = () => { keepCodiForm(); topSheet().fav = !topSheet().fav; renderOverlay(); if (topSheet().fav) popHeart('[data-act="codiFavT"]'); };
A.codiSaveOk = () => {
  keepCodiForm();
  const sh = topSheet(), s = Store.state, M = ui.manual;
  const items = manualItems();
  const name = sh.name.trim() || nextCodiName();
  const tags = ['#' + curSeason(sh.date ? new Date(sh.date + 'T00:00') : new Date()), sh.mood ? '#' + sh.mood : null].filter(Boolean);
  const fields = { key: items.map(i => i.id).sort().join(','), name, items: items.map(i => i.id), date: sh.date || null, fav: sh.fav, tags, sharedWith: [...sh.share] };
  const ed = M.editId && findCodi(M.editId);
  if (ed) Object.assign(ed, fields);
  else {
    s.codis.unshift({ id: uid('cd'), virtual: [], source: 'manual', from: null, createdAt: Date.now(), ...fields });
    s.codiSeq++;
    if (fields.date === dayKey(Date.now())) items.forEach(it => { it.wear = (it.wear || 0) + 1; });
  }
  Store.save();
  closeAllSheets();
  if (sh.share.length && navigator.share) {
    navigator.share({ title: `area 코디 · ${name}`, text: `${name}\n${items.map(i => `- ${i.name} (${i.loc})`).join('\n')}` }).catch(() => { });
  }
  toast(sh.share.length ? `${sh.share.map(f => famOf(f).name).join(', ')}에게 코디를 보냈어요` : ed ? '코디를 수정했어요' : '코디북에 저장했어요');
  const toMy = !!(ed || M.forFam);
  ui.manual.slots = {}; ui.manual.acc = []; ui.manual.editId = null; ui.manual.forFam = null; ui.manual.owner = 'me';
  ui.cb.tab = 'mine';
  if (toMy) back('my'); else go('codibook', null, { replace: true });
};

/* ---------- 코디 상세 시트 (저장된 코디) ---------- */
A.openCodi = id => openSheet('codi', { id });
SHEETS.codi = sh => {
  const c = Store.state.codis.find(x => x.id === sh.id); if (!c) return '<div class="sheet-body">삭제된 코디예요.</div>';
  const items = codiItems(c);
  return `<div class="sheet-body">
    <div class="row between"><div><h2 class="h2">${esc(c.name)}</h2><p class="sub">${c.from ? `${esc(famOf(c.from).name)}님이 보낸 코디 · ` : ''}${c.date ? `${fmtDate(c.date)} 착용` : '아직 입지 않았어요'}</p></div>
      <button class="fav-lg ${c.fav ? 'on' : ''}" data-act="codiFav" data-arg="${c.id}">${ic('heart', 22)}</button></div>
    <div class="codi-big mt12">${board(items, { cls: 'tall' })}</div>
    <div class="chips wrap mt12">${(c.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <label class="field-label">옷 위치</label>
    <div class="loc-list">${items.map(it => `<div class="lrow" ${it.virtual ? '' : `data-act="openItem" data-arg="${it.id}"`}><div class="ithumb xs">${itemArt(it)}</div><b>${esc(it.name)}</b><span>${it.virtual ? 'AI 추천 · 미보유' : `${ic('pin', 13)} ${esc(it.loc)}`}</span></div>`).join('')}</div>
    ${c.sharedWith.length ? `<div class="row between mt8"><p class="hint m0">${c.sharedWith.map(f => esc(famOf(f).name)).join(', ')}에게 보냄</p><button class="link sm" data-act="sentCancel" data-arg="${c.id}">보내기 취소</button></div>` : ''}
    <div class="row gap8 mt16">
      <button class="btn ghost flex1" data-act="codiShare" data-arg="${c.id}">${ic('share', 16)} 가족 공유</button>
      <button class="btn primary flex1" data-act="codiWear" data-arg="${c.id}">${ic('calendar', 16)} 오늘 입기</button>
    </div>
    <div class="row gap8 mt8">
      <button class="btn ghost flex1" data-act="codiEdit" data-arg="${c.id}">${ic('edit', 16)} 수정해서 새로 만들기</button>
      <button class="btn ghost danger-t" data-act="codiDel" data-arg="${c.id}">${ic('trash', 16)}</button>
    </div>
  </div>`;
};
const findCodi = id => Store.state.codis.find(x => x.id === id);
A.codiFav = id => { const c = findCodi(id); c.fav = !c.fav; Store.save(); renderOverlay(); render(); if (c.fav) popHeart(`[data-act="codiFav"][data-arg="${id}"]`); };
A.codiWear = id => {
  const c = findCodi(id); c.date = dayKey(Date.now());
  c.items.forEach(x => { const it = itemById(x); if (it) it.wear = (it.wear || 0) + 1; });
  Store.save(); renderOverlay(); render(); toast('오늘의 코디로 기록했어요');
};
A.codiShare = id => openSheet('share', { id, sel: [] });
SHEETS.share = sh => `<div class="sheet-body"><h3 class="sheet-title">${ic('send', 18)} 가족에게 코디 보내기</h3>
  <div class="chips wrap mt12">${Store.state.family.filter(f => f.id !== 'me').map(f => chip(esc(f.name), sh.sel.includes(f.id), 'shareT', f.id)).join('')}</div>
  <button class="btn primary block mt16" data-act="shareOk" ${sh.sel.length ? '' : 'disabled'}>보내기</button></div>`;
A.shareT = id => { const a = topSheet().sel; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); renderOverlay(); };
A.shareOk = () => {
  const sh = topSheet(), c = findCodi(sh.id);
  c.sharedWith = [...new Set([...c.sharedWith, ...sh.sel])]; Store.save();
  const names = sh.sel.map(f => famOf(f).name).join(', ');
  closeSheet(); renderOverlay(); toast(`${names}에게 '${c.name}'을(를) 보냈어요`);
};
A.codiEdit = id => { manualPreload(findCodi(id).items); closeAllSheets(); go('manual'); };
A.codiDel = id => askConfirm('코디 삭제', '이 코디를 코디북에서 삭제할까요?', '삭제', () => {
  Store.state.codis = Store.state.codis.filter(c => c.id !== id); Store.save(); closeAllSheets(); render();
}, true);

/* ---------- 코디북 ---------- */
function codiCard(c) {
  return `<div class="ccard" data-act="openCodi" data-arg="${c.id}">${board(codiItems(c))}
    <button class="fav ${c.fav ? 'on' : ''}" data-act="codiFavQuick" data-arg="${c.id}">${ic('heart', 18)}</button>
    ${c.from ? `<span class="ai-tag">${ic('send', 10)} ${esc(famOf(c.from).name)}</span>` : c.source === 'ai' ? `<span class="ai-tag">${sparkle(10)} AI</span>` : ''}
    <b class="ctitle">${esc(c.name)}</b><span class="cdate">${c.date ? fmtDate(c.date) : '저장만 함'}</span></div>`;
}
A.codiFavQuick = id => { const c = findCodi(id); c.fav = !c.fav; Store.save(); render(); if (c.fav) popHeart(`[data-act="codiFavQuick"][data-arg="${id}"]`); };

SCREENS.codibook = {
  nav: 'codibook',
  render() {
    const B = ui.cb;
    return `<div class="screen has-nav"><div class="scroll">
      <header class="topbar pad"><div class="tb-left"><h1 class="tb-title">코디북</h1></div><div class="tb-right"><button class="icon-btn" data-act="go" data-arg="history" aria-label="히스토리">${ic('calendar', 22)}</button>${avatar()}</div></header>
      <div class="pad">${seg(['내 코디북', '코디SHOP'], B.tab === 'mine' ? '내 코디북' : '코디SHOP', 'cbTab')}</div>
      ${B.tab === 'mine' ? this.mine() : this.market()}
      <div class="h40"></div>
    </div></div>`;
  },
  mine() {
    const B = ui.cb, s = Store.state;
    let list = s.codis;
    if (B.filter === 'fav') list = list.filter(c => c.fav);
    if (B.filter === 'shared') list = list.filter(c => c.from || c.sharedWith.length);
    const fam = s.family;
    return `
      <div class="pad mt16 act3">
        <button class="act-card ${B.auto ? 'on' : ''}" data-act="cbAuto">${ic('shuffle', 24)}<b>자동조합</b><span>16가지 한 번에</span></button>
        <button class="act-card" data-act="go" data-arg="manual">${ic('hanger', 24)}<b>직접조합</b><span>내 손으로 코디</span></button>
        <button class="act-card" data-act="go" data-arg="ask">${ic('chat', 24)}<b>코디묻기</b><span>AI에게 물어보기</span></button>
      </div>
      ${B.auto ? `<div class="pad mt16"><div class="sec-head"><h2 class="h2">${sparkle(16)} 자동 조합 ${B.auto.length}개</h2><button class="link" data-act="cbAutoClose">접기</button></div>
        <div class="cgrid c4">${B.auto.map((r, i) => `<div class="ccard" data-act="cbAutoOpen" data-arg="${i}">${board(r.items)}${colorDots(r.items)}</div>`).join('')}</div>
        <button class="btn ghost block mt12" data-act="cbAutoMore">${ic('refresh', 16)} 16개 더 보기</button></div>` : ''}

      <div class="pad mt24"><div class="sec-head"><h2 class="h2">${ic('users', 18)} 가족 옷 섞어 입기</h2></div>
        <p class="sub sm">가족 옷장에서 한 벌씩 골라 함께 코디해 보세요.</p>
        ${[0, 1].map(k => {
          const it = B.mix[k] && itemById(B.mix[k]);
          return `<div class="mix-row mt8">
            <div class="mix-slot" data-act="mixOpen" data-arg="${k}">${it ? `<div class="ithumb">${itemArt(it)}</div>` : `<div class="ithumb empty">${ic('plus', 20)}</div>`}</div>
            <div class="flex1"><span class="step">${k + 1}번째 옷 ${it ? `· <b>${esc(it.name)}</b> <small>${esc(famOf(it.owner).name)} · ${esc(it.loc)}</small>` : ''}</span>
              <div class="chips scroll-x mt6">${fam.map(f => chip(esc(f.label), B.mixOwner[k] === f.id, 'mixOwner', `${k}|${f.id}`, 'xs')).join('')}</div></div>
          </div>`;
        }).join('')}
        <button class="btn outline block mt12" data-act="mixGo" ${B.mix.some(Boolean) ? '' : 'disabled'}>${ic('hanger', 16)} 이 옷들로 직접 조합하기</button>
      </div>

      <div class="pad mt24"><div class="sec-head"><h2 class="h2">저장한 코디 <small>${s.codis.length}</small></h2><button class="more" data-act="go" data-arg="history">히스토리 ${ic('chevR', 14)}</button></div>
        <div class="chips">${[['all', '전체'], ['fav', '♥ 즐겨찾기'], ['shared', '공유']].map(([k, l]) => chip(l, B.filter === k, 'cbFilter', k, 'sm')).join('')}</div>
        <div class="mt12">${list.length ? `<div class="cgrid c2">${list.map(codiCard).join('')}</div>` : emptyState('저장한 코디가 없어요')}</div>
      </div>`;
  },
  market() {
    const s = Store.state;
    const mySales = s.sales.map(x => ({ ...x, it: itemById(x.itemId) })).filter(x => x.it);
    return `
      <div class="pad mt16"><div class="sec-head"><h2 class="h2">다른 사람의 코디</h2></div>
        <div class="hscroll">${MARKET.codis.map(m => { const req = activeReq(m.id); return `<div class="mk-codi">
          ${board(m.items.map((x, i) => ({ ...x, id: m.id + i, colorName: nearestColor(x.color).name })), { badge: false })}
          <div class="row between mt6"><b>${esc(m.title)}</b><span class="likes">${ic('heart', 13, 'filled')} ${m.likes}</span></div>
          <span class="sub sm">@${esc(m.user)}</span>
          <button class="btn sm ${req ? 'ghost' : 'light'} block mt6" data-act="askSell" data-arg="${m.id}">${req ? '요청 보냄 ✓ · 취소하기' : '이 옷, 저한테 팔 수 있나요?'}</button>
        </div>`; }).join('')}</div>
      </div>
      <div class="pad mt24"><div class="market-zone">
        <div class="sec-head"><h2 class="h2">${ic('users', 18)} 개인 판매</h2><span class="hint m0">중고 · 직거래</span></div>
        <div class="grid g2">${[...mySales.map(x => ({ mine: true, id: x.itemId, it: x.it, price: x.price })), ...MARKET.used.map(u => ({ id: u.id, it: u, price: u.price, seller: u.seller, cond: u.cond }))].map(p => `<div class="prod">
          <div class="ithumb">${itemArt(p.it)}${p.mine ? '<span class="badge new">내 판매</span>' : ''}</div>
          <b>${esc(p.it.name)}</b><span class="price">${won(p.price)}</span><span class="sub sm">${p.mine ? '내 옷장' : `${esc(p.seller)} · ${esc(p.cond)}`}</span>
          ${p.mine ? `<button class="btn sm ghost block mt6" data-act="sellItem" data-arg="${p.id}">판매 취소</button>` : `<button class="btn sm ghost block mt6" data-act="usedAsk" data-arg="${p.id}">${ic('chat', 14)} 거래 문의</button>`}
        </div>`).join('')}</div>
        <p class="hint">내 옷 상세에서 '판매 등록'을 누르면 여기에 올라가요.</p>
      </div></div>
      <div class="pad mt16"><div class="market-zone new">
        <div class="sec-head"><h2 class="h2">${ic('store', 18)} 새상품 판매</h2><span class="hint m0">공식 입점</span></div>
        <div class="grid g2">${MARKET.fresh.map(p => `<div class="prod">
          <div class="ithumb">${garmentSVG(p)}</div>
          <span class="brand">${esc(p.brand)}</span><b>${esc(p.name)}</b><span class="price">${won(p.price)}</span>
          <button class="btn sm primary block mt6" data-act="buy" data-arg="${p.id}">${ic('bag', 14)} 구매하기</button>
        </div>`).join('')}</div>
      </div></div>`;
  },
};
A.cbTab = t => { ui.cb.tab = t === '내 코디북' ? 'mine' : 'market'; render(); };
A.cbFilter = f => { ui.cb.filter = f; render(); };
A.cbAuto = () => { ui.cb.auto = recommend({ aiExtra: false, style: '캐주얼' }, 16); render(); };
A.cbAutoMore = () => { const ex = new Set(ui.cb.auto.map(r => r.key)); const more = recommend({ aiExtra: false, style: '캐주얼' }, 16, ex); if (!more.length) toast('더 만들 수 있는 조합이 없어요'); ui.cb.auto = [...ui.cb.auto, ...more]; render(); };
A.cbAutoClose = () => { ui.cb.auto = null; render(); };
A.cbAutoOpen = i => openResults(ui.cb.auto, { aiExtra: false, style: '캐주얼' }, Number(i));
A.mixOwner = arg => { const [k, id] = arg.split('|'); ui.cb.mixOwner[k] = id; A.mixOpen(k); render(); };
A.mixOpen = k => {
  const owner = ui.cb.mixOwner[k];
  openPicker({
    mode: 'single', owner, filters: true, title: `${famOf(owner).label} 선택하기`, desc: '계절·색상으로 걸러서 한 벌을 골라 주세요.',
    onDone: ([id]) => { ui.cb.mix[k] = id; render(); },
  });
};
A.mixGo = () => { manualPreload(ui.cb.mix.filter(Boolean)); ui.manual.owner = 'all'; go('manual'); };

/* 코디SHOP: '저한테 팔 수 있나요?' 요청 · 취소 */
function activeReq(target) { return Store.state.requests.find(r => r.target === target && r.status === '요청 중'); }
A.askSell = id => {
  const s = Store.state, r = activeReq(id);
  if (r) { r.status = '취소됨'; Store.save(); render(); toast('판매 요청을 취소했어요'); return; }
  const m = MARKET.codis.find(x => x.id === id);
  s.requests.unshift({ id: uid('rq'), target: id, status: '요청 중', at: Date.now() });
  startThread(m.user, m.title, `'${m.title}' 코디 옷들, 저한테 파실 수 있나요?`);
  Store.save(); render(); toast('판매 요청을 보냈어요. 마이페이지에서 확인·취소할 수 있어요');
};
A.usedAsk = id => {
  const u = MARKET.used.find(x => x.id === id);
  const m = startThread(u.seller, u.name, '안녕하세요! 이 상품 아직 거래 가능할까요?');
  A.openThread(m.id);
};

/* 새상품 구매: 배송받기 / 선물하기 */
A.buy = id => openSheet('buy', { id, mode: '배송받기', f: {} });
SHEETS.buy = sh => {
  const p = MARKET.fresh.find(x => x.id === sh.id), f = sh.f;
  const inp = (k, label, ph, type = 'text') => `<label class="field-label">${label}</label><input class="input" data-bf="${k}" type="${type}" value="${esc(f[k] || '')}" placeholder="${ph}">`;
  return `<div class="sheet-body">
    <h3 class="sheet-title">${ic('bag', 20)} 구매하기</h3>
    <div class="lrow mt8"><div class="ithumb xs">${garmentSVG(p)}</div><b>${esc(p.name)}<small class="brand-s">${esc(p.brand)}</small></b><span class="price">${won(p.price)}</span></div>
    <div class="mt16">${seg(['배송받기', '선물하기'], sh.mode, 'buyMode')}</div>
    ${sh.mode === '배송받기'
      ? inp('name', '받는 분', '이름') + inp('phone', '연락처', '010-0000-0000', 'tel') + inp('addr', '주소', '도로명 주소') + inp('addr2', '상세 주소', '동 · 호수') + inp('memo', '배송 요청사항', '예) 문 앞에 놓아 주세요')
      : inp('name', '받는 분 이름', '선물 받을 분') + inp('phone', '받는 분 연락처', '010-0000-0000', 'tel') + inp('from', '보내는 분', Store.state.user.name)
        + `<label class="field-label">선물 메시지</label><textarea class="input ta" data-bf="msg" maxlength="100" placeholder="마음을 전해 보세요">${esc(f.msg || '')}</textarea>
        <p class="hint">받는 분에게 문자로 선물 링크가 가고, 받는 분이 직접 배송지를 입력해요.</p>`}
    <div class="buy-sum mt16"><span>결제 금액</span><b>${won(p.price)}</b></div>
    <button class="btn primary lg block mt12" data-act="buyOk">${sh.mode === '선물하기' ? `${ic('send', 18)} 선물 결제하기` : '결제하기'}</button>
    <p class="hint center">데모라 실제 결제는 되지 않아요</p>
  </div>`;
};
function keepBuyForm() { const sh = topSheet(); $$('#overlay [data-bf]').forEach(el => { sh.f[el.dataset.bf] = el.value; }); }
A.buyMode = m => { keepBuyForm(); topSheet().mode = m; renderOverlay(); };
A.buyOk = () => {
  keepBuyForm();
  const sh = topSheet(), f = sh.f, gift = sh.mode === '선물하기';
  const p = MARKET.fresh.find(x => x.id === sh.id);
  const need = gift ? [['name', '받는 분 이름'], ['phone', '받는 분 연락처']] : [['name', '받는 분'], ['phone', '연락처'], ['addr', '주소']];
  const miss = need.find(([k]) => !(f[k] || '').trim());
  if (miss) { toast(`${miss[1]}을(를) 입력해 주세요`); return; }
  Store.state.orders.unshift({ id: uid('od'), prodId: p.id, name: p.name, brand: p.brand, cat: p.cat, sub: p.sub, color: p.color, price: p.price, type: gift ? '선물' : '배송', to: f.name.trim(), addr: gift ? '' : `${f.addr} ${f.addr2 || ''}`.trim(), status: '결제 완료', at: Date.now() });
  Store.save(); closeSheet();
  toast(gift ? `${f.name}님께 선물을 보냈어요 🎁` : '결제했어요 · 마이페이지 > 거래 내역에서 볼 수 있어요');
};

/* ---------- 코디 히스토리 (리스트 / 달력) ---------- */
SCREENS.history = {
  render() {
    const H = ui.hist, s = Store.state;
    const worn = s.codis.filter(c => c.date).sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="screen"><div class="scroll">
      ${topbar('코디 히스토리', { backBtn: true, right: `<div class="cols">${[['list', 'list'], ['cal', 'calendar']].map(([k, icn]) => `<button class="${H.view === k ? 'on' : ''}" data-act="histView" data-arg="${k}">${ic(icn, 18)}</button>`).join('')}</div>` })}
      ${H.view === 'list' ? this.list(worn) : this.cal(worn)}
      <div class="h40"></div>
    </div></div>`;
  },
  list(worn) {
    if (!worn.length) return `<div class="pad">${emptyState('아직 기록된 코디가 없어요.<br>코디에서 \'오늘 입기\'를 눌러 기록해 보세요.')}</div>`;
    const groups = {};
    worn.forEach(c => { const k = c.date.slice(0, 7); (groups[k] = groups[k] || []).push(c); });
    return Object.entries(groups).map(([k, cs]) => `<div class="pad mt16"><p class="sec-cap">${k.replace('-', '년 ')}월 · ${cs.length}회</p>
      ${cs.map(c => `<button class="hist-row" data-act="openCodi" data-arg="${c.id}"><div class="hist-date"><b>${Number(c.date.slice(8))}</b><span>${'일월화수목금토'[new Date(c.date).getDay()]}</span></div>${board(codiItems(c))}<div class="flex1"><b>${esc(c.name)}</b><span class="sub sm">${codiItems(c).map(i => i.name).slice(0, 3).map(esc).join(' · ')}</span></div>${ic('chevR', 16)}</button>`).join('')}
    </div>`).join('');
  },
  cal(worn) {
    const H = ui.hist;
    const first = new Date(H.y, H.m, 1), days = new Date(H.y, H.m + 1, 0).getDate();
    const byDay = {}; worn.forEach(c => { (byDay[c.date] = byDay[c.date] || []).push(c); });
    const today = dayKey(Date.now());
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push('<div class="cal-c blank"></div>');
    for (let d = 1; d <= days; d++) {
      const k = `${H.y}-${String(H.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cs = byDay[k];
      cells.push(`<button class="cal-c ${k === today ? 'today' : ''} ${H.day === k ? 'sel' : ''} ${cs ? 'has' : ''}" data-act="histDay" data-arg="${k}"><span>${d}</span>${cs ? board(codiItems(cs[0]), { badge: false }) : ''}</button>`);
    }
    const sel = H.day && byDay[H.day];
    return `<div class="pad">
      <div class="cal-head"><button class="icon-btn" data-act="histMonth" data-arg="-1">${ic('chevL', 20)}</button><b>${H.y}년 ${H.m + 1}월</b><button class="icon-btn" data-act="histMonth" data-arg="1">${ic('chevR', 20)}</button></div>
      <div class="cal-grid wk">${'일월화수목금토'.split('').map(x => `<span>${x}</span>`).join('')}</div>
      <div class="cal-grid">${cells.join('')}</div>
      ${H.day ? `<div class="mt16"><p class="sec-cap">${fmtDate(H.day)}</p>${sel ? `<div class="cgrid c2">${sel.map(codiCard).join('')}</div>` : `<p class="sub">이 날은 기록된 코디가 없어요.</p>`}</div>` : ''}
    </div>`;
  },
};
A.histView = v => { ui.hist.view = v; render(); };
A.histMonth = d => { const H = ui.hist; const m = H.m + Number(d); H.y += Math.floor(m / 12); H.m = (m % 12 + 12) % 12; H.day = null; render(); };
A.histDay = k => { ui.hist.day = ui.hist.day === k ? null : k; render(); };

/* ---------- 코디 묻기 (문장 → 조건 해석 → 추천) ---------- */
const ASK_SUGGEST = ['내일 결혼식 하객룩 추천해줘', '비 오는 날 출근룩', '카페 데이트 뭐 입지?', '10도 날씨 여행 코디', '블랙 블레이저랑 어울리는 거'];
function parseAsk(text) {
  const t = text.replace(/\s+/g, ' ');
  const ctx = { aiExtra: true };
  const moods = [[/결혼|하객|예식/, '예식장'], [/출근|회사|오피스|면접|미팅/, '출근'], [/카페/, '카페'], [/데이트|소개팅/, '데이트'], [/여행|나들이/, '여행'], [/캠핑|등산/, '캠핑'], [/운동|헬스|러닝|요가/, '운동'], [/파티|모임|생일/, '파티'], [/학교|캠퍼스|수업/, '캠퍼스']];
  for (const [re, m] of moods) if (re.test(t)) { ctx.mood = m; break; }
  const styles = [[/정장|포멀|격식/, '정장'], [/스트릿|힙/, '스트릿'], [/스포티|운동복/, '스포츠'], [/미니멀|깔끔/, '미니멀'], [/캐주얼|편하/, '캐주얼']];
  for (const [re, s] of styles) if (re.test(t)) { ctx.style = s; break; }
  const deg = t.match(/(-?\d{1,2})\s*(도|°)/);
  const w = Weather.current();
  ctx.temp = deg ? Number(deg[1]) : /추워|추운|쌀쌀/.test(t) ? w.temp - 5 : /더워|더운|덥/.test(t) ? w.temp + 6 : w.temp;
  if (/봄/.test(t)) ctx.season = '봄'; else if (/여름/.test(t)) ctx.season = '여름'; else if (/가을/.test(t)) ctx.season = '가을'; else if (/겨울/.test(t)) ctx.season = '겨울';
  const compact = t.replace(/\s/g, '');
  ctx.fixed = Store.state.items.filter(i => i.owner === 'me' && compact.includes(i.name.replace(/\s/g, ''))).map(i => i.id).slice(0, 2);
  ctx.rain = /비|장마|우산/.test(t);
  return ctx;
}
function askReply(text) {
  const ctx = parseAsk(text);
  const recs = recommend(ctx, 3);
  const bits = [];
  if (ctx.mood) bits.push(`'${ctx.mood}' 상황`);
  if (ctx.style) bits.push(`${ctx.style} 스타일`);
  bits.push(`${ctx.temp}°C`);
  if (ctx.fixed.length) bits.push(`${ctx.fixed.map(id => itemById(id).name).join(', ')} 고정`);
  let msg = recs.length ? `${bits.join(' · ')}에 맞춰 내 옷장에서 ${recs.length}가지 코디를 골랐어요.` : '조건에 맞는 옷이 부족해요. 옷을 더 등록해 주세요.';
  if (ctx.rain) msg += ' 비 소식이 있으면 밝은 색 하의와 스웨이드 신발은 피하는 게 좋아요.';
  if (ctx.mood === '예식장') msg += ' 하객룩은 흰색 단독 착용은 피하고, 차분한 톤이 좋아요.';
  return { role: 'bot', text: msg, recs, ctx };
}
SCREENS.ask = {
  render() {
    if (!ui.ask.msgs) ui.ask.msgs = [{ role: 'bot', text: `안녕하세요 ${Store.state.user.name}님! 어디에 가는지, 날씨나 입고 싶은 옷을 말해 주시면 내 옷장 안에서 코디를 찾아드릴게요.` }];
    return `<div class="screen"><div class="scroll" id="askScroll">
      ${topbar('코디 묻기', { backBtn: true, right: avatar() })}
      <div class="pad chat">${ui.ask.msgs.map((m, mi) => `<div class="msg ${m.role}">${m.role === 'bot' ? `<span class="bot-av">${sparkle(16)}</span>` : ''}<div class="bubble"><p>${esc(m.text)}</p>
        ${m.recs && m.recs.length ? `<div class="msg-recs">${m.recs.map((r, i) => `<button class="ccard" data-act="askOpen" data-arg="${mi}|${i}">${board(r.items)}</button>`).join('')}</div>` : ''}</div></div>`).join('')}
      </div>
      <div class="pad chips wrap mt8">${ASK_SUGGEST.map(q => `<button class="chip sm" data-act="askSend" data-arg="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <div class="h80"></div>
    </div>
    <div class="ask-bar"><input id="askIn" placeholder="예) 토요일 카페 데이트, 15도래" maxlength="80"><button class="send" data-act="askSend">${ic('send', 18)}</button></div>
    </div>`;
  },
  mount() {
    const sc = $('#askScroll'); if (sc) sc.scrollTop = sc.scrollHeight;
    const i = $('#askIn'); if (i) i.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) A.askSend(); };
  },
};
A.askSend = q => {
  const text = (q || $('#askIn').value || '').trim(); if (!text) return;
  ui.ask.msgs.push({ role: 'me', text });
  ui.ask.msgs.push(askReply(text));
  render();
};
A.askOpen = arg => { const [mi, i] = arg.split('|').map(Number); const m = ui.ask.msgs[mi]; openResults(m.recs, m.ctx, i); };
