/**
 * components.js - Shared UI and trust enhancements for ConvertPDF
 * Production-ready version with enhanced accessibility, performance optimizations,
 * and improved user experience features.
 * @version 2.0.0
 */

(function () {
    'use strict';

    // ==================== CONSTANTS ====================

    const CONSTANTS = {
        CONSENT_STORAGE_KEY: 'convertpdf_consent_v1',
        ANIMATION_DELAY: 500,
        INTERSECTION_THRESHOLD: 0.1,
        TILT_SENSITIVITY: 10,
        MAGNETIC_SENSITIVITY: 0.3,
    };

    // ==================== MOBILE NAVIGATION ====================

    /**
     * Sets up hamburger menu for mobile navigation
     */
    function setupHamburger() {
        const nav = document.querySelector('.main-nav');
        const headerContainer = document.querySelector('.header-container');
        
        if (!nav || !headerContainer) return;

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'main-nav-list');
        toggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

        headerContainer.insertBefore(toggle, nav);

        // Set ID for aria-controls
        const ul = nav.querySelector('ul');
        if (ul) {
            ul.id = 'main-nav-list';
        }

        // Toggle handler
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            
            // Trap focus in menu when open
            if (isOpen) {
                trapFocus(nav);
            }
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!headerContainer.contains(e.target) && nav.classList.contains('open')) {
                closeMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeMenu();
                toggle.focus();
            }
        });

        // Close menu helper
        function closeMenu() {
            nav.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }

        // Focus trap for accessibility
        function trapFocus(element) {
            const focusableElements = element.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }

    // ==================== NAVIGATION HELPERS ====================

    /**
     * Sets active class on current navigation link
     */
    function setActiveNavLink() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        document.querySelectorAll('.main-nav a').forEach(function (link) {
            link.classList.remove('active');
            
            const href = (link.getAttribute('href') || '').split('/').pop();
            const isActive = (
                href === filename ||
                (filename === '' && href === 'index.html') ||
                (filename === 'index.html' && href === 'index.html')
            );
            
            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // ==================== ACCESSIBILITY ENHANCEMENTS ====================

    /**
     * Ensures main content has proper ID for skip link
     */
    function ensureMainId() {
        const existingTarget = document.getElementById('main-content');
        if (existingTarget) return;

        const main = document.querySelector('main');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1'); // Allow programmatic focus
        }
    }

    /**
     * Adds skip-to-content link for keyboard navigation
     */
    function ensureSkipLink() {
        ensureMainId();
        
        if (document.querySelector('.skip-link')) return;
        if (!document.body) return;

        const skip = document.createElement('a');
        skip.className = 'skip-link';
        skip.href = '#main-content';
        skip.textContent = 'Skip to main content';
        
        skip.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.getElementById('main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        document.body.insertBefore(skip, document.body.firstChild);
    }

    // ==================== UI NORMALIZATION ====================

    /**
     * Normalizes navigation labels with consistent icons
     */
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
            
            for (const [key, value] of Object.entries(navMap)) {
                if (lower.endsWith(key) || (key === 'blog' && lower.includes('blog/'))) {
                    a.textContent = value;
                    break;
                }
            }
        });

        // Update logo
        const logo = document.querySelector('.logo a');
        if (logo) {
            logo.textContent = '📄 ConvertPDF';
            if (!logo.getAttribute('title')) {
                logo.setAttribute('title', 'ConvertPDF - Home');
            }
            if (!logo.getAttribute('aria-label')) {
                logo.setAttribute('aria-label', 'ConvertPDF Home');
            }
        }

        // Normalize back buttons
        document.querySelectorAll('.back-btn').forEach(function (btn) {
            if (/back to home/i.test(btn.textContent)) {
                btn.textContent = '🏠 Back to Home';
            }
        });

        // Normalize social links
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

    /**
     * Normalizes footer with dynamic year and consistent icons
     */
    function normalizeFooterDetails() {
        document.querySelectorAll('.site-footer h4').forEach(function (heading) {
            if (heading.textContent.trim() === 'Tools') {
                heading.innerHTML = '&#128736; Tools';
            }
        });

        // Update copyright year
        const currentYear = new Date().getFullYear();
        document.querySelectorAll('.footer-bottom p').forEach(function (p) {
            p.innerHTML = p.innerHTML.replace(/(&copy;|©)\s*\d{4}/, '&copy; ' + currentYear);
        });
    }

    // ==================== COOKIE CONSENT ====================

    /**
     * Applies user's consent choice
     * @param {string} choice - 'all' or 'essential'
     */
    function applyConsentChoice(choice) {
        if (typeof window.__updateAdConsent === 'function') {
            window.__updateAdConsent(choice);
        } else if (typeof window.gtag === 'function') {
            // Fallback if analytics-head.js not yet loaded
            const consentSettings = choice === 'all' ? {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted'
            } : {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'granted'
            };
            
            window.gtag('consent', 'update', consentSettings);
        }
    }

    /**
     * Sets up cookie consent banner
     */
    function setupCookieConsent() {
        if (document.getElementById('cookie-consent-root')) return;

        // Check for existing consent
        try {
            const stored = localStorage.getItem(CONSTANTS.CONSENT_STORAGE_KEY);
            if (stored === 'all' || stored === 'essential') {
                applyConsentChoice(stored);
                return;
            }
        } catch (e) {
            console.warn('localStorage not available:', e);
        }

        // Create consent banner
        const root = document.createElement('div');
        root.id = 'cookie-consent-root';
        root.className = 'cookie-consent-root';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-labelledby', 'cookie-consent-title');
        root.setAttribute('aria-modal', 'true');
        root.innerHTML = `
            <div class="cookie-consent-inner">
                <p id="cookie-consent-title" class="cookie-consent-title">Cookies &amp; Privacy</p>
                <p class="cookie-consent-text">
                    We use essential cookies to keep the site working, Google Analytics for anonymous traffic statistics, 
                    and (if you accept) advertising cookies for Google AdSense ads that help fund free access. 
                    Your documents are processed entirely in your browser and never uploaded. 
                    <a href="/privacy.html">Privacy Policy</a>
                </p>
                <div class="cookie-consent-actions">
                    <button type="button" class="button cookie-btn-accept" id="cookie-consent-accept">Accept all</button>
                    <button type="button" class="button secondary cookie-btn-ess" id="cookie-consent-essential">Essential only</button>
                    <button type="button" class="button secondary cookie-btn-reject" id="cookie-consent-reject">Reject all</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(root);

        // Handler for consent choice
        function handleConsent(choice) {
            try {
                localStorage.setItem(CONSTANTS.CONSENT_STORAGE_KEY, choice);
            } catch (e) {
                console.warn('Failed to save consent:', e);
            }
            
            applyConsentChoice(choice);
            
            // Fade out and remove
            root.style.opacity = '0';
            setTimeout(() => root.remove(), 300);
        }

        // Event listeners
        document.getElementById('cookie-consent-accept').addEventListener('click', () => {
            handleConsent('all');
        });
        
        document.getElementById('cookie-consent-essential').addEventListener('click', () => {
            handleConsent('essential');
        });
        
        document.getElementById('cookie-consent-reject').addEventListener('click', () => {
            handleConsent('essential');
        });
    }

    // ==================== PREMIUM UI ENHANCEMENTS ====================

    /**
     * Initializes premium UI features (animations, 3D effects)
     */
    function initPremiumUI() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isDesktop = window.matchMedia('(pointer: fine)').matches;

        // 1. Scroll reveals with Intersection Observer
        initScrollReveals();

        // 2. Custom cursor (desktop only, respects motion preferences)
        if (isDesktop && !prefersReducedMotion) {
            initCustomCursor();
        }

        // 3. 3D tilt and spotlight effects for cards
        if (!prefersReducedMotion) {
            setTimeout(() => {
                init3DTiltEffects();
                initMagneticButtons();
            }, CONSTANTS.ANIMATION_DELAY);
        }
    }

    /**
     * Initializes scroll-reveal animations
     */
    function initScrollReveals() {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target); // Only animate once
                    }
                });
            },
            {
                threshold: CONSTANTS.INTERSECTION_THRESHOLD,
                rootMargin: '50px'
            }
        );

        document.querySelectorAll('.reveal').forEach(function (el) {
            observer.observe(el);
        });
    }

    /**
     * Initializes custom cursor effect
     */
    function initCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        // Smooth cursor movement
        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        function animateCursor() {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            cursorX += dx * 0.1;
            cursorY += dy * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        
        animateCursor();

        // Hover effects
        const addHover = () => cursor.classList.add('hover');
        const removeHover = () => cursor.classList.remove('hover');

        setTimeout(function () {
            document.querySelectorAll('a, button, .tool-card').forEach(function (el) {
                el.addEventListener('mouseenter', addHover);
                el.addEventListener('mouseleave', removeHover);
            });
        }, CONSTANTS.ANIMATION_DELAY);
    }

    /**
     * Initializes 3D tilt effects on tool cards
     */
    function init3DTiltEffects() {
        document.querySelectorAll('.tool-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Update CSS variables for spotlight effect
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');

                // Calculate tilt
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -CONSTANTS.TILT_SENSITIVITY;
                const rotateY = ((x - centerX) / centerX) * CONSTANTS.TILT_SENSITIVITY;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    /**
     * Initializes magnetic button effects
     */
    function initMagneticButtons() {
        document.querySelectorAll('.button, .download-btn').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * CONSTANTS.MAGNETIC_SENSITIVITY;
                const y = (e.clientY - rect.top - rect.height / 2) * CONSTANTS.MAGNETIC_SENSITIVITY;
                
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
            });
        });
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Ensures toast container exists
     */
    function ensureToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('role', 'status');
        document.body.appendChild(container);
    }

    /**
     * Adds privacy note to footer
     */
    function ensurePrivacyNote() {
        const footer = document.querySelector('.site-footer .footer-bottom');
        if (!footer || footer.querySelector('.privacy-note')) return;

        const note = document.createElement('p');
        note.className = 'privacy-note';
        note.textContent = 'We use Google Analytics for anonymous traffic. Optional ads may appear if you accept marketing cookies in the banner. Your documents are never uploaded.';
        footer.insertBefore(note, footer.firstChild);
    }

    /**
     * Creates ad slot placeholders
     */
    function ensureAdSlots() {
        if (!document.body || document.querySelector('.ad-slot')) return;

        const anchor = document.querySelector('#toolContainer') || document.querySelector('.content-section');
        if (!anchor || !anchor.parentNode) return;

        const slot = document.createElement('aside');
        slot.className = 'ad-slot';
        slot.setAttribute('aria-label', 'Advertisement');
        slot.setAttribute('role', 'complementary');
        slot.hidden = true;
        slot.innerHTML = '<span>Advertisement</span>';

        anchor.parentNode.insertBefore(slot, anchor.nextSibling);
    }

    /**
     * Ensures PWA support with service worker
     */
    function ensurePwaSupport() {
        // Add manifest link if missing
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifest = document.createElement('link');
            manifest.rel = 'manifest';
            manifest.href = '/manifest.json';
            document.head.appendChild(manifest);
        }

        // Register service worker for offline support
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js')
                    .then(function (registration) {
                        console.log('ServiceWorker registration successful');
                    })
                    .catch(function (err) {
                        console.warn('ServiceWorker registration failed:', err);
                    });
            });
        }
    }

    // ==================== INITIALIZATION ====================

    /**
     * Main initialization function
     */
    function init() {
        // Core functionality
        setupCookieConsent();
        ensureSkipLink();
        ensurePrivacyNote();
        normalizeGlobalLabels();
        normalizeFooterDetails();
        ensurePwaSupport();
        ensureAdSlots();
        setupHamburger();
        setActiveNavLink();
        ensureToastContainer();
        
        // Premium UI features
        initPremiumUI();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();