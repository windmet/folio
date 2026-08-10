# Komatsu36 Semantic P0 Handoff

> 状态：`SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：`docs/komatsu36_semantic_patch_20260810.md`
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体或 P1 扩面

## 1. Authority 与冻结边界

本批只落实 semantic patch 的 P0 硬事实。`komatsu36_main.md`、`komatsu36_arcs.md`、`komatsu36_review_todo.md`、`komatsu36_space.md` 与 RAW 均未回写；Amazon／濱事项由 semantic patch 第 1～3 节作为 derived override layer。既有内部 ID `yt-040405-amazon-hama` 与 `shioya-fumiyasu` 暂时保留，避免破坏旧 Event URL、Thread 引用和人物深链。

本批未实施 aliases schema、敬称搜索正规化、清典公开 offer、11 条 Thread 全量故事化或 UI taxonomy 替换；它们仍按 semantic patch 的 P1/P2 顺序排队。

## 2. 已实施事实

- 原 `yt-040405-amazon-hama` 保留 ID，但读者事实改为“寺島惇太＋堀金蒼平同时 Bingo”；people chips 只包含寺島／堀金，不再把濱标成 winner；
- Event 改为 `qualified`，内部 qualification 记录堀金的排除证据，读者侧用自然 `readerNote` 说明当秒未清晰点名；
- 原宽时间窗拆为 `04:05:05–04:05:24` 中奖节点与新 `04:05:24–04:05:39` 抢卡节点；新增 `yt-040524-hama-grabs-amazon-card`；
- `bingo-payback` 同时消费中奖与抢卡节点；`hama-paid-drinking` 只消费抢卡节点，不再把濱写成 Amazon 中奖者；
- 濱线改为“没带礼物／一路吃喝 → 盯上 Amazon → 自己未中 → 抢寺島 → 1000 円参加赏 → ギャラ＋1000円”；
- 汐谷文康 reader-visible reading 改为 `しおや ふみよし`，内部 slug 暂不迁移；
- `editorialRevision` 更新为 `2026-08-10-semantic-p0`；Reader Copy 重新生成并完成 54/54 decisions。

## 3. 防回归合同

`validate:publication` 现在同时验证：

- semantic patch 中存在 Amazon／濱 override precedence；
- 旧 Amazon ID 仍可用，但 winners 必须严格为寺島／堀金并附 reader note；
- 抢卡 Event 的时间、人物与 Thread 消费关系存在；
- 濱 Thread 不得重新引用 winner Event 或出现“濱中主奖”因果；
- 汐谷 reading 必须为 `しおや ふみよし`；
- 发布 HTML 与搜索 JSON 不得出现旧标题、旧高价值返礼摘要或错误读音；
- 搜索“堀金”能命中纠正后的 winner Event；搜索“濱”命中抢卡 Event，但不能命中 winner Event。

## 4. 验证证据

自动门禁：

```text
npm run validate:projects          PASS — 1 project
npm run validate:reader-copy       PASS — 54 candidates / 54 decisions
npm run validate                   PASS — Astro build + publication
npm exec -- tsc --noEmit           PASS
```

构建快照：125 个公开 Event、16 Thread、18 Person；YT 105 Event、SP1 8 Event、SP2 12 Event；搜索 JSON 159 items；raw HTML 295,961 bytes。

真实本地路由 Browser 回归：

- 1440×900：旧 Amazon deep link 恢复；title、summary、reader note、寺島／堀金 chips 正确；
- 新抢卡 deep link 恢复；濱／寺島 chips 与 Bingo／濱两条 Thread 入口正确；
- 从抢卡 Event 打开 `hama-paid-drinking`，正文明确“始终没有中到主奖”与“ギャラ＋1000円”；
- 汐谷 Person deep link 显示 `しおや ふみよし`；
- 搜索“堀金”命中 winner Event，搜索“濱”命中抢卡 Event且不命中 winner Event；
- 390×844：纠正后的 winner Event、reader note 与人物 chips 可见；
- 两档 document overflow 均为 0，console error/warn 均为空。

可重复验证器：

```text
node scripts/verify-komatsu36-semantic-p0-browser.mjs <optional-screenshot-dir>
```

## 5. 下一批

下一批是 P1 Person semantics：拆开读者可见常用称呼与隐藏搜索 alias，删除 10 条纯敬称，新增 `トシピ`，把“本场别名”改为“本场常用称呼”，并为敬称查询建立搜索正规化。不得在该批顺手迁移人物 slug 或混入 Thread/UI 全量改写。
