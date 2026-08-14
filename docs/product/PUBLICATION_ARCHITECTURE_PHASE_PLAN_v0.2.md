# 前情帖 Publication Architecture Phase Plan v0.2

日期：2026-08-14  
基线分支：`codex/komachoe-20260309`  
基线 HEAD：`9ad78eab61d9e51cb6f1866bd39aade1b8a6baf5`  
上位指导：`docs/GOMYAKU_前情帖_三项目验证后产品建设指导_v0.2.md`

## 1. 阶段目标

这一阶段把现有三个 Project 组织成一个读者能够进入、追踪和继续探索的“前情帖” publication。当前不拆分 GOMYAKU 仓库，不扩 Archive Core，不重做 Komatsu36 Reader，也不建设关系图或 Global Works。

优先顺序：

```text
PUB-02B Publication metadata / projection
→ PER-02A Global People routes
→ PUB-02C Homepage v2
→ CTX-02A Project ↔ Person 闭环
→ PUB-02D Brand / About / launch metadata
→ COR-02A Global search（后置）
```

## 2. 本地真实基线

### 已成立

- 三个 Project 均为 `published`，首页已有三张入口卡。
- Komatsu36：3 Tracks、8 Acts、131 Events、16 Threads、18 Project Person Contexts、6 Sources。
- 2026.03.09：1 Track、6 Acts、38 Events、0 Threads、13 Project Person Contexts。
- 2026.04.25：1 Track、6 Acts、30 Events、0 Threads、11 Project Person Contexts。
- 全局 Person 共 24 个；Project Person Context 共 42 个。
- Person Model v2、presence relevance、广播 Index、项目搜索和三项目 regression 已落地。
- `npm run validate` 在 `9ad78ea` 通过。

### 尚未成立

- 首页仍以“资料室 / Magazine”为主品牌，并保留四个旧文件夹作为最高层入口。
- 首页为 582 行单文件，混合数据读取、类型推断、组件结构、交互和 CSS。
- Post 分类仍依赖文件名 substring；所有 4 篇 Post 均无显式 `section`。
- Project 均无 publication-only metadata。
- 首页刚加入的广播标签通过 `tracks === 1 && threads === 0` 推断，属于需要优先移除的实现层 heuristic。
- “最近更新”只读取 Post，不是统一 Publication Feed。
- 没有 `/people/`、`/people/[id]/`、`/about/` 或站级 `/search/`。
- 24 个 Global Person 当前没有 `contextProfile`，也没有公开 links；这不阻塞 People v1 自动聚合页。
- `BaseLayout` 与 `ProjectLayout` 均固定 `noindex,nofollow`，没有 OG、favicon 或 route-aware launch policy。
- README 仍写 `Megazine Blog`、旧活动分支和大量 RC 入口；`package.description` 仍是旧站描述。
- `origin/main` 当前比本分支少 160 个提交；production / merge / robots 必须作为独立发布决策，不能从 `project.status` 推断。

## 3. 批次计划

### Batch 0 — DOC-P0 / 基线冻结

范围：

- 归档 v0.1 产品指导，保留 v0.2 为当前上位决策。
- 更新 README 第一屏：前情帖定位、三个 Project、Person Model v2、当前分支与验证命令。
- 把 Komatsu36 RC 历史入口收敛到一个历史索引，不重写历史文件。
- `package.name` 暂不改；只修正 description，避免 package rename 与品牌改造耦合。

验收：

- 文档不再声称当前 active branch 是 4/25 分支。
- 明确区分 Project published、production deployed、public indexable。
- 不修改 Reader 行为。

### Batch 1 — PUB-02B / 显式 Publication Metadata

数据合同：

```yaml
Post:
  section: interview | archaeology | radio | note
```

```json
Project.publication: {
  "kind": "special | episode",
  "date": "YYYY-MM-DD",
  "seriesKey": "optional-stable-series-id",
  "featured": true,
  "homeDeck": "reader-facing entry copy"
}
```

实施：

- 为 4 篇 Post 补显式 `section`。
- 为三个 Project 补 publication metadata。
- 新建 `src/lib/homeProjection.ts`，统一产出 featured、recent feed、legacy collections 和未来 people teaser 所需数据。
- 首页移除 filename substring 与 Track/Thread 数量类型推断。
- 增加 `verify:home-projection`，验证排序、类型、日期、URL 和 published 边界。
- 这一批只换数据来源，不做 Homepage v2 视觉重构。

验收：

- 首页类型完全由 publication metadata 决定。
- `homeProjection` 不包含 slug-specific conditional。
- 三项目 HTML/payload 无无关变化。
- `npm run validate` 全绿。

