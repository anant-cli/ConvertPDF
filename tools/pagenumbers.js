// pagenumbers.js
async function renderpagenumbers(container) {
    try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Add page numbers to PDF documents. Customize position, format, and starting number. 100% private, no uploads.");
        updatePageTitle("PDF Page Numbering Tool");

        area.innerHTML = `
        <h3>📄 Add Page Numbers</h3>
        <p class="tool-description">
            Add page numbers to your PDF documents. Choose position, format, and starting number.
            Perfect for professional documents, reports, and presentations.
            After adding page numbers, you can also <a href="pdfencrypt.html" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div id="pageNumbersPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="pageNumbersPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="pageNumbersControls" style="display: none; margin: 1rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="pageNumberPosition">Position</label>
                    <select id="pageNumberPosition">
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-center">Top Center</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="pageNumberStart">Start Number</label>
                    <input id="pageNumberStart" type="number" min="1" value="1">
                </div>
                <div class="input-group">
                    <label for="pageNumberFormat">Format</label>
                    <select id="pageNumberFormat">
                        <option value="number">1</option>
                        <option value="page">Page 1</option>
                        <option value="total">1 of N</option>
                    </select>
                </div>
            </div>
            <div class="input-group">
                <label for="pageNumberSize">Font Size</label>
                <select id="pageNumberSize">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>
        </div>

        <button id="pageNumbersPdfBtn" class="primary" disabled>Add Page Numbers</button>

        <div id="pageNumbersProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="pageNumbersProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <div class="preview-box" id="pageNumbersProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadPageNumbersBtn" class="download-btn" disabled>⬇ Download Numbered PDF</button>
        </div>
    `;

        const inp = document.getElementById('pageNumbersPdfInput');
        const dropZone = document.getElementById('pageNumbersPdfDropZone');
        const controls = document.getElementById('pageNumbersControls');
        const btn = document.getElementById('pageNumbersPdfBtn');
        const progressDiv = document.getElementById('pageNumbersProgress');
        const progressContainer = document.getElementById('pageNumbersProgressContainer');
        const progressBar = document.getElementById('pageNumbersProgressBar');
        const downloadBtn = document.getElementById('downloadPageNumbersBtn');

        let currentPdf = null;

        // Setup drag and drop
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('pageNumbersPdfDropZone', 'pageNumbersPdfInput');
        }

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            currentPdf = null;
            controls.style.display = 'none';
            btn.disabled = true;
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await file.arrayBuffer();
                currentPdf = await PDFLib.PDFDocument.load(arrayBuf);

                controls.style.display = 'block';
                btn.disabled = false;

                if (window.showToast) showToast(`Loaded PDF with ${currentPdf.getPageCount()} pages`);
            } catch (e) {
                if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
                console.error(e);
            }
        });

        btn.addEventListener('click', async () => {
            if (!currentPdf) return;

            btn.disabled = true;
            btn.innerHTML = '⏳ Adding page numbers...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Adding page numbers...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const position = document.getElementById('pageNumberPosition').value;
                const startNum = parseInt(document.getElementById('pageNumberStart').value) || 1;
                const format = document.getElementById('pageNumberFormat').value;
                const size = document.getElementById('pageNumberSize').value;

                const fontSize = size === 'small' ? 10 : size === 'large' ? 16 : 12;
                const pages = currentPdf.getPages();
                const total = pages.length;

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const { width, height } = page.getSize();
                    const pageNum = startNum + i;

                    let label;
                    switch (format) {
                        case 'page':
                            label = `Page ${pageNum}`;
                            break;
                        case 'total':
                            label = `${pageNum} of ${total}`;
                            break;
                        default:
                            label = `${pageNum}`;
                    }

                    const font = await currentPdf.embedFont(PDFLib.StandardFonts.Helvetica);
                    const textWidth = font.widthOfTextAtSize(label, fontSize);

                    let x, y;
                    switch (position) {
                        case 'bottom-center':
                            x = (width - textWidth) / 2;
                            y = 30;
                            break;
                        case 'bottom-right':
                            x = width - textWidth - 50;
                            y = 30;
                            break;
                        case 'bottom-left':
                            x = 50;
                            y = 30;
                            break;
                        case 'top-center':
                            x = (width - textWidth) / 2;
                            y = height - 30 - fontSize;
                            break;
                    }

                    page.drawText(label, {
                        x, y, size: fontSize, font, color: PDFLib.rgb(0.4, 0.4, 0.4)
                    });

                    progressBar.style.width = `${((i + 1) / pages.length) * 100}%`;
                }

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Saving PDF...';

                const pdfBytes = await currentPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                progressDiv.innerHTML = 'Done!';
                downloadBtn.disabled = false;

                downloadBtn.onclick = () => downloadBlob(blob, 'numbered-pages.pdf');

                if (window.showToast) showToast(`Successfully added page numbers to ${pages.length} pages`);

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.innerHTML = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to add page numbers: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Add Page Numbers';
            }
        });
    } catch (___err) {
        console.error('renderpagenumbers error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}