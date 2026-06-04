---
title: Ghostty 配置共享到 GitHub：一次 macOS 换账号同步实操
date: 2026-06-04 02:55:00
tags:
  - Ghostty
  - macOS
  - Tmux
  - Dotfiles
  - GitHub
categories:
  - 效率工具
description: 记录把本机 Ghostty 和 tmux 配置迁移到 /Users/Shared/dotfiles，并同步到 GitHub dotfile 仓库的完整过程，方便换 macOS 账号或换机器时复用。
---

## 摘要

这次做的是一件很小但很实用的事：把本机已经配置好的 Ghostty 和 tmux，从当前 macOS 账号的个人目录里抽出来，放到 `/Users/Shared/dotfiles`，再同步到 GitHub。

这样以后有两种使用方式：

- 同一台 Mac 换另一个账号，可以直接软链接到 `/Users/Shared/dotfiles`
- 换机器或重装系统，可以从 GitHub clone 仓库，再建立软链接

最终仓库地址是：

```text
https://github.com/1241262510/dotfile
```

## 为什么要这么做

Ghostty 的默认配置文件在：

```bash
~/.config/ghostty/config
```

tmux 的默认配置文件在：

```bash
~/.tmux.conf
```

这里的 `~` 是当前 macOS 登录账号的 Home 目录。也就是说，账号 A 配好的 Ghostty，账号 B 默认看不到。

如果只是复制一份，短期能用，但后续两个账号很容易改出两套配置。更稳的办法是把配置放到一个共享位置，再让每个账号通过软链接指向同一份文件。

## 这次采用的目录结构

共享目录放在：

```bash
/Users/Shared/dotfiles
```

目录结构是：

```text
/Users/Shared/dotfiles/
├── ghostty/
│   └── config
└── tmux.conf
```

当前账号里的配置入口仍然保持在默认位置，只是改成软链接：

```text
~/.config/ghostty/config -> /Users/Shared/dotfiles/ghostty/config
~/.tmux.conf              -> /Users/Shared/dotfiles/tmux.conf
```

这样 Ghostty 和 tmux 不需要改任何启动方式，它们仍然读取默认路径；但默认路径背后实际指向的是共享配置。

## 第一步：迁移 Ghostty 配置

先创建共享目录：

```bash
mkdir -p /Users/Shared/dotfiles/ghostty
```

把当前账号里的 Ghostty 配置复制进去：

```bash
cp ~/.config/ghostty/config /Users/Shared/dotfiles/ghostty/config
```

然后删掉原来的普通文件，改成软链接：

```bash
rm -f ~/.config/ghostty/config
ln -s /Users/Shared/dotfiles/ghostty/config ~/.config/ghostty/config
```

检查链接：

```bash
ls -la ~/.config/ghostty/config
```

看到类似结果就对了：

```text
~/.config/ghostty/config -> /Users/Shared/dotfiles/ghostty/config
```

## 第二步：迁移 tmux 配置

tmux 同样处理：

```bash
cp ~/.tmux.conf /Users/Shared/dotfiles/tmux.conf
rm -f ~/.tmux.conf
ln -s /Users/Shared/dotfiles/tmux.conf ~/.tmux.conf
```

检查链接：

```bash
ls -la ~/.tmux.conf
```

结果应当类似：

```text
~/.tmux.conf -> /Users/Shared/dotfiles/tmux.conf
```

## 第三步：把共享目录变成 Git 仓库

进入共享目录初始化仓库：

```bash
git init /Users/Shared/dotfiles
git -C /Users/Shared/dotfiles branch -M main
```

加入 Ghostty 和 tmux 配置：

```bash
git -C /Users/Shared/dotfiles add ghostty/config tmux.conf
```

提交：

```bash
git -C /Users/Shared/dotfiles commit -m "Add Ghostty and tmux dotfiles"
```

这次实际提交生成了一个初始提交：

```text
6060b87 Add Ghostty and tmux dotfiles
```

## 第四步：同步到 GitHub

GitHub 仓库使用的是：

