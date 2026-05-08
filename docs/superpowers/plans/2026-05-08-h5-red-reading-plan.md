# H5 红心阅动作品 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将《习近平的七年知青岁月》扫描版 PDF 通过 OCR 提取为结构化内容，并开发一个庄重红调的时间线叙事 H5 页面。

**Architecture:** 分两大阶段——Phase 1 用 PaddleOCR 提取 PDF 文字并梳理为 7 年份结构化 Markdown；Phase 2 构建纯静态 H5 单页（HTML + CSS + JS），纵向滚动时间线 + 底部快速跳转 + 背景配乐。

**Tech Stack:** Python 3 + PaddleOCR + pdf2image + poppler（OCR阶段）；HTML5 + CSS3 + 原生 JavaScript + Intersection Observer API（H5阶段）

---

## Phase 1: PDF 内容提取

### Task 1: 安装 OCR 依赖环境

**Files:** 无新建文件

- [ ] **Step 1: 安装 poppler（PDF 转图片工具）**

```bash
brew install poppler
```

验证：
```bash
pdftoppm -v
```

- [ ] **Step 2: 安装 Python 依赖**

```bash
pip3 install paddlepaddle paddleocr pdf2image tqdm --quiet
```

- [ ] **Step 3: 验证 PaddleOCR 可用**

```bash
python3 -c "from paddleocr import PaddleOCR; ocr = PaddleOCR(lang='ch'); print('PaddleOCR OK')"
```

Expected: 打印 "PaddleOCR OK"（首次运行会下载模型）

---

### Task 2: PDF 转图片并 OCR 提取文本

**Files:**
- Create: `scripts/ocr_extract.py`

- [ ] **Step 1: 创建 OCR 提取脚本**

```python
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
```

- [ ] **Step 2: 运行 OCR 提取（耗时较长，约 30-60 分钟）**

```bash
cd /Users/sjs/Desktop/xjp_CC && python3 scripts/ocr_extract.py
```

Expected: 生成 `content/book_raw.md` 和 `content/pages/` 下的逐页图片

---

### Task 3: 结构化整理为七年内容

**Files:**
- Create: `content/book_content.json`

- [ ] **Step 1: 提取七年关键内容并写入 JSON**

基于 OCR 提取的完整文本，梳理为 1969-1975 七年的结构化数据。

文件 `content/book_content.json`：

```json
{
  "cover": {
    "activityName": "红心阅动，信仰有声",
    "bookTitle": "习近平的七年知青岁月",
    "subtitle": "中央党校采访实录编辑室"
  },
  "years": [
    {
      "year": "1969",
      "title": "初到梁家河",
      "summary": "1969年1月，年仅15岁的习近平响应号召，从北京来到陕北延川县文安驿公社梁家河大队插队落户...",
      "quote": "书中的金句原文...",
      "review": "受访者姓名 回忆：受访者的原话...",
      "insight": "从繁华都市到贫困山村，15岁的少年面对巨大落差..."
    },
    {
      "year": "1970",
      "title": "扎根黄土地",
      "summary": "...",
      "quote": "...",
      "review": "...",
      "insight": "..."
    },
    {
      "year": "1971",
      "title": "入团",
      "summary": "...",
      "quote": "...",
      "review": "...",
      "insight": "..."
    },
    {
      "year": "1972",
      "title": "锻炼成长",
      "summary": "...",
      "quote": "...",
      "review": "...",
      "insight": "..."
    },
    {
      "year": "1973",
      "title": "入党",
      "summary": "...",
      "quote": "...",
      "review": "...",
      "insight": "..."
    },
    {
      "year": "1974",
      "title": "当选支书",
      "summary": "...",
      "quote": "...",
      "review": "...",
      "insight": "..."
    },
    {
      "year": "1975",
      "title": "离别梁家河",
      "summary": "...",
      "quote": "...",
      "review": "...",
      "insight": "..."
    }
  ]
}
```

