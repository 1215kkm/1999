/* 한국어 / English 전환: 주소의 ?lang=en → 저장된 선택 → 브라우저 언어 순서 */
(function () {
  const q = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('area-site-lang'); } catch (e) { /* 저장 불가 환경 */ }
  const lang = q || saved || ((navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en');
  const set = l => {
    document.documentElement.lang = l;
    const t = document.querySelector('meta[name="title-' + l + '"]'); if (t) document.title = t.content;
    document.querySelectorAll('.lang').forEach(b => { b.textContent = l === 'ko' ? 'English' : '한국어'; });
    try { localStorage.setItem('area-site-lang', l); } catch (e) { /* 무시 */ }
  };
  set(lang === 'en' ? 'en' : 'ko');
  document.addEventListener('click', e => { if (e.target.closest('.lang')) set(document.documentElement.lang === 'ko' ? 'en' : 'ko'); });
})();
