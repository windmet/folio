# Komatsu36 RC 0.11 档案导航与视觉层级实施规格

> 状态：UX11-A / B COMMITTED；UX11-C LOCAL ACCEPTANCE COMPLETE / NEXT: UX11-P STATIC PAYLOAD PASS
> 阶段：RC 0.11 — Archive Navigation & Visual Hierarchy Pass
> 基线：`codex/komatsu36-project-archive`，RC 0.10 本地验收完成；UX11-A / B 基线提交 `effa314`
> 范围冻结：不新增 Event、Person 字段、媒体 provider、Transcript、Evidence 或 X widget。

## 1. 阶段目标

RC 0.10 已经解决“档案里有没有足够且可信的信息”。RC 0.11 只解决读者如何：

1. **Orientation**：知道自己位于五小时活动的哪一段；
2. **Context**：从当前媒体节点回到它所属的 Timeline 或 Storyline；
3. **Progressive disclosure**：列表只回答“为什么这个人在本组”，详情再解释完整项目语境。

本轮不是新的 Editorial Pass，也不继续扩充材料。它是对现有五个 View 之间的导航闭环和信息层级进行收口。

## 2. 2026-08-09 实施前本地核对

核对使用长期运行的 `http://127.0.0.1:4321/projects/komatsu36/`，未重启或更换开发端口。

| 审计判断 | 本地证据 | 裁决 |
|---|---|---|
| People 信息正确但密度过高 | 页面按三个组共渲染 21 张 `PersonCard`；同一人跨组重复。桌面 1440px 下三列单卡约 230px 宽、285–332px 高；卡内同时出现全部 participation、完整 `projectContext` 与节点数 | **采纳**：这是列表投影问题，不是 Person 数据不足 |
| People 缺少 2 列 breakpoint | 当前确为 `>900px` 三列、`<=900px` 一列 | **不单独修补**：compact index 会改变布局合同；不得先为即将删除的重卡片补临时 breakpoint |
| 390px Cast 造成页面横向溢出 | 390×844 下页面 `scrollWidth === clientWidth === 375`，没有页面级横向 overflow；但 `.cast-matrix-wrap` 为 343px，内部表格固定 520px，必须横向滚动 | **修正定性后采纳**：不是既有 overflow gate 回归，而是移动端关系表需要横滚、与“六行直接阅读”的目标不一致 |
| Person / Search 已具备完整事件导航 | 两处都能切 View、选 Event、更新 Player；但代码各自重复分支，且不滚动到 Timeline Event | **部分成立**：有选择能力，没有完成上下文定位事务 |
| Player 是播放终点，没有上下文回链 | `ArchivePlayer` 只有 TARGET、原来源链接和来源说明，没有 Timeline / Storyline CTA | **采纳，P0** |
| YT Event 可自动滚进 Timeline | 从濱健人详情点击 `yt-024207-controlled-adlib` 后，Timeline 已激活、Player 正确显示 `02:42:07`，但目标卡仍在约 12725px 处，当前滚动位置约 1552px | **当前不成立，列为 P0 缺口** |
| 浏览器 Back 可回原 View / Panel | 实测返回时 URL 被改写成 `?view=people&event=yt-024207-controlled-adlib`，没有恢复 `person=hama-kento`；`restoreFromUrl()` 应用无 Event 的历史项前没有清空旧 `selectedEventId` | **当前不成立，列为 P0 状态缺陷** |
| Timeline 缺少全局空间感 | 移动端共有 104 张 YT Event 卡；8 个 Act 单段页面高度约 1362–4923px；Timeline 内没有 sticky / current-Act 控件 | **采纳** |
| Space Event 可以总是直接打开唯一 Thread | 20 个 Space Event 都有关联 Thread，但 `sp1-004324-space-restart` 同时属于 `muro-account` 与 `space-technical-hell` | **需要多关联分支**：不得任取第一条 Thread |
| Timeline Map 可直接显示播放头 | 播放器每 750ms 已读取 current time，但目前只在 controller 内更新时钟与 Event，没有公开 map 状态接口 | **技术可行，非首批低成本项** |

