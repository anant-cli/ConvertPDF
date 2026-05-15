// utils.js – shared helper functions

const CDN_INTEGRITY = {
    'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js': 'sha384-nFoSjZIoH3CCp8W639jJyQkuPHinJ2NHe7on1xvlUA7SuGfJAfvMldrsoAVm6ECz',
    'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js': 'sha384-weMABwrltA6jWR8DDe9Jp5blk+tZQh7ugpCsF3JwSA53WZM9/14PjS5LAJNHNjAI',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js': 'sha384-QsSpx6a0USazT7nK7w8qXDgpSAPhFsb2XtpoLFQ5+X2yFN6hvCKnwEzN8M5FWaJb',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js': 'sha384-hIoBPJpTUs74ddyc4bFZSM1TVlQDA60VBbJS0oA934VSz82sBx1X7kSx2ATBDIyd',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js': 'sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js': 'sha384-06z5D//U/xpvxZHuUz92xBvq3DqBBFi7Up53HRrbV7Jlv7Yvh/MZ7oenfUe9iCEt',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js': 'sha384-Uq05+JLko69eOiPr39ta9bh7kld5PKZoU+fF7g0EXTAriEollhZ+DrN8Q/Oi8J2Q',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js': 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js': 'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG',
    'https://cdn.jsdelivr.net/npm/pdf-lib-with-encrypt@1.2.1/dist/pdf-lib.min.js': 'sha384-kLfN3L+t+5ynoVlyBQoP7H06PdFmJ8uhHL/EmxEwqVyjkRHhqbHhufd16fN9Wm81',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js': 'sha384-HGmnkDZJy7mRkoARekrrj0VjEFSh9a0Z8qxGri/kTTAJkgR8hqD1lHsYSh3JdzRi',
    'https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js': 'sha384-WWGzNJbUWCKFUEexCVTZSZUJ64uYV7FqYVMG855l1ammDY4SH6oLEFuNF6exFtIl',
    'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js': 'sha384-qSFej5dZNviyoPgYJ5+Xk4bEbX8AYddxAHPuzs1aSgRiXxJ3qmyWNaPsRkpv/+x5',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css': 'sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css': 'sha384-wFjoQjtV1y5jVHbt0p35Ui8aV8GVpEZkyF99OXWqP/eNJDU93D3Ugxkoyh6Y2I4A'
};

// ---------- DOWNLOAD BLOB ----------
function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        link.remove();
    }, 100);
}

// ---------- TIMING / VALIDATION HELPERS ----------
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function validateFile(file, options = {}) {
    if (!file) return { valid: false, message: 'Please select a file.' };

    const {
        extensions = [],
        mimeTypes = [],
        maxSize = 50 * 1024 * 1024,
        label = 'file'
    } = options;

    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    const validExtension = extensions.length === 0 || extensions.some(ext => name.endsWith(ext.toLowerCase()));
    const validMime = mimeTypes.length === 0 || mimeTypes.some(mime => type === mime.toLowerCase());

    if (!validExtension && !validMime) {
        return { valid: false, message: `Please select a valid ${label}.` };
    }
    if (file.size > maxSize) {
        return { valid: false, message: `${label} is too large. Please use a file under ${formatFileSize(maxSize)}.` };
    }

    return { valid: true };
}

function fileMatchesAccept(file, accept) {
    if (!accept) return true;

    const tokens = accept.split(',').map(token => token.trim().toLowerCase()).filter(Boolean);
    if (tokens.length === 0) return true;

    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();

    return tokens.some(token => {
        if (token.startsWith('.')) return name.endsWith(token);
        if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
        return type === token;
    });
}

document.addEventListener('change', event => {
    const input = event.target;
    if (!input || input.type !== 'file' || !input.files || input.files.length === 0) return;

    const accept = input.getAttribute('accept');
    if (!accept) return;

    const invalidFile = Array.from(input.files).find(file => !fileMatchesAccept(file, accept));
    if (!invalidFile) return;

    input.value = '';
    if (window.showToast) {
        showToast('Please select a supported file type.', 'error');
    }
    event.stopImmediatePropagation();
}, true);