实际内容在 OCR 提取后根据原文具体填充，确保引用准确。

---

## Phase 2: H5 页面开发

### Task 4: 创建项目文件骨架

**Files:**
- Create: `index.html`
- Create: `assets/css/style.css`
- Create: `assets/js/main.js`
- Create: `assets/audio/` (目录)

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p /Users/sjs/Desktop/xjp_CC/assets/{css,js,audio,images}
```

- [ ] **Step 2: 创建 index.html 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>红心阅动，信仰有声——习近平的七年知青岁月</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <div id="app">
    <!-- 封面 -->
    <section id="cover">...</section>
    <!-- 时间线卡片 -->
    <section id="timeline">...</section>
    <!-- 底部跳转 -->
    <nav id="timeline-nav">...</nav>
  </div>
  <!-- 音频控件 -->
  <div id="audio-control">...</div>
  <script src="assets/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: 创建 style.css 骨架**

```css
/* === Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Noto Sans SC', sans-serif;
  background: linear-gradient(180deg, #8B1A1A 0%, #5C0A0A 100%);
  color: #fff;
  overflow-x: hidden;
}
```

- [ ] **Step 4: 创建 main.js 骨架**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // 音频管理
  // Intersection Observer 动效触发
  // 时间轴导航
});
```

---

### Task 5: 实现封面页

**Files:**
- Modify: `index.html` (封面 section)
- Modify: `assets/css/style.css` (封面样式)
- Modify: `assets/js/main.js` (封面交互)

- [ ] **Step 1: 封面 HTML**

```html
<section id="cover" class="fullscreen">
  <div class="cover-bg"></div>
  <div class="cover-content">
    <div class="party-emblem">★</div>
    <h2 class="cover-activity">红心阅动，信仰有声</h2>
    <div class="cover-divider"></div>
    <h1 class="cover-title">习近平的七年知青岁月</h1>
    <p class="cover-subtitle">中央党校采访实录编辑室</p>
    <button class="cover-btn" id="startBtn">开始阅读</button>
  </div>
  <div class="cover-ribbon left"></div>
  <div class="cover-ribbon right"></div>
</section>
```

- [ ] **Step 2: 封面 CSS**

```css
#cover {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: radial-gradient(ellipse at center, #C41E3A 0%, #8B1A1A 40%, #3D0000 100%);
  overflow: hidden;
}

.cover-bg {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px),
    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px);
}

.party-emblem {
  font-size: 3rem;
  color: #FFD700;
  animation: emblemGlow 3s ease-in-out infinite;
}

@keyframes emblemGlow {
  0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.5); }
  50% { text-shadow: 0 0 40px rgba(255,215,0,0.9); }
}

.cover-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
}

.cover-activity {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.4rem;
  letter-spacing: 0.3em;
  color: #FFD700;
  margin-bottom: 1rem;
}

.cover-divider {
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #FFD700, transparent);
  margin: 1.5rem auto;
}

.cover-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  letter-spacing: 0.1em;
  line-height: 1.4;
}

.cover-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  margin-top: 0.8rem;
  letter-spacing: 0.2em;
}

.cover-btn {
  margin-top: 3rem;
  padding: 0.9rem 2.5rem;
  font-size: 1.1rem;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.2em;
  color: #fff;
  background: linear-gradient(135deg, #C41E3A, #D4A843);
  border: 1px solid rgba(255,215,0,0.4);
  border-radius: 2rem;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cover-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212,168,67,0.3);
}

.cover-ribbon {
  position: absolute;
  top: 0;
  width: 15px;
  height: 100%;
  background: linear-gradient(180deg, #FFD700, #C41E3A 50%, #FFD700);
  opacity: 0.3;
}
.cover-ribbon.left { left: 30px; }
.cover-ribbon.right { right: 30px; }
```

- [ ] **Step 3: 封面 JS**

```javascript
// 开始阅读按钮
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
});
```

---

### Task 6: 实现时间线卡片区域

**Files:**
- Modify: `index.html` (时间线 section)
- Modify: `assets/css/style.css` (时间线样式)

- [ ] **Step 1: 时间线 HTML（1969 示例，其余同理）**

```html
<section id="timeline">
  <div class="timeline-line"></div>
  <div class="cards-container">
    <!-- 1969 -->
    <article class="card fade-in" data-year="1969">
      <div class="card-year">1969</div>
      <h3 class="card-title">初到梁家河</h3>
      <p class="card-summary">…事件摘要…</p>
      <blockquote class="card-quote"><span class="quote-mark">「</span>…金句…<span class="quote-mark">」</span></blockquote>
      <div class="card-review">
        <span class="review-label">受访者回忆</span>
        <p>…受访者点评…</p>
      </div>
      <div class="card-insight">
        <span class="insight-label">成长感悟</span>
        <p>…成长感悟…</p>
      </div>
      <div class="card-image-placeholder">
        <span>📷</span>
      </div>
    </article>
    <!-- 1970-1975 依次同上结构 -->
  </div>
</section>
```

- [ ] **Step 2: 时间线 CSS**

```css
#timeline {
  position: relative;
  padding: 4rem 1.5rem;
}

.timeline-line {
  position: absolute;
  left: 2rem;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg,
    rgba(212,168,67,0.1) 0%,
    rgba(212,168,67,0.6) var(--progress, 0%),
    rgba(212,168,67,0.1) 100%
  );
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.card {
  position: relative;
  margin-left: 3rem;
  padding: 2rem 1.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(212,168,67,0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

/* 时间轴圆点 */
.card::before {
  content: '';
  position: absolute;
  left: calc(-3rem - 8px);
  top: 2.2rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #FFD700;
  border: 3px solid #8B1A1A;
  box-shadow: 0 0 10px rgba(255,215,0,0.4);
}

