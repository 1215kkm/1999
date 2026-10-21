/* area — AI 코디 · 추천 상세 · 직접 조합 · 코디북 · 코디SHOP · 히스토리 · 코디 묻기 */

ui.ai = { style: '캐주얼', mood: null, season: curSeason(), aiExtra: true, fixed: [], exclude: [], cols: 2, list: null, owner: 'me', dirty: false, loading: false, fresh: false, model: null };
ui.manual = { slots: {}, acc: [], cat: '상의', owner: 'me', forFam: null, editId: null, layout: {}, big: false };
ui.cb = { tab: 'mine', filter: 'all', panel: null, auto: null, mix: [{ owner: 'me', id: null }, { owner: 'bro', id: null }] };
ui.hist = { view: 'list', y: new Date().getFullYear(), m: new Date().getMonth(), day: null };
ui.ask = { msgs: null };

function codiItems(c) { return [...c.items.map(itemById).filter(Boolean), ...(c.virtual || [])]; }
function codiBoard(c, opts = {}) { return board(codiItems(c), { layout: c.layout, ...opts }); }
function aiCtx() { const a = ui.ai; return { style: a.style, mood: a.mood, season: a.season, aiExtra: true, fixed: a.fixed, exclude: a.exclude, owners: [a.owner || 'me'] }; }
function savedKeys() { return new Set(Store.state.codis.map(c => c.key).filter(Boolean)); }

