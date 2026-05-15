const CACHE_NAME = 'convertpdf-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/all-tools.html',
    '/styles.css',
    '/utils.js',
    '/script.js',
    '/components.js',
    '/favicon.png',
    '/manifest.json',
    '/tools/loader.js',
    '/pages/md2pdf.html',
    '/tools/md2pdf.js',
    '/pages/pdfencrypt.html',
    '/tools/pdfencrypt.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }

                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    return response;
                }))
    );
});
