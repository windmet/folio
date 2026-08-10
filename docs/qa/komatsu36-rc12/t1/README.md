# Komatsu36 RC12-T1 QA Ledger

> 状态：`T1.1 INLINE CORRECTION ENGINEERING + BROWSER VERIFIED — PRODUCT REVIEW PENDING`
> 实施入口：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`
> Release Gate：CLOSED

本文是 RC12-T1 的追加式证据账本。第一版 shell-wide T1.1 已被二次产品复核否决；其记录作为历史失败证据保留。当前有效结果是 T1.1 inline correction；T1.2 segment projection/tooltip 保留并重新完成真实本地 Browser 验证，产品接受仍待用户停点。

## T1.0 Baseline

`SOURCE-VERIFIED + BROWSER-VERIFIED`

基线与实现前记录：

- branch / HEAD / worktree；
- 1440×900 Expanded、1440×900 Docked、1366×768 Expanded、901px、390×844；
- route、Player mode、Timeline scope；
- shell / Navigator / Player bounding rect；
- document `scrollWidth` / `clientWidth`；
- A03 窄投影与 A01/A08 边缘状态；
- console error。

截图中的红框／蓝框如用于说明，只能作为 QA overlay，并注明不属于产品配色或 DOM/CSS。

基线观察（实现前）：

- 1440×900：Project shell `left=52.64/right=1372.64/width=1320`；正文 Navigator `left=124.66/right=838.61/width=713.94`；A03 segment `29.74px`，仍显示标题；
- 1366×768：Project shell `left=24.00/right=1327.26/width=1303.26`；正文 Navigator `width=808.29px`；A03 segment `33.79px`，仍显示标题；
- 390×844：桌面 Navigator 由既有移动合同隐藏，页面 `scrollWidth=clientWidth=375`。

## T1.1 第一版 Shell-wide Geometry（历史，REJECTED）

`ENGINEERING/BROWSER VERIFIED AT THE TIME — PRODUCT REJECTED / ROLLED BACK`

实现：`TimelineNavigator.astro` 输出单一 shell geometry hook；`ProjectArchiveShell.astro` 测量 shell/content rect 并在 resize、mode、scope、view 生命周期重算；`project.css` 用测量的负 margin 扩展到 shell，Player sticky top 由 Project Nav + Navigator 高度派生。

Browser 证据：

- 1440×900 Expanded：Navigator `left=52.67/right=1372.60/width=1319.94`；sticky 时 `top=68.99/bottom=171.95`，Player `top=180.00`，间隔 `8.05px`；document `scrollWidth=1425/clientWidth=1425`；
- 1440×900 Docked：Navigator 仍为 shell 宽度 `1319.96px`；Player frame 为固定底栏，`height=72px`，不保留右栏占位；
- 1366×768 Expanded：Navigator `left=24.99/right=1326.28/width=1301.29`，Player sticky top `180px`；
- SP1 scope：Navigator `hidden=true`、rect 为 0，geometry 回到 `inline`，shell 上的 T1 margin/sticky variables 清空；
- Overview/People：T1 variables 清空，页面横向宽度保持无溢出。

## T1.2 Segment projection and tooltip（实现保留；下列尺寸为第一版历史证据）

`SOURCE-VERIFIED + BROWSER-VERIFIED`

实现：8 个 segment 保持真实 `--timeline-act-ratio`；`@container (max-width: 58px)` 下只显示 Axx；每个 segment 输出 `role="tooltip"` 的完整 `ACT xx · title`，原 `aria-label` 保留。

Browser 证据：

- 1440×900 全 shell 后 A03 为 `55.75px`；1366×768 A03 为 `54.96px`，两者均只显示 `A03`；
- A03 键盘 focus 后 tooltip `visibility=visible/opacity=1`，文本为 `ACT 03 · 礼物、俄罗斯章鱼烧与 Big Dream`；
- A01 tooltip `left=24.99/right=178.58`，A08 tooltip `left=1149.73/right=1326.27`，均在 shell `24.00–1327.26` 内；
- 真实发布 HTML 输出 8 个 segment、8 个 tooltip、8 个 duration-ratio style，静态合同通过；
- Enter/Space 仍使用原 button 导航语义，current Act 更新与事件深链未改变。

## T1.3 第一版 Regression（历史证据）

`SOURCE-VERIFIED + BROWSER-VERIFIED`

验证命令：

```sh
npm run validate
npm exec -- tsc --noEmit
```

结果：项目、Reader Copy、Astro build、publication、TypeScript 全部通过；publication raw HTML `293,095 bytes`、158 search items、3 Timeline scopes、12 B2 expandable contracts、8 T1 segments/tooltips；Browser 真实路由为 `http://127.0.0.1:4322/projects/komatsu36/`，固定 1440×900、1366×768、901×700、390×844 已复核，console error/warn 为空，document overflow 为 0，事件深链 `?view=timeline&event=yt-042252-seigura-superchat` 恢复正确。

