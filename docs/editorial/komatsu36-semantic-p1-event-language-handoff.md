# Komatsu36 Semantic P1 Event Reader Language Handoff

> 状态：`P1 EVENT LANGUAGE · SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：`docs/komatsu36_semantic_patch_20260810.md` 第 14–15 节
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体或 P2 ID 迁移

## 1. 完成范围

本批完成 Semantic patch 明确指出的最后两处 reader-visible Event 流程词：

| Event | 旧问题 | 当前读者文案 |
|---|---|---|
| `yt-035520-bingo-rules-patched` | 标题“规则边玩边修补”、摘要“规则不断 patch” | `Bingo 规则越玩越多，口令也临时改掉`；正文直接说明单卡、同号流局、double Bingo 与口令变化 |
| `yt-040000-tumbler-mitsutomi` | 页面解释“并不是早先误听成的挂毯” | 只说明光富中奖与新選組／瀬戸焼き“誠”杯类物件；纠错历史不再给读者看 |

Event ID、Track、Act、时间、人物、publicationStatus、qualification 与证据边界均未改变。杯类奖品的品牌／材质／SKU 限制继续只放在内部 qualification。

## 2. 全 Event 可见文案审计

对 126 个公开 Event 的 `title + summary` 重新扫描：

```text
canonical / source-local / native clock / patch / 误听 / 复核 / ASR /
Whisper / 锁定 / 裁决 / 页面 / 本文 / 本条线 / 当前采用 /
资料工程 / 编辑 / 校对
```

修改前只命中上述两个 Event；修改后为 `0`。隐藏 qualification 不因读者语言清理而删除。

候选生成器新增 `patch` 与 `误听` 检测，避免同类问题再次绕过 ledger。`editorialRevision` 更新为 `2026-08-10-semantic-p1-event-language`。

## 3. Reader Copy 与发布门禁

- generated candidates：`46 Event + 10 Thread = 56`；
- decisions：`56/56`；
- source↔ledger 精确一致通过；
- `validate:publication` 拒绝三个旧句，并要求新 title/summary 进入公开 HTML；
- Search JSON 自动随 source 更新，可检索 `double Bingo` 并进入正确 Event。

## 4. 浏览器证据

可重复验证器：

```text
node scripts/verify-komatsu36-semantic-p1-event-language-browser.mjs <optional-screenshot-dir>
```

1440×900 与 390×844 均验证：

- 两个 Event deep link 恢复为 active card；title/summary 与 approved copy 完全一致；
- 旧流程词不在 reader-visible body；
- `double Bingo` Search 进入 `yt-035520-bingo-rules-patched`；
- 390px 仍保持 RC12-M1 Bubble；
- document overflow `0`，console error/warn `[]`。

## 5. 后续

Semantic P1 的事实、Person／alias、Account、故事缺口、Thread prose、UI taxonomy 与 Event 流程词批次均已有独立交接。下一步不是继续盲改文案，而是按 semantic patch 第 1–19 节逐项做完成审计；只有所有 P0/P1 明确要求都有 source/build/browser 证据后，才更新总检查点。P2 ID migration、真实设备、真实媒体与 Release Gate 继续独立关闭。
