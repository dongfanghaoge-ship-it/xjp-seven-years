#!/usr/bin/env python3
"""将扫描版 PDF 逐页转为图片并用 PaddleOCR 提取文字，输出为 Markdown。"""
import os
from pdf2image import convert_from_path
from paddleocr import PaddleOCR
from tqdm import tqdm

PDF_PATH = "习近平的七年知青岁月 (中央党校采访实录编辑室) (z-library.sk, 1lib.sk, z-lib.sk).pdf"
OUTPUT_DIR = "content"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "pages")
OUTPUT_MD = os.path.join(OUTPUT_DIR, "book_raw.md")

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

ocr = PaddleOCR(lang="ch")

# 转换 PDF 为图片
print("Converting PDF to images...")
images = convert_from_path(PDF_PATH, dpi=300)
total = len(images)
print(f"Total pages: {total}")

# 逐页 OCR
with open(OUTPUT_MD, "w", encoding="utf-8") as f:
    f.write(f"# 《习近平的七年知青岁月》OCR 提取\n\n")
    f.write(f"> 总页数: {total}\n\n")
    f.write("---\n\n")

    for i, img in enumerate(tqdm(images, desc="OCR")):
        # 保存图片备用
        img_path = os.path.join(IMAGES_DIR, f"page_{i+1:04d}.png")
        img.save(img_path, "PNG")

        # OCR 识别
        result = ocr.ocr(img_path)

        f.write(f"## 第 {i+1} 页\n\n")

        if result and result[0]:
            lines = [item[1][0] for item in result[0]]
            text = "\n".join(lines)
            f.write(text + "\n\n")
        else:
            f.write("*(本页无可识别文字)*\n\n")

        f.write("---\n\n")

print(f"\nDone! Output: {OUTPUT_MD}")