这轮浏览器事实不推翻 RC 0.10 的“390px 无页面级 overflow”验收；Cast 的内部横滚属于新的可读性要求。

### 2.1 UX11-A / B 本地完成检查点

2026-08-09 第一批已提交为 `effa314`：

- UX11-A：People index 已改为按 `group` 投影的 compact row；Cast 在 `<=600px` 改为六个角色的昼夜行，不再依赖组件内部横滚；
- UX11-B：Person / Search / Player 已共用 `navigateToEventContext()`；YT Event 可稳定定位并聚焦 Timeline card；Space 覆盖 0 / 1 / many Thread；`restoreFromUrl()` 先清空旧内存态再恢复，Back / Forward 可回到原 Person panel；
- desktop 1440×900 与 mobile 390×844 已完成真实路由、overflow、focus、history 与 console 验收；
- `npm run validate`、`npm exec -- tsc --noEmit` 与 `git diff --check` 已通过；publication 输出为 352,541 bytes，仍受 350 KiB（358,400 bytes）硬门禁约束。

UX11-C 此后按完整产品合同实施，并没有为迁就 350 KiB 缩减功能。包含四枚标签、Act jump、Thread 0 / 1 / many、左向菜单、原链、到达反馈、compact desktop 与 mobile fallback 的完整构建为 353,913 bytes，仍低于 358,400-byte hard gate。UX11-P 继续作为下一项 P0 工程治理，但不再被描述为 Rail 的前置阻塞；它只移除工具型重复投影，不能以减重名义删除已验收交互。完整合同见 `docs/editorial/komatsu36-static-payload-pass.md`。

## 3. People 页：按分组投影，不复制详情

### 3.1 列表与详情职责

```text
People index        谁在当前分组、为什么属于这里
Person panel        完整 projectContext、全部 participation、links
Event / Storyline   具体发生了什么
```

`PersonCard` 不再作为三个组共用的满载卡片。新实现使用一个 compact row / index 组件，并显式传入当前 `group`；组件只读取与该组相关的 participation。

### 3.2 各组的可用投影

| 分组 | 列表主信息 | 可由现有 schema 可靠得到 |
|---|---|---|
| ORE-SHIRI CAST | 角色 × 昼夜矩阵 | `character`、`sessions` |
| PRODUCTION / ACTION | 姓名、正式 credit、ensemble | `production.credit`、`ensemble.kind` |
| BIRTHDAY LIVE | 姓名、与本组同时相关的 Cast / production 摘要、节点数 | `birthday-live`、现有 structured participation、反向 Event 计数 |
| X SPACE / REMOTE | 姓名、SPACE GUEST / REMOTE CALL / ACCOUNT APPEARANCE、节点数 | participation `kind` |

不得从 `projectContext` 解析“观剧朋友”“第二批来宾”等临时标签。当前这些语义只存在于散文中；若列表确实需要它们，应另开内容模型决策，而不是字符串切割。RC 0.11 首版允许 Birthday Live 仅显示姓名、已结构化的交叉身份和节点数。

`projectContext`、reading、全部 chips 与 aliases 只留在 Person panel。列表点击仍打开同一个 Person，不复制实体。

### 3.3 Cast 移动合同

- 桌面保留三列表格；
- `<=600px` 使用六个角色的 definition rows / cards，每行包含角色、昼、夜；
- 人名仍是可访问按钮并打开 Person panel；
- 不缩小到难读字号，不依赖横向拖动；
- 验收同时检查页面级与组件级 overflow。

推荐保留原生 table markup 作为桌面结构，并在窄屏用 CSS 改变 `thead`、`tr`、单元格的布局；若语义与视觉冲突，再由组件输出两个互斥且 aria 安全的表示，不用 JavaScript复制数据。

## 4. Event 上下文导航事务

### 4.1 单一入口

抽出 controller 方法：

```ts
navigateToEventContext(eventId, {
  origin: 'person' | 'search' | 'player',
  preferredThreadId?: string,
})
```

它负责：

