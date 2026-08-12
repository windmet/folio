# Komatsu36 RC 0.11 分批收尾 Runbook

> 状态：ACTIVE
> 当前分支：`codex/komatsu36-project-archive`
> 当前远端检查点：R9 Final QA 与 release-readiness handoff 已完成
> 当前批次：R9 已完成
> 下一步：Release Gate（仍 CLOSED，等待用户独立授权）
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
| Review branch | R9 Final QA 与 handoff 已推送，本地与远端同步 | UX11-C、R1、R2、R3、R4、R5、R6 与 R9 均为 **REVIEW BRANCH ACCEPTANCE COMPLETE**；Release Gate 仍独立关闭 |
| UX11-A / B | `effa314` | 已提交并保留既有回归合同 |
| UX11-C | `PlayerContextRail.astro`、`ArchivePlayer.astro` import、`1162ba2` | 四标签、Act jump、Thread 0/1/N、原链、desktop compact 与 mobile fallback 已在远端分支 |
| UX11-C1 | `.archive-player` 与 `.archive-player__context` 已改为实色 paper | 已实现并通过桌面 / 390px 样本验收 |
| UX11-A1 | `LeadPersonCard.astro`、`leadPersonId = 'komatsu-shohei'`、Birthday filter | 已实现；lead / Cast / Production 回链同一 Person，Birthday 普通 grid 排除 lead |
| UX11-P0 | `scripts/audit-payload.mjs`、`package.json` `audit:payload`、R2 QA README | 已实现；固定输出 raw / gzip / brotli、投影计数与 bytes；dist 缺失 / 过期会明确失败 |
| UX11-P1 | `MediaSourceNavigator.astro` 空 list host；Controller `ensureSourceEventIndex()`；publication controller coverage | 已实现；初始 Source Event buttons 为 0，首次展开按 `startMs → id` 生成并按页面生命周期缓存 |
| UX11-P2 | `search.json` endpoint、Search shell、`ensureSearchIndex()`、P2 publication validator | 已实现；初始 Search items / `data-search-text` 为 0，静态 JSON 158 项，首次 focus/input 单次加载并按需生成结果 |
| UX11-D | `TimelineNavigator.astro`、Act 时长比例、滚动 current Act 与 Act header jump | R5 已实现；等待本批 commit / push 后写入远端检查点 |

### 2.2 当前构建基线

在 R4 当前提交重新执行 `npm run validate` 与 `npm run audit:payload -- komatsu36` 后，构建、publication gate 与 payload audit 通过：

| 指标 | 当前值 |
|---|---:|
| Raw HTML | 261,080 bytes |
| Gzip level 9 | 46,163 bytes |
| Brotli quality 11 | 29,420 bytes |
| 350 KiB hard gate 余量 | 97,320 bytes |
| Initial Search items / Search JSON items | 0 / 158 |
| Source Event buttons | 0（Controller Event records 124） |
| Search shell / Search JSON | 1,232 / 63,433 raw bytes |
| Source Event Index shell | 609 raw bytes |
| Controller script | 22,090 raw bytes |
| Thread details / Person details | 16 / 18 |

### 2.3 P0 audit 快照

`npm run audit:payload -- komatsu36` 输出固定 JSON（`schema_version: 1`），以构建后的 `dist/projects/komatsu36/index.html` 为唯一输入；raw 使用 UTF-8 byte length，Gzip 固定 level 9，Brotli 固定 quality 11，section bytes 使用固定 HTML marker 截取，投影数量使用固定 data attribute 计数。

| 投影 | count | bytes |
|---|---:|---:|
| Timeline Event cards | 104 | 101,551 |
| Source Event Index buttons | 124 | 24,973 |
| Search items | 158 | 73,355 |
| Thread details / node buttons | 16 / 84 | 33,903 |
| Person details / Event rows | 18 / 213 | 66,983 |
| Controller JSON Event records / bytes | 124 | 22,090 |