```text
git@github.com:1241262510/dotfile.git
```

绑定远端并推送：

```bash
git -C /Users/Shared/dotfiles remote add origin git@github.com:1241262510/dotfile.git
git -C /Users/Shared/dotfiles push -u origin main
```

推送成功后，检查状态：

```bash
git -C /Users/Shared/dotfiles status --short --branch
```

结果是：

```text
## main...origin/main
```

说明本地 `main` 已经跟踪 GitHub 上的 `origin/main`，当前没有未提交修改。

## 另一个 macOS 账号怎么接入

如果是同一台 Mac 的另一个账号，最简单，直接链接共享目录：

```bash
mkdir -p ~/.config/ghostty
ln -sf /Users/Shared/dotfiles/ghostty/config ~/.config/ghostty/config
ln -sf /Users/Shared/dotfiles/tmux.conf ~/.tmux.conf
```

这样两个账号使用的是同一份配置。

以后任意一个账号修改 Ghostty 配置，本质上都是修改：

```bash
/Users/Shared/dotfiles/ghostty/config
```

修改后记得提交并推送：

```bash
git -C /Users/Shared/dotfiles status
git -C /Users/Shared/dotfiles add ghostty/config tmux.conf
git -C /Users/Shared/dotfiles commit -m "Update terminal dotfiles"
git -C /Users/Shared/dotfiles push
```

## 换机器怎么接入

如果是新机器，先 clone 仓库：

```bash
git clone git@github.com:1241262510/dotfile.git ~/dotfile
```

再建立软链接：

```bash
mkdir -p ~/.config/ghostty
ln -sf ~/dotfile/ghostty/config ~/.config/ghostty/config
ln -sf ~/dotfile/tmux.conf ~/.tmux.conf
```

如果新机器没有配置 GitHub SSH key，可以先用 HTTPS clone：

```bash
git clone https://github.com/1241262510/dotfile.git ~/dotfile
```

只是后续 push 时，还是建议把 SSH key 配好。

## 当前 Ghostty 配置重点

这次同步进去的 Ghostty 配置核心是：

```bash
term = xterm-ghostty
theme = "Gruvbox Dark"
background-opacity = 0.9
background-blur-radius = 20
window-show-tab-bar = always
macos-titlebar-style = tabs
font-family = "Menlo"
font-size = 14
```

另外，Ghostty 启动后会自动进入 tmux 的 `default` session：

```bash
command = "/bin/zsh -l -c '/opt/homebrew/bin/tmux attach-session -t default || /opt/homebrew/bin/tmux new-session -s default'"
```

并且禁用了 Ghostty 自带的两个分屏快捷键：

```bash
keybind = super+d=unbind
keybind = super+shift+d=unbind
```

分屏交给 tmux 处理。

## 当前 tmux 配置重点

tmux 里保留了几个关键设置：

```bash
set -g mouse on
set -g set-clipboard on
set -s escape-time 0
```

分屏快捷键改成：

```bash
unbind %
bind | split-window -h -c "#{pane_current_path}"

unbind '"'
bind - split-window -v -c "#{pane_current_path}"
```

也就是：

- `Ctrl + B` 后按 `|`：左右分屏
- `Ctrl + B` 后按 `-`：上下分屏

同时保留 Ghostty 下的真彩色支持：

```bash
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",xterm-ghostty:RGB"
set -ga terminal-overrides ",xterm-256color:RGB"
```

## 最终效果

这次整理完成后，Ghostty 配置已经不再只是当前账号的一份个人文件，而是变成了：

```text
默认路径入口 + 共享目录实际文件 + GitHub 远端备份
```

这个结构的好处是很直接：

- 当前账号正常使用，不需要改变 Ghostty 或 tmux 的启动习惯
- 同一台 Mac 的其他账号可以直接链接共享目录
- 换机器可以从 GitHub clone
- 后续修改可以用 Git 留痕

对终端配置这种会慢慢调整、但又不希望每次换环境都重来的东西，用 dotfiles 管起来是更长期的做法。
