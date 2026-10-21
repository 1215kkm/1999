/* area — 옷 등록 (촬영 → 사진 편집 → 정보 입력 → 고급 설정) */

const MAX_PHOTOS = 5;
ui.reg = null;
ui.cam = { ratio: '916' };
let camStream = null;

function newDraft() {
  return {
    mode: 'new', id: null, photos: [], main: 0, useCut: true,
    cat: '상의', sub: '', seasons: [curSeason()], color: null, colorAuto: null, colorTouched: false, catTouched: false,
    name: '', loc: Store.state.locations[0], owner: 'me', size: '', styles: [], thickness: '보통', lining: '없음',
    ownership: '내 옷', status: '사용 가능', memo: '',
  };
}
function draftColorName(d) { return d.color ? nearestColor(d.color).name : ''; }
function autoName(d) { return `${draftColorName(d) || ''} ${d.sub || d.cat}`.trim(); }
function draftPhotoSrc(p, d) { return p ? (d.useCut && p.cut ? p.cut : p.orig) : null; }

A.regStart = () => { if (!ui.reg || ui.reg.mode === 'edit') ui.reg = newDraft(); openSheet('regSource'); };
SHEETS.regSource = () => {
  const n = ui.reg ? ui.reg.photos.length : 0;
  return `<div class="sheet-body">
    <h3 class="sheet-title">${n ? `사진 추가 (${n}/${MAX_PHOTOS})` : '새 옷 등록'}</h3>
    ${n ? '<p class="sub">다른 각도에서 찍은 사진을 추가하면 옷장에서 밀어서 볼 수 있어요.</p>' : ''}
    <button class="menu-row hl" data-act="regCamera">${ic('camera', 22)} 카메라로 촬영</button>
    <label class="menu-row">${ic('image', 22)} 앨범에서 선택<input type="file" accept="image/*" multiple hidden data-change="regFiles"></label>
    <button class="menu-row" data-act="regShop">${ic('link', 22)} 쇼핑몰에서 가져오기</button>
    ${n ? '' : `<button class="menu-row" data-act="regNoPhoto">${ic('edit', 22)} 사진 없이 등록</button>`}
    <button class="guide-link" data-act="guideSheet">${ic('info', 16)} 누끼가 잘 따지는 촬영 가이드 보기</button>
  </div>`;
};
SHEETS.guide = () => `<div class="sheet-body">
  <h3 class="sheet-title">${ic('camera', 20)} 누끼 잘 따는 촬영 가이드</h3>
  <ol class="guide">
    <li><b>단색 배경</b>에 옷을 펼쳐 주세요. 흰 침대 시트, 바닥, 벽이 좋아요.</li>
    <li>옷과 <b>배경의 색이 달라야</b> 경계를 정확히 찾아요. (흰 옷은 어두운 배경에)</li>
    <li>옷 <b>전체가 프레임 안에</b> 들어오게, 가장자리에 여백을 두세요.</li>
    <li>그림자가 생기지 않게 <b>밝고 고른 조명</b>에서 찍어요.</li>
    <li>구김을 펴고 <b>정면에서 수직</b>으로 찍으면 가장 깔끔해요.</li>
    <li>뒷면·옆면도 찍어 두면 옷장에서 <b>밀어서 다른 각도</b>로 볼 수 있어요.</li>
  </ol>
  <button class="btn primary block mt16" data-act="closeSheet">확인</button></div>`;
A.guideSheet = () => openSheet('guide');

A.regNoPhoto = () => { closeAllSheets(); go('regForm'); };
A.regCamera = () => { closeAllSheets(); go('camera'); };
A.regFiles = async el => {
  const files = [...(el.files || [])];
  if (!files.length) return;
  if (!ui.reg) ui.reg = newDraft();
  const room = MAX_PHOTOS - ui.reg.photos.length;
  if (room <= 0) { toast(`사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어요`); return; }
  if (files.length > room) toast(`최대 ${MAX_PHOTOS}장까지라 ${room}장만 추가했어요`);
  for (const f of files.slice(0, room)) {
    try { ui.reg.photos.push({ orig: await downscale(await fileToDataURL(f)) }); } catch (e) { toast('사진을 읽지 못했어요'); }
  }
  ui.reg.main = ui.reg.photos.length - 1;
  closeAllSheets();
  if (ui.route.name !== 'regEdit') go('regEdit'); else render();
  processDraft();
};
A.regShop = () => openSheet('shop');
SHEETS.shop = () => `<div class="sheet-body">
  <h3 class="sheet-title">${ic('link', 20)} 쇼핑몰에서 가져오기</h3>
  <p class="sub">상품 이미지 주소를 붙여넣어 주세요. (이미지 위에서 길게 눌러 '이미지 주소 복사')</p>
  <input class="input mt12" id="shopUrl" placeholder="https://...jpg">
  <button class="btn primary block mt12" data-act="shopLoad">불러오기</button></div>`;
