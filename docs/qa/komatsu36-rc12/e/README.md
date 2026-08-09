# RC12-E Source-scoped Timeline QA

> 批次：RC12-E E1–E3
> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；`PRODUCT-ACCEPTED` 待人工停点
> 日期：2026-08-10
> 路由：`/projects/komatsu36/?view=timeline`
> 本地预览：`http://127.0.0.1:4322`
> 实施入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本批将 RC12-E 从只读提案推进到第一版 source-scoped Timeline：Timeline 内新增 YT／SP1／SP2 scope switch；YT 保留 8 Act 主线，SP1／SP2 各自渲染 native-clock Event projection；现有 Source card、Source Event Index、external source 和 URL 状态合同继续保留。

## 实施范围

- `ProjectArchiveShell.astro` 增加 `timelineScopeId`、scope button binding、scope panel visibility、URL/history 与 selected Event 同步；`selectEvent`／`switchTrack` 不创建第二个媒体实例。
- `SourceTimeline.astro` 复用 `TimelineEvent`、Person 与 Thread 入口，按同一 track 的 `startMs` 升序渲染 SP1／SP2 的公开 Event。
- 三条 track 的 controller projection 显式携带 `clock: native`；publication validator 校验三 track 的公开 Event membership、稳定排序、native clock 和 3 buttons／3 panels wiring。
- CSS 为桌面、中等宽度和 390px 移动宽度提供 scope 层级；移动端使用三列紧凑 tabs，不把 scope 变成纵向大块信息堆叠。

## Browser 验证矩阵

| 场景 | 结果 |
|---|---|
| 1440×900 初始 Timeline | 3 个 scope button；YT `aria-pressed=true`、YT panel 可见、SP1／SP2 panel 隐藏；YT 主线 8 Act／104 Event；document overflow `0` |
| 1440×900 切换 SP1 | URL `?view=timeline&track=space-1`；SP1 panel 可见、YT panel 隐藏；8 个 Event，首项 `00:02:40`；Player label `X Space ①`；overflow `0` |
| SP1 Event 深链 | 点击 `sp1-000240-audio-finally-live` 后 URL 为 `?view=timeline&event=sp1-000240-audio-finally-live`；选中卡片、TARGET 文案和 scope 同步；无 iframe |
| SP1 Back／Forward | Back 恢复 `track=space-1` 且无 selected Event；Forward 恢复 SP1 Event 深链；scope 与 Player label 同步 |
| SP2 直接 scope | `?view=timeline&track=space-2`；12 个 Event，首项 `sp2-000003-finally-vertical`／`00:00:03`；Player label `X Space ②`；无 iframe；overflow `0` |
| 切回 YT | URL 回到无 `track` 的 Timeline；YT panel 可见，8 Act／104 Event；SP2 panel 隐藏；Player label `YouTube 主直播` |
| 901×780 中等宽度 | scope button 约 `122px`、SP1 Event card 约 `382px`、Player 约 `372px`；document overflow `0` |
| 390×844 | 3 个 scope tabs 各约 `109×74px`，scope block 约 `159px`；无横向 overflow；SP1 仍可触控切换并显示 8 个 Event |
| Console | 页面 `error/warn = []`；Browser 工具自身 Statsig dropped-events warning 不属于页面 console，不纳入产品错误证据 |
| Scope focus indicator | 点击 scope 后焦点仍落在原生 button；计算样式含红色 `outline` 与 `outline-offset`；无横向 overflow |

## 自动门禁

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
git diff --check                         PASS
```

最新产物：raw HTML `291,352` bytes；Gzip `50,579`；Brotli `32,005`；350 KiB hard gate 余量 `67,048`。publication validator 通过 `12` 个 RC12-B2 expandable title contracts、`3` 个 RC12-E timeline scopes、`124` 个 controller Event records、三 track native-clock projection 和 private-marker gate；scope button 的 native `type=button`、`aria-pressed`、`aria-controls`、`aria-label` 合同也由静态门禁校验。

## 未执行与产品停点

- `NOT EXECUTED`：真实 YouTube／X Space 播放、真实音频、长时 soak、生产 origin、生产部署和 Release Gate。
- `NOT EXECUTED`：E4 最终视觉收尾与 E5 完整 handoff；本 README 只覆盖 E1–E3 第一版。
- `NOT EXECUTED`：Browser 驱动的键盘激活消费检查。当前 Browser surface 的 `press`／CUA keypress 对现有 view-nav 与新增 scope button 均只完成聚焦、未触发 click；因此不将其写成键盘消费通过，native button 与 ARIA 合同仅作 source/static verified。
- 工程与 Browser 证据不自动升级为 `PRODUCT-ACCEPTED`；需要用户在桌面与 390px 人工复核 scope 的信息层级、时间语义和事件密度。
- 不把 Source Event Index 或 Source card 能力替代为 RC12-E；三条来源仍必须保持各自 native local clock。
