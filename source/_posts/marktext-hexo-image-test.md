---
title: MarkText 与 Hexo 图片测试
date: 2026-03-29 20:30:00
published: false
tags:
  - hexo
  - marktext
categories:
  - 博客搭建
description: 测试 MarkText 与 Hexo 配合时的图片路径写法。
---

## 摘要

这篇文章用来验证 Hexo 中图片统一放在 `source/assets/` 后，Markdown 使用 `/assets/...` 路径可以稳定显示。

## 正文

图片文件放在：`source/assets/test.png`

正文里这样写即可：

![](/assets/test.png)

## 图片

后续新增图片时，继续沿用下面这种格式：

```md
![](/assets/你的图片文件名.png)
```
