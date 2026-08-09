# RC 0.11 R5 QA — Desktop proportional Timeline Navigator

> 状态：通过，随 R5 UX11-D 批次提交
> 路由：`/projects/komatsu36/?view=timeline`
> 范围：仅 Timeline 左内容列的 Desktop Navigator；不增加 `?act=`，不接播放器 current time，不显示 Event ticks，不混入 SP1 / SP2 时钟。

## 构建与 payload

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
git diff --check
```

| 指标 | R5 结果 |
|---|---:|
| Raw HTML | 261,080 bytes |
| Gzip level 9 | 46,163 bytes |
| Brotli quality 11 | 29,420 bytes |
| Raw hard gate / remaining | 358,400 / 97,320 bytes |
| Timeline Event cards | 104 |
| Navigator segments | 8 |
| Initial Source Event buttons / Search items | 0 / 0 |
| Controller Event records | 124 |

新增组件位于 Timeline `.view-heading` 后、Act 正文前；静态段宽使用各 Act `endMs - startMs` 作为 `flex-grow` 比例。Navigator 只存在于左内容列，Player column 与 Rail 未改变。

## Preview 浏览器证据

- 1366×768、1440×900、1920×1080：Navigator 均显示 8 段；分段 flex 比例为
  `0.225261 / 0.118458 / 0.042923 / 0.100863 / 0.161269 / 0.137398 / 0.111341 / 0.102488`，对应真实 Act 时长，不是等宽；页面 overflow `0`。
- 初始状态为 `ACT 01 / 08`，第一行同时显示标题与 `00:00:00–01:07:00`；滚动取样会更新 current Act 与 `aria-current="step"`。
- 点击 `A05` / `A08`：滚动后目标 Act header 位于 sticky Navigator 下方约 188px；current label 分别更新到 `ACT 05 / 08`、`ACT 08 / 08`；URL 保持 `?view=timeline`，没有 `act=` 或额外路由参数。点击事务使用 `showView('timeline', false)`，不调用 URL 写入。
- Navigator sticky top 由实际 Project Nav 高度（桌面约 69px）写入 CSS 变量；滚动到正文后 top 约 69px，底部不遮挡目标 Act header。
- 390×844：Navigator 按 UX11-D/R6 边界隐藏，保留原有 Project Nav、mini-player 与 Timeline；页面 overflow `0`。移动方案留到 R6 单独比较，不在 R5 叠加第三条 sticky bar。
- `tabP1.dev.logs()` 返回 `[]`。

## 边界

- 本批只表达阅读位置（Reading Position）；未连接播放器播放头或自动 Event 更新，F/G 仍按 Runbook 延后/条件裁决。
- 真实音频、长时播放、生产部署与 Release Gate 仍为 `NOT EXECUTED`；本 QA 不把 build preview 提升为 release-accepted。
