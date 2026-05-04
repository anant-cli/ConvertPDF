// signpdf.js
async function rendersignpdf(container) {
    try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Sign PDF documents digitally with text or drawn signatures. 100% private, no uploads.");
        updatePageTitle("PDF Signing Tool");

        area.innerHTML = `
        <h3>✍️ Sign PDF</h3>
        <p class="tool-description">
            Add digital signatures to PDF documents. Choose between typing your name or drawing a signature.
            Signatures are embedded directly into the PDF using standard PDF annotation features.
            After signing, you can also <a href="pdfencrypt.html" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>What type of signatures can I add?</summary>
                <p>You can either type your name (rendered as text) or draw a signature using your mouse/touch.</p>
            </details>
            <details>
                <summary>Are these legally binding signatures?</summary>
                <p>These are visual signatures for informal use. For legally binding signatures, use certified digital signature services.</p>
            </details>
        </div>
        <div id="signPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕✍️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="signPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="signOptions" style="display:none; margin-bottom: 1rem;">
            <div class="input-group">
                <label for="signatureType">Signature Type</label>
                <select id="signatureType">
                    <option value="text">Type Name</option>
                    <option value="draw">Draw Signature</option>
                </select>
            </div>

            <div id="textSignatureGroup" class="input-group">
                <label for="signatureText">Your Name</label>
                <input type="text" id="signatureText" placeholder="Enter your full name" maxlength="50">
            </div>

            <div id="drawSignatureGroup" class="input-group" style="display:none;">
                <label>Draw your signature below</label>
                <canvas id="signatureCanvas" width="400" height="200" style="border: 1px solid var(--border); border-radius: 4px; background: white; cursor: crosshair; max-width: 100%;"></canvas>
                <div style="margin-top: 0.5rem;">
                    <button id="clearSignature" class="secondary" type="button">Clear Drawing</button>
                </div>
            </div>

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
                </select>
                <p class="note">For multi-page PDFs, you can choose which page to sign.</p>
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
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Setup canvas drawing
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            startDrawing({ clientX: touch.clientX - rect.left, clientY: touch.clientY - rect.top });
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            draw({ clientX: touch.clientX - rect.left, clientY: touch.clientY - rect.top });
        });
        canvas.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(e.clientX, e.clientY);
        }

        function draw(e) {
            if (!isDrawing) return;
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
        }

        function stopDrawing() {
            isDrawing = false;
        }

        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        // Setup drag and drop
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('signPdfDropZone', 'signPdfInput');
        }

        sigTypeSel.addEventListener('change', () => {
            if (sigTypeSel.value === 'text') {
                textSigGroup.style.display = 'block';
                drawSigGroup.style.display = 'none';
            } else {
                textSigGroup.style.display = 'none';
                drawSigGroup.style.display = 'block';
            }
        });

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            currentFile = file;
            options.style.display = 'block';
            downloadBtn.disabled = true;
            btn.disabled = false;

            if (window.showToast) showToast(`Loaded PDF for signing`);
        });

        btn.addEventListener('click', async () => {
            if (!currentFile) return;

            let signatureValid = false;
            if (sigTypeSel.value === 'text') {
                signatureValid = textInput.value.trim().length > 0;
            } else {
                // Check if canvas has drawing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                signatureValid = imageData.data.some(pixel => pixel !== 0);
            }

            if (!signatureValid) {
                if (window.showToast) showToast('Please provide a signature first', 'error');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Signing...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Adding signature...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await currentFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);

                progressBar.style.width = '50%';

                const pages = pdfDoc.getPages();
                const targetPageIndex = pageSel.value === 'first' ? 0 : pages.length - 1;
                const page = pages[targetPageIndex];

                const { width, height } = page.getSize();

                if (sigTypeSel.value === 'text') {
                    // Add text signature
                    const fontSize = 24;
                    const text = textInput.value.trim();
                    const textWidth = text.length * fontSize * 0.6; // Rough estimate

                    let x, y;
                    switch (positionSel.value) {
                        case 'bottom-right':
                            x = width - textWidth - 50;
                            y = 100;
                            break;
                        case 'bottom-left':
                            x = 50;
                            y = 100;
                            break;
                        case 'top-right':
                            x = width - textWidth - 50;
                            y = height - 50;
                            break;
                        case 'top-left':
                            x = 50;
                            y = height - 50;
                            break;
                    }

                    page.drawText(text, {
                        x,
                        y,
                        size: fontSize,
                        color: PDFLib.rgb(0, 0, 0)
                    });
                } else {
                    // Add drawn signature
                    const signatureImage = canvas.toDataURL('image/png');
                    const signatureBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
                    const signatureImageEmbed = await pdfDoc.embedPng(signatureBytes);

                    const sigWidth = 200;
                    const sigHeight = (signatureImageEmbed.height / signatureImageEmbed.width) * sigWidth;

                    let x, y;
                    switch (positionSel.value) {
                        case 'bottom-right':
                            x = width - sigWidth - 50;
                            y = 50;
                            break;
                        case 'bottom-left':
                            x = 50;
                            y = 50;
                            break;
                        case 'top-right':
                            x = width - sigWidth - 50;
                            y = height - sigHeight - 50;
                            break;
                        case 'top-left':
                            x = 50;
                            y = height - sigHeight - 50;
                            break;
                    }

                    page.drawImage(signatureImageEmbed, {
                        x,
                        y,
                        width: sigWidth,
                        height: sigHeight
                    });
                }

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Signature added successfully!';

                const signedBytes = await pdfDoc.save();
                const blob = new Blob([signedBytes], { type: 'application/pdf' });
                downloadBtn.disabled = false;

                downloadBtn.onclick = () => downloadBlob(blob, 'signed.pdf');

                if (window.showToast) showToast('PDF signed successfully!');

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.innerHTML = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to sign PDF: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Sign PDF';
            }
        });
    } catch (___err) {
        console.error('rendersignpdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}