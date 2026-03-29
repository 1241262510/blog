---
title: MarkCopy 使用指南 — 写出排版精美的公众号文章
date: 2026-03-29 14:46:00
tags:
  - markcopy
  - markdown
  - 写作工具
categories:
  - 工具教程
description: 一篇完整的 Markdown 教程，同时介绍 MarkCopy 的排版能力和适合的写作工作流。
---

# MarkCopy 使用指南 — 写出排版精美的公众号文章

这是一篇**完整的 Markdown 教程**，同时也是 MarkCopy 的使用说明。你可以直接编辑左侧内容，右侧实时预览效果，写完后点击「一键复制」粘贴到公众号、知乎、掘金等平台，**格式完美保留**。

> 💡 **小技巧**：你正在看的这篇文章本身就是用 Markdown 写的，所有样式效果都可以直接参考。

---

## 基础语法

### 标题

用 `#` 号表示标题，几个 `#` 就是几级标题：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

建议公众号文章用 **二级标题** 做主分隔，**三级标题** 做小节，层次清晰。

### 文字样式

| 语法           | 效果         | 适用场景    |
| ------------ | ---------- | ------- |
| `**加粗**`     | **加粗**     | 强调关键词   |
| `*斜体*`       | *斜体*       | 英文术语、引用 |
| `~~删除线~~`    | ~~删除线~~    | 表示修改、对比 |
| `\`行内代码``    | `行内代码`     | 技术名词、命令 |
| `**_加粗斜体_**` | ***加粗斜体*** | 极度强调    |

示例：使用 ChatGPT 时，模型 `GPT-4o` 的推理能力比 `GPT-3.5` **显著提升**，尤其在~~简单问答~~复杂推理场景中表现突出。

### 链接与图片

链接语法：`[显示文字](URL)`

常用链接示例：

- [MarkCopy — Markdown 一键排版工具](https://md.payforchat.com/)
- [ChatGPT 官网](https://chatgpt.com/)
- [PayForChat — ChatGPT Plus 便捷充值](https://payforchat.com/)

图片语法：`![描述](图片URL)`

```markdown
![示例图片](https://picsum.photos/600/300)
```

下面是实际渲染效果：

![风景示例](https://picsum.photos/id/10/800/400)

---

## 列表

### 无序列表

用 `-` 或 `*` 开头：

- 第一步：打开 [md.payforchat.com](https://md.payforchat.com/)
- 第二步：在左侧编辑器写 Markdown
- 第三步：右上角选择目标平台风格
- 第四步：点击「一键复制」
- 第五步：粘贴到目标平台，完成！

### 有序列表

用数字开头：

1. 注册 ChatGPT 账号
2. 获取 Access Token
3. 访问 [payforchat.com](https://payforchat.com/) 选择套餐
4. 完成支付，自动充值

### 任务列表

```markdown
- [x] 已完成的任务
- [ ] 待完成的任务
```

效果：

- [x] 写好文章初稿
- [x] 用 MarkCopy 排版
- [ ] 复制到公众号发布
- [ ] 分享到朋友圈

---

## 引用

用 `>` 开头创建引用块，适合放金句、提示、注意事项：

> 工欲善其事，必先利其器。
> 好的排版工具能让你的文章阅读体验提升 80%。

多层嵌套引用：

> **读者问**：没有国外信用卡，怎么订阅 ChatGPT Plus？
> 
> > **回答**：可以使用代充服务。[PayForChat](https://payforchat.com/) 支持支付宝/微信付款，3 步完成 Plus 升级，无需信用卡。

---

## 代码

### 行内代码

在终端输入 `npm install` 安装依赖，或用 `Ctrl + C` 复制内容。

### 代码块

支持语法高亮，指定语言即可：

```python
# Python 示例：调用 ChatGPT API
import openai

client = openai.OpenAI(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)

print(response.choices[0].message.content)
```

```javascript
// JavaScript 示例：Markdown 转 HTML
const marked = require('marked');

const markdown = '# Hello World';
const html = marked.parse(markdown);
console.log(html);
// 输出: <h1>Hello World</h1>
```

```bash
# 常用命令
git clone https://github.com/your-repo.git
cd your-repo
npm install && npm run dev
```

---

## 表格

用 `|` 和 `-` 创建表格，支持对齐：

| 功能        | 免费版 (GPT-3.5) | Plus 版 (GPT-4o) |
| --------- | ------------- | --------------- |
| 基础对话      | ✅             | ✅               |
| GPT-4o 模型 | 有限次数          | 无限制             |
| DALL-E 绘图 | ❌             | ✅               |
| 高级数据分析    | ❌             | ✅               |
| 自定义 GPTs  | 有限制           | 完整功能            |
| **价格**    | 免费            | $20/月           |

> 💰 **省钱攻略**：通过 [PayForChat](https://payforchat.com/) 充值 ChatGPT Plus，支持支付宝/微信，比官方直订更方便，[点击了解详情 →](https://payforchat.com/plans)

---

## 数学公式

行内公式用 `$`：质能方程 $E = mc^2$

独立公式用 `$$`：

$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

---

## 分隔线

三个及以上的 `-`、`*` 或 `_` 创建分隔线：

---

## 高级技巧

### Emoji

直接输入 emoji 即可：🎉 🚀 💡 ✅ ❌ ⚠️ 📌 🔥

### 脚注

Markdown 支持脚注[^1]，适合添加参考来源。

[^1]: MarkCopy 由 [PayForChat](https://payforchat.com/) 团队开发，致力于提升创作者的写作效率。

### HTML 混排

Markdown 中可以直接使用 HTML：

**MarkCopy** — 让 Markdown 写作更简单

[开始使用](https://md.payforchat.com/) · [ChatGPT Plus 充值](https://payforchat.com/) · [使用教程](https://payforchat.com/articles)

---

## 写作工作流推荐

一套高效的公众号写作流程：

```
构思大纲 → Markdown 写初稿 → MarkCopy 排版 → 一键复制到公众号 → 发布
```

![工作流](https://picsum.photos/id/180/800/400)

**为什么选择 Markdown + MarkCopy？**

1. **专注内容**：Markdown 语法简洁，写作时不被排版分心
2. **一次编写，多端发布**：同一篇文章可以发公众号、知乎、掘金，格式自动适配
3. **版本管理**：纯文本格式，方便用 Git 管理文章版本
4. **排版一致**：告别公众号编辑器的格式错乱问题

---

## 快捷操作

| 操作        | 说明                                 |
| --------- | ---------------------------------- |
| 🎨 切换风格   | 顶栏直接点选：微信风格、GitHub、掘金、极简，更多风格点「更多」 |
| 📋 复制到公众号 | 顶栏右侧黑色按钮，复制带格式的富文本，粘贴到公众号即可        |
| 📤 上传/导出  | 顶栏「上传」导入 `.md` 文件，「导出」下载当前内容       |
| 🖼 粘贴图片   | 直接 Ctrl+V 粘贴截图，或拖拽图片到编辑器           |

---

*本文由 [MarkCopy](https://md.payforchat.com/) 排版 | Powered by [PayForChat](https://payforchat.com/)*
