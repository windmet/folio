# Komatsu36 RC12-E Source-scoped Timeline Proposal

> 状态：`ACTIVE IMPLEMENTATION — E4/E5 ENGINEERING HANDOFF DRAFT`
> 日期：2026-08-10
> 适用项目：`komatsu36`
> 权威入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本文把 RC12-E 需要实施的最小合同、数据边界和验证批次写清楚。用户此前的“继续吧”被作为启动下一批的范围确认；E1–E3 已完成第一版实现与本地 Browser 验证，E4 focus indicator 与 E5 工程回归已形成 handoff 草案，但键盘激活、产品停点和真实媒体边界仍未关闭。本提案不能把现有 Source Event Index、来源图标或 Source card 误报成 Source-scoped Timeline。

## 1. 当前代码与数据基线（只读审计）

| 项目 | 当前事实 | 证据 |
|---|---|---|
| Track | `yt-main`、`space-1`、`space-2` 共三条；三条 `clock` 都是 `native` | `src/content/projects/komatsu36/tracks/*.json` |
| 时长 | YT `17,846,000ms`；SP1 `2,618,000ms`；SP2 `10,571,000ms` | 同上 |
| 公开 Event | YT `104`、SP1 `8`、SP2 `12`，合计 `124` | `src/content/projects/komatsu36/events/*.json`，排除 `withheld` |
| 当前 Timeline | 只渲染按 `order` 排序的 8 个 Act 及其 YT Event；页眉明确为 `YT NATIVE CLOCK` | `ProjectArchiveShell.astro` + `TimelineNavigator.astro` |
| 当前 Source Event Index | 三个 track 各自有惰性 list host；点击 Source card 后按 track 生成 Event button | `MediaSourceNavigator.astro` + `ProjectArchiveShell.astro` |
| 当前 URL | `view`、`event`、`track`、`thread`；有 Event 时由 Event 推导 track，裸 `track` 表示无 Event 的来源选择 | `ProjectArchiveShell.writeUrl()` / `restoreFromUrl()` |
| 当前播放器 | 仅 YouTube track 创建 YouTube mount；X Space 保留 external source 合同，不创建伪播放器 | `ProjectArchiveShell.ensurePlayer()` |

当前可证明的是三条来源拥有独立数据和本地时钟；当前不可证明的是“同一 Timeline 已按来源切换”。E 必须补足后者。

## 2. E 的产品合同

### 2.1 Scope switch

在现有 Timeline 内容区增加一个明确的来源范围切换器，最小选项固定为：

- `YT`／YouTube 主直播；
- `SP1`／X Space ①；
- `SP2`／X Space ②。

默认 scope 继续为 `yt-main`，不能因为 E 上线而改变现有首屏。Source card 的播放／打开原来源／浏览事件动作继续存在；scope switch 是 Timeline 内的新入口，不替代 Source navigator。

每个 scope 必须同时暴露：平台短码、完整来源名称、事件数量、时钟说明（例如 `NATIVE CLOCK`）和当前选中状态。按钮必须使用 `aria-pressed`，键盘和 390px 触控路径与现有 view nav 一致。

### 2.2 Source-local clock

- Event 的 `startMs`、`endMs` 直接解释为所选 track 的 native local clock；不计算、展示或保存跨来源 offset。
- 时间格式化必须复用现有 `formatTime` 语义，不能把 SP1／SP2 的秒数投影到 YT 的五小时轴。
- scope 页眉应明确写出当前来源和 `NATIVE CLOCK`，避免读者误以为三条媒体被拼成一个全局时间线。
- Event 顺序为同一 track 内 `startMs` 升序，再以稳定 Event id 作为并列排序键。

### 2.3 Event projection

- `yt-main` scope 保留现有 8 Act / 104 Event 主时间线，不重写已有 Act、Thread、Person 或 Event 内容。
- `space-1`／`space-2` scope 不伪造 Act。应显示来源摘要、native duration 和该来源的 Event list；如果未来需要分组，必须使用 source-local section，不得沿用 YT Act 名称。
- 每个 Event 继续使用现有 Event target、摘要、标签和 Thread 入口；跨来源 Thread 仍由 Event 自己决定 track 和本地时间。
- 点击 Event 后进入既有选中／Player context 路径；外部来源只显示 `EXTERNAL SOURCE` 能力边界，不创建 YouTube iframe。

