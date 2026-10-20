/* area — 로그인 · 홈 · 마이 */

let homeRecs = null;
function invalidateRecs() { homeRecs = null; }
function homeRecCtx() { return { look: '데일리룩', style: Store.state.user.styles.includes('미니멀') ? '미니멀' : '캐주얼', aiExtra: false, variety: 1.4 }; }
function getHomeRecs() {
  if (!homeRecs) homeRecs = recommend(homeRecCtx(), 3);
  return homeRecs;
}
function openResults(list, ctx, idx = 0) {
  ui.results = { list, ctx };
  ui.detailIdx = idx;
  go('aiDetail', idx);
}
/* 새로고침: 직전에 나온 옷(아우터·신발 포함)은 피해서 다시 추천 */
A.homeRefresh = () => {
  const prev = new Set((homeRecs || []).flatMap(r => r.items.map(i => i.id)));
  homeRecs = recommend({ ...homeRecCtx(), avoid: prev }, 3);
  render(); toast('새로운 코디를 추천했어요');
};
A.openHomeRec = i => openResults(getHomeRecs(), { look: '데일리룩', aiExtra: false }, Number(i));

/* ---------- 로그인 ---------- */
SCREENS.login = {
  render() {
    return `<div class="screen login">
      <div class="deco d1"></div><div class="deco d2"></div>
      <div class="login-hero">${logo('xl')}<h1>내 옷으로, 더 나답게.</h1><p>옷을 등록하고,<br>오늘의 코디를 추천받으세요.</p></div>
      <div class="login-btns">
        <button class="btn block kakao" data-act="login"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#191600" d="M12 3.5C6.8 3.5 2.5 6.8 2.5 11c0 2.7 1.8 5 4.5 6.3l-1 3.7 4.2-2.8c.6.1 1.2.1 1.8.1 5.2 0 9.5-3.3 9.5-7.3S17.2 3.5 12 3.5z"/></svg>카카오 로그인</button>
        <button class="btn block outline" data-act="login"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/></svg>구글 로그인</button>
        <button class="btn block outline" data-act="login"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#111" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"/></svg>애플 로그인</button>
        <div class="divider"></div>
        <button class="btn block primary lg" data-act="login">로그인</button>
        <p class="signup">아직 회원이 아니신가요? <button class="link" data-act="login">회원가입</button></p>
      </div>
    </div>`;
  },
};
A.login = () => { Store.state.loggedIn = true; Store.save(); go('home', null, { replace: true }); render(); toast(`${Store.state.user.name}님, 환영해요!`); };
A.logout = () => askConfirm('로그아웃', '로그아웃할까요? 등록한 옷은 이 기기에 그대로 남아요.', '로그아웃', () => { Store.state.loggedIn = false; Store.save(); render(); });

