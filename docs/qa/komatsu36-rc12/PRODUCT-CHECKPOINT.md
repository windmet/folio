# Komatsu36 RC 0.12 人工停点核对表

> 当前状态：`RC12-T1 + RC12-Y1 ENGINEERING/BROWSER VERIFIED — PRODUCT REVIEW PENDING`
> 预览地址：`http://127.0.0.1:4322/projects/komatsu36/`
> 当前执行入口：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`

这份表保留 2026-08-09 第一版产品裁决，并追加当前状态；它不替代源码、构建或 Browser QA 证据。RC12-A2/C2/D2/B2 与 F2 已完成，RC12-E E1–E5 已完成工程与本地真实 Browser QA。2026-08-10 的新产品复核确认 E 不应回滚，并独立新增 RC12-T1；T1 的 shell-width geometry、窄 segment 投影、可见完整标签与 RC12-Y1 外链 handoff 现已完成工程／Browser 验证，T1/Y1 产品停点仍待用户确认。用户截图中的红框／蓝框仅为几何说明标注，不是产品配色方向。该复核不等同于真实媒体通过、生产验收或 Release Gate 授权。当前证据见 `docs/qa/komatsu36-rc12/t1/README.md` 与 `docs/qa/komatsu36-rc12/y1/README.md`；总边界仍见 product correction runbook、F2 handoff 与 E5 handoff。

## 第一版停点 1 裁决：Player / People

| 项目 | 页面 | 当前实现 | 裁决 |
|---|---|---|---|
| People 桌面层级 | `?view=people`，1366×768 | 单列 PersonCard 无组件溢出，但桌面信息效率下降 | `REJECTED — RC12-C2` |
| Timeline Player 层级 | `?view=timeline&event=yt-042252-seigura-superchat`，1366×768 / 1440×900 | 当前 Compact 与 Expanded 差异不足，仍占右栏 | `REJECTED — RC12-A2` |
| 长文本操作 | 同上，390×844 | Target / Context 机制保留；Act 与 Source 长标题覆盖不足 | `REVISE — RC12-B2` |
| Cast 投影 | People 页面，901px / 390px | 工程无横滚；产品要求明确 desktop medium role-row fallback | `REVISE — RC12-C2` |

## 第一版停点 2 裁决（历史）：D / E

| 项目 | 当前建议 | 裁决 |
|---|---|---|
| RC12-D 来源图标 | 图标化方向保留；重做 X Space 图形与 Source card 三层信息层级 | `REVISE — RC12-D2` |
| RC12-E Source-scoped Timeline | 正式保留为 P1 backlog；未明确纳入当时视觉返工 | `历史裁决：DEFERRED / NOT IMPLEMENTED` |

## 第一版停点回复格式（历史）

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

上方“第一版裁决”只保存 2026-08-09 的历史事实；A2/C2/D2/B2 新证据与 F2 回归现已完成。B2 正文展开体系继续为 PASS；A01–A08 segment tooltip 属于新的 T1 导航合同，不得回写为 `B2 REJECTED`。当前仍不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`，不 merge、不 deploy、不修改公开状态，除非用户另行授权。

## 2026-08-10 复核跟进

用户本地简要复核反馈：“基本能接受，请你继续”。据此先执行 RC12-F2 完整回归并建立 corrected handoff，随后启动 RC12-E E1–E3；F2 记录保留为前一批回归状态。除非用户另行明确授权，仍保持 `Release Gate: CLOSED`，不执行 merge、deploy、生产 preview 或 `project.status` 变更。

## 2026-08-10 RC12-E 工程跟进

“继续”被作为下一批范围确认后，E1–E5 已完成工程与本地真实 Browser 验证；E5 交接记录见 `docs/qa/komatsu36-rc12/e/E5-HANDOFF.md`。人工产品接受、真实媒体与 Release Gate 仍未完成。

## RC12-E 当前产品人工停点

