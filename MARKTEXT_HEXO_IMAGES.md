# MarkText + Hexo Image Workflow

Use one shared asset directory:

```text
source/assets/
```

In Markdown, always use site-root paths:

```md
![](/assets/example.png)
```

Do not use these forms:

```md
![](../../assets/example.png)
![](../assets/example.png)
![](/Users/you/Desktop/example.png)
```

Why:

- `../../assets/...` depends on the generated page depth and is fragile.
- Local absolute paths work in MarkText preview, but Hexo cannot publish them correctly.
- `/assets/...` is stable after Hexo generates the site.

Suggested workflow:

1. Put images under `source/assets/`.
2. In MarkText, reference images as `/assets/filename.png`.
3. If MarkText already inserted `../../assets/...`, run:

```bash
npm run fix:assets
```

This rewrites old relative asset paths in `source/_posts/` to `/assets/...`.
