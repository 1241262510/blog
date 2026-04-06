# 博客文章组织结构

## 目录说明

- **`github/`** — GitHub 技术文章（发布到网站）
  - 命名：`<title>.md`
  - 自动同步到 `source/_posts/` 用于构建
  - 会被 push 到 GitHub

- **`wechat/`** — 公众号文章（不发布到网站）
  - 命名：`<title>-wechat.md`
  - 不上传到 GitHub
  - 仅用于公众号发布

- **`source/_posts/`** — hexo 构建源（自动管理）
  - 不需要手动编辑
  - 由 `npm run build` 时自动从 `github/` 目录复制文件
  - 包含其他已有的文章

## 工作流

### 发布 GitHub 文章

1. 在 `github/` 目录创建或编辑文章
2. 运行：
   ```bash
   npm run build && npm run deploy
   ```
3. 文章会自动：
   - 复制到 `source/_posts/`
   - 经过 hexo 处理
   - 生成静态网站文件
   - 部署到 GitHub Pages

### 发布公众号文章

1. 在 `wechat/` 目录创建或编辑文章
2. 直接从该文件复制内容到公众号编辑器
3. 无需运行任何 npm 命令

## 关键脚本

- **`tools/prepare-posts.js`** — 在构建前准备文章
  - 自动复制 `github/` 目录的文章到 `source/_posts/`
  - npm 的 `prebuild` hook 自动执行

## npm 命令

- `npm run build` — 构建网站（自动运行 prebuild）
- `npm run deploy` — 构建并部署到 GitHub Pages
- `npm run clean` — 清理临时文件
- `npm run server` — 本地预览网站
