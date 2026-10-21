/* area — 오프라인용 서비스 워커: 항상 네트워크를 먼저 쓰고, 끊겼을 때만 저장해 둔 파일로 열기 */
const CACHE = 'area-v1';
const SHELL = ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'img/icon/icon-192.png',
  ...['data', 'icons', 'store', 'i18n-en', 'i18n', 'engine', 'ui', 'screens-main', 'screens-closet', 'screens-register', 'screens-codi', 'screens-seller', 'app'].map(n => `js/${n}.js`)];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // 같은 사이트의 앱 파일만 (날씨 API · 수정 기록 페이지 · 예전 버전은 손대지 않음)
  if (e.request.method !== 'GET' || u.origin !== location.origin || /\/(v|portfolio|site)\//.test(u.pathname)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