/* ---------- 홈: 옷장 한눈에 (아이폰 사진첩처럼 두 손가락으로 열 수 조절) ---------- */
ui.home = { cat: '전체' };
const HOME_COLS = [2, 3, 4, 5, 7, 9];   // 두 손가락으로 오갈 수 있는 열 수
const HOME_PRESET = [[3, 'grid2'], [5, 'grid4'], [7, 'grid8']];
function homeCols() { return HOME_COLS.includes(Store.state.homeCols) ? Store.state.homeCols : 7; }
function setHomeCols(n) {
  if (n === homeCols()) return;
  Store.state.homeCols = n; Store.save();
  const g = $('.home-grid'); if (!g) return;
  const sc = $('#screen .scroll'), ratio = sc.scrollTop / Math.max(1, sc.scrollHeight);
  g.style.setProperty('--cols', n);
  g.classList.remove('zoom'); void g.offsetWidth; g.classList.add('zoom');
  sc.scrollTop = ratio * sc.scrollHeight;
  $$('.home-cols button').forEach(btn => btn.classList.toggle('on', Number(btn.dataset.arg) === n));
}
SCREENS.home = {
  nav: 'home',
  render() {
    const s = Store.state, H = ui.home;
    const mine = s.items.filter(i => i.owner === 'me');
    const count = c => mine.filter(i => i.cat === c).length;
    const list = mine.filter(i => H.cat === '전체' || i.cat === H.cat).sort((a, b) => b.createdAt - a.createdAt);
    const stat = (c, n) => `<button class="${H.cat === c ? 'on' : ''}" data-act="homeCat" data-arg="${c}"><b>${n}</b><span>${c}</span></button>`;
    const n = homeCols();
    return `<div class="screen has-nav">
      <div class="home-stats ${ui.bars ? 'show' : ''}"><div class="stats">${stat('전체', mine.length)}${stat('상의', count('상의'))}${stat('하의', count('하의'))}${stat('아우터', count('아우터'))}</div></div>
      <div class="scroll">
      <header class="topbar pad"><div class="tb-left">${logo()}<div class="cols home-cols">${HOME_PRESET.map(([c, icn]) => `<button class="${n === c ? 'on' : ''}" data-act="homeColsSet" data-arg="${c}" aria-label="한 줄에 ${c}개">${ic(icn, 18)}</button>`).join('')}</div></div><div class="tb-right">${weatherChip()}${avatar()}</div></header>
      ${H.cat !== '전체' ? `<div class="pad"><button class="chip sm on" data-act="homeCat" data-arg="전체">${esc(H.cat)} ${list.length} ${ic('x', 13)}</button></div>` : ''}
      <section class="home-grid mt8" style="--cols:${n}">${list.length ? list.map(it => `<button class="hcell" data-act="openItem" data-arg="${it.id}" title="${esc(it.name)}">${itemArt(it)}</button>`).join('')
        : `<div class="pad" style="grid-column:1/-1">${emptyState('아직 등록한 옷이 없어요', `<button class="btn primary" data-act="regStart">${ic('plus', 18)} 첫 옷 등록하기</button>`)}</div>`}</section>
      <div class="h24"></div>
    </div></div>`;
  },
  mount() {
    const g = $('.home-grid'); if (!g) return;
    // 두 손가락 벌리면 크게(열 수 줄임), 오므리면 작게(열 수 늘림)
    let d0 = 0;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const step = dir => { const i = HOME_COLS.indexOf(homeCols()); const j = Math.max(0, Math.min(HOME_COLS.length - 1, (i < 0 ? 4 : i) + dir)); setHomeCols(HOME_COLS[j]); };
    g.addEventListener('touchstart', e => { if (e.touches.length === 2) d0 = dist(e.touches); }, { passive: true });
    g.addEventListener('touchmove', e => {
      if (e.touches.length !== 2 || !d0) return;
      e.preventDefault();
      const r = dist(e.touches) / d0;
      if (r > 1.3) { step(-1); d0 = dist(e.touches); } else if (r < 0.77) { step(1); d0 = dist(e.touches); }
    }, { passive: false });
    g.addEventListener('touchend', e => { if (e.touches.length < 2) d0 = 0; });
    // PC 트랙패드 핀치(ctrl+휠)
    let acc = 0;
    g.addEventListener('wheel', e => {
      if (!e.ctrlKey) return;
      e.preventDefault(); acc += e.deltaY;
      if (acc < -40) { step(-1); acc = 0; } else if (acc > 40) { step(1); acc = 0; }
    }, { passive: false });
  },
};
A.homeCat = c => { ui.home.cat = c; render(); };
A.homeColsSet = c => setHomeCols(Number(c));