审计同时确认构建输出 mtime 晚于最新 source input，`stale: false`。对不存在的合法 project slug 会以非零退出并提示 `Run npm run build first`，不会静默读取缺失或旧 `dist`。

### 2.4 P1 Source Index 快照

R3 初始 HTML 不再包含 `data-source-event` button；仍保留 3 个 `data-source-event-list` host、3 个 browse button 与完整 124 条 controller Event records。浏览器在构建后 preview 验收：1440px 首次 YT 展开生成 104 个，重复展开仍为 104；SP1 生成 8 个，SP2 生成 12 个；动态 Event 选择可写入 URL、更新 TARGET 并支持 Back / Forward。1366px 与 390px 页面级 overflow 均为 0。

当前公开 fixture 的 20 个 Space Event 均至少关联 1 条 Thread（19 个为 1 条、1 个为 2 条）；0-Thread 分支仍由 `navigateToEventContext()` 的空数组路径与 `focusSourceEvent()` 的 ensure-before-focus 实现覆盖，但本批不伪造一个公开 Event 作为浏览器样本。

### 2.5 P2 Search JSON 快照

R4 初始 HTML 不再包含 `data-search-item` 或 `data-search-text`；`/projects/komatsu36/search.json` 输出 158 项（Event 124、Thread 16、Person 18），文件 63,433 bytes。Builder 保持原有 Event → Thread → Person 分组与稳定排序，JSON 只包含渲染与导航所需字段；`validate:publication` 同时核对 schemaVersion、公开成员、稳定顺序、字段最小集、withheld / qualification / 私有路径 leakage。

构建后 preview 验收：第一次 focus 加载公开索引，首次输入按需生成结果；Event、Thread、Person 三类结果分别可导航到目标 URL / panel，Back 可恢复前一状态；重复输入复用页面内存缓存，390px 页面 overflow 为 0。加载失败状态使用 `role="alert"`，不会阻塞 Timeline、Thread、Person 核心阅读。

这些数字证明 Payload Pass 的优先级，但不构成删减 Rail、Timeline、Thread、Person 或人物层级的授权。实际净减量只能在 P1 / P2 后重测，不能把两个 section 的毛体积直接当作承诺值。

### 2.6 R5 Desktop Timeline Navigator 快照

R5 在 Timeline heading 后、Act 正文前加入 8 段 Desktop Navigator。各段使用 Act `endMs - startMs` 的真实比例，第一行显示 current `ACT xx / 08`、标题和 YT 本地时间范围；滚动采样更新 current Act，点击只定位并聚焦 Act header，不写入 `?act=`。Navigator 在实际 Project Nav 高度下 sticky（桌面约 69px），只存在左内容列，不跨 Player column。1366×768、1440×900、1920×1080 均通过 8 段、target header 不被遮挡与页面 overflow `0`；390×844 按 UX11-E 边界隐藏，不叠加第三条 sticky bar。R5 raw `261,080`、Gzip `46,163`、Brotli `29,420`，余量 `97,320`。

### 2.7 R6 Mobile navigator 决策快照

在 390×844 build preview 对未选中 Event、选中 Event 与 mini-player 状态复核后，三案均不如保留现有结构：未选中状态已有 Project Nav + 完整 Timeline 顺序；选中状态 mini-player sticky top 约 59px、高约 214.4px，底部约 273.4px，首屏再叠加 Act bar 会进一步压缩可见阅读区。最终裁决为 **`NO ADDITIONAL MOBILE NAV FOR V1`**，R7 标记 **NOT REQUIRED**，不创建空代码提交；保留既有 Project Nav、mini-player、Act heading 与 Event context jump。

### 2.8 新审阅裁决