A.shopLoad = async () => {
  const url = ($('#shopUrl').value || '').trim();
  if (!/^https?:\/\//.test(url)) { toast('http로 시작하는 이미지 주소를 넣어 주세요'); return; }
  toast('이미지를 불러오는 중…');
  try {
    const data = await downscale(url);
    if (!ui.reg) ui.reg = newDraft();
    ui.reg.photos.push({ orig: data }); ui.reg.main = ui.reg.photos.length - 1;
    closeAllSheets(); go('regEdit'); processDraft();
  } catch (e) {
    toast('이 쇼핑몰은 이미지 가져오기를 막고 있어요. 사진을 저장한 뒤 앨범에서 선택해 주세요.');
  }
};

/* 배경 제거 · 색상/종류 자동 인식 */
async function processDraft() {
  const d = ui.reg; if (!d || d.processing) return;
  d.processing = true;
  for (const p of d.photos) {
    if (p.cut || p.failed) continue;
    rerenderReg();
    try {
      const r = await removeBg(p.orig);
      if (r) { p.cut = r.url; p.ratio = r.h / r.w; } else p.failed = true;
    } catch (e) { p.failed = true; }
  }
  d.processing = false;
  const first = d.photos[0];
  if (first) {
    try {
      const c = await dominantColor(first.cut || first.orig);
      d.colorAuto = c.hex;
      if (!d.colorTouched) d.color = c.hex;
    } catch (e) { /* 색상 인식 실패 시 수동 선택 */ }
    if (!d.catTouched && first.ratio) {
      d.cat = first.ratio < 0.62 ? '신발' : first.ratio > 1.45 ? '하의' : '상의';
      d.sub = '';
    }
  }
  if (d.photos.some(p => p.failed && !p.warned)) { d.photos.forEach(p => { p.warned = true; }); toast('일부 사진은 배경을 깔끔하게 지우지 못했어요. 단색 배경에서 찍어 보세요.'); }
  rerenderReg();
}
function rerenderReg() { if (['regEdit', 'regForm', 'regAdvanced'].includes(ui.route.name)) render(); }

/* ---------- 카메라 ---------- */
SCREENS.camera = {
  render() {
    const r = ui.cam.ratio, n = ui.reg ? ui.reg.photos.length : 0;
    return `<div class="screen cam">
      <video id="camVideo" playsinline autoplay muted></video>
      <div class="cam-top">
        <button class="cam-ic" data-act="camClose" aria-label="닫기">${ic('x', 24)}</button>
        <div class="cam-guide">옷 전체가 보이게 찍어주세요</div>
        <button class="cam-ic" data-act="guideSheet" aria-label="촬영 가이드">${ic('info', 22)}</button>
      </div>
      <div class="cam-frame r${r}" id="camFrame"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>
        <div class="cam-msg" id="camMsg"></div></div>
      <div class="cam-bottom">
        <div class="ratio">${[['916', '9:16'], ['169', '16:9']].map(([k, l]) => `<button class="${r === k ? 'on' : ''}" data-act="camRatio" data-arg="${k}">${l}</button>`).join('')}</div>
        <div class="cam-ctrls">
          <label class="cam-side" aria-label="앨범">${ic('image', 24)}<input type="file" accept="image/*" multiple hidden data-change="regFiles"></label>
          <button class="shutter" data-act="camShoot" aria-label="촬영"></button>
          <button class="cam-side txt" data-act="camDone" ${n ? '' : 'disabled'}>${n ? `완료<br><small>${n}/${MAX_PHOTOS}</small>` : `<small>0/${MAX_PHOTOS}</small>`}</button>
        </div>
      </div>
      <div class="cam-flash" id="camFlash"></div>
    </div>`;
  },
  mount() { startCamera(); },
  unmount() { stopCamera(); },
};
async function startCamera() {
  const v = $('#camVideo'); if (!v) return;
  const msg = $('#camMsg');
  const fail = () => { if (msg) msg.innerHTML = `카메라를 사용할 수 없어요.<br><label class="btn sm light mt8">${ic('camera', 16)} 기본 카메라로 찍기<input type="file" accept="image/*" capture="environment" hidden data-change="regFiles"></label>`; };
  if (camStream) { v.srcObject = camStream; return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { fail(); return; }
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    if (ui.route.name !== 'camera') { stopCamera(); return; }
    const v2 = $('#camVideo'); if (v2) v2.srcObject = camStream;
  } catch (e) { fail(); }
}
function stopCamera() { if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } }
A.camClose = () => { stopCamera(); if (ui.reg && ui.reg.photos.length) go('regEdit', null, { replace: true }); else back(); };
A.camRatio = r => { ui.cam.ratio = r; render(); };
A.camDone = () => { go('regEdit', null, { replace: true }); };
A.camShoot = () => {
  const v = $('#camVideo');
  if (!v || !v.videoWidth) { toast('카메라가 준비되지 않았어요'); return; }
  if (!ui.reg) ui.reg = newDraft();
  if (ui.reg.photos.length >= MAX_PHOTOS) { toast(`사진은 최대 ${MAX_PHOTOS}장까지예요`); return; }
  const aspect = ui.cam.ratio === '916' ? 9 / 16 : 16 / 9;
  let sw = v.videoWidth, sh = v.videoHeight;
  if (sw / sh > aspect) sw = sh * aspect; else sh = sw / aspect;
  const sx = (v.videoWidth - sw) / 2, sy = (v.videoHeight - sh) / 2;
  const scale = Math.min(1, 1000 / Math.max(sw, sh));
  const c = document.createElement('canvas'); c.width = Math.round(sw * scale); c.height = Math.round(sh * scale);
  c.getContext('2d').drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
  ui.reg.photos.push({ orig: c.toDataURL('image/jpeg', 0.88) });
  ui.reg.main = ui.reg.photos.length - 1;
  const f = $('#camFlash'); if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  processDraft();
  if (ui.reg.photos.length === 1) setTimeout(() => go('regEdit', null, { replace: true }), 180);
  else render();
};

