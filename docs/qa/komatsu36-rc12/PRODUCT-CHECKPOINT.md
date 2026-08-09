# Komatsu36 RC 0.12 人工停点核对表

> 当前状态：`PRODUCT REVIEW ACKNOWLEDGED — F2 REGRESSION COMPLETE`
> 预览地址：`http://127.0.0.1:4322/projects/komatsu36/`
> 当前执行入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

这份表保留 2026-08-09 第一版产品裁决，并追加当前状态；它不替代源码、构建或 Browser QA 证据。RC12-A2/C2/D2/B2 与 F2 已完成，用户在本地简要复核后反馈“基本能接受”并允许继续收口。该反馈不等同于真实媒体通过、生产验收或 Release Gate 授权。后续边界见 `docs/editorial/komatsu36-rc12-product-correction-runbook.md` 与 `docs/editorial/komatsu36-rc12-f2-final-regression-handoff.md`。

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

上方“第一版裁决”只保存 2026-08-09 的历史事实；A2/C2/D2/B2 新证据与 F2 回归现已完成。当前仍不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`，不 merge、不 deploy、不修改公开状态，除非用户另行授权。

## 2026-08-10 复核跟进

用户本地简要复核反馈：“基本能接受，请你继续”。据此允许执行 RC12-F2 完整回归并建立 corrected handoff；当前记录为 `PRODUCT REVIEW ACKNOWLEDGED — F2 REGRESSION COMPLETE`。除非用户另行明确授权，仍保持 `Release Gate: CLOSED`，不执行 merge、deploy、生产 preview 或 `project.status` 变更。
