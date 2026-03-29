# 凌晨两点的书桌：写作与发布流程

这份文档用于固定博客的日常工作流，方便直接照着执行。

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

## 最简工作流

1. 写文章
2. 放图片到 `source/assets/`
3. 本地预览
4. 提交源码到 `main`
5. 发布到 `gh-pages`