/* ---------- 마이 ---------- */
SCREENS.my = {
  nav: null,
  render() {
    const s = Store.state, u = s.user;
    const mine = s.items.filter(i => i.owner === 'me');
    const fams = s.family.filter(f => f.id !== 'me');
    const received = s.codis.filter(c => c.from);
    const sent = s.codis.filter(c => !c.from && c.sharedWith.length);
    const reqs = s.requests;
    const O = ui.myOrders || '전체';
    const orders = s.orders.filter(o => O === '전체' || orderKind(o) === O);
    const unread = s.messages.filter(m => m.unread).length;
    return `<div class="screen"><div class="scroll">
      ${topbar('마이페이지', { backBtn: true })}
      <section class="pad">
        <div class="profile">
          <label class="pf-avatar" aria-label="프로필 사진 변경">${avatarInner(30)}<span class="pf-cam">${ic('camera', 13)}</span><input type="file" accept="image/*" hidden data-change="setAvatar"></label>
          <div class="flex1"><b>${esc(u.name)}님</b><span>${esc(u.bio || '나만의 취향을 쌓는 중')}</span></div>
          <button class="more" data-act="editProfile">프로필 수정 ${ic('chevR', 14)}</button>
        </div>
        ${IMG.get('avatar') ? '<button class="link sm mt8" data-act="delAvatar">프로필 사진 삭제</button>' : ''}
        <div class="field-label">성별 <small>코디 추천에 반영돼요</small></div>
        ${seg(GENDERS, u.gender, 'setGender')}
        <div class="stats mt16">
          <button data-act="go" data-arg="closet"><b>${mine.length}</b><span>등록한 옷</span></button>
          <button data-act="go" data-arg="codibook"><b>${s.codis.length}</b><span>저장 코디</span></button>
          <button data-act="go" data-arg="history"><b>${s.codis.filter(c => c.date).length}</b><span>코디 기록</span></button>
        </div>
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">나의 스타일</h2><button class="more" data-act="editStyles">수정 ${ic('chevR', 14)}</button></div>
        <div class="soft-card"><div class="chips wrap">${u.styles.map(t => `<span class="chip on sm static">${esc(t)}</span>`).join('')}</div></div>
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">${ic('users', 18)} 공유받은 가족 옷장</h2><button class="more" data-act="inviteFamily">초대 ${ic('send', 14)}</button></div>
        ${fams.length ? `<div class="fam-list">${fams.map(f => `<button class="fam" data-act="famMenu" data-arg="${f.id}"><div class="fam-av">${esc(f.name.slice(0, 1))}</div><b>${esc(f.name)}</b><span>${s.items.filter(i => i.owner === f.id).length}벌</span></button>`).join('')}</div>`
        : '<p class="sub">아직 옷장을 공유한 가족이 없어요.</p>'}
        <p class="hint">가족이 옷장을 공유하면 여기에 나타나요. 눌러서 가족 옷장을 보거나, 코디를 골라 보내줄 수 있어요.</p>
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">${ic('send', 18)} 내가 보낸 코디 <small>${sent.length}</small></h2></div>
        ${sent.length ? `<div class="mylist">${sent.map(c => `<div class="mrow">
          <button class="mrow-main" data-act="openCodi" data-arg="${c.id}">${board(codiItems(c))}<div class="flex1"><b>${esc(c.name)}</b><span>${c.sharedWith.map(f => esc(famOf(f).name)).join(', ')}에게 보냄 · ${fmtDate(dayKey(c.createdAt))}</span></div></button>
          <div class="mrow-act"><button class="btn sm ghost" data-act="sentEdit" data-arg="${c.id}">${ic('edit', 14)} 수정</button><button class="btn sm ghost" data-act="sentCancel" data-arg="${c.id}">보내기 취소</button><button class="btn sm ghost danger-t" data-act="codiDel" data-arg="${c.id}">${ic('trash', 14)}</button></div>
        </div>`).join('')}</div>` : '<p class="sub">가족에게 보낸 코디가 없어요.</p>'}
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">${ic('heart', 18)} 가족이 보낸 코디 <small>${received.length}</small></h2></div>
        ${received.length ? `<div class="hscroll">${received.map(c => `<button class="mini-codi" data-act="openCodi" data-arg="${c.id}">${board(codiItems(c))}<b>${esc(c.name)}</b><span>${esc(famOf(c.from).name)}님이 보냄${c.hidden ? ' · 옷장에서 숨김' : ''}</span></button>`).join('')}</div>
        ${received.some(c => c.hidden) ? '<button class="link sm mt8" data-act="showReceived">옷장 화면에 다시 보이기</button>' : ''}` : '<p class="sub">받은 코디가 없어요.</p>'}
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">${ic('tag', 18)} 구매 요청 내역 <small>${reqs.filter(r => r.status === '요청 중').length}</small></h2></div>
        ${reqs.length ? `<div class="mylist">${reqs.map(r => { const m = MARKET.codis.find(x => x.id === r.target); return m ? `<div class="mrow line">
          <div class="flex1"><b>${esc(m.title)}</b><span>@${esc(m.user)} · ${fmtDate(dayKey(r.at))}</span></div>
          <span class="st ${r.status === '요청 중' ? 'ing' : ''}">${esc(r.status)}</span>
          ${r.status === '요청 중' ? `<button class="btn sm ghost" data-act="reqCancel" data-arg="${r.id}">요청 취소</button>` : ''}
        </div>` : ''; }).join('')}</div>` : '<p class="sub">코디SHOP에서 \'저한테 팔 수 있나요?\'를 누르면 여기에 쌓여요.</p>'}
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">${ic('bag', 18)} 거래 내역</h2></div>
        <div class="chips">${ORDER_TABS.map(t => chip(t, O === t, 'myOrders', t, 'sm')).join('')}</div>
        ${orders.length ? `<div class="mylist mt12">${orders.map(o => `<div class="mrow line">
          <div class="ithumb xs">${itemArt(o)}</div>
          <div class="flex1"><b>${esc(o.name)}</b><span>${won(o.price)} · ${o.type === '선물' ? `${esc(o.to)}님께 선물` : '배송'} · ${fmtDate(dayKey(o.at))}</span></div>
          <span class="st ${o.status === '결제 완료' ? 'ing' : ''}">${esc(o.status)}</span>
          ${o.status === '결제 완료' ? `<button class="btn sm ghost" data-act="orderCancel" data-arg="${o.id}">주문 취소</button>` : o.status === '배송 완료' ? `<button class="btn sm ghost" data-act="orderRefund" data-arg="${o.id}">환불 요청</button>` : ''}
        </div>`).join('')}</div>` : `<p class="sub mt12">${O === '전체' ? '코디SHOP 새상품을 구매하면 여기에 보여요.' : `${O} 내역이 없어요.`}</p>`}
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">${ic('chat', 18)} 메시지 ${unread ? `<b class="nbadge">${unread}</b>` : ''}</h2></div>
        <div class="mylist">${s.messages.map(m => `<button class="mrow line" data-act="openThread" data-arg="${m.id}">
          <div class="fam-av">${esc(m.with.slice(0, 1))}</div>
          <div class="flex1"><b>${esc(m.with)} <small>${esc(m.about)}</small></b><span>${esc(m.msgs[m.msgs.length - 1].text)}</span></div>
          ${m.unread ? '<i class="udot"></i>' : ''}
        </button>`).join('') || '<p class="sub">메시지가 없어요.</p>'}</div>
      </section>

      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">보관 위치</h2><button class="more" data-act="addLocation">추가 ${ic('plus', 14)}</button></div>
        <div class="chips wrap">${s.locations.map(l => `<span class="chip static">${ic(locIcon(l), 15)} ${esc(l)} <button class="chip-x" data-act="removeLocation" data-arg="${esc(l)}">${ic('x', 12)}</button></span>`).join('')}</div>
      </section>
      <section class="pad mt24">
        <h2 class="h2">계정 및 설정</h2>
        <div class="menu">
          <button class="menu-item" data-act="toastMsg" data-arg="계정 관리는 준비 중이에요">${ic('user')} 계정 관리 ${ic('chevR', 16)}</button>
          <button class="menu-item" data-act="toastMsg" data-arg="알림 설정은 준비 중이에요">${ic('bell')} 알림 설정 ${ic('chevR', 16)}</button>
          <button class="menu-item" data-act="toastMsg" data-arg="고객센터: help@area.app">${ic('headset')} 고객센터 ${ic('chevR', 16)}</button>
          <button class="menu-item" data-act="resetData">${ic('refresh')} 데모 데이터로 초기화 ${ic('chevR', 16)}</button>
        </div>
        <button class="logout" data-act="logout">로그아웃</button>
      </section>
      <div class="h40"></div>
    </div></div>`;
  },
};
A.toastMsg = m => toast(m);
A.setGender = g => { Store.state.user.gender = g; Store.save(); invalidateRecs(); if (ui.ai) ui.ai.list = null; render(); };
A.setAvatar = async el => {
  const f = el.files && el.files[0]; if (!f) return;
  try { IMG.put('avatar', await downscale(await fileToDataURL(f), 320)); render(); toast('프로필 사진을 바꿨어요'); } catch (e) { toast('사진을 읽지 못했어요'); }
};
A.delAvatar = () => { IMG.del('avatar'); render(); };
A.editProfile = () => openSheet('profile');
SHEETS.profile = () => `<div class="sheet-body"><h3 class="sheet-title">프로필 수정</h3>
  <label class="field-label">이름</label><input class="input" id="pfName" value="${esc(Store.state.user.name)}" maxlength="12">
  <label class="field-label mt12">한 줄 소개</label><input class="input" id="pfBio" value="${esc(Store.state.user.bio)}" maxlength="40">
  <button class="btn primary block mt16" data-act="saveProfile">저장</button></div>`;
