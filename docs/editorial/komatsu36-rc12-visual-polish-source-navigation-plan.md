# Komatsu36 RC 0.12 Visual Polish & Source Navigation Plan

> 状态：SUPERSEDED FOR NEXT IMPLEMENTATION — 第一版工程 QA 完成，产品复核要求返工
> 基线分支：`codex/komatsu36-project-archive`
> 基线提交：`db866b3`
> 前置状态：RC 0.11 `REVIEW BRANCH ACCEPTANCE COMPLETE`
> 当前批次：历史第一版规格与证据；后续唯一入口为 `komatsu36-rc12-product-correction-runbook.md`
> Release Gate：CLOSED；本文不授权 merge、deploy 或修改公开状态

RC 0.11 已完成 Player Context Rail、Lead Person、lazy Source Event Index、lazy Search JSON、Desktop Timeline Navigator、移动端导航裁决与 R9 QA。本阶段不重写 RC 0.11 的 acceptance 文档，也不把已经验收的功能删减成 payload 优化；它只处理成熟页面在真实桌面阅读中暴露出的空间分配、文本可读性、People 投影与来源识别问题。

本文曾是 RC 0.12 第一版的唯一实施入口。RC 0.11 的产品合同、payload 合同和历史证据仍分别由以下文件保存：

> 2026-08-09 产品复核补记：上句只适用于第一版实现。当前 `compact`、People 桌面投影与来源图标层级未通过产品验收；后续实现必须转入 `komatsu36-rc12-product-correction-runbook.md`，不得从本文“RC12-F LOCAL QA COMPLETE”推导可以直接收口。

- `komatsu36-archive-navigation-pass.md`；
- `komatsu36-static-payload-pass.md`；
- `komatsu36-rc11-closeout-runbook.md`；
- `komatsu36-rc11-release-readiness-handoff.md`。

## 1. 本地核对结论

### 1.1 当前实现事实

- 页面仍是 Astro 静态输出；`ProjectArchiveShell.astro` 是集中运行时控制器。
- 当前档案状态字段已经存在：`activeView`、`activeTrackId`、`selectedEventId`、`selectedThreadId`、`selectedPersonId`。
- URL 已实现 `event` 优先于 `track`：存在有效 `event` 时由 Event 恢复真实 Track；没有 Event 时才消费 `track`。
- Player DOM 与 YouTube 实例由 `ArchivePlayer.astro` 和 Shell 控制器共同维护；切换 Track 或 Event 不应因新的展示模式重建 Player。
- `PlayerContextRail.astro` 有四个已验收入口：节点、Act、线索、原链。RC 0.12 只允许改变响应式投影，不允许删除入口或削弱语义。
- `CastMatrix.astro` 已有 desktop table 与 `max-width: 600px` mobile projection；`PersonCard.astro` 已按 production、birthday-live、space-remote 三个结构化分组投影。
- `MediaSourceNavigator.astro` 已保留三来源文字、站内／外部状态、事件数、外链与按需生成的 Source Event Index。

### 1.2 1366×768 @ 100% 的实测证据

在构建预览 `/projects/komatsu36/?view=people` 中，RC12-C 实施前的基线为：

| 区域 | client width | scroll width | 结论 |
|---|---:|---:|---|
| document | 1351 px | 1351 px | 页面级无横滚 |
| People 内容列 | 808 px | 1112 px | 子组件已经越界 |
| `.people-grid` | 808 px | 1112 px | 当前主要缺陷 |
| 首张 `.person-index-row` | 365 px | 365 px | 三列卡片总宽超过内容列 |
| `.cast-matrix-wrap` | 808 px | 808 px | 当前视口没有溢出 |
| `.cast-matrix` | 808 px | 808 px | 不是本次截图问题的直接根因 |
| Player frame | 372 px | 372 px | 其中 Context Rail 固定占 48 px |

因此 RC 0.12 不得笼统记录为“Cast table 导致页面横滚”。准确结论是：

1. `people-grid: repeat(3, 1fr)` 与每张卡内部最小列宽共同造成组件级越界；
2. document overflow 为 0 不能证明所有组件都在自己的内容列内；
3. Cast medium projection 仍应实现，用于更窄的桌面内容列和 Player mode 变化后的防回归，但它不是 1366px 当前样本的首要根因。

### 1.3 Player 文本样本

`yt-000913-first-space-departure` 在 1366×768 下当前没有文字 overflow；这说明不能给所有 Target 永久显示“展开”。RC12-B 必须只在实际 overflow 时出现控件，并用长短样本分别验收。

