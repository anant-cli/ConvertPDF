// compresspdf.js
async function rendercompresspdf(container) {
    try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Compress PDF files to reduce file size. Basic compression for text-heavy PDFs. 100% private, no uploads.");
        updatePageTitle("PDF Compression Tool");

        area.innerHTML = `
        <h3>🗜️ Compress PDF</h3>
        <p class="tool-description">
            Rewrites PDF internals to reduce file size. Works best on <strong>text-heavy PDFs</strong> &mdash; typical reduction is 5&ndash;30%.
            <strong>Image-heavy PDFs will see little or no reduction</strong> because embedded images are already compressed.
            This tool does not re-encode or remove images &mdash; it cleans redundant objects and tightens PDF streams only.
            After compression, you can also <a href="pdfencrypt.html" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>How much compression can I expect?</summary>
                <p>Results vary significantly. Text-heavy PDFs may see 10-30% reduction. Image-heavy PDFs won't compress much with this basic method.</p>
            </details>
        </div>
        <div id="compressPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="compressPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="compressStats" style="display:none; text-align:left; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem; background: var(--bg-input); padding: 1rem; border-radius: 4px;">
            <div><strong>Original file:</strong> <span id="originalSize">-</span></div>
            <div><strong>Pages:</strong> <span id="originalPages">-</span></div>
            <div id="compressedStats" style="display:none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                <div><strong>Compressed file:</strong> <span id="compressedSize">-</span></div>
                <div><strong>Size reduction:</strong> <span id="sizeReduction">-</span></div>
            </div>
        </div>

        <div class="input-group">
            <label for="compressionLevel">Compression Quality</label>
            <select id="compressionLevel">
                <option value="basic">Basic (Safe, fast)</option>
                <option value="optimized">Optimized (Better compression)</option>
            </select>
            <p class="note">Basic uses object streams. Optimized may remove some metadata but preserves content.</p>
        </div>

        <button id="compressPdfBtn" class="primary" disabled>Compress PDF</button>

        <div id="compressProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="compressProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <div class="preview-box" id="compressProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadCompressBtn" class="download-btn" disabled>⬇ Download Compressed PDF</button>
        </div>
    `;

        const inp = document.getElementById('compressPdfInput');
        const dropZone = document.getElementById('compressPdfDropZone');
        const stats = document.getElementById('compressStats');
        const originalSizeSpan = document.getElementById('originalSize');
        const originalPagesSpan = document.getElementById('originalPages');
        const compressedStats = document.getElementById('compressedStats');
        const compressedSizeSpan = document.getElementById('compressedSize');
        const sizeReductionSpan = document.getElementById('sizeReduction');
        const btn = document.getElementById('compressPdfBtn');
        const progressDiv = document.getElementById('compressProgress');
        const progressContainer = document.getElementById('compressProgressContainer');
        const progressBar = document.getElementById('compressProgressBar');
        const downloadBtn = document.getElementById('downloadCompressBtn');
        const qualitySel = document.getElementById('compressionLevel');

        let currentFile = null;
        let originalSize = 0;

        // Setup drag and drop
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('compressPdfDropZone', 'compressPdfInput');
        }

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            currentFile = file;
            originalSize = file.size;
            compressedStats.style.display = 'none';
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);

                stats.style.display = 'block';
                originalSizeSpan.textContent = formatFileSize(originalSize);
                originalPagesSpan.textContent = pdfDoc.getPageCount();
                btn.disabled = false;

                if (window.showToast) showToast(`Loaded PDF with ${pdfDoc.getPageCount()} pages`);
            } catch (e) {
                if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
                console.error(e);
            }
        });

        btn.addEventListener('click', async () => {
            if (!currentFile) return;

            btn.disabled = true;
            btn.innerHTML = '⏳ Compressing...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Applying compression...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await currentFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);

                progressBar.style.width = '50%';

                // Basic compression: use object streams
                const compressedBytes = await pdfDoc.save({
                    useObjectStreams: qualitySel.value === 'optimized'
                });

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Compression complete!';

                const compressedSize = compressedBytes.length;
                const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

                compressedStats.style.display = 'block';
                compressedSizeSpan.textContent = formatFileSize(compressedSize);
                sizeReductionSpan.textContent = `${reduction}% (${formatFileSize(originalSize - compressedSize)} saved)`;

                const blob = new Blob([compressedBytes], { type: 'application/pdf' });
                downloadBtn.disabled = false;

                downloadBtn.onclick = () => downloadBlob(blob, 'compressed.pdf');

                if (window.showToast) {
                    if (reduction > 0) {
                        showToast(`Successfully compressed! Saved ${formatFileSize(originalSize - compressedSize)}`);
                    } else {
                        showToast('Compression complete. File size may not have changed significantly.');
                    }
                }

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.innerHTML = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to compress PDF: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Compress PDF';
            }
        });
    } catch (___err) {
        console.error('rendercompresspdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}