# Komatsu36 RC12 Final Interaction & Hierarchy Cleanup

> 状态：`SOURCE-VERIFIED + BROWSER-VERIFIED — PRODUCT REVIEW PENDING`
> 日期：2026-08-10
> 基线：`231ef3e docs(komatsu36): record p1 browser and b2 checks`
> 目标：在不重开 RC12 大模块的情况下收口 P0 交互问题，并完成记录中的 P1 视觉降噪批次
> QA 账本：`docs/qa/komatsu36-rc12/final-cleanup/README.md`

## 1. 范围裁决

最新审阅确认 `Semantic P0/P1 + T1.1/Y1/M1/MT1` 已完成工程与 Browser QA。本轮不新增 RC 0.13，也不重开 Media Source、Timeline、Player Bubble、真实媒体或 Release Gate；批次名称固定为 `RC12 Final Interaction & Hierarchy Cleanup`。

本轮严格先完成两项 P0，再实施已登记的 P1 视觉降噪：

1. `Person → Thread overlay exclusivity`：Person 与 Thread 永远互斥；切换时只替换当前 overlay，不解锁 body、不恢复旧 Person 焦点、不把 `person` 与 `thread` 同时写入 URL。
2. `YT Player Act Context removal`：YT/default track 删除 Player 内重复的 Act Context。Timeline 视图不显示这块；非 Timeline 视图只保留轻量 `在 Timeline 查看此节点 →`。SP1/SP2 保留真正有价值的关系信息，但标签改为 `关联上下文`，摘要使用 `N 条相关事件线`。

P0 阶段明确不做、现已在本批后半实施：

- 全局替换 `.archive-kicker`；
- Media Sources 默认折叠（仅通过原生 `<details>`，不隐藏来源选择与证明）；
- 删除 Source Event Index 或修改 `?track=`／source browse 合同；
- 修改 Event、Thread、Person 数据或 URL schema；
- 任何为了 payload 大小而删减 reader-facing 功能。

## 2. P0-A Overlay 状态机合同

硬 invariant：

```text
Boolean(selectedPersonId) XOR Boolean(selectedThreadId)
```

`openThread()` 必须在打开 Thread 前调用 transition-only person dismissal；`openPerson()` 对称处理 Thread。transition dismissal 只隐藏旧 overlay、清除旧 selected id、更新 inert／Rail，不调用 `unlockPage()`，不恢复旧 trigger focus，也不 push 中间 URL。

普通 close 仍负责 unlock、恢复可见 trigger focus 和 URL replace。若 trigger 位于已隐藏的旧 overlay 中，则不得强行 focus；返回历史记录由 `popstate → restoreFromUrl()` 恢复对应 Person/Thread。

`restoreFromUrl()` 遇到异常的 `thread + person` 双参数时以 Thread 为优先，只打开一个 overlay，随后 replace 为互斥 URL。

必须 Browser 验证：

```text
People → 室元气 → 相关事件线
→ Thread visible
→ Person hidden
→ selectedPersonId = null
→ URL 只有 thread，没有 person
→ Tab 始终困在 Thread
→ Back 恢复 Person panel 与 person URL
```

## 3. P0-B Player Context 合同

YT/default track：

- `?view=timeline` 的 Player 只显示 CURRENT SOURCE、视频、TARGET 与 YouTube 当前时间外链；
- 不显示 `这一段在讲什么`、Act label 或 Act title 的重复文字块；
- `Overview / Storylines / People / Transcript` 中若仍有已选 YT Event，只显示轻量 Timeline CTA；
- 桌面 Rail 的 `Axx`、Timeline Navigator、MT1 Mobile Act Locator 和 Act chapter band继续承担章节定位。

SP1/SP2：

- 保留 Player context；
- reader-facing 标签固定为 `关联上下文`；
- 摘要固定为 `N 条相关事件线` 或 `暂无相关事件线`；
- 多条事件线的选择器仍可用，Source Event Index 合同不变。

390×844 Expanded Player 必测：YT 常见 Event 不再因重复 Act Context 产生不必要的内部滚动；Space 关系上下文仍可打开 Storyline。

## 4. P1 视觉降噪（本批已实施）

### P1-C 中文 UI label token

新增 `.archive-label-zh`，只迁移中文 taxonomy／动作标签：`当前播放`、`切换来源`、`选择时间线来源`、`相关故事线`、`故事线`、`相关上下文`、参与方式与来源事件标签。时间、代码、平台短码和 Event count 继续 mono；正文与 Event title 继续 serif。未全局改 `.archive-kicker`。

### P1-D Media Sources disclosure

Hero 下常驻摘要：`YouTube 主直播 + X Space ① / ②`、`三路媒体 · 各自原视频时间`、`查看 3 个媒体来源、时长与来源证明`。完整三卡放入默认收起的原生 `<details>`／`<summary>`，保留 keyboard、无脚本和现有 source selector／provenance／browse 合同。首批不退休 Source Event Index；`浏览事件 →` 的 `?track=` 行为保持不变，另行评估是否改为 `在 Timeline 浏览 →`。

## 5. 验收与发布边界

## 6. 当前执行结果

P0-A/P0-B 已完成源码、构建、静态门禁与真实路由 Browser QA。Person → Thread 已确认单一可见 overlay、`selectedPersonId` 清空、URL 只保留 `thread`、Thread 焦点循环有效；异常双参数 URL 也以 Thread 为优先。YT Timeline 在桌面／390px 均不再显示重复 Act Context；Overview 等非 Timeline 视图只保留轻量 Timeline CTA；SP1 的 Player 显示 `关联上下文` 与 `1 条相关事件线`。390px Expanded YT Player 的 `scrollHeight - clientHeight` 为 `0`。

P1-C/P1-D 已完成源码、构建与真实路由 Browser QA：中文 taxonomy 使用 `.archive-label-zh` sans-serif token；Media Sources 以常驻摘要 + 默认收起的 native disclosure 呈现，展开后仍包含三张 source card、来源证明与 Source Event Index。390px 与 240px 压力视口均无横向 overflow；`space-1` browse、`?track=`、Source Event Index 与 console 均已复测。`summary` 保持 native focus semantics；键盘手感仍属于人工产品停点，不用脚本替代 native 行为。

工程完成后执行了 `npm run validate`、`npx tsc --noEmit`、`git diff --check`、`npm run audit:payload -- komatsu36`，并完成真实路由 Browser QA、console／overflow／focus／URL 检查。工程／Browser 证据不等于 `PRODUCT-ACCEPTED`；真实 Android/iOS、真实媒体长时播放、merge、deploy 与 Release Gate 继续 `NOT EXECUTED / CLOSED`。