function nextCodiName() { return `${fmtDate(dayKey(Date.now()))} 코디 #${Store.state.codiSeq}`; }
function saveRec(rec, extra = {}) {
  const s = Store.state;
  const c = {
    id: uid('cd'), key: rec.key, name: extra.name || rec.title, items: rec.items.filter(i => !i.virtual).map(i => i.id),
    virtual: rec.items.filter(i => i.virtual).map(({ name, cat, sub, color, colorName, img }) => ({ name, cat, sub, color, colorName, img, virtual: true })),
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
/* AI가 고르는 듯한 로딩 → 카드가 하나씩 나타남 */
const AI_STEPS = ['옷장을 살펴보는 중', '날씨 · 상황을 맞추는 중', '색 조합을 고르는 중'];
let aiTimer = null;
function runAI(ms = 1600, avoid = null) {
  const a = ui.ai;
  clearTimeout(aiTimer);
  a.loading = true; a.dirty = false; render();
  aiTimer = setTimeout(() => {
    genAI(false, avoid); a.loading = false; a.fresh = true;
    if (ui.route.name === 'ai') render();
    a.fresh = false;
  }, ms);
}
const AI_COLS = [[1, 'grid1'], [2, 'grid2'], [3, 'grid4']];
function aiGridHtml() {
  const a = ui.ai, keys = savedKeys(), md = a.model && modelById(a.model);
  if (a.loading) return `<div class="ai-loading">
    <div class="ai-orb">${sparkle(34)}</div><b>AI가 코디를 고르는 중…</b>
    <div class="ai-steps">${AI_STEPS.map((t, i) => `<span style="--d:${i * 0.45}s">${ic('check', 13)} ${t}</span>`).join('')}</div>
    <div class="cgrid c${a.cols}">${Array.from({ length: a.cols === 1 ? 2 : 4 }, () => `<div class="skel ${md ? 'model' : ''}"></div>`).join('')}</div></div>`;
  if (!a.list || !a.list.length) return emptyState('조건에 맞는 코디를 만들 옷이 부족해요.<br>고정·제외한 옷이나 옵션을 바꿔 보세요.');
  return `<div class="cgrid c${a.cols} ${a.dirty ? 'dim' : ''}">${a.list.map((r, i) => `<div class="ccard ${a.fresh ? 'reveal' : ''}" style="--i:${i}" data-act="openAIRec" data-arg="${i}">
    ${md ? modelBoard(r.items, md) : board(r.items)}
    <button class="fav ${keys.has(r.key) ? 'on' : ''}" data-act="favRec" data-arg="${i}" aria-label="찜">${ic('heart', a.cols === 3 ? 14 : 19)}</button>
    ${r.virtual.length ? `<span class="ai-tag">${sparkle(10)} +${r.virtual.length}</span>` : ''}
    ${colorDots(r.items)}
    ${a.cols < 3 ? `<b class="ctitle">${esc(r.title)}</b>` : ''}
    ${famShareBtn(r, a.owner, 'aiShareFam', i)}
  </div>`).join('')}</div>${a.list.length && !a.dirty ? `<button class="btn ghost block mt12" data-act="aiMore">${ic('refresh', 16)} 더 보기</button>` : ''}`;
}
/* 가족 옷장으로 받은 추천은 그 가족에게 바로 보내기 */
function famTarget(owners) { const id = owners && owners[0]; return id && id !== 'me' && id !== 'all' ? id : null; }
function sentTo(key, fam) { const c = Store.state.codis.find(x => x.key === key); return !!(c && c.sharedWith.includes(fam)); }
function famShareBtn(rec, owner, act, arg, big = false) {
  const fam = famTarget([owner]); if (!fam) return '';
  const name = famOf(fam).name, sent = sentTo(rec.key, fam);
  return `<button class="${big ? 'btn primary lg block mt16' : 'fam-share'} ${sent ? 'done' : ''}" data-act="${act}" data-arg="${arg}">${ic(sent ? 'check' : 'send', big ? 18 : 13)} ${sent ? `${esc(name)}한테 보냈어요` : `${esc(name)}한테 공유하기`}</button>`;
}
function shareRecTo(rec, fam) {
  let c = Store.state.codis.find(x => x.key === rec.key);
  if (!c) c = saveRec(rec);
  if (c.sharedWith.includes(fam)) { toast(`이미 ${famOf(fam).name}한테 보낸 코디예요`); return; }
  c.sharedWith = [...c.sharedWith, fam]; Store.save();
  toast(`${famOf(fam).name}한테 '${c.name}'을(를) 보냈어요`);
}
A.aiShareFam = i => { const r = ui.ai.list[Number(i)]; if (r) { shareRecTo(r, ui.ai.owner); render(); } };
A.recShareFam = () => { const r = curRec(), fam = famTarget(ui.results.ctx.owners); if (r && fam) { shareRecTo(r, fam); $('#detInfo').innerHTML = detailInfoHtml(r); } };
function trayHtml(items, act) {
  return items.length ? `<div class="tray mt8">${items.map(it => `<div class="tray-it"><div class="ithumb">${itemArt(it)}</div><button class="x" data-act="${act}" data-arg="${it.id}">${ic('x', 11)}</button><span>${esc(it.name)}</span></div>`).join('')}</div>` : '';
}

SCREENS.ai = {
  nav: 'ai',
  render() {
    const a = ui.ai, w = Weather.current();
    if (a.aiExtra && !a.list && !a.loading) genAI();
    const fixed = a.fixed.map(itemById).filter(Boolean);
    const excl = a.exclude.map(itemById).filter(Boolean);
    const fam = a.owner && a.owner !== 'me' ? famOf(a.owner) : null;
    const md = a.model && modelById(a.model);
    return `<div class="screen has-nav"><div class="scroll" id="aiScroll">
      <header class="topbar pad"><div class="tb-left">${fam ? `<button class="icon-btn" data-act="aiOwnerBack" aria-label="나가기">${ic('chevL', 24)}</button>` : ''}<h1 class="tb-title">${fam ? `${esc(fam.name)}님 AI 코디` : '오늘, 뭐 입을까요?'}</h1></div><div class="tb-right">${weatherChip()}${bellBtn()}${avatar()}</div></header>
      ${fam ? `<div class="pad"><div class="fam-banner" style="--c:${famColor(fam.id)}">${ic('users', 16)} <b>${esc(fam.label)}</b>으로만 코디를 추천해요</div></div>` : ''}
      ${w.future ? `<div class="pad ${fam ? 'mt8' : ''}"><div class="fc-banner">${COND_EMOJI[w.cond] || '☀️'} <b>${mdLabel(w.date)}(${WEEK[new Date(w.date + 'T00:00').getDay()]})</b> 예보 ${w.min}~${w.max}° 기준으로 추천해요<button class="link sm" data-act="wPickDay" data-arg="0">오늘로</button></div></div>` : ''}

      <div class="pad ${w.future || fam ? 'mt12' : ''}"><div class="soft-card ai-toggle">
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
        <button class="btn primary lg block mt16 ${a.dirty ? 'ai-go' : ''}" data-act="aiRun">${sparkle(18)} AI 추천 보기</button>
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
        <div class="cols">${AI_COLS.map(([n, icn]) => `<button class="${a.cols === n ? 'on' : ''}" data-act="aiCols" data-arg="${n}" aria-label="한 줄에 ${n}개">${ic(icn, 18)}</button>`).join('')}</div></div></div>
      <div class="pad"><button class="model-btn ${md ? 'on' : ''}" data-act="aiModel">${md ? `<span class="model-th">${modelThumb(md)}</span> ${esc(md.name)}에게 입혀 보는 중 · 바꾸기` : `${ic('user', 16)} 모델 사진 사용하기 <small>내 사진이나 가상 모델에 입혀 보기</small>`}</button></div>
      <div class="pad mt12" id="aiGrid">${aiGridHtml()}</div>
      <div class="pad mt12"><button class="btn outline block" data-act="go" data-arg="manual">${ic('hanger', 18)} 내가 직접 조합하기</button></div>
      <div class="h40"></div>`
      : manualPanel(true)}
    </div></div>`;
  },
  mount() { mountManual(); },
};
A.aiExtraToggle = () => { ui.ai.aiExtra = !ui.ai.aiExtra; if (ui.ai.aiExtra && !ui.ai.list) genAI(); render(); };
A.aiStyle = k => { ui.ai.style = k; runAI(900); };
A.aiMood = k => { ui.ai.mood = ui.ai.mood === k ? null : k; runAI(900); };
A.aiSeason = k => { ui.ai.season = k; runAI(900); };
A.aiCols = n => { ui.ai.cols = Number(n); const g = $('#aiGrid'); render(); if (g) animateCols(g, 1.06, g.clientWidth / 2, 0); };
A.aiRun = () => runAI(1700);
A.aiRefresh = () => runAI(1100, new Set((ui.ai.list || []).flatMap(r => r.items.map(i => i.id))));
A.aiMore = () => { const n = genAI(true); render(); if (!n) toast('더 만들 수 있는 조합이 없어요'); };
A.aiUnfix = id => { ui.ai.fixed = ui.ai.fixed.filter(x => x !== id); ui.ai.dirty = true; render(); };
A.aiUnexclude = id => { ui.ai.exclude = ui.ai.exclude.filter(x => x !== id); ui.ai.dirty = true; render(); };
A.aiOwnerBack = () => { Object.assign(ui.ai, { owner: 'me', fixed: [], exclude: [], list: null }); Object.assign(ui.manual, { forFam: null, owner: 'me' }); back('my'); };
A.aiPickFixed = () => openPicker({
  mode: 'multi', owner: ui.ai.owner || 'me', sel: ui.ai.fixed, title: '고정할 옷 선택하기',
  onDone: ids => { ui.ai.fixed = ids; ui.ai.exclude = ui.ai.exclude.filter(x => !ids.includes(x)); ui.ai.dirty = true; render(); },
});
A.aiPickExclude = () => openPicker({
  mode: 'multi', owner: ui.ai.owner || 'me', sel: ui.ai.exclude, title: '제외할 옷 선택하기', desc: '고른 옷은 AI 추천에 나오지 않아요. (다중 선택 가능)',
  onDone: ids => { ui.ai.exclude = ids; ui.ai.fixed = ui.ai.fixed.filter(x => !ids.includes(x)); ui.ai.dirty = true; render(); },
});
A.openAIRec = i => { if (ui.ai.dirty || ui.ai.loading) return; openResults(ui.ai.list, aiCtx(), Number(i)); };
A.favRec = i => {
  const r = ui.ai.list[Number(i)]; if (!r) return;
  const s = Store.state, ex = s.codis.find(c => c.key === r.key);
  if (ex) { s.codis = s.codis.filter(c => c !== ex); Store.save(); toast('찜을 해제했어요'); }
  else { saveRec(r, { fav: true }); toast('코디북에 찜했어요 ♥'); }
  $$(`[data-act="favRec"][data-arg="${i}"]`).forEach(b => b.classList.toggle('on', !ex));
  if (!ex) popHeart(`[data-act="favRec"][data-arg="${i}"]`);
};

/* ---------- 모델 사진에 입혀 보기 (간이 미리보기) ---------- */
const BUILTIN_MODELS = [{ id: 'mdl-w', name: '가상 모델 A', kind: 'w' }, { id: 'mdl-m', name: '가상 모델 B', kind: 'm' }];
function modelById(id) { return BUILTIN_MODELS.find(m => m.id === id) || (Store.state.models || []).find(m => m.id === id); }
function modelSVG(kind) {
  const hair = kind === 'w' ? '<path d="M35 24c0-12 7-19 15-19s15 7 15 19c0 9-2 17-4 22h-22c-2-5-4-13-4-22z" fill="#3A3330"/>' : '<path d="M37 20c0-9 6-14 13-14s13 5 13 14c-3-4-7-6-13-6s-10 2-13 6z" fill="#3A3330"/>';
  return `<svg class="mdl-svg" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${hair}<g fill="#E6DED6">
    <ellipse cx="50" cy="21" rx="11" ry="13"/><rect x="45" y="31" width="10" height="8" rx="3"/>
    <path d="M30 40c6-3 13-4 20-4s14 1 20 4c4 2 6 6 7 11l4 30c.4 3-1 5-3 5s-3-1-4-4l-4-26-2 16 2 30-1 38c0 3-2 5-5 5s-5-2-5-5l-2-36-2 0-2 36c0 3-2 5-5 5s-5-2-5-5l-1-38 2-30-2-16-4 26c-1 3-2 4-4 4s-3.4-2-3-5l4-30c1-5 3-9 7-11z"/></g></svg>`;
}
function modelThumb(m) { return m.photo ? `<img src="${IMG.get(m.photo) || ''}" alt="">` : modelSVG(m.kind); }
/* 몸의 자리(머리 · 몸통 · 다리 · 발 · 손)에 옷을 얹음 — 실제 AI 착장 합성은 서버 연동 후 */
function modelBoard(items, m) {
  const by = {}; sortSlots(items.filter(Boolean)).forEach(it => { const sl = it.cat === '모자' ? 'hat' : it.cat === '시계' ? 'watch' : slotOf(it); if (!by[sl]) by[sl] = it; });
  const P = { hat: [34, 0, 32, 12, 6], outer: [20, 17, 60, 40, 4], top: by.outer ? [30, 21, 40, 26, 3] : [24, 18, 52, 32, 3], dress: [22, 18, 56, 60, 3], bottom: [27, 46, 46, 50, 2], shoes: [28, 90, 44, 10, 5], bag: [66, 48, 28, 22, 6], watch: [14, 52, 11, 8, 6], acc: [40, 26, 20, 10, 6] };
  return `<div class="board mboard">${m.photo ? `<img class="mdl-photo" src="${IMG.get(m.photo) || ''}" alt="">` : modelSVG(m.kind)}
    ${Object.entries(by).map(([sl, it]) => { const p = P[sl]; return p ? `<div class="bitem" style="left:${p[0]}%;top:${p[1]}%;width:${p[2]}%;height:${p[3]}%;z-index:${p[4]}">${itemArt(it)}</div>` : ''; }).join('')}
    <span class="mdl-tag">간이 착장</span></div>`;
}
A.aiModel = () => openSheet('model');
SHEETS.model = () => {
  const mine = Store.state.models || [], cur = ui.ai.model;
  return `<div class="sheet-body"><h3 class="sheet-title">${ic('user', 20)} 모델 사진 사용하기</h3>
    <p class="sub">내 전신 사진을 올리거나 가상 모델을 고르면, 추천 코디를 입혀서 보여드려요.</p>
    <label class="model-up mt12">${ic('camera', 20)} 내 사진 등록하기 <small>여러 장 가능</small><input type="file" accept="image/*" multiple hidden data-change="modelFiles"></label>
    <div class="model-grid mt12">${[...BUILTIN_MODELS, ...mine].map(m => `<div class="model-card ${cur === m.id ? 'on' : ''}" data-act="modelPick" data-arg="${m.id}">
      <div class="model-pic">${modelThumb(m)}</div><span>${esc(m.name)}</span>
      ${m.photo ? `<button class="x" data-act="modelDel" data-arg="${m.id}" aria-label="삭제">${ic('x', 11)}</button>` : ''}</div>`).join('')}</div>
    <p class="hint">정면 전신 사진이 잘 맞아요. 지금은 옷을 몸 위치에 얹어 보여주는 간이 미리보기이고, 실제 AI 착장 합성은 서버 연동 후 제공돼요.</p>
    <div class="row gap8 mt16"><button class="btn ghost flex1" data-act="modelPick" data-arg="">모델 없이 보기</button><button class="btn primary flex1" data-act="closeSheet">완료</button></div>
  </div>`;
};
A.modelFiles = async el => {
  const s = Store.state; s.models = s.models || [];
  for (const f of [...(el.files || [])].slice(0, 6)) {
    try { const id = uid('mdl'); IMG.put(id + 'p', await downscale(await fileToDataURL(f), 800)); s.models.push({ id, name: `내 사진 ${s.models.length + 1}`, photo: id + 'p' }); } catch (e) { toast('사진을 읽지 못했어요'); }
  }
  Store.save(); if (s.models.length) ui.ai.model = s.models[s.models.length - 1].id;
  renderOverlay(); render();
};
A.modelPick = id => { ui.ai.model = id || null; renderOverlay(); render(); };
A.modelDel = id => askConfirm('사진 삭제', '이 모델 사진을 삭제할까요?', '삭제', () => {
  const s = Store.state, m = modelById(id); if (m && m.photo) IMG.del(m.photo);
  s.models = (s.models || []).filter(x => x.id !== id); if (ui.ai.model === id) ui.ai.model = null; Store.save(); renderOverlay(); render();
}, true);

/* ---------- AI 코디 추천 상세 ---------- */
function detailInfoHtml(rec) {
  const saved = savedKeys().has(rec.key);
  return `<h2 class="h2">${esc(rec.title)}</h2>
    <div class="chips wrap mt8">${rec.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="reason mt12">${sparkle(16)}<p>${esc(rec.reason)}</p></div>
    ${rec.virtual.length ? `<div class="vlist mt12"><b>AI가 더한 아이템 <small>내 옷장에 없어요</small></b>${rec.virtual.map(v => `<div class="vrow"><div class="ithumb xs">${itemArt(v)}</div><span>${esc(v.name)}</span><button class="link sm" data-act="toastMsg" data-arg="코디SHOP에서 비슷한 상품을 찾아볼게요">비슷한 상품</button></div>`).join('')}</div>` : ''}
    ${famShareBtn(rec, (ui.results.ctx.owners || [])[0], 'recShareFam', '', true)}
    <div class="row gap8 mt16">
      <button class="btn outline" data-act="recToManual">${ic('edit', 16)} 직접 수정</button>
      <button class="btn primary flex1" data-act="recSave" ${saved ? 'disabled' : ''}>${ic('heartPlus', 18)} ${saved ? '코디북에 담았어요' : '이 코디 바로 담기'}</button>
    </div>
    <div class="row gap8 mt8">
      <button class="btn ghost flex1" data-act="recShare">${ic('share', 16)} 가족 공유</button>
      <button class="btn ghost flex1" data-act="recWear">${ic('calendar', 16)} 오늘 입기</button>
    </div>`;
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
/* 추천 코디를 가족에게 보내기: 코디북에 담고(이미 담았으면 그 코디로) 공유 창을 엶 */
A.recShare = () => {
  const r = curRec(); let c = Store.state.codis.find(x => x.key === r.key);
  if (!c) { c = saveRec(r); $('#detInfo').innerHTML = detailInfoHtml(r); }
  A.codiShare(c.id);
};
A.recWear = () => {
  const r = curRec(); const s = Store.state;
  let c = s.codis.find(x => x.key === r.key);
  if (!c) c = saveRec(r);
  c.date = dayKey(Date.now());
  c.items.forEach(id => { const it = itemById(id); if (it) it.wear = (it.wear || 0) + 1; });
  Store.save(); $('#detInfo').innerHTML = detailInfoHtml(r);
  toast('오늘의 코디로 기록했어요 · 코디 히스토리에서 볼 수 있어요');
};
A.recToManual = () => {
  manualPreload(curRec().items.filter(i => !i.virtual).map(i => i.id));
  const fam = famTarget(ui.results.ctx.owners); if (fam) Object.assign(ui.manual, { forFam: fam, owner: fam });
  go('manual');
};

/* ---------- 직접 조합 ---------- */
function manualPreload(ids, layout = {}) {
  const M = ui.manual; M.slots = {}; M.acc = []; M.editId = null; M.forFam = null; M.layout = { ...layout };
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
    <div class="chips scroll-x pad mt8">${owners.map(f => chip(`<i class="fdot" style="background:${famColor(f.id)}"></i>${esc(f.name)}`, M.owner === f.id, 'manOwner', f.id, 'xs fam-chip')).join('')}</div>
  </div>`;
}
function manualLeftHtml() {
  const items = manualItems(), M = ui.manual;
  return `<div class="man-board">
      ${items.length ? board(items, { cls: 'edit', layout: M.layout }) : `<div class="board empty-board">${ic('hanger', 28)}<span>오른쪽에서<br>옷을 골라 주세요</span></div>`}
      <button class="man-zoom" data-act="manBig" aria-label="${M.big ? '작게 보기' : '크게 보기'}">${ic(M.big ? 'shrink' : 'expand', 16)}</button>
    </div>
    ${items.length ? `<p class="hint center m0 mt6">${ic('hand', 12)} 옷을 끌어서 위치를 옮길 수 있어요${Object.keys(M.layout).length ? ' · <button class="link sm" data-act="manLayoutReset">원래대로</button>' : ''}</p>` : ''}
    <div class="man-list">${items.map(it => `<div class="man-it"><span>${esc(SLOT_LABEL[slotOf(it)])}</span><b>${esc(it.name)}</b><button class="x" data-act="manualToggle" data-arg="${it.id}">${ic('x', 11)}</button></div>`).join('')}</div>
    <button class="btn primary block mt8" data-act="manualDone" ${items.length ? '' : 'disabled'}>코디완료</button>
    ${items.length ? '<button class="link sm mt8" data-act="manualClear">모두 비우기</button>' : ''}`;
}
function manualPickHtml() {
  const M = ui.manual;
  const sel = new Set([...Object.values(M.slots), ...M.acc]);
  const list = Store.state.items.filter(i => i.cat === M.cat && (M.owner === 'all' || i.owner === M.owner));
  if (!list.length) return emptyState(`${esc(M.cat)}이(가) 없어요`, `<button class="btn sm ghost" data-act="regStart">${ic('plus', 14)} 등록</button>`);
  return `<div class="igrid ${M.big ? 'c1' : 'c2'} tight">${list.map(it => `<div class="icard c2 pk ${sel.has(it.id) ? 'sel' : ''}" data-act="manualToggle" data-arg="${it.id}">
    <div class="ithumb">${itemArt(it)}<span class="selmark">${ic('check', 13)}</span>${it.status !== '사용 가능' ? `<span class="badge st">${esc(it.status)}</span>` : ''}</div><span class="iname sm">${esc(it.name)}</span></div>`).join('')}</div>`;
}
/* 위쪽 메뉴와 왼쪽 코디는 고정, 오른쪽 옷 목록만 스크롤 (남은 양은 오른쪽 막대로 표시)
   AI 코디 화면 안에서는 제목이 화면 위에 닿으면 그 자리에 고정됨 */
function manualPanel(embedded) {
  const M = ui.manual;
  return `<section class="man-panel ${embedded ? 'embedded' : ''} ${M.big ? 'big' : ''}">
    ${embedded ? `<div class="man-title pad"><h2 class="h2 row gap6">${ic('hanger', 18)} 직접 조합하기</h2></div>` : ''}
    ${manualTabsHtml()}
    <div class="man-wrap fill pad mt8">
      <div class="man-left">${manualLeftHtml()}</div>
      <div class="man-right-wrap"><div class="man-right" id="manPick">${manualPickHtml()}<div class="h24"></div></div><div class="sbar" id="manBar"><i></i></div></div>
    </div>
  </section>`;
}
function mountManual() {
  // AI 화면 안의 직접 조합: 높이를 화면(하단 메뉴 제외)에 딱 맞춰서, 끝까지 내리면 제목이 화면 위에 고정됨
  const pn = $('.man-panel.embedded');
  if (pn) { const sc = pn.closest('.scroll'); pn.style.height = Math.max(420, sc.clientHeight - parseFloat(getComputedStyle(sc).paddingBottom)) + 'px'; }
  bindScrollBar($('#manPick'), $('#manBar'));
  bindBoardDrag($('.man-board .board.edit'));
}
/* 코디 미리보기에서 옷을 끌어 위치 옮기기 → 코디에 함께 저장 */
function bindBoardDrag(bd) {
  if (!bd || bd._drag) return;
  bd._drag = true;
  let cur = null;
  bd.addEventListener('pointerdown', e => {
    const el = e.target.closest('.bitem'); if (!el) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    const r = bd.getBoundingClientRect();
    cur = { el, id: el.dataset.id, x0: e.clientX, y0: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top), w: r.width, h: r.height };
    el.classList.add('dragging');
  });
  bd.addEventListener('pointermove', e => {
    if (!cur) return;
    const dx = (e.clientX - cur.x0) / cur.w * 100, dy = (e.clientY - cur.y0) / cur.h * 100;
    cur.el.style.left = (cur.l + dx) + '%'; cur.el.style.top = (cur.t + dy) + '%';
    cur.dx = dx; cur.dy = dy;
  });
  const up = () => {
    if (!cur) return;
    cur.el.classList.remove('dragging');
    if (cur.dx || cur.dy) {
      const L = ui.manual.layout, d = L[cur.id] || { dx: 0, dy: 0 };
      // 세로 이동은 보드 좌표(가로 100 · 세로 115) 기준으로 저장
      L[cur.id] = { dx: +(d.dx + cur.dx).toFixed(1), dy: +(d.dy + cur.dy * 1.15).toFixed(1) };
      render();
    }
    cur = null;
  };
  bd.addEventListener('pointerup', up); bd.addEventListener('pointercancel', up);
}
SCREENS.manual = {
  render() {
    const M = ui.manual, f = M.forFam && famOf(M.forFam);
    const title = M.editId ? '코디 수정' : f ? `${esc(f.name)}님 코디 해주기` : '직접 조합';
    return `<div class="screen man-screen">
      ${topbar(title, { backBtn: true, right: weatherChip() + avatar() })}
      ${manualPanel(false)}
    </div>`;
  },
  mount() { mountManual(); },
};
A.manCat = c => { ui.manual.cat = c; render(); const p = $('#manPick'); if (p) p.scrollTop = 0; mountManual(); };
A.manOwner = o => { ui.manual.owner = o; render(); const p = $('#manPick'); if (p) p.scrollTop = 0; mountManual(); };
A.manBig = () => { ui.manual.big = !ui.manual.big; render(); };
A.manLayoutReset = () => { ui.manual.layout = {}; render(); };
A.manualClear = () => askConfirm('모두 비우기', '고른 옷을 모두 뺄까요?', '모두 비우기', () => { ui.manual.slots = {}; ui.manual.acc = []; ui.manual.layout = {}; render(); }, true);
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
    <div class="save-top">${board(items, { layout: M.layout })}<div class="flex1">
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
      <button class="btn primary flex1" data-act="codiSaveOk">${sh.share.length === 1 && sh.share[0] === M.forFam ? `${ic('send', 16)} ${esc(famOf(M.forFam).name)}한테 공유하기` : sh.share.length ? `저장하고 ${sh.share.length}명에게 보내기` : M.editId ? '수정 내용 저장' : '코디북에 저장'}</button>
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
  const layout = {}; items.forEach(it => { if (M.layout[it.id]) layout[it.id] = M.layout[it.id]; });
  const fields = { key: items.map(i => i.id).sort().join(','), name, items: items.map(i => i.id), date: sh.date || null, fav: sh.fav, tags, sharedWith: [...sh.share], layout };
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
  Object.assign(ui.manual, { slots: {}, acc: [], editId: null, forFam: null, owner: 'me', layout: {} });
  ui.cb.tab = 'mine'; ui.cb.panel = 'manual';
  if (toMy) back('my'); else go('codibook', null, { replace: true });
};

/* ---------- 코디 상세 시트 (저장된 코디) ---------- */
A.openCodi = id => { const c = findCodi(id); if (c && c.from && !c.seen) { c.seen = true; Store.save(); } openSheet('codi', { id }); };
SHEETS.codi = sh => {
  const c = Store.state.codis.find(x => x.id === sh.id); if (!c) return '<div class="sheet-body">삭제된 코디예요.</div>';
  const items = codiItems(c);
  return `<div class="sheet-body">
    <div class="row between"><div><h2 class="h2">${esc(c.name)}</h2><p class="sub">${c.from ? `${esc(famOf(c.from).name)}님이 보낸 코디 · ` : ''}${c.date ? `${fmtDate(c.date)} 착용` : '아직 입지 않았어요'}</p></div>
      <button class="fav-lg ${c.fav ? 'on' : ''}" data-act="codiFav" data-arg="${c.id}">${ic('heart', 22)}</button></div>
    <div class="codi-big mt12">${board(items, { cls: 'tall', layout: c.layout })}</div>
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
A.codiFav = id => { const c = findCodi(id); c.fav = !c.fav; Store.save(); renderOverlay(); render();  if (c.fav) popHeart(`[data-act="codiFav"][data-arg="${id}"]`); };
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
A.codiEdit = id => { const c = findCodi(id); manualPreload(c.items, c.layout); closeAllSheets(); go('manual'); };
A.codiDel = id => askConfirm('코디 삭제', '이 코디를 삭제할까요? 되돌릴 수 없어요.', '삭제', () => {
  Store.state.codis = Store.state.codis.filter(c => c.id !== id); Store.save(); closeAllSheets(); render();
}, true);

/* ---------- 코디북 ---------- */
function codiCard(c) {
  return `<div class="ccard" data-act="openCodi" data-arg="${c.id}">${codiBoard(c)}
    <button class="fav ${c.fav ? 'on' : ''}" data-act="codiFavQuick" data-arg="${c.id}">${ic('heart', 18)}</button>
    ${c.from ? `<span class="ai-tag">${ic('send', 10)} ${esc(famOf(c.from).name)}</span>` : c.source === 'ai' ? `<span class="ai-tag">${sparkle(10)} AI</span>` : ''}
    <b class="ctitle">${esc(c.name)}</b><span class="cdate">${c.date ? fmtDate(c.date) : '저장만 함'}</span></div>`;
}
A.codiFavQuick = id => { const c = findCodi(id); c.fav = !c.fav; Store.save(); $$(`[data-act="codiFavQuick"][data-arg="${id}"]`).forEach(b => b.classList.toggle('on', c.fav)); if (c.fav) popHeart(`[data-act="codiFavQuick"][data-arg="${id}"]`); };

SCREENS.codibook = {
  nav: 'codibook',
  render() {
    const B = ui.cb;
    return `<div class="screen has-nav"><div class="scroll">
      <header class="topbar pad"><div class="tb-left"><h1 class="tb-title">코디북</h1></div><div class="tb-right"><button class="icon-btn" data-act="go" data-arg="history" aria-label="히스토리">${ic('calendar', 22)}</button>${bellBtn()}${avatar()}</div></header>
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
    const manual = s.codis.filter(c => c.source === 'manual');
    return `
      <div class="pad mt16 act3">
        <button class="act-card ${B.panel === 'auto' ? 'on' : ''}" data-act="cbAuto">${ic('shuffle', 24)}<b>자동조합</b><span>16가지 한 번에</span></button>
        <button class="act-card ${B.panel === 'manual' ? 'on' : ''}" data-act="cbManual">${ic('hanger', 24)}<b>직접조합</b><span>내가 만든 코디 ${manual.length}</span></button>
        <button class="act-card" data-act="go" data-arg="ask">${ic('chat', 24)}<b>코디묻기</b><span>AI에게 물어보기</span></button>
      </div>
      ${B.panel === 'auto' && B.auto ? `<div class="pad mt16 panel-in"><div class="sec-head"><h2 class="h2">${sparkle(16)} 자동 조합 ${B.auto.length}개</h2><button class="link" data-act="cbPanelClose">접기</button></div>
        <div class="cgrid c4">${B.auto.map((r, i) => `<div class="ccard" data-act="cbAutoOpen" data-arg="${i}">${board(r.items)}${colorDots(r.items)}</div>`).join('')}</div>
        <button class="btn ghost block mt12" data-act="cbAutoMore">${ic('refresh', 16)} 16개 더 보기</button></div>` : ''}
      ${B.panel === 'manual' ? `<div class="pad mt16 panel-in"><div class="sec-head"><h2 class="h2">${ic('hanger', 16)} 직접 조합한 코디 <small>${manual.length}</small></h2><div class="row gap6"><button class="btn sm primary" data-act="go" data-arg="manual">${ic('plus', 14)} 조합하기</button><button class="link" data-act="cbPanelClose">접기</button></div></div>
        ${manual.length ? `<div class="cgrid c4">${manual.map(c => `<div class="ccard" data-act="openCodi" data-arg="${c.id}">${codiBoard(c)}<span class="cdate center">${esc(c.name)}</span></div>`).join('')}</div>` : emptyState('아직 직접 조합한 코디가 없어요', `<button class="btn sm primary" data-act="go" data-arg="manual">조합하기</button>`)}</div>` : ''}

      <div class="pad mt24"><div class="sec-head"><h2 class="h2">${ic('users', 18)} 가족 옷 섞어 입기</h2><span class="hint m0">${B.mix.length}벌</span></div>
        <p class="sub sm">가족 옷장에서 한 벌씩 골라 함께 코디해 보세요.</p>
        ${B.mix.map((m, k) => {
          const it = m.id && itemById(m.id);
          return `<div class="mix-row mt8" style="--c:${famColor(m.owner)}">
            <div class="mix-slot" data-act="mixOpen" data-arg="${k}">${it ? `<div class="ithumb">${itemArt(it)}</div>` : `<div class="ithumb empty">${ic('plus', 20)}</div>`}<span class="own-badge">${esc(famOf(m.owner).name)}</span></div>
            <div class="flex1"><span class="step">${k + 1}번째 옷 ${it ? `· <b>${esc(it.name)}</b> <small>${esc(it.loc)}</small>` : ''}</span>
              <div class="chips scroll-x mt6">${Store.state.family.map(f => chip(`<i class="fdot" style="background:${famColor(f.id)}"></i>${esc(f.label)}`, m.owner === f.id, 'mixOwner', `${k}|${f.id}`, 'xs fam-chip')).join('')}</div></div>
            ${B.mix.length > 2 ? `<button class="mix-x" data-act="mixDel" data-arg="${k}" aria-label="빼기">${ic('x', 14)}</button>` : ''}
          </div>`;
        }).join('')}
        ${B.mix.length < 6 ? `<button class="mix-add mt8" data-act="mixAdd">${ic('plus', 16)} 옷 한 벌 더 추가</button>` : ''}
        <button class="btn outline block mt12" data-act="mixGo" ${B.mix.some(m => m.id) ? '' : 'disabled'}>${ic('hanger', 16)} 이 옷들로 직접 조합하기</button>
      </div>

      <div class="pad mt24"><div class="sec-head"><h2 class="h2">저장한 코디 <small>${s.codis.length}</small></h2><button class="more" data-act="go" data-arg="history">히스토리 ${ic('chevR', 14)}</button></div>
        <div class="chips">${[['all', '전체'], ['fav', '♥ 즐겨찾기'], ['shared', '공유']].map(([k, l]) => chip(l, B.filter === k, 'cbFilter', k, 'sm')).join('')}</div>
        <div class="mt12">${list.length ? `<div class="cgrid c2">${list.map(codiCard).join('')}</div>` : emptyState('저장한 코디가 없어요')}</div>
      </div>`;
  },
  market() {
    const s = Store.state;
    const mySales = sortedSales(s.sales.map(x => ({ ...x, it: itemById(x.itemId) })).filter(x => x.it));
    return `
      <div class="mt16"><div class="sec-head pad"><h2 class="h2">다른 사람의 코디</h2><span class="hint m0">밀어서 더 보기 ${ic('chevR', 12)}</span></div>
        <div class="hscroll pad mk-row">${MARKET.codis.map(m => `<div class="mk-codi" data-act="openProd" data-arg="codi|${m.id}">
          <div class="mk-img">${board(m.items.map((x, i) => ({ ...x, id: m.id + i, colorName: nearestColor(x.color).name })), { badge: false })}${likeBtn('codi:' + m.id)}</div>
          <div class="row between mt6"><b>${esc(m.title)}</b><span class="likes">${ic('heart', 13, 'filled')} ${m.likes + (liked('codi:' + m.id) ? 1 : 0)}</span></div>
          <span class="sub sm">@${esc(m.user)}</span>
          <button class="btn sm ${activeReq(m.id) ? 'asking' : 'light'} block mt6" data-act="codiAsk" data-arg="${m.id}">${ic('chat', 14)} 거래문의${activeReq(m.id) ? ' 중' : ''}</button>
        </div>`).join('')}</div>
      </div>
      <div class="pad mt24"><div class="market-zone">
        <div class="sec-head"><h2 class="h2">${ic('tag', 18)} 내가 올린 코디</h2><button class="btn sm light" data-act="saleNew">${ic('plus', 14)} 올리기</button></div>
        ${mySales.length > 1 ? `<div class="chips mb12">${SALE_SORTS.map(([k, l]) => chip(l, (ui.cb.saleSort || 'recent') === k, 'saleSort', k, 'xs')).join('')}</div>` : ''}
        ${mySales.length ? `<div class="grid g2 prod-grid">${mySales.map(x => { const chats = saleChats(x.it); return `<div class="prod">
          <button class="ithumb" data-act="openProd" data-arg="sale|${x.itemId}">${itemArt(x.it)}<span class="badge new">판매 중</span></button>
          <b>${esc(x.it.name)}</b><span class="price">${won(x.price)}</span><span class="sub sm clamp1">${esc(x.desc || x.it.loc)}</span><span class="sale-meta">${ic('eye', 12)} 조회 ${x.views || 0}</span>
          <div class="inq">${chats.length ? `${chats.slice(0, 3).map(m => `<button class="inq-av ${m.unread ? 'new' : ''}" data-act="openThread" data-arg="${m.id}" title="${esc(m.with)}">${esc(m.with.slice(0, 1))}</button>`).join('')}
            <button class="inq-more" data-act="saleChats" data-arg="${x.itemId}" aria-label="문의 모두 보기">${chats.length > 3 ? `+${chats.length - 3}` : ic('more', 14)}</button><span class="inq-n">문의 ${chats.length}</span>` : '<span class="inq-n">아직 문의가 없어요</span>'}</div>
        </div>`; }).join('')}</div>` : emptyState('판매 중인 옷이 없어요', `<button class="btn sm primary" data-act="saleNew">옷 올리기</button>`)}
      </div></div>
      <div class="pad mt16"><div class="market-zone new">
        <div class="sec-head"><h2 class="h2">${ic('store', 18)} 새상품 판매</h2><span class="hint m0">공식 입점</span></div>
        <div class="grid g2 prod-grid">${MARKET.fresh.map(p => `<div class="prod">
          <button class="ithumb" data-act="openProd" data-arg="fresh|${p.id}">${itemArt(p)}</button>${likeBtn('fresh:' + p.id)}
          <span class="brand">${esc(p.brand)}</span><b>${esc(p.name)}</b><span class="price">${won(p.price)}</span>
          <button class="btn sm primary block mt6" data-act="buy" data-arg="${p.id}">${ic('bag', 14)} 구매하기</button>
        </div>`).join('')}</div>
      </div></div>`;
  },
};
A.cbTab = t => { ui.cb.tab = t === '내 코디북' ? 'mine' : 'market'; render(); };
A.cbFilter = f => { ui.cb.filter = f; render(); };
A.cbAuto = () => { const B = ui.cb; if (B.panel === 'auto') { B.panel = null; render(); return; } B.auto = recommend({ aiExtra: false, style: '캐주얼' }, 16); B.panel = 'auto'; render(); };
A.cbManual = () => { ui.cb.panel = ui.cb.panel === 'manual' ? null : 'manual'; render(); };
A.cbPanelClose = () => { ui.cb.panel = null; render(); };
A.cbAutoMore = () => { const ex = new Set(ui.cb.auto.map(r => r.key)); const more = recommend({ aiExtra: false, style: '캐주얼' }, 16, ex); if (!more.length) toast('더 만들 수 있는 조합이 없어요'); ui.cb.auto = [...ui.cb.auto, ...more]; render(); };
A.cbAutoOpen = i => openResults(ui.cb.auto, { aiExtra: false, style: '캐주얼' }, Number(i));
A.mixOwner = arg => { const [k, id] = arg.split('|'); const m = ui.cb.mix[k]; if (m.owner !== id) { m.owner = id; m.id = null; } render(); A.mixOpen(k); };
A.mixOpen = k => {
  const m = ui.cb.mix[k], f = famOf(m.owner);
  openPicker({
    mode: 'single', owner: m.owner, filters: true, tint: famColor(m.owner), title: `${f.label} 선택하기`, desc: '계절·색상으로 걸러서 한 벌을 골라 주세요.',
    onDone: ([id]) => { m.id = id; render(); },
  });
};
A.mixAdd = () => { const used = ui.cb.mix.map(m => m.owner); const f = Store.state.family.find(x => !used.includes(x.id)) || Store.state.family[0]; ui.cb.mix.push({ owner: f.id, id: null }); render(); };
A.mixDel = k => { ui.cb.mix.splice(Number(k), 1); render(); };
A.mixGo = () => { manualPreload(ui.cb.mix.map(m => m.id).filter(Boolean)); ui.manual.owner = 'all'; go('manual'); };

