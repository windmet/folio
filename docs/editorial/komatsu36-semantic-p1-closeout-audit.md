# Komatsu36 Semantic P0/P1 Closeout Audit

> 日期：2026-08-10  
> 分支：`codex/komatsu36-project-archive`  
> 对照基准：`docs/komatsu36_semantic_patch_20260810.md`  
> 状态：P0 与 P1 `SOURCE / BUILD / BROWSER VERIFIED`；P2 ID 迁移未授权、未执行

## 本文用途

本文是 semantic patch 第 1–19 节的单一收尾索引，不替代各批次 handoff，也不改写 RAW、`komatsu36_main.md`、`komatsu36_arcs.md`、`komatsu36_review_todo.md` 或 `komatsu36_space.md`。后续 agent 必须先看本表，再沿“证据文件”进入对应批次；不得因旧分析 MD 仍有旧结论而把濱重新写成 Amazon 中奖者。

## 逐项审计

| Patch 节 | 结论 | 当前实现 | 强制证据 |
|---|---|---|---|
| 1 | PASS | `yt-040405-amazon-hama` 保留旧 ID，但中奖者为寺島＋堀金；濱不在 winner people；B+/A- reader note 保留 | `validate-publication.mjs` Amazon people／readerNote gate；P0 Browser verifier |
| 2 | PASS | `hama-paid-drinking` 改为“未中主奖→抢寺島卡→1000 円参加赏” | Thread 节点禁止引用 Amazon winner Event，必须引用抢卡 Event |
| 3 | PASS | semantic patch 是旧分析 MD 的 override layer；旧 MD 与 RAW 未回写 | `validate:publication` 检查 patch precedence 原文；P0 handoff |
| 4 | PASS | reader-visible reading 为 `しおや ふみよし`；旧 slug 暂留 | source、search 与 Browser 三层门禁 |
| 5 / 18 | PASS | `aliases` 拆为可见 `callNames` 与隐藏 `searchAliases`；18 人完整 ledger；删除 10 条敬称，新增 `トシピ`；2026-08-10 新证据关闭 `タカオ` 待核并加入光富崇雄 `callNames` | schema、18 人 exact-map gate、Person Browser verifier |
| 6 | PASS | 3 个账号节点显示“室元気账号”；北海道节点仍显示人物“室元気”；未知发言者 note 保留 | exact relation gate、HTML chip count、Account Browser verifier |
| 7 | PASS | 新增 `sp2-025404-public-offer`，并接入“清典总结→公开 offer→YT 公告” | source sequence gate、Story Browser verifier |
| 8 | PASS | 公告同时解释 11/15 mini event 与正式第 4 弹，未恢复土岐隼一误读 | exact summary markers、Story Browser verifier |
| 9 | PASS | 两个台本 Event 分开事实与解释，不再写成逐字官方定义 | source marker gate、Story Browser verifier |
| 10 | PASS | `birthday-payback` 删除过时的人名谨慎说明并改成故事 prose | Thread marker＋forbidden-copy gate |
| 11 | PASS | 11 条明确项与 2 条轻度项已故事化；12 条存在专门 marker gate，Bingo 由 P0 gate 单独覆盖 | Thread Language handoff／Browser verifier |
| 12 | PASS | 核心 UI 已换为读者语言，Overview／People 说明已去工程口吻 | published-reader-text forbidden／required gates；UI Browser verifier |
| 13 | PASS | Thread category／role 与 participation enum 统一经过 reader label mapping | `projectReaderLabels.ts`；UI Browser verifier |
| 14 | PASS | 杯类奖品只保留当前识别结果，误听历史留在隐藏 qualification／ledger note | Event exact-copy gate；Event Browser verifier |
| 15 | PASS | Bingo 标题和摘要改为自然叙事，不再显示 `patch` | Event exact-copy／forbidden-copy gate；Event Browser verifier |
| 16 | PASS | 仅 Amazon 第二位与室账号身份边界向读者显示不确定性；其余 qualification 不发布 | readerNote exact gate；全 qualification HTML／search exclusion gate |
| 17 | DEFERRED P2 | `yt-040405-amazon-hama`、`shioya-fumiyasu` 仍是兼容 ID；未做危险 rename | P0 handoff 与本表共同固定“不以命名整洁破坏 URL／引用” |
| 19 | PASS | P0→Person→Account→Story→Thread→UI→Event 七批均已独立提交与验证 | 七份 handoff；统一 closeout verifier |

## 统一验收入口

先启动当前 checkout 的本地预览（默认 `127.0.0.1:4322`），再运行：

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
npm run validate
npx tsc --noEmit
npm run verify:komatsu36:semantic -- "<repo-external-output-directory>"
npm run audit:payload -- komatsu36
git diff --check
```

`verify:komatsu36:semantic` 必须依次通过 7 组浏览器批次：P0、Person、Account、Story、Thread Language、UI Language、Event Language。可选输出目录只存截图／JSON 证据，不应提交到仓库。

2026-08-10 当前 checkout 实跑结果：

- `npm run validate`：PASS，56/56 reader-copy decisions、160 search items、299,452 bytes；
- `npx tsc --noEmit`：PASS；
- `npm run verify:komatsu36:semantic`：PASS，7/7 batches；
- `npm run audit:payload -- komatsu36`：PASS，距 350 KiB raw gate 余 58,948 bytes；
- 应用内 390px 复核：光富崇雄 deep link 显示“本场常用称呼 / タカオ”，不含 `光富さん`，overflow 0，console 空。

## 不得越界的后续事项

- 不把 P2 stale ID 当成 P0/P1 未完成，也不在没有 redirect／引用迁移计划时直接 rename。
- 不把隐藏 `qualification` 的工程措辞当成 reader-visible 问题；判断前先检查实际 consumer。
- 不回写旧分析 MD 或 RAW；semantic patch 的 Amazon／濱结论继续优先。
- `タカオ` 已封板为光富崇雄的名字 call name；不得恢复“待核”，也不得把已删除的 `光富さん` 当成 alias 回填。
- 不把 M1 浏览器通过写成真实 Android/iOS 通过；真实设备仍是 `NOT EXECUTED`。
- 不把本审计写成 RC 0.12 Release Gate 已开启；T1/Y1 产品停点、真实媒体与 Release Gate 仍独立待办。

## 下一阶段

Semantic P0/P1 已闭环。下一开发批次应回到 RC 0.12 产品流程：先完成 T1 Timeline Navigator 与 Y1 外链 handoff 的产品接受停点，再决定真实设备／真实媒体验收和 Release Gate；P2 ID 迁移继续单独排期。
