// ════════════════════════════════════════════════════════════════
// EDS Especialista em Cantos — Service Worker (PWA v1.0)
// ════════════════════════════════════════════════════════════════
// Estratégias:
//   • CACHE-FIRST: index.html, icon.svg, manifest, libs externas
//     → app abre instantâneo e funciona offline
//   • NETWORK-FIRST: data/*.js (datasets das ligas)
//     → atualizações do scraper passam quando online,
//       cai pra cache se offline
// ════════════════════════════════════════════════════════════════

const VERSION = 'eds-pwa-v1.0.0-2026-04-26';
const APP_CACHE  = `${VERSION}-app`;
const DATA_CACHE = `${VERSION}-data`;

// Recursos que blindamos no cache desde a instalação
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW]', VERSION, 'instalando...');
  event.waitUntil(
    caches.open(APP_CACHE).then(cache => {
      // addAll falha se um único recurso 404 — fazemos um por um pra resiliência
      return Promise.all(APP_SHELL.map(url =>
        cache.add(url).catch(err => console.warn('[SW] falha ao cachear', url, err))
      ));
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW]', VERSION, 'ativando — limpando caches antigos');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Só interceptamos GET HTTP/HTTPS — ignora POST, websockets, etc.
  if (req.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // ── 1. API Anthropic e endpoints externos: deixa passar direto (sem cache)
  if (url.hostname.includes('anthropic.com') || url.hostname.includes('googleapis.com')) {
    return; // bypass total — net-only
  }

  // ── 2. Datasets das ligas em data/*.js → NETWORK-FIRST
  // Se o scraper atualizou, queremos a versão nova. Cai pra cache se offline.
  if (url.pathname.includes('/data/') || url.pathname.includes('/dados/')) {
    event.respondWith(networkFirst(req, DATA_CACHE));
    return;
  }

  // ── 3. App shell e libs externas (Tesseract, Chart.js, fonts) → CACHE-FIRST
  // App abre instantâneo, atualiza quando há rede.
  event.respondWith(cacheFirst(req, APP_CACHE));
});

// ── ESTRATÉGIA: cache-first ──────────────────────────────────────
async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) {
    // Atualiza em background pra próxima visita (stale-while-revalidate)
    fetch(req).then(res => {
      if (res && res.ok) caches.open(cacheName).then(c => c.put(req, res.clone()));
    }).catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch(err) {
    // Fallback offline: se for navegação, volta o index.html cacheado
    if (req.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    throw err;
  }
}

// ── ESTRATÉGIA: network-first ────────────────────────────────────
async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch(err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw err;
  }
}

// ── MENSAGEM DO APP (pra forçar atualização) ─────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
