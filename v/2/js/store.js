/* area — 저장소 (상태는 localStorage, 사진은 IndexedDB) */

const LS_KEY = 'area-snap-v2'; // 수정 기록용 고정 버전

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmtDate(key) { return key ? key.replaceAll('-', '.') : ''; }
function curSeason(d = new Date()) {
  const m = d.getMonth() + 1;
  return m >= 3 && m <= 5 ? '봄' : m >= 6 && m <= 8 ? '여름' : m >= 9 && m <= 11 ? '가을' : '겨울';
}
function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function defaultState() {
  return {
    version: 1,
    seedVer: SEED_VERSION,
    loggedIn: true,
    user: { name: '요섭', bio: '편안하고 차분한 스타일을 좋아해요.', styles: ['미니멀', '데일리', '가을'], gender: '선택 안 함' },
    family: [
      { id: 'me', name: '나', label: '내 옷' },
      { id: 'bro', name: '형', label: '형 옷' },
      { id: 'sis', name: '동생', label: '동생 옷' },
      { id: 'dad', name: '아빠', label: '아빠 옷' },
    ],
    locations: ['안방 옷장', '드레스룸', '서랍장', '신발장'],
    categories: [...CATS],
    customSubs: {},
    customStyles: [],
    recentColors: ['#1A1A1A', '#FFFFFF', '#9CA3AF', '#D9C2A0', '#9EC1E6', '#3F7D4E'],
    items: seedItems(),
    codis: seedCodis(),
    codiSeq: 6,
    sales: seedSales(),
    likes: [],      // 코디SHOP 하트
    requests: [],   // 코디SHOP 거래문의
    orders: [],     // 새상품 구매 · 환불 · 취소 내역
    messages: [...seedSaleChats(), ...seedMessages()],
  };
}

/* 예전에 저장된 데이터에 새 항목 채우기 */
function migrate(s) {
  const d = defaultState();
  ['orders', 'messages', 'sales', 'likes'].forEach(k => { if (!Array.isArray(s[k])) s[k] = d[k]; });
  s.requests = (s.requests || []).map(r => typeof r === 'string' ? { id: uid('rq'), target: r, status: '요청 중', at: Date.now() } : r);
  s.user = { ...d.user, ...s.user };
  delete s.weatherManual;
  // 데모 옷이 바뀌면 시드 옷 · 코디만 새로 교체 (직접 등록한 옷 · 만든 코디는 유지)
  if (s.seedVer !== SEED_VERSION) {
    const isSeed = id => !/^it/.test(id);
    s.items = [...d.items, ...s.items.filter(i => !isSeed(i.id))];
    const ids = new Set(s.items.map(i => i.id));
    s.codis = [...d.codis, ...s.codis.filter(c => !/^c[0-9]$/.test(c.id)).map(c => ({ ...c, items: c.items.filter(x => ids.has(x)) })).filter(c => c.items.length)];
    s.sales = s.sales.filter(x => ids.has(x.itemId));
    d.sales.forEach(x => { if (!s.sales.some(y => y.itemId === x.itemId)) s.sales.push(x); });
    d.messages.forEach(m => { if (!s.messages.some(y => y.id === m.id)) s.messages.push(m); });
    CATS.forEach((c, i) => { if (!s.categories.includes(c)) s.categories.splice(Math.min(i, s.categories.length), 0, c); });
    s.seedVer = SEED_VERSION;
  }
  // 예전 버그로 중복된 코디 정리
  const seen = new Set(); s.codis = s.codis.filter(c => !seen.has(c.id) && seen.add(c.id));
  return s;
}

const Store = {
  state: null,
  rev: 0,
  load() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && s.version === 1) { this.state = migrate(s); return; }
    } catch (e) { /* 손상된 데이터는 새로 시작 */ }
    this.state = defaultState();
    this.save();
  },
  save() {
    this.rev++;
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.state)); }
    catch (e) { console.warn(e); toast('저장 공간이 부족해요'); }
  },
  reset() {
    const loggedIn = this.state.loggedIn;
    IMG.clear();
    this.state = defaultState();
    this.state.loggedIn = loggedIn;
    this.save();
  },
};

const IMG = {
  cache: {},
  db: null,
  open() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('area-img-snap2', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('img');
        r.onsuccess = () => { this.db = r.result; res(); };
        r.onerror = () => res();
      } catch (e) { res(); }
    });
  },
  loadAll() {
    if (!this.db) return Promise.resolve();
    return new Promise(res => {
      try {
        const req = this.db.transaction('img', 'readonly').objectStore('img').openCursor();
        req.onsuccess = () => { const c = req.result; if (c) { this.cache[c.key] = c.value; c.continue(); } else res(); };
        req.onerror = () => res();
      } catch (e) { res(); }
    });
  },
  tx(fn) { if (!this.db) return; try { fn(this.db.transaction('img', 'readwrite').objectStore('img')); } catch (e) { console.warn(e); } },
  put(id, data) { this.cache[id] = data; this.tx(s => s.put(data, id)); },
  del(id) { delete this.cache[id]; this.tx(s => s.delete(id)); },
  clear() { this.cache = {}; this.tx(s => s.clear()); },
  get(id) { return this.cache[id]; },
};
