---
title: 我的第一篇 Hexo 博客
date: 2026-03-29 20:40:00
published: false
tags:
  - hexo
  - 博客
categories:
  - 博客搭建
description: 使用 Hexo 搭建博客后的第一篇测试文章。
---

## 摘要

这是一篇用于验证 Hexo 博客配置是否正常的测试文章，同时确认 Markdown、代码块和图片路径都可以正常工作。

## 正文

如果你能正常看到这篇文章，说明当前的 Hexo 基础环境已经可用。

后续写文章时，可以直接在 Markdown 中使用以下元素：

- 标题
- 列表
- 代码块
- 图片

示例代码：

```bash
npm run server
npm run build
```

示例图片：

![](/assets/test.png)

## 图片

博客中的图片统一放在 `source/assets/` 目录中，正文里使用下面这种写法：

```md
![](/assets/图片文件名.png)
```