/* ---------- 사진 편집 ---------- */
SCREENS.regEdit = {
  render() {
    const d = ui.reg;
    if (!d) return SCREENS.regForm.render();
    const p = d.photos[d.main];
    const src = draftPhotoSrc(p, d);
    const busy = p && !p.cut && !p.failed;
    return `<div class="screen"><div class="scroll">
      ${topbar('사진 편집', { backBtn: true, right: p ? `<button class="link" data-act="regRetake">다시 촬영 ${ic('refresh', 14)}</button>` : '' })}
      <div class="pad">
        ${seg(['원본', '배경 제거'], d.useCut ? '배경 제거' : '원본', 'regUseCut')}
        <div class="preview ${d.useCut && p && p.cut ? 'checker' : ''} mt12">
          ${src ? `<img src="${src}" alt="">` : emptyState('사진이 없어요')}
          ${busy ? `<div class="busy"><span class="spin"></span>배경을 지우는 중…</div>` : ''}
          ${p && p.failed && d.useCut ? '<div class="busy light">배경 제거가 어려운 사진이에요 · 원본으로 저장돼요</div>' : ''}
          <button class="pv-name" data-act="go" data-arg="regForm">${esc(d.name || autoName(d))} ${ic('edit', 13)}</button>
        </div>
        <div class="thumbs mt12">
          ${d.photos.map((ph, i) => `<div class="th ${i === d.main ? 'on' : ''}" data-act="regMain" data-arg="${i}"><img src="${draftPhotoSrc(ph, d)}" alt=""><button class="x" data-act="regDelPhoto" data-arg="${i}">${ic('x', 11)}</button>${i === 0 ? '<span>대표</span>' : ''}</div>`).join('')}
          ${d.photos.length < MAX_PHOTOS ? `<button class="th add" data-act="regAddPhoto">${ic('plus', 18)}<small>${d.photos.length}/${MAX_PHOTOS}</small></button>` : ''}
        </div>
        <p class="hint">앞·뒤·옆 사진을 추가하면 옷장에서 밀어서 볼 수 있어요. 첫 번째 사진이 대표 사진이에요.</p>
        <div class="row between mt16"><span class="field-label m0">자동으로 채웠어요</span><button class="link" data-act="go" data-arg="regForm">수정</button></div>
        <div class="chips wrap mt8">
          ${d.color ? `<span class="chip static"><i class="dot" style="background:${d.color}"></i>${esc(draftColorName(d))}</span>` : '<span class="chip static muted">색상 인식 중…</span>'}
          <span class="chip on static">${esc(d.cat)}</span>
          ${d.seasons.map(x => `<span class="chip on static">${x}</span>`).join('')}
        </div>
      </div>
      <div class="sticky-cta"><button class="btn primary lg block" data-act="go" data-arg="regForm">다음</button></div>
    </div></div>`;
  },
};
A.regUseCut = v => { ui.reg.useCut = v === '배경 제거'; render(); };
A.regMain = i => { ui.reg.main = Number(i); render(); };
A.regDelPhoto = i => {
  const d = ui.reg; d.photos.splice(Number(i), 1);
  d.main = Math.min(d.main, Math.max(0, d.photos.length - 1));
  render();
};
A.regAddPhoto = () => openSheet('regSource');
A.regRetake = () => { const d = ui.reg; d.photos.splice(d.main, 1); d.main = Math.max(0, d.photos.length - 1); go('camera', null, { replace: true }); };

