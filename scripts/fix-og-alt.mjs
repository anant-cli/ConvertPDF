import fs from 'fs';
import path from 'path';
const dir = 'E:/ConvertPDF/pages';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.html')) continue;
  const p = path.join(dir, f);
  let t = fs.readFileSync(p, 'utf8');
  t = t.replace(
    /<meta property="og:image:alt" content="([^"]*)">/g,
    (full, inner) => {
      const cleaned = inner.replace(/\s*\uFFFD\s*/g, ' — ').replace(/\s+—\s+—+/g, ' — ');
      return `<meta property="og:image:alt" content="${cleaned}">`;
    }
  );
  fs.writeFileSync(p, t);
}
