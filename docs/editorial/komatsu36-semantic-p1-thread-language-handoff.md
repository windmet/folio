# Komatsu36 Semantic P1 Thread Reader Language Handoff

> 状态：`P1 THREAD LANGUAGE · SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：`docs/komatsu36_semantic_patch_20260810.md` 第 10–11、16、19 节
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体、UI taxonomy 或 P2 ID 迁移

## 1. 范围与完成判断

Semantic patch 指出的 11 条明确 Thread 问题中，`bingo-payback` 已在 Semantic P0 随 Amazon／濱因果修正完成故事化。本批处理其余 10 条，并完成 2 条轻度优化：

- 明确修正：`birthday-payback`、`broken-sword`、`ending-wont-end`、`kano-ojisan`、`muro-account`、`shugo-yakiniku`、`space-technical-hell`、`terashima-big-dream`、`uchida-line-call`、`yano-sunglasses`；
- 轻度优化：`ore-shiri-making-of`、`russian-takoyaki`。

`hama-paid-drinking`、`popular-space-haiku`、`rom-rule` 已是读者叙事，不为制造改动而重写。Thread 节点、顺序、跨平台原生时钟、Event ID 与 category 均未改变。

## 2. 读者语言结果

本批把以下表达从正文移除：

- 资料是否连续、事件线如何裁决、记录坐标；
- “编辑顺序”“程序禁止跨 Track 排序”“节点顺序是编辑因果”；
- “适合作为物品流转型 Thread”等 taxonomy 说明；
- “现场原声也真的出现”“这里不把它写成确定因果”等审校旁白；
- 已被历史 RAW 恢复推翻的“内田人名仍谨慎”。

替换后的正文直接讲故事，同时保留真正影响事实的边界：室账号说话者仍未确认；赛马与章鱼烧遗忘只写作时间上紧邻的干扰，不伪造明确因果。

## 3. Reader Copy 门禁升级

`validate:reader-copy` 过去只验证每个 candidate 是否有人工决定，不能证明决定已写回 source。本批增加 source↔ledger 一致性：

- Event `rewrite` 的 `newTitle/newSummary` 必须与 JSON 完全一致；
- Thread `rewrite` 的 `newDeck/newBody` 必须与 frontmatter/body 完全一致；
- orphan decision、missing decision 与不合法 action 继续失败。

当前生成候选为 `45 Event + 10 Thread = 55`，人工决定为 `55/55`，并已通过新的一致性门禁。

`validate:publication` 另外固定 12 条 Thread 的故事 marker，并拒绝旧编辑台句子重新进入正文。

## 4. 验证证据

```text
npm run validate                   PASS — 299,328 bytes / 160 search items
npm exec -- tsc --noEmit           PASS
npm run audit:payload -- komatsu36 PASS — 59,072 bytes raw gate remaining
git diff --check                   PASS
```

Browser / Playwright：

- 1440×900 逐条打开 12 个 Thread deep link，approved story marker 与至少 2 个 Event node 均存在；
- 从 `uchida-line-call` 点击 SP2 Event，URL 正确进入 `sp2-011242-uchida-connected`；
- 390×844 抽查生日规则、俄罗斯章鱼烧、内田 LINE 三条长短不同的正文；
- desktop/mobile document overflow 均为 `0`，console error/warn 均为空；
- 截图保存在仓库外，不进入 Git。

可重复验证器：

```text
node scripts/verify-komatsu36-semantic-p1-thread-language-browser.mjs <optional-screenshot-dir>
```

## 5. 下一批

下一批只处理 semantic patch 第 12–13 节的 UI reader-language：8 个核心组件、Overview／People 说明、Thread category／node role、Person participation 和 Search 类型标签。内部 enum 与结构化 category 继续保留在数据层，只改变 reader-visible mapping。Event 杯类奖品与 Bingo patch 文案留给随后独立 Event 批次。