1. 读取 Event 与 `threadIds`；
2. 关闭 Search / Person / Thread overlay，但保留本次历史来源；
3. YT → `Timeline`，选中并滚动到 Event；
4. Space → `Storylines`，按下面规则打开或选择 Thread；
5. 最后一次性写入 URL；
6. 把焦点移到目标上下文的可读标题或 Event 卡，而不是播放器 iframe。

`selectEvent()` 继续只负责“选择 Event、切 Track、更新 Player、可选 seek”，不得决定 View、Thread 或滚动。Person、Search、Player 全部调用同一导航方法，不再保留三套分支。

### 4.2 YT 行为

Player 按钮文案：`在 Timeline 查看此节点 →`。

导航完成后：

- URL 为 `?view=timeline&event={id}`；
- 目标 Event 进入可见区域，并考虑 sticky Project Nav / mini-player 的遮挡；
- Event 使用现有 `.is-active` 高亮；
- `scrollIntoView()` 前暂时禁用全局 smooth scroll，或使用明确的 instant 定位，避免从页面顶部演出长距离滚动动画；
- 用户主动点击 Act / Event 可以产生一次 history entry；播放器每 750ms 的自动同步只能 `replaceState`，不能污染 Back 栈。

建议给 `.timeline-event` 配置 `scroll-margin-top`，桌面按 Project Nav 高度，移动端按 Project Nav + 当前 mini-player 实际高度计算。不要硬编码只适合一个 viewport 的绝对值。

### 4.3 Space 行为

Player 按钮文案：`在 Storyline 查看上下文 →`。

- 1 条 Thread：直接打开；
- 多条 Thread：在 Context Dock 内显示可选的 Thread 列表，再由读者选择；
- 0 条 Thread：保持在 Source Event Index，并明确“该节点暂无事件线”，不能打开任意 Storyline。

当前数据中 20 个 Space Event 均至少有一条 Thread，只有 `sp1-004324-space-restart` 有两条。实现仍必须覆盖 0 / 1 / many，避免把当前数据巧合写成控制器假设。

### 4.4 URL 与 Back 的原子性

`restoreFromUrl()` 必须先把内存态重置到 URL 可完整重建的基线：

```text
selectedEventId = null
selectedThreadId = null
selectedPersonId = null
activeTrackId = defaultTrackId
```

再按 `event > track` 和 panel 参数恢复。恢复过程不得调用会产生新 history entry 的方法，也不得用旧内存态覆盖刚返回的 URL。

验收序列必须包含：

```text
People → Person(hama-kento) → YT Event(02:42:07)
→ Timeline 目标可见
→ Back
→ People + Person(hama-kento) 恢复
→ Forward
→ 同一 Timeline Event 恢复且可见
```

还要覆盖 Search → Space Event → Thread → Back，以及播放器自动推进后 Back 栈长度不增长。

## 5. Static Payload / Initial HTML Budget

350 KiB 是 Folio 自己的 initial HTML 门禁，不是 Cloudflare Pages 的平台上限。`effa314` 构建基线为：

| 指标 | 当前值 |
|---|---:|
| Raw HTML | 352,541 bytes / 344.28 KiB |
| Gzip level 9 | 68,711 bytes / 67.10 KiB |
| Brotli quality 11 | 35,342 bytes / 34.51 KiB |
| Search section | 73,355 raw bytes / 158 hidden items |
| Source Event Index | 24,973 raw bytes / 124 static buttons |
| Controller JSON | 22,090 raw bytes |

Search 与 Source Event Index 两个工具型 section 毛体积合计约占 raw HTML 的 27.9%。它们优先退出初始 DOM；Timeline、Thread detail 与 Person detail 继续静态渲染。当前 350 KiB hard gate 暂不放宽，compressed size 只作为传输指标，不能替代 raw / DOM 指标。

后续 Payload 实施顺序固定为：

1. UX11-P0：加入可重复的 raw / gzip / brotli 与 projection audit；
2. UX11-P1：Source Event Index 改为复用 controller events 首次展开时生成；
3. UX11-P2：Search 改为 Astro build-time static JSON + first-use lazy fetch；
4. 重测并写回新基线；UX11-C 已独立完成，不等待本 Pass，也不因本 Pass 回退。

