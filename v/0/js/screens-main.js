/* area — 로그인 · 홈 · 마이 */

let homeRecs = null;
function invalidateRecs() { homeRecs = null; }
function getHomeRecs() {
  if (!homeRecs) homeRecs = recommend({ look: '데일리룩', style: Store.state.user.styles.includes('미니멀') ? '미니멀' : '캐주얼', aiExtra: false }, 3);
  return homeRecs;
}
function openResults(list, ctx, idx = 0) {
  ui.results = { list, ctx };
  ui.detailIdx = idx;
  go('aiDetail', idx);
}

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

/* ---------- 홈 ---------- */
SCREENS.home = {
  nav: 'home',
  render() {
    const s = Store.state, w = Weather.current();
    const mine = s.items.filter(i => i.owner === 'me');
    const recs = mine.length >= 2 ? getHomeRecs() : [];
    const count = c => mine.filter(i => i.cat === c).length;
    const recent = [...mine].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
    const worn = s.codis.filter(c => c.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    const shared = s.codis.filter(c => c.from);
    return `<div class="screen has-nav"><div class="scroll">
      <header class="topbar pad">${logo()}<div class="tb-right"><button class="wchip" data-act="weatherSheet">${COND_EMOJI[w.cond] || '☀️'} ${esc(w.manual ? '직접 설정' : w.place)} ${w.temp}°</button>${avatar()}</div></header>
      <section class="pad"><h1 class="h1">오늘, 뭐 입지?</h1><p class="sub">내 옷으로 완성하는 오늘의 스타일</p></section>
      ${recs.length ? `<section class="pad">
        <div class="hero">
          <div class="hero-tabs"><span class="on">오늘의 추천</span><span>${curSeason()} · 데일리</span><button class="hero-refresh" data-act="homeRefresh" aria-label="다시 추천">${ic('refresh', 16)}</button></div>
          <div class="hero-track" id="heroTrack">${recs.map((r, i) => `<button class="hero-slide" data-act="openHomeRec" data-arg="${i}">${board(r.items, { cls: 'hero-board' })}<span class="hero-cap">${esc(r.caption)}</span></button>`).join('')}</div>
        </div>${dotsHtml(recs.length, 0, 'heroDots')}
      </section>` : `<section class="pad">${emptyState('옷을 2벌 이상 등록하면<br>오늘의 코디를 추천해 드려요', `<button class="btn primary" data-act="regStart">${ic('plus', 18)} 첫 옷 등록하기</button>`)}</section>`}
      <section class="pad mt12"><button class="btn primary lg block" data-act="go" data-arg="ai">${sparkle(18)} 오늘의 코디 추천받기</button></section>
      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">나의 옷장 <button class="mini-plus" data-act="regStart" aria-label="옷 등록">${ic('plus', 12)}</button></h2><button class="more" data-act="go" data-arg="closet">전체 보기 ${ic('chevR', 14)}</button></div>
        <button class="stats" data-act="go" data-arg="closet">
          <div><b>${mine.length}</b><span>전체</span></div><div><b>${count('상의')}</b><span>상의</span></div><div><b>${count('하의')}</b><span>하의</span></div><div><b>${count('아우터')}</b><span>아우터</span></div>
        </button>
      </section>
      ${shared.length ? `<section class="pad mt24"><div class="sec-head"><h2 class="h2">가족이 보낸 코디</h2></div>
        <div class="hscroll">${shared.map(c => `<button class="mini-codi" data-act="openCodi" data-arg="${c.id}">${board(codiItems(c))}<b>${esc(c.name)}</b><span>${esc(famOf(c.from).name)}님이 보냄</span></button>`).join('')}</div></section>` : ''}
      <section class="mt24"><div class="sec-head pad"><h2 class="h2">최근 등록한 옷</h2></div>
        <div class="hscroll pad">${recent.map(it => `<button class="mini-item" data-act="openItem" data-arg="${it.id}"><div class="ithumb">${itemArt(it)}</div><b>${esc(it.name)}</b></button>`).join('')}</div></section>
      ${worn.length ? `<section class="pad mt24"><div class="sec-head"><h2 class="h2">최근 코디 기록</h2><button class="more" data-act="go" data-arg="history">히스토리 ${ic('chevR', 14)}</button></div>
        <div class="grid g4">${worn.map(c => `<button class="mini-codi sm" data-act="openCodi" data-arg="${c.id}">${board(codiItems(c))}<span>${fmtDate(c.date).slice(5)}</span></button>`).join('')}</div></section>` : ''}
      <div class="h40"></div>
    </div></div>`;
  },
  mount() { bindCarousel($('#heroTrack'), $('#heroDots')); },
};
A.openHomeRec = i => openResults(getHomeRecs(), { look: '데일리룩', aiExtra: false }, Number(i));
A.homeRefresh = () => { invalidateRecs(); render(); toast('새로운 코디를 추천했어요'); };

/* ---------- 마이 ---------- */
SCREENS.my = {
  nav: null,
  render() {
    const s = Store.state, u = s.user;
    const mine = s.items.filter(i => i.owner === 'me');
    return `<div class="screen has-nav"><div class="scroll">
      ${topbar('마이페이지', { backBtn: true })}
      <section class="pad">
        <div class="profile">
          <div class="pf-avatar">${ic('user', 30)}</div>
          <div class="flex1"><b>${esc(u.name)}님</b><span>나만의 취향을 쌓는 중</span></div>
          <button class="more" data-act="editProfile">프로필 수정 ${ic('chevR', 14)}</button>
        </div>
        <div class="stats mt12">
          <button data-act="go" data-arg="closet"><b>${mine.length}</b><span>등록한 옷</span></button>
          <button data-act="go" data-arg="codibook"><b>${s.codis.length}</b><span>저장 코디</span></button>
          <button data-act="go" data-arg="history"><b>${s.codis.filter(c => c.date).length}</b><span>코디 기록</span></button>
        </div>
      </section>
      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">나의 스타일</h2><button class="more" data-act="editStyles">수정 ${ic('chevR', 14)}</button></div>
        <div class="soft-card"><div class="chips wrap">${u.styles.map(t => `<span class="chip on sm static">${esc(t)}</span>`).join('')}</div><p class="sub mt8">${esc(u.bio)}</p></div>
      </section>
      <section class="pad mt24">
        <div class="sec-head"><h2 class="h2">가족 옷장</h2><button class="more" data-act="addFamily">추가 ${ic('plus', 14)}</button></div>
        <div class="fam-list">${s.family.map(f => `<div class="fam"><div class="fam-av">${esc(f.name.slice(0, 1))}</div><b>${esc(f.name)}</b><span>${s.items.filter(i => i.owner === f.id).length}벌</span>${f.id !== 'me' ? `<button class="x" data-act="removeFamily" data-arg="${f.id}">${ic('x', 14)}</button>` : ''}</div>`).join('')}</div>
        <p class="hint">가족과 연동하면 가족 옷을 대신 등록하고, 코디를 정해 보내줄 수 있어요.</p>
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
A.addFamily = () => askText('가족 추가', '예) 엄마, 누나', v => {
  Store.state.family.push({ id: uid('fam'), name: v, label: `${v} 옷` }); Store.save(); render(); toast(`${v}님을 가족 옷장에 연결했어요`);
});
A.removeFamily = id => {
  const f = famOf(id);
  askConfirm('가족 연결 해제', `${f.name}님의 옷장 연결을 해제할까요? ${f.name}님 옷 정보도 함께 지워져요.`, '해제', () => {
    const s = Store.state; s.family = s.family.filter(x => x.id !== id); s.items = s.items.filter(i => i.owner !== id); Store.save(); render();
  }, true);
};
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
