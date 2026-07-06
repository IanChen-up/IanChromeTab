<div align="center">

# 🗂️ IanChromeTab

**一款为「重度多标签用户」打造的 Chrome 标签管理插件**
自动按域名两级分组 · 多巴胺配色中控台 · 浏览习惯洞察

<sub>My signature VibeCoding project — 从一句需求到成品，全程 AI 结对编程。</sub>

![Manifest](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-Vanilla_JS-F7DF1E?logo=javascript&logoColor=black)
![Style](https://img.shields.io/badge/Design-Dopamine_Glassmorphism-FF4D8D)
![i18n](https://img.shields.io/badge/i18n-中文_%2F_English-20D6B5)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📖 项目背景

Mac 性能太好，一不留神就开了几十个标签页——重复的、找不到的、忘了关的，浏览器顶部挤成一团。

市面上的标签管理器要么太重、要么太丑、要么把一堆开发者术语甩给用户。所以我做了 **IanChromeTab**：

> **顶部自动整理** 让标签栏永远清爽，**中控台（New Tab）** 让你一眼看清自己的浏览器资产。

作为一个**本地化（i18n/L10n）从业者**和 **AI 自动化 PM**，我把两件事做到了极致：**中英文双语一等公民**，以及**面向非技术用户的极简交互**（不用你手写任何 JSON 或代码）。

这也是我的 **VibeCoding 代表作**——需求、设计、迭代、调试全程与 AI 结对完成，用自然语言把一个想法打磨成可用的产品。

---

## ✨ 核心功能

### 1. 顶部标签栏 · 两级自动分组
- **按域名智能归类**：相同网站的标签自动收进同一个原生标签组，hover 展开、切走自动折叠。
- **平台级精细区分**：不是简单粗暴按主域名合并。`bytetech.info` 和 `bytedance.larkoffice.com` 不会被归成一类；Lark 内部还会按产品线拆分（Docs / Wiki / Base / Sheets / Minutes / IM）。
- **一致的 Emoji 与配色**：用稳定哈希算法给每个域名分配固定 Emoji 和颜色，跨窗口、跨会话都一致；同窗口内的分组颜色自动去重，标签多的大类优先占用其首选色。

### 2. 中控台 · 多巴胺风格 New Tab
- **网页搜索**：页面顶部内嵌搜索栏，可在 **Google / Bing** 间切换（记住你的选择）；输入网址时自动识别并直接跳转，否则用选定引擎搜索。
- **常用网站**：大卡片入口，撞色渐变 + 玻璃质感气泡，名称 / Emoji / 链接全部可视化编辑。
- **已打开的网页**：按分组完整罗列，支持搜索、快速关闭、收藏为常用、**拖拽移动到其他分组**。
- **自定义背景**：内置多巴胺 / 糖果 / 日出 / 薄荷四套配色，也可**直接选择本地图片**作为背景。
- **主题**：浅色 / 深色 / 跟随系统。

### 3. 自动去重 · 告别重复标签
- 打开一个**已经开着的网址**时，自动关掉旧的那个，只保留最新。
- **新标签页 / 中控台**同样参与去重——同一窗口只保留一个，不会堆叠出一排控制台。
- 也提供「清理重复」按钮，一键手动去重。

### 4. 浏览习惯 · 数据洞察
- **今天 / 本周 / 本月** 三种视图切换：今日分时柱状图、周月平滑趋势图。
- 关键指标：今日打开数、最活跃时段、周月均值。
- **「当前停留最久的网站」Top 5 排行**：按停留时长 + 访问次数聚合到网站维度，带配色进度条。

### 5. 本地化 · 双语一等公民
- 全站中英文切换，所有按钮、提示、文案、图表标签统一走 i18n 字典，不留死角。

---

## 🖼️ 界面预览

> 建议在此处放置截图 / GIF：
>
> - `docs/screenshot-dashboard.png` — 中控台整体
> - `docs/screenshot-stats.png` — 浏览习惯面板
> - `docs/screenshot-groups.png` — 顶部标签分组

```
┌─────────────────────────────────────────────────────────┐
│  I  IanChromeTab                        [一键整理] [设置]  │
├─────────────────────────────────────────────────────────┤
│  常用网站                                    [添加网站]    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  ← 撞色渐变 + 气泡卡片       │
│  │Goog│ │GitH│ │Byte│ │Lark│                              │
│  └────┘ └────┘ └────┘ └────┘                              │
├──────────────────────────────┬──────────────────────────┤
│  已打开的网页      [搜索][清重] │  浏览习惯  [今天|本周|本月]│
│  ┃ 🐙 Github        2          │   27      14:00–15:00     │
│  ┃  ├ GitHub - IanChromeTab    │  今日打开   最活跃时段     │
│  ┃  └ GitHub Issues            │  ▁▃▆█▅▂ (趋势图)          │
│  ┃ 📝 Lark Docs     1          │  当前停留最久的网站        │
│  ┃  └ 需求文档                  │  1 🔍 Google ▓▓▓▓ 53m    │
└──────────────────────────────┴──────────────────────────┘
```

---

## 🚀 安装与使用

本插件为**未打包扩展**，无需构建、无需依赖安装，克隆即用。

1. **获取代码**
   ```bash
   git clone https://github.com/<your-name>/IanChromeTab.git
   ```
2. **打开扩展管理页**：Chrome 地址栏输入 `chrome://extensions`
3. **打开右上角「开发者模式」**
4. **点击「加载已解压的扩展程序」**，选择本项目根目录（含 `manifest.json` 的那一层）
5. **打开一个新标签页** —— 中控台即为你的 New Tab；插件会自动整理当前窗口的标签

> 更新代码后，回到 `chrome://extensions` 点插件卡片上的**「重新加载」**，再刷新新标签页即可生效。

---

## 🧩 技术架构

纯前端、零构建、零外部 CDN（严格遵守 Manifest V3 的 CSP 要求，所有依赖本地化）。

| 文件 | 职责 |
| --- | --- |
| [`manifest.json`](manifest.json) | MV3 清单：权限、service worker、New Tab 覆写 |
| [`background.js`](background.js) | Service Worker：分组引擎、去重、统计采集、消息路由 |
| [`dashboard.html`](dashboard.html) / [`dashboard.css`](dashboard.css) / [`dashboard.js`](dashboard.js) | 中控台（New Tab）：常用网站、标签列表、统计面板 |
| [`popup.html`](popup.html) / [`popup.js`](popup.js) | 工具栏弹窗：打开中控台、一键整理 |
| [`i18n.js`](i18n.js) | 中英文字典 + `t()` 插值 + DOM 翻译 |
| [`tailwind.css`](tailwind.css) / [`chart.js`](chart.js) | 本地化引入的第三方依赖 |

### 关键设计

- **域名身份识别 `getTabIdentity()`**：按主机名 + 路径判定归属，特殊平台（ByteTech / Lark 各产品 / Starling / 字节内网）有专属规则，其余走 `稳定哈希 → Emoji + 颜色`。
- **URL 归一化去重 `normalizeUrlForDedupe()`**：忽略 `www.`、尾部斜杠、hash，同窗口内判定「同一个网页」。
- **颜色贪心去重 `pickDistinctColor()`**：Chrome 原生标签组只支持 9 种命名色，通过「大类优先 + 顺延未用色」让同窗口分组尽量不撞色。
- **设计版本号 `DESIGN_VERSION`**：每次大改自增，触发一次默认设置重置，避免旧缓存状态污染新版 UI。

### 权限说明

| 权限 | 用途 |
| --- | --- |
| `tabs` / `tabGroups` | 读取标签、创建与折叠标签组 |
| `storage` | 持久化设置、常用网站、统计数据 |
| `favicon` | 在中控台展示网站图标 |
| `alarms` / `system.memory` | 周期性采集内存快照（能力探索，UI 已弱化） |
| `host_permissions: <all_urls>` | 读取标签 URL 以判定分组归属 |

---

## 🎨 设计语言

- **多巴胺配色（Dopamine）**：高饱和、明快，撞色渐变（粉 `#ff4d8d` → 紫 `#7c5cff`）贯穿品牌图标、主按钮、卡片、统计数字与趋势图。
- **玻璃拟态（Glassmorphism）**：常用网站卡片叠加半透明气泡，hover 轻微浮动，通透高级。
- **克制的圆角与阴影**：统一的设计 token（`--radius-*`），去「AI 味」，贴近成熟产品质感。

---

## 🗺️ Roadmap

- [ ] **多选网页 → 一键发送到飞书知识库**（通过本地终端桥接）
- [ ] 搜索栏聚合更多信息源（新闻热搜 / GitHub Trending 等）
- [ ] 分组规则的导入 / 导出与云同步
- [ ] 更丰富的统计维度（按分组统计停留时长、周报导出）
- [ ] 上架 Chrome Web Store

---

## 🤖 关于 VibeCoding

这个项目从「我想要一个标签管理插件」的一句话开始，全程通过与 AI 的自然语言对话完成：

- 我负责**提需求、定方向、审美把关、指出痛点**；
- AI 负责**架构设计、编码实现、静态校验、浏览器实测**；
- 每一轮迭代都是「反馈 → 重构 → 验证」的快速循环。

它证明了：**懂产品、懂用户、会表达需求的人，也能独立做出打磨精良的软件。**

---

## 📄 License

[MIT](LICENSE) © 2026 Ian
