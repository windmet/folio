# RC 0.11 R3 QA — Dynamic Source Event Index

> 状态：通过，随 R3 Source Index 批次提交
> 路由：`/projects/komatsu36/?view=timeline`
> 范围：仅 Source Event Index；Search、Timeline reader content、Thread、Person 与 Player Rail 未改动

## 构建与 publication

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
git diff --check
```

| 指标 | R3 结果 |
|---|---:|
| Raw HTML | 330,024 bytes |
| Gzip level 9 | 63,584 bytes |
| Brotli quality 11 | 33,685 bytes |
| Raw hard gate / remaining | 358,400 / 28,376 bytes |
| Initial `data-source-event` buttons | 0 |
| Source list hosts / browse buttons | 3 / 3 |
| Controller Event records | 124 |
| Timeline Event cards | 104 |
| Search items | 158 |

`validate:publication` 现在核对 browse shell、list hosts、controller Event 的 `id / trackId / startMs / title` 完整度和无初始 Source Event button；不再要求静态 Source Event buttons。

## 构建后 preview 浏览器证据

| Viewport | 结果 |
|---|---|
| 1440×900 | 初始 buttons `0`；首次 YT 展开生成 `104`；重复展开仍为 `104`；页面 overflow `0`；Player frame `390px` |
| 1366×768 | 初始 buttons `0`；页面 overflow `0`；Player frame `372px` |
| 390×844 | 初始 buttons `0`；点击 YT 浏览生成 `104`；Source Index 可见；页面 overflow `0` |

### 交互矩阵

- YT 首次展开：104 buttons，首项 `00:01:00`，末项 `04:56:35`，按 `startMs → id` 排序；
- SP1 切换并展开：8 buttons；SP2 切换并展开：12 buttons；三轨只显示当前 list host；
- 动态 Event `sp1-004324-space-restart` 选择后 URL 为 `event=sp1-004324-space-restart`，Player TARGET 更新为 `00:43:24`，按钮获得 `is-active`；Back / Forward 恢复 `track=space-1` 与 Event URL；
- Source Index 使用 list-level delegation，动态 button 不依赖初始 `connectedCallback()` 查询；页面内重复展开不重复追加；
- 应用 console error / warning：0；
- 当前公开 fixture 的 20 个 Space Event 中，19 个为 1 Thread、1 个为 2 Threads、0 个为 0 Threads。0-Thread fallback 仍保留在 `navigateToEventContext()` 的空数组路径，并在 `focusSourceEvent()` 前 ensure list；本批不伪造公开 Event 数据，故不把 0-thread 写成 consumer-verified。

真实音频、长时播放与 production preview：`NOT EXECUTED`，不由本批宣称。
