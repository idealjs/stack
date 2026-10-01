#!/usr/bin/env bash
# 课程书架设计稿构建：course-shelf.html → 5 个单页 PDF → 合并 course-shelf.pdf
# 依赖：pdf skill 的 html2poster.js + pypdf（playwright + chromium 需可用）
set -euo pipefail
cd "$(dirname "$0")"

PDF_SKILL_DIR="${PDF_SKILL_DIR:-$HOME/.zcode/cli/plugins/cache/zcode-plugins-official/pdf/0.1.7/skills/pdf}"
export PDF_SKILL_DIR

# 1. 按 .page 拆成单页 HTML（固定布局必须走 html2poster，不能用 html2pdf-next）
python3 - <<'EOF'
import os, re
html = open("course-shelf.html", encoding="utf-8").read()
head, rest = html.split("<body>", 1)
body_inner = rest.rsplit("</body>", 1)[0]
pat = re.compile(r'(?=<div class="page(?: cover)?">)')
chunks = [c for c in pat.split(body_inner) if c.lstrip().startswith('<div class="page')]
os.makedirs("single", exist_ok=True)
for i, page_html in enumerate(chunks, 1):
    page_html = re.sub(r'<!-- =+[^>]+-->\s*$', '', page_html.rstrip()) + "\n"
    page_html = page_html.replace("page-break-after: always;", "page-break-after: auto;")
    open(f"single/page-{i}.html", "w", encoding="utf-8").write(head + "<body>\n" + page_html + "</body>\n</html>\n")
print(f"split {len(chunks)} pages")
EOF

# 2. 单页素材（img 相对路径以 single/ 为基准）
cp -r assets single/assets

# 3. 逐页渲染 + 合并
python3 - <<'EOF'
import glob, subprocess, sys
pages = sorted(glob.glob("single/page-*.html"), key=lambda p: int(__import__('re').search(r'(\d+)', p).group(1)))
for p in pages:
    out = p.replace(".html", ".pdf")
    subprocess.run(["node", f"{__import__('os').environ['PDF_SKILL_DIR']}/scripts/html2poster.js", p, "--output", out, "--width", "1280px"], check=True, capture_output=True)
    print("rendered", out)
EOF

python3 - <<'EOF'
import re
from pypdf import PdfWriter
w = PdfWriter()
for i in range(1, 6):
    w.append(f"single/page-{i}.pdf")
w.add_metadata({"/Title": "课程书架设计稿 · stack idealjs", "/Author": "Z.ai", "/Subject": "全栈工程师教程课程预览重构设计稿", "/Creator": "Z.ai"})
with open("course-shelf.pdf", "wb") as f:
    w.write(f)
print("merged -> course-shelf.pdf")
EOF

echo "done: course-shelf.pdf"