建议固定样本：

- 短 Target：`yt-000913-first-space-departure`；
- 长 Target：`yt-042252-seigura-superchat`；
- 长 Act title：`act-03`；
- 另从实际内容中选一个长 Reading Context，写入该批 QA README，不新增测试文案污染档案。

## 2. 产品裁决与优先级

| 批次 | 内容 | 级别 | v1 Release Gate |
|---|---|---:|---|
| RC12-A | Expanded / Compact Player；responsive Rail | P0 | 必须完成 |
| RC12-B | Target / Context 按需展开 | P0 | 必须完成 |
| RC12-C | People grid、PersonCard 与 Cast medium projection | P0 | 必须完成 |
| 人工停点 1 | 1366 / 1440 / 1920 / 390 真实页面裁决 | P0 | 必须完成 |
| RC12-D | Media platform pictograms | P1 | 推荐；不以功能扩张阻塞 P0 收口 |
| 人工停点 2 | 判断 D 是否已足够、E 是否值得进入 v1 | P0 | 必须记录裁决 |
| RC12-E | Source-scoped Timeline | P1 / v1.1 候选 | 默认延后，不阻塞 v1 |
| RC12-F | 最终视觉、交互与发布前 QA | P0 | 必须完成；按实际纳入批次验收 |

默认执行顺序固定为：

```text
RC12-A → RC12-B → RC12-C → 人工停点 1
         → RC12-D → 人工停点 2
         → RC12-F

RC12-E 只有在人工停点 2 明确提升优先级后，才插入 RC12-F 之前。
```

RC12-D 的技术实现可以在 A/B/C 证据稳定后独立完成，因为它不改变播放器状态、来源能力或信息架构；这不跳过人工停点 1，也不提前产生产品接受结论。人工停点 2 仍负责判断图标是否足够以及 E 是否进入 v1。

## 3. 总体边界

### 3.1 保留三条独立时钟

```text
YT     → YT native clock
SP1    → SP1 native clock
SP2    → SP2 native clock
```

不得把三条来源混排成伪统一绝对时间轴；不得以 X Post 时间、推测进入／离开时间或手算 offset 作为公开事实。

### 3.2 Player mode 是 UI state

Player presentation mode：

- 不写 URL；
- 不写入 `data-archive-controller-data`；
- 不改变 `activeTrackId`、`selectedEventId` 或当前 seek；
- 不创建 history entry；
- 不作为档案内容真值。

### 3.3 不以减重名义缩水

当前 publication 基线为 raw `261,080` bytes，hard gate `358,400` bytes，余量 `97,320` bytes。每批仍执行 payload audit，但不得为了减少少量 HTML／CSS：

- 删除 Context Rail 的节点、Act、线索、原链；
- 删除 reader-facing Event、Thread 或 Person；
- 回退 lazy Search JSON 或 dynamic Source Event Index；
- 用更小字体替代布局修复；
- 放宽 350 KiB 门禁。

### 3.4 不推断人物语义

继续只消费 schema 已有的 participation kinds。不得从 `projectContext` 或散文推断 `OBSERVER`、`VISITING FRIEND`、观演者、好友等新身份。若未来确需这些标签，另开内容模型决策。

## 4. RC12-A — Adaptive Player Modes

### 4.1 Required mode

第一批只实现：

```ts
type PlayerPresentationMode = 'expanded' | 'compact';
```

`minimized` 只保留为产品备选词，不新增空状态、死分支或未验收 markup。只有 Compact 在 1366×768 People 页面仍不能解决空间问题时，才另开 RC12-A2。

### 4.2 View 默认值与会话覆盖

| View | 首次进入默认值 |
|---|---|
| Timeline | expanded |
| Storylines | expanded |
| Overview | compact |
| People | compact |
| Transcript | compact |

用户手动选择只覆盖当前 View。建议 session key 以当前 Project pathname 隔离，值为 per-view map；优先级为：

```text
当前 View 的 session choice
→ 当前 View 的产品默认值
```

从 People 手动展开，不应迫使 Overview 或下一次 Timeline 继承同一全局状态。切换 View 时不写 URL。

### 4.3 Expanded 合同

保持 RC 0.11 当前能力：完整媒体 viewport、Source switcher、Target、Reading Context、原来源与四入口 Context Rail。Timeline / Storylines 默认使用。

### 4.4 Compact 合同

Compact 是完整 Player 的低权重投影，不是第二套播放器。保留：

