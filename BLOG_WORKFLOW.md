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

## 本地预览

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
