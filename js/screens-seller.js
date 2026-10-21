/* area — 주문 상세 (구매자) · 판매자 가입 · 판매자 센터 (주문 · 결제 · 상품 · 정산)
   데모: 실제 결제 · 정산은 PG(토스페이먼츠 · 포트원 등) 연동 후 서버에서 처리해야 해요 */

const ORDER_STEPS = ['결제 완료', '상품 준비', '배송 중', '배송 완료'];
const PAY_FEE = 0.1; // 판매 수수료 10% (데모)

/* 새상품 목록 = 기본 입점몰 상품 + 내가 판매자로 등록한 상품 */
function freshProducts() {
  const sl = Store.state.seller;
  const mine = sl ? sl.products.filter(p => p.on).map(p => ({ ...p, brand: sl.name, mine: true })) : [];
  return [...mine, ...MARKET.fresh];
}
function findProduct(id) { return freshProducts().find(x => x.id === id) || (Store.state.seller && Store.state.seller.products.find(x => x.id === id)); }
function sellerOf(o) {
  const sl = Store.state.seller;
  if (sl && (o.brand === sl.name || o.mine)) return { name: sl.name, owner: sl.owner, bizNo: sl.bizNo, mailNo: sl.mailNo, phone: sl.phone, rating: '신규', reply: '-' };
  return SELLERS[o.brand] || { name: o.brand || '판매자', owner: '-', bizNo: '-', mailNo: '-', phone: '-', rating: '-', reply: '-' };
}
function orderNo(o) { return o.no || `A${dayKey(o.at).replaceAll('-', '')}-${o.id.slice(-4).toUpperCase()}`; }
function stepIdx(st) { return ORDER_STEPS.indexOf(st); }

