# Komatsu36 RC 0.11 分批收尾 Runbook

> 状态：ACTIVE
> 当前分支：`codex/komatsu36-project-archive`
> 当前远端检查点：`1162ba2`（UX11-C Player Context Rail 已在 review branch）
> 下一批：R1 — UX11-C1 Opaque Player + UX11-A1 Lead Person hierarchy
> Release Gate：CLOSED；本 Runbook 只把 review branch 做到可审阅、可合并状态，不授权 merge 或 deploy。

## 1. 用途与权威顺序

本文把 RC 0.11 从当前检查点一直约束到最终 QA 与 Release Gate 交接，防止后续窗口把条件项误当必做项、把多个风险批次混成一次提交，或用 payload 目标裁减已经验收的产品功能。

发生冲突时按以下顺序裁决：

1. 本文：批次顺序、进入条件、停止条件与收尾状态；
2. `komatsu36-static-payload-pass.md`：UX11-P0 / P1 / P2 的字段、运行时和门禁合同；
3. `komatsu36-archive-navigation-pass.md`：UX11-A～H 的产品与交互合同；
4. `komatsu36-archive-development.md`：长期架构、内容边界与 Release Gate；
5. 更早的 RC 文档只作为历史记录，不覆盖上述当前合同。

每批结束必须同步本文的状态台账。不得只在聊天中声明完成。

## 2. 2026-08-09 当前事实快照

### 2.1 Git 与实现状态

| 项目 | 权威证据 | 结论 |
|---|---|---|
| Review branch | 本地与 `origin/codex/komatsu36-project-archive` 均为 `1162ba2` | UX11-C 不是仅本地状态，应称 **REVIEW BRANCH COMPLETE** |
| UX11-A / B | `effa314` | 已提交并保留既有回归合同 |
| UX11-C | `PlayerContextRail.astro`、`ArchivePlayer.astro` import、`1162ba2` | 四标签、Act jump、Thread 0/1/N、原链、desktop compact 与 mobile fallback 已在远端分支 |
| UX11-P0 | `package.json` 无 `audit:payload` | 未开始 |
| UX11-P1 | `MediaSourceNavigator.astro` 仍执行 `eventsForTrack(track).map(...)` | 124 个 Source Event buttons 仍静态输出，未开始 |
| UX11-P2 | `ProjectSearch.astro` 仍输出所有 `data-search-item` | 158 个隐藏 Search items 仍在初始 HTML，未开始 |
| UX11-D | Timeline heading 后直接渲染 `orderedActs.map(...)` | 没有 Timeline Navigator，未开始 |

### 2.2 当前构建基线

在 `1162ba2` 重新执行 `npm run validate` 后，构建与 publication gate 通过：

| 指标 | 当前值 |
|---|---:|
| Raw HTML | 353,913 bytes |
| Gzip level 9 | 69,117 bytes |
| Brotli quality 11 | 35,598 bytes |
| 350 KiB hard gate 余量 | 4,487 bytes |
| Search items | 158 |
| Source Event buttons | 124 |
| Search section | 73,355 raw bytes |
| Source Event Index | 24,973 raw bytes |
| Controller script | 22,160 raw bytes |
| Thread details / Person details | 16 / 18 |

这些数字证明 Payload Pass 的优先级，但不构成删减 Rail、Timeline、Thread、Person 或人物层级的授权。实际净减量只能在 P1 / P2 后重测，不能把两个 section 的毛体积直接当作承诺值。

### 2.3 新审阅裁决

| 审阅项 | 本地核对 | 裁决 |
|---|---|---|
| Sticky Player 透出下层内容 | `.archive-player` 为 `rgba(255,255,255,0.45)`；`.archive-player__context` 为 alpha red；下层 People row 也为半透明 | **成立，UX11-C1 P0 小修**：sticky 前景必须改为不透明 paper surface |
| 小松缺少中心人物层级 | `orderedPeople` 只按 `displayName` 排序；People 只有 Cast / Production / Birthday / Space 四组 | **成立，UX11-A1 P0 小修**：新增 `00 HOST / BIRTHDAY` lead projection |
| 小松应从所有后续分组移除 | Cast 与 Production 是角色、制作 credit 真值 | **不采纳**：只从普通 Birthday Live participant grid 排除；Cast 与 Production 保留 |
| 以 Event 数自动选主角 | 出现次数不等于编辑中心 | **禁止**：使用 Komatsu36 presentation fixture 中唯一的 `leadPersonId = 'komatsu-shohei'`，不改 Person schema |
| 立即开发 Timeline Navigator | 当前 hard-gate 余量仅 4,487 bytes，P0/P1/P2 尚未实施 | **顺延**：先做 R1 与 Payload 三批，再进入 UX11-D |
| Navigator 第一版加入 playhead | 阅读位置与媒体位置可能不同 | **不采纳到 UX11-D**：第一版只有 current Act + Act jump；playhead 保持 UX11-F 条件项 |

