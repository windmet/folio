# Komatsu36 RC 0.12 Product Correction Runbook

> 状态：`PRODUCT REVIEW RECORDED — CORRECTION REQUIRED`
> 裁决日期：2026-08-09
> 基线分支：`codex/komatsu36-project-archive`
> 前置状态：RC 0.11 `REVIEW BRANCH ACCEPTANCE COMPLETE`
> 当前入口：RC12-A2 → RC12-C2 → RC12-D2 → RC12-B2 → 人工复核 → RC12-F2
> 当前进度：RC12-A2/C2/D2/B2 `SOURCE-VERIFIED` + `BROWSER-VERIFIED`；人工停点 A2/C2/D2/B2 待确认
> Release Gate：CLOSED；本文不授权 merge、deploy 或修改 `project.status`

本文记录 RC12-A/B/C/D 第一版经过源码、构建和浏览器验证后，收到的产品层返工裁决。它是后续 agent 的**唯一实施入口**。原 `komatsu36-rc12-visual-polish-source-navigation-plan.md` 保存第一版规格与工程证据，不再代表下一批应直接收口；`komatsu36-rc12-release-readiness-handoff.md` 降级为被产品复核退回的本地 QA 快照。

这次裁决不否认既有工程验证，也不回写 RC 0.11 的完成状态。准确状态是：

```text
RC 0.11                         REVIEW BRANCH ACCEPTANCE COMPLETE
RC12-A/B/C/D first implementation SOURCE-VERIFIED + BROWSER-VERIFIED
RC12 product acceptance          REJECTED / CORRECTION REQUIRED
RC12 release readiness           NOT REACHED
Release Gate                     CLOSED
```

## 1. 产品裁决矩阵

| 范围 | 工程事实 | 产品裁决 | 后续状态 |
|---|---|---|---|
| Player 实心前景 | 已实现，底层内容不再穿透 | `PASS` | 冻结，不返工透明度 |
| YT 8-Act Navigator | RC 0.11 已完成 | `PASS` | 冻结，不重做 Timeline 主轴 |
| Player mode 状态框架 | 已有 `expanded | compact`、per-view preference、移动端规则 | `FRAMEWORK PASS` | 保留状态管理，替换 compact 投影 |
| 当前右栏 Compact | 只缩短 viewport，仍占右栏宽度 | `REJECTED` | RC12-A2：重定义为 Docked Bottom Bar |
| Target / Context 按需展开 | 已实现真实 overflow 检测、button、ARIA、touch/keyboard 路径；RC12-B2 已复用同一真实 overflow 机制覆盖 Act title 与 Source 长标题 | `ENGINEERING PASS, PRODUCT REVIEW PENDING` | 保留机制；人工确认完整标题入口与视觉密度 |
| People 单列卡 | 无 overflow，但桌面空间利用率与扫读效率下降 | `REJECTED ON DESKTOP` | RC12-C2：桌面横向高密度；移动投影保留 |
| Cast projection | 已有 table 与窄投影，工程压力测试无 overflow | `REVISE` | RC12-C2：明确 wide / medium / mobile 三档，不以横滚完成 |
| Source pictograms | RC12-D2 已重做 X Space 声场图标与 Source card 三层信息层级，并完成桌面／移动 Browser QA | `DIRECTION PASS, PRODUCT REVIEW PENDING` | 保留文字、外链、`?track=` 与 Source Event Index 合同；等待人工视觉确认 |
| Source-scoped Timeline | 未实现 | `BACKLOG / P1` | RC12-E 仍后置，不得伪报完成 |

`SOURCE-VERIFIED`、`BROWSER-VERIFIED` 与 `PRODUCT-ACCEPTED` 必须继续分开。此前压力矩阵证明“没有溢出和交互回归”，不能推导“桌面形态好用”。

## 2. 固定批次与顺序