/* ---------- 구매자: 주문 상세 (오른쪽에서 나옴) ---------- */
A.openOrder = id => openSheet('order', { side: true, id });
SHEETS.order = sh => {
  const o = Store.state.orders.find(x => x.id === sh.id); if (!o) return `${sideHead('주문 상세')}<div class="sheet-body"><p class="sub">주문을 찾을 수 없어요.</p></div>`;
  const sel = sellerOf(o), k = stepIdx(o.status), off = k < 0;
  const th = Store.state.messages.find(m => m.with === sel.name && m.about === o.name);
  return `${sideHead('주문 상세')}
  <div class="sheet-body">
    <div class="od-top"><span class="sub sm">주문번호 ${esc(orderNo(o))}</span><span class="st ${off ? '' : 'ing'}">${esc(o.status)}</span></div>
    ${off ? `<div class="od-off">${ic('info', 16)} ${o.status === '주문 취소' ? '취소된 주문이에요. 결제 금액은 결제 수단으로 환불돼요.' : '환불을 요청했어요. 판매자가 확인하면 알려드릴게요.'}</div>`
    : `<div class="steps">${ORDER_STEPS.map((x, i) => `<div class="step-i ${i <= k ? 'done' : ''} ${i === k ? 'now' : ''}"><i>${i < k ? ic('check', 12) : i + 1}</i><span>${x}</span></div>`).join('')}</div>`}
    <div class="lrow mt16"><div class="ithumb xs">${itemArt(o)}</div><b>${esc(o.name)}<small class="brand-s">${esc(o.brand || '')}</small></b><span class="price">${won(o.price)}</span></div>
    <label class="field-label">결제 정보</label>
    <div class="kv"><div><span>결제 수단</span><b>${esc(o.pay || '신용카드 (데모)')}</b></div><div><span>상품 금액</span><b>${won(o.price)}</b></div><div><span>배송비</span><b>무료</b></div><div><span>결제일</span><b>${fmtDate(dayKey(o.at))}</b></div>${o.tracking ? `<div><span>송장</span><b>${esc(o.tracking)}</b></div>` : ''}</div>
    <label class="field-label">${o.type === '선물' ? '선물 받는 분' : '배송지'}</label>
    <div class="kv"><div><span>받는 분</span><b>${esc(o.to)}</b></div>${o.type === '선물' ? '<div><span>배송지</span><b>받는 분이 직접 입력해요</b></div>' : `<div><span>주소</span><b>${esc(o.addr || '-')}</b></div>`}</div>
    <label class="field-label">판매자 정보</label>
    <div class="seller-card">
      <div class="row gap8"><div class="fam-av">${esc(sel.name.slice(0, 1))}</div><div class="flex1"><b>${esc(sel.name)}</b><span class="sub sm">평점 ${esc(sel.rating)} · 응답률 ${esc(sel.reply)}</span></div></div>
      <div class="kv mt12"><div><span>대표자</span><b>${esc(sel.owner)}</b></div><div><span>사업자</span><b>${esc(sel.bizNo)}</b></div><div><span>통신판매</span><b>${esc(sel.mailNo)}</b></div><div><span>고객센터</span><b>${esc(sel.phone)}</b></div></div>
    </div>
    <label class="field-label">판매자와 대화 ${th ? `<small>${th.msgs.length}개</small>` : ''}</label>
    ${th ? `<div class="chat od-chat">${th.msgs.slice(-3).map(x => `<div class="msg ${x.me ? 'me' : 'bot'}">${x.me ? '' : `<span class="bot-av">${esc(sel.name.slice(0, 1))}</span>`}<div class="bubble"><p>${esc(x.text)}</p></div></div>`).join('')}</div>` : '<p class="sub">아직 판매자와 나눈 대화가 없어요.</p>'}
    <button class="btn ghost block mt8" data-act="orderAsk" data-arg="${o.id}">${ic('chat', 16)} 판매자에게 문의하기</button>
    <div class="row gap8 mt16">
      ${o.status === '결제 완료' ? `<button class="btn ghost flex1 danger-t" data-act="orderCancel" data-arg="${o.id}">주문 취소</button>` : ''}
      ${o.status === '배송 중' || o.status === '배송 완료' ? `<button class="btn ghost flex1" data-act="toastMsg" data-arg="택배사 배송 조회는 실제 연동 후 열려요">${ic('pin', 16)} 배송 조회</button>` : ''}
      ${o.status === '배송 완료' ? `<button class="btn ghost flex1" data-act="orderRefund" data-arg="${o.id}">환불 요청</button>` : ''}
    </div>
  </div>`;
};
A.orderAsk = id => {
  const o = Store.state.orders.find(x => x.id === id), sel = sellerOf(o);
  const m = startThread(sel.name, o.name); A.openThread(m.id);
};