## 3. 全局批次规则

### 3.1 开始一批之前

每批必须先确认：

```text
git status --short
git branch --show-current
git rev-list --left-right --count HEAD...origin/codex/komatsu36-project-archive
```

进入条件：工作区没有未知改动；当前分支正确；本地与远端关系已知。若出现用户改动，不覆盖、不回滚，先确认边界。

### 3.2 一个批次只解决一个风险面

- R1 不实现 Payload 或 Timeline Navigator；
- P0 不改可见 UI；
- P1 不改 Search；
- P2 不改 Source Index 或 Navigator；
- UX11-D 不带 playhead、mobile navigator 或 Quick / Detail；
- UX11-E 先做设计裁决，再决定是否需要独立实现提交；
- UX11-H 只修复验收发现的缺陷；若修复范围跨批次，另开明确 patch，不把 QA 提交变成功能杂包。

### 3.3 每批统一退出门禁

所有代码批次至少执行：

```text
npm run validate
npm exec -- tsc --noEmit
git diff --check
```

涉及 UI / navigation 的批次还必须在构建后的真实 `/projects/komatsu36/` 路由完成规定 viewport、键盘、focus、console 和 overflow 验收。只看源码、只跑 build 或只用开发服务器均不能替代浏览器证据。

每批通过后：

1. 更新本文状态台账和对应专项规格；
2. 只 stage 本批文件，检查 staged diff；
3. 创建一个可审阅 commit；
4. 立即 push 当前 review branch；
5. 核对远端 SHA 等于本地 HEAD，再进入下一批。

任何 required gate 失败时停止推进下一批。不得通过放宽 350 KiB、删除 reader content、关闭 validator 或缩减已验收 Rail 来制造绿色结果。

### 3.4 QA 证据位置

需要截图的批次统一写入：

```text
docs/qa/komatsu36-rc11/<batch-id>/
```

同目录保留简短 `README.md`，记录 commit、构建命令、路由、viewport、交互序列、console / overflow 结论和未执行边界。没有实际执行的项目必须写 `NOT EXECUTED`，不能用源码推断冒充浏览器验收。

## 4. 固定实施序列

### R1 — UX11-C1 + UX11-A1 视觉层级修正

#### 范围

1. `.archive-player` 改用不透明 `var(--archive-paper)`；
2. `.archive-player__context` 改用不透明 paper surface，可用 `var(--archive-paper)` 或 `var(--archive-paper-deep)`，但不能保留 alpha；
3. Rail 继续使用现有实色 paper；不改变四标签功能、宽度或 sticky owner；
4. 在 Komatsu36 presentation 层集中声明 `leadPersonId = 'komatsu-shohei'`；不得按 Event 数推断，也不得新增 Person schema；
5. People heading 后、Cast 前新增 `00 HOST / BIRTHDAY` Lead Person Index；入口继续使用 `data-open-person` 打开同一个 Person panel；
6. Lead projection 复用现有 `displayName`、`reading`、`projectContext`、structured participation 与反向 Event count，不另造第二份人物真值；
7. 小松继续出现在 ORE-SHIRI CAST 与 PRODUCTION / ACTION，只从 BIRTHDAY LIVE PARTICIPANTS 普通 grid 排除；
8. 不改 Timeline Navigator、Payload、schema、Event 或 Person 内容文件。

#### 退出条件

- 1440×900 与 1366×768：Player sticky 覆盖 Timeline / People 时，下层文字和卡片完全不可见；Player 与 Rail surface 连续；
- People：`00` lead 入口清楚，小松在 Cast / Production 中仍存在，在普通 Birthday grid 中不存在；点击 lead / Cast / Production 三处都打开同一 Person；
- 390×844：Lead projection 无横滚，Player mini layout 与 Rail fallback 无回归；
- 无页面级或组件级 overflow；console 应用错误为 0；
- publication raw 仍 `<=358,400`。若 R1 因合理 UI markup 超限，停止并先进入 P0/P1；不得删功能或放宽门禁。

