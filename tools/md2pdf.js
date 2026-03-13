// md2pdf.js
async function rendermd2pdf(container) {
    try {
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js'),
            loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js'),
            loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js')
        ]);
        await loadStylesheet('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css');
        await loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Convert Markdown to PDF with LaTeX math, syntax highlighting, and custom page breaks. 100% private, no uploads.");
        updatePageTitle("Markdown to PDF Converter");

        area.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
                <h3>📝 Markdown to PDF</h3>
                <p class="tool-description">
                    Convert Markdown into professional PDF documents. Supports LaTeX math ($E=mc^2$), syntax highlighting, and custom page breaks.
                </p>
            </div>

            <div id="mdPdfDropZone" class="drop-zone" style="min-height: 180px;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">📄</div>
                <p style="font-size: 1.1rem; font-weight: 500;">Drag & drop your Markdown file</p>
                <p class="note" style="margin-top: 0;">or click to browse</p>
                <input type="file" id="mdFile" accept=".md,text/markdown" style="display: none;">
            </div>
            
            <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; background: var(--bg-input); padding: 1rem; border-radius: var(--r-md); border: 1px solid var(--border-subtle);">
                <div class="orientation-selector" style="margin: 0; gap: 1rem;">
                    <label style="font-weight: 600;">📐 <select id="mdPageSize" style="max-width: 120px;"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                    <label style="font-weight: 600;">🔄 <select id="mdOrientation" style="max-width: 130px;"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
                </div>
                <button id="loadSampleBtn" class="secondary" style="min-width: unset; padding: 0 1.2rem; height: 38px; font-size: 0.9rem;">📝 Load Sample</button>
                <label style="margin-left: auto; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.95rem; font-weight: 500; color: var(--text-muted);">
                    <input type="checkbox" id="toggleEditor" style="width: auto; height: auto;"> ⚙️ Advanced Editor
                </label>
            </div>

            <div id="editorSection" style="display: none; animation: slideDown 0.3s ease-out;">
                <div class="preview-title" style="margin-bottom: 0.5rem;">Markdown Source</div>
                <textarea id="mdEditor" spellcheck="false" placeholder="Type or paste Markdown here..." style="width: 100%; min-height: 350px; resize: vertical; font-family: 'Fira Code', monospace; font-size: 0.95rem; max-width: 100%;"></textarea>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="preview-title">Live Preview</div>
                    <label style="font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; color: var(--text-muted);"><input type="checkbox" id="mdDarkTheme" style="width: auto; height: auto;"> 🌙 Dark Mode</label>
                </div>
                <div class="preview-box" id="mdPreviewBox" style="width: 100%; min-height: 600px; padding: 0; overflow-y: auto;">
                    <div id="mdRendered" style="padding: 0;"></div>
                </div>
            </div>

            <button id="printMdBtn" class="primary" style="width: 100%; font-size: 1.1rem; height: 54px;">🖨️ Generate PDF</button>
        </div>
        
        <style>
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
        `;

        const mdFile = document.getElementById('mdFile');
        const mdDropZone = document.getElementById('mdPdfDropZone');
        const mdEditor = document.getElementById('mdEditor');
        const mdRendered = document.getElementById('mdRendered');
        const mdPreviewBox = document.getElementById('mdPreviewBox');
        const mdDarkTheme = document.getElementById('mdDarkTheme');
        const toggleEditor = document.getElementById('toggleEditor');
        const editorSection = document.getElementById('editorSection');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const sizeSelect = document.getElementById('mdPageSize');
        const orientSelect = document.getElementById('mdOrientation');
        const printBtn = document.getElementById('printMdBtn');

        const sampleMd = `# Sample Document\n\nThis is a sample **Markdown** document.\n\n## Math Support\n\nInline math: $E = mc^2$\n\nDisplay math:\n$$\\int_a^b f(x)dx = F(b) - F(a)$$\n\n## Syntax Highlighting\n\n\`\`\`javascript\nfunction hello() {\n  console.log("Hello World");\n}\n\`\`\`\n\n## Page Breaks\nUse \\\\newpage or <!-- pagebreak --> to force a new page.`;

        // Handle Advanced Mode Toggle
        toggleEditor.addEventListener('change', () => {
            editorSection.style.display = toggleEditor.checked ? 'block' : 'none';
        });

        // Load Sample
        loadSampleBtn.addEventListener('click', () => {
            window.currentMarkdown = sampleMd;
            mdEditor.value = sampleMd;
            renderPreview();
            if (window.showToast) showToast('Sample loaded!');
        });

        // Setup drag and drop
        mdDropZone.addEventListener('click', () => mdFile.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('mdPdfDropZone', 'mdFile');
        }

        const printStyles = (theme = 'light') => `
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'};
                background: ${theme === 'dark' ? '#0d1117' : 'white'};
                max-width: 900px;
                margin: ${theme === 'print' ? '2.54cm !important' : '0 auto'};
                padding: ${theme === 'print' ? '0 !important' : '1rem'};
            }
            .markdown-body {
                color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'};
            }
            h1, h2, h3, h4, h5, h6 { 
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
                line-height: 1.25;
                color: inherit;
                page-break-after: avoid;
            }
            h1 { font-size: 2em; border-bottom: 1px solid ${theme === 'dark' ? '#21262d' : '#eaecef'}; padding-bottom: 0.3rem; }
            h2 { font-size: 1.5em; border-bottom: 1px solid ${theme === 'dark' ? '#21262d' : '#eaecef'}; padding-bottom: 0.3rem; }
            p { margin: 0 0 1rem; orphans: 3; widows: 3; }
            code, pre { font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 0.9rem; border-radius: 3px; }
            code { padding: 0.2rem 0.4rem; color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'}; background: ${theme === 'dark' ? 'rgba(110,118,129,0.4)' : '#f6f8fa'}; }
            pre { padding: 1rem; overflow: auto; line-height: 1.45; background: ${theme === 'dark' ? '#161b22' : '#f6f8fa'}; border-radius: 6px; page-break-inside: avoid; }
            pre code { background: none; padding: 0; color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'}; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; page-break-inside: avoid; }
            th, td { border: 1px solid ${theme === 'dark' ? '#30363d' : '#dfe2e5'}; padding: 0.6rem 1rem; text-align: left; }
            th { background: ${theme === 'dark' ? '#21262d' : '#f6f8fa'}; font-weight: 600; }
            tr:nth-child(even) { background: ${theme === 'dark' ? '#161b22' : '#fafbfc'}; }
            blockquote { margin: 0; padding: 0 1rem; color: ${theme === 'dark' ? '#8b949e' : '#6a737d'}; border-left: 0.25rem solid ${theme === 'dark' ? '#30363d' : '#dfe2e5'}; }
            img { max-width: 100%; height: auto; page-break-inside: avoid; }
            ul, ol { padding-left: 2rem; margin: 1rem 0; page-break-inside: avoid; }
            li { margin: 0.25rem 0; }
            hr { height: 0.25rem; padding: 0; margin: 2rem 0; background: ${theme === 'dark' ? '#30363d' : '#e1e4e8'}; border: 0; }
            .page-break { page-break-before: always; height: 0; margin: 0; padding: 0; }
            @media print {
                body { margin: 2.54cm !important; padding: 0 !important; background: var(--bg-surface) !important; color: black !important; }
                .markdown-body { color: black !important; }
                pre, table, img, ul, ol { break-inside: avoid; }
                h1, h2, h3, h4, h5, h6 { break-after: avoid; }
                code { background: #f6f8fa !important; color: black !important; border: 1px solid #ccc; }
                pre { background: #f6f8fa !important; border: 1px solid #ccc; }
                pre code { border: none !important; }
            }
        </style>
    `;

        function preprocessMarkdown(text) {
            text = text.replace(/\\newpage/g, '<div class="page-break"></div>');
            text = text.replace(/<!--\s*pagebreak\s*-->/g, '<div class="page-break"></div>');
            return text;
        }

        marked.setOptions({ gfm: true, breaks: true, headerIds: true, html: true, highlight: (code, lang) => code });

        // Debounce function for live preview
        let timeoutId;
        function debounce(func, delay) {
            return function () {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, arguments), delay);
            };
        }

        // Render markdown to preview pane
        function renderPreview() {
            const text = window.currentMarkdown || '';
            if (!text) {
                mdRendered.innerHTML = '<div style="color: var(--text-muted); padding: 4rem; text-align: center; border: 2px dashed var(--border-subtle); margin: 2rem; border-radius: 12px;">\n                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">📝</div>\n                    Upload a Markdown file or click "Load Sample" to see preview\n                </div>';
                return;
            }
            const processed = preprocessMarkdown(text);

            const renderer = new marked.Renderer();
            const oldCode = renderer.code.bind(renderer);
            renderer.code = function (code, language, isEscaped) {
                if (language === 'math') {
                    return '$$' + code + '$$';
                }
                return oldCode(code, language, isEscaped);
            };

            const html = marked.parse(processed, { renderer });

            const theme = mdDarkTheme.checked ? 'dark' : 'light';
            mdPreviewBox.style.background = theme === 'dark' ? '#0d1117' : 'white';

            mdRendered.innerHTML = printStyles(theme) + `<div class="markdown-body" style="padding: 1rem;">${html}</div>`;

            if (window.renderMathInElement) {
                try {
                    renderMathInElement(mdRendered, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false },
                            { left: '\\(', right: '\\)', display: false },
                            { left: '\\[', right: '\\]', display: true }
                        ],
                        throwOnError: false
                    });
                } catch (e) {
                    console.error("Math render error:", e);
                }
            }

            if (window.Prism) {
                try {
                    Prism.highlightAllUnder(mdRendered);
                } catch (e) {
                    console.error("Prism error", e);
                }
            }
        }

        mdDarkTheme.addEventListener('change', renderPreview);

        mdEditor.addEventListener('input', debounce(() => {
            window.currentMarkdown = mdEditor.value;
            renderPreview();
        }, 300));

        mdFile.addEventListener('change', async () => {
            const file = mdFile.files[0];
            if (!file) return;
            const text = await file.text();
            window.currentMarkdown = text;
            mdEditor.value = text;
            renderPreview();
        });

        // No default rendering; preview empty until file upload.

        printBtn.addEventListener('click', async () => {
            const text = window.currentMarkdown;
            if (!text || !text.trim()) {
                if (window.showToast) showToast('Please upload a Markdown file first.', 'warning');
                else alert('Please upload a Markdown file first.');
                return;
            }
            printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';
            try {
                const processed = preprocessMarkdown(text);
                const html = marked.parse(processed);
                const fullHtml = `<!DOCTYPE html>
<html><head><title>ConvertPDF - Markdown Document</title>${printStyles('print')}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\\\[',right:'\\\\]',display:true},{left:'\\\\(',right:'\\\\)',display:false}]}); window.print();"></script>
<style>
@page { size: ${sizeSelect.value} ${orientSelect.value}; }
@media print { body { margin: 2.54cm; } }
</style>
</head><body><div class="markdown-body">${html}</div>
<script>
    setTimeout(()=>{ 
        if(window.Prism) Prism.highlightAll();
        setTimeout(() => window.print(), 500); 
    }, 500);
<\/script></body></html>`;
                const win = window.open('', '_blank');
                if (!win) {
                    if (window.showToast) showToast('Pop‑up blocked by browser.', 'error');
                    else alert('Pop‑up blocked');
                    printBtn.disabled = false;
                    printBtn.innerHTML = '🖨️ Generate PDF';
                    return;
                }
                win.document.write(fullHtml); win.document.close();
                setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Generate PDF'; }, 3000);
            } catch (e) {
                if (window.showToast) showToast('Error: ' + e.message, 'error');
                else alert('Error: ' + e.message);
                printBtn.disabled = false;
                printBtn.innerHTML = '🖨️ Generate PDF';
            }
        });
    } catch (___err) {
        console.error('rendermd2pdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}