/* ---------- 정보 입력 ---------- */
SCREENS.regForm = {
  render() {
    if (!ui.reg) ui.reg = newDraft();
    const d = ui.reg, s = Store.state;
    const p = d.photos[0];
    const colors = [...new Set([d.colorAuto, ...s.recentColors].filter(Boolean))].slice(0, 7);
    if (d.color && !colors.includes(d.color)) colors.unshift(d.color);
    const summary = [d.loc, d.status, famOf(d.owner).name === '나' ? '내 소유' : famOf(d.owner).name + ' 소유', d.size, d.memo ? '메모' : ''].filter(Boolean).join(' · ');
    return `<div class="screen"><div class="scroll">
      <header class="topbar pad">
        <div class="tb-left"><h1 class="tb-title">${d.mode === 'edit' ? '옷 정보 수정' : '새 옷 등록'}</h1><button class="guide-chip" data-act="guideSheet" aria-label="촬영 가이드">${ic('hanger', 18)}</button></div>
        <div class="tb-right"><button class="icon-btn" data-act="regCancel">${ic('x', 24)}</button></div>
      </header>
      <div class="pad">
        <div class="photo-strip">
          ${p ? `<button class="ps-main ${d.useCut && p.cut ? 'checker' : ''}" data-act="go" data-arg="regEdit"><img src="${draftPhotoSrc(p, d)}" alt=""><span>${d.photos.length}장 · 편집</span></button>`
        : `<button class="ps-empty" data-act="regAddPhoto">${ic('camera', 22)}<b>옷 사진 추가</b><small>JPG · PNG · WebP, 최대 ${MAX_PHOTOS}장</small></button>`}
          <button class="guide-btn" data-act="guideSheet">${ic('info', 16)} 누끼 잘 따는<br>촬영 가이드</button>
        </div>

        <label class="field-label">종류 <em>필수</em></label>
        <div class="grid6">${s.categories.map(c => chip(esc(c), d.cat === c, 'regCat', c, 'sm')).join('')}<button class="chip sm dashed" data-act="addCategory" aria-label="종류 추가">${ic('plus', 14)}</button></div>

        <label class="field-label">계절 <small>여러 개 선택 가능</small></label>
        <div class="chips">${SEASONS.map(x => chip(x, d.seasons.includes(x), 'regSeason', x)).join('')}</div>

        <label class="field-label">대표 색상 <small>${d.colorAuto ? '사진에서 자동 선택됨 · 바꿀 수 있어요' : '자주 쓰는 색'}</small></label>
        <div class="swatches">${colors.map(h => `<button class="sw ${d.color === h ? 'on' : ''}" data-act="regColor" data-arg="${h}" title="${esc(nearestColor(h).name)}"><i style="background:${h}"></i></button>`).join('')}<button class="sw add" data-act="colorSheet" aria-label="색상 더보기">${ic('plus', 16)}</button></div>
        ${d.color ? `<p class="hint">${esc(draftColorName(d))} ${d.color}</p>` : ''}

        <label class="field-label">옷 이름 <small>비우면 자동으로 지어져요</small></label>
        <input class="input" placeholder="예) ${esc(autoName(d) || '베이지 코튼 셔츠')}" value="${esc(d.name)}" data-in="regName" maxlength="30">

        <label class="field-label">보관 위치</label>
        <div class="loc-tiles">${s.locations.map(l => `<button class="loc-tile ${d.loc === l ? 'on' : ''}" data-act="regLoc" data-arg="${esc(l)}">${ic(locIcon(l), 22)}<span>${esc(l)}</span></button>`).join('')}<button class="loc-tile dashed" data-act="addLocation">${ic('plus', 20)}<span>추가</span></button></div>

        <label class="field-label">소유 <small>연동된 가족 옷도 대신 등록할 수 있어요</small></label>
        <div class="chips wrap">${s.family.map(f => chip(f.id === 'me' ? '나' : esc(f.name), d.owner === f.id, 'regOwner', f.id)).join('')}</div>

        <button class="detail-row mt16" data-act="go" data-arg="regAdvanced">
          <div><b>상세 정보 <small>선택</small></b><span>${esc(summary)}</span></div>${ic('chevR', 18)}
        </button>
        <div class="h24"></div>
      </div>
      <div class="sticky-cta"><button class="btn green lg block" data-act="regSave">${d.mode === 'edit' ? '수정 내용 저장' : '내 옷장에 저장'}</button></div>
    </div></div>`;
  },
};
A.regCat = c => { const d = ui.reg; d.cat = c; d.sub = ''; d.catTouched = true; render(); };
A.regSeason = x => { const a = ui.reg.seasons; const i = a.indexOf(x); if (i >= 0) a.splice(i, 1); else a.push(x); render(); };
A.regColor = h => { ui.reg.color = h; ui.reg.colorTouched = true; render(); };
A.regName = v => { ui.reg.name = v; };
A.regLoc = l => { ui.reg.loc = l; render(); };
A.regOwner = o => { ui.reg.owner = o; render(); };
A.regCancel = () => {
  const d = ui.reg;
  if (d && d.mode === 'new' && d.photos.length) askConfirm('등록 취소', '입력한 내용이 사라져요. 등록을 취소할까요?', '취소하기', () => { ui.reg = null; go('closet', null, { replace: true }); }, true);
  else { ui.reg = null; back('closet'); }
};