- 当前 Source 与本地时间；
- poster／缩略视觉；
- Target；
- Act / Reading Context；
- 节点、Act、线索、原链四个入口；
- 明确的“展开播放器”按钮。

默认隐藏或压缩：

- 完整媒体 viewport 的大面积占位；
- 360°长期说明；
- 大块 Source switcher；
- 竖排 Rail 占用的额外横向列。

### 4.5 Player 实例不重建

若 YouTube iframe 已载入，`expanded → compact → expanded` 必须保持同一个 mount / Player instance：

- 不清空 mount；
- 不重新调用 `new YT.Player`；
- 不重新 seek；
- 不丢失 selected Event；
- 不因 mode change 切 Track。

第一版不私自增加 `pause-on-compact`。若后台继续播放造成体验问题，必须在人工停点 1 单独裁决。

### 4.6 Rail 响应式投影

在 Player 可用宽度充分时保留右侧竖排 Rail；宽度不足时投影为 Player 底部横排 action row。四个动作、disabled 状态、当前目标反馈、Thread 0 / 1 / many 行为和原链语义全部保持。

优先在 `.project-player-column` 或 `.archive-player-frame` 建立 container query。阈值由 1366×768 与 1440×900 实测确定，不把审阅建议的 350–370px 直接写成永久产品常量。

### 4.7 建议改动面

- `ArchivePlayer.astro`：mode control 与 compact projection hooks；
- `PlayerContextRail.astro`：只补横排投影所需结构／类名；
- `ProjectArchiveShell.astro`：内存状态、per-view session preference、View change 同步；
- `project.css`：mode 和 container projection。

## 5. RC12-B — Expandable Player Text

### 5.1 处理范围

至少覆盖 Target、Reading Context、Act title／当前章节上下文。Timeline Navigator segment 内标题继续允许截断，因为 Navigator header 已提供当前 Act 全名。

### 5.2 交互合同

- 默认 Target / Reading Context 最多两行；
- 仅实际 overflow 时显示“展开”；
- 使用 inline expansion，不引入 modal / popover / focus trap；
- 控件使用 `button`、`aria-expanded`、`aria-controls`；
- 展开后显示完整文本，按钮改为“收起”；
- 短文本不显示空按钮，也不保留无意义占位；
- `title` / tooltip 只作为桌面增强，绝不是唯一全文入口；
- touch 与 keyboard 不依赖 hover。

由于模式切换、View 切换与窗口尺寸都会改变 overflow，检测需在相关布局变化后重新计算。可使用 `ResizeObserver` 或一次集中刷新；不要为每个字段启动长期轮询。

### 5.3 建议改动面

可新增轻量 `ExpandableContextText.astro`，也可在 `ArchivePlayer.astro` 内实现；以减少重复和保持清晰为准，不以“必须新建组件”作为验收项。

## 6. RC12-C — People / Cast Layout Normalization

### 6.1 首要修复：People grid

当前根因是 808px 内容列仍强制三列卡片。响应式判断应基于 People 内容列，而不是只看 viewport。

建议在 `.people-view` 建立 named inline-size container，并定义三档投影：

| 内容列状态 | People cards |
|---|---|
| wide | 允许三列；每卡保持统一骨架 |
| medium | 改为单列 full-width rows；不得横向越界 |
| mobile | 沿用现有移动堆叠语义 |

是否保留两列中间态由实现时测量决定，但 1366×768 的 808px 内容列必须进入不会越界的投影；不能继续依赖卡片向 Player 区域溢出。

### 6.2 PersonCard 统一骨架

不改数据逻辑，只稳定四个视觉槽位：

```text
IDENTITY | PRIMARY RELATION | METADATA | COUNT
```

- 所有卡片顶部对齐；
- `align-items: start`，不让内容少的卡片垂直漂浮；
- group label 的起点一致；
- participation chips 的区域与顺序一致；
- event count 的位置一致；
- 缺少 metadata 时允许槽位为空，但不通过临时 margin 制造不同缩进。

固定抽样：濱健人（Cast + Production）、堀金蒼平（较简单）、寺島惇太（Cast）、普通 Birthday participant。

### 6.3 Cast medium projection

当前 1366px 样本的 table 没有溢出，但在更窄 desktop 内容列必须有降级：

- wide content：保留 `角色 | 昼 | 夜` table；
- medium content：角色行，昼／夜分行或分栏，不横滚；
- mobile：沿用已验收的六角色 projection。