以下只需要人工判断信息层级和使用感受；工程门禁已经覆盖 URL、native clock、键盘、focus restore、ARIA、overflow、console 与 single player mount。

| 尺寸／路径 | 人工只需确认 | 接受条件 |
|---|---|---|
| 桌面 1440×900：`?view=timeline&track=space-1` | 三个 scope 是否像 Timeline 的来源索引，而不是额外信息堆；SP1 标题、`NATIVE CLOCK`、8 个 Event 与右侧 Player 是否一眼可分层 | 选择来源的理由清楚；来源时间不会被误读成 YouTube 全局轴；Event 密度可扫读 |
| 窄屏 390×844：同一路由 | 三列 scope tab 的文字是否仍可读；Player 是否遮挡 scope／首个 Event；source header、时间和 TARGET 是否需要来回寻找 | 不需要横向拖动；当前来源、native clock、首个事件和 Player 状态均能顺畅定位 |
| 键盘／历史 | Enter／Space 后是否符合预期；Back 后焦点是否回到当前可见 scope；选中 Event 后是否仍知道自己所在来源 | 操作反馈明确，不出现焦点落在隐藏按钮或来源错位 |

人工回复可直接使用：

```text
E：ACCEPT
```

如需继续调整，请具体指出信息层级或尺寸，例如：

```text
E：REVISE — 390px scope tab 文字太小；其余 ACCEPT
```

`E：ACCEPT` 只表示 RC12-E 产品停点通过；它不自动授权真实媒体、生产部署、merge 或 Release Gate。

## 2026-08-10 新产品裁决：RC12-T1

| 项目 | 当前工程事实 | 裁决 |
|---|---|---|
| A2 Docked Player | 已完成 Docked Bottom Player 与单媒体 mount 回归 | `PASS / FREEZE` |
| C2 People / Cast | wide／medium／mobile 投影已完成 | `PASS / FREEZE` |
| D2 Source hierarchy / icon | 三层信息层级与 X Space radiowave 已完成 | `PASS / FREEZE` |
| B2 expandable正文 | 机制与 Source consumer 已完成；Act／Timeline natural fixture 仍 TODO | `PASS；TODO consumer-check 保留` |
| E Source-scoped Timeline | 三 scope、native clock、Event projection 已工程／Browser 验证 | `PRODUCT REVIEW PENDING；不回滚` |
| T1 Navigator full-shell geometry | T1 已按 shell rect 扩展 Expanded/Docked，sticky Player offset 同步 | `ENGINEERING/BROWSER VERIFIED；PRODUCT REVIEW PENDING` |
| T1 narrow segment | A03 等窄 segment 只显示 Axx，保留 duration ratio | `ENGINEERING/BROWSER VERIFIED；PRODUCT REVIEW PENDING` |
| T1 hover/focus full label | A01–A08 已输出 hover/focus tooltip，原 aria-label 保留 | `ENGINEERING/BROWSER VERIFIED；PRODUCT REVIEW PENDING` |
| YouTube external handoff | Y1 已实现暂停站内 Player／清除 pending seek／保留安全外链；Y2 仍未实现，网站不能扫描任意已有标签页 | `Y1 ENGINEERING/BROWSER VERIFIED — PRODUCT REVIEW PENDING；Y2 NOT AUTHORIZED` |

红框／蓝框只说明审阅中的几何范围，产品继续使用既有档案色彩与 focus/active 语义。T1 完成工程与 Browser QA 后，人工回复格式为：

```text
T1：ACCEPT
```

或指出具体修正：

```text
T1：REVISE — Expanded 宽度可以；A08 tooltip 仍越界
```

T1 的工程／Browser 证据账本见 `docs/qa/komatsu36-rc12/t1/README.md`；Y1 证据见 `docs/qa/komatsu36-rc12/y1/README.md`。T1/Y1 的产品接受不自动关闭 E 产品停点，不授权 Y2、真实媒体、merge、deploy 或 Release Gate。
