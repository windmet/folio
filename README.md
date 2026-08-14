# 前情帖 / GOMYAKU

前情帖是一份围绕公开广播、活动与人物语境整理的非官方 publication。站点结构与验证工作流由 GOMYAKU / 語脈支持。

当前 review branch 为 `codex/publication-metadata-v2`，收录三个已发布 Project：

- 小松昌平 36歳 Birthday Special
- こまちょえ生ラジオ｜2026.03.09
- こまちょえ生ラジオ｜2026.04.25

Person Model v2、Global People、Index、全局搜索与章节式首页均已进入 review branch。`PUBLIC_LAUNCH_ENABLED` 仍为 `false`，所有页面继续输出 `noindex, nofollow`；分支已推送不等于 production-accepted，也不代表同意公开抓取。

## 当前产品结构

- `/`：按档案、人物、索引与 publication date 进入内容。
- `/projects/[slug]/`：单场档案内部的 Timeline、章节、人物与来源阅读器。
- `/people/`、`/people/[id]/`：跨档案人物入口与出现 chronology。
- `/indexes/`、`/indexes/[slug]/`：系列及公开记录 chronology。
- `/search/`：Project、Event、Person、Index 与旧文章的站级检索。
- `/about/`：Subject、Source、Editorial 与 Governance 边界。

Project 数据位于 `src/content/projects/`，全局人物与索引分别位于 `src/content/people/`、`src/content/indexes/`。发布层不得包含原始 ASR 标记、本机源档路径、字幕文件名或其他私有来源信息。

## 本地开发与验证

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4321
```

完整门禁：

```sh
npm run validate
npm exec -- tsc --noEmit
```

常用分项：

```sh
npm run validate:projects
npm run verify:person-model
npm run verify:home-projection
npm run verify:index-model
npm run verify:people-routes
npm run verify:site-metadata
npm run verify:global-search
npm run validate:publication
npm run validate:regressions
```

每次 push 或 pull request 都会由 `.github/workflows/validate.yml` 在 Node.js 22.12.0 上运行 `npm ci`、production dependency audit、`npm run validate` 与 TypeScript check。该 workflow 只验证，不部署。

如需构建后预览，使用独立端口，避免打断长期开发服务：

```sh
npm run preview -- --host 127.0.0.1 --port 4322
```

## 当前文档入口

- 产品建设指导：`docs/GOMYAKU_前情帖_三项目验证后产品建设指导_v0.2.md`
- 当前审阅交接：`docs/qa/publication-v0.2-review-handoff.md`
- Public Surface 边界审计：`docs/cleanup/public-surface-audit.md`
- Launch Gate：`docs/qa/publication-v0.2-launch-gate.md`
- Project 架构与回归合同：`docs/komatsu36-archive-development.md`
- Komatsu36 RC / Semantic 历史索引：`docs/archive/komatsu36-history.md`
- Cloudflare Pages 发布清单：`docs/cloudflare-pages-release-checklist.md`

## 发布边界

`project.json` 中的 `status: published` 会让首页消费该 Project，因此 merge 到部署分支可能本身就是一次 publication action。合并前必须独立确认内容公开权、部署目标和生产环境；部署后再完成真实 URL 的 desktop / 390px、媒体、console、overflow、focus 与 deep-link 验收，最后才决定是否切换 robots。

X Space 等外部来源只保留 canonical 链接、provenance 与事件目标时间，不伪造站内回放或私有接口。Transcript、Evidence、Chat 浏览器、本地大文件托管、Y2 managed external session 与关系图均不属于当前公开版本。