### 2.4 URL and history

建议沿用现有参数而不是新增第二套状态协议：

```text
/projects/komatsu36/?view=timeline
/projects/komatsu36/?view=timeline&track=space-1
/projects/komatsu36/?view=timeline&event=sp1-000240-audio-finally-live
```

- 无 Event 时，`track` 表示 Timeline scope；刷新后必须恢复同一 scope。
- 有 Event 时，Event id 是权威来源；其 track 必须与 scope 同步，不能出现 Event 属于 SP1 而 Source scope 显示 SP2 的组合。
- scope 切换产生一次可回退的 history entry；同一 scope 的惰性 Event list 构建不能写 URL。
- Back／Forward、直接深链和刷新必须恢复 scope、选中 Event、Source selection、Player label 和外部／站内能力状态。
- 不得写入跨平台 offset、播放器当前秒数或私有 transcript 信息。

## 3. 实施批次

### E1 — 数据投影与静态合同

1. 从现有 controller data 派生 `eventsByTrack`，只保留公开 Event；不复制一份编辑真值。
2. 给 scope selector 和 source-local projection 定义稳定 `data-*`、DOM id、`aria-controls`／`aria-pressed` 合同。
3. 为 publication validator 增加三条 track 的事件数、顺序、无 withheld Event 和 no-offset 断言。

### E2 — Timeline scope UI

1. 在 Timeline header 下增加 scope switch 和当前来源说明。
2. YT scope 复用既有 Act layout；SP1／SP2 使用 source-local Event list projection。
3. 保留 Source Event Index 作为独立入口，避免同一按钮既改变 scope 又展开 Index。

### E3 — Controller、URL 与播放器

1. 将 scope 状态纳入 `showView`、`switchTrack`、`selectEvent`、`writeUrl`、`restoreFromUrl` 的单一状态路径。
2. scope 切换清理不属于当前 track 的 selected Event，但不销毁／重建已有 YouTube mount。
3. external track 继续走既有 fallback／canonical link；不得调用 `ensurePlayer()` 创建空白 iframe。

### E4 — Responsive and accessibility

1. 1440×900：scope switch 与 Source card、Timeline navigator 的层级清楚，不增加右栏纵向堆叠。
2. 901px 中等宽度：不产生横向 overflow，Event list 不把 Player 推出视口。
3. 390×844：scope switch 可触控，当前来源、时钟和 Event target 仍可读；不遮挡底部安全区、dialog 或移动 Player。
4. 键盘 Tab、Enter／Space、`aria-pressed`、focus restoration 和 screen-reader label 需要单独记录。

### E5 — 验收与交接

必须分别记录 `SOURCE-VERIFIED`、`BROWSER-VERIFIED`、`PRODUCT-ACCEPTED`，并执行：

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
git diff --check
```

Browser 至少覆盖：

- 三个 scope 的直接 URL、刷新和 Back／Forward；
- YT 事件 `yt-000100-stream-start` 与 SP1／SP2 事件深链；
- source-local 时间显示、事件数量、排序和 no-offset 断言；
- YT mount 计数不增加，切到 SP1／SP2 不出现伪 iframe；
- 1440×900、901px 附近和 390×844 的 console／overflow／focus 检查。

真实音频、长时播放、生产 origin 和 Release Gate 仍是独立未执行边界；本地 Browser preview 不得升级这些状态。

## 4. 明确不做

- 不统一三条来源的时钟，不猜测 `G-01`／`G-02` offset；
- 不把 SP1／SP2 强行塞进 8 个 YT Act；
- 不删除 Source Event Index、external source CTA、既有 `?track=` 合同或现有 Thread／Person 关系；
- 不修改 Event／Act／Track 的 reader-facing 真值来制造 demo 长度或排序；
- 不在没有用户明确授权时修改实现、公开状态、merge、deploy 或 Release Gate。

## 5. 当前启动记录与剩余条件

E1–E3 已在当前 review branch 启动并完成第一版；基础矩阵见 `docs/qa/komatsu36-rc12/e/README.md`，E4/E5 工程回归交接见 `docs/qa/komatsu36-rc12/e/E5-HANDOFF.md`。键盘激活、产品停点、真实媒体、生产部署和 Release Gate 仍未关闭。
