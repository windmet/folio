# Komatsu36 RC12-T1 QA Ledger

> 状态：`T1.1/T1.2 ENGINEERING + BROWSER VERIFIED — PRODUCT REVIEW PENDING`
> 实施入口：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`
> Release Gate：CLOSED

本文是 RC12-T1 的追加式证据账本。T1.1 几何与 T1.2 segment projection/tooltip 已完成工程和真实本地 Browser 验证；T1.3 完整回归已执行，产品接受仍待用户停点。后续 agent 不得用 RC12-E 或旧 R5 Navigator 截图替代本批证据。

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

## T1.1 Geometry

`SOURCE-VERIFIED + BROWSER-VERIFIED`

实现：`TimelineNavigator.astro` 输出单一 shell geometry hook；`ProjectArchiveShell.astro` 测量 shell/content rect 并在 resize、mode、scope、view 生命周期重算；`project.css` 用测量的负 margin 扩展到 shell，Player sticky top 由 Project Nav + Navigator 高度派生。

Browser 证据：

- 1440×900 Expanded：Navigator `left=52.67/right=1372.60/width=1319.94`；sticky 时 `top=68.99/bottom=171.95`，Player `top=180.00`，间隔 `8.05px`；document `scrollWidth=1425/clientWidth=1425`；
- 1440×900 Docked：Navigator 仍为 shell 宽度 `1319.96px`；Player frame 为固定底栏，`height=72px`，不保留右栏占位；
- 1366×768 Expanded：Navigator `left=24.99/right=1326.28/width=1301.29`，Player sticky top `180px`；
- SP1 scope：Navigator `hidden=true`、rect 为 0，geometry 回到 `inline`，shell 上的 T1 margin/sticky variables 清空；
- Overview/People：T1 variables 清空，页面横向宽度保持无溢出。

## T1.2 Segment projection and tooltip

`SOURCE-VERIFIED + BROWSER-VERIFIED`

实现：8 个 segment 保持真实 `--timeline-act-ratio`；`@container (max-width: 58px)` 下只显示 Axx；每个 segment 输出 `role="tooltip"` 的完整 `ACT xx · title`，原 `aria-label` 保留。

Browser 证据：

- 1440×900 全 shell 后 A03 为 `55.75px`；1366×768 A03 为 `54.96px`，两者均只显示 `A03`；
- A03 键盘 focus 后 tooltip `visibility=visible/opacity=1`，文本为 `ACT 03 · 礼物、俄罗斯章鱼烧与 Big Dream`；
- A01 tooltip `left=24.99/right=178.58`，A08 tooltip `left=1149.73/right=1326.27`，均在 shell `24.00–1327.26` 内；
- 真实发布 HTML 输出 8 个 segment、8 个 tooltip、8 个 duration-ratio style，静态合同通过；
- Enter/Space 仍使用原 button 导航语义，current Act 更新与事件深链未改变。

## T1.3 Regression

`SOURCE-VERIFIED + BROWSER-VERIFIED`

验证命令：

```sh
npm run validate
npm exec -- tsc --noEmit
```

结果：项目、Reader Copy、Astro build、publication、TypeScript 全部通过；publication raw HTML `293,095 bytes`、158 search items、3 Timeline scopes、12 B2 expandable contracts、8 T1 segments/tooltips；Browser 真实路由为 `http://127.0.0.1:4322/projects/komatsu36/`，固定 1440×900、1366×768、901×700、390×844 已复核，console error/warn 为空，document overflow 为 0，事件深链 `?view=timeline&event=yt-042252-seigura-superchat` 恢复正确。

## Product checkpoint

`PRODUCT REVIEW PENDING`

工程与 Browser 证据不能代替产品裁决。只有用户明确回复 `T1：ACCEPT` 才能标记 T1 `PRODUCT-ACCEPTED`。T1 接受不自动关闭 RC12-E 产品停点，不授权 Y1/Y2、真实媒体、merge、deploy 或 Release Gate。

## 未执行边界

- 真实 YouTube 媒体播放、长时 soak、360°视角和生产环境未执行；
- Y1/Y2 外部 YouTube handoff 未实施；
- 未将审阅红/蓝框作为产品 CSS 或颜色 token；
- 当前仍不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`。
