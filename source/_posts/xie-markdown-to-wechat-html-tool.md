---
title: xie：一个 Markdown 转公众号 HTML 的小工具实践
date: 2026-04-07 10:11:00
tags:
  - markdown
  - 微信公众号
  - xie
  - pipx
categories:
  - 工具教程
description: 记录 xie 这个 Markdown 转公众号 HTML 工具的安装与使用，包括 pipx 安装、依赖注入和本地 Web 方式。
index_img: /assets/SCR-20260406-uaam.png
---

`Markdown` 文档转微信格式，通常需要额外转换。因为微信公众号编辑器不能直接完整渲染 Markdown，直接复制粘贴往往会出现排版错乱。

像 `mdnice` 的「一键复制」和 `MarkCopy` 的「复制到公众号」，本质上都在解决这个问题。

通过一个点击动作，把格式转换这件麻烦事做掉，核心通常是 `JS/TS` 等脚本和相应的转换算法。

![SCR-20260406-uaam](/assets/SCR-20260406-uaam.png)

![SCR-20260406-uamp](/assets/SCR-20260406-uamp.png)

有些方案是网站形式，能用，但流程偏长。要是有本地工具能解决这个痛点，操作路径会更短。

最近看到一个把功能工具化、并提供命令行使用方式的小工具：`xie`（写）。

### xie（写）

### 一个 Markdown to WX HTML 小工具

安装命令：

```bash
pip install xie
```

使用方法：

```bash
xie convert file.md to file.html
```

这是作者提供的安装方案。实测后，我更推荐下面这种安装方式（我在 macOS 和 Linux 虚拟机都试过）：

```bash
pipx install xie
```

`pipx` 会为每个应用创建独立环境，隔离更好。相比全局安装，应用多起来后更不容易互相“打架”。

安装完成后，命令行用法不变。

为了照顾不习惯命令行的用户，作者也提供了 Web 方式：

```bash
xie web --port 5000
```

实测直接运行可能会报依赖缺失：

![SCR-20260406-ujth](/assets/SCR-20260406-ujth.png)

当时我用大模型给了一个依赖注入方案，命令如下：

```bash
pipx inject xie flask flask-cors requests flask-socketio
```

也可以分段注入：

```bash
# 1. 注入核心 Web 框架
pipx inject xie flask

# 2. 注入跨域支持
pipx inject xie flask-cors

# 3. 注入网络请求支持
pipx inject xie requests
```

两种方式都可以。之后重新启动：

```bash
xie web --port 5000
```

然后访问本机 `5000` 端口即可使用 Web 转换服务。

![xie web 5000 home](/assets/xie-web-5000-home.png)

做个简单测试，功能正常：

![xie web 5000 test](/assets/xie-web-5000-test.png)

不习惯命令行的朋友可以试试这个 Web 页面，功能和命令行一致。

目前这是单机 Web 页面。如果要部署到局域网使用，也可以借助大模型对源文件做一点修改。

## 总结

这个 app 虽小，但解决了一个很实际的痛点。对经常用 Markdown 写作的人来说，帮助很直接。

如果后续能把依赖和运行环境一起打包，体验会更完整。