### Batch 2 — PER-02A / Global People v1

路由：

```text
/people/
/people/[id]/
```

投影合同：

- Global identity：displayName、reading、aliases、optional links、optional contextProfile。
- 跨 Project 聚合：Project count、按 publication date 排序的 contexts、presence labels、roles、project-local summary、Event anchors。
- 排序使用现有 derived relevance；Reader 不显示 raw score。
- 无 `contextProfile` 时页面照常成立，不自动写 biography。

第一验收 fixture：`ito-tomohiro`。

必须展示：

- 2026.03.09：`live-call`。
- Komatsu36 / 2026.04.14：`submitted`。
- 2026.04.25：`referenced`。
- 三个 Project 的摘要与可用 Event anchors。

验证：

- 新增 People projection verifier。
- 检查 canonical ID、排序稳定性、缺失 optional profile/links 时的输出。
- 桌面与 390px：overflow、focus、deep link、console。

### Batch 3 — PUB-02C / Homepage v2

组件边界：

```text
src/components/home/HomeMasthead.astro
src/components/home/FeaturedArchive.astro
src/components/home/PeopleTeaser.astro
src/components/home/RecentFeed.astro
src/components/home/LegacyCollections.astro
src/pages/index.astro
```

信息架构：

1. 前情帖 Masthead：一句话说明 subject 与用途。
2. Featured：Komatsu36 flagship + 两档节目帖，reader copy 解释“为什么值得进入”。
3. People teaser：4–6 个高 relevance Person，显示 Project 数与 presence 摘要，不显示分数。
4. Recent publication feed：混合 Project 与 Post。
5. Legacy collections：采访、考古、广播旧文、随笔退为文章筛选入口。
6. About 入口。

验收：

- 第一屏不再以 `Magazine` 或四文件夹定义网站。
- 两档广播与 Radio legacy lane 不再概念冲突。
- Project stats 只作为 secondary metadata。
- 首页不复制 Project/Person 数据。
- 桌面、390px、focus、overflow、console、真实链接通过。

### Batch 4 — CTX-02A / Project ↔ Global Person 闭环

实施：

- Project Index 人物卡增加“查看跨档案前情”。
- Event inline link 仍先到本 Project Index，不直接跳全局页。
- Global Person 页按 Project 展示反向 Event anchors。
- Komatsu36 重型 People UI 只增加兼容的第二跳，不重做结构。

验收路径：

```text
Event
→ 本期 Index / People context
→ Global Person
→ 另一 Project 的 Event anchor
```

验证 URL/history、hash target、back/forward 和移动端折叠状态。

### Batch 5 — PUB-02D / Brand、About 与 Launch Metadata

实施：

- Reader-facing `Magazine` → `前情帖`。
- 统一 title / description / canonical / OG metadata。
- 增加 `/about/`，覆盖 Subject、Source、Editorial、Governance、Corrections、Rights/Contact。
- 加入 mark / favicon。
- Footer 可使用 `Built with GOMYAKU / 語脈`，但 GOMYAKU 不作为首屏品牌。
- 建立 route-aware robots policy，但默认继续保留 `noindex,nofollow`，直到 Launch Gate 明确批准。

Launch Gate：

- 内容公开权确认。
- latest CI success。
- production URL 可达。
- production desktop + 390px spot check。
- 真实媒体基本链路。
- 已知未测边界记录。
- console / overflow / focus / deep-link 无 blocker。
- 单独决定 robots 是否从 noindex 改为 index。

### Batch 6 — COR-02A / Global Search（不阻塞前述批次）

在 Homepage、People 与跨档案闭环稳定后，统一 Project、Event、Person、Post；Work/Context 仍保持 Project-local，不提前 globalize。

### Batch 7 — REL-02A / Relationship Candidate Log only

只新增候选记录：pair、语义、supporting Project/Event、候选 edge label。没有稳定 edge contract 前不实现 graph，不计算关系强度。

## 4. 明确不做

- 不创建独立 GOMYAKU repo 或 monorepo。
- 不实现 GUI Workbench。
- 不实现 Relationship graph / D3 / Cytoscape。
- 不 globalize Works / Context。
- 不自动生成 contextProfile、关系定义或 Person biography。
- 不重做 Komatsu36 Player、Timeline、Storylines 或 People。
- 不自托管媒体，不公开完整 Transcript / Evidence / Chat。
- 不把 `project.status: published` 当作 robots 或 production release 授权。

## 5. 建议下一步

下一次代码批次从 `9ad78ea` 创建 `codex/publication-metadata-v2`，只执行 Batch 0 与 Batch 1。先让 publication semantics 和 Home Projection 成为稳定数据合同，再开始 People route 和首页视觉。