```text
RC12-A2  Docked Player contract + implementation
  ↓ 人工停点 A2（先确认播放器形态，不带着错误外壳继续调其他页）
RC12-C2  People / Cast desktop projections
RC12-D2  Media Source hierarchy + icon system
RC12-B2  Remaining expandable text coverage
  ↓ 人工停点 C2/D2/B2
RC12-F2  Full regression and corrected handoff

RC12-E Source-scoped Timeline only starts after an explicit user decision.
```

不得把四批合成一次“大改一切”。每批独立：读取本节合同 → 改最小文件面 → 自动门禁 → 真实路由 Browser QA → 截止点记录 → scoped commit。上一批存在产品方向疑问时停止，不用下一批的 CSS 顺手掩盖。

## 3. RC12-A2 — Docked Bottom Player（P0）

### 3.1 产品合同

现有 `compact` 视觉被否决。后续代码可以为了迁移暂时保留内部字符串 `compact`，但 reader-facing 规格统一称 `docked`。最终状态建议收敛为：

```ts
type PlayerPresentationMode = 'expanded' | 'docked';
```

- `expanded`：保持现有右侧 sticky 完整播放器，Timeline / Storylines 默认使用。
- `docked`：播放器退出右侧内容列，成为固定在视口底部的播放栏，真正释放 Overview / People / Transcript 的正文宽度。
- 桌面 Dock 高度目标区间为 `56–72px`，最终值以 1366×768 和 1440×900 实测为准；不得把建议值当成无需验证的常量。
- Dock 至少常驻：平台／来源、当前本地时间、缩略视觉、Target 单行、播放或载入状态、展开完整播放器动作。
- Dock 不复制第二个 YouTube mount，不创建第二个媒体实例；同一 mount 在 Expanded / Docked 之间保持生命周期、Track、Event、target 和 seek。
- Dock 不写 URL、不创建 history entry、不改变 source-local clock；per-view preference 可继续使用 session storage，但 key 版本必须迁移或兼容，不能让旧 `compact` 值生成未知状态。
- 移动端不直接照搬桌面固定底栏。沿用当前移动 Player 合同，除非在独立移动截图中证明 Dock 不遮挡底部导航、正文、dialog 或安全区。

### 3.2 不可接受的替代实现

- 仅把右栏 viewport 再缩短一点；
- 用 `position: fixed` 覆盖内容，但不给页面预留 bottom inset；
- Dock 出现时仍保留空的 `.project-player-column` 占宽；
- 重建 iframe、重新 seek、切 Track 或暂停播放作为 mode 切换副作用；
- 删除节点、Act、线索、原链来换空间；Dock 可把这些动作收进明确的“展开播放器”，但 Expanded 必须完整保留；
- 以 payload 余量或 CSS 复杂度为理由缩水为纯文字通知条。

### 3.3 预计文件面

- `src/components/project/ArchivePlayer.astro`：Dock 投影结构与 reader-facing label；
- `src/components/project/ProjectArchiveShell.astro`：mode migration、per-view preference、布局状态；
- `src/components/project/PlayerContextRail.astro`：只在确有需要时补 Dock／Expanded 投影 hook，不改动作语义；
- `src/styles/project.css`：右栏释放、fixed dock、bottom inset、dialog/mobile stacking；
- `docs/qa/komatsu36-rc12/a2/README.md`：证据与人工停点结果。

### 3.4 A2 验收

- 1366×768 People 进入 Docked 后，正文列宽明显增加，Player 右栏不再保留空占位；document 和组件 overflow 均为 0。
- Expanded / Docked 首眼差异明确，不依赖读按钮文字才理解状态。
- 1440×900 Timeline 默认 Expanded；切 Docked 再展开后同一 Event、Track、target、URL 和媒体 mount 保持。
- Dock 不遮挡页面最后一项、底部交互、Search、Thread／Person dialog；键盘焦点顺序可理解。
- 390×844 维持已裁决的移动行为，mode toggle 不意外回归。
- A2 完成自动和 Browser QA 后必须先人工确认；未确认前不得开始“最终收尾”。