| 审阅项 | 本地核对 | 裁决 |
|---|---|---|
| Sticky Player 透出下层内容 | 1440 / 1366 / 390 页面计算样式均为实色 Player / Context；1440 sticky 样本无横向溢出 | **R1 已完成**：sticky 前景不再依赖透明度遮挡正文 |
| 小松缺少中心人物层级 | Lead 出现为 `00 HOST / BIRTHDAY`，`komatsu-shohei` 在 Cast / Production 保留，Birthday 普通 grid 不再出现 | **R1 已完成**：lead / Cast / Production 三处均回链同一 Person |
| 小松应从所有后续分组移除 | Cast 与 Production 是角色、制作 credit 真值 | **不采纳**：只从普通 Birthday Live participant grid 排除；Cast 与 Production 保留 |
| 以 Event 数自动选主角 | 出现次数不等于编辑中心 | **禁止**：使用 Komatsu36 presentation fixture 中唯一的 `leadPersonId = 'komatsu-shohei'`，不改 Person schema |
| 立即开发 Timeline Navigator | 当前 hard-gate 余量 97,320 bytes，R5 已完成 | **R6 已裁决**：`NO ADDITIONAL MOBILE NAV FOR V1`，不把桌面 Map 缩小后叠加到手机 |
| Navigator 第一版加入 playhead | 阅读位置与媒体位置可能不同 | **不采纳到 UX11-D**：第一版只有 current Act + Act jump；playhead 保持 UX11-F 条件项 |

### 2.9 R9 Final QA 快照

R9 在 build 后 preview 完成 1366×768、1440×900、1920×1080、390×844 四视口矩阵；五 View、Search、YT/SP1/SP2 Source Index、Player Rail、People lead、Cast mobile、Thread/Person overlay、Event → Thread history、Escape/focus restore、页面 overflow 与应用 console 均通过。`npm ci`、`npm audit --omit=dev`（0 vulnerabilities）、`npm run validate`、`npm exec -- tsc --noEmit`、`git diff --check` 与最终 `audit:payload` 均通过。详细证据与未执行边界见 `docs/qa/komatsu36-rc11/r9/README.md`；交接文件见 `docs/editorial/komatsu36-rc11-release-readiness-handoff.md`。

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
| R1 UX11-C1 / A1 | COMPLETE | R1 当前提交；本次浏览器验收；raw 354,388 | 已进入 P0 |
| R2 UX11-P0 | COMPLETE | R2 当前提交；audit JSON、构建与 stale/missing-dist 失败路径 | 进入 P1 |
| R3 UX11-P1 | COMPLETE | R3 当前提交；初始 buttons 0、Controller 124；1440 / 1366 / 390 preview 验收 | 进入 P2 |
| R4 UX11-P2 | COMPLETE | R4 当前提交；Search JSON 158 项、初始 Search DOM 0；Event / Thread / Person preview 验收 | 进入 UX11-D |
| R5 UX11-D | COMPLETE | R5 QA README；8 段比例、current Act、Act jump、1366 / 1440 / 1920 preview | 已由 R6 完成移动合同裁决 |
| R6 UX11-E | COMPLETE — NO ADDITIONAL MOBILE NAV FOR V1 | R6 QA README；390×844 未选中 / 选中 Event + mini-player 三案裁决 | R7 NOT REQUIRED；F/G 已裁决，R9 已完成 |
| R7 UX11-E implementation | NOT REQUIRED | R6 已明确不新增 mobile navigator | 不创建空实现 |
| R8 UX11-F | DEFERRED BY DEFAULT | — | 仅明确提级后启动 |
| R8 UX11-G | NOT NEEDED FOR V1 | R5 Navigator 后未再证明 Timeline 过密；不启动 Quick / Detail | 保持默认 Detail |
| R9 UX11-H | COMPLETE — REVIEW BRANCH ACCEPTANCE COMPLETE | R9 QA README、最终 audit 与 release-readiness handoff | 等待 Release Gate 独立授权 |
| Release Gate | CLOSED | 用户尚未授权 | 等待独立 merge / deploy 指令 |
