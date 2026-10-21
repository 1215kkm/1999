/* area — 영어 화면: 그려질 HTML의 한글 문구를 사전(i18n-en.js)으로 바꿔 줌
   화면 코드는 한글 그대로 두고, 그리기 직전에 글자 · 안내문(aria-label, placeholder, title, alt)만 번역 */

const HANGUL = /[가-힣]/;
const I18N = {
  lang: 'ko',
  exact: new Map(),
  pats: [],
  memo: new Map(),
  ready: false,

  /* 사전 준비: {} 자리 문구는 정규식으로, 앞뒤 {}(보통 아이콘)를 뗀 형태도 함께 등록 */
  build() {
    if (this.ready || typeof I18N_EN === 'undefined') return;
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const numbered = v => { let n = 0; return v.replace(/\{(\d*)\}/g, (_, d) => `{${d || ++n}}`); };
    const add = (k, v) => {
      if (!k || !HANGUL.test(k)) return;
      if (!k.includes('{}')) { if (!this.exact.has(k)) this.exact.set(k, v); return; }
      const re = new RegExp('^' + k.split('{}').map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('(.+?)') + '$');
      this.pats.push({ re, out: v, weight: k.replace(/\{\}/g, '').length });
    };
    for (const [k0, v0] of Object.entries(I18N_EN)) {
      let k = norm(k0), v = numbered(norm(v0));
      add(k, v);
      // 앞뒤 {} 떼기(여러 겹도): 영어 쪽도 같은 자리에 {1} / {마지막}이 있을 때만
      let holes = (k.match(/\{\}/g) || []).length;
      for (let moved = true; moved && holes;) {
        moved = false;
        if (k.startsWith('{}') && v.startsWith('{1}')) {
          k = k.slice(2).trim(); v = v.slice(3).trim().replace(/\{(\d+)\}/g, (_, d) => `{${d - 1}}`);
          holes--; moved = true; add(k, v);
        }
        const last = `{${holes}}`;
        if (holes && k.endsWith('{}') && v.endsWith(last)) {
          k = k.slice(0, -2).trim(); v = v.slice(0, -last.length).trim();
          holes--; moved = true; add(k, v);
        }
      }
    }
    // 고정 글자가 긴 문구부터 맞춰 봄
    this.pats.sort((a, b) => b.weight - a.weight);
    this.ready = true;
  },

  init() {
    const p = Store.state.prefs || {};
    this.set(p.lang || ((navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en'));
  },
  set(lang) {
    this.lang = lang === 'en' ? 'en' : 'ko';
    if (this.lang === 'en') this.build();
    this.memo.clear();
    document.documentElement.lang = this.lang;
    document.title = this.lang === 'en' ? 'area · My Closet' : 'area · 내 옷장';
  },

  /* 문구 하나 번역 (html: HTML 안의 글자면 &#39; 같은 이스케이프를 풀어서 번역하고 다시 이스케이프) */
  text(s, html = false) {
    if (this.lang === 'ko' || s == null) return s;
    s = String(s);
    if (!HANGUL.test(s)) return s;
    const key = (html ? 'h' : 't') + s, hit = this.memo.get(key);
    if (hit != null) return hit;
    const raw = html ? s.replace(/&(#39|quot|amp|lt|gt);/g, (_, e) => ({ '#39': "'", quot: '"', amp: '&', lt: '<', gt: '>' }[e])) : s;
    const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
    let out = m[1] + this.core(m[2].replace(/\s+/g, ' '), 0) + m[3];
    if (html) out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (this.memo.size > 20000) this.memo.clear();
    this.memo.set(key, out);
    return out;
  },
  core(c, depth) {
    if (!HANGUL.test(c)) return c;
    const ex = this.exact.get(c);
    if (ex != null) return ex;
    if (depth < 4) {
      for (const p of this.pats) {
        const r = c.match(p.re); if (!r) continue;
        return p.out.split(/(\{\d+\})/).map(part => {
          const d = part.match(/^\{(\d+)\}$/);
          return d ? this.core((r[Number(d[1])] || '').trim(), depth + 1) : part;
        }).join('');
      }
      // 가운뎃점 · 쉼표로 이어진 문구는 나눠서
      for (const sep of [' · ', ' / ', ', ', ' | ']) if (c.includes(sep)) return c.split(sep).map(x => this.core(x.trim(), depth + 1)).join(sep);
      // 앞뒤의 이모지 · 기호(@, ', 괄호 등)는 떼고 가운데만
      const sym = c.match(/^([^\p{L}\p{N}]+)?([\s\S]*?)([^\p{L}\p{N}]+)?$/u);
      if (sym && (sym[1] || sym[3]) && sym[2]) return (sym[1] || '') + this.core(sym[2], depth + 1) + (sym[3] || '');
      // 띄어쓰기로 이어진 낱말이 모두 사전에 있으면 낱말마다 (예: '편안한 데일리룩')
      const words = c.split(' ');
      if (words.length > 1 && words.every(w => !HANGUL.test(w) || this.exact.has(w))) return words.map(w => this.exact.get(w) || w).join(' ');
    }
    return c
      .replace(/([\d,]+)\s?원/g, '₩$1')
      .replace(/([\d.]+)\s?벌/g, '$1 pcs')
      .replace(/([\d,]+)\s?개/g, '$1')
      .replace(/(\d+)\s?회/g, '$1×')
      .replace(/(\d+)\s?명/g, '$1 people')
      .replace(/(\d+)\s?분 전/g, '$1m ago')
      .replace(/(\d+)\s?시간 전/g, '$1h ago')
      .replace(/(\d+)\s?일 전/g, '$1d ago')
      .replace(/(\d+)\s?도/g, '$1°');
  },

  /* 그릴 HTML 전체: 태그 사이 글자와 안내 속성만 */
  html(h) {
    if (this.lang === 'ko' || !HANGUL.test(h)) return h;
    return h
      .replace(/(^|>)([^<]+)(?=<|$)/g, (m, a, t) => a + this.text(t, true))
      .replace(/\s(aria-label|placeholder|title|alt)="([^"]*)"/g, (m, k, v) => ` ${k}="${HANGUL.test(v) ? this.text(v, true).replace(/"/g, '&quot;') : v}"`);
  },
};
const T = s => I18N.text(s);
function setHTML(el, html) { el.innerHTML = I18N.html(html); }
