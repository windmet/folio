#!/usr/bin/env node

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== CLI =====
const args = process.argv.slice(2);
if (args.length < 1 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
XHS Exporter — Markdown → 小红书序列图

用法:
  node index.js <input.md/mdx> [options]

参数:
  <input>           Markdown/MDX 文件路径
  --output, -o      输出目录 (默认: ./output)

示例:
  node index.js ../../src/content/posts/article.md
  node index.js ../../src/content/posts/article.md -o ./my-output
`);
  process.exit(args.length < 1 ? 1 : 0);
}

const inputPath = resolve(args[0]);
const outputDir = resolve(
  args.includes('--output') ? args[args.indexOf('--output') + 1]
    : args.includes('-o') ? args[args.indexOf('-o') + 1]
    : join(process.cwd(), 'output')
);

// ===== 1. Read & parse MD =====
const md = readFileSync(inputPath, 'utf-8');

// Extract frontmatter title
const titleMatch = md.match(/^---\s*\ntitle:\s*"([^"]+)"\s*\n/m);
const postTitle = titleMatch ? titleMatch[1] : '';

// Strip frontmatter + imports
let mdBody = md
  .replace(/^---[\s\S]*?---\n*/, '')
  .replace(/^import\s+.*$/gm, '')
  .trim();

// ---- 智能裁剪：只保留访谈问答主体 ----
// 1. 砍掉开头：丢弃第一个 <Question 之前的所有内容
const firstQ = mdBody.indexOf('<Question');
if (firstQ !== -1) {
  mdBody = mdBody.substring(firstQ);
}

// 2. 砍掉结尾：从最后一个 <Question 往后搜索结束标记
const endMarkers = ['## 角色', '## 歌曲', '***'];
const lastQ = mdBody.lastIndexOf('<Question');
const searchFrom = lastQ !== -1 ? lastQ : 0;
let cutOff = mdBody.length;
for (const marker of endMarkers) {
  const idx = mdBody.indexOf(marker, searchFrom);
  if (idx !== -1 && idx < cutOff) cutOff = idx;
}
mdBody = mdBody.substring(0, cutOff).trim();

// Preserve MDX components: convert to styled HTML
// 顺序极其重要：QuoteTweet 必须先处理（内层先转），再处理外层 Tweet/Reply
mdBody = mdBody
  // 0. Inner layer first: QuoteTweet
  .replace(
    /<QuoteTweet\s+author="([^"]+)"\s+handle="([^"]+)"(?:\s+time="([^"]*)")?>([\s\S]*?)<\/QuoteTweet>/g,
    (_, author, handle, time, content) => {
      const timeHtml = time ? `<span class="t-time">· ${time}</span>` : '';
      const icon = '<svg class="qt-icon" viewBox="0 0 24 24" width="28" height="28" fill="#536471"><g><path d="M4.5 3.88l4.432 4.43-1.414 1.414L4.5 6.71v10.5c0 1.24 1.01 2.25 2.25 2.25h10.5v2H6.75C4.13 21.46 2 19.33 2 16.71V6.71L.982 7.724.432 6.31 4.5 3.88zM17.25 2.54c2.62 0 4.75 2.13 4.75 4.75v10l1.018-1.014 1.414 1.414-4.068 4.43-4.432-4.43 1.414-1.414 3.018 3.01V7.29c0-1.24-1.01-2.25-2.25-2.25H6.75v-2h10.5z"></path></g></svg>';
      return `<div class="quote-tweet"><div class="qt-header">${icon}<span class="t-author">${author}</span><span class="t-handle">@${handle}</span>${timeHtml}</div><div class="qt-content">${content.trim()}</div></div>`;
    }
  )
  // 1. Block-level: Tweet/Reply (NOT self-closing — content inside)
  .replace(
    /<Tweet\s+author="([^"]+)"\s+handle="([^"]+)"(?:\s+time="([^"]*)")?>([\s\S]*?)<\/Tweet>/g,
    (_, author, handle, time, content) => {
      const timeHtml = time ? `<span class="t-time">· ${time}</span>` : '';
      return `<div class="tweet-item main-tweet"><div class="tweet-header"><span class="t-author">${author}</span><span class="t-handle">@${handle}</span>${timeHtml}</div><div class="tweet-content">${content.trim()}</div></div>`;
    }
  )
  .replace(
    /<Reply\s+author="([^"]+)"\s+handle="([^"]+)"(?:\s+time="([^"]*)")?>([\s\S]*?)<\/Reply>/g,
    (_, author, handle, time, content) => {
      const timeHtml = time ? `<span class="t-time">· ${time}</span>` : '';
      return `<div class="tweet-item reply-tweet"><div class="tweet-header"><span class="t-author">${author}</span><span class="t-handle">@${handle}</span>${timeHtml}</div><div class="tweet-content">${content.trim()}</div></div>`;
    }
  )
  // Self-closing tags
  .replace(/<Question\s+content="([^"]+)"\s*\/>/g, '<div class="question-block">$1</div>')
  .replace(/<Annotation\s+content="([^"]+)"\s*\/>/g, '<div class="annotation-block">$1</div>')
  .replace(/<QuoteLine\s+text="([^"]+)"\s*\/?>/g, '<div class="quoteline-block">$1</div>')
  // Strip remaining unknown MDX component tags
  .replace(/<[A-Z]\w+(?:\s+[^>]*)?\/?>/g, '')
  .replace(/<\/[A-Z]\w+[^>]*>/g, '');

const htmlContent = marked.parse(mdBody, { gfm: true, breaks: true });

// Post-process: speaker dialog highlight
const processedHtml = htmlContent.replace(
  /<strong>([^<]+)<\/strong>(?=[：:「])/g,
  '<strong class="speaker">$1</strong>'
);

// ===== 2. Build HTML document =====
const template = readFileSync(join(__dirname, 'template.html'), 'utf-8');
const fullHtml = template.replace('{{CONTENT}}',
  `<div style="width:920px;height:1px;flex-shrink:0;margin:0;padding:0;visibility:hidden;"></div>\n${processedHtml}`
);

// ===== 3. Launch Playwright =====
mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 2,
  locale: 'zh-CN',
});
const page = await context.newPage();

await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });

// ===== 4. 设置视口大小为严格的单页尺寸 =====
await page.setViewportSize({ width: 1080, height: 1440 });

// ===== 5. 等待所有字体加载完毕 =====
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1000);

// ===== 6. 获取 content-flow 的真实被撑开的宽度 =====
const contentWidth = await page.evaluate(() => {
  return document.getElementById('content-flow').scrollWidth;
});
const totalPages = Math.ceil(contentWidth / 1080);

console.log(`\n 导出 ${totalPages} 页 (内容宽度 ${contentWidth}px)...`);

// ===== 7. 暴力修改 left 值并截图 =====
for (let i = 0; i < totalPages; i++) {
  // 强行把长卷向左拽
  await page.evaluate((x) => {
    document.getElementById('content-flow').style.left = `-${x}px`;
  }, i * 1080);

  // 等待浏览器重排重绘
  await page.waitForTimeout(400);

  // 截图当前相框（不用 fullPage）
  const filename = `page_${String(i + 1).padStart(2, '0')}.png`;
  const filepath = join(outputDir, filename);
  await page.screenshot({ path: filepath, type: 'png', timeout: 10000 });

  console.log(`  ✓ ${filename}`);
}

await browser.close();

// ===== 8. 生成文案 =====
const tags = postTitle.includes('访谈') || postTitle.includes('インタビュー')
  ? '#声优访谈 #BreakMyCase #ブレイクマイケース'
  : '#技术笔记 #自动化工具 #Playwright';
const postText = `${postTitle}\n\n共 ${totalPages} 页\n\n${tags}`;
writeFileSync(join(outputDir, 'post.txt'), postText, 'utf-8');
console.log(`  📝 post.txt`);

console.log(`\n ✅ 完成！共 ${totalPages} 页，保存至:`);
console.log(`    ${outputDir}`);
