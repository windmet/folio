# Komatsu36 RC12-Y1 QA Ledger

> 状态：`ENGINEERING + BROWSER VERIFIED — PRODUCT REVIEW PENDING`
> 实施入口：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`（Y1 合同）
> Release Gate：CLOSED

Y1 是 T1 之后的独立低风险 handoff 批次：用户点击 YouTube 当前时间外链时，Folio 清除 pending seek、停止播放同步并暂停当前站内 IFrame Player，然后保留普通外链导航。Y1 不创建 managed WindowProxy，不枚举或接管任意已有 YouTube 标签页；Y2 仍未实施。

## Source contract

`SOURCE-VERIFIED`

- `pauseEmbeddedForExternalHandoff()` 清除 `pendingSeekMs`；
- 停止 `playbackSyncTimer`；
- 在 Player ready 且存在 `pauseVideo()` 时调用 `pauseVideo()`；
- provider 状态切换或 teardown 期间暂停异常被安全吞掉，不阻止外链导航；
- fallback 与 Player context rail 两个入口均标记 `data-external-youtube-handoff`；
- `target="_blank"` 与 `rel="noopener noreferrer"` 保持不变；
- Y1 不修改 content schema、URL schema 或 Source-scoped native clock。

`scripts/validate-publication.mjs` 同时检查两个 handoff hook，并从 `ProjectArchiveShell.astro` 的独立方法片段断言 `pendingSeekMs = null`、`stopPlaybackSync()` 与 ready-player `pauseVideo()`；不会把只有 data marker 的空实现当作通过。

## Browser evidence

`BROWSER-VERIFIED`

真实路由：

```text
http://127.0.0.1:4322/projects/komatsu36/?view=timeline&event=yt-042252-seigura-superchat
```

Browser 读取到：

- active Event：`yt-042252-seigura-superchat`；
- Player fallback：`https://www.youtube.com/watch?v=jszQ4MQfRg8&t=15772s`；
- Player context rail 指向同一 timestamp URL；
- 两入口均为 `_blank` + `noopener noreferrer` + `data-external-youtube-handoff`；
- 页面 `scrollWidth=1351/clientWidth=1351`；
- console error/warn：0。

追加 consumer verifier 已对 fallback 与 Player context rail 两个已挂载入口分别分发 DOM `click`，并在阻止第三方默认导航的测试边界内确认每次都执行：`pendingSeekMs → null`、`playbackSyncTimer → null`、`pauseVideo() → 1 call`。第二入口另外模拟 provider teardown 时 `pauseVideo()` 抛错，handoff 仍安全完成且 console/pageerror 为空。

自动门禁不把打开第三方 YouTube 页面作为必要副作用；fallback 在正常 iframe 可用时按产品合同隐藏，因此自动化验证其挂载与 handler consumer，人工停点只需物理点击当前可见的 Player context rail 外链并判断新标签体验。可重复验证器：

```text
npm run verify:rc12:y1 -- <optional-screenshot-dir>
```

## Validation

```sh
npm run validate
npm exec -- tsc --noEmit
```

结果：通过；publication raw HTML `293,155 bytes`、158 search items、3 Timeline scopes、12 B2 expandable contracts、8 T1 segments/tooltips、2 Y1 handoff hooks。

## 未执行边界

- 没有真实媒体播放、长时 soak 或生产 URL 验收；
- 没有实施 Y2 managed external session；
- 不能检测用户任意已有 YouTube tab；
- 不把 Y1 engineering/browser evidence 升级为 `PRODUCT-ACCEPTED` 或 Release Gate 开放。