A.saveProfile = () => {
  const n = $('#pfName').value.trim(), b = $('#pfBio').value.trim();
  if (n) Store.state.user.name = n;
  Store.state.user.bio = b; Store.save(); closeSheet(); render();
};
A.editStyles = () => openSheet('styles');
SHEETS.styles = () => `<div class="sheet-body"><h3 class="sheet-title">나의 스타일</h3><p class="sub">좋아하는 스타일을 고르면 추천에 반영돼요.</p>
  <div class="chips wrap mt12">${MY_STYLE_OPTIONS.map(t => chip(t, Store.state.user.styles.includes(t), 'toggleMyStyle', t)).join('')}</div>
  <button class="btn primary block mt16" data-act="closeSheet">완료</button></div>`;
A.toggleMyStyle = t => {
  const a = Store.state.user.styles; const i = a.indexOf(t);
  if (i >= 0) a.splice(i, 1); else a.push(t);
  Store.save(); invalidateRecs(); renderOverlay(); render();
};

/* 가족 옷장: 가족이 공유하면 생기고, 눌러서 옷장 보기 · 코디 해주기 */
A.inviteFamily = () => {
  const text = `${Store.state.user.name}님이 area 가족 옷장에 초대했어요. 앱에서 옷장을 공유해 주세요!`;
  if (navigator.share) navigator.share({ title: 'area 가족 옷장 초대', text, url: location.href.split('#')[0] }).catch(() => { });
  else toast('초대 링크를 보냈어요. 가족이 수락하면 여기에 보여요');
};
A.famMenu = id => openSheet('famMenu', { id });
SHEETS.famMenu = sh => {
  const f = famOf(sh.id), n = Store.state.items.filter(i => i.owner === f.id).length;
  return `<div class="sheet-body">
    <div class="row gap8"><div class="fam-av lg">${esc(f.name.slice(0, 1))}</div><div><h3 class="sheet-title">${esc(f.name)}님의 옷장</h3><p class="sub">공유받은 옷 ${n}벌</p></div></div>
    <button class="menu-row hl mt12" data-act="famCloset" data-arg="${f.id}">${ic('closet', 22)} ${esc(f.name)}님 옷장 보기</button>
    <button class="menu-row" data-act="famCodi" data-arg="${f.id}">${ic('hanger', 22)} ${esc(f.name)}님 코디 해주기 <small class="muted-s">골라서 바로 보내요</small></button>
    <button class="menu-row danger-t" data-act="removeFamily" data-arg="${f.id}">${ic('x', 22)} 공유 해제</button>
  </div>`;
};
A.famCloset = id => { closeAllSheets(); ui.closet.owner = id; ui.closet.cat = '전체'; go('closet'); };
A.famCodi = id => { closeAllSheets(); startManualFor(id); };
A.removeFamily = id => {
  const f = famOf(id);
  askConfirm('공유 해제', `${f.name}님 옷장 공유를 해제할까요? ${f.name}님 옷 정보가 이 기기에서 지워져요.`, '해제', () => {
    const s = Store.state; s.family = s.family.filter(x => x.id !== id); s.items = s.items.filter(i => i.owner !== id); Store.save(); closeAllSheets(); render();
  }, true);
};
A.showReceived = () => { Store.state.codis.forEach(c => { if (c.from) c.hidden = false; }); Store.save(); render(); toast('옷장 화면에 다시 보여요'); };