建议提交：`fix(komatsu36): clarify player and lead-person hierarchy`

### R2 — UX11-P0 Payload audit instrumentation

严格执行 `komatsu36-static-payload-pass.md` 的 P0 合同，只新增可重复审计入口：

```text
npm run build
npm run audit:payload -- komatsu36
```

必须固定输出 raw / gzip / brotli、Search / Source Index / Controller bytes，以及 Timeline Event、Source Event、Search、Thread、Person 等 projection counts。缺少目标构建文件时明确失败；不新增运行时依赖，不改页面 DOM。

退出条件：连续两次对同一 `dist` 输出相同；数值与本 Runbook 当前基线相符或差异有可解释证据；现有 validate / type / diff gate 通过。

建议提交：`chore(komatsu36): add reproducible payload audit`

### R3 — UX11-P1 Dynamic Source Event Index

严格执行专项规格 P1：保留可访问 shell 与三个空 list host；首次展开时从 controller events 按 `startMs → id` 生成，页面生命周期内缓存；改为 list-level event delegation；0-Thread Space fallback 在生成后仍能聚焦目标。

退出条件：

- 初始 HTML 中 `data-source-event` button 数为 0，controller 仍覆盖 124 个公开 Event；
- YT / SP1 / SP2 首次展开、再次展开、切 Track、选择 Event、键盘焦点正确；
- 0 / 1 / many Space context 与 Back / Forward 不回归；
- 不增加 endpoint 或网络请求；
- P0 audit 记录本批前后 raw / gzip / brotli 与净变化。

建议提交：`perf(komatsu36): generate source event index on demand`

### R4 — UX11-P2 Lazy static Search JSON

严格执行专项规格 P2：共享 build-time builder 生成 `/projects/komatsu36/search.json`；初始 HTML 只留 search shell；first focus / first input 单次 fetch 并缓存；结果继续复用现有 Event / Thread / Person 导航事务。

退出条件：

- 初始 HTML 中 `data-search-item` 数为 0；静态 JSON 恰好 158 项；
- stable sort、公开字段、withheld / qualification / 本机路径 leakage gate 通过；
- Event / Thread / Person 各抽一项，目标、URL 与 Back 正确；
- 模拟 JSON 请求失败时有 screen-reader 可读错误，Timeline / Thread / Person 仍可阅读；
- 必须在 build 后 preview 复测，不能用 dev-server cache 作为证据；
- P0 audit 写回 P2 后新基线。Required gate 仍为 raw `<=350 KiB`，`<=300 KiB` 是工程目标而非删 reader content 的理由。

建议提交：`perf(komatsu36): lazy-load static search index`

### R5 — UX11-D Desktop proportional Timeline Navigator

只有 R4 完成并记录新 payload 基线后才能开始。

#### 产品合同

- 新组件位于 Timeline `.view-heading` 后、Act 正文前；初次进入先读 heading，再看到 Navigator；
- 只存在于 Timeline 左内容列，不跨过 Player column，不改变 `.project-player-column { top: 96px; }`；
- 滚动到五视图 Project Nav 下方后 sticky，桌面 offset 以实际 nav 高度为准，目标约 `68px`，不得遮挡 Act header；
- 8 个 segment 按 Act `startMs / endMs` 真实时长比例布局，不做等宽；
- 第一行显示 current `ACT xx / 08`、标题与本地时间范围；第二行显示 A01～A08 segments；
- click 定位并聚焦对应 Act header，只产生至多一个 history entry，不新增 `?act=`；
- current Act 表示阅读位置。第一版不接播放器 current time、不显示 104 Event ticks、不混入 SP1 / SP2 时钟；
- Player Rail 的 Axx 继续保留：Rail 是当前 Event 的 local context，Navigator 是整场 global orientation。

#### 退出条件

- 1366×768、1440×900、1920×1080：8 段比例正确、点击目标正确、滚动 current Act 稳定；
- Navigator 只在 Timeline 出现，不污染 Overview / Storylines / People / Transcript；
- sticky 不与 Project Nav 或 Player 抢层级，不遮 Act header，不产生横向 overflow；
- 键盘、focus、Back / Forward、Rail Axx 与 Node jump 不回归；
- P0 audit 记录 Navigator 增量，publication hard gate 通过。