优先复用现有 desktop/mobile markup，通过 container query 改 projection；只有语义或可访问性无法满足时才新增第三套 markup。不得把 `overflow-x: auto` 当正常桌面完成标准。

### 6.4 Lead Person 不改

小松继续独立为 `00 HOST / BIRTHDAY`，并继续在 Cast 与 Production 中按现有结构化身份出现；不进入普通 Birthday participant list。RC 0.12 不重设计 Lead Person。

## 7. RC12-A/B/C 当前证据（SOURCE-VERIFIED / BROWSER-VERIFIED）

RC12-A、RC12-B、RC12-C 已完成源码实现与本地构建验证；产品层仍停在人工停点 1，尚未标记 `PRODUCT-ACCEPTED`。本批证据记录在 `docs/qa/komatsu36-rc12/abc/README.md`，摘要如下：

| 场景 | 结果 |
|---|---|
| 1366×768 People（选中 Event） | People grid `clientWidth=808 / scrollWidth=808`；PersonCard 四个槽位起点一致；Rail 在窄 Player 中投影为横排 action row；document overflow `0` |
| 901px 内容列回退 | People grid 与 PersonCard `382 / 382`；Cast desktop 隐藏、mobile projection 显示；document overflow `0` |
| 390×844 People | People grid、PersonCard 与 Cast 无横向溢出；保留移动端既有导航合同；document overflow `0` |
| 390×844 长 Target | `yt-042252-seigura-superchat` 默认两行截断；“展开”仅在真实 overflow 出现；点击后 `aria-expanded=true`、按钮改为“收起”，URL 不变 |
| 短 Target / Context | `yt-000913-first-space-departure` 与实际短 Context 不显示空按钮 |
| 1440×900 Timeline / 1920×1080 Overview | 按 view 默认值分别使用 Expanded / Compact；不重建 Player，不丢失 Event / Track / seek |
| 控制台与构建 | Browser console 0 error / warning；`npm run validate`、`npm run audit:payload -- komatsu36`、`npm exec -- tsc --noEmit`、`git diff --check` 通过 |

RC12-A/B/C 后 publication audit 基线为 raw `261,812` bytes、Gzip `46,483`、Brotli `29,518`，350 KiB hard gate 余量 `96,588` bytes。该余量用于证明本轮没有为了卡体积而删减 Rail、People、Source 或 reader-facing 语义，不是继续压缩功能的目标。

### 7.1 人工停点 1

完成 A / B / C 后停止编码并让用户查看真实页面。至少提供：

- 1366×768 People：默认 Compact、People card 无组件越界、Cast 无横拖；
- 1366×768 Timeline：默认 Expanded、Navigator sticky 与 Rail 无回归；
- 1440×900、1920×1080：Expanded / Compact 都有合理层级；
- 390×844：保持 RC 0.11 mobile mini-player 和 `NO ADDITIONAL MOBILE NAV FOR V1`；
- mode 切换前后 Event / Track / seek 不丢失；
- 长短文本的 expand 控件出现条件正确；
- document overflow 与关键组件 `scrollWidth <= clientWidth` 都要记录。

若 Compact 已解决问题，不实施 Minimized。

## 8. RC12-D — Media Source Iconography

### 8.0 当前实现状态

RC12-D 的技术实现已完成，但不替代人工停点 1，也不自动产生 `PRODUCT-ACCEPTED`。它是语义保持不变的 P1 批次：三来源文字、能力状态、时长、事件数、Source Event Index、canonical 外链与 `?track=` 合同均保留。独立证据见 `docs/qa/komatsu36-rc12/d/README.md`。

### 8.1 视觉合同

增加站内自绘、monochrome、Folio 风格 SVG：

- YouTube：几何化播放窗；
- X Space：声场／mic／waveform；
- 线框、archive-red 或 muted tone；
- 无渐变、无大面积官方品牌色、无 SaaS 风大圆角卡。

建议新增 `MediaPlatformIcon.astro`，接受受限枚举 `youtube | x-space`；SVG `aria-hidden="true"`，平台意义仍由完整文字承担。

### 8.2 行为合同

- `YouTube 主直播`、`X Space ①`、`X Space ②`、INLINE / EXTERNAL、duration、event count 全部保留；
- 图标可以位于 Source selector 的同一点击区域；
- 图标不成为唯一外链；
- `打开原来源 ↗` 与 `浏览事件 →` 继续保留；
- 关闭 CSS / SVG 后，文字信息仍完整。

完成 D 后人工判断首眼识别是否已足够；不得继续升级为官方彩色大 Logo。若人工停点 2 认为文字与线稿已经足够，则将 E 记录为 `DEFERRED TO V1.1`，直接进入 RC12-F。

