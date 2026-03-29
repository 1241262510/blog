# 凌晨两点的书桌：写作与发布流程

这份文档用于固定博客的日常工作流，方便直接照着执行。

## 推荐固定流程

这是目前最适合你的写作方式：

1. 用 `MarkText` 写文章
2. 文章直接保存到 `source/_posts/`
3. 图片直接保存到 `source/assets/`
4. 写完后告诉我“更新博客”或“发布博客”

分工如下：

- `MarkText` 负责写作、排版、插图
- 我负责检查文章格式、修图片路径、校验发布时间、构建 Hexo、提交 Git、发布博客

正式内容只认这两个目录：

- 文章：`source/_posts/`
- 图片：`source/assets/`

不建议把正式文章放在 `posts/` 目录里，因为 Hexo 默认不会从那里发布文章。

## 资源使用规则

目前这套博客已经不需要单独图床来处理普通配图。

推荐规则如下：

- 普通图片默认本地托管，统一放在 `source/assets/`
- Markdown 中统一使用 `/assets/图片名.png`
- 首页缩略图优先使用本地图
- 视频默认使用外链或平台嵌入，不直接提交到仓库

原因：

- 图片已经能通过 `MarkText + Hexo` 流程直接发布
- 本地图更稳定，不依赖外部图床
- `mp4` 这类视频文件会让仓库变重，不适合长期直接放到 GitHub Pages 仓库里

## 博客地址

- `https://1241262510.github.io/blog/`

## 目录约定

- 文章目录：`source/_posts/`
- 图片目录：`source/assets/`
- 自定义样式：`source/css/custom.css`
- 首页 Banner：`source/img/banner-desk.svg`
- Hexo 主配置：`_config.yml`
- Fluid 主题配置：`_config.fluid.yml`

## 写作流程

1. 用 `MarkText` 写草稿
2. 把文章保存到 `source/_posts/`
3. 把图片复制到 `source/assets/`
4. 在 Markdown 中使用统一图片路径

正确写法：

```md
![](/assets/图片名.png)
```

错误写法：

```md
![](../../assets/图片名.png)
![](/Users/xxx/Desktop/图片名.png)
```

## MarkText 半自动流程

如果你想减少手动复制图片的动作，可以使用半自动方案：

1. 在 `MarkText` 里把图片保存目录设置为：

```text
/Users/songxiaofeng/lessons/codex/codex-blog/source/assets
```

2. 写文章时直接在 `MarkText` 里粘贴截图
3. `MarkText` 会自动把图片保存到 `source/assets/`
4. 写完后执行：

```bash
npm run fix:assets
```

5. 再执行本地预览：

```bash
npm run server
```

这套流程的核心是：

- `MarkText` 负责自动存图
- `fix:assets` 负责统一修正图片路径

最终仍然以博客要求的图片路径为准：

```md
![](/assets/图片名.png)
```

## 本地预览

所有命令都应该在 Hexo 项目根目录执行：

```bash
cd /Users/songxiaofeng/lessons/codex/codex-blog
```

启动本地服务：

```bash
npm run server
```

构建静态页面：

```bash
npm run build
```

如果 `MarkText` 自动插入了错误的相对路径，执行：

```bash
npm run fix:assets
```

## GitHub 同步流程

同步源码到 GitHub：

```bash
git add .
git commit -m "新增文章：文章标题"
git push origin main
```

## GitHub Pages 发布流程

发布静态页面到 `gh-pages`：

```bash
npm run deploy
```

## 每次发文的固定命令

```bash
npm run server
npm run build
git add .
git commit -m "更新博客"
git push origin main
npm run deploy
```

## 最少命令工作流

如果你想用最少的命令完成写作和发布，可以按下面这套走。

没有图片时：

```bash
npm run server
git add .
git commit -m "更新博客"
git push origin main
npm run deploy
```

有图片时：

```bash
npm run server
npm run fix:assets
git add .
git commit -m "更新博客"
git push origin main
npm run deploy
```

说明：

- `git` 负责同步源码到 `main`
- `hexo` 负责本地预览和发布博客
- `npm run build` 平时可以省略，因为 `npm run deploy` 会自动生成站点

## 最简工作流

1. 写文章
2. 放图片到 `source/assets/`
3. 本地预览
4. 提交源码到 `main`
5. 发布到 `gh-pages`

## Hexo 命令版工作流

如果你希望按 `hexo` 命令来走完整流程，可以使用下面这套。

进入项目目录：

```bash
cd /Users/sxf/lessons/codex/codex-blog
```

新建文章：

```bash
hexo new post "文章标题"
```

这会生成：

```text
source/_posts/文章标题.md
```

写完文章后，如果使用了 `MarkText` 粘贴图片，执行：

```bash
npm run fix:assets
```

本地预览：

```bash
hexo server
```

生成静态页面：

```bash
hexo generate
```

同步源码到 GitHub：

```bash
git add .
git commit -m "新增文章：文章标题"
git push origin main
```

发布到 GitHub Pages：

```bash
hexo deploy
```

整套流程汇总：

```bash
cd /Users/sxf/lessons/codex/codex-blog
hexo new post "文章标题"
npm run fix:assets
hexo server
git add .
git commit -m "新增文章：文章标题"
git push origin main
hexo deploy
```
