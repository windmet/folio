# Komatsu36 RC12-T1 QA Ledger

> 状态：`NOT STARTED — BASELINE CAPTURE PENDING`
> 实施入口：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`
> Release Gate：CLOSED

本文是 RC12-T1 的追加式证据账本。目前只建立结构，不声称已有 T1 source、Browser 或 product 证据。后续 agent 不得用 RC12-E 或旧 R5 Navigator 截图替代 T1 baseline。

## T1.0 Baseline

`NOT EXECUTED`

开始代码修改前记录：

- branch / HEAD / worktree；
- 1440×900 Expanded、1440×900 Docked、1366×768 Expanded、901px、390×844；
- route、Player mode、Timeline scope；
- shell / Navigator / Player bounding rect；
- document `scrollWidth` / `clientWidth`；
- A03 窄投影与 A01/A08 边缘状态；
- console error。

截图中的红框／蓝框如用于说明，只能作为 QA overlay，并注明不属于产品配色或 DOM/CSS。

## T1.1 Geometry

`NOT EXECUTED`

待记录实现提交、自动验证、Expanded/Docked、中等宽度、SP1/SP2 隐藏状态、Player sticky offset、Act scroll offset 与 overflow 证据。

## T1.2 Segment projection and tooltip

`NOT EXECUTED`

待记录 A01–A08 hover/focus、A03 only-Axx projection、A01/A08 边缘 tooltip、aria-label、duration ratio、Enter/Space 与 focus ring 证据。

## T1.3 Regression

`NOT EXECUTED`

待记录完整 `npm run validate`、构建 preview 的真实路由 Browser QA、console、overflow、URL/history/current Act、single Player mount 与未执行边界。

## Product checkpoint

`PENDING`

只有用户明确回复 `T1：ACCEPT` 才能标记 T1 `PRODUCT-ACCEPTED`。T1 接受不自动关闭 RC12-E 产品停点，不授权 Y1/Y2、真实媒体、merge、deploy 或 Release Gate。