## 9. RC12-E — Source-scoped Timeline（默认延后）

### 9.1 启动门槛

只有用户在人工停点 2 明确要求纳入 v1，才启动本批。否则记录 `DEFERRED TO V1.1` 并直接进入 RC12-F。

### 9.2 信息架构

Timeline 顶部增加 Track scope：

```text
YouTube 主线 | Space ① | Space ②
```

- YT：保持 8 Acts、104 Events 与现有 Navigator；
- SP1 / SP2：按各自 `startMs → id` 排序显示 source-local Event list；
- Space 不显示 Act Navigator、YT Act label 或 fake global time；
- Event 可显示 title、summary、people、related Thread 与原来源。

### 9.3 复用现有真值

- 继续使用现有 Event / Track / Thread / Person；
- 继续使用现有 `activeTrackId`，不新增重复的 `activeTimelineTrackId`；
- 不创建 `SpaceTimelineEvent` schema；
- Source Event Index 继续作为快速定位工具，Source-scoped Timeline 是完整顺序阅读视图，两者不互相删除。

建议新增 `SourceTimeline.astro`，不要把无 Act 的 Space 硬塞进 `ActSection.astro`。

### 9.4 URL 合同

```text
?view=timeline&track=yt-main
?view=timeline&track=space-1
?view=timeline&track=space-2
?view=timeline&track=space-1&event=<space-event-id>
```

沿用当前规则：有效 `event` 是选中真值并决定 Track；没有 Event 时才由 `track` 决定 scope。Back / Forward 必须恢复正确 View / Track / Event。

## 10. RC12-F — Final QA

### 10.1 每批自动门禁

```bash
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
git diff --check
```

每批独立 commit 并及时 push。审阅、UI、文档和发布事务保持分离。

### 10.2 浏览器矩阵

固定 100% browser zoom：

```text
1366 × 768
1440 × 900
1920 × 1080
390 × 844
```

必查：Overview、Timeline YT、Storylines、People、Transcript、Expanded Player、Compact Player、Source switch、Search、Thread、Person、Back / Forward、focus、Escape、document overflow、component overflow、console。

如果 RC12-E 实施，再追加 Timeline SP1 / SP2、source-local 排序、Track scope history 与 related Thread 回链；若 E 延后，不得在 RC12-F 伪报这些项目已执行。

### 10.3 状态词

- 源码／静态检查通过：`SOURCE-VERIFIED`；
- build preview 的真实视口与交互通过：`BROWSER-VERIFIED`；
- 用户在人工停点确认产品取舍：`PRODUCT-ACCEPTED`；
- 生产环境、真实媒体或长时行为未执行：明确写 `NOT EXECUTED`；
- 只有 required 批次、RC12-F 与交接均完成，才可标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`。

### 10.4 当前 F 交接

RC12-F 的本地矩阵与交接草案已完成，见 `docs/editorial/komatsu36-rc12-release-readiness-handoff.md`。该文件当前仍是 `LOCAL QA COMPLETE`，因为人工停点 1/2 尚未产生 `PRODUCT-ACCEPTED`，RC12-E 也只保留默认延后建议。

## 11. 明确非目标

本阶段不做：

- Playback playhead；
- Quick / Detail；
- 移动端额外 Timeline sticky bar；
- 统一三轨时间或 cross-track offset；
- Transcript、Evidence、Chat 浏览器；
- X inline replay；
- 新 Event、新 Person schema 或散文身份推断；
- React、SSR、database；
- 自动开启 Release Gate；
- 自动 merge、deploy 或修改 `project.status`。

## 12. 停止与交接条件

### RC12-A 后

如果 Compact 已解决 People 空间问题，不实现 Minimized；如果未解决，先提供浏览器证据，再决定 A2，而不是直接继续加状态。

### RC12-C 后

如果 People / Cast 已在四视口稳定，不为追求绝对像素一致重写人物 schema。

### RC12-D 后

如果平台识别明显改善，不增加官方品牌彩色大 Logo。

### RC12-E 前

没有用户明确提升优先级时，写入 `DEFERRED TO V1.1`，不得让它阻塞现有 v1。

### RC12-F 后

新增独立 RC 0.12 handoff，记录 commit、payload、四视口证据、人工裁决、未执行边界与 Release Gate 状态。即使 review branch acceptance complete，Release Gate 仍保持 CLOSED，直到用户另行授权 merge / deploy。