function rememberColor(hex) {
  const a = Store.state.recentColors.filter(h => h !== hex);
  a.unshift(hex); Store.state.recentColors = a.slice(0, 8); Store.save();
}
A.colorSheet = () => openSheet('color');
SHEETS.color = () => {
  const cur = ui.reg.color || '#9CA3AF';
  return `<div class="sheet-body"><h3 class="sheet-title">대표 색상</h3><p class="sub">고른 색은 자주 쓰는 색으로 추가돼요.</p>
    <div class="palette mt12">${COLORS.map(c => `<button class="pal ${ui.reg.color === c.hex ? 'on' : ''}" data-act="pickColor" data-arg="${c.hex}"><i style="background:${c.hex}"></i><span>${c.name}</span></button>`).join('')}</div>
    <label class="custom-color mt16">${ic('eyedrop', 18)}<span>색상 자유 선택</span><input type="color" value="${cur}" data-change="pickColorInput"><i style="background:${cur}"></i></label>
  </div>`;
};
A.pickColor = h => { ui.reg.color = h; ui.reg.colorTouched = true; rememberColor(h); closeSheet(); render(); };
A.pickColorInput = el => { const h = el.value.toUpperCase(); ui.reg.color = h; ui.reg.colorTouched = true; rememberColor(h); closeSheet(); render(); };

