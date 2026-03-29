# 凌晨两点的书桌

基于 `Hexo + Fluid` 的个人博客。

线上地址：

- `https://1241262510.github.io/blog/`

## 目录约定

- 文章：`source/_posts/`
- 图片：`source/assets/`
- 自定义样式：`source/css/custom.css`
- 首页 banner：`source/img/banner-desk.svg`
- Hexo 配置：`_config.yml`
- Fluid 配置：`_config.fluid.yml`

## 写作流程

1. 用 `MarkText` 写草稿
2. 把文章放到 `source/_posts/`
3. 把图片放到 `source/assets/`
4. 在 Markdown 里统一这样引用图片：

```md
![](/assets/图片名.png)
```

不要使用下面这些写法：

```md
![](../../assets/图片名.png)
![](/Users/xxx/Desktop/图片名.png)
```

## 本地预览

启动本地服务：

```bash
npm run server
```

构建静态文件：

```bash
npm run build
```

如果 `MarkText` 自动写出了错误的相对路径，可以执行：

```bash
npm run fix:assets
```

## 发布流程

同步源码到 GitHub：

```bash
git add .
git commit -m "新增文章：文章标题"
git push origin main
```

发布到 GitHub Pages：

```bash
npm run deploy
```

## 最常用命令

```bash
npm run server
npm run build
git add .
git commit -m "更新博客"
git push origin main
npm run deploy
```
