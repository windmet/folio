# Komatsu36 Semantic P1 Story Completion Handoff

> 状态：`P1 STEPS 9–11 · SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：source-set `komatsu36-20260808-r1` + `docs/komatsu36_semantic_patch_20260810.md` 第 7–9、19 节
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体或 reader-language 全量扩面

## 1. 源档核对

本批先运行 `validate:sources`，再只读取 manifest 锁定的带版本输入。关键证据：

- `komatsu36_space(20260808-085743).md`：SP2 `02:54:04` 预告续报、`02:54:25` 请清典空出行程、`02:54:30` “公開オファー”；
- `komatsu36_arcs(10).md`：确认 `清典动作总结 → 公开 offer → YT 04:27:30–04:30:13 公告` 闭环；
- `komatsu36_arcs(10).md` 与 process archive：11/15 mini event 是声优活动加约 10–15 分钟 mini 朗读剧；正式第 4 弹另行面向来年启动，主题为 Hero Show；
- 主直播制作段：`03:27:08` 丢本解释、`03:39:44` 即使背熟仍“作为朗读”看台本，并明确避免作品缩成 straight play。

旧 root-level 工作稿与 RAW 均未改动。

## 2. 已实施内容

### P1-9 清典公开 offer

新增 `sp2-025404-public-offer`，时间窗 `02:54:04–02:54:41`，人物为小松昌平／清典。文案只写公开邀约与行程先空出来，不写成清典正式确定出演。

`ore-shiri-making-of` 的结尾顺序现在严格为：

```text
sp2-025254-seiten-reflection
→ sp2-025404-public-offer
→ yt-042730-mini-event-announced
```

### P1-10 两项公告解释

`yt-042730-mini-event-announced` 现在直接解释：

- 11 月 15 日 mini event：类似此前 Hero Show 型活动，声优活动 + 约 10–15 分钟 mini 朗读剧；
- 正式第 4 弹：另行面向来年启动制作，主题为“ヒーローショー”。

发布门禁禁止恢复已被审计撤回的 `土岐隼一` 读法；本批没有扩写不需要发布的姓名玩笑逐字稿。

### P1-11 台本原则降级

- `yt-032708-book-symbolism` 只写现场对“丢本”的解释，以及小松希望演员保持与台本的关系；
- `yt-033944-script-language` 写出背熟、仍作为朗读看台本、避免缩成 straight play 三个事实，再将其克制归纳为“制作原则之一”；
- 两处都删除“不是防忘词工具，而是作品的表演语言”这种像官方单句定义的过强写法。

## 3. 防回归合同

`validate:publication` 固定：

- public-offer Event 的 ID、时间窗、标题与人物；
- making-of Thread 三节点连续顺序；
- 公告 summary 同时包含 mini event 形式、来年制作与 Hero Show 主题；
- 两个台本 Event 保持事实／解释分层；
- 发布 HTML 包含四组核心读者文案，HTML / Search JSON 不含 `土岐隼一`。

Reader Copy 重新生成后为 `55 candidates / 55 decisions`；public-offer 因自然语言中的“发布”命中自动词表，人工决定为 `keep`，并明确它是现场预告动作而不是档案流程词。

## 4. 验证证据

```text
npm run validate                   PASS — 297,999 bytes / 160 search items
npm exec -- tsc --noEmit           PASS
npm run audit:payload -- komatsu36 PASS — 60,401 bytes raw gate remaining
npm run validate:sources -- --root <authoritative-root>
                                     PASS — 6 files
git diff --check                   PASS
```

Browser / Playwright 已验证：

- public-offer SP2 deep link 恢复，人物、summary 与 making-of Thread 入口正确；
- Thread panel 中清典总结／公开 offer／YT 公告连续出现；
- YT 公告与两个台本 Event 显示新 reader copy；
- 搜索 `公开 offer` 命中新 Event；
- 1440×900 与 390×844 document overflow 均为 `0`，console error/warn 均为空；
- 截图保存在仓库外，不进入 Git。

可重复验证器：

```text
node scripts/verify-komatsu36-semantic-p1-story-browser.mjs <optional-screenshot-dir>
```

## 5. 后续状态

Thread Reader Language 随后已由 `komatsu36-semantic-p1-thread-language-handoff.md` 独立完成：P0 已修的 Bingo 加上本批 12 条 Thread 均已故事化，reader-copy source↔ledger 一致性也升级为门禁。下一批处理 8 个 UI 组件，再单独处理 Event 流程词；不得迁移 P2 内部 ID。