/* ---------- 코디SHOP: 하트 · 거래문의 · 상품 상세(오른쪽에서 나옴) ---------- */
function liked(key) { return (Store.state.likes || []).includes(key); }
function likeBtn(key) { return `<button class="fav ${liked(key) ? 'on' : ''}" data-act="like" data-arg="${key}" aria-label="좋아요">${ic('heart', 17)}</button>`; }
A.like = key => {
  const s = Store.state; s.likes = s.likes || [];
  const on = !liked(key);
  s.likes = on ? [...s.likes, key] : s.likes.filter(x => x !== key); Store.save();
  render(); if (topSheet()) renderOverlay();
  if (on) popHeart(`[data-act="like"][data-arg="${key}"]`);
};
function activeReq(target) { return Store.state.requests.find(r => r.target === target && r.status === '요청 중'); }
function saleChats(it) { return Store.state.messages.filter(m => m.sale && m.about === it.name).sort((a, b) => b.at - a.at); }
A.codiAsk = id => {
  const s = Store.state, m = MARKET.codis.find(x => x.id === id);
  if (!activeReq(id)) s.requests.unshift({ id: uid('rq'), target: id, status: '요청 중', at: Date.now() });
  const th = startThread(m.user, m.title);
  Store.save(); render(); A.openThread(th.id);
};
A.saleChats = itemId => openSheet('saleChats', { itemId });
SHEETS.saleChats = sh => {
  const it = itemById(sh.itemId), list = saleChats(it);
  return `<div class="sheet-body"><h3 class="sheet-title">${ic('chat', 20)} 문의한 사람 ${list.length}</h3><p class="sub">${esc(it.name)}</p>
    <div class="mylist mt12">${list.map(m => `<button class="mrow line" data-act="openThread" data-arg="${m.id}"><div class="fam-av">${esc(m.with.slice(0, 1))}</div>
      <div class="flex1"><b>${esc(m.with)}</b><span>${esc(m.msgs[m.msgs.length - 1].text)}</span></div>${m.unread ? '<i class="udot"></i>' : ''}</button>`).join('') || '<p class="sub">아직 문의가 없어요.</p>'}</div></div>`;
};
/* 내가 올린 코디 정렬: 최신 등록순 · 최신 대화순 · 최다 조회순 */
const SALE_SORTS = [['recent', '최신 등록순'], ['chat', '최신 대화순'], ['views', '최다 조회순']];
function sortedSales(list) {
  const k = ui.cb.saleSort || 'recent';
  const lastChat = x => Math.max(0, ...saleChats(x.it).map(m => m.at));
  return [...list].sort((a, b) => k === 'views' ? (b.views || 0) - (a.views || 0) : k === 'chat' ? lastChat(b) - lastChat(a) : (b.createdAt || 0) - (a.createdAt || 0));
}
A.saleSort = k => { ui.cb.saleSort = k; render(); };
A.saleNew = () => openPicker({
  mode: 'single', owner: 'me', title: '판매할 옷 선택하기', desc: '옷을 고르면 가격을 입력해요.',
  onDone: ([id]) => { if (Store.state.sales.some(x => x.itemId === id)) { toast('이미 판매 중인 옷이에요'); return; } A.sellItem(id); },
});
const PROD_DESC = {
  '신발': '발이 편한 쿠션 인솔과 가벼운 밑창으로 하루 종일 신기 좋아요.', '가방': '수납이 넉넉하고 어떤 코디에도 잘 어울리는 기본 디자인이에요.',
  '모자': '얼굴형을 가리지 않는 깊이로, 사계절 가볍게 쓰기 좋아요.', '시계': '데일리로 차기 좋은 사이즈와 생활 방수를 지원해요.',
};
A.openProd = arg => { const [kind, id] = arg.split('|'); openSheet('prod', { side: true, kind, id }); };
SHEETS.prod = sh => {
  const s = Store.state;
  if (sh.kind === 'codi') {
    const m = MARKET.codis.find(x => x.id === sh.id), key = 'codi:' + m.id;
    return `${sideHead(esc(m.title), `<button class="fav-lg ${liked(key) ? 'on' : ''}" data-act="like" data-arg="${key}">${ic('heart', 20)}</button>`)}
      <div class="sheet-body"><div class="codi-big">${board(m.items.map((x, i) => ({ ...x, id: m.id + i, colorName: nearestColor(x.color).name })), { badge: false, cls: 'tall' })}</div>
      <div class="row between mt12"><b class="h2">@${esc(m.user)}</b><span class="likes">${ic('heart', 14, 'filled')} ${m.likes + (liked(key) ? 1 : 0)}</span></div>
      <label class="field-label">이 코디의 옷</label>
      <div class="loc-list">${m.items.map(x => `<div class="lrow"><div class="ithumb xs">${itemArt(x)}</div><b>${esc(x.name)}</b><span>${esc(x.sub)}</span></div>`).join('')}</div>
      <button class="btn primary lg block mt16" data-act="codiAsk" data-arg="${m.id}">${ic('chat', 18)} 거래문의</button></div>`;
  }
  if (sh.kind === 'sale') {
    const it = itemById(sh.id), sale = s.sales.find(x => x.itemId === sh.id); if (!it || !sale) return `${sideHead('판매 상품')}<div class="sheet-body"><p class="sub">판매가 끝난 상품이에요.</p></div>`;
    const chats = saleChats(it);
    return `${sideHead('내 판매 상품', `<button class="icon-btn" data-act="saleEdit" data-arg="${it.id}" aria-label="판매 수정">${ic('edit', 20)}</button><button class="icon-btn danger-t" data-act="sellItem" data-arg="${it.id}" aria-label="판매 취소">${ic('trash', 20)}</button>`)}
      <div class="sheet-body"><div class="prod-hero">${itemArt(it)}</div>
      <span class="brand mt12">${esc(it.cat)} · ${esc(it.sub)} · ${esc(it.size || '')}</span><h2 class="h2">${esc(it.name)}</h2><b class="price big">${won(sale.price)}</b>
      <p class="sub mt8">${esc(sale.desc || '상태 좋은 옷이에요.')}</p>
      <label class="field-label">문의 ${chats.length}</label>
      <div class="mylist">${chats.map(m => `<button class="mrow line" data-act="openThread" data-arg="${m.id}"><div class="fam-av">${esc(m.with.slice(0, 1))}</div><div class="flex1"><b>${esc(m.with)}</b><span>${esc(m.msgs[m.msgs.length - 1].text)}</span></div>${m.unread ? '<i class="udot"></i>' : ''}</button>`).join('') || '<p class="sub">아직 문의가 없어요.</p>'}</div></div>`;
  }
  const p = MARKET.fresh.find(x => x.id === sh.id), key = 'fresh:' + p.id;
  return `${sideHead(esc(p.brand), `<button class="fav-lg ${liked(key) ? 'on' : ''}" data-act="like" data-arg="${key}">${ic('heart', 20)}</button>`)}
    <div class="sheet-body"><div class="prod-hero">${itemArt(p)}</div>
    <span class="brand mt12">${esc(p.brand)}</span><h2 class="h2">${esc(p.name)}</h2><b class="price big">${won(p.price)}</b>
    <p class="sub mt8">${esc(PROD_DESC[p.cat] || '매일 입기 좋은 기본 아이템이에요.')}</p>
    <div class="kv mt16"><div><span>배송</span><b>무료배송 · 1~2일 내 출발</b></div><div><span>교환</span><b>수령 후 7일 이내</b></div></div>
    <div class="row gap8 mt16"><button class="btn ghost flex1" data-act="buyGift" data-arg="${p.id}">${ic('send', 16)} 선물하기</button><button class="btn primary flex1" data-act="buy" data-arg="${p.id}">${ic('bag', 16)} 구매하기</button></div></div>`;
};
A.saleEdit = id => {
  const sale = Store.state.sales.find(x => x.itemId === id);
  askText('판매 가격 수정 (원)', String(sale.price), v => {
    const price = parseInt(v.replace(/[^0-9]/g, ''), 10); if (!price) { toast('가격을 숫자로 입력해 주세요'); return; }
    sale.price = price; Store.save(); renderOverlay(); render(); toast('판매 가격을 바꿨어요');
  }, String(sale.price));
};

