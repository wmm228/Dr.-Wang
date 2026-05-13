# 个人主页 (Homepage)

这是一个基于静态文件 (HTML/CSS/JS) 的个人主页系统，集成了动态背景展示、音乐播放器、博客文章展示和个人简历管理功能。

## 主要功能

*   **动态背景画廊**：
    *   支持图片顺序轮播（无重复）。
    *   多种切换动画效果（平移、缩放、旋转、模糊、淡入等）。
    *   图层叠加设计，确保文字清晰可见。
*   **每日格言**：
    *   支持格言顺序轮播。
    *   带有平滑的淡入淡出效果。
*   **音乐播放器**：
    *   支持播放列表。
    *   进度条拖拽控制。
    *   播放/暂停控制。
*   **开发服务器**：
    *   内置 Python `server.py`。
    *   支持自动添加版本号（Auto-Versioning），避免浏览器缓存旧的 CSS/JS 文件。
    *   解决了连接中断（ConnectionAbortedError）等常见网络问题。

## 目录结构

- `posts/`：存放博客文章，按 `spring`, `summer`, `autumn`, `winter` 分类。
- `resume/`：存放简历经历详情 (`research.md`, `competition.md` 等)。
- `static/`：存放静态资源。
    - `css/`：样式文件 (含 `gallery.css` 动画定义)。
    - `js/`：脚本文件 (含 `home.js` 逻辑)。
    - `img/`：图片资源 (含 `gallery/` 背景图)。
    - `music/`：音乐文件。
    - `quotes/`：格言文本文件。
- `scripts/`：存放自动化脚本 (如 `generate_index.js` 用于生成文章索引)。
- `*.html`：网站页面文件。
- `server.py`：开发用 Python 服务器。

## 快速上手

### 1. 启动服务器

本项目包含一个优化的 Python 服务器，建议使用它来预览网页，以确保静态资源缓存问题得到解决。

```bash
python server.py
```

服务器启动后，在浏览器访问：[http://localhost:8000](http://localhost:8000)

### 2. 添加/修改内容

*   **添加背景图**：将图片放入 `static/img/gallery/` 目录。
*   **修改格言**：编辑 `static/quotes/quotes.txt`。
*   **添加音乐**：将 MP3 文件放入 `static/music/`，并在 `static/js/home.js` 的 `playlist` 数组中添加配置。
*   **修改动画**：在 `static/css/gallery.css` 中添加 Keyframes，并在 `static/js/home.js` 的 `animations` 数组中注册。

### 3. 文章与简历

如果修改了 `posts/` 或 `resume/` 下的 Markdown 文件，可能需要运行索引生成脚本（如果项目依赖该脚本生成 JSON 数据）：

```bash
node scripts/generate_index.js
```
