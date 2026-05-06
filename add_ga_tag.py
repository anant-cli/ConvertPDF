#!/usr/bin/env python3
"""
add_ga_tag.py - Add Google Analytics tag to all HTML files in ConvertPDF repo.
Run from the root of your repository: python3 add_ga_tag.py
"""

import os
import re

GA_TAG = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8RV1Y8FVZM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-8RV1Y8FVZM');
</script>"""


def add_ga_tag(html_content):
    """Insert GA tag before </head>. Returns (updated_content, was_changed)."""
    if 'G-8RV1Y8FVZM' in html_content:
        return html_content, False
    updated = re.sub(r'(</head>)', GA_TAG + '\n\\1', html_content, count=1)
    return updated, updated != html_content


def main():
    updated_files = []
    skipped_files = []

    for root, dirs, files in os.walk('.'):
        # Skip hidden directories like .git
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for filename in files:
            if not filename.endswith('.html'):
                continue

            filepath = os.path.join(root, filename)

            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            updated_content, changed = add_ga_tag(content)

            if changed:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                rel = os.path.relpath(filepath)
                print(f"  ✓ {rel}")
                updated_files.append(rel)
            else:
                rel = os.path.relpath(filepath)
                print(f"  - SKIP (already has GA): {rel}")
                skipped_files.append(rel)

    print(f"\n{'='*50}")
    print(f"Updated : {len(updated_files)} files")
    print(f"Skipped : {len(skipped_files)} files (already had tag)")
    print(f"Total   : {len(updated_files) + len(skipped_files)} HTML files scanned")


if __name__ == '__main__':
    main()
