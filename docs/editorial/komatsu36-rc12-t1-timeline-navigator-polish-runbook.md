# Komatsu36 RC12-T1 Timeline Navigator Geometry & Label Polish Runbook

> 状态：`READY FOR IMPLEMENTATION — REQUIRED BEFORE RC12 PRODUCT CLOSEOUT`
> 建立日期：2026-08-10
> 基线分支：`codex/komatsu36-project-archive`
> 基线提交：`8f4a3b3`
> 前置事实：RC12-A2/C2/D2/B2/F2 已完成；RC12-E E1–E5 已完成工程与本地 Browser 验证，产品停点未关闭
> 本批入口：本文
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体验收或 `project.status` 变更

本文把 2026-08-10 产品复核中确认的 Timeline Navigator 几何与标签问题整理为独立的 RC12-T1。它不否定 RC11 的 8-Act Navigator，也不把 B2 的正文展开合同改判为失败；T1 只修正桌面 Navigator 的可用横向范围、极窄 segment 投影和 hover／keyboard-focus 完整标签。

## 0. 审阅标注解释

审阅截图中的红框和蓝框是用户后期为了指出“当前内容范围”和“希望利用的可用范围”所加的说明标注。

- 红、蓝只表达几何边界，不是产品色板、状态色或强调色要求；
- 不得新增红框、蓝框、蓝色焦点、彩色 segment 或相应设计 token；
- 实现继续复用现有档案纸张色、线色、`--archive-red` 激活语义和既有 focus 语言；
- Browser QA 截图如果继续使用彩色框，必须注明它们是 QA overlay，不属于页面 DOM/CSS。

## 1. 当前工程事实

截至基线提交，本地源码显示：

- `.project-workspace` 在桌面使用正文列 + `320–390px` Player 列，并保留 responsive gap 与左右 padding；
- `.timeline-navigator` 渲染在 `.project-content` 内，因此 Expanded 时天然只占正文列；
- Docked 已把 workspace 切成单列，但 Navigator 仍受 workspace padding／正文容器限制；
- 8 个 Act segment 使用 `flex: var(--timeline-act-ratio) 1 0`，比例来自真实 Act duration；
- segment button 始终输出 `Axx` 和标题，极窄 Act 因此出现半截标题；
- segment 已有完整 `aria-label`，但没有鼠标 hover 或键盘 focus 可见的完整标签；
- 当前章节标题属于 B2 inline expand/collapse consumer；segment button 属于导航控件，两者不是同一交互合同；
- Navigator 只属于默认 YT scope；SP1／SP2 使用各自 native-clock Event projection，不出现 8-Act Navigator；
- 当前 raw HTML 为 `291,492 bytes`，350 KiB 门禁余量 `66,908 bytes`。payload 仍是防回归门禁，不是缩水 tooltip 或读者功能的理由。

## 2. 产品裁决与冻结面

| 范围 | 裁决 | T1 行为 |
|---|---|---|
| A2 Docked Player | `PASS / FREEZE` | 只消费既有 `is-player-docked` 状态，不改 Player 形态或媒体生命周期 |
| C2 People / Cast | `PASS / FREEZE` | 不触碰 |
| D2 Source hierarchy / icon | `PASS / FREEZE` | 不触碰 |
| B2 expandable text | `PASS`，Act／Timeline natural fixture 仍 `TODO consumer-check` | 不接管现有展开/收起机制，不把 segment tooltip 记为 B2 返工 |
| E Source-scoped Timeline | `SOURCE/BROWSER VERIFIED — PRODUCT REVIEW PENDING` | 保留三 scope、native clock 与 source-local projection |
| T1 Navigator geometry | `REQUIRED` | Docked 扩到 Project shell；Expanded 建立 workspace-global band |
| T1 narrow segment | `REQUIRED` | 保留 duration ratio，窄 segment 只显示 Axx |
| T1 visible full label | `REQUIRED` | 所有 A01–A08 hover/focus 显示完整 `ACT xx · title` |