/* 보낸 코디: 수정 · 보내기 취소 */
A.sentEdit = id => { const c = findCodi(id); manualPreload(c.items); ui.manual.editId = id; ui.manual.forFam = c.sharedWith[0] || null; ui.manual.owner = c.sharedWith[0] || 'me'; go('manual'); };
A.sentCancel = id => askConfirm('보내기 취소', '가족에게 보낸 코디를 취소할까요? 코디는 내 코디북에 남아요.', '보내기 취소', () => {
  const c = findCodi(id); c.sharedWith = []; Store.save(); render(); toast('보내기를 취소했어요');
});

/* 구매 요청 · 거래 */
function orderKind(o) { return o.status === '주문 취소' ? '취소' : /환불/.test(o.status) ? '환불' : '구매'; }
A.myOrders = t => { ui.myOrders = t; render(); };
A.reqCancel = id => { const r = Store.state.requests.find(x => x.id === id); if (r) r.status = '취소됨'; Store.save(); render(); toast('구매 요청을 취소했어요'); };
A.orderCancel = id => askConfirm('주문 취소', '이 주문을 취소할까요? 결제 금액은 바로 환불돼요.', '주문 취소', () => {
  const o = Store.state.orders.find(x => x.id === id); o.status = '주문 취소'; Store.save(); render(); toast('주문을 취소했어요');
}, true);
A.orderRefund = id => { const o = Store.state.orders.find(x => x.id === id); o.status = '환불 요청'; Store.save(); render(); toast('환불을 요청했어요'); };

