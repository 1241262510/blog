#!/usr/bin/env node
/**
 * 准备文章：将 github/ 目录的文章复制到 source/_posts/
 * 在 hexo generate 前执行
 */

const fs = require('fs');
const path = require('path');

const githubDir = path.join(__dirname, '../github');
const postsDir = path.join(__dirname, '../source/_posts');

// 确保 _posts 目录存在
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// 复制 github 目录下的所有 .md 文件到 _posts
if (fs.existsSync(githubDir)) {
  const files = fs.readdirSync(githubDir).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const src = path.join(githubDir, file);
    const dest = path.join(postsDir, file);
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${file}`);
  });

  if (files.length === 0) {
    console.log('No articles in github/ directory');
  }
} else {
  console.warn('github/ directory not found');
}
