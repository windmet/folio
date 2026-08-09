# RC 0.11 R4 QA — Lazy static Search JSON

> 状态：通过，随 R4 Search JSON 批次提交
> 路由：`/projects/komatsu36/?view=timeline`
> 范围：仅 Search 的 build-time JSON、首用加载、结果导航与 publication gate；不改变 Timeline reader content、Source Event Index、Thread/Person 数据或 Player Rail。

## 构建与 publication

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
git diff --check
```

| 指标 | R4 结果 |
|---|---:|
| Raw HTML | 257,893 bytes |
| Gzip level 9 | 45,501 bytes |
| Brotli quality 11 | 28,998 bytes |
| Raw hard gate / remaining | 358,400 / 100,507 bytes |
| Initial `data-search-item` / `data-search-text` | 0 / 0 |
| Search JSON | 63,433 bytes |
| Search JSON items | 158（Event 124 / Thread 16 / Person 18） |
| Initial Source Event buttons / controller records | 0 / 124 |

`validate:publication` 读取 `dist/projects/komatsu36/search.json`，核对 schema version、公开项目、稳定排序、最小字段、Event 的 `trackId/startMs`，以及 withheld / qualification / 私有路径 leakage。JSON 只保留结果渲染和已有导航事务所需字段。

## Preview 浏览器证据

构建后 preview 使用真实项目路由，在桌面与窄视口检查页面 overflow 与控制台日志：

- 初始 1440×900、390×844：Search 结果按钮 `0`，`data-search-text` `0`，endpoint 为 `/projects/komatsu36/search.json`，状态为“首次输入时加载公开索引。”，错误 alert 隐藏，页面 overflow `0`。
- 第一次 focus：状态变为“公开搜索索引已加载 · 158 项”；未输入查询时仍不生成结果按钮。代码通过 `searchLoadPromise/searchLoaded` 复用同一份请求。
- 查询 `章鱼烧`：得到 8 项（4 Event、1 Thread、3 Person）；首个 Event 跳转 `?view=timeline&event=yt-011522-takoyaki-proposed`，TARGET 为 `01:15:22`，Search panel 隐藏。
- 查询 `时限炸弹`：得到 Thread `russian-takoyaki`；点击后 URL 为 `?view=storylines&event=yt-011522-takoyaki-proposed&thread=russian-takoyaki`，Storylines 与对应 Thread detail 可见。
- 查询 `内田`：得到 Person `内田修一`；点击后 URL 为 `?view=people&person=uchida-shuichi`，Person panel/detail 可见；Back 返回 `?view=people` 且详情关闭。
- 390×844 查询 `小松`：生成 86 个结果按钮，结果列宽约 326.16px，overflow `0`；查询 `zzzz-no-match`：结果按钮 `0`、empty 状态可见、计数为 `0 条结果`。
- `tabP1.dev.logs()` 返回 `[]`。

## 失败路径与边界

- `ensureSearchIndex()` 对非 2xx、非法 schema 或非法 item 显示可读 `role=alert`，并保持核心档案可用；本批未通过修改生产构建产物或注入拦截器来伪造网络失败，因此该 alert 的浏览器故障注入仍标为 **TODO consumer-check**。
- 真实音频、长时播放、生产部署与 Release Gate 仍为 `NOT EXECUTED`；本 QA 不把静态构建或短时 preview 提升为 release-accepted。