不得在本 Pass lazy-load Timeline、Thread 或 Person，也不得引入 React、SSR、数据库、Pagefind 或拆 View 路由。详细字段、fallback、validator、提交边界与浏览器验收见 `docs/editorial/komatsu36-static-payload-pass.md`。

## 6. ArchivePlayer Context Dock → Desktop Player Context Rail

### 6.1 已完成的 Context Dock 基线

UX11-B 已在选中 Event 时新增轻量上下文区：

```text
TARGET · 02:42:07
ACT 05 · 《俺知》复盘、俳句与迟到的回收
熊谷的喜剧名场面揭开“受控即兴”
[在 Timeline 查看此节点 →]
```

当前实现没有把 Act 标题重复序列化进 controller data。YT 的 Act label / title 从现有 `[data-act]` Timeline DOM 派生；external Event 只保留导航需要的 `threadIds`。这是有意的 publication-budget 决策，不应回退为下面这种全量投影：

```ts
events[eventId] = { ...existing, actId, actOrder, actTitle, threadIds }
```

Space Event 不显示伪 Act；显示 Track label 与 Thread 选项。无选中 Event 时隐藏 context CTA，手动切换 Source 后继续显示既有 `NO TARGET SELECTED`。

移动 mini-player 已保留短 CTA，没有把桌面整段文案塞入 132px 媒体网格。Desktop Rail 实施后，移动端继续保留当前卡片内 CTA 与原来源文字链接。

### 6.2 已实现的产品合同：Attached Context Rail

Player Context Rail 是 `ArchivePlayer` 自身长出的四枚档案索引签，不是页面右缘的 Floating UI，也不是与 Player 分离的 sticky toolbar。它只回答“当前 Event 还能去哪里”，不承载长段说明文字。

```text
Archive Player Frame（仍占现有 player column）
├─ Main Player Card
│  ├─ CURRENT SOURCE / Source Switcher
│  ├─ Media viewport
│  ├─ TARGET
│  └─ READING CONTEXT：A04 · Act title（一行）
└─ Player Context Rail（desktop only，约 48px）
   ├─ 节点
   ├─ A04
   ├─ 线索
   └─ 原链
```

Rail 与主卡共用视觉边界和 `.project-player-column` 的 sticky 生命周期。总列宽不允许从 `390px player + 48px rail` 膨胀为 438px；Rail 必须被吃进既有总宽度，例如 342px main card + 48px rail。四枚标签从 media viewport 附近开始，结束后保留空白，不做贯穿整张卡高度的 toolbar。

### 6.3 组件与 DOM 所有权

新增 `PlayerContextRail.astro`，由 `ArchivePlayer.astro` 组合为 `.archive-player-frame`；`ProjectArchiveShell` 仍是唯一 Controller：

```text
ProjectArchiveShell
└─ .project-player-column（sticky owner）
   └─ .archive-player-frame
      ├─ ArchivePlayer（media / target / one-line context）
      └─ PlayerContextRail（navigation actions only）
```

不得把四个按钮散写进 Shell，也不得让 Rail 自己 `position: fixed` / `sticky`。Rail 以稳定 `data-player-rail-*` hooks 暴露动作；Controller 负责 selected Event、URL、Thread menu 和焦点事务。

### 6.4 四个固定槽位

| 可见标签 | 语义 | YT Event | Space Event |
|---|---|---|---|
| `节点` | 在档案中查看当前节点 | Timeline Event | 复用 Space 0 / 1 / many 上下文导航 |
| `A04` | 查看当前节点所在大章节 | 跳到所属 Act header；保留 selected Event / Player target | disabled；不显示伪 Act |
| `线索` | 查看相关 Storyline | 0 / 1 / many Thread | 0 / 1 / many Thread |
| `原链` | 回到原媒体 | 带当前 Event 时间的 YouTube URL | canonical X Space URL |

无 selected Event 时整个 Rail 隐藏，而不是显示四个无意义的 disabled 按钮。Rail 出现后：

