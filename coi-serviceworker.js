/* Adds the headers 3DS needs so no helper program is required.
   Only touches files from this site; other sites' files load normally. */
if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
  self.addEventListener('fetch', e => {
    const r = e.request;
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;
    if (new URL(r.url).origin !== self.location.origin) return;
    e.respondWith(fetch(r).then(resp => {
      if (resp.status === 0) return resp;
      const h = new Headers(resp.headers);
      h.set('Cross-Origin-Opener-Policy', 'same-origin');
      h.set('Cross-Origin-Embedder-Policy', 'require-corp');
      h.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return new Response(resp.body, {status: resp.status, statusText: resp.statusText, headers: h});
    }).catch(() => fetch(r)));
  });
} else if (!window.crossOriginIsolated && 'serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register(document.currentScript.src).then(reg => {
    if (reg.active && !navigator.serviceWorker.controller) { location.reload(); return; }
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w && w.addEventListener('statechange', () => { if (w.state === 'activated') location.reload(); });
    });
    navigator.serviceWorker.ready.then(() => { if (!window.crossOriginIsolated) setTimeout(() => location.reload(), 300); });
  }).catch(e => console.error('Setup worker failed', e));
}
