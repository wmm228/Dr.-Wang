# 首页布局修改指南 (README_kuang)

这个文档将指导你如何手动调整首页卡片的大小、长宽和间距。所有的样式修改都在 `static/css/home.css` 文件中进行。

## 1. 核心布局控制 (长宽与整体)

找到文件：`static/css/home.css`
搜索类名：`.main-container` (大约在第 165 行附近)

```css
.main-container {
    width: 1400px;           /* [1] 页面总宽度：数字越大，页面越宽 */
    max-width: 95%;          /* 移动端适配宽度限制 */
    margin: 3rem auto;       /* [2] 上边距：3rem 是距离顶部的距离 */
    height: auto;
    display: grid;
    
    /* [3] 列数定义：这里定义了页面被分为 6 等份 */
    grid-template-columns: repeat(6, 1fr);
    
    /* [4] 行高控制 (最关键的部分！) */
    /* 第一个数字 350px 是第一行卡片的高度 */
    /* 第二个数字 220px 是第二行卡片的高度 */
    grid-template-rows: 350px 220px; 
    
    gap: 1.5rem;             /* [5] 卡片之间的间距 */
    padding: 0;
}
```

### 如何修改：
*   **觉得卡片太高/太矮？** 修改 `[4]` 中的 `grid-template-rows`。例如，想让第一行变矮，把 `350px` 改为 `300px`。
*   **觉得页面太窄/太宽？** 修改 `[1]` 中的 `width`。例如，改为 `1200px` 会更窄。
*   **觉得离顶部太近？** 修改 `[2]` 中的 `margin` 的第一个值，例如改为 `5rem`。

### 调整底部版权信息的距离

**问题：觉得底部的 "© 2024 Wmumu..." 离上面的卡片太远了？**
> **解决**：同样在 `.main-container` (约 168 行) 中修改 `margin`。
>
> 原代码：
> ```css
> margin: 3rem auto;
> ```
>
> 修改为（三个数值分别代表：上边距、左右自动、下边距）：
> ```css
> margin: 3rem auto 1rem;
> ```
>
> *   `3rem` 是上边距（距离导航栏）。
> *   `1rem` 是下边距（距离底部版权文字），改小这个数字（比如 `0.5rem` 或 `0`）就可以拉近距离。

---

## 2. 单个卡片控制 (对应关系)

如果你想单独调整某个卡片的特殊样式，请查找以下类名：

### 第一行 (上部)
*   **左侧个人介绍 (About)**: `.about-card` (约第 197 行)
    *   默认占据 3 列 (`grid-column: span 3`)，即总宽度的 50%。
*   **右侧图片 (Image)**: `.image-card` (约第 355 行)
    *   默认占据 3 列 (`grid-column: span 3`)，即总宽度的 50%。

### 第二行 (下部)
*   **左侧音乐播放器**: `.music-card` (约第 367 行)
    *   默认占据 2 列 (`grid-column: span 2`)，即总宽度的 33%。
*   **中间名言卡片**: `.quotes-card` (约第 670 行)
    *   默认占据 2 列 (`grid-column: span 2`)。
*   **右侧数据统计**: `.stats-card` (约第 682 行)
    *   默认占据 2 列 (`grid-column: span 2`)。

## 3. 常见调整示例

**问题：我想让下面的三个卡片变高一点。**
> **解决**：修改 `.main-container` 中的 `grid-template-rows`，把第二个数字 `220px` 改为 `250px` 或更大。

**问题：我想让页面整体窄一点，两侧留白多一点。**
> **解决**：修改 `.main-container` 中的 `width`，从 `1400px` 改为 `1200px`。

**问题：图片卡片里的图片没有填满？**
> **解决**：确保 `.image-card` 中有 `background-size: cover;` (已默认设置)。