T1 不得修改 Act duration、Act/Event 数量或顺序、Track、source scope、URL schema、current Act 判定、Event selection、history、Player seek/playback、内容真值或移动导航裁决。

## 3. 目标布局合同

### 3.1 Docked

在 `min-width: 901px` 且 Player 为 Docked 时，YT Timeline Navigator 应从当前正文内缩范围扩展到 Project shell 的实际左右边界。它可以保留与正文一致的内部 padding，但背景、上下分隔线和 sticky band 必须使用 shell 可用宽度。

- 目标是 Project shell，不是 viewport；
- 禁止 `width: 100vw`；
- 禁止硬编码当前截图像素或以任意 `120%/130%` 宽度猜测；
- 不得制造 document-level 横向滚动；
- Docked bottom player、页面 bottom inset 与 Navigator sticky 互不覆盖。

### 3.2 Expanded

Expanded + Timeline + YT scope 时，Navigator 被定义为 workspace-level global chapter band，而不是左侧正文中的普通卡片。它在视觉上横贯 workspace 的实际可用宽度；正文与右侧 Player 从 band 下方继续各自布局。

推荐实现边界：

1. Navigator 仍只渲染一次，禁止复制 desktop/docked 两份 DOM；
2. 由 Project shell 负责几何，不让 `TimelineNavigator.astro` 猜测 viewport；
3. 使用 shell 与 Navigator 所在内容列的 `getBoundingClientRect()` 计算 breakout left/width，写入 shell-owned CSS custom properties；
4. 初次连接、窗口 resize、Player mode 切换、Timeline view/scope 切换后重新测量；如使用 `ResizeObserver`，只观察 shell／workspace／Navigator 这些必要节点并在 disconnect 时清理；
5. sticky band 高度变化后，`.project-player-column` 的 sticky top 必须位于 Project Nav + Navigator 之后，并由实测高度或同一组 custom properties派生；
6. SP1／SP2 或非 Timeline view 隐藏 Navigator 时，Player offset 恢复既有值；
7. 几何测量失败时降级为当前正文列宽，不允许覆盖 Player 或产生横滚。

允许 agent 在实现前比较“DOM 提升到 workspace 级”与“单 DOM + shell-owned breakout measurement”两种小方案；但不得为了少改文件使用负 z-index、`100vw` 或未经测量的百分比覆盖 Player。若 DOM 提升会破坏 scope panel 的 `aria-labelledby`、hidden 状态或 current Act 查询，则选择 measurement 方案。

### 3.3 层叠与 sticky

- Project Nav 继续是最高的页面导航基准；
- Timeline Navigator 紧随其后；
- Expanded Player sticky top 位于两者之后，不能藏到 Navigator 下方；
- Docked Player 仍在视口底部，不因 Navigator z-index 丢失交互；
- dialog、Search 和现有 overlay 层级不得回归；
- `navigateToAct()` 与 `getTimelineScrollOffset()` 必须用真实 band 高度，Act 标题不能被双 sticky 遮住。

## 4. Segment 信息投影合同

真实 duration ratio 必须保持。不能为了塞进标题给 A03 等短 Act 人为加宽，也不能改成八等分。

- 宽 segment：显示 `Axx` + 当前截断标题；
- 窄 segment：只显示 `Axx`，完整标题通过 tooltip 提供；
- 不允许出现一个或两个汉字加省略号的“坏掉卡片”效果；
- `li` 建立 inline-size container，标题显隐优先用 container query，而不是按固定 Act id 特判；
- 初始阈值建议从 `58px` 实测，不是无需 QA 的永久常量；需要在 1366、1440、901–1200 中间宽度验证后定值；
- button 自身必须有 paint containment 所需的 overflow 防护，但不能裁掉 tooltip。

实现时 tooltip 应作为 `li` 的 sibling/descendant 独立定位，避免把 `overflow: hidden` 放到会裁切 tooltip 的祖先上。

## 5. Tooltip 与可访问性合同