const rateLimiter = {
    lastAction: {},
    canProceed(action, cooldownMs = 1000) {
        const now = Date.now();
        const last = this.lastAction[action] || 0;
        if (now - last < cooldownMs) return false;
        this.lastAction[action] = now;
        return true;
    }
};
window.rateLimiter = rateLimiter;

function trackEvent(category, action, label) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// ---------- SEO HELPERS ----------
function updateMetaDescription(desc) {
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
        meta.setAttribute('content', desc);
    }
}

function updatePageTitle(title) {
    document.title = title + " – ConvertPDF";
}

// ---------- LOAD IMAGE FROM FILE ----------
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const CDN_FALLBACKS = {
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js': 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js': 'https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js',
    'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.5/purify.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js': 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js'
};

// ---------- DYNAMIC SCRIPT LOADER (with optional SRI) ----------
function loadScript(src, integrity, fallbackSrc) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        const sri = integrity || CDN_INTEGRITY[src];
        if (sri) {
            script.integrity = sri;
            script.crossOrigin = 'anonymous';
        }
        script.onload = () => resolve();
        script.onerror = () => {
            script.remove();
            const fallback = fallbackSrc || CDN_FALLBACKS[src];
            if (fallback) {
                loadScript(fallback, null, null).then(resolve).catch(reject);
                return;
            }
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

// ---------- DYNAMIC STYLESHEET LOADER (with optional SRI) ----------
function loadStylesheet(href, integrity) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`link[href="${href}"]`);
        if (existing) {
            resolve();
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        const sri = integrity || CDN_INTEGRITY[href];
        if (sri) {
            link.integrity = sri;
            link.crossOrigin = 'anonymous';
        }
        link.onload = resolve;
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
        document.head.appendChild(link);
    });
}

// ---------- PROCESSING SPINNER ----------
function showSpinner(message = 'Processing...') {
    let spinner = document.getElementById('global-processing-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'global-processing-spinner';
        spinner.className = 'processing-spinner-overlay';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-live', 'polite');
        spinner.innerHTML = '<div class="processing-spinner-box"><div class="spinner"></div><p></p></div>';
        document.body.appendChild(spinner);
    }
    const label = spinner.querySelector('p');
    if (label) label.textContent = message;
    spinner.hidden = false;
}

function hideSpinner() {
    const spinner = document.getElementById('global-processing-spinner');
    if (spinner) spinner.hidden = true;
}


// ---------- TOAST NOTIFICATIONS ----------
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.tabIndex = -1;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span><span>${message}</span>`;
    container.appendChild(toast);

    toast.offsetHeight;
    toast.classList.add('show');

    // Auto-remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---------- VISUAL HELPERS ----------
function updatePasswordStrengthMeter(password, meterBarId, textId) {
    const bar = document.getElementById(meterBarId);
    const text = document.getElementById(textId);
    if (!bar) return;

    let strength = 0;
    if (password.length > 0) {
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
    }

    const widths = ['0%', '20%', '40%', '60%', '80%', '100%'];
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60', '#27ae60'];
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    strength = Math.min(strength, 5);
    bar.style.width = widths[strength];
    bar.style.background = colors[strength];
    if (text) {
        text.textContent = labels[strength];
        text.style.color = colors[strength];
    }
}

function updateProgressBar(progressPercent, barId) {
    const bar = document.getElementById(barId);
    if (bar) {
        bar.style.width = `${progressPercent}%`;
    }
}

// ---------- FILE SIZE FORMATTER ----------
function formatFileSize(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n < 0) return '0 Bytes';
    if (n === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(n) / Math.log(k)));
    return parseFloat((n / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ---------- DRAG AND DROP HELPER ----------
function setupDropZone(dropZoneId, fileInputId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);

    if (!dropZone || !fileInput) return;

    if (isMobileDevice()) {
        const primaryText = dropZone.querySelector('p');
        if (primaryText && /drag/i.test(primaryText.textContent)) {
            primaryText.textContent = 'Tap to select your file';
        }
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('dragover'); // Fixed: was 'active'
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover'); // Fixed: was 'active'
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            // Trigger change event manually
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}