## 4. RC12-C2 — People / Cast Desktop Projection（P0）

### 4.1 People

People 数据、分组、Lead Person、Person panel 与四类 participation 不改。只重做索引投影：

- wide desktop：横向高密度 row，使用 `IDENTITY | PRIMARY RELATION | METADATA | COUNT` 四槽位充分利用正文宽度；
- medium desktop：允许压缩为两段或单行／双行 row，但仍保持身份、主关系、metadata 和 count 的固定起点；
- mobile：保留当前纵向阅读投影，不强塞桌面横排；
- 不用更小字体、隐藏 participation、截掉姓名或移除节点数来制造“高密度”；
- 容器查询必须基于 `.people-view` 实际 inline size，而不是只看 viewport。

### 4.2 Cast

- wide：`角色 | 昼 | 夜` table；
- medium：role row list，每个角色下明确列出昼／夜，不横滚；
- mobile：保留六角色纵向 projection；
- `overflow-x: auto` 只能作为异常保护，不能作为桌面验收结果；
- 三种投影的姓名按钮必须继续打开同一 Person dialog，并保留键盘和焦点恢复。

### 4.3 C2 验收

- 固定 1366×768、1440×900、1920×1080、901px 内容列、390×844；追加 820–1200px 断点压力抽查。
- 1366 People 不再是手机式长纵列，正文横向空间被实际使用；同时不得回到 RC12-C 前 `scrollWidth > clientWidth`。
- 抽样濱健人、堀金蒼平、寺島惇太、普通 Birthday participant，验证槽位、长短内容与缺省 metadata。
- Cast 在 wide / medium / mobile 三档均无横向拖拽，昼夜映射不丢失。

## 5. RC12-D2 — Media Source Hierarchy & Icons（P1，当前收尾必做）

### 5.1 信息层级

每张 Source card 固定三层：

1. **平台识别**：图标、平台名、来源代号 YT／SP1／SP2；
2. **次要状态**：`INLINE PLAYBACK`／`EXTERNAL SOURCE`、时长、`VIDEO`、`360°`、事件数，降低对比度但保持可读；
3. **动作**：站内播放／打开原来源／浏览事件，视觉上比状态说明更明确。

平台名和动作不能退位；状态词不能与平台名争夺第一视觉层。不得删除完整文本或以 icon 作为唯一语义。

### 5.2 图标合同

- YouTube：克制的几何播放窗；
- X Space：重新绘制为圆形声场／radiowave／conversation-space 语义，不保留当前被否决的具象 mic 线条；
- 两者单色、同一 stroke weight、相同 optical size；不引入官方彩色大 Logo；
- SVG 继续 `aria-hidden="true"`，accessible name 来自完整平台文字；
- Source card 与 Player switcher 复用同一组件和图形，不出现两套图标语言。

### 5.3 D2 验收

- 1440 Overview 首眼先识别三个平台／来源，再看到状态，最后看到动作；
- 1366 与 390 均不因图标新增产生拥挤、断词或横向 overflow；
- X Space 图标不再被理解为具体麦克风物体，YT／SP1／SP2 在单色条件下仍可区分；
- 文本、source selection、`?track=`、Source Event Index、canonical link 与 external 能力合同无回归。

本批次工程与 Browser 证据见 `docs/qa/komatsu36-rc12/d2/README.md`。证据只把 D2 标记为 `SOURCE-VERIFIED` + `BROWSER-VERIFIED`，不替代人工 `PRODUCT-ACCEPTED`。

## 6. RC12-B2 — Complete Expandable Text Coverage（P0）

保留当前 `ResizeObserver`、真实 overflow 判断、inline button、`aria-expanded`／`aria-controls` 机制，不重写成纯 tooltip。

需要补齐并逐项核对：

