# Mac 换账号后 Ghostty 配置没了？其实是配置路径的问题

最近我在 Mac 上配置 Ghostty，遇到一个很典型的问题：

同一台 Mac，Ghostty 明明已经设置好了。  
但切换到另一个 macOS 账号之后，打开 Ghostty，又像是全新安装一样。

主题、字体、窗口样式、快捷键、tmux 启动配置，都需要重新来一遍。

一开始很容易以为是 Ghostty 没有全局配置，或者设置没有保存。  
其实不是。

真正的原因是：Ghostty 的配置默认跟着当前 macOS 用户走。

## 为什么换账号后配置就没了

Ghostty 的常用配置文件在这里：

```bash
~/.config/ghostty/config
```

这里最关键的是 `~`。

在 macOS 里，`~` 代表当前登录用户的 Home 目录。

如果当前账号是 `userA`，它实际对应的是：

```bash
/Users/userA/.config/ghostty/config
```

如果切换到另一个账号 `userB`，它对应的就是：

```bash
/Users/userB/.config/ghostty/config
```

所以你在账号 A 里配置好的 Ghostty，账号 B 默认是看不到的。

这不是 Ghostty 特有的问题。很多开发工具都是这样：

```bash
~/.zshrc
~/.tmux.conf
~/.gitconfig
~/.ssh/config
~/.config/ghostty/config
```

它们都默认放在当前用户目录下。

好处是不同用户互不影响。  
坏处是如果你希望多个账号使用同一套环境，就需要额外做同步。

## 我现在的 Ghostty 配置思路

我的 Ghostty 配置里，主要做了几件事：

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

另外我让 Ghostty 启动后直接进入一个固定的 tmux session：

```bash
command = "/bin/zsh -l -c '/opt/homebrew/bin/tmux attach-session -t default || /opt/homebrew/bin/tmux new-session -s default'"
```

这样每次打开 Ghostty，都会自动回到同一个 tmux 工作区。

为了避免 Ghostty 自己的分屏快捷键和 tmux 冲突，我还禁用了 Ghostty 的两个默认分屏键：

```bash
keybind = super+d=unbind
keybind = super+shift+d=unbind
```

也就是说：

- `Cmd + D` 不再由 Ghostty 负责分屏
- `Cmd + Shift + D` 也不再由 Ghostty 负责分屏
- 分屏交给 tmux 来处理

tmux 里我再把快捷键改成更直观的方式：

```bash
unbind %
bind | split-window -h -c "#{pane_current_path}"

unbind '"'
bind - split-window -v -c "#{pane_current_path}"
```

实际使用时就是：

- `Ctrl + B`，再按 `|`：左右分屏
- `Ctrl + B`，再按 `-`：上下分屏

这个组合用久之后，比记 Ghostty 和 tmux 各自一套分屏逻辑要清楚很多。

## 怎么让不同账号使用同一套配置

有三种方式。

### 方式一：直接复制配置

最简单的方法，就是把账号 A 的配置复制到账号 B。

Ghostty：

```bash
mkdir -p ~/.config/ghostty
cp /Users/userA/.config/ghostty/config ~/.config/ghostty/config
```

tmux：

```bash
cp /Users/userA/.tmux.conf ~/.tmux.conf
```

这种方式适合一次性迁移。

缺点也明显：以后你在账号 A 改了一次配置，账号 B 不会自动更新。  
两个账号用久之后，很容易变成两套略有差异的配置。

如果只是临时换账号，这个方法够用。

### 方式二：用共享目录加软链接

更推荐的方式，是把配置放到一个共享目录，然后每个账号都通过软链接指向同一份文件。

例如把配置统一放在：

```bash
/Users/Shared/dotfiles
```

目录结构可以这样设计：

```text
/Users/Shared/dotfiles/
├── ghostty/
│   └── config
└── tmux.conf
```

然后在每个 macOS 账号里执行：

```bash
mkdir -p ~/.config/ghostty
ln -s /Users/Shared/dotfiles/ghostty/config ~/.config/ghostty/config
ln -s /Users/Shared/dotfiles/tmux.conf ~/.tmux.conf
```

这样不同账号看到的就是同一份配置。

之后你不管在哪个账号里修改 Ghostty 配置，本质上改的都是：

```bash
/Users/Shared/dotfiles/ghostty/config
```

另一个账号下次打开 Ghostty，也会使用最新配置。

这套方式的核心是软链接。

你可以把它理解成：  
每个账号的配置文件位置还在原来的地方，但那个文件只是一个入口，真正的配置放在共享目录里。

### 方式三：用 dotfiles 仓库管理

如果你不只是换 macOS 账号，还经常换机器，那更适合用 dotfiles 仓库。

做法是把常用配置放进一个 Git 仓库：

```text
dotfiles/
├── ghostty/
│   └── config
├── tmux.conf
├── zshrc
└── gitconfig
```

然后每台机器、每个账号都 clone 这个仓库，再建立软链接：

```bash
mkdir -p ~/.config/ghostty
ln -s ~/dotfiles/ghostty/config ~/.config/ghostty/config
ln -s ~/dotfiles/tmux.conf ~/.tmux.conf
```

这种方式最适合长期维护。

它的好处是：

- 配置可以跨账号复用
- 配置可以跨机器复用
- 每次修改都有 Git 记录
- 新机器初始化环境更快

对开发环境来说，dotfiles 基本就是个人工具箱的说明书。

## 需要注意的几个细节

第一，软链接前先确认原文件是否已经存在。

如果已经有旧配置，可以先备份：

```bash
mv ~/.config/ghostty/config ~/.config/ghostty/config.backup
mv ~/.tmux.conf ~/.tmux.conf.backup
```

然后再创建软链接。

第二，共享目录权限要注意。

如果你放在 `/Users/Shared/dotfiles`，多个账号都要能读。  
如果多个账号都要修改，还要保证有写入权限。

第三，配置里不要写死只属于某个账号的路径。

比如这类路径：

```bash
/Users/userA/some/path
```

换账号后就可能失效。

更稳的写法是尽量使用：

```bash
~
$HOME
```

或者把确实需要固定的工具路径单独确认清楚。

例如 Homebrew 在 Apple Silicon Mac 上常见路径是：

```bash
/opt/homebrew/bin
```

这个路径通常跟账号无关，可以保留。

## 我更推荐哪种方案

如果只是偶尔换一次账号，直接复制配置最快。

如果是同一台 Mac 上长期使用多个账号，我推荐：

```text
/Users/Shared/dotfiles + 软链接
```

如果你还要同步到多台 Mac，我推荐：

```text
Git dotfiles 仓库 + 软链接
```

我自己更倾向于第二种或第三种。

因为终端配置不是一次性的东西。  
主题、字体、快捷键、tmux、shell、git，这些都会随着使用习惯慢慢调整。

如果每个账号都单独维护一份，后面一定会乱。

把它们统一起来，才是更长期的做法。

## 最后

Ghostty 换账号后需要重新设置，并不是 Ghostty 配置失效。  
本质上是 macOS 的用户目录隔离导致的。

每个账号都有自己的：

```bash
~/.config/ghostty/config
```

所以看起来像是“换账号就没配置了”。

解决办法也不复杂：

- 临时迁移：复制配置
- 同机多账号：共享目录加软链接
- 多机器同步：dotfiles 仓库加软链接

把 Ghostty 和 tmux 放到同一套配置体系里之后，终端环境就不会再跟着账号割裂了。