所有 A01–A08 segment 都必须在鼠标 hover 与键盘 focus/focus-within 时显示完整的 `ACT xx · title`。这是一种导航标签提示，不接入 B2 的展开／收起按钮。

- 原完整 `aria-label` 保留，屏幕阅读器不依赖 tooltip；
- tooltip 默认不可见且不接收 pointer events；
- hover 与 `:focus-within` 均可见，键盘路径不得只依赖 `:hover`；
- 第一格向内侧对齐、最后一格向内侧对齐，中间优先居中；
- tooltip 不超出 shell，不被 Navigator、workspace 或 Player 裁切；
- tooltip 文本允许合理换行，但不得盖住当前 focus ring；
- `Esc` 关闭不是本批必需，因为提示只随 hover/focus 存在且不含交互内容；
- native `title` 可作降级，但不能作为唯一可见实现；
- segment button 的 `aria-current="step"`、点击行为与 current header 更新保持不变。

## 6. 固定实施批次

### T1.0 — Baseline and invariant capture

- 记录 branch、HEAD、worktree；
- 记录 1440×900 Expanded、1440×900 Docked、1366×768 Expanded、901px、390×844 的 Navigator/Player 几何；
- 记录 `documentElement.scrollWidth/clientWidth`、Navigator/shell/player bounding rect；
- 抽查 A03 的当前窄投影和 A01/A08 边缘；
- 不改代码，先把证据写入 `docs/qa/komatsu36-rc12/t1/README.md`。

### T1.1 — Geometry

- 只做 shell breakout、sticky offset、resize/mode/scope 响应；
- 验证 Expanded 与 Docked 后提交独立 scoped commit；
- 未通过中间宽度与 Player 不覆盖检查前，不进入 tooltip。

### T1.2 — Narrow projection and tooltip

- 增加 container-based label projection；
- 增加 8 个 visible hover/focus tooltip；
- 保留 aria-label、duration ratio、Act navigation；
- 独立运行键盘、边缘 tooltip 与 overflow 检查后提交。

### T1.3 — Regression and product checkpoint

