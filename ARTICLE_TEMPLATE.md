# 博客文章标准模板

直接复制下面这份内容，新建到 `source/_posts/` 即可。

```md
---
title: 文章标题
date: 2026-03-29 23:59:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
description: 用一句话说明这篇文章写什么。
---

## 摘要

这里写一小段摘要。首页通常会优先显示 `description`，但摘要段也建议保留，方便正文开头更完整。

## 正文

这里开始写正文。

可以先交代背景、问题或者你为什么会关注这个主题。

## 过程

这里写过程、步骤、体验或者你的观察。

如果有命令，可以这样写：

```bash
npm run server
```

如果有图片，统一这样写：

```md
![](/assets/你的图片名.png)
```

实际示例：

![](/assets/你的图片名.png)

## 总结

最后用几段话收一下结论。

如果你想写得更清楚，可以用这种结构：

- 我遇到了什么问题
- 我怎么处理
- 最后的判断是什么
```

## 发文最短流程

1. 复制模板
2. 保存到 `source/_posts/`
3. 图片放到 `source/assets/`
4. 本地预览
5. 提交并发布

常用命令：

```bash
npm run server
git add .
git commit -m "新增文章：文章标题"
git push origin main
npm run deploy
```