- `节点`调用现有 `navigateToEventContext(eventId, { origin: 'player' })`，不得复制 YT / Space 分支；
- `Axx`切到 Timeline，滚动并聚焦当前 Event 所属 `[data-act] .act-header`，Event 的 `.is-active` 与播放器 seek 状态保持不变；不新增 `?act=`；
- `线索`为 0 条时使用原生 `disabled`；1 条直接 `openThread()`；多条在 Rail 左侧打开 non-modal 小菜单，不默认第一条；
- `原链`复用 `updateFallback()` 已计算的 URL；它是普通外链，不修改站内 history。

`节点`是微观定位，`Axx`是宏观定位，两者不得合并。Act jump 与 Node jump 都使用 sticky-aware offset；Act header 需要可编程聚焦，但不进入常规 Tab 顺序。

### 6.5 Thread menu 与键盘合同

多 Thread menu 属于 Rail 的轻量 popover，不是 `ThreadPanel`，不锁 body、不设置背景 `inert`：

- 从 Rail 向左展开，不制造右侧 overflow；
- trigger 使用 `aria-expanded` / `aria-controls`，menu 有可读标题和真实 Thread 名称；
- 打开后聚焦第一项；`Escape`、outside click、选择完成均关闭；关闭后焦点回到 `线索`；
- menu 内的 Thread 排序复用当前 `threadIds` 稳定顺序；
- 选择后仍通过统一导航事务只写一次 history entry。

### 6.6 Runtime 数据来源与 publication budget

不修改 Project / Event / Act schema，不把相同 Act 文案复制进 104 个 YT Event：

- YT `Axx`、Act title 与 YT Thread IDs 从当前 Event 的 `[data-timeline-event]`、最近 `[data-act]` 和既有 `[data-open-thread]` DOM 派生；
- Space Thread IDs 继续使用 controller data 中现有的 external-only `threadIds`；
- 原媒体 URL 继续由 Track `fallbackUrl` + Event `startMs` 派生；
- 可在 Controller 内建立一次性的 runtime cache，但不得写回 JSON 或内容 schema。

当前 publication 输出为 352,541 / 358,400 bytes，只剩 5,859 bytes。新增组件 markup、ARIA 与 menu 模板后必须重跑 budget；若超限，优先减少重复 DOM / 字符串，不得删除读者内容或放宽门禁。

### 6.7 Desktop 空间治理

Rail 不是单独的横向增量，必须与 compact-desktop 布局同时实施：

- `>1440px`：保留宽桌面节奏，但 player frame 总宽仍包含 48px Rail；
- `901–1440px`：新增 compact-desktop 中间态，收紧 `.project-workspace` 的横向 padding / gap，并把 player frame 总宽控制在约 360–390px；
- `<=900px`：沿用现有上下单栏，Rail 隐藏，卡片内 Context CTA 与 fallback link 保留；
- `.archive-player` 可设 named container，由 container query 隐藏普通桌面的低优先级 360° note、收紧内部 padding；viewport media query 只负责页面两栏 / 单栏切换；
- Rail 每格约 48×48px，使用现有 mono metadata 字体、细边框、米白底与 archive-red hover/focus；不使用图标、圆角、阴影按钮或高饱和背景。

Desktop + Rail 时，现有 Context Dock 只保留一行 `A04 · Act title`；隐藏重复的“在 Timeline / Storyline 查看”CTA和原来源文字链接。Mobile 因 Rail 隐藏，继续显示这些 fallback actions。普通桌面可隐藏长期重复的 360° note，超宽桌面允许保留低对比度版本。

### 6.8 到达反馈、history 与 motion

- Node / Act 由读者点击时可以产生至多一个 history entry；播放器每 750ms 自动同步继续只更新视觉状态或 `replaceState`，不得滚动；
- Act jump 保持 canonical `?view=timeline&event=...`，不保存瞬时滚动位置；
- Node jump 可给目标 Event 增加约 1.2–1.5 秒的 `is-context-arrival` 轻微强调，然后回落到既有 `.is-active`；不得闪烁；
- `prefers-reduced-motion: reduce` 下取消位移与渐变演出，定位仍使用 instant / auto；
- Rail 的出现最多使用 120–160ms opacity / 3px 内移，不模拟纸张弹出或旋转。

