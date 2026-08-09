# RC12-E E4/E5 回归交接

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；`PRODUCT-ACCEPTED` 待人工停点
> 日期：2026-08-10
> 项目：`komatsu36`
> 本地路由：`http://127.0.0.1:4321/projects/komatsu36/?view=timeline`
> 权威实现入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本文件记录 RC12-E 第一版完成后的 E4/E5 工程与本地 Browser 回归，不把工程证据扩大为产品接受、真实媒体通过或 Release Gate 开启。E1–E3 的实现边界和历史矩阵仍见同目录 `README.md`。

## 1. 当前实现合同

| 合同 | 当前结果 | 证据 |
|---|---|---|
| Timeline scope | YT／SP1／SP2 三个 native-clock scope；YT 保留 8 Act／104 Event；SP1 8 Event；SP2 12 Event | `ProjectArchiveShell.astro`、`SourceTimeline.astro`、publication validator |
| URL/history | 无 Event 时 `track` 表示 scope；有 Event 时 Event id 权威推导 track；Back／Forward 恢复 scope 与 selected Event | Browser 直链、Back／Forward |
| External boundary | SP1／SP2 不创建伪播放器或 iframe；现有单一 player mount 不因切换 scope 增加 | Browser mount/iframe 计数 |
| Accessibility contract | scope 控件是 native `button`，带 `aria-pressed`、有效 `aria-controls` 和 `aria-label`；panel 同步 `aria-hidden`／`aria-labelledby`，scope 描述使用 `aria-live=polite`；focus-visible 保留可见焦点环 | `scripts/validate-publication.mjs`、CSS 计算样式 |
| Source-local time | SP1／SP2 显示各自 `NATIVE CLOCK`、独立 duration 和本地事件时间，不换算到 YT 轴 | SourceTimeline header 与首项时间 |

## 2. E5 Browser 回归记录

测试入口为本地 Astro background server `127.0.0.1:4321`；只验证静态本地页面，不代表 production origin。

| 场景 | 结果 |
|---|---|
| 默认 Timeline | 3 个 scope button；YT `aria-pressed=true`；YT panel 可见、SP1／SP2 隐藏；YT 104 Event；document overflow `0`；iframe `0` |
| SP1 scope click | URL `?view=timeline&track=space-1`；SP1 8 Event；首项 `00:02:40`；Player label `X Space ①`；YT panel 隐藏；iframe `0`；overflow `0` |
| SP1 Event deep link | 点击首项时间按钮后 URL `?view=timeline&event=sp1-000240-audio-finally-live`；selected card、TARGET 文案和 scope 同步；iframe `0` |
| SP1 Back／Forward | Back 恢复 `track=space-1` 且无 selected Event；Forward 恢复 SP1 Event deep link、selected card 和 scope |
| YT Event deep link | 直链 `?view=timeline&event=yt-000100-stream-start` 恢复 YT scope、selected Event 和 `TARGET · 00:01:00`；YT panel 可见；iframe `0`；overflow `0` |
| SP2 direct + refresh | 直链 `?view=timeline&track=space-2` 连续加载后仍恢复 SP2；12 Event；首项 `sp2-000003-finally-vertical`／`00:00:03`；header 明确 `SP2 · NATIVE CLOCK`；Player label `X Space ②`；iframe `0`；overflow `0` |
| Player mount invariant | 从 SP2 切回 YT 再切 SP1：`.archive-player__mount` 始终 `1`，iframe 始终 `0`；没有第二个媒体实例 |
| Focus indicator | 点击 scope 后焦点仍在原生 button；计算样式含红色 `outline` 与 `outline-offset` |
| Page console | 页面 `error/warn = []`；Browser 工具自身 Statsig 网络／dropped-events 日志不属于页面 console |
| Narrow viewport | 390×844 的三列 scope tabs、SP1 8 Event 和无横向 overflow 证据保留在 `README.md`；当前 Browser surface 无 viewport resize API，未重复伪造该尺寸数据 |

## 3. 自动门禁

以下命令在当前工作树顺序执行并通过：

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
git diff --check                         PASS
```

当前产物指标：raw HTML `291,492` bytes；Gzip `50,600`；Brotli `31,995`；350 KiB hard gate 余量 `66,908`；publication validator 通过 `3` 个 RC12-E scope、`124` 个 controller Event records 和三 track native-clock projection。

## 4. 尚未关闭的停点

- `NOT EXECUTED`：Browser 驱动的 Tab → Enter／Space 激活消费检查。当前 Browser surface 对现有 view-nav 与新增 scope button 均只能完成聚焦，未可靠触发 click；因此不将其写成键盘消费通过。native button／ARIA 合同已有 source/static 证据。
- `NOT EXECUTED`：真实 YouTube／X Space 播放、真实音频、长时 soak、production origin、production deploy。
- `PRODUCT-ACCEPTED` 仍待用户在桌面与 390px 人工确认信息层级、事件密度、native-clock 语义、播放器邻接关系和键盘使用感受。
- `Release Gate` 保持 `CLOSED`；本交接不授权 merge、deploy 或公开状态变更。

## 5. 下一批次

在产品人工停点明确接受前，只继续修正 E4 的视觉／可访问性细节并补证据；不得把本文件改写成产品接受，也不得回头混改 RC12-A2/C2/D2/B2/F2 已冻结合同。
