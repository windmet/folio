# Komatsu36 RC12 Final Visual Closeout Batch

状态：实现中（2026-08-10）

这是一批在 RC12 interaction hierarchy cleanup 之后的最后视觉与交互收口。它不改变 Event、Thread、Person 或媒体来源的数据合同，也不把产品接受写成已经完成；完成条件必须同时包含源码门禁、构建产物检查和真实路由 Browser QA。

## 本批范围

### P0 — Thread 节点必须进入 Timeline

Thread panel 中的每个 `data-thread-event-id` 节点使用唯一的 `navigateThreadEventToTimeline(eventId)`：关闭 Search 和 overlay、清除返回焦点、选择 Event、切换到该 Event 的 source-scoped Timeline、只写入一次新的 history entry，并在下一帧聚焦目标 Event。原始 Thread URL 不被覆盖，Back 必须恢复原来的 `view` / `thread` 状态。

此路径适用于 YouTube、SP1 和 SP2。Event 本身决定 source scope；最终深链接不额外复制 `track`，除非 URL 没有 Event 而只是裸来源选择。

### P0 — 同一 Event 的多条事件线合并为一个 CTA

Timeline Event 只有一个入口：一条 Thread 直接显示该 Thread 的真实标题；两条或以上使用 native `details/summary`，摘要显示数量，展开后按稳定顺序显示分类 token、真实标题和单独的 `data-open-thread` 按钮。不能再次渲染多个相同“查看完整事件线”按钮，也不能把 Thread 标题硬编码进 Event 数据。

### P1 — 视觉语义分层

- 页面和组件结构级 kicker 保持英文 mono：`CHRONOLOGICAL CANON · SOURCE-LOCAL CLOCKS`、`TIMELINE SCOPE`、`CONTEXT RECONSTRUCTION`、`CURRENT SOURCE`、`SOURCE`、`READING CONTEXT`、`RELATED STORYLINES`、`STORY THREAD ·`。
- 读者语义 taxonomy 继续使用中文，但统一为 `.archive-taxonomy` 小号衬线 token；不再使用 `.archive-label-zh`。该 token 不得被通用 mono selector 覆盖。
- `360° YouTube` 不再占用 Hero 统计位；Media Sources 的来源卡继续承担平台能力与 360°说明。

### P1 — Hero 统计必须来自数据

Hero 仅显示三个派生统计：默认主直播时长、独立媒体数量、故事线数量。它们从 track/thread 数据计算，不允许写死 `04:57:26`、`YT + 2 Spaces` 或 `16 Story Threads`。移动端隐藏整组统计以保护首屏阅读密度。

## 验收矩阵

1. `npm run validate`、`npx tsc --noEmit`、`npm run audit:payload -- komatsu36` 和 `git diff --check` 通过。
2. Browser 在 1440px 与 390px 真实项目路由无 console error、无横向溢出；Hero 桌面显示 3 个统计，移动端不显示。
3. 在一个拥有两条 Thread 的 Event 上验证 native chooser；每个子项显示真实 Thread title 和 category。
4. 从 YT、SP1、SP2 Thread 节点进入 Timeline，URL 只保留 `view=timeline&event=...`（来源由 Event 推导），目标 Event 获得 focus / arrival 状态；Back 恢复原 Thread URL 和 overlay。
5. 检查 structural kicker 与 semantic taxonomy 的字体和层级，确认没有 `.archive-label-zh` 泄漏到源码、CSS 或 dist HTML。

## 明确不在本批

不改 RAW、source manifest、Event / Thread schema、媒体时钟换算、播放器供应商或移动端播放器形态；不以 bundle 大小为理由删掉多 Thread CTA、来源标题或导航状态。真实音频长时间播放仍属于独立的人工签名边界。
