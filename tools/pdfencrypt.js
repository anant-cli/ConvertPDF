// pdfencrypt.js - Using official pdf-lib
async function renderpdfencrypt(container) {
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Protect your PDFs with a password. Set permissions for printing, copying, and modifying. 100% private, no uploads.");
        updatePageTitle("PDF Password Protector");

        area.innerHTML = `
        <h3>🔐 PDF Password Protection</h3>
        <p class="tool-description">
            Secure your PDF with a password. All encryption happens locally – your password and file never touch a server.
        </p>

        <div style="display:flex; flex-direction:column; gap:1.2rem; max-width:500px; margin: 0 auto; padding: 1rem; border: 1px solid var(--border-subtle); border-radius: var(--r-lg); background: var(--bg-surface);">
            <div id="pdfDropZone" class="drop-zone" style="padding: 1.5rem; border-width: 1px;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📄➕🔐</div>
                <p style="font-size: 0.9rem;">Select PDF to encrypt</p>
                <input type="file" id="pdfToEncrypt" accept=".pdf" style="display: none;">
            </div>

            <div class="input-group">
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.4rem;">User Password</label>
                <input type="password" id="pdfPassword" placeholder="Required to open the PDF" style="max-width: 100%;">
                <div class="progress-bar-bg" style="height: 4px; margin-top: 0.5rem;">
                    <div id="pwdStrengthBar" class="progress-bar-fill" style="width: 0%;"></div>
                </div>
                <div id="pwdStrengthText" style="font-size: 0.75rem; margin-top: 0.2rem; font-weight: 600; text-align: right;"></div>
            </div>

            <div class="input-group">
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.4rem;">Confirm Password</label>
                <input type="password" id="pdfConfirmPassword" placeholder="Repeat user password" style="max-width: 100%;">
            </div>

            <div class="faq-section" style="margin: 0; padding: 0.5rem; background: #f8faff;">
                <details>
                    <summary style="font-size: 0.85rem; padding: 0.5rem;">Advanced Permissions</summary>
                    <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                         <input type="password" id="pdfOwnerPassword" placeholder="Owner Password (optional)" style="max-width: 100%; font-size: 0.85rem;">
                         <div class="permissions-grid" style="font-size: 0.85rem;">
                            <label><input type="checkbox" id="permPrint" checked> Print</label>
                            <label><input type="checkbox" id="permCopy" checked> Copy</label>
                            <label><input type="checkbox" id="permModify"> Modify</label>
                        </div>
                    </div>
                </details>
            </div>

            <button id="encryptPdfBtn" class="primary" style="width: 100%;">🔒 Encrypt & Download</button>
        </div>
        `;

        const pdfFile = document.getElementById('pdfToEncrypt');
        const pdfDropZone = document.getElementById('pdfDropZone');
        const pdfPassword = document.getElementById('pdfPassword');
        const pdfConfirm = document.getElementById('pdfConfirmPassword');
        const pdfOwnerPassword = document.getElementById('pdfOwnerPassword');
        const permPrint = document.getElementById('permPrint');
        const permCopy = document.getElementById('permCopy');
        const permModify = document.getElementById('permModify');
        const encryptBtn = document.getElementById('encryptPdfBtn');

        // Setup drop zone
        pdfDropZone.addEventListener('click', () => pdfFile.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('pdfDropZone', 'pdfToEncrypt');
        }

        // Password strength meter
        pdfPassword.addEventListener('input', () => {
            if (window.updatePasswordStrengthMeter) {
                updatePasswordStrengthMeter(pdfPassword.value, 'pwdStrengthBar', 'pwdStrengthText');
            }
        });

        encryptBtn.addEventListener('click', async () => {
            const file = pdfFile.files[0];
            const pwd = pdfPassword.value;
            const confirm = pdfConfirm.value;
            const ownerPwd = pdfOwnerPassword.value || pwd;

            if (!file) { alert('Please select a PDF file.'); return; }
            if (!pwd) { alert('Please enter a user password.'); return; }
            if (pwd !== confirm) { alert('User passwords do not match.'); return; }
            if (pwd.length < 6) { alert('User password must be at least 6 characters.'); return; }

            encryptBtn.disabled = true;
            encryptBtn.innerHTML = '⏳ Encrypting...';

            try {
                if (typeof PDFLib === 'undefined') throw new Error('PDF library not loaded. Please refresh the page.');
                const { PDFDocument } = PDFLib;

                // Load the PDF
                const arrayBuf = await file.arrayBuffer();
                let pdfDoc;
                try {
                    pdfDoc = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
                } catch (loadErr) {
                    if (loadErr.message && loadErr.message.toLowerCase().includes('password')) {
                        throw new Error('This PDF is already encrypted. Please remove the password first.');
                    }
                    throw new Error('Invalid or corrupted PDF file.');
                }

                // Create a new PDF and copy all pages (this is necessary to apply encryption)
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => newPdf.addPage(page));

                // Encrypt the new PDF
                await newPdf.encrypt({
                    userPassword: pwd,
                    ownerPassword: ownerPwd,
                    permissions: {
                        printing: permPrint.checked ? 'highResolution' : 'none',
                        modifying: permModify.checked,
                        copying: permCopy.checked,
                        annotating: false,
                        fillingForms: false,
                        contentAccessibility: true,
                        documentAssembly: false
                    }
                });

                const encryptedBytes = await newPdf.save();
                downloadBlob(new Blob([encryptedBytes]), `protected-${file.name}`);

                if (window.showToast) showToast('PDF encrypted successfully!');
            } catch (error) {
                console.error('Encryption error:', error);
                if (window.showToast) {
                    showToast('Encryption failed: ' + error.message, 'error');
                } else {
                    alert('Encryption failed: ' + error.message);
                }
            } finally {
                encryptBtn.disabled = false;
                encryptBtn.innerHTML = '🔒 Encrypt & Download';
            }
        });
    } catch (___err) {
        console.error('renderpdfencrypt error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}