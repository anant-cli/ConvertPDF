// watermarkpdf.js
async function renderwatermarkpdf(container) {
    try {
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js')
        ]);

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Add text watermarks to PDF pages. Customize position, font, opacity, and color. 100% private, no uploads.");
        updatePageTitle("PDF Watermark Tool");

        area.innerHTML = `
        <h3>💧 PDF Watermark</h3>
        <p class="tool-description">
            Add text watermarks to your PDF pages. Customize position, font size, opacity, and color.
            Preview changes before applying. Perfect for branding or document protection.
            After watermarking, you can also <a href="pdfencrypt.html" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div id="watermarkPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="watermarkPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="watermarkControls" style="display: none; margin: 1rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="watermarkText">Watermark Text</label>
                    <input id="watermarkText" type="text" placeholder="CONFIDENTIAL" value="CONFIDENTIAL">
                </div>
                <div class="input-group">
                    <label for="watermarkPosition">Position</label>
                    <select id="watermarkPosition">
                        <option value="center">Center Diagonal</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="watermarkFontSize">Font Size: <span id="fontSizeValue">48</span></label>
                    <input id="watermarkFontSize" type="range" min="12" max="120" value="48">
                </div>
                <div class="input-group">
                    <label for="watermarkOpacity">Opacity: <span id="opacityValue">50</span>%</label>
                    <input id="watermarkOpacity" type="range" min="10" max="100" value="50">
                </div>
                <div class="input-group">
                    <label for="watermarkColor">Color</label>
                    <input id="watermarkColor" type="color" value="#ff0000">
                </div>
            </div>
            <div style="margin-bottom: 1rem;">
                <label><input type="checkbox" id="watermarkAllPages" checked> Apply to all pages</label>
            </div>
            <div id="watermarkPreview" style="border: 1px solid var(--border); padding: 1rem; margin-bottom: 1rem; display: none;">
                <h4>Preview (First Page)</h4>
                <canvas id="previewCanvas" style="max-width: 100%; border: 1px solid var(--border);"></canvas>
            </div>
        </div>

        <button id="watermarkPdfBtn" class="primary" disabled>Apply Watermark</button>

        <div id="watermarkProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="watermarkProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <div class="preview-box" id="watermarkProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadWatermarkBtn" class="download-btn" disabled>⬇ Download Watermarked PDF</button>
        </div>
    `;

        const inp = document.getElementById('watermarkPdfInput');
        const dropZone = document.getElementById('watermarkPdfDropZone');
        const controls = document.getElementById('watermarkControls');
        const btn = document.getElementById('watermarkPdfBtn');
        const progressDiv = document.getElementById('watermarkProgress');
        const progressContainer = document.getElementById('watermarkProgressContainer');
        const progressBar = document.getElementById('watermarkProgressBar');
        const downloadBtn = document.getElementById('downloadWatermarkBtn');
        const previewCanvas = document.getElementById('previewCanvas');
        const previewDiv = document.getElementById('watermarkPreview');

        let currentPdf = null;
        let currentPdfJs = null;

        // Setup drag and drop
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('watermarkPdfDropZone', 'watermarkPdfInput');
        }

        // Update display values
        document.getElementById('watermarkFontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value;
            updatePreview();
        });
        document.getElementById('watermarkOpacity').addEventListener('input', (e) => {
            document.getElementById('opacityValue').textContent = e.target.value;
            updatePreview();
        });
        document.getElementById('watermarkText').addEventListener('input', updatePreview);
        document.getElementById('watermarkPosition').addEventListener('change', updatePreview);
        document.getElementById('watermarkColor').addEventListener('input', updatePreview);

        async function updatePreview() {
            if (!currentPdfJs) return;

            const canvas = previewCanvas;
            const ctx = canvas.getContext('2d');

            try {
                const page = await currentPdfJs.getPage(1);
                const viewport = page.getViewport({ scale: 0.5 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;

                // Add watermark preview
                const text = document.getElementById('watermarkText').value || 'CONFIDENTIAL';
                const fontSize = parseInt(document.getElementById('watermarkFontSize').value);
                const opacity = parseInt(document.getElementById('watermarkOpacity').value) / 100;
                const color = document.getElementById('watermarkColor').value;
                const position = document.getElementById('watermarkPosition').value;

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.font = `${fontSize * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let x, y;
                switch (position) {
                    case 'center':
                        x = viewport.width / 2;
                        y = viewport.height / 2;
                        ctx.rotate(Math.PI / 4); // 45 degrees
                        break;
                    case 'top-left':
                        x = fontSize * 0.5;
                        y = fontSize * 0.5;
                        break;
                    case 'top-right':
                        x = viewport.width - fontSize * 0.5;
                        y = fontSize * 0.5;
                        break;
                    case 'bottom-left':
                        x = fontSize * 0.5;
                        y = viewport.height - fontSize * 0.5;
                        break;
                    case 'bottom-right':
                        x = viewport.width - fontSize * 0.5;
                        y = viewport.height - fontSize * 0.5;
                        break;
                }

                ctx.fillText(text, x, y);
                ctx.restore();

                previewDiv.style.display = 'block';
            } catch (e) {
                console.error('Preview error:', e);
            }
        }

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            currentPdf = null;
            currentPdfJs = null;
            controls.style.display = 'none';
            previewDiv.style.display = 'none';
            btn.disabled = true;
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await file.arrayBuffer();
                currentPdf = await PDFLib.PDFDocument.load(arrayBuf);
                currentPdfJs = await pdfjsLib.getDocument({ data: arrayBuf }).promise;

                controls.style.display = 'block';
                btn.disabled = false;
                updatePreview();

                if (window.showToast) showToast(`Loaded PDF with ${currentPdf.getPageCount()} pages`);
            } catch (e) {
                if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
                console.error(e);
            }
        });

        btn.addEventListener('click', async () => {
            if (!currentPdf) return;

            btn.disabled = true;
            btn.innerHTML = '⏳ Applying watermark...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Adding watermarks...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const text = document.getElementById('watermarkText').value || 'CONFIDENTIAL';
                const fontSize = parseInt(document.getElementById('watermarkFontSize').value);
                const opacity = parseInt(document.getElementById('watermarkOpacity').value) / 100;
                const colorHex = document.getElementById('watermarkColor').value;
                const position = document.getElementById('watermarkPosition').value;
                const allPages = document.getElementById('watermarkAllPages').checked;

                // Convert hex color to RGB
                const r = parseInt(colorHex.slice(1, 3), 16) / 255;
                const g = parseInt(colorHex.slice(3, 5), 16) / 255;
                const b = parseInt(colorHex.slice(5, 7), 16) / 255;
                const color = PDFLib.rgb(r, g, b);

                const pages = currentPdf.getPages();
                const pagesToProcess = allPages ? pages : [pages[0]];

                for (let i = 0; i < pagesToProcess.length; i++) {
                    const page = pagesToProcess[i];
                    const { width, height } = page.getSize();

                    let x, y, rotate = 0;
                    switch (position) {
                        case 'center':
                            x = width / 2;
                            y = height / 2;
                            rotate = PDFLib.degrees(45);
                            break;
                        case 'top-left':
                            x = fontSize;
                            y = fontSize;
                            break;
                        case 'top-right':
                            x = width - fontSize;
                            y = fontSize;
                            break;
                        case 'bottom-left':
                            x = fontSize;
                            y = height - fontSize;
                            break;
                        case 'bottom-right':
                            x = width - fontSize;
                            y = height - fontSize;
                            break;
                    }

                    page.drawText(text, {
                        x, y, size: fontSize, color, opacity, rotate
                    });

                    progressBar.style.width = `${((i + 1) / pagesToProcess.length) * 100}%`;
                }

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Saving PDF...';

                const pdfBytes = await currentPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                progressDiv.innerHTML = 'Done!';
                downloadBtn.disabled = false;

                downloadBtn.onclick = () => downloadBlob(blob, 'watermarked.pdf');

                if (window.showToast) showToast(`Successfully added watermark to ${pagesToProcess.length} page(s)`);

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.innerHTML = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to add watermark: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Apply Watermark';
            }
        });
    } catch (___err) {
        console.error('renderwatermarkpdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}