# Komatsu36 RC 0.11 档案导航与视觉层级实施规格

> 状态：AUDIT COMPLETE / IMPLEMENTATION NOT STARTED
> 阶段：RC 0.11 — Archive Navigation & Visual Hierarchy Pass
> 基线：`codex/komatsu36-project-archive` @ `14f1861`，RC 0.10 本地验收完成
> 范围冻结：不新增 Event、Person 字段、媒体 provider、Transcript、Evidence 或 X widget。

## 1. 阶段目标

RC 0.10 已经解决“档案里有没有足够且可信的信息”。RC 0.11 只解决读者如何：

1. **Orientation**：知道自己位于五小时活动的哪一段；
2. **Context**：从当前媒体节点回到它所属的 Timeline 或 Storyline；
3. **Progressive disclosure**：列表只回答“为什么这个人在本组”，详情再解释完整项目语境。

本轮不是新的 Editorial Pass，也不继续扩充材料。它是对现有五个 View 之间的导航闭环和信息层级进行收口。

## 2. 2026-08-09 本地核对

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

## 5. ArchivePlayer → Context Dock

Player 在选中 Event 时新增轻量上下文区：

```text
TARGET · 02:42:07
ACT 05 · 《俺知》复盘、俳句与迟到的回收
熊谷的喜剧名场面揭开“受控即兴”
[在 Timeline 查看此节点 →]
```

为支持该区，controller data 可增加派生字段，不改内容 schema：

```ts
events[eventId] = {
  ...existing,
  actId?: string,
  actOrder?: number,
  actTitle?: string,
  threadIds: string[],
}
```

Space Event 不显示伪 Act；显示 Track label 与 Thread 选项。无选中 Event 时隐藏 context CTA，手动切换 Source 后继续显示既有 `NO TARGET SELECTED`。

移动 mini-player 空间有限：首批不得把桌面整段文案原样塞入 132px 媒体网格。应保留当前标题，并使用短 CTA（如 `回到节点 →`）或折入 current 区；390px 验收后再决定最终排法。

## 6. Timeline Navigator

### 6.1 Desktop Map（第二批）

- 8 个 segment 使用现有 Act `startMs` / `endMs` 计算宽度；当前时长为 67、35.2、12.8、30、48、40.9、33.1、30.5 分钟，等宽会隐藏真实结构；
- 点击 segment 直接定位对应 `[data-act]`；
- 使用 `IntersectionObserver` 或视口采样更新 current Act；
- 显示 `ACT 05 / 08`、时间范围和标题；
- sticky offset 必须位于 Project Nav 下方，不遮住 Act header。

Map 是章节索引，不是第二条事件时间线。它不显示 104 个 Event tick，也不混入 SP1 / SP2 本地时钟。

### 6.2 Mobile（第三批，先验证组合）

移动端已有约 59px sticky Project Nav；选中 Event 后还有约 126px mini-player。再独立叠加 36–42px sticky Act bar 会长期占据约 220px 的纵向空间。

因此移动合同不在首批预设为“第三条 sticky”：

1. 先完成 UX11-A / B 并取得 390px 实际截图；
2. 比较“非 sticky 章节下拉”“合并进 mini-player”“Player 未激活时 sticky、激活后收起”三种方案；
3. 选择后记录唯一合同，再实施。

### 6.3 Playback playhead（P1）

播放头需要 controller 向 Navigator 暴露 current time，并处理未载入、暂停、seek、自动 Event 更新和 external Track。它不是单纯 `currentMs / duration` 的 CSS 改动。

只有 Act jump、current Act、history 与遮挡验收稳定后再做；自动更新只能修改视觉状态和 `replaceState`，不能触发滚动或新增 history。

### 6.4 Quick / Detail（P1，条件项）

不在首批折叠或删减 Event。先观察 Navigator 是否已解决找回问题；若二次访问仍显著过密，再实现纯 UI density toggle。默认 Detail，Quick 只保留时间、标题、主要人物 / Thread 提示，不改 schema，并记住同一浏览会话内的选择即可。

## 7. 实施批次与退出条件

| 批次 | 范围 | 优先级 | 退出条件 |
|---|---|---:|---|
| UX11-A | Cast 390px 六行；People group-specific compact projection | P0 | 桌面关系仍清楚；390px 无页面/组件横滚；列表不显示完整 `projectContext` |
| UX11-B | `navigateToEventContext()`；Player CTA；URL 状态重置；YT scroll/focus；Space 0/1/many | P0 | Person/Search/Player 三入口共用；Back/Forward 原样恢复；无长距离滚动演出 |
| UX11-C | Desktop proportional Timeline Map；Act jump/current Act | P0 | 8 Act 可直接定位；滚动时 current Act 稳定；不遮挡标题 |
| UX11-D | 选定并实现 Mobile compact navigator 组合 | P0（设计待选） | 与 Project Nav / mini-player 同时出现时仍保留足够阅读区域 |
| UX11-E | Timeline playback playhead | P1 | unloaded / playing / paused / external 状态明确；不滚动、不增 history |
| UX11-F | Quick / Detail density | P1（条件） | 只有 UX11-C/D 后复测仍过密才启动 |
| UX11-G | 1440×900、390×844、键盘、console、overflow、history QA | P0 | 固定序列全部通过并保存证据 |

第一实施批只做 UX11-A + UX11-B。两者可以分别提交，避免 People 视觉重排与 controller/history 修正互相掩盖。Timeline Map 在第一批真实渲染通过后开始。

## 8. 约束与非目标

- 不改变 Hero、Media Sources 和现有 Folio 视觉语言；
- 不把 Timeline 改成 YT / SP1 / SP2 混合时钟；
- 不为 compact People 临时增加新内容字段或解析散文；
- 不把播放器自动推进变成自动滚动 Timeline；只有用户触发的 context navigation 才滚动；
- 不让 Thread 多关联事件默认选择“第一条”；
- 不把“页面无横向 overflow”误写成“所有内部组件都无需横滚”；
- 不在 RC 0.11 顺手重开 Release Gate。完成后仍需独立确认 merge / deploy 意图。

## 9. 验证矩阵

### Source / build

- `npm run validate`
- `npm exec -- tsc --noEmit`
- `git diff --check`
- controller fixture 覆盖 Space Event 的 0 / 1 / many Thread 分支

### Browser 1440×900 / 390×844

- People 每组只显示当前组投影，Person panel 信息仍完整；
- Cast 桌面表格、移动六行，人名均可打开详情；
- Player CTA 的 YT / Space 文案与目标正确；
- YT 目标不被 sticky header / mini-player 遮挡；
- Person / Search / Player 三入口以及 Back / Forward；
- 自动播放推进更新 Player 文案，但不自动滚动、不增长 history；
- Timeline Map current Act、Act jump、键盘焦点与移动组合；
- 页面级和组件级 overflow 分开记录；
- console 中应用错误为 0，第三方播放器网络噪声单独归类。