/* ---------- 판매자 가입 ---------- */
A.sellerStart = () => { closeAllSheets(); go(Store.state.seller ? 'seller' : 'sellerJoin'); };
SCREENS.sellerJoin = {
  render() {
    const f = ui.sj || (ui.sj = { agree: false });
    const inp = (k, label, ph, type = 'text') => `<label class="field-label">${label}</label><input class="input" data-sj="${k}" type="${type}" value="${esc(f[k] || '')}" placeholder="${ph}">`;
    return `<div class="screen"><div class="scroll">
      ${topbar('판매자 가입', { backBtn: true })}
      <div class="pad">
        <div class="seller-hero">${ic('store', 26)}<div><b>area에서 내 브랜드 상품을 팔아보세요</b><span>코디SHOP '새상품 판매'에 상품이 올라가고, AI 코디 추천에도 함께 보여요.</span></div></div>
        ${inp('name', '상호(브랜드명) <em>필수</em>', '예) 무드클로젯')}
        ${inp('owner', '대표자 이름 <em>필수</em>', '예) 홍길동')}
        ${inp('bizNo', '사업자등록번호 <em>필수</em>', '000-00-00000')}
        ${inp('mailNo', '통신판매업 신고번호', '예) 2026-서울강남-0000')}
        ${inp('phone', '고객센터 연락처 <em>필수</em>', '02-000-0000', 'tel')}
        ${inp('account', '정산 받을 계좌', '은행 · 계좌번호')}
        <button class="agree ${f.agree ? 'on' : ''}" data-act="sjAgree">${ic('check', 16)} 판매자 이용약관 · 수수료(판매가의 ${PAY_FEE * 100}%) · 정산 정책에 동의해요</button>
        <p class="hint">데모라 입력한 정보는 이 기기에만 저장돼요. 실제 서비스에서는 사업자 진위 확인과 정산 계좌 인증을 거쳐요.</p>
        <div class="h24"></div>
      </div>
      <div class="sticky-cta"><button class="btn primary lg block" data-act="sjOk">판매자 가입하기</button></div>
    </div></div>`;
  },
};
function keepSJ() { $$('[data-sj]').forEach(el => { ui.sj[el.dataset.sj] = el.value; }); }
A.sjAgree = () => { keepSJ(); ui.sj.agree = !ui.sj.agree; render(); };
A.sjOk = () => {
  keepSJ();
  const f = ui.sj, need = [['name', '상호'], ['owner', '대표자 이름'], ['bizNo', '사업자등록번호'], ['phone', '고객센터 연락처']];
  const miss = need.find(([k]) => !(f[k] || '').trim()); if (miss) { toast(`${miss[1]}을(를) 입력해 주세요`); return; }
  if (!f.agree) { toast('약관에 동의해 주세요'); return; }
  const now = Date.now();
  const products = SELLER_STARTER.map((p, i) => ({ ...p, id: uid('sp'), stock: 20 - i * 6, on: true, sold: 3 + i * 2, createdAt: now - i * 864e5 }));
  Store.state.seller = { name: f.name.trim(), owner: f.owner.trim(), bizNo: f.bizNo.trim(), mailNo: (f.mailNo || '').trim() || '신고 예정', phone: f.phone.trim(), account: (f.account || '').trim(), joinedAt: now, products };
  Store.state.sellerOrders = seedSellerOrders(products);
  Store.state.messages.unshift({ id: uid('ms'), with: '김*지', about: products[0].name, seller: true, unread: true, at: now - 72e5, msgs: [{ me: false, text: '정사이즈인가요? 키 170이에요', at: now - 72e5 }] });
  Store.save(); ui.sj = null; ui.sc = { tab: '대시보드' };
  go('seller', null, { replace: true }); toast(`${f.name}님, 판매자 가입을 축하해요! 샘플 상품 2개를 넣어 뒀어요`);
};