/* ---------- 고급 설정 ---------- */
SCREENS.regAdvanced = {
  render() {
    if (!ui.reg) ui.reg = newDraft();
    const d = ui.reg, s = Store.state;
    const p = d.photos[0];
    const subs = [...(SUBS[d.cat] || []), ...(s.customSubs[d.cat] || [])];
    const styles = [...ITEM_STYLES, ...s.customStyles];
    const colors = [...new Set([d.color, ...s.recentColors, '#1A1A1A', '#FFFFFF', '#9CA3AF', '#24345C', '#D9C2A0', '#7A4E2D', '#6B6B3A'].filter(Boolean))].slice(0, 7);
    const sizes = [...SIZES]; if (d.size && !sizes.includes(d.size)) sizes.push(d.size);
    const fakeItem = { cat: d.cat, sub: d.sub || DEFAULT_SUB[d.cat], color: d.color || '#9CA3AF', name: '' };
    return `<div class="screen"><div class="scroll">
      ${topbar('고급 설정', { backBtn: true })}
      <div class="pad">
        <div class="adv-sum">
          <div class="ithumb sm">${p ? `<img src="${draftPhotoSrc(p, d)}" alt="">` : garmentSVG(fakeItem)}</div>
          <div><b>${esc(d.name || autoName(d))}</b><span>${esc(d.cat)}${d.sub ? ' · ' + esc(d.sub) : ''} · ${d.colorAuto ? 'AI 자동 분류' : '직접 입력'}</span></div>
        </div>
        <p class="hint">입력할수록 AI 코디 추천이 더 정확해져요 · 모두 선택 사항</p>
      </div>
      <div class="sep"></div>

      <section class="pad"><p class="sec-cap">기본 정보</p>
        <h3 class="h3">옷 종류</h3>
        <p class="step">1 대분류</p>
        <div class="chips wrap">${s.categories.map(c => chip(esc(c), d.cat === c, 'regCat', c)).join('')}</div>
        <div class="subbox mt12"><p class="step">2 ${esc(d.cat)} 세부 종류</p>
          <div class="chips wrap">${subs.map(x => chip(esc(x), d.sub === x, 'regSub', x)).join('')}<button class="chip dashed" data-act="regSubAdd">직접 입력</button></div></div>

        <h3 class="h3 mt24">색상</h3>
        <div class="swatches">${colors.map(h => `<button class="sw ${d.color === h ? 'on' : ''}" data-act="regColor" data-arg="${h}"><i style="background:${h}"></i></button>`).join('')}
          <label class="sw add" aria-label="스포이드">${ic('eyedrop', 16)}<input type="color" value="${d.color || '#9CA3AF'}" data-change="pickColorInputAdv" hidden></label></div>
        <div class="row between mt8"><span class="hint m0">${d.color ? `${esc(draftColorName(d))} ${d.color}` : '색상을 선택해 주세요'}</span><button class="link b" data-act="colorSheet">상세 지정</button></div>

        <h3 class="h3 mt24">사이즈</h3>
        <div class="chips wrap">${sizes.map(x => chip(esc(x), d.size === x, 'regSize', x)).join('')}<button class="chip dashed" data-act="regSizeAdd">직접 입력</button></div>
      </section>
      <div class="sep"></div>

      <section class="pad"><p class="sec-cap">착용 정보</p>
        <h3 class="h3">스타일 <small>어울리는 상황 · 여러 개 선택 가능</small></h3>
        <div class="chips wrap">${styles.map(x => chip(esc(x), d.styles.includes(x), 'regStyle', x)).join('')}<button class="chip dashed" data-act="regStyleAdd">직접 입력</button></div>
        <h3 class="h3 mt24">보온성</h3>
        <p class="step">두께</p>${seg(THICKNESS, d.thickness, 'regThick')}
        <p class="step mt12">안감</p><div class="chips wrap">${LININGS.map(x => chip(x, d.lining === x, 'regLining', x)).join('')}</div>
      </section>
      <div class="sep"></div>

      <section class="pad"><p class="sec-cap">관리 정보</p>
        <h3 class="h3">보관 위치</h3>
        <div class="chips wrap">${s.locations.map(l => chip(esc(l), d.loc === l, 'regLoc', l)).join('')}<button class="chip dashed" data-act="addLocation">장소 추가</button></div>
        <h3 class="h3 mt24">상태</h3>${seg(STATUSES, d.status, 'regStatus')}
        <h3 class="h3 mt24">소유자</h3>
        <div class="chips wrap">${s.family.map(f => chip(f.id === 'me' ? '나' : esc(f.name), d.owner === f.id, 'regOwner', f.id)).join('')}</div>
        <h3 class="h3 mt24">소유 구분</h3>${seg(OWNERSHIP, d.ownership, 'regOwnership')}
        <h3 class="h3 mt24">메모</h3>
        <div class="memo"><textarea maxlength="200" placeholder="구매처, 세탁 방법, 수선 이력 등&#10;자유롭게 적어 주세요" data-in="regMemo">${esc(d.memo)}</textarea><span id="memoCnt">${d.memo.length}/200</span></div>
      </section>
      <div class="h24"></div>
      <div class="sticky-cta"><button class="btn primary lg block" data-act="regAdvSave">저장하기</button></div>
    </div></div>`;
  },
};
A.regSub = x => { ui.reg.sub = ui.reg.sub === x ? '' : x; render(); };
A.regSubAdd = () => askText(`${ui.reg.cat} 세부 종류 추가`, '예) 크롭 티셔츠', v => {
  const s = Store.state, c = ui.reg.cat; s.customSubs[c] = [...(s.customSubs[c] || []), v]; Store.save(); ui.reg.sub = v; render();
});
A.regSize = x => { ui.reg.size = ui.reg.size === x ? '' : x; render(); };
A.regSizeAdd = () => askText('사이즈 직접 입력', '예) 260, 28, 95', v => { ui.reg.size = v; render(); });
A.regStyle = x => { const a = ui.reg.styles; const i = a.indexOf(x); if (i >= 0) a.splice(i, 1); else a.push(x); render(); };
A.regStyleAdd = () => askText('스타일 직접 입력', '예) 등산, 면접', v => { const s = Store.state; if (!s.customStyles.includes(v)) s.customStyles.push(v); Store.save(); ui.reg.styles.push(v); render(); });
A.regThick = x => { ui.reg.thickness = x; render(); };
A.regLining = x => { ui.reg.lining = x; render(); };
A.regStatus = x => { ui.reg.status = x; render(); };
A.regOwnership = x => { ui.reg.ownership = x; render(); };
A.regMemo = v => { ui.reg.memo = v; const c = $('#memoCnt'); if (c) c.textContent = `${v.length}/200`; };
A.pickColorInputAdv = el => { const h = el.value.toUpperCase(); ui.reg.color = h; ui.reg.colorTouched = true; rememberColor(h); render(); };
A.regAdvSave = () => { if (ui.reg.mode === 'edit') A.regSave(); else back('regForm'); };