.card-year {
  font-family: 'Noto Serif SC', serif;
  font-size: 3rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 2px 10px rgba(212,168,67,0.3);
  line-height: 1;
}

.card-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.5rem;
  color: #fff;
  margin: 0.5rem 0 1rem;
}

.card-summary {
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(255,255,255,0.9);
}

.card-quote {
  margin: 1.5rem 0;
  padding: 1rem 1.2rem;
  background: rgba(212,168,67,0.1);
  border-left: 3px solid #FFD700;
  font-family: 'Noto Serif SC', serif;
  font-size: 1.05rem;
  line-height: 1.8;
  color: #FFD700;
}

.quote-mark { color: #FFD700; font-size: 1.5rem; }

.card-review {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
}

.review-label, .insight-label {
  font-size: 0.8rem;
  color: #D4A843;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.card-review p, .card-insight p {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.8);
}

.card-insight {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(196,30,58,0.2);
  border-radius: 8px;
}

.card-image-placeholder {
  margin-top: 1.5rem;
  height: 180px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(212,168,67,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: rgba(255,255,255,0.2);
}
```

---

### Task 7: 实现卡片进场动效（Intersection Observer + CSS）

**Files:**
- Modify: `assets/css/style.css` (动画 keyframes)
- Modify: `assets/js/main.js` (Observer)

- [ ] **Step 1: CSS 动画**

```css
/* 卡片淡入上移 */
.fade-in {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 打字机效果 */
.typewriter {
  border-right: 2px solid #FFD700;
  white-space: pre-wrap;
  overflow: hidden;
  animation: blink 0.8s step-end infinite;
}
@keyframes blink {
  50% { border-color: transparent; }
}

/* 时间线脉冲 */
.card.active::before {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.4); }
  50% { box-shadow: 0 0 25px rgba(255,215,0,0.9); }
}

/* 封面标题光泽扫过 */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.cover-title {
  background: linear-gradient(90deg, #fff 0%, #FFD700 25%, #fff 50%, #FFD700 75%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}
```

- [ ] **Step 2: Intersection Observer JS**

```javascript
// 卡片进场
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // 金句打字机
      const quote = entry.target.querySelector('.card-quote');
      if (quote && !quote.dataset.typed) {
        typeWriter(quote);
        quote.dataset.typed = 'true';
      }
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// 时间轴进度
const timelineLine = document.querySelector('.timeline-line');
window.addEventListener('scroll', () => {
  const timeline = document.getElementById('timeline');
  const rect = timeline.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const progress = Math.max(0, Math.min(100, (-rect.top / total) * 100));
  timelineLine.style.setProperty('--progress', progress + '%');

  // 高亮当前卡片
  document.querySelectorAll('.card').forEach(card => {
    const cr = card.getBoundingClientRect();
    if (cr.top < window.innerHeight * 0.5 && cr.bottom > window.innerHeight * 0.3) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
});
```

---

### Task 8: 实现打字机效果函数

**Files:**
- Modify: `assets/js/main.js` (typeWriter 函数)

- [ ] **Step: 打字机效果**

```javascript
function typeWriter(element) {
  const text = element.textContent.trim();
  element.textContent = '';
  element.classList.add('typewriter');
  let i = 0;

  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
    } else {
      clearInterval(timer);
      element.classList.remove('typewriter');
    }
  }, 60);
}
```

---

### Task 9: 实现底部时间轴快速跳转

**Files:**
- Modify: `index.html` (底部导航)
- Modify: `assets/css/style.css` (导航样式)
- Modify: `assets/js/main.js` (跳转逻辑)

- [ ] **Step 1: 底部导航 HTML**

```html
<nav id="timeline-nav">
  <div class="nav-track">
    <span class="nav-dot" data-target="1969">1969</span>
    <span class="nav-dot" data-target="1970">1970</span>
    <span class="nav-dot" data-target="1971">1971</span>
    <span class="nav-dot" data-target="1972">1972</span>
    <span class="nav-dot" data-target="1973">1973</span>
    <span class="nav-dot" data-target="1974">1974</span>
    <span class="nav-dot" data-target="1975">1975</span>
  </div>
</nav>
```

- [ ] **Step 2: 导航 CSS**

```css
#timeline-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 0.5rem;
  background: linear-gradient(0deg, rgba(61,0,0,0.95), transparent);
  z-index: 100;
}

.nav-track {
  display: flex;
  justify-content: space-around;
  max-width: 500px;
  margin: 0 auto;
}

.nav-dot {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 1rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.nav-dot.active,
.nav-dot:hover {
  color: #FFD700;
  background: rgba(212,168,67,0.15);
}
```

- [ ] **Step 3: 跳转 JS**

```javascript
document.querySelectorAll('.nav-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    const targetYear = dot.dataset.target;
    const card = document.querySelector(`.card[data-year="${targetYear}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});

// 滚动时更新导航高亮
window.addEventListener('scroll', () => {
  let currentYear = null;
  document.querySelectorAll('.card').forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.5) {
      currentYear = card.dataset.year;
    }
  });
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === currentYear);
  });
});
```

---

### Task 10: 实现音频控制

**Files:**
- Modify: `index.html` (音频元素)
- Modify: `assets/css/style.css` (音频按钮样式)
- Modify: `assets/js/main.js` (音频逻辑)

- [ ] **Step 1: 音频 HTML**

```html
<audio id="bgm" loop preload="auto">
  <source src="assets/audio/bgm.mp3" type="audio/mpeg">
</audio>
<div id="audio-control" class="audio-btn muted" title="点击播放音乐">
  <span class="audio-icon">🔇</span>
</div>
```

- [ ] **Step 2: 音频 CSS**

```css
.audio-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,168,67,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}
.audio-btn:hover { background: rgba(0,0,0,0.6); }
.audio-btn.playing { border-color: rgba(212,168,67,0.8); }
.audio-icon { font-size: 1.2rem; }
```

- [ ] **Step 3: 音频 JS**

```javascript
const bgm = document.getElementById('bgm');
const audioBtn = document.getElementById('audio-control');
const audioIcon = audioBtn.querySelector('.audio-icon');
let audioStarted = false;

// 用户首次任意交互时尝试播放
function tryPlayAudio() {
  if (!audioStarted) {
    bgm.play().then(() => {
      audioStarted = true;
      audioBtn.classList.remove('muted');
      audioBtn.classList.add('playing');
      audioIcon.textContent = '🎵';
    }).catch(() => {});
  }
}
document.addEventListener('click', tryPlayAudio, { once: false });

// 手动切换
audioBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (bgm.paused) {
    bgm.play();
    audioBtn.classList.add('playing');
    audioBtn.classList.remove('muted');
    audioIcon.textContent = '🎵';
    audioStarted = true;
  } else {
    bgm.pause();
    audioBtn.classList.remove('playing');
    audioBtn.classList.add('muted');
    audioIcon.textContent = '🔇';
  }
});
```

---

### Task 11: PC 端适配与最终样式打磨

**Files:**
- Modify: `assets/css/style.css` (响应式)

- [ ] **Step: 添加 PC 端媒体查询**

```css
/* PC 端适配 */
@media (min-width: 768px) {
  #cover { padding: 4rem; }
  .cover-title { font-size: 3rem; }
  .cover-activity { font-size: 1.8rem; }

  #timeline {
    max-width: 700px;
    margin: 0 auto;
    padding: 6rem 2rem;
  }

  .cards-container { gap: 5rem; }

  .card {
    margin-left: 4rem;
    padding: 3rem 2.5rem;
  }

  .card-year { font-size: 4rem; }
  .card-title { font-size: 1.8rem; }

  #timeline-nav { padding: 1.5rem; }
  .nav-dot { font-size: 0.8rem; }

  .timeline-line { left: 3rem; }
}
```

---

### Task 12: 内容填充与最终集成

**Files:**
- Modify: `index.html` (用真实内容替换占位文本)
- Modify: `assets/audio/` (放置 bgm.mp3)

- [ ] **Step 1: 将 `content/book_content.json` 中七年内容填入各卡片**

替换每个 `<article class="card">` 内的 summary、quote、review、insight 占位文本为 OCR 提取并结构化后的真实内容。

- [ ] **Step 2: 准备背景音频文件**

将《我的祖国》纯音乐版 mp3 放置到 `assets/audio/bgm.mp3`（需用户自行获取或使用合法来源音频）。

- [ ] **Step 3: 浏览器测试验证**

```bash
open /Users/sjs/Desktop/xjp_CC/index.html
```

检查项：
- 封面显示正确，光泽动画正常
- 点击「开始阅读」平滑滚动
- 7 张卡片依次淡入，时间轴圆点高亮
- 金句打字机效果触发
- 底部导航点击跳转
- 音频播放/暂停正常
- 移动端（Chrome DevTools 375px 宽度）显示正常

---

### Task 13: 最终检查与提交

- [ ] **Step 1: 全面验证**

```bash
# 确认所有文件存在
ls -la index.html assets/css/style.css assets/js/main.js content/book_content.json
```

- [ ] **Step 2: 在浏览器中通览全流程**

封面 → 逐卡滚动 → 打字机 → 导航跳转 → 音频切换 → 尾页

- [ ] **Step 3: 修复发现的问题**（如有）

- [ ] **Step 4: 提交**

```bash
cd /Users/sjs/Desktop/xjp_CC
git init  # 如果尚未初始化
git add -A
git commit -m "feat: 红心阅动信仰有声 H5 作品——习近平的七年知青岁月时间线叙事页"
```
