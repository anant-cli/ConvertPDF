const CACHE_NAME = 'convertpdf-v5';
const AD_DOMAINS = [
    'googlesyndication.com',
    'doubleclick.net',
    'googleads.g.doubleclick.net',
    'adtrafficquality.google',
    'google-analytics.com',
    'googletagmanager.com'
];

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/all-tools.html',
    '/styles.css',
    '/utils.js',
    '/script.js',
    '/components.js',
    '/analytics-head.js',
    '/favicon.png',
    '/manifest.json',
    '/tools/loader.js',
    '/pages/compresspdf.html',
    '/pages/docx2pdf.html',
    '/pages/img2pdf.html',
    '/pages/img2png.html',
    '/pages/md2pdf.html',
    '/pages/mergepdf.html',
    '/pages/pagenumbers.html',
    '/pages/pdf2jpg.html',
    '/pages/pdfencrypt.html',
    '/pages/qrmaker.html',
    '/pages/rotatepdf.html',
    '/pages/signpdf.html',
    '/pages/splitpdf.html',
    '/pages/txt2docx.html',
    '/pages/watermarkpdf.html',
    '/pages/web2pdf.html',
    '/tools/compresspdf.js',
    '/tools/docx2pdf.js',
    '/tools/img2pdf.js',
    '/tools/img2png.js',
    '/tools/md2pdf.js',
    '/tools/mergepdf.js',
    '/tools/pagenumbers.js',
    '/tools/pdf2jpg.js',
    '/tools/pdfencrypt.js',
    '/tools/qrmaker.js',
    '/tools/rotatepdf.js',
    '/tools/signpdf.js',
    '/tools/splitpdf.js',
    '/tools/txt2docx.js',
    '/tools/watermarkpdf.js',
    '/tools/web2pdf.js'
];

function isAdRequest(url) {
    return AD_DOMAINS.some(domain => url.includes(domain));
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log('[SW] Deleting old cache:', key);
                    return caches.delete(key);
                })
            ))
            .then(() => self.clients.claim())
    );
});

// Stale-while-revalidate strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (isAdRequest(event.request.url)) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fail silently, we'll return the cached response if available
                });

                return cachedResponse || fetchPromise;
            });
        })
    );
});