/* ---------- 저장 ---------- */
A.regSave = () => {
  const d = ui.reg, s = Store.state;
  if (!d.cat) { toast('종류를 선택해 주세요'); return; }
  if (d.processing) { toast('사진을 처리하는 중이에요. 잠시만요!'); return; }
  const color = d.color || '#9CA3AF';
  const sub = d.sub || DEFAULT_SUB[d.cat] || d.cat;
  const fields = {
    name: d.name.trim() || `${nearestColor(color).name} ${sub}`,
    cat: d.cat, sub, color, colorName: nearestColor(color).name, seasons: [...d.seasons], loc: d.loc, owner: d.owner,
    size: d.size, styles: [...d.styles], thickness: d.thickness, lining: d.lining, ownership: d.ownership, status: d.status, memo: d.memo,
  };
  const photoIds = d.photos.map(p => {
    if (p.keepId && !(d.useCut && p.cut)) return p.keepId;
    const id = uid('img'); IMG.put(id, d.useCut && p.cut ? p.cut : p.orig); return id;
  });
  if (d.mode === 'edit') {
    const it = itemById(d.id);
    (it.photos || []).filter(id => !photoIds.includes(id)).forEach(id => IMG.del(id));
    Object.assign(it, fields, { photos: photoIds });
    toast('수정했어요');
  } else {
    s.items.unshift({ id: uid('it'), ...fields, photos: photoIds, fav: false, pattern: null, wear: 0, createdAt: Date.now() });
    toast(`'${fields.name}'을(를) 내 옷장에 저장했어요`);
  }
  rememberColor(color);
  Store.save(); invalidateRecs();
  ui.reg = null;
  ui.closet.cat = '전체'; ui.closet.sort = 'recent';
  if (d.owner !== 'me') ui.closet.owner = d.owner;
  go('closet', null, { replace: true });
};

/* 기존 옷 수정 → 고급 설정 화면 재사용 */
A.editItem = id => {
  const it = itemById(id); if (!it) return;
  ui.reg = {
    ...newDraft(), mode: 'edit', id, cat: it.cat, sub: it.sub, seasons: [...(it.seasons || [])], color: it.color, colorTouched: true,
    name: it.name, loc: it.loc, owner: it.owner, size: it.size || '', styles: [...(it.styles || [])], thickness: it.thickness, lining: it.lining,
    ownership: it.ownership, status: it.status, memo: it.memo || '', useCut: false,
    photos: (it.photos || []).filter(p => IMG.get(p)).map(p => ({ orig: IMG.get(p), keepId: p, cut: null, failed: true, warned: true })),
  };
  closeAllSheets();
  go('regForm');
};