建议提交：`feat(komatsu36): add proportional timeline navigator`

### R6 — UX11-E Mobile navigator 决策门

UX11-D 稳定后，以 390×844 同时观察 Project Nav、选中与未选中 Event、mini-player、Act heading，比较：

1. 非 sticky 章节下拉；
2. 合并进 mini-player；
3. Player 未激活时 sticky、激活后收起。

必须记录三案的可见阅读高度、遮挡、触达和状态复杂度，只批准一个合同。若证据表明现有非 sticky Timeline 结构已足够，可明确记录 `NO ADDITIONAL MOBILE NAV FOR V1`，这也算完成 UX11-E 决策；不得默认叠加第三条 sticky bar。

若批准的新合同需要代码，另开 R7 单独实现、验证、提交和 push；不得把设计试验混入 UX11-D。

### R7 — UX11-E Mobile implementation（仅在 R6 批准后）

只实现 R6 记录的唯一合同。390×844 必须验证选中 / 未选中 Event、Project Nav、mini-player、Act jump、页面与组件 overflow、键盘 / focus 和可见阅读区域。若 R6 决定 v1 不新增 mobile navigator，则本批标记 `NOT REQUIRED`，不创建空代码提交。

### R8 — UX11-F / G 条件项裁决

- UX11-F Playback playhead 默认延后 v1.1，不是 RC 0.11 v1 blocker。只有明确提升优先级后才另开规格与提交，并必须区分 MEDIA POSITION 与 READING POSITION；
- UX11-G Quick / Detail 只在 R5 / R7 后真实复测仍证明 Timeline 过密时启动。若 Navigator 已解决找回问题，记录 `NOT NEEDED FOR V1` 即可；
- 不得因为编号存在就自动开发这两项。

### R9 — UX11-H Final QA 与收尾交接

#### 固定验证矩阵

- 1366×768、1440×900、1920×1080、390×844，100% zoom；
- 五 View、Search、三 Source、Source Event Index、Player Rail、Timeline Navigator、People lead、Cast mobile；
- YT / Space 0 / 1 / many、Act / Node / Thread / source link；
- People → Person → Event → Back / Forward；Search → Space Event → Thread → Back；
- 键盘、focus containment / restore、Esc、outside click；
- 页面级与组件级 overflow 分开记录；
- console 应用错误为 0，第三方媒体网络噪声单独分类；
- 自动播放器同步不得滚动或增长 history；
- `npm ci`、`npm audit --omit=dev`、`npm run validate`、`npm exec -- tsc --noEmit`、`git diff --check`；
- P0 audit 最终 raw / gzip / brotli / projection breakdown；
- build 后 preview，而不是只验 dev route。

#### 收尾定义

UX11-H 通过后：

1. 把 A～H 状态、F/G/E 的裁决和最终 payload 数字写回三份当前文档；
2. 确认 review branch clean、所有批次已 push、远端 HEAD 与本地相同；
3. 输出一份 release-readiness handoff，明确仍未执行 production preview / merge / deploy 的项目；
4. RC 0.11 可标记 `REVIEW BRANCH ACCEPTANCE COMPLETE`；
5. 不自动 merge，不修改 `project.status`，不部署。Release Gate 只能由用户另行明确授权。

## 5. 状态台账

| 批次 | 状态 | Commit / 证据 | 下一动作 |
|---|---|---|---|
| UX11-A / B | COMPLETE | `effa314` | 保持回归 |
| UX11-C | REVIEW BRANCH COMPLETE | `1162ba2` | R1 补视觉层级 |
| R1 UX11-C1 / A1 | NEXT | — | opaque Player + Lead Person |
| R2 UX11-P0 | PENDING | — | R1 通过后开始 |
| R3 UX11-P1 | PENDING | — | P0 通过后开始 |
| R4 UX11-P2 | PENDING | — | P1 通过后开始 |
| R5 UX11-D | PENDING | — | P2 新基线后开始 |
| R6/R7 UX11-E | PENDING DECISION | — | D 稳定后比较三案 |
| R8 UX11-F | DEFERRED BY DEFAULT | — | 仅明确提级后启动 |
| R8 UX11-G | CONDITIONAL | — | D/E 后以证据裁决 |
| R9 UX11-H | PENDING | — | 所有 required 批次完成后执行 |
| Release Gate | CLOSED | 用户尚未授权 | 等待独立 merge / deploy 指令 |
