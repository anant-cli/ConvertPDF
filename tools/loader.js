// tools/loader.js – Automatically renders the correct tool
(function() {
    'use strict';

    function getToolNameFromPath() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        // Map filename to render function name
        const toolMap = {
            'md2pdf': 'rendermd2pdf',
            'docx2pdf': 'renderdocx2pdf',
            'img2pdf': 'renderimg2pdf',
            'img2png': 'renderimg2png',
            'mergepdf': 'rendermergepdf',
            'pdf2jpg': 'renderpdf2jpg',
            'pdfencrypt': 'renderpdfencrypt',
            'qrmaker': 'renderqrmaker',
            'txt2docx': 'rendertxt2docx',
            'web2pdf': 'renderweb2pdf'
        };
        return toolMap[filename] || null;
    }

    function initTool() {
        const container = document.getElementById('toolContainer');
        if (!container) return;

        const renderFuncName = getToolNameFromPath();
        if (!renderFuncName) {
            console.warn('No render function found for this page.');
            return;
        }

        const renderFunc = window[renderFuncName];
        if (typeof renderFunc === 'function') {
            renderFunc(container);
        } else {
            console.error(`Render function ${renderFuncName} not found.`);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTool);
    } else {
        initTool();
    }
})();
