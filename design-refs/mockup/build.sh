#!/usr/bin/env bash
# 设计稿构建：把整页 HTML 按顶层 .page 拆成单页 → html2poster 逐页渲染 → 合并为同名 PDF
# 用法：bash build.sh [stem ...]   # stem 为 design-refs/mockup 下的 html 文件名（不含扩展名）
# 默认构建 course-shelf 与 components 两个目标
set -euo pipefail
cd "$(dirname "$0")"

PDF_SKILL_DIR="${PDF_SKILL_DIR:-$HOME/.zcode/cli/plugins/cache/zcode-plugins-official/pdf/0.1.7/skills/pdf}"
export PDF_SKILL_DIR

STEMS=("$@")
if [ ${#STEMS[@]} -eq 0 ]; then
  STEMS=(course-shelf components)
fi

for STEM in "${STEMS[@]}"; do
  SRC="${STEM}.html"
  [ -f "$SRC" ] || { echo "!! 缺少 $SRC，跳过"; continue; }
  OUT_DIR="single-${STEM}"
  mkdir -p "$OUT_DIR"

  # 1. 按顶层 .page 拆单页（固定布局必须走 html2poster，不能用 html2pdf-next）
  python3 - "$SRC" "$OUT_DIR" <<'EOF'
import re, sys
src, out_dir = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8").read()
head, rest = html.split("<body>", 1)
body_inner = rest.rsplit("</body>", 1)[0]
pat = re.compile(r'(?=<div class="page(?: cover)?">)')
chunks = [c for c in pat.split(body_inner) if c.lstrip().startswith('<div class="page')]
for i, page_html in enumerate(chunks, 1):
    page_html = re.sub(r'<!-- =+[^>]+-->\s*$', '', page_html.rstrip()) + "\n"
    page_html = page_html.replace("page-break-after: always;", "page-break-after: auto;")
    open(f"{out_dir}/page-{i}.html", "w", encoding="utf-8").write(head + "<body>\n" + page_html + "</body>\n</html>\n")
print(f"[{src}] split {len(chunks)} pages")
EOF

  # 2. 单页素材（img 相对路径以单页目录为基准）
  [ -d assets ] && cp -r assets "$OUT_DIR/assets"

  # 3. 逐页渲染
  python3 - "$OUT_DIR" <<'EOF'
import glob, os, re, subprocess, sys
out_dir = sys.argv[1]
pages = sorted(glob.glob(f"{out_dir}/page-*.html"), key=lambda p: int(re.search(r"(\d+)", os.path.basename(p)).group(1)))
for p in pages:
    out = p.replace(".html", ".pdf")
    subprocess.run(["node", f"{os.environ['PDF_SKILL_DIR']}/scripts/html2poster.js", p, "--output", out, "--width", "1280px"], check=True, capture_output=True)
print(f"[{out_dir}] rendered {len(pages)} pages")
EOF

  # 4. 合并 + 元数据
  python3 - "$OUT_DIR" "${STEM}" <<'EOF'
import glob, os, re, sys
from pypdf import PdfWriter
out_dir, stem = sys.argv[1], sys.argv[2]
pdfs = sorted(glob.glob(f"{out_dir}/page-*.pdf"), key=lambda p: int(re.search(r"(\d+)", os.path.basename(p)).group(1)))
w = PdfWriter()
for p in pdfs:
    w.append(p)
w.add_metadata({"/Title": f"课程书架设计稿 · {stem} · stack idealjs", "/Author": "Z.ai", "/Creator": "Z.ai"})
with open(f"{stem}.pdf", "wb") as f:
    w.write(f)
print(f"merged {len(pdfs)} pages -> {stem}.pdf")
EOF

  echo "done: ${STEM}.pdf"
done
