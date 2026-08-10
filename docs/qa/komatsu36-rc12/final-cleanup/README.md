# RC12 Final Interaction & Hierarchy Cleanup QA Ledger

> 当前状态：`SOURCE-VERIFIED + BROWSER-VERIFIED — PRODUCT REVIEW PENDING`
> 实施入口：`docs/editorial/komatsu36-rc12-final-interaction-hierarchy-cleanup.md`

## 目标矩阵

| 批次 | 目标 | 状态 |
|---|---|---|
| P0-A | Person/Thread overlay XOR、transition、focus trap、Back restore | `PASS` |
| P0-B | YT Act Context removal；非 Timeline CTA；SP relational context | `PASS` |
| P1-C | Chinese UI label token `.archive-label-zh` | `IMPLEMENTED — QA PENDING` |
| P1-D | Media Sources native disclosure | `IMPLEMENTED — QA PENDING` |

## 已验证证据

- Person → Thread：一个 overlay 可见；Person 隐藏；URL 只含 `thread=space-technical-hell`；焦点在 Thread panel；双参数异常 URL 自动收敛为 Thread。
- YT Timeline：桌面与 390px `data-player-context.hidden=true`；Act Context 旧文案不存在；桌面保留 8 个 Navigator segment；移动端无横向 overflow。
- YT Overview：选中 YT Event 时只显示 `在 Timeline 查看此节点 →`。
- SP1 Timeline：显示 `关联上下文`、`1 条相关事件线` 与 Storyline CTA。
- 390×844 Expanded YT Player：`scrollHeight - clientHeight = 0`；console `[]`；overflow `0`。

## P1 实施记录

- P1-C：已将播放器、Timeline scope、Storyline／Thread、Person participation／Storyline 与来源事件标签迁移到 `.archive-label-zh`；时间、代码、平台短码与 Event count 保持 mono。
- P1-D：Media Sources 现在以常驻摘要呈现，三张 source card、来源证明与 Source Event Index 放在默认收起的原生 `<details>` 中；所有 `data-source-track`、`data-source-browse` 与 `?track=` 逻辑保持不变。
- 待验：真实 `/projects/komatsu36/` 路由桌面／390px，native disclosure 键盘展开、source browse、URL/history、console 与 overflow。

## 必验路径

```text
People → Person → 相关事件线 → Thread
Back → Person
Timeline + YT Event + mobile Expanded Player
Overview + YT Event + lightweight Timeline CTA
Timeline + SP1 Event + 关联上下文 → Storyline
```

## 证据等级

- `SOURCE-VERIFIED`：controller／markup／static gate；
- `BROWSER-VERIFIED`：真实 `/projects/komatsu36/` 路由、桌面／390px、focus、URL、console、overflow；
- `PRODUCT REVIEW PENDING`：用户确认 overlay 替换是否自然、Player 高度是否收敛；
- `NOT EXECUTED`：真实 Android/iOS、真实媒体长时播放、生产与 Release Gate。