## 7. Timeline Navigator

### 7.1 Desktop Map（UX11-D）

- 8 个 segment 使用现有 Act `startMs` / `endMs` 计算宽度；当前时长为 67、35.2、12.8、30、48、40.9、33.1、30.5 分钟，等宽会隐藏真实结构；
- 点击 segment 直接定位对应 `[data-act]`；
- 使用 `IntersectionObserver` 或视口采样更新 current Act；
- 显示 `ACT 05 / 08`、时间范围和标题；
- sticky offset 必须位于 Project Nav 下方，不遮住 Act header。

Map 是章节索引，不是第二条事件时间线。它不显示 104 个 Event tick，也不混入 SP1 / SP2 本地时钟。

### 7.2 Mobile（UX11-E，先验证组合）

移动端已有约 59px sticky Project Nav；选中 Event 后还有约 126px mini-player。再独立叠加 36–42px sticky Act bar 会长期占据约 220px 的纵向空间。

因此移动合同不在首批预设为“第三条 sticky”：

1. 以 UX11-A / B 已取得的 390px 实际截图为回归基线；
2. UX11-D 的 Desktop Map 稳定后，比较“非 sticky 章节下拉”“合并进 mini-player”“Player 未激活时 sticky、激活后收起”三种方案；
3. 选择后记录唯一合同，再实施。

### 7.3 Playback playhead（UX11-F，P1）

播放头需要 controller 向 Navigator 暴露 current time，并处理未载入、暂停、seek、自动 Event 更新和 external Track。它不是单纯 `currentMs / duration` 的 CSS 改动。

只有 Act jump、current Act、history 与遮挡验收稳定后再做；自动更新只能修改视觉状态和 `replaceState`，不能触发滚动或新增 history。

### 7.4 Quick / Detail（UX11-G，P1 条件项）

不在首批折叠或删减 Event。先观察 Navigator 是否已解决找回问题；若二次访问仍显著过密，再实现纯 UI density toggle。默认 Detail，Quick 只保留时间、标题、主要人物 / Thread 提示，不改 schema，并记住同一浏览会话内的选择即可。

## 8. 实施批次与退出条件

| 批次 | 范围 | 优先级 | 退出条件 |
|---|---|---:|---|
| UX11-A | Cast 390px 六行；People group-specific compact projection | P0 | **本地完成**：桌面关系清楚；390px 无页面/组件横滚；列表不显示完整 `projectContext` |
| UX11-B | `navigateToEventContext()`；Player CTA；URL 状态重置；YT scroll/focus；Space 0/1/many | P0 | **本地完成**：Person/Search/Player 三入口共用；Back/Forward 原样恢复；无长距离滚动演出 |
| UX11-P0 | Static payload audit：raw / gzip / brotli / projection breakdown | P0 | 可重复命令与固定指标；记录 `effa314` 基线；不改可见 UI |
| UX11-P1 | Source Event Index 首次展开动态生成 | P0 | 初始 HTML 不含 124 个 buttons；三 Track 浏览、选择、focus 与 Space fallback 无回归 |
| UX11-P2 | Search static JSON + first-use lazy fetch | P0 | 初始 HTML 不含 158 个隐藏结果；JSON count/leakage/sort 与 Event/Thread/Person 导航通过；raw 目标 `<=300 KiB` |
| UX11-C | Desktop Player Context Rail；Act jump；compact desktop；Thread popover；Player 纵向减负 | P0 | **本地完成**：1366 / 1440 / 1920 桌面均无 overflow；YT / Space 四动作、单线直达、多线菜单、Esc / focus 与原链通过；390px fallback actions 无回归 |
| UX11-D | Desktop proportional Timeline Map；current Act | P0 | 8 Act 可直接定位；滚动时 current Act 稳定；不遮挡标题；与 Rail 的局部导航职责不重复 |
| UX11-E | 选定并实现 Mobile compact navigator 组合 | P0（设计待选） | 与 Project Nav / mini-player 同时出现时仍保留足够阅读区域 |
| UX11-F | Timeline playback playhead | P1 | unloaded / playing / paused / external 状态明确；不滚动、不增 history |
| UX11-G | Quick / Detail density | P1（条件） | 只有 UX11-D/E 后复测仍过密才启动 |
| UX11-H | 1366×768、1440×900、1920×1080、390×844、键盘、console、overflow、history QA | P0 | 固定序列全部通过并保存证据；80% zoom 不作为通过条件 |

