// rotatepdf.js
async function renderrotatepdf(container) {
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

        updateMetaDescription("Rotate PDF pages by 90°, 180°, or 270°. Select individual pages to rotate. 100% private, no uploads.");
        updatePageTitle("PDF Page Rotator");

        area.innerHTML = `
        <h3>🔄 PDF Rotate</h3>
        <p class="tool-description">
            Rotate individual pages in a PDF by 90°, 180°, or 270°. Select which pages to rotate and preview the changes.
            Perfect for fixing scanned documents or adjusting page orientation. After rotating, you can also <a href="mergepdf.html" target="_self">merge PDFs</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div id="rotatePdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="rotatePdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="rotateControls" style="display: none; margin: 1rem 0;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                <button id="selectAllRotate" class="secondary">Select All</button>
                <button id="deselectAllRotate" class="secondary">Deselect All</button>
                <select id="rotationAngle" style="padding: 0.5rem; border-radius: 4px; background: var(--bg-input); color: var(--text); border: 1px solid var(--border);">
                    <option value="90">90° Clockwise</option>
                    <option value="180">180° (Upside Down)</option>
                    <option value="270">270° Counter-Clockwise</option>
                </select>
            </div>
            <div id="rotateThumbnails" class="file-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;"></div>
        </div>

        <button id="rotatePdfBtn" class="primary" disabled>Rotate Selected Pages</button>

        <div id="rotateProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="rotateProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <div class="preview-box" id="rotateProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadRotateBtn" class="download-btn" disabled>⬇ Download Rotated PDF</button>
        </div>
    `;

        const inp = document.getElementById('rotatePdfInput');
        const dropZone = document.getElementById('rotatePdfDropZone');
        const controls = document.getElementById('rotateControls');
        const thumbnailsDiv = document.getElementById('rotateThumbnails');
        const btn = document.getElementById('rotatePdfBtn');
        const progressDiv = document.getElementById('rotateProgress');
        const progressContainer = document.getElementById('rotateProgressContainer');
        const progressBar = document.getElementById('rotateProgressBar');
        const downloadBtn = document.getElementById('downloadRotateBtn');
        const selectAllBtn = document.getElementById('selectAllRotate');
        const deselectAllBtn = document.getElementById('deselectAllRotate');
        const angleSelect = document.getElementById('rotationAngle');

        let currentPdf = null;
        let selectedPages = new Set();

        // Setup drag and drop
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('rotatePdfDropZone', 'rotatePdfInput');
        }

        function renderThumbnails(pdf, totalPages) {
            thumbnailsDiv.innerHTML = '';
            selectedPages.clear();

            for (let i = 1; i <= totalPages; i++) {
                const pageDiv = document.createElement('div');
                pageDiv.className = 'preview-box';
                pageDiv.style.position = 'relative';
                pageDiv.style.cursor = 'pointer';
                pageDiv.style.border = '2px solid transparent';
                pageDiv.style.transition = 'border-color 0.2s';

                const canvas = document.createElement('canvas');
                canvas.width = 150;
                canvas.height = 200;
                canvas.style.width = '100%';
                canvas.style.height = 'auto';

                const label = document.createElement('div');
                label.textContent = `Page ${i}`;
                label.style.textAlign = 'center';
                label.style.marginTop = '0.5rem';
                label.style.fontSize = '0.9rem';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.position = 'absolute';
                checkbox.style.top = '10px';
                checkbox.style.right = '10px';
                checkbox.dataset.page = i;

                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedPages.add(i);
                        pageDiv.style.borderColor = 'var(--accent)';
                    } else {
                        selectedPages.delete(i);
                        pageDiv.style.borderColor = 'transparent';
                    }
                    updateButtonState();
                });

                pageDiv.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });

                pageDiv.appendChild(canvas);
                pageDiv.appendChild(label);
                pageDiv.appendChild(checkbox);
                thumbnailsDiv.appendChild(pageDiv);

                // Render thumbnail
                pdf.getPage(i).then(page => {
                    const viewport = page.getViewport({ scale: 0.3 });
                    const ctx = canvas.getContext('2d');
                    page.render({ canvasContext: ctx, viewport }).promise.catch(err => {
                        console.error('Error rendering page', i, err);
                    });
                });
            }
        }

        function updateButtonState() {
            btn.disabled = selectedPages.size === 0;
        }

        selectAllBtn.addEventListener('click', () => {
            const checkboxes = thumbnailsDiv.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = true;
                cb.dispatchEvent(new Event('change'));
            });
        });

        deselectAllBtn.addEventListener('click', () => {
            const checkboxes = thumbnailsDiv.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
            });
        });

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            currentPdf = null;
            controls.style.display = 'none';
            btn.disabled = true;
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
                const totalPages = pdf.numPages;

                currentPdf = await PDFLib.PDFDocument.load(arrayBuf);

                renderThumbnails(pdf, totalPages);
                controls.style.display = 'block';
                updateButtonState();

                if (window.showToast) showToast(`Loaded PDF with ${totalPages} pages`);
            } catch (e) {
                if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
                console.error(e);
            }
        });

        btn.addEventListener('click', async () => {
            if (!currentPdf || selectedPages.size === 0) return;

            btn.disabled = true;
            btn.innerHTML = '⏳ Rotating...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Applying rotations...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const angle = parseInt(angleSelect.value);
                const pages = currentPdf.getPages();

                let processed = 0;
                for (const pageNum of selectedPages) {
                    const pageIndex = pageNum - 1;
                    pages[pageIndex].setRotation(PDFLib.degrees(angle));
                    processed++;
                    progressBar.style.width = `${(processed / selectedPages.size) * 100}%`;
                }

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Saving PDF...';

                const pdfBytes = await currentPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                progressDiv.innerHTML = 'Done!';
                downloadBtn.disabled = false;

                // Store blob for download
                downloadBtn.onclick = () => downloadBlob(blob, 'rotated-pages.pdf');

                if (window.showToast) showToast(`Successfully rotated ${selectedPages.size} pages`);

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.innerHTML = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to rotate PDF: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Rotate Selected Pages';
            }
        });
    } catch (___err) {
        console.error('renderrotatepdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}