## T1.1 二次裁决与 Inline Correction（当前有效）

`SOURCE-VERIFIED + BROWSER-VERIFIED — PRODUCT REVIEW PENDING`

二次产品复核裁决：shell-wide breakout `REJECTED`；窄 segment `ACCEPT / PASS`；现有 tooltip 保留并做 consumer check。实现已删除 `applyTimelineNavigatorGeometry()`、动态 margin custom properties、`data-timeline-geometry` 和由 Navigator 高度派生的 Player sticky top；Expanded Player 恢复独立 `top: 96px`，Navigator 增加左右 `14px` safe inset。

真实路由 `http://127.0.0.1:4322/projects/komatsu36/?view=timeline` 的自动交互验证：

- 1366×768 Expanded：content/Navigator `left=64.97/right=888.06/width=823.09`，Player `left=929.03`，safe inset `14/14px`；A03 `33.22px`、title hidden、Axx centered；
- 1440×900 Expanded：content/Navigator `left=103.19/right=922.81/width=819.63`，Player `left=964.81`，safe inset `14/14px`；A03 `33.08px`；
- 1920×1080 Expanded：content/Navigator `left=396/right=1058/width=662`，Player `left=1134`，safe inset `14/14px`；A03 `26.31px`；
- Docked 三档 Navigator 均随单列 content 自然增宽为 `1236.06 / 1233.63 / 1128px`，Player frame 均为 `72px` 固定底栏，无 shell breakout attribute；
- 三档 Expanded/Docked 的 document overflow 均为 0，console error/warn 均为空；
- A01/A03/A08 的 mouse hover 与 keyboard focus 均得到 `visibility=visible/opacity=1` 的完整 `ACT xx · title`；首尾 tooltip 均未越出 viewport；
- 页面截图输出到 Codex visualizations 的 `rc12-t1-inline/`，截图无红／蓝产品标注。

验证器：`node scripts/verify-rc12-t1-inline-browser.mjs <screenshot-output-dir>`。应用内 Browser 首次调用因宿主目录 `EPERM` 无法建立控制连接，故按前端测试 fallback 使用仓库 Playwright；这不是页面失败。

本轮门禁：`npm run validate`、`npm exec -- tsc --noEmit`、`npm run audit:payload -- komatsu36`、`git diff --check` 均通过；publication raw HTML `293,123 bytes`，350 KiB 余量 `65,277 bytes`。

## Product checkpoint

`PRODUCT REVIEW PENDING`

工程与 Browser 证据不能代替产品裁决。只有用户明确回复 `T1：ACCEPT` 才能标记 T1 `PRODUCT-ACCEPTED`。T1 接受不自动关闭 RC12-E 产品停点，不授权 Y2、真实媒体、merge、deploy 或 Release Gate；Y1 另有独立产品停点。

## 未执行边界

- 真实 YouTube 媒体播放、长时 soak、360°视角和生产环境未执行；
- Y1 已作为独立批次实现，证据见 `docs/qa/komatsu36-rc12/y1/README.md`；Y2 外部 managed session 未实施；
- 未将审阅红/蓝框作为产品 CSS 或颜色 token；
- 当前仍不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`。