UX11-A + UX11-B 已在 `effa314` 完成本地验收，UX11-C 已按完整合同完成本地实现与浏览器验收。下一阶段按 UX11-P0 → P1 → P2 分三个小提交，作为独立工程治理；不得借 payload 目标裁减 Rail。Timeline Map 仍顺延到 UX11-D，不能与 Rail 同批实施。

## 9. 约束与非目标

- 不改变 Hero、Media Sources 和现有 Folio 视觉语言；
- 不把 Timeline 改成 YT / SP1 / SP2 混合时钟；
- 不为 compact People 临时增加新内容字段或解析散文；
- 不把播放器自动推进变成自动滚动 Timeline；只有用户触发的 context navigation 才滚动；
- 不让 Thread 多关联事件默认选择“第一条”；
- 不把 Rail 做成页面右缘 Floating UI、独立 sticky toolbar 或移动端第三条常驻导航；
- 不新增 `?act=`、不扩大 controller JSON 来重复序列化 Act 文案；
- 不把 350 KiB 直接改成 warning 或 450 KiB；也不为了守门禁删除完整 Rail 功能。若后续超限，先移除已识别的工具型重复投影，再以实测决定双层门禁；
- 不把 Search / Source Index 的工具型重复与 Timeline / Thread / Person 的 reader content 混为一类；
- 不在 UX11-C 同批实现 Timeline Map、playhead 或 Quick / Detail；
- 不把“页面无横向 overflow”误写成“所有内部组件都无需横滚”；
- 不在 RC 0.11 顺手重开 Release Gate。完成后仍需独立确认 merge / deploy 意图。

## 10. 验证矩阵

### Source / build

- `npm run validate`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- `npm run audit:payload -- komatsu36`（UX11-P0 加入后）
- Search JSON 的 count / stable sort / leakage fixture；Source Index 的 124 Event controller coverage；
- controller fixture 覆盖 Space Event 的 0 / 1 / many Thread 分支

### Browser 1366×768 / 1440×900 / 1920×1080 / 390×844

- People 每组只显示当前组投影，Person panel 信息仍完整；
- Cast 桌面表格、移动六行，人名均可打开详情；
- Source Event Index 的 YT / SP1 / SP2 首次展开、缓存、Event 选择和键盘焦点正确；
- Search 第一次 focus lazy-load；Event / Thread / Person 各抽一项；请求失败不阻塞核心档案；
- Player CTA 的 YT / Space 文案与目标正确；
- Desktop Rail 在无 Event 时隐藏；YT / Space Event 下 `节点 / Axx / 线索 / 原链` 状态正确；
- Rail 与 Player 共边且吃进既有 column；100% zoom 下页面和 Player frame 均无横向 overflow，80% zoom 只作观察；
- `Axx`聚焦 Act header、保留 selected Event / target、URL 不出现 `act=`；
- Thread 0 / 1 / many、左向 popover、Esc / outside click / focus restore、source 原链均正确；
- `<=900px` Rail 不出现，Context CTA 与 fallback link 仍可用；
- YT 目标不被 sticky header / mini-player 遮挡；
- Person / Search / Player 三入口以及 Back / Forward；
- 自动播放推进更新 Player 文案，但不自动滚动、不增长 history；
- 后续 UX11-D/E 再验证 Timeline Map current Act 与移动组合，不把其结果并入 UX11-C；
- 页面级和组件级 overflow 分开记录；
- console 中应用错误为 0，第三方播放器网络噪声单独归类。
