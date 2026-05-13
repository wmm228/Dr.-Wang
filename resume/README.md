# 简历内容管理指南

本目录 (`resume/`) 用于存放您的个人经历详细介绍。

## 简历板块说明

系统目前支持以下四个简历板块，请确保文件名与 ID 对应：

1. **科研经历**：文件名为 `research.md`
2. **科技竞赛**：文件名为 `competition.md`
3. **校园经历**：文件名为 `campus.md`
4. **实习经历**：文件名为 `internship.md`

**注意**：请不要随意更改文件名，否则网页链接可能会失效。如果您想添加新的简历板块，需要修改网页代码。

## 如何编辑内容

直接编辑对应的 `.md` 文件即可。文件顶部同样需要包含元数据 (Front Matter)：

```markdown
---
title: 科研经历
date: 2024-03-21
category: research  <-- 对应 ID：research, competition, campus, internship
description: 我的主要科研方向和发表论文
tags: [Research, Paper]
cover: ../static/img/new_home/bg-placeholder.jpg
---

这里开始写您的经历详情...
```

## 如何更新网站显示

编辑完成后，您需要运行以下命令来更新网站索引：

1. 打开终端 (Terminal)
2. 确保当前目录是项目根目录
3. 运行以下命令：

```bash
node scripts/generate_index.js
```

4. 刷新网页即可看到更新。
