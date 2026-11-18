// SNX World service worker: all games work offline after the first visit.
// Score APIs (Supabase) always go to the network.
const CACHE = 'snx-world-v2';
const PAGES = ['./', './index.html', './snackrush.html', './match.html', './bubble.html', './slot.html', './paardenrace.html', './snxbar.html', './clubcup.html'];
const CORE = PAGES.concat(['./manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png']);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('.supabase.co/')) return;
  if (req.mode === 'navigate') {
    // newest version of the page first, its own cached copy when offline
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); }
    return r;
  })));
});
