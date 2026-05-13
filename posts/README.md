# 博客文章管理指南

本目录 (`posts/`) 用于存放您的博客文章。文章按照季节分为四个子文件夹：
- `spring/`：春季发布的文章
- `summer/`：夏季发布的文章
- `autumn/`：秋季发布的文章
- `winter/`：冬季发布的文章

## 如何添加新文章

1. **选择对应季节文件夹**：将您的 Markdown 文件 (`.md`) 放入上述四个文件夹中的任意一个。
2. **添加元数据 (Front Matter)**：在 Markdown 文件的最顶部，必须包含以下格式的元数据：

```markdown
---
title: 文章标题
date: 2024-03-21
category: Tech  <-- 这里可以写具体的分类，如 Tech, Life 等
description: 文章的简短描述，将显示在列表页
tags: [Tag1, Tag2]
cover: ../static/img/new_home/bg-placeholder.jpg <-- 封面图片路径
---

这里开始写正文内容...
```

3. **支持的内容**：
    - 标准 Markdown 语法 (标题、列表、粗体等)
    - 代码块 (支持语法高亮)
    - 数学公式 (使用 `$$` 包裹 LaTeX 公式)
    - 图片 (建议放入 `static/img` 目录并引用)

## 如何更新网站显示

添加或修改文章后，您需要运行以下命令来更新网站索引：

1. 打开终端 (Terminal)
2. 确保当前目录是项目根目录
3. 运行以下命令：

```bash
node scripts/generate_index.js
```

4. 刷新网页即可看到更新。
