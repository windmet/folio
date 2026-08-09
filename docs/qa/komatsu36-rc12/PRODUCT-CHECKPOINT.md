# Komatsu36 RC 0.12 人工停点核对表

> 当前状态：`PRODUCT REVIEW RECORDED — CORRECTION REQUIRED`
> 预览地址：`http://127.0.0.1:4322/projects/komatsu36/`
> 当前执行入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

这份表记录 2026-08-09 已收到的产品裁决，不替代源码、构建或 Browser QA 证据。第一版页面通过了自动门禁与响应式压力测试，但这只证明工程稳定，不证明形态获得产品接受。后续批次与验收合同见 `docs/editorial/komatsu36-rc12-product-correction-runbook.md`。

## 第一版停点 1 裁决：Player / People

| 项目 | 页面 | 当前实现 | 裁决 |
|---|---|---|---|
| People 桌面层级 | `?view=people`，1366×768 | 单列 PersonCard 无组件溢出，但桌面信息效率下降 | `REJECTED — RC12-C2` |
| Timeline Player 层级 | `?view=timeline&event=yt-042252-seigura-superchat`，1366×768 / 1440×900 | 当前 Compact 与 Expanded 差异不足，仍占右栏 | `REJECTED — RC12-A2` |
| 长文本操作 | 同上，390×844 | Target / Context 机制保留；Act 与 Source 长标题覆盖不足 | `REVISE — RC12-B2` |
| Cast 投影 | People 页面，901px / 390px | 工程无横滚；产品要求明确 desktop medium role-row fallback | `REVISE — RC12-C2` |

## 第一版停点 2 裁决：D / E

| 项目 | 当前建议 | 裁决 |
|---|---|---|
| RC12-D 来源图标 | 图标化方向保留；重做 X Space 图形与 Source card 三层信息层级 | `REVISE — RC12-D2` |
| RC12-E Source-scoped Timeline | 正式保留为 P1 backlog；未明确纳入当前视觉返工 | `DEFERRED / NOT IMPLEMENTED` |

## 下一轮人工停点回复格式

直接回复以下任一形式即可：

```text
A2：ACCEPT
C2：ACCEPT
D2：ACCEPT
B2：ACCEPT
E：DEFERRED
```

如需修改，只需指出具体项目，例如：

```text
A2：Dock 高度需要降低；其余 ACCEPT
C2：People ACCEPT；Cast medium 需要调整
D2：X Space 图标需要调整
B2：ACCEPT
E：DEFERRED
```

当前裁决已经明确第一版不通过。在 A2/C2/D2/B2 新证据和新人工停点完成前，不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`，不 merge、不 deploy、不修改公开状态。
