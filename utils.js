// utils.js – shared helper functions

// ---------- DOWNLOAD BLOB ----------
function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
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

// ---------- DYNAMIC SCRIPT LOADER (with optional SRI) ----------
function loadScript(src, integrity) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        if (integrity) {
            script.integrity = integrity;
            script.crossOrigin = 'anonymous';
        }
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
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
        if (integrity) {
            link.integrity = integrity;
            link.crossOrigin = 'anonymous';
        }
        link.onload = resolve;
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
        document.head.appendChild(link);
    });
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ---------- DRAG AND DROP HELPER ----------
function setupDropZone(dropZoneId, fileInputId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);

    if (!dropZone || !fileInput) return;

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
