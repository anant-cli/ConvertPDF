# ConvertPDF – Free, Private, Client‑Side PDF Toolkit

🚀 **Convert PDFs, documents, and images entirely in your browser – no uploads, no servers, no privacy risks.**

👉 **Live site:** [convert-pdf-tool.netlify.app](https://convert-pdf-tool.netlify.app)

---

## ✨ Features & Tools

ConvertPDF offers a comprehensive suite of tools designed to handle your documents securely:

| Tool | Description |
|------|-------------|
| **📝 Markdown → PDF** | Convert Markdown into beautifully formatted PDFs directly in the browser. Supports LaTeX math, code syntax highlighting, and custom page breaks (`\newpage`). |
| **📃 DOCX → PDF** | Convert Word documents (.docx) to PDF while preserving tables, images, and formatting. |
| **🖼️ Images → PDF** | Combine multiple JPG/PNG images into a single, cohesive PDF document. Features auto‑orientation and page size control. |
| **🔐 PDF Password Protect** | Secure your PDFs with AES-256 encryption. Set permissions for printing, copying, and modifications. |
| **🧩 Merge PDFs** | Combine multiple PDF files into one. Simply drag and drop to reorder files before merging. |
| **📄 TXT → DOCX** | Convert plain text files to formatted Word documents. Customize font, size, line spacing, and auto-detect headings. |
| **📸 PDF → JPG** | Extract pages from PDFs as high-quality JPG images. Choose specific page ranges and download as a ZIP file. |
| **🎨 Any Image → PNG** | Convert any image format (JPG, GIF, BMP, WebP) to a lossless PNG. |
| **🌐 HTML → PDF** | Turn HTML snippets into printable PDFs with full CSS styling support. |
| **🔳 QR Code Generator** | Create custom QR codes with colors, error correction, and optional logos. Download in PNG or SVG format. |

### Why ConvertPDF?
✅ **100% Private:** All processing happens entirely within your browser natively. Your files *never* leave your device.  
✅ **Unlimited Use:** No file size limits, no daily quotas, no sign-up required, and absolutely no cost.  
✅ **Works Offline:** Once the page loads, the core functionality works completely offline!

---

## 🛠️ Tech Stack

ConvertPDF is built using modern web technologies to ensure speed, security, and a seamless developer experience:

- **HTML5 / CSS3 / Vanilla JavaScript** – Lightweight, responsive, mobile‑first design without heavy frameworks.
- **PDF-Lib** – For creating, merging, and encrypting PDFs.
- **Mammoth.js** – For converting DOCX files to HTML.
- **Marked** & **KaTeX** & **Prism.js** – For parsing Markdown, rendering complex LaTeX math, and styling code blocks.
- **QRCode** & **JSZip** – For generating QR codes and bundling files into ZIP archives.
- **Netlify / Vercel** – Hosted for blazing-fast CDN delivery and automatic HTTPS.

---

## 🚀 Getting Started (Run Locally)

Want to contribute or run ConvertPDF on your own machine? It's easy!

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari). No Node.js backend required!

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/anant-cli/ConvertPDF.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ConvertPDF
   ```
3. Open `index.html` in your browser, or start a local web server (e.g. using `serve` or VS Code Live Server).

---

## Content length targets (editorial)

These thresholds keep long-form pages useful for readers and comparable to serious tool sites. Count **visible body text** (ignore scripts/styles). Skip expanding a page that already meets its tier.

| Tier | Minimum words | Applies to |
|------|----------------|------------|
| Blog articles | **1500+** | `blog/*.html` except `blog/index.html` |
| Tool pages | **1000+** | `pages/*.html` |
| Other site pages | **800+** | Home, About, Contact, Privacy, Terms, `all-tools.html`, `404.html`, author hub, etc. |

Copy should match the **specific tool or topic** on that URL. Avoid generic filler, stacked transitions (“Furthermore…”, “In conclusion…”), and claims the product cannot support.

To approximate visible word counts locally (strips `script`/`style` and tags, then splits on whitespace):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/wordcount.ps1
```

Results are written to `scripts/wordcount-out.txt`.

---

## Discoverability (competing with big PDF brands)

Incumbent sites win on backlinks and age; you win on **clarity and trust**. Keep pages fast (static HTML, no upload pipeline to invent), explain **limits** honestly (e.g. KaTeX vs full TeX), and link related tools and blog posts so crawlers and humans see a coherent site—not isolated landing pages. Many templates already ship FAQ or Article JSON-LD; keep titles and descriptions aligned with what each URL actually does.

---

## AdSense-ready (without pasting tags everywhere)

“AdSense-ready” means policy and technical groundwork, **not** embedding the AdSense script on every HTML file.

- **Privacy and terms:** Clear pages (`privacy.html`, `terms.html`) describing processing, cookies/consent, and third parties.
- **Consent defaults:** `analytics-head.js` loads GA4 with Consent Mode defaults that **deny** ad-related storage until you wire a real consent banner update (see `components.js` for the site chrome).
- **CSP and ad domains:** `netlify.toml` already allows Google ad/Doubleclick endpoints so that, **after** Google approves the site, you can add **one** global loader or a small number of placement containers—prefer a single include or shared partial rather than duplicating snippets per page.
- **`ads.txt`:** Present at repo root for when you connect a publisher account; keep it accurate to your seller IDs.

Do **not** duplicate auto-ad or unit code across dozens of static files; centralize changes and keep the default experience fast and readable.

---

## 🤝 Contributing

We welcome contributions! ConvertPDF is an open-source project driven by the community. 

- Found a bug? [Open an issue](https://github.com/anant-cli/ConvertPDF/issues).
- Have a feature request? Let us know!
- Want to write code? Submit a pull request. We have issues tagged `good first issue` to help you get started.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

*Note: The ConvertPDF name and logo are provided for use within this project; please use them respectfully.*
