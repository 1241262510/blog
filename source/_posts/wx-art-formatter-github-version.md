---
title: wx-art-formatter：一个面向微信公众号场景的排版工程实践
date: 2026-04-05 22:15:00
tags:
  - wechat
  - formatter
  - vue
  - typescript
  - markdown
categories:
  - 技术实践
description: 从工程视角拆解 wx-art-formatter 的核心思路：为什么内联样式是公众号排版稳定性的关键。
index_img: /assets/ad6b632ec9ec3969733bcd1ba33511b90960d1d6.png
---

![](/assets/ad6b632ec9ec3969733bcd1ba33511b90960d1d6.png)

## Problem

微信公众号编辑器对 HTML/CSS 有明确限制：  
`<style>` 与 class 往往会被过滤，导致“编辑器里很好看，粘贴后失真”。

`wx-art-formatter` 的目标很明确：  
在复制到公众号后台后，尽可能保留排版效果。

Repository: `https://github.com/bingo906/wx-art-formatter`

## Key Features

- Dual input: Markdown + Rich Text
- 17 built-in templates with categorized styles
- Theme color presets + custom picker
- Real-time preview with wide/fullscreen modes
- Copy as `text/html` for WeChat editor
- Export to PNG long image and PDF
- Auto TOC generation and code highlighting

## Core Technical Idea

核心思路不是“做一个 Markdown 编辑器”，而是“针对微信规则生成可落地输出”。

处理链路可以概括为：

1. Parse user input (Markdown or rich text)
2. Render semantic HTML
3. Inject presentation styles as inline styles
4. Copy rendered HTML to clipboard (`text/html`)
5. Paste into WeChat editor with higher style retention

这条链路的关键点在第 3 步：  
把模板样式内联，规避微信对 `<style>`/class 的过滤影响。

## Stack Snapshot

- Vue 3 + TypeScript
- Vite
- Pinia
- CodeMirror 6
- markdown-it
- highlight.js
- html2canvas-pro
- jsPDF
- juice

## Why This Project Is Practical

- 它不要求用户改变写作习惯，只改变“发布前处理”环节
- 关注的是内容分发成功率，不是单纯视觉炫技
- 对运营和技术写作者都可直接落地

## Local Run

```bash
git clone https://github.com/bingo906/wx-art-formatter.git
cd wx-art-formatter
npm install
npm run dev
```

## Potential Extensions

- 团队模板规范化（统一品牌语义）
- 可配置主题 token（颜色、字号、间距）
- 内容生产流水线集成（写作 -> 排版 -> 多端分发）

## Closing

如果你在做微信公众号内容工程化，这个项目是一个很好的切入点。  
它把平台限制转成了清晰的工程策略，思路直接、实现路径也足够务实。