- Target；
- Reading Context；
- 当前 Act／章节完整标题；
- Media Source 中过长的平台／来源标题。

默认 clamp；只有实际 overflow 才显示“展开”；展开后显示全文并可“收起”。桌面 `title`／tooltip 只能作为增强，touch、keyboard 和移动端必须有可点击全文入口。Timeline Navigator 小 segment 可以继续截断，但其当前章节 header 必须提供完整标题。

## 7. RC12-E — Source-scoped Timeline（显式 backlog）

本次审阅确认它值得正式保留，但不强行并入视觉返工。其合同仍是 Timeline scope switch：YouTube 主线／X Space ①／X Space ②，各自使用 source-local clock 和 Event list；不得把三条来源混成伪统一时间轴。

只有用户明确说“纳入当前 v1／本轮”才启动。Media Source Navigator、Source Event Index 或来源图标都不等于 Source-scoped Timeline。任何 agent 不得因为“已有来源浏览能力”将 E 标记完成，也不得因为 E 后置而删掉现有 SP1／SP2 入口。

## 8. 每批门禁与证据等级

每个实现批次至少执行：

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
git diff --check
```

Browser 必须检查真实 `/projects/komatsu36/` 构建预览，而不是只看 dev DOM；记录 viewport、route/query、关键交互、console、document overflow 和相关组件 `clientWidth / scrollWidth`。涉及 mode、Track、Event、dialog 或 source selection 时补 Back／Forward、刷新、焦点恢复与 URL 不变／变化断言。

证据词固定：

- `SOURCE-VERIFIED`：源码和静态合同核对；
- `BROWSER-VERIFIED`：真实 route 与固定视口交互核对；
- `PRODUCT-ACCEPTED`：用户在人工停点明确接受；
- `NOT EXECUTED`：真实媒体、长时播放、生产或任何未做项。

构建成功、无 overflow、payload 低于 350 KiB 都不能替代 `PRODUCT-ACCEPTED`。当前 payload 余量是防回归门禁，不是删功能 KPI。

## 9. Git 与交接纪律

- 每批只提交本批文件和对应 QA 文档，使用 scoped commit；不得混入无关清理。
- 开始前、提交前、推送后记录 branch、HEAD、worktree；保留用户的无关改动。
- 文档状态只在证据成立后升级。第一版 QA README 保留历史事实，但必须注明产品裁决已 supersede 其“待接受”状态。
- A2、C2、D2、B2 全部通过人工停点后，才新增 RC12-F2 handoff；不得复用旧 handoff 标题冒充当前 release readiness。
- 即使 RC 0.12 最终 `REVIEW BRANCH ACCEPTANCE COMPLETE`，merge／deploy／`project.status` 仍由独立 Release Gate 授权。

## 10. 明确冻结与非目标

- 不回写 RC 0.10／0.11 acceptance 文档；
- 不重做 Lead Person、8-Act Navigator、124 Event、16 Thread 或三来源数据模型；
- 不统一 YT／SP1／SP2 时钟；
- 不新增 provider、X widget、私有 HLS、Transcript、Evidence、Chat 或 Tina Project 编辑器；
- 不以本轮视觉返工顺手改 reader-facing 内容真值；
- 不以 350 KiB 为由缩减 Rail、Source、People、Event、Thread 或 Person；
- 不 merge、不 deploy、不修改公开状态。

## 11. 下一位 agent 的启动检查

1. 读取本文全文，再读目标批次对应的旧实现与 QA；
2. 核对 `git branch --show-current`、`git rev-parse HEAD`、`git status --short`；
3. 确认本批只做 A2、C2、D2 或 B2 中一个；
4. 在动代码前写下本批“不改变”的状态／数据／URL 合同；
5. 完成后同时给出 source、browser、product 三种状态，不能用一个 `PASS` 混写；
6. 到人工停点就停止，不自行宣布产品接受或打开 Release Gate。
