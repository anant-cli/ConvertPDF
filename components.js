/**
 * components.js - shared UI and trust enhancements for ConvertPDF
 * Adds: mobile nav, active link detection, accessibility helpers, cookie consent banner,
 * and symbol normalization for consistent user experience.
 */
(function () {
    'use strict';

    const CONSENT_KEY = 'convertpdf_cookie_consent_v1';
    const GA_ID = 'G-7FVBKG4BEH';
    const ADS_CLIENT = 'ca-pub-1745874358886453';
    const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

    function setupHamburger() {
        const nav = document.querySelector('.main-nav');
        const headerContainer = document.querySelector('.header-container');
        if (!nav || !headerContainer) return;

        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'main-nav-list');
        toggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

        headerContainer.insertBefore(toggle, nav);

        const ul = nav.querySelector('ul');
        if (ul) ul.id = 'main-nav-list';

        toggle.addEventListener('click', function () {
            const open = nav.classList.toggle('open');
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        document.addEventListener('click', function (e) {
            if (!headerContainer.contains(e.target) && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    function setActiveNavLink() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        document.querySelectorAll('.main-nav a').forEach(function (link) {
            link.classList.remove('active');
            const href = (link.getAttribute('href') || '').split('/').pop();
            if (
                href === filename ||
                (filename === '' && href === 'index.html') ||
                (filename === 'index.html' && href === 'index.html')
            ) {
                link.classList.add('active');
            }
        });
    }

    function ensureMainId() {
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }

    function ensureSkipLink() {
        ensureMainId();
        if (document.querySelector('.skip-link')) return;
        if (!document.body) return;

        const skip = document.createElement('a');
        skip.className = 'skip-link';
        skip.href = '#main-content';
        skip.textContent = 'Skip to main content';
        document.body.insertBefore(skip, document.body.firstChild);
    }

    function normalizeGlobalLabels() {
        const navMap = {
            'index.html': '🏠 Home',
            'all-tools.html': '🛠️ All Tools',
            'blog': '📰 Blog',
            'about.html': 'ℹ️ About',
            'contact.html': '📞 Contact',
            'privacy.html': '🔒 Privacy',
            'terms.html': '📜 Terms'
        };

        document.querySelectorAll('.main-nav a').forEach(function (a) {
            const href = a.getAttribute('href') || '';
            const lower = href.toLowerCase();
            if (lower.endsWith('index.html')) a.textContent = navMap['index.html'];
            else if (lower.endsWith('all-tools.html')) a.textContent = navMap['all-tools.html'];
            else if (lower.includes('blog/')) a.textContent = navMap.blog;
            else if (lower.endsWith('about.html')) a.textContent = navMap['about.html'];
            else if (lower.endsWith('contact.html')) a.textContent = navMap['contact.html'];
            else if (lower.endsWith('privacy.html')) a.textContent = navMap['privacy.html'];
            else if (lower.endsWith('terms.html')) a.textContent = navMap['terms.html'];
        });

        const logo = document.querySelector('.logo a');
        if (logo) {
            logo.textContent = '📄 ConvertPDF';
            if (!logo.getAttribute('title')) {
                logo.setAttribute('title', 'ConvertPDF - Home');
            }
        }

        document.querySelectorAll('.back-btn').forEach(function (btn) {
            if (/back to home/i.test(btn.textContent)) {
                btn.textContent = '🏠 Back to Home';
            }
        });

        document.querySelectorAll('.social-links a').forEach(function (a) {
            const title = (a.getAttribute('title') || '').toLowerCase();
            if (title.includes('github')) {
                a.textContent = '🐙';
                a.setAttribute('aria-label', 'GitHub');
            } else if (title.includes('email')) {
                a.textContent = '✉️';
                a.setAttribute('aria-label', 'Email');
            } else if (title.includes('twitter')) {
                a.textContent = '🐦';
                a.setAttribute('aria-label', 'Twitter (coming soon)');
            }
        });
    }

    function ensureToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
    }

    function isLocalRuntime() {
        return window.location.protocol === 'file:' || LOCAL_HOSTS.has(window.location.hostname);
    }

    function shouldLoadAds() {
        return localStorage.getItem(CONSENT_KEY) !== 'rejected';
    }

    function ensureDataLayer() {
        window.dataLayer = window.dataLayer || [];
        if (typeof window.gtag !== 'function') {
            window.gtag = function () {
                window.dataLayer.push(arguments);
            };
        }
    }

    function appendExternalScript(src, attributes) {
        if (document.querySelector('script[src="' + src + '"]')) return;

        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        if (attributes) {
            Object.keys(attributes).forEach(function (key) {
                script.setAttribute(key, attributes[key]);
            });
        }

        document.head.appendChild(script);
    }

    function initAnalyticsAndAds() {
        if (isLocalRuntime()) return;

        ensureDataLayer();
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { send_page_view: true });
        appendExternalScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);

        if (!shouldLoadAds()) return;

        let adsLoaded = false;
        const loadAds = function () {
            if (adsLoaded) return;
            adsLoaded = true;
            appendExternalScript(
                'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADS_CLIENT,
                { crossorigin: 'anonymous' }
            );
            ['scroll', 'mousemove', 'touchstart'].forEach(function(e) {
                window.removeEventListener(e, loadAds);
            });
        };

        ['scroll', 'mousemove', 'touchstart'].forEach(function(e) {
            window.addEventListener(e, loadAds, { once: true, passive: true });
        });
        window.setTimeout(loadAds, 5000);
    }

    function applyConsentMode(choice) {
        if (choice === 'rejected') {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.requestNonPersonalizedAds = 1;
        }

        if (typeof window.gtag === 'function') {
            const granted = choice === 'accepted' ? 'granted' : 'denied';
            window.gtag('consent', 'update', {
                ad_storage: granted,
                analytics_storage: granted,
                ad_user_data: granted,
                ad_personalization: granted
            });
        }
    }

    function hideCookieBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (!banner) return;
        banner.classList.remove('show');
        setTimeout(function () {
            banner.remove();
        }, 350);
    }

    function ensureCookieBanner() {
        const saved = localStorage.getItem(CONSENT_KEY);
        if (saved === 'accepted' || saved === 'rejected') {
            applyConsentMode(saved);
            return;
        }
        if (document.getElementById('cookie-consent-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = [
            '<div class="cookie-consent-content">',
            '<p>We use cookies for analytics and ads to keep ConvertPDF free. You can accept or reject non-essential cookies anytime. ',
            '<a href="' + (window.location.pathname.includes('/pages/') || window.location.pathname.includes('/blog/') ? '../privacy.html' : 'privacy.html') + '">Learn more</a>.</p>',
            '<div class="cookie-consent-actions">',
            '<button type="button" class="cookie-btn reject" id="cookie-reject">Reject</button>',
            '<button type="button" class="cookie-btn accept" id="cookie-accept">Accept</button>',
            '</div>',
            '</div>'
        ].join('');

        document.body.appendChild(banner);
        requestAnimationFrame(function () {
            banner.classList.add('show');
        });

        const accept = banner.querySelector('#cookie-accept');
        const reject = banner.querySelector('#cookie-reject');

        accept.addEventListener('click', function () {
            localStorage.setItem(CONSENT_KEY, 'accepted');
            applyConsentMode('accepted');
            hideCookieBanner();
        });

        reject.addEventListener('click', function () {
            localStorage.setItem(CONSENT_KEY, 'rejected');
            applyConsentMode('rejected');
            hideCookieBanner();
        });
    }

    // --- Premium UI Enhancements ---
    function initPremiumUI() {
        // 1. Scroll Reveals
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });

        // 2. Custom Cursor
        if (window.matchMedia("(pointer: fine)").matches) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            document.body.appendChild(cursor);

            let cursorX = 0, cursorY = 0;
            let targetX = 0, targetY = 0;

            document.addEventListener('mousemove', function(e) {
                targetX = e.clientX;
                targetY = e.clientY;
            });

            function renderCursor() {
                cursorX += (targetX - cursorX) * 0.2;
                cursorY += (targetY - cursorY) * 0.2;
                cursor.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px)';
                requestAnimationFrame(renderCursor);
            }
            requestAnimationFrame(renderCursor);

            const addHover = function() { cursor.classList.add('hover'); };
            const removeHover = function() { cursor.classList.remove('hover'); };

            // Apply hover to links/buttons but wait a bit for dynamic elements
            setTimeout(function() {
                document.querySelectorAll('a, button, .tool-card').forEach(function(el) {
                    el.addEventListener('mouseenter', addHover);
                    el.addEventListener('mouseleave', removeHover);
                });
            }, 500);
        }

        // 3. 3D Tilt & Spotlight for Tool Cards
        setTimeout(function() {
            document.querySelectorAll('.tool-card').forEach(function(card) {
                card.addEventListener('mousemove', function(e) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    card.style.setProperty('--mouse-x', x + 'px');
                    card.style.setProperty('--mouse-y', y + 'px');

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    
                    card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
                });

                card.addEventListener('mouseleave', function() {
                    card.style.transform = '';
                });
            });

            // 4. Magnetic Buttons
            document.querySelectorAll('.button, .download-btn').forEach(function(btn) {
                btn.addEventListener('mousemove', function(e) {
                    const rect = btn.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                    btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                });
                btn.addEventListener('mouseleave', function() {
                    btn.style.transform = '';
                });
            });
        }, 500); // wait for dynamic tool cards
    }

    function init() {
        ensureSkipLink();
        normalizeGlobalLabels();
        setupHamburger();
        setActiveNavLink();
        ensureToastContainer();
        ensureCookieBanner();
        initAnalyticsAndAds();
        initPremiumUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
