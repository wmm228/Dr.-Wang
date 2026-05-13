# 博客发布工作流 (README_BLOG_WORKFLOW)

## 你的需求
"在本地写好 MD 文件，放到 `posts/spring` 等文件夹下，前端就能自动展示。"

## 实现方案
由于静态网页无法直接扫描硬盘文件，我为你写了一个自动化脚本来完成这个“扫描”动作。

### 步骤 1：写博客
在 `posts` 目录下的对应季节文件夹（`spring`, `summer`, `autumn`, `winter`）中新建 `.md` 文件。
文件名随意，例如 `posts/spring/mytrip.md`。

**关键：** 文件开头必须包含以下“元数据”（Front Matter），否则脚本无法识别标题和日期：

```markdown
---
title: 我的博客标题
date: 2024-12-01
description: 这里写一句话简介，会显示在卡片上。
tags: [标签1, 标签2]
cover: ../../static/img/new_home/bg-placeholder.jpg
---

这里开始写正文...
```

### 步骤 2：运行更新脚本
每当你添加或修改了文章后，双击运行项目根目录下的脚本（如果你安装了 Node.js）：

打开终端（Terminal），运行：
```bash
node scripts/generate_index.js
```

运行成功后，你会看到提示：`Success! Generated index with X posts.`

### 步骤 3：刷新网页
回到浏览器，刷新博客页面，你的新文章就会出现了！

---

## 常见问题
Q: 我没有 Node.js 怎么办？
A: 既然你在运行 `http-server`，说明你已经安装了 Node.js，直接在那个终端里运行上面的命令即可。

Q: 为什么文章没显示？
A: 检查 `.md` 文件的开头是否严格遵守了 `---` 的格式，且不能有语法错误。
