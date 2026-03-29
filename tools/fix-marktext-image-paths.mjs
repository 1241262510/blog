import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "source", "_posts");

const markdownExtensions = new Set([".md", ".markdown", ".mdown"]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return markdownExtensions.has(path.extname(entry.name).toLowerCase())
        ? [fullPath]
        : [];
    })
  );
  return files.flat();
}

function normalizeContent(content) {
  let changed = false;

  const markdownImagePattern = /(!\[[^\]]*\]\()((?:\.\.\/)+assets\/[^)\s]+)(\))/g;
  const htmlImagePattern = /(<img\b[^>]*\bsrc=["'])((?:\.\.\/)+assets\/[^"']+)(["'][^>]*>)/g;

  const next = content
    .replace(markdownImagePattern, (_, prefix, assetPath, suffix) => {
      changed = true;
      return `${prefix}/${assetPath.replace(/^(?:\.\.\/)+/, "")}${suffix}`;
    })
    .replace(htmlImagePattern, (_, prefix, assetPath, suffix) => {
      changed = true;
      return `${prefix}/${assetPath.replace(/^(?:\.\.\/)+/, "")}${suffix}`;
    });

  return { changed, content: next };
}

async function main() {
  try {
    await fs.access(postsDir);
  } catch {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exitCode = 1;
    return;
  }

  const files = await walk(postsDir);
  let changedFiles = 0;

  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    const { changed, content } = normalizeContent(original);
    if (!changed) {
      continue;
    }
    await fs.writeFile(file, content, "utf8");
    changedFiles += 1;
    console.log(`Updated ${path.relative(rootDir, file)}`);
  }

  if (changedFiles === 0) {
    console.log("No MarkText asset paths needed fixing.");
    return;
  }

  console.log(`Done. Updated ${changedFiles} file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