/* 새상품 구매: 배송받기 / 선물하기 */
A.buy = id => openSheet('buy', { id, mode: '배송받기', f: {} });
A.buyGift = id => openSheet('buy', { id, mode: '선물하기', f: {} });
SHEETS.buy = sh => {
  const p = MARKET.fresh.find(x => x.id === sh.id), f = sh.f;
  const inp = (k, label, ph, type = 'text') => `<label class="field-label">${label}</label><input class="input" data-bf="${k}" type="${type}" value="${esc(f[k] || '')}" placeholder="${ph}">`;
  return `<div class="sheet-body">
    <h3 class="sheet-title">${ic('bag', 20)} 구매하기</h3>
    <div class="lrow mt8"><div class="ithumb xs">${itemArt(p)}</div><b>${esc(p.name)}<small class="brand-s">${esc(p.brand)}</small></b><span class="price">${won(p.price)}</span></div>
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
  Store.state.orders.unshift({ id: uid('od'), prodId: p.id, name: p.name, brand: p.brand, cat: p.cat, sub: p.sub, color: p.color, img: p.img, price: p.price, type: gift ? '선물' : '배송', to: f.name.trim(), addr: gift ? '' : `${f.addr} ${f.addr2 || ''}`.trim(), status: '결제 완료', at: Date.now() });
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
      ${cs.map(c => `<button class="hist-row" data-act="openCodi" data-arg="${c.id}"><div class="hist-date"><b>${Number(c.date.slice(8))}</b><span>${'일월화수목금토'[new Date(c.date).getDay()]}</span></div>${codiBoard(c)}<div class="flex1"><b>${esc(c.name)}</b><span class="sub sm">${codiItems(c).map(i => i.name).slice(0, 3).map(esc).join(' · ')}</span></div>${ic('chevR', 16)}</button>`).join('')}
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
      cells.push(`<button class="cal-c ${k === today ? 'today' : ''} ${H.day === k ? 'sel' : ''} ${cs ? 'has' : ''}" data-act="histDay" data-arg="${k}"><span>${d}</span>${cs ? codiBoard(cs[0], { badge: false }) : ''}</button>`);
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