/* ---------- 판매자 센터 ---------- */
const SC_TABS = ['대시보드', '주문', '결제', '상품', '정산'];
SCREENS.seller = {
  render() {
    const sl = Store.state.seller; if (!sl) return SCREENS.sellerJoin.render();
    const S = ui.sc || (ui.sc = { tab: '대시보드' });
    return `<div class="screen"><div class="scroll">
      ${topbar('판매자 센터', { backBtn: true, right: `<span class="seller-name">${ic('store', 15)} ${esc(sl.name)}</span>` })}
      <div class="chips scroll-x pad">${SC_TABS.map(t => chip(t, S.tab === t, 'scTab', t, 'sm')).join('')}</div>
      <div class="pad mt16">${this[S.tab]()}</div>
      <div class="h40"></div>
    </div></div>`;
  },
  '대시보드'() {
    const s = Store.state, os = s.sellerOrders, today = dayKey(Date.now());
    const paid = os.filter(o => o.status !== '주문 취소');
    const sales = paid.reduce((a, o) => a + o.price, 0);
    const todo = os.filter(o => o.status === '결제 완료' || o.status === '환불 요청');
    const chats = s.messages.filter(m => m.seller && m.unread).length;
    const stat = (n, l, act) => `<button class="sc-stat" ${act ? `data-act="scTab" data-arg="${act}"` : ''}><b>${n}</b><span>${l}</span></button>`;
    return `<div class="sc-stats">${stat(os.filter(o => dayKey(o.at) === today).length, '오늘 주문', '주문')}${stat(todo.length, '처리할 주문', '주문')}${stat(won(sales), '누적 매출', '결제')}${stat(won(Math.round(sales * (1 - PAY_FEE))), '정산 예정', '정산')}</div>
      ${chats ? `<button class="sc-alert mt12" data-act="scChats">${ic('chat', 16)} 새 상품 문의 ${chats}건이 있어요 ${ic('chevR', 14)}</button>` : ''}
      <div class="sec-head mt24"><h2 class="h2">처리할 주문 <small>${todo.length}</small></h2><button class="more" data-act="scTab" data-arg="주문">전체 ${ic('chevR', 14)}</button></div>
      ${todo.length ? `<div class="mylist">${todo.slice(0, 4).map(scOrderRow).join('')}</div>` : '<p class="sub">지금 처리할 주문이 없어요.</p>'}
      <div class="sec-head mt24"><h2 class="h2">판매 중인 상품 <small>${s.seller.products.filter(p => p.on).length}</small></h2><button class="more" data-act="scTab" data-arg="상품">관리 ${ic('chevR', 14)}</button></div>
      <div class="hscroll">${s.seller.products.map(p => `<button class="mini-item" data-act="scProdEdit" data-arg="${p.id}"><div class="ithumb">${itemArt(p)}</div><b>${esc(p.name)}</b></button>`).join('')}</div>`;
  },
  '주문'() {
    const S = ui.sc, F = S.of || '전체';
    const os = Store.state.sellerOrders.filter(o => F === '전체' || o.status === F);
    return `<div class="chips scroll-x">${['전체', ...ORDER_STEPS, '환불 요청', '주문 취소'].map(t => chip(t, F === t, 'scOrderF', t, 'xs')).join('')}</div>
      ${os.length ? `<div class="mylist mt12">${os.map(scOrderRow).join('')}</div>` : `<p class="sub mt12">${esc(F)} 주문이 없어요.</p>`}`;
  },
  '결제'() {
    const os = Store.state.sellerOrders;
    const sum = os.filter(o => o.status !== '주문 취소').reduce((a, o) => a + o.price, 0);
    const refund = os.filter(o => o.status === '주문 취소').reduce((a, o) => a + o.price, 0);
    return `<div class="sc-stats three">${[[won(sum), '결제 금액'], [won(refund), '취소 · 환불'], [won(Math.round(sum * PAY_FEE)), `수수료 ${PAY_FEE * 100}%`]].map(([n, l]) => `<div class="sc-stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
      <div class="pay-table mt16"><div class="pay-h"><span>결제일</span><span>주문</span><span>수단</span><span>금액</span></div>
      ${os.map(o => `<button class="pay-r ${o.status === '주문 취소' ? 'off' : ''}" data-act="scOrder" data-arg="${o.id}"><span>${fmtDate(dayKey(o.at)).slice(5)}</span><span class="clamp1">${esc(o.name)}<small>${esc(o.buyer)}</small></span><span>${esc(o.pay)}</span><span>${o.status === '주문 취소' ? '-' : ''}${won(o.price)}</span></button>`).join('')}</div>
      <p class="hint">실제 서비스에서는 PG사 결제 내역과 자동으로 맞춰져요.</p>`;
  },
  '상품'() {
    const ps = Store.state.seller.products;
    return `<button class="btn primary block" data-act="scProdNew">${ic('plus', 16)} 새 상품 등록</button>
      <div class="mylist mt12">${ps.map(p => `<div class="mrow line">
        <div class="ithumb xs">${itemArt(p)}</div>
        <button class="flex1 left" data-act="scProdEdit" data-arg="${p.id}"><b>${esc(p.name)}</b><span>${won(p.price)} · 재고 ${p.stock} · 판매 ${p.sold || 0}</span></button>
        ${toggle(p.on, 'scProdOn', p.id)}
      </div>`).join('')}</div>
      <p class="hint">켜 둔 상품은 코디SHOP '새상품 판매'에 바로 올라가요.</p>`;
  },
  '정산'() {
    const os = Store.state.sellerOrders.filter(o => o.status === '배송 완료');
    const wait = Store.state.sellerOrders.filter(o => ['결제 완료', '상품 준비', '배송 중'].includes(o.status));
    const amt = list => list.reduce((a, o) => a + Math.round(o.price * (1 - PAY_FEE)), 0);
    return `<div class="sc-stats three">${[[won(amt(os)), '정산 가능'], [won(amt(wait)), '배송 완료 후 정산'], [esc(Store.state.seller.account || '계좌 미등록'), '정산 계좌']].map(([n, l]) => `<div class="sc-stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
      <div class="soft-card mt16"><b>정산 일정</b><p class="sub">구매 확정(배송 완료) 후 7일 뒤 매주 수요일에 판매가에서 수수료 ${PAY_FEE * 100}%를 뺀 금액이 입금돼요.</p></div>
      <div class="mylist mt12">${os.map(o => `<div class="mrow line"><div class="flex1"><b>${esc(o.name)}</b><span>${esc(o.buyer)} · ${fmtDate(dayKey(o.at))}</span></div><span class="st ing">${won(Math.round(o.price * (1 - PAY_FEE)))}</span></div>`).join('') || '<p class="sub">아직 정산할 주문이 없어요.</p>'}</div>`;
  },
};
function scOrderRow(o) {
  return `<button class="mrow line" data-act="scOrder" data-arg="${o.id}"><div class="ithumb xs">${itemArt(o)}</div>
    <div class="flex1 left"><b>${esc(o.name)}</b><span>${esc(o.buyer)} · ${won(o.price)} · ${fmtDate(dayKey(o.at)).slice(5)}</span></div>
    <span class="st ${o.status === '결제 완료' || o.status === '환불 요청' ? 'ing' : ''}">${esc(o.status)}</span></button>`;
}
A.scTab = t => { ui.sc.tab = t; render(); };
A.scOrderF = t => { ui.sc.of = t; render(); };
A.scChats = () => { const m = Store.state.messages.find(x => x.seller && x.unread); if (m) A.openThread(m.id); };

/* 판매자: 주문 처리 (상품 준비 → 송장 입력 · 배송 중 → 배송 완료, 취소 · 환불 처리) */
A.scOrder = id => openSheet('scOrder', { side: true, id });
SHEETS.scOrder = sh => {
  const o = Store.state.sellerOrders.find(x => x.id === sh.id); if (!o) return sideHead('주문');
  const k = stepIdx(o.status);
  const next = { '결제 완료': ['상품 준비 시작', 'scNext'], '상품 준비': ['송장 입력하고 발송', 'scShip'], '배송 중': ['배송 완료 처리', 'scNext'] }[o.status];
  return `${sideHead('주문 처리')}
  <div class="sheet-body">
    <div class="od-top"><span class="sub sm">주문번호 ${esc(o.no)}</span><span class="st ing">${esc(o.status)}</span></div>
    ${k >= 0 ? `<div class="steps">${ORDER_STEPS.map((x, i) => `<div class="step-i ${i <= k ? 'done' : ''} ${i === k ? 'now' : ''}"><i>${i < k ? ic('check', 12) : i + 1}</i><span>${x}</span></div>`).join('')}</div>` : ''}
    <div class="lrow mt16"><div class="ithumb xs">${itemArt(o)}</div><b>${esc(o.name)}</b><span class="price">${won(o.price)}</span></div>
    <label class="field-label">구매자 · 배송지</label>
    <div class="kv"><div><span>주문자</span><b>${esc(o.buyer)}</b></div><div><span>연락처</span><b>${esc(o.phone)}</b></div><div><span>주소</span><b>${esc(o.addr)}</b></div>${o.memo ? `<div><span>요청</span><b>${esc(o.memo)}</b></div>` : ''}${o.tracking ? `<div><span>송장</span><b>${esc(o.tracking)}</b></div>` : ''}</div>
    <label class="field-label">결제</label>
    <div class="kv"><div><span>수단</span><b>${esc(o.pay)}</b></div><div><span>금액</span><b>${won(o.price)}</b></div><div><span>수수료</span><b>-${won(Math.round(o.price * PAY_FEE))}</b></div><div><span>정산액</span><b>${won(Math.round(o.price * (1 - PAY_FEE)))}</b></div></div>
    ${next ? `<button class="btn primary lg block mt16" data-act="${next[1]}" data-arg="${o.id}">${next[0]}</button>` : ''}
    ${o.status === '환불 요청' ? `<div class="row gap8 mt16"><button class="btn ghost flex1" data-act="scRefund" data-arg="${o.id}|no">환불 거절</button><button class="btn primary flex1" data-act="scRefund" data-arg="${o.id}|ok">환불 승인</button></div>` : ''}
    ${o.status === '결제 완료' ? `<button class="btn ghost block mt8 danger-t" data-act="scCancel" data-arg="${o.id}">판매 취소 (품절 등)</button>` : ''}
    <button class="btn ghost block mt8" data-act="scAsk" data-arg="${o.id}">${ic('chat', 16)} 구매자에게 메시지</button>
  </div>`;
};
/* 판매자 주문 상태가 바뀌면, 내가 구매자인 주문(직접 사 본 경우)도 같이 바뀜 */
function syncBuyer(o) { const b = o.buyerOrder && Store.state.orders.find(x => x.id === o.buyerOrder); if (b) { b.status = o.status; b.tracking = o.tracking; } }
function scSet(id, status, msg) { const o = Store.state.sellerOrders.find(x => x.id === id); o.status = status; syncBuyer(o); Store.save(); renderOverlay(); render(); toast(msg); }
A.scNext = id => { const o = Store.state.sellerOrders.find(x => x.id === id); const n = ORDER_STEPS[stepIdx(o.status) + 1]; scSet(id, n, `'${n}' 상태로 바꿨어요`); };
A.scShip = id => askText('송장 번호', '택배사 · 송장번호', v => { const o = Store.state.sellerOrders.find(x => x.id === id); o.tracking = v; scSet(id, '배송 중', '발송 처리했어요 · 구매자에게 알림이 가요'); });
A.scRefund = arg => { const [id, k] = arg.split('|'); scSet(id, k === 'ok' ? '주문 취소' : '배송 완료', k === 'ok' ? '환불을 승인했어요' : '환불을 거절했어요'); };
A.scCancel = id => askConfirm('판매 취소', '이 주문을 취소할까요? 구매자에게 전액 환불돼요.', '판매 취소', () => scSet(id, '주문 취소', '판매를 취소했어요'), true);
A.scAsk = id => { const o = Store.state.sellerOrders.find(x => x.id === id); const m = startThread(o.buyer, o.name); m.seller = true; Store.save(); A.openThread(m.id); };

/* 판매자: 상품 등록 · 수정 */
A.scProdNew = () => openSheet('scProd', { id: null, f: { name: '', price: '', stock: '10', cat: '상의', img: null, photo: null, desc: '' } });
A.scProdEdit = id => { const p = Store.state.seller.products.find(x => x.id === id); openSheet('scProd', { id, f: { ...p, price: String(p.price), stock: String(p.stock) } }); };
SHEETS.scProd = sh => {
  const f = sh.f;
  return `<div class="sheet-body"><h3 class="sheet-title">${ic('tag', 20)} ${sh.id ? '상품 수정' : '새 상품 등록'}</h3>
    <div class="row gap8 mt8"><div class="ithumb sm">${f.img || f.photos ? itemArt(f) : ic('image', 22)}</div>
      <div class="flex1"><button class="btn sm ghost" data-act="scProdPick">${ic('hanger', 14)} 내 옷장 사진에서 고르기</button><p class="hint">실제 서비스에서는 상품 사진을 여러 장 올려요.</p></div></div>
    <label class="field-label">상품명</label><input class="input" data-sp="name" value="${esc(f.name)}" placeholder="예) 울 블렌드 니트">
    <div class="row gap8"><div class="flex1"><label class="field-label">판매가 (원)</label><input class="input" data-sp="price" inputmode="numeric" value="${esc(f.price)}" placeholder="39000"></div>
      <div class="flex1"><label class="field-label">재고</label><input class="input" data-sp="stock" inputmode="numeric" value="${esc(f.stock)}"></div></div>
    <label class="field-label">분류</label><div class="chips wrap">${CATS.map(c => chip(c, f.cat === c, 'scProdCat', c, 'sm')).join('')}</div>
    <label class="field-label">설명</label><input class="input" data-sp="desc" value="${esc(f.desc || '')}" placeholder="소재, 핏, 세탁 방법">
    <div class="row gap8 mt16">${sh.id ? `<button class="btn ghost danger-t" data-act="scProdDel">${ic('trash', 16)}</button>` : ''}<button class="btn primary flex1" data-act="scProdOk">${sh.id ? '저장' : '등록하고 판매 시작'}</button></div>
  </div>`;
};
function keepSP() { const sh = topSheet(); $$('#overlay [data-sp]').forEach(el => { sh.f[el.dataset.sp] = el.value; }); }
A.scProdCat = c => { keepSP(); topSheet().f.cat = c; renderOverlay(); };
A.scProdPick = () => { keepSP(); const sh = topSheet(); openPicker({ mode: 'single', owner: 'me', title: '상품 사진으로 쓸 옷', onDone: ([id]) => { const it = itemById(id); Object.assign(sh.f, { img: it.img || null, photos: it.photos || [], color: it.color, sub: it.sub, cat: it.cat, name: sh.f.name || it.name }); renderOverlay(); } }); };
A.scProdOk = () => {
  keepSP();
  const sh = topSheet(), f = sh.f, price = parseInt(String(f.price).replace(/[^0-9]/g, ''), 10);
  if (!f.name.trim()) { toast('상품명을 입력해 주세요'); return; }
  if (!price) { toast('판매가를 숫자로 입력해 주세요'); return; }
  const ps = Store.state.seller.products;
  const data = { name: f.name.trim(), price, stock: parseInt(f.stock, 10) || 0, cat: f.cat, sub: f.sub || DEFAULT_SUB[f.cat], color: f.color || '#9CA3AF', img: f.img, photos: f.photos || [], desc: f.desc };
  if (sh.id) Object.assign(ps.find(x => x.id === sh.id), data);
  else ps.unshift({ id: uid('sp'), on: true, sold: 0, createdAt: Date.now(), ...data });
  Store.save(); closeSheet(); render(); toast(sh.id ? '상품을 수정했어요' : "등록했어요 · 코디SHOP '새상품 판매'에 올라갔어요");
};
A.scProdDel = () => askConfirm('상품 삭제', '이 상품을 삭제할까요?', '삭제', () => {
  const sh = topSheet(), s = Store.state; s.seller.products = s.seller.products.filter(x => x.id !== sh.id); Store.save(); closeAllSheets(); render();
}, true);
A.scProdOn = id => { const p = Store.state.seller.products.find(x => x.id === id); p.on = !p.on; Store.save(); render(); toast(p.on ? '판매를 시작했어요' : '판매를 멈췄어요'); };