/* 메시지 */
A.openThread = id => { const m = Store.state.messages.find(x => x.id === id); if (m) { m.unread = false; Store.save(); } openSheet('thread', { id, onClose: () => render() }); };
SHEETS.thread = sh => {
  const m = Store.state.messages.find(x => x.id === sh.id); if (!m) return '<div class="sheet-body">대화가 없어요.</div>';
  return `<div class="sheet-body"><h3 class="sheet-title">${esc(m.with)}</h3><p class="sub">${esc(m.about)}</p>
    <div class="chat mt12">${m.msgs.map(x => `<div class="msg ${x.me ? 'me' : 'bot'}">${x.me ? '' : `<span class="bot-av">${esc(m.with.slice(0, 1))}</span>`}<div class="bubble"><p>${esc(x.text)}</p></div></div>`).join('')}</div>
    <div class="row gap8 mt16"><input class="input" id="thIn" placeholder="메시지 보내기" maxlength="100"><button class="send" data-act="threadSend">${ic('send', 18)}</button></div>
  </div>`;
};
SHEET_MOUNT.thread = () => { const b = $('#overlay .sheet-body'); if (b) b.scrollTop = b.scrollHeight; const i = $('#thIn'); if (i) i.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) A.threadSend(); }; };
A.threadSend = () => {
  const sh = topSheet(), m = Store.state.messages.find(x => x.id === sh.id), v = ($('#thIn').value || '').trim(); if (!v) return;
  m.msgs.push({ me: true, text: v, at: Date.now() }); m.at = Date.now(); Store.save(); renderOverlay();
  setTimeout(() => { m.msgs.push({ me: false, text: '메시지 확인했어요! 곧 답장 드릴게요 :)', at: Date.now() }); Store.save(); if (topSheet() && topSheet().id === m.id) renderOverlay(); }, 1200);
};
function startThread(withName, about, firstText) {
  const s = Store.state;
  let m = s.messages.find(x => x.with === withName && x.about === about);
  if (!m) { m = { id: uid('ms'), with: withName, about, at: Date.now(), msgs: [] }; s.messages.unshift(m); }
  if (firstText) m.msgs.push({ me: true, text: firstText, at: Date.now() });
  Store.save(); return m;
}

A.addLocation = () => askText('보관 위치 추가', '예) 베란다 수납장', v => {
  const s = Store.state; if (!s.locations.includes(v)) s.locations.push(v); Store.save();
  if (ui.reg) ui.reg.loc = v;
  render(); toast(`'${v}' 위치를 추가했어요`);
});
A.removeLocation = l => {
  const s = Store.state; if (s.locations.length <= 1) { toast('위치는 최소 1개 필요해요'); return; }
  s.locations = s.locations.filter(x => x !== l);
  s.items.forEach(i => { if (i.loc === l) i.loc = s.locations[0]; });
  Store.save(); render();
};
A.resetData = () => askConfirm('데이터 초기화', '등록한 옷과 코디를 모두 지우고 데모 데이터로 되돌릴까요?', '초기화', () => { Store.reset(); invalidateRecs(); render(); toast('초기화했어요'); }, true);
