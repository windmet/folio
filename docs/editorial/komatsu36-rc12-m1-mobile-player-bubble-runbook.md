# Komatsu36 RC12-M1 — Mobile Player Bubble & Compliant Playback

> 状态：`NEXT BATCH · SPEC LOCKED · NOT IMPLEMENTED`
> 日期：2026-08-10
> 输入：移动端 sticky Player 产品审计
> 前置：Semantic P1 UI Reader Language 已完成；开始 M1 前必须从其 clean commit 继续
> 边界：本文件只定义下一批，不授权本次交接继续改代码

## 1. 产品裁决

当前小屏 active Event 下的 sticky mini-player 合同被否决。移动端需要一个不占正文布局的 Player Launcher，以及按需展开的 non-modal floating panel。

Bubble 只是 presentation state 和媒体入口，绝不是隐藏／后台音频播放器。YouTube 面板收起时必须暂停；不允许把 iframe 隐藏或缩到 56px 后继续播放。政策与 API 边界以 [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies-guide)、[IFrame API Reference](https://developers.google.com/youtube/iframe_api_reference) 和 [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality) 为准。

## 2. 状态机

```text
Desktop: expanded <-> docked
Mobile:  expanded <-> bubble

No selected Event
└─ 不因状态机自动制造 Bubble；保留普通来源入口

Selected Event
├─ bubble（默认阅读状态）
│  └─ 用户点击 Launcher -> expanded
└─ expanded
   └─ 用户最小化 -> pauseVideo() -> 保存位置 -> bubble
```

- 仅选择 Timeline Event 不得强制展开 Player；正文位置不跳动；
- 明确点击时间／播放动作时可以展开并 seek；
- 从 bubble 恢复 expanded 后保持 paused，由用户主动继续；
- source、Event、URL/history 不因 presentation mode 改写语义。

## 3. 布局合同

- 移除 `≤600px + active Event` 下 `position: sticky; top: 59px` 与 `132×84` viewport 的长期合同；
- mobile bubble 固定在右下，建议 `56×56px`，使用 `bottom: calc(18px + env(safe-area-inset-bottom))`，不占 `.project-workspace` 布局；
- mobile expanded 为 non-modal floating panel，不锁 body，正文仍可滚动、选 Event、切来源；
- 面板宽度建议 `calc(100vw - 32px)`，video `aspect-ratio: 16 / 9`；390px 视口约得到 `358×201px`，真实 YouTube iframe viewport 不得小于 200×200；
- Bubble 位于右侧，避免遮挡 Timeline 左侧时间按钮；横竖屏与 safe area 必须实测；
- Thread／Person dialog 打开时 Bubble 隐藏；Search 是否保留以视觉实测裁决。

## 4. 播放与生命周期合同

- 保持 single `.archive-player__mount` / single `YT.Player` invariant；切 mode 不创建第二个 iframe；
- expanded → bubble：若 Player ready，必须调用 `pauseVideo()`；记录 `getCurrentTime()` 或 selected Event `startMs` 作为 resume 位置；
- bubble → expanded：优先保留同一实例与时间；若移动浏览器导致状态丢失，可以 seek 回保存位置，但仍保持 paused；
- 不提前锁定 `display:none`、`visibility:hidden` 或 off-screen 隐藏手段，必须由 Android Chrome 与 iOS Safari iframe 生命周期实测决定；选择标准不得以维持后台音频为目标；
- 未载入 YouTube 时，Bubble 展开到 poster + “载入播放器”，不得自动产生媒体流量；
- SP1／SP2 只显示 External Source launcher/card 与原来源 CTA，不得伪装“播放中”。

## 5. 不得顺手改动

- Event／Thread／Person 内容、Timeline scope、Desktop Player 交互；
- Payload、Source schema、Track clock、route 参数与 Release Gate；
- Semantic P1 第 14–15 节 Event copy（它保留为 M1 后的独立批次）；
- YouTube 后台播放、自动恢复播放或第二个播放器实例。

## 6. 实施批次

### M1.1 — 状态与静态合同

先增加 `bubble` presentation mode、断点状态约束、静态 validator 和旧 sticky/132×84 规则的否定门禁；不调整内容。

### M1.2 — Bubble 与 floating panel

实现 56px Launcher、mobile expanded panel、safe area、modal visibility 和 External Source 分支。保持 desktop computed layout 不变。

### M1.3 — 播放合规与恢复

加入 minimize pause、resumeMs、保持 paused、single mount 验证；不得用隐藏策略换取音频连续。

### M1.4 — Browser / device QA

自动化视口：390×844、360×800、414×896，并覆盖：

- selected Event 与普通选择不自动展开；
- 明确播放／seek、collapse pause、展开位置保留且不 autoplay；
- YT ↔ SP1/SP2 source switch；
- Thread／Person modal；Back／Forward；orientation；safe area；
- document overflow `0`、console clean、player mount/iframe 始终不超过 `1`；
- desktop 1440×900／1366×768 expanded↔docked 回归。

真实设备：Android Chrome 必做；条件允许补 iOS Safari。真实设备未执行时只能标 `NOT EXECUTED`，不得写 release-accepted。

## 7. 完成条件

M1 必须独立提交并提供 source/build/browser/device 分层证据。若只能完成自动化浏览器，不得把 YouTube iframe 隐藏行为写成已被真实移动设备接受。M1 完成后回到 Semantic P1 Event reader-copy 批次。