- 跑完整 `npm run validate`；
- 在构建 preview 的真实 `/projects/komatsu36/` 路由完成 Browser QA；
- 更新 T1 QA README 和 `PRODUCT-CHECKPOINT.md`；
- 只把已执行证据标为 `SOURCE-VERIFIED`／`BROWSER-VERIFIED`，等待用户明确 T1 产品裁决；
- 未得到 `T1: ACCEPT` 前，不写 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`。

## 7. 验收矩阵

| 视口／状态 | 必查项 |
|---|---|
| 1440×900 Expanded + YT | Navigator 左右边界等于 shell；Player 从 band 下方 sticky；A01/A08 tooltip 不越界 |
| 1366×768 Expanded + YT | band 不覆盖 Player；Act 点击后的 header 不被 sticky 遮挡；document overflow 为 0 |
| 1440×900 Docked + YT | band 使用 shell 宽度；底部 Player 与页面末项安全区不回归 |
| 901px 与 1024/1200px 压力点 | A03 等窄 segment 只显示 Axx；tooltip 完整；无半截标题或横滚 |
| SP1 / SP2 | 不显示 8-Act Navigator；scope/Event/native clock 与 Player offset 保持正常 |
| 390×844 | 继续执行既有无 desktop Act Navigator 合同；scope tabs、Player、Event 无回归 |
| 键盘 | Tab 到每个 segment 时 tooltip 可见，focus ring 清楚；Enter/Space 仍按现有 button 语义跳转 |
| history/deep link | Act Navigator 修正不改变 Event URL、Back/Forward、current Act 或 focus restoration |

Browser 记录至少包含：viewport、route、Player mode、scope、Navigator/shell/player rect、scroll width、A03 投影、A01/A03/A08 tooltip、console errors。截图可带 QA 标注，但必须注明标注不属于产品配色。

## 8. 预计文件面与验证器

预计实现文件：

- `src/components/project/TimelineNavigator.astro`：tooltip DOM 与 segment hooks；
- `src/components/project/ProjectArchiveShell.astro`：shell-owned breakout/sticky geometry lifecycle；
- `src/styles/project.css`：global band、container projection、tooltip 和层叠；
- `scripts/validate-publication.mjs`：只在能稳定表达发布合同的情况下增加 T1 静态断言；
- `docs/qa/komatsu36-rc12/t1/README.md`：baseline、source/browser evidence、未执行边界。

不要把 T1 实现混入 `ArchivePlayer.astro` 的 playback 逻辑。若只为 sticky offset 需要 Player hook，应由 shell class/custom property消费，不改变 player API。

最低验证：

```sh
npm run validate
```

静态检查至少保证：8 个唯一 segment、完整 aria-label、8 个 tooltip 文本、duration ratio 样式仍存在、SP1/SP2 panel 不输出 Act Navigator。静态断言不能替代 hover/focus、几何和 overflow Browser QA。

## 9. 后续队列：RC12-Y1 / Y2（本批不实施）

T1 产品停点之后才评估 YouTube 360° handoff。以下登记不构成实现授权。

### Y1 — External handoff（P1 候选）

- 用户主动点击“在 YouTube 360°观看／打开当前时间”时，先清除会导致 onReady 后自动播放的 pending seek，并暂停站内 IFrame Player；
- 暂停应使用 IFrame API 的 `pauseVideo()`，不是为临时 handoff 使用 `stopVideo()`；
- 打开 canonical YouTube URL + 当前 YT Event 时间；
- SP1/SP2 不伪造 timestamp；
- 保留普通外链的 `noopener noreferrer` 安全默认，Y1 不需要 managed WindowProxy。

### Y2 — Managed external session（实验候选）

- 普通网页不能枚举或检测用户任意已有 YouTube 标签页；不得使用“检测到 YouTube”文案；
- 只可在直接用户手势中由 Folio 创建/复用一个命名 browsing context，并持有它返回的 WindowProxy；
- 可用能力只按跨源规则限定为 `closed`、`focus()` 及写入/replace location；不能读 YouTube DOM、当前 URL、播放状态或 360°视角，不能调用原生 YouTube 页面内部 `seekTo()`；
- Timeline 联动只是把该外部页面重新导航到新的 timestamp URL，不是双向 seek 同步；
- 必须有显式 runtime-only `embedded | external-youtube` playback target，不能写入 content schema 或 URL；external 模式下站内 iframe 始终 paused，避免双声道；
- WindowProxy 为 null、popup 被阻止、`closed === true` 或 COOP 切断引用时，显示“窗口未连接/已关闭，重新连接”，不得自动回到 embedded 并突然播放；
- 不得为了 Y2 全站删除 `noopener noreferrer`。managed path 必须独立做威胁评估与 Chromium/Edge 实验；安全或浏览器策略不稳定时降级为 Y1 普通外链。

能力依据：YouTube IFrame API 支持对本页创建的 Player 调用 `pauseVideo()`／`seekTo()`；同源策略只给跨源 Window/Location 极有限访问；`noopener` 会让 `window.open()` 返回 null，COOP 也可能切断 WindowProxy。实施 Y1/Y2 前必须重新核对 [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)、[MDN Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) 与 [MDN Window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)。

## 10. 下一位 agent 启动纪律

1. 全文读取本文，再读取 product correction runbook、PRODUCT-CHECKPOINT、E5 handoff 与当前三个预计实现文件；
2. 先做 T1.0，只以当前 checkout 与真实 Browser rect 为准，不照抄审阅截图像素；
3. 写下本批不改变的 Act/Event/Track/URL/current Act/playback 合同；
4. T1.1、T1.2、T1.3 分批验证和 scoped commit，禁止顺手启动 Y1/Y2；
5. 每批报告 source、browser、product 三种状态与 `NOT EXECUTED` 边界；
6. 不以 payload 目标缩水功能，不把 QA 红/蓝框变成产品颜色，不打开 Release Gate。
