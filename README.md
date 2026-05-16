# ConvertPDF - Free, Private, Client-Side PDF Toolkit

Convert PDFs, documents, and images entirely in your browser. No upload pipeline, no account, and no server-side document processing.

Live site: [convert-pdf-tool.netlify.app](https://convert-pdf-tool.netlify.app)

---

## Features and tools

ConvertPDF offers focused browser tools for common document work:

| Tool | Description |
|------|-------------|
| **Markdown to PDF** | Convert Markdown into formatted PDFs with math, code highlighting, and page breaks. |
| **DOCX to PDF** | Convert Word documents to PDF for sharing. |
| **Images to PDF** | Combine JPG or PNG images into a single PDF document. |
| **PDF Password Protect** | Add password protection and permissions to PDFs. |
| **Merge PDFs** | Combine multiple PDF files into one. |
| **Split PDF** | Extract selected pages or ranges from a PDF. |
| **Rotate PDF** | Fix sideways scanned pages. |
| **Watermark PDF** | Add text watermarks to PDF pages. |
| **Page Numbers** | Add page numbers to PDF documents. |
| **Compress PDF** | Reduce PDF file size. |
| **TXT to DOCX** | Convert plain text files to Word documents. |
| **PDF to JPG** | Export PDF pages as JPG images. |
| **Image to PNG** | Convert common image formats to PNG. |
| **HTML to PDF** | Turn HTML snippets into printable PDFs. |
| **QR Code Generator** | Create QR codes in PNG or SVG format. |

### Why ConvertPDF?

- **Private:** Core document processing happens in the browser. Files are not uploaded for conversion.
- **Simple:** No sign-up, no install, and no account workflow.
- **Offline capable:** A service worker caches core pages after the first load.

---

## Tech stack

ConvertPDF is built using modern web technologies to ensure speed, security, and a seamless developer experience:

- **HTML5 / CSS3 / Vanilla JavaScript** - Lightweight, responsive, mobile-first design without heavy frameworks.
- **PDF-Lib** - For creating, merging, and encrypting PDFs.
- **Mammoth.js** - For converting DOCX files to HTML.
- **Marked** & **KaTeX** & **Prism.js** - For parsing Markdown, rendering complex LaTeX math, and styling code blocks.
- **QRCode** & **JSZip** - For generating QR codes and bundling files into ZIP archives.
- **Netlify / Vercel** - Hosted for blazing-fast CDN delivery and automatic HTTPS.

---

## Getting started (run locally)

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

## Editorial quality

Tool pages should be short, specific, and useful. Explain what the tool does, what files it accepts, what the user gets back, privacy behavior, limits, and related next steps. Do not pad pages to hit a word count.

Avoid generic filler, stacked transitions, exaggerated security claims, and content that talks about SEO instead of the user's task. Keep blog posts long only when the topic genuinely needs depth.

For monetization and competitive SEO preparation, see [ADSENSE_READINESS.md](ADSENSE_READINESS.md).

---

## Discoverability (competing with big PDF brands)

Incumbent sites win on backlinks and age; you win on **clarity and trust**. Keep pages fast (static HTML, no upload pipeline to invent), explain **limits** honestly (e.g. KaTeX vs full TeX), and link related tools and blog posts so crawlers and humans see a coherent site-not isolated landing pages. Many templates already ship FAQ or Article JSON-LD; keep titles and descriptions aligned with what each URL actually does.

---

## AdSense-ready (without pasting tags everywhere)

"AdSense-ready" means policy and technical groundwork, **not** embedding the AdSense script on every HTML file.

- **Privacy and terms:** Clear pages (`privacy.html`, `terms.html`) describing processing, cookies/consent, and third parties.
- **Consent defaults:** `analytics-head.js` loads GA4 with Consent Mode defaults that **deny** ad-related storage until you wire a real consent banner update (see `components.js` for the site chrome).
- **CSP and ad domains:** `netlify.toml` already allows Google ad/Doubleclick endpoints so that, **after** Google approves the site, you can add **one** global loader or a small number of placement containers-prefer a single include or shared partial rather than duplicating snippets per page.
- **`ads.txt`:** Present at repo root for when you connect a publisher account; keep it accurate to your seller IDs.

Do **not** duplicate auto-ad or unit code across dozens of static files; centralize changes and keep the default experience fast and readable.

---

## Support & Feedback

Have questions or feedback? Contact us at convertpdf.contact@gmail.com.

## License

This project is proprietary. Third-party open-source libraries used within the project retain their respective licenses. See the [LICENSE](LICENSE) file for details.
