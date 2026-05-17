// signpdf.js
async function rendersignpdf(container) {
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Sign PDF documents digitally with text or drawn signatures. Choose ink color and font style. 100% private, no uploads.");
        updatePageTitle("PDF Signing Tool");

        area.innerHTML = `
        <h3>✍️ Sign PDF</h3>
        <p class="tool-description">
            Add digital signatures to your PDF. Type your name in 3 font styles, or draw a freehand signature.
            Choose ink color and placement. All processing happens locally — your file never leaves your device.
            After signing, you can also <a href="pdfencrypt.html" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>What signature types are available?</summary>
                <p>Type your name (in Helvetica, Times Roman, or Courier) or draw a freehand signature with mouse or touch.</p>
            </details>
            <details>
                <summary>Are these legally binding signatures?</summary>
                <p>These are visual signatures for informal use. For legally binding e-signatures use certified services.</p>
            </details>
        </div>
        <div id="signPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕✍️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="signPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="signOptions" style="display:none; margin-bottom: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="input-group">
                    <label for="signatureType">Signature Type</label>
                    <select id="signatureType">
                        <option value="text">Type Name</option>
                        <option value="draw">Draw Signature</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="signatureColor">Ink Color</label>
                    <select id="signatureColor">
                        <option value="black">⬛ Black</option>
                        <option value="blue">🔵 Blue (Ink)</option>
                        <option value="red">🔴 Red</option>
                    </select>
                </div>
            </div>

            <div id="textSignatureGroup" class="input-group">
                <label for="signatureText">Your Name</label>
                <input type="text" id="signatureText" placeholder="Enter your full name" maxlength="60">
                <div style="margin-top: 0.5rem;">
                    <label for="signatureFont" style="font-size:0.85rem; color: var(--text-muted);">Font Style</label>
                    <select id="signatureFont" style="margin-top:0.25rem;">
                        <option value="Helvetica">Helvetica — Clean &amp; Modern</option>
                        <option value="TimesRoman">Times Roman — Formal &amp; Traditional</option>
                        <option value="Courier">Courier — Typewriter Style</option>
                    </select>
                </div>
            </div>

            <div id="drawSignatureGroup" class="input-group" style="display:none;">
                <label>Draw your signature below</label>
                <canvas id="signatureCanvas" width="500" height="150"
                    style="border: 1px solid var(--border); border-radius: 4px; cursor: crosshair; max-width: 100%; display: block; touch-action: none;"></canvas>
                <div style="margin-top: 0.5rem;">
                    <button id="clearSignature" class="secondary" type="button">Clear Drawing</button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div class="input-group">
                    <label for="signaturePosition">Position on Page</label>
                    <select id="signaturePosition">
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="signaturePage">Page to Sign</label>
                    <select id="signaturePage">
                        <option value="last">Last Page</option>
                        <option value="first">First Page</option>
                        <option value="all">All Pages</option>
                    </select>
                    <p class="note">Choose which page(s) receive the signature.</p>
                </div>
            </div>
        </div>

        <button id="signPdfBtn" class="primary" disabled>Sign PDF</button>

        <div id="signProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="signProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <div class="preview-box" id="signProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadSignBtn" class="download-btn" disabled>⬇ Download Signed PDF</button>
        </div>
        `;

        const inp = document.getElementById('signPdfInput');
        const dropZone = document.getElementById('signPdfDropZone');
        const options = document.getElementById('signOptions');
        const btn = document.getElementById('signPdfBtn');
        const progressDiv = document.getElementById('signProgress');
        const progressContainer = document.getElementById('signProgressContainer');
        const progressBar = document.getElementById('signProgressBar');
        const downloadBtn = document.getElementById('downloadSignBtn');
        const sigTypeSel = document.getElementById('signatureType');
        const sigColorSel = document.getElementById('signatureColor');
        const sigFontSel = document.getElementById('signatureFont');
        const textSigGroup = document.getElementById('textSignatureGroup');
        const drawSigGroup = document.getElementById('drawSignatureGroup');
        const textInput = document.getElementById('signatureText');
        const canvas = document.getElementById('signatureCanvas');
        const clearBtn = document.getElementById('clearSignature');
        const positionSel = document.getElementById('signaturePosition');
        const pageSel = document.getElementById('signaturePage');

        let currentFile = null;
        let isDrawing = false;
        const ctx = canvas.getContext('2d');

        // Canvas color helper
        function getDrawColor() {
            const map = { black: '#000000', blue: '#00008B', red: '#CC0000' };
            return map[sigColorSel.value] || '#000000';
        }

        function setupCtx() {
            ctx.strokeStyle = getDrawColor();
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        setupCtx();
        sigColorSel.addEventListener('change', setupCtx);

        // Mouse drawing (corrected for canvas scaling)
        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
        }

        canvas.addEventListener('mousedown', e => {
            isDrawing = true;
            setupCtx();
            ctx.beginPath();
            const p = getPos(e);
            ctx.moveTo(p.x, p.y);
        });
        canvas.addEventListener('mousemove', e => {
            if (!isDrawing) return;
            const p = getPos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        });
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseleave', () => isDrawing = false);

        // Touch drawing
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            isDrawing = true;
            setupCtx();
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            const t = e.touches[0];
            ctx.moveTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
        }, { passive: false });
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            const t = e.touches[0];
            ctx.lineTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
            ctx.stroke();
        }, { passive: false });
        canvas.addEventListener('touchend', () => isDrawing = false);

        clearBtn.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

        // Drop zone
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') setupDropZone('signPdfDropZone', 'signPdfInput');

        // Signature type toggle
        sigTypeSel.addEventListener('change', () => {
            const isText = sigTypeSel.value === 'text';
            textSigGroup.style.display = isText ? 'block' : 'none';
            drawSigGroup.style.display = isText ? 'none' : 'block';
        });

        // File loaded
        inp.addEventListener('change', () => {
            const file = inp.files[0];
            if (!file) return;
            currentFile = file;
            if (window.showFileOnDropZone) showFileOnDropZone('signPdfDropZone', file);
            options.style.display = 'block';
            downloadBtn.disabled = true;
            btn.disabled = false;
            if (window.showToast) showToast(`Loaded: ${file.name}`);
        });

        // Sign button
        btn.addEventListener('click', async () => {
            if (!currentFile) return;

            // Validate
            if (sigTypeSel.value === 'text' && !textInput.value.trim()) {
                if (window.showToast) showToast('Please enter your name', 'error');
                return;
            }
            if (sigTypeSel.value === 'draw') {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                if (!imgData.data.some(v => v !== 0)) {
                    if (window.showToast) showToast('Please draw a signature first', 'error');
                    return;
                }
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Signing...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Loading PDF...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await currentFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);
                const { StandardFonts } = PDFLib;
                progressBar.style.width = '30%';

                const pdfColorMap = {
                    black: PDFLib.rgb(0, 0, 0),
                    blue:  PDFLib.rgb(0, 0, 0.55),
                    red:   PDFLib.rgb(0.8, 0, 0)
                };
                const sigColor = pdfColorMap[sigColorSel.value] || pdfColorMap.black;

                const allPages = pdfDoc.getPages();
                let targetPages;
                if (pageSel.value === 'first') targetPages = [allPages[0]];
                else if (pageSel.value === 'all') targetPages = allPages;
                else targetPages = [allPages[allPages.length - 1]];

                progressBar.style.width = '50%';
                progressDiv.innerHTML = 'Embedding signature...';

                const margin = 40;
                const fontSize = 22;

                for (const page of targetPages) {
                    const { width, height } = page.getSize();

                    if (sigTypeSel.value === 'text') {
                        const text = textInput.value.trim();
                        const fontMap = {
                            'Helvetica':  StandardFonts.Helvetica,
                            'TimesRoman': StandardFonts.TimesRoman,
                            'Courier':    StandardFonts.Courier
                        };
                        const font = await pdfDoc.embedFont(fontMap[sigFontSel.value] || StandardFonts.Helvetica);
                        const textWidth  = font.widthOfTextAtSize(text, fontSize);
                        const textHeight = font.heightAtSize(fontSize);

                        let x, y;
                        switch (positionSel.value) {
                            case 'bottom-right': x = width - textWidth - margin;  y = margin; break;
                            case 'bottom-left':  x = margin;                       y = margin; break;
                            case 'top-right':    x = width - textWidth - margin;  y = height - textHeight - margin; break;
                            case 'top-left':     x = margin;                       y = height - textHeight - margin; break;
                            default:             x = margin;                       y = margin;
                        }
                        page.drawText(text, { x, y, size: fontSize, font, color: sigColor });

                    } else {
                        // Drawn signature — transparent PNG (no white fill)
                        const dataUrl = canvas.toDataURL('image/png');
                        const sigBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
                        const sigEmbed = await pdfDoc.embedPng(sigBytes);

                        const sigW = Math.min(200, width / 3);
                        const sigH = (sigEmbed.height / sigEmbed.width) * sigW;

                        let x, y;
                        switch (positionSel.value) {
                            case 'bottom-right': x = width - sigW - margin;  y = margin; break;
                            case 'bottom-left':  x = margin;                  y = margin; break;
                            case 'top-right':    x = width - sigW - margin;  y = height - sigH - margin; break;
                            case 'top-left':     x = margin;                  y = height - sigH - margin; break;
                            default:             x = margin;                  y = margin;
                        }
                        page.drawImage(sigEmbed, { x, y, width: sigW, height: sigH });
                    }
                }

                progressBar.style.width = '90%';
                progressDiv.innerHTML = 'Saving...';
                const signedBytes = await pdfDoc.save();
                const blob = new Blob([signedBytes], { type: 'application/pdf' });

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Signing complete!';
                downloadBtn.disabled = false;

                const signBase = currentFile.name.replace(/\.pdf$/i, '') || 'document';
                downloadBtn.onclick = () => downloadBlob(blob, `${signBase}-signed.pdf`);

                if (window.showToast) showToast('PDF signed successfully!');

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.textContent = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to sign PDF: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Sign PDF';
            }
        });

    } catch (___err) {
        console.error('rendersignpdf error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}