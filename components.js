/**
 * components.js - shared UI and trust enhancements for ConvertPDF
 * Adds: mobile nav, active link detection, accessibility helpers, cookie consent banner,
 * and symbol normalization for consistent user experience.
 */
(function () {
    'use strict';

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

    /**
     * Consolidates label normalization and active link detection to reduce DOM traversals.
     */
    function initNavigation() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const navMap = {
            'index.html': '🏠 Home',
            'all-tools.html': '🛠️ All Tools',
            'blog': '📰 Blog',
            'about.html': 'ℹ️ About',
            'contact.html': '📞 Contact',
            'privacy.html': '🔒 Privacy',
            'terms.html': '📜 Terms'
        };

        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(function (link) {
            // 1. Normalize Labels
            const href = link.getAttribute('href') || '';
            const lower = href.toLowerCase();
            const cleanHref = href.split('/').pop() || 'index.html';
            
            if (lower.endsWith('index.html')) link.textContent = navMap['index.html'];
            else if (lower.endsWith('all-tools.html')) link.textContent = navMap['all-tools.html'];
            else if (lower.includes('blog/')) link.textContent = navMap.blog;
            else if (lower.endsWith('about.html')) link.textContent = navMap['about.html'];
            else if (lower.endsWith('contact.html')) link.textContent = navMap['contact.html'];
            else if (lower.endsWith('privacy.html')) link.textContent = navMap['privacy.html'];
            else if (lower.endsWith('terms.html')) link.textContent = navMap['terms.html'];

            // 2. Set Active State
            link.classList.remove('active');
            if (cleanHref === filename || (filename === 'index.html' && cleanHref === 'index.html')) {
                link.classList.add('active');
            }
        });

        // Other UI normalization
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
            }
        });
    }

    function ensureMainId() {
        const existingTarget = document.getElementById('main-content');
        if (existingTarget) return;

        const main = document.querySelector('main');
        if (main) {
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

    const CONSENT_STORAGE_KEY = 'convertpdf_consent_v1';

    function applyConsentChoice(choice) {
        if (typeof window.gtag !== 'function') return;
        if (choice === 'all') {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted'
            });
        } else {
            window.gtag('consent', 'update', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'granted'
            });
        }
    }

    function setupCookieConsent() {
        if (document.getElementById('cookie-consent-root')) return;
        try {
            var stored = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (stored === 'all' || stored === 'essential') {
                applyConsentChoice(stored === 'all' ? 'all' : 'essential');
                return;
            }
        } catch (ignore) { /* private mode */ }

        var root = document.createElement('div');
        root.id = 'cookie-consent-root';
        root.className = 'cookie-consent-root';
        root.innerHTML =
            '<div class="cookie-consent-inner" role="dialog" aria-labelledby="cookie-consent-title">' +
            '<p id="cookie-consent-title" class="cookie-consent-title">Cookies and privacy</p>' +
            '<p class="cookie-consent-text">We use essential cookies for basic functionality, Google Analytics for anonymous traffic statistics, and (where enabled) marketing cookies for advertising. Your documents are processed in your browser and are not uploaded. Read our <a href="/privacy.html">Privacy Policy</a>.</p>' +
            '<div class="cookie-consent-actions">' +
            '<button type="button" class="button cookie-btn-accept" id="cookie-consent-accept">Accept optional cookies</button>' +
            '<button type="button" class="button secondary cookie-btn-ess" id="cookie-consent-essential">Essential only</button>' +
            '</div></div>';
        document.body.appendChild(root);

        document.getElementById('cookie-consent-accept').addEventListener('click', function () {
            try { localStorage.setItem(CONSENT_STORAGE_KEY, 'all'); } catch (e) { /* ignore */ }
            applyConsentChoice('all');
            root.remove();
        });
        document.getElementById('cookie-consent-essential').addEventListener('click', function () {
            try { localStorage.setItem(CONSENT_STORAGE_KEY, 'essential'); } catch (e) { /* ignore */ }
            applyConsentChoice('essential');
            root.remove();
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

        // 2. Custom cursor & Interactive effects
        const isDesktop = window.matchMedia('(pointer: fine)').matches;
        const allowMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isDesktop && allowMotion) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            document.body.appendChild(cursor);

            document.addEventListener('mousemove', function (e) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }, { passive: true });

            const addHover = function () { cursor.classList.add('hover'); };
            const removeHover = function () { cursor.classList.remove('hover'); };

            /**
             * Attaches listeners to interactive elements, including those added dynamically.
             */
            const attachInteractiveListeners = function(root) {
                const elements = root.querySelectorAll('a, button, .tool-card');
                elements.forEach(function (el) {
                    el.addEventListener('mouseenter', addHover);
                    el.addEventListener('mouseleave', removeHover);
                    
                    // 3D Tilt for tool cards
                    if (el.classList.contains('tool-card')) {
                        el.addEventListener('mousemove', handleCardTilt);
                        el.addEventListener('mouseleave', resetCardTilt);
                    }
                    
                    // Magnetic effect for buttons
                    if (el.classList.contains('button') || el.classList.contains('download-btn')) {
                        el.addEventListener('mousemove', handleButtonMagnet);
                        el.addEventListener('mouseleave', resetButtonMagnet);
                    }
                });
            };

            function handleCardTilt(e) {
                const card = e.currentTarget;
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
            }

            function resetCardTilt(e) {
                e.currentTarget.style.transform = '';
            }

            function handleButtonMagnet(e) {
                const btn = e.currentTarget;
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            }

            function resetButtonMagnet(e) {
                e.currentTarget.style.transform = '';
            }

            // Initial attachment
            attachInteractiveListeners(document);

            // MutationObserver for dynamic content (like tool grids)
            const dynamicObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            attachInteractiveListeners(node);
                            if (node.matches('a, button, .tool-card')) {
                                node.addEventListener('mouseenter', addHover);
                                node.addEventListener('mouseleave', removeHover);
                            }
                        }
                    });
                });
            });

            dynamicObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function ensureToastContainer() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    function ensurePrivacyNote() {
        const footer = document.querySelector('.site-footer .footer-bottom');
        if (!footer || footer.querySelector('.privacy-note')) return;

        const note = document.createElement('p');
        note.className = 'privacy-note';
        note.textContent = 'We use Google Analytics for anonymous traffic. Optional ads may appear if you accept marketing cookies in the banner. Your documents are never uploaded.';
        // Insert at the beginning to keep copyright at the bottom
        footer.insertBefore(note, footer.firstChild);
    }

    function init() {
        setupCookieConsent();
        ensureSkipLink();
        ensurePrivacyNote();
        initNavigation();
        setupHamburger();
        ensureToastContainer();
        initPremiumUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
