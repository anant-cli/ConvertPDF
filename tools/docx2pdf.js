// docx2pdf.js - Fixed PDF generation using Print (reliable, no blank pages)

async function renderdocx2pdf(container) {
    try {
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
        ]);

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Convert Word documents to PDF with perfect formatting – preserves tables, images, and headings. 100% private, no uploads.");
        updatePageTitle("DOCX to PDF Converter");

        area.innerHTML = `
        <h3>Upload .docx</h3>
        <p class="tool-description">
            Convert Word documents to PDF while preserving formatting, tables, and images.
            Ideal for sharing resumes, reports, and contracts securely.
            After conversion, you can also <a href="pdf2jpg.html" target="_self">extract images</a> from the resulting PDF.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>Will my formatting be preserved?</summary>
                <p>We use Mammoth.js to preserve tables, images, and headings as closely as possible.</p>
            </details>
        </div>
        <div id="docxDropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload DOCX file" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Drop DOCX file</div>
            <p>Drag and drop a .docx file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="docxFile" accept=".docx" aria-label="DOCX file" style="display: none;">
        </div>
        <div id="docxStats" style="display:none; text-align:right; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">
            File Size: <span id="docxSize">0 Bytes</span>
        </div>
        <div class="orientation-selector" style="margin-top: 0; margin-bottom: 1rem;">
            <label>📐 Page size: <select id="docxPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label>🔄 Orientation: <select id="docxOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        </div>
        <div style="margin:1rem 0;"><label><input type="checkbox" id="detectHeadings" checked> 🔍 Convert # style headings</label></div>
        <div class="preview-box"><div id="docxPreview">preview area</div></div>
        <button id="printDocxBtn" class="secondary">Download PDF</button>
        <button id="docxFloatingDownload" class="download-btn floating-action" type="button">Download PDF</button>
        <p class="note" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">The PDF will open in a print dialog – choose "Save as PDF" to download.</p>
    `;

        const fileIn = document.getElementById('docxFile');
        const docxDropZone = document.getElementById('docxDropZone');
        const docxStats = document.getElementById('docxStats');
        const docxSize = document.getElementById('docxSize');
        const previewDiv = document.getElementById('docxPreview');
        const sizeSel = document.getElementById('docxPageSize');
        const orientSel = document.getElementById('docxOrientation');
        const detectHeadings = document.getElementById('detectHeadings');
        const printBtn = document.getElementById('printDocxBtn');

        docxDropZone.addEventListener('click', () => fileIn.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('docxDropZone', 'docxFile');
        }

        const docxPrintStyles = `
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Calibri', 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                background: white;
                padding: 2.54cm;
            }
            .docx-body {
                max-width: 100%;
                margin: 0 auto;
            }
            .docx-body h1 { font-size: 28px; color: #1e2b4f; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; page-break-after: avoid; }
            .docx-body h2 { font-size: 24px; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px; page-break-after: avoid; }
            .docx-body h3 { font-size: 20px; color: #34495e; margin-top: 20px; margin-bottom: 10px; page-break-after: avoid; }
            .docx-body p { margin: 0 0 1rem; orphans: 3; widows: 3; }
            .docx-body code, .docx-body pre { font-family: 'Consolas', monospace; background: #f4f4f4; border: 1px solid #e0e0e0; border-radius: 4px; }
            .docx-body pre { padding: 15px; overflow-x: auto; page-break-inside: avoid; }
            .docx-body table { border-collapse: collapse; width: 100%; margin: 20px 0; page-break-inside: avoid; }
            .docx-body th { background: #3498db; color: white; padding: 12px; border: 1px solid #2980b9; }
            .docx-body td { padding: 10px 12px; border: 1px solid #ddd; }
            .docx-body tr:nth-child(even) { background: #f8f9fa; }
            @media print {
                body { margin: 2.54cm; }
                .page-break { page-break-before: always; }
            }
        </style>
    `;

        function enhanceHeadings(html) {
            if (!detectHeadings.checked) return html;
            return html.replace(/<p>(#{1,6})\s+(.*?)<\/p>/g, (m, h, c) => `<h${h.length}>${c}</h${h.length}>`);
        }

        const docxFloatingBtn = document.getElementById('docxFloatingDownload');

        function updateDocxFloatingBtn() {
            if (!docxFloatingBtn) return;
            const file = fileIn.files[0];
            const hasPreview = !!window.currentDocxHtml;
            docxFloatingBtn.style.display = file && hasPreview ? 'inline-flex' : 'none';
        }

        fileIn.addEventListener('change', async () => {
            const f = fileIn.files[0];
            if (!f) return;

            if (window.showFileOnDropZone) showFileOnDropZone('docxDropZone', f);
            docxStats.style.display = 'block';
            docxSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(f.size) : f.size + " bytes";

            previewDiv.innerHTML = '<div style="text-align:center; padding: 2rem;"><span style="font-size: 2rem;">⌛</span><br>Converting DOCX to HTML for preview...</div>';
            if (window.showSpinner) showSpinner('Converting DOCX preview...');

            try {
                const buf = await f.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer: buf });
                let html = enhanceHeadings(result.value);
                previewDiv.innerHTML = docxPrintStyles + `<div class="docx-body">${html}</div>`;
                window.currentDocxHtml = html;
                updateDocxFloatingBtn();
            } catch (e) {
                previewDiv.innerHTML = `<div style="color:#e74c3c;padding:1rem;">Error: ${e.message}</div>`;
                if (window.showToast) showToast('Failed to read DOCX file.', 'error');
            } finally {
                if (window.hideSpinner) hideSpinner();
            }
        });

        // Generate PDF using print dialog (reliable)
        async function generatePdf() {
            const file = fileIn.files[0];
            if (!file || !window.currentDocxHtml) {
                if (window.showToast) showToast('Please select a DOCX file first.', 'warning');
                return;
            }

            if (window.rateLimiter && !rateLimiter.canProceed('docx2pdf', 2000)) {
                if (window.showToast) showToast('Please wait a moment before generating another PDF.', 'warning');
                return;
            }

            printBtn.disabled = true;
            const originalText = printBtn.innerHTML;
            printBtn.innerHTML = '⏳ Preparing PDF...';
            if (window.showSpinner) showSpinner('Preparing document for PDF...');

            try {
                const docTitle = file.name.replace(/\.docx$/i, '') || 'document';
                const pageSize = sizeSel.value;
                const orientation = orientSel.value;

                const fullHtml = `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${docTitle} - ConvertPDF</title>
                    ${docxPrintStyles}
                    <style>
                        @page {
                            size: ${pageSize} ${orientation};
                            margin: 2.54cm;
                        }
                    </style>
                </head>
                <body>
                    <div class="docx-body">${window.currentDocxHtml}</div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => window.close(), 1000);
                            }, 500);
                        };
                    <\/script>
                </body>
                </html>`;

                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    throw new Error('Popup blocked. Please allow pop-ups for this site.');
                }
                printWindow.document.write(fullHtml);
                printWindow.document.close();

                if (window.trackEvent) trackEvent('Tool', 'convert', 'docx2pdf');
                if (window.showToast) showToast('🖨️ Print dialog opened – choose "Save as PDF".', 'info');
            } catch (err) {
                console.error(err);
                if (window.showToast) showToast('Failed to open print dialog: ' + err.message, 'error');
            } finally {
                printBtn.disabled = false;
                printBtn.innerHTML = originalText;
                if (window.hideSpinner) hideSpinner();
                updateDocxFloatingBtn();
            }
        }

        printBtn.addEventListener('click', generatePdf);
        if (docxFloatingBtn) docxFloatingBtn.addEventListener('click', generatePdf);

    } catch (___err) {
        console.error('renderdocx2pdf error:', ___err);
        container.innerHTML = `<div class="warning">⚠️ Tool failed to load: ${___err.message}</div>`;
    }
}