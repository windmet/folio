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
| 390×844（Playwright Chromium） | 3 个 scope tabs 各 `114×74px`，scope block `159px`；无横向 overflow；SP1 仍可触控切换并显示 8 个 Event |
| Keyboard Enter／Space／focus restore（Playwright Chromium） | 1440×900：Enter 激活 SP1、Space 激活 SP2；URL、`aria-pressed`、当前 scope 和焦点同步；Back 恢复 SP1 且焦点回到 SP1 button；页面 console 为空 |
| Console | 页面 `error/warn = []`；Browser 工具自身 Statsig dropped-events warning 不属于页面 console，不纳入产品错误证据 |
| Scope focus indicator | 点击 scope 后焦点仍落在原生 button；计算样式含红色 `outline` 与 `outline-offset`；无横向 overflow |

## 自动门禁

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
git diff --check                         PASS
node scripts/verify-rc12-e-browser.mjs   PASS
```

最新产物：raw HTML `291,492` bytes；Gzip `50,601`；Brotli `32,015`；350 KiB hard gate 余量 `66,908`。publication validator 通过 `12` 个 RC12-B2 expandable title contracts、`3` 个 RC12-E timeline scopes、`124` 个 controller Event records、三 track native-clock projection 和 private-marker gate；scope button 的 native `type=button`、`aria-pressed`、`aria-controls`、`aria-label` 合同，以及 panel 的 `aria-hidden`／`aria-labelledby` 和动态描述的 `aria-live=polite` 合同也由静态门禁校验。

## 未执行与产品停点

- `NOT EXECUTED`：真实 YouTube／X Space 播放、真实音频、长时 soak、生产 origin、生产部署和 Release Gate。
- 本 README 只覆盖 E1–E3 第一版；E4/E5 完整工程／Browser handoff 见同目录 `E5-HANDOFF.md`。
- 本地 Browser surface 的 `press`／CUA keypress 仍只完成聚焦；但真实 Playwright Chromium 已完成 Enter／Space 消费回归，故不再把键盘行为标为未验证。两者差异仅作为工具边界记录，不作为产品错误证据。
- 工程与 Browser 证据不自动升级为 `PRODUCT-ACCEPTED`；需要用户在桌面与 390px 人工复核 scope 的信息层级、时间语义和事件密度。
- 不把 Source Event Index 或 Source card 能力替代为 RC12-E；三条来源仍必须保持各自 native local clock。
