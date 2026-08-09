# Komatsu36 RC 0.11 Static Payload Pass 实施规格

> 状态：P2 IMPLEMENTED / NEXT IMPLEMENTATION (UX11-D)
> 优先级：P0，独立工程治理；不阻塞或裁减已完成的 UX11-C
> 审计基线：`effa314`；R4（P2）完成后的当前 publication 基线：257,893 bytes
> 范围：只治理初始 HTML 中的工具型重复投影；不拆 Timeline、Thread、Person，不改变内容 schema、URL schema、媒体能力或发布状态。

## 1. 结论

当前 350 KiB 是 Folio 自己的 initial HTML 架构门禁，不是 Cloudflare Pages 的单文件平台上限。Cloudflare Pages 当前单个静态资源上限为 25 MiB，且 `text/html` 可按客户端与配置使用 Gzip、Brotli 或 Zstandard；这些事实只说明页面不会因平台单文件大小被拒绝，不代表浏览器的解压、HTML parse 和 DOM 创建成本可以忽略。UX11-C 完整实现后 raw HTML 为 353,913 bytes，仍低于 358,400-byte hard gate；因此 Payload Pass 的理由是减少重复投影和长期控制解析成本，不是用体积压力缩水产品功能。

官方依据：

- Cloudflare Pages file size：<https://developers.cloudflare.com/pages/platform/limits/#file-size>
- Cloudflare content compression：<https://developers.cloudflare.com/speed/optimization/content/compression/>
- Astro static file endpoints：<https://docs.astro.build/en/guides/endpoints/#static-file-endpoints>

本轮保留“主要阅读内容静态渲染”的产品合同，只把首次交互前不需要、且已经在别处重复表达的工具型索引移出初始 DOM：

```text
继续静态 HTML                  移出初始 HTML
────────────────────────────────────────────
Timeline / Act / Event 正文     Source Event Index buttons
Thread detail / Markdown body   Search result buttons / searchText
Person detail
Player / Controller 必需状态
```

## 2. 2026-08-09 可复测基线

在 `effa314` 执行 `npm run build`，读取 `dist/projects/komatsu36/index.html`，使用 Node `zlib.gzipSync(level=9)` 与 `brotliCompressSync(quality=11)` 得到：

| 指标 | 当前值 | 含义 |
|---|---:|---|
| Raw HTML | 352,541 bytes / 344.28 KiB | 浏览器解压后需要解析的文档；当前 350 KiB 门禁剩余 5,859 bytes |
| Gzip | 68,711 bytes / 67.10 KiB | 传输参考，不替代 raw / DOM 指标 |
| Brotli | 35,342 bytes / 34.51 KiB | 传输参考，不替代 raw / DOM 指标 |
| Search section | 73,355 raw bytes | 包含搜索 shell 与 158 个隐藏 result buttons；是毛体积，不等于最终可净减的精确值 |
| Source Event Index | 24,973 raw bytes | 包含 shell 与 124 个静态 Event buttons；是毛体积 |
| Controller JSON | 22,090 raw bytes | 运行时必需；不是当前第一减重目标 |
| 近似 opening tags | 5,037 | 仅作趋势指标，不冒充完整 DOM node count |

UX11-C 完整实现叠加 R1（opaque Player + Lead Person hierarchy）后的 publication raw 为 354,388 bytes，Gzip 为 69,334 bytes，Brotli quality 11 为 35,690 bytes；相对 `effa314` 增加 1,847 raw bytes，门禁仍余 4,012 bytes。该值是当前功能基线，不是要求 UI 继续压缩的理由。

两个工具型 section 毛体积合计 98,328 bytes，约占当前 raw HTML 的 27.9%。这证明优先级应提升，但实施后的净节省必须由新 audit 重测，不能直接把 98,328 bytes 当作承诺值。

当前投影计数：

| 投影 | 数量 |
|---|---:|
| Timeline Event cards | 104 |
| Source Event Index buttons | 124 |
| Search items | 158 |
| Thread details | 16 |
| Thread node buttons | 84 |
| Person details | 18 |
| Person Event rows | 213 |

“同一 Event 被重复六次”应理解为多个 reader / tool projection 共享相同事实，不是六份完全相同的数据。Thread 与 Person 含有独立阅读价值，不能仅因引用 Event 就视为可删冗余。

## 3. 审阅意见裁决

| 审阅判断 | 本地核对 | 裁决 |
|---|---|---|
| 350 KiB 不是 Cloudflare 上限 | validator 本地写死 `350 * 1024`；Cloudflare 官方单 asset 为 25 MiB | **采纳**：文档明确区分 Folio target 与平台限制 |
| 先做 Payload Audit，再继续 Rail | 审阅时只输出总 raw bytes；随后完整 Rail 构建为 353,913 bytes，仍通过门禁 | **修正执行顺序**：Payload 仍为 P0，但不阻塞已完成 Rail，也不得裁减功能 |
| Source Event Index 动态生成 | 124 个静态 button 需要的 `id/trackId/startMs/title` 已在 controller events 中存在 | **采纳，P0** |
| Search 外置为 lazy static JSON | 158 个隐藏 button 占 Search section 73,355 raw bytes；Astro static endpoint 可在 build 生成 JSON | **采纳，P0** |
| Thread / Person 同时 lazy-load | 涉及 Markdown render、dialog history、focus 与 Event 回链，且属于 reader content | **延后**：不进入本 Pass |
| Controller 增加全量 Act 字段 | 当前 controller 仅 22,090 bytes；YT Act 已从 Timeline DOM 派生，没有序列化 `actId/order/title` | **不采纳**：这是过时假设，继续避免重复 Act 文案 |
| 立即改为 350 target / 450 hard cap | 当前仍低于 350 KiB，且两项便宜减重尚未实施 | **暂不采纳**：迁移完成前保留现有 350 KiB hard gate；用数据决定是否需要双层门禁 |
| UX11-A/B 尚未提交 | 已提交为 `effa314` | **过时** |
| 主开发文档顶部落后 | 旧审阅时曾停留在 RC 0.10；当前已切到 RC 0.11 并引用分批收尾 Runbook | **已完成** |

## 4. 实施顺序与提交边界

本规格的三批按 P0 → P1 → P2 执行，现已全部完成并各自独立提交。下一批转入 UX11-D；跨批进入条件、提交 / push 规则、UX11-D～H 与 Release Gate 收尾见 `komatsu36-rc11-closeout-runbook.md`。

### UX11-P0 — Payload audit instrumentation

新增可重复入口，例如：

```text
npm run audit:payload -- komatsu36
```

要求：

- 读取构建后的 project HTML，输出 raw / gzip / brotli；
- 输出 Timeline、Source Index、Search、Thread、Person 与 Controller JSON 的计数 / bytes；
- 指标名称和计算方法固定，结果可供 CI 与交接文档引用；
- 不新增运行时依赖，不修改发布内容，不把压缩体积当作 raw gate 的替代；
- 缺少或过期的 `dist` 时必须明确提示先 build，不能静默读取错误文件。

提交边界：只加入 audit script、package entry、fixture / 文档；不改页面 DOM。

#### P0 退出证据（2026-08-09）

`scripts/audit-payload.mjs` 通过 `npm run audit:payload -- komatsu36` 提供固定 `schema_version: 1` JSON。当前 R2 构建输出为 raw `354,388`、Gzip level 9 `69,334`、Brotli quality 11 `35,690`；raw gate 余量 `4,012`。Projection breakdown 为 Timeline `104 / 101,551` bytes、Source Event `124 / 24,973` bytes、Search `158 / 73,355` bytes、Thread `16 / 33,903` bytes、Person `18 / 66,983` bytes、Controller JSON `22,090` bytes / `124` Event records。审计会比较 output 与 source mtime；缺少或过期的 `dist` 明确要求先 build。页面 DOM、发布字段、URL 和运行时行为未在 P0 改动。

### UX11-P1 — Dynamic Source Event Index

`MediaSourceNavigator` 只保留可访问的 index shell 与空 list host。第一次展开某 Track 时，Controller 从现有 `this.data.events` 过滤、按 `startMs → id` 排序并生成该 Track 的 buttons；生成后在本次页面生命周期缓存。

必须同步处理：

- 使用 list-level event delegation，不能只在 `connectedCallback()` 绑定初始 `[data-source-event]`；
- `showSourceEventIndex()` 在显示 / 聚焦前确保对应 Track 已生成；
- `focusSourceEvent()` 对 0-Thread Space 回退仍能找到并聚焦目标；
- 三个 `data-source-browse` 的 `aria-expanded` / `aria-controls` 保持正确；
- `validate:publication` 不再要求初始 HTML 含静态 Event buttons，改为核对 browse shell、controller Event 完整度和交互 fixture；
- 不增加 endpoint 或网络请求。

提交边界：只动态化 Source Event Index；Search 保持原状。浏览器验收 YT / SP1 / SP2 展开、Event 选择、Space 0-Thread fallback、Back/Forward 与键盘。

#### P1 退出证据（2026-08-09）

R3 构建后的初始 HTML 为 raw `330,024`、Gzip level 9 `63,584`、Brotli quality 11 `33,685`，raw gate 余量 `28,376`。`data-source-event` 初始 button 为 `0`，保留 3 个 list host；Controller JSON 仍为 `124` 条 Event records。首次展开后由 `ensureSourceEventIndex()` 按 `startMs → id` 生成并缓存：YT `104`、SP1 `8`、SP2 `12`。`validate:publication` 已改为核对 shell、controller Event 的 `id / trackId / startMs / title` 完整度与无初始 button，而不是要求静态按钮。当前公开 Space fixture 没有 0-Thread Event；代码保留空数组 fallback，未伪造内容数据。

### UX11-P2 — Lazy static Search JSON

使用 Astro build-time static endpoint 生成：

```text
/projects/komatsu36/search.json
```

推荐文件结构：

```text
src/pages/projects/[slug]/search.json.ts
src/lib/projectSearchIndex.ts
```

共享 builder 负责公开索引投影和稳定排序，避免 endpoint、UI 与 validator 各自复制字段规则。JSON item 只包含渲染与导航所需的最小字段：

```ts
type ProjectSearchItem =
  | { kind: 'event'; id: string; label: string; title: string; searchText: string; trackId: string; startMs: number; preferredThreadId?: string }
  | { kind: 'thread'; id: string; label: string; title: string; searchText: string }
  | { kind: 'person'; id: string; label: string; title: string; searchText: string };
```

运行时合同：

- 初始 HTML 只保留 search field、results shell、empty/loading/error status，不含 158 个 result buttons 或 `data-search-text`；
- 第一次 focus 或首次输入时只 fetch 一次 JSON，并缓存到当前页面内存；
- loading / error 对 screen reader 可读；失败不能阻塞 Timeline、Thread、Person 等核心阅读；
- 搜索结果 DOM 按当前相同顺序按需生成，Event / Thread / Person 导航继续复用现有 controller 方法；
- Event、Thread、Person 公开字段边界保持不变，不把 qualification、私有路径或 withheld 数据写入 JSON；
- `validate:publication` 改为读取 `search.json`，验证 158 项、稳定顺序、公开字段和 leakage；不能再用“HTML 中有 158 个 `data-search-item`”作为成功条件。

提交边界：Search endpoint / builder / lazy UI / validator / browser QA 独立提交，不与 Player Rail 混做。

#### P2 退出证据（2026-08-09）

R4 构建后的初始 HTML 为 raw `257,893`、Gzip level 9 `45,501`、Brotli quality 11 `28,998`，raw gate 余量 `100,507`，同时达到 raw `<=300 KiB` 工程目标。初始 HTML 的 `data-search-item` / `data-search-text` 均为 `0`；`/projects/komatsu36/search.json` 为 `63,433` bytes，包含 Event `124`、Thread `16`、Person `18` 共 `158` 项。Builder 保留稳定顺序与公开字段边界，前端第一次 focus 或 input 只 fetch 一次并缓存，结果按需生成；失败显示可读 alert，不阻塞核心档案。`validate:publication` 已读取 JSON 并核对 count、顺序、最小字段与 leakage。

## 5. Budget 合同

在 UX11-P0/P1/P2 完成前：

- `validate:publication` 继续以 350 KiB（358,400 bytes）为 hard fail；
- audit 额外报告 gzip / brotli，但不设置未经基线论证的 compressed hard cap；
- 不把 Cloudflare 25 MiB 平台上限用作页面体验验收线；
- 不为了普通 UI 增量临时放宽 budget；同样不得用 budget 作为删除已验收产品能力的理由，超限时先治理已识别的重复投影。

UX11-P2 完成后：

- 必须记录新 raw / gzip / brotli、投影计数和净变化；
- required gate 仍为 raw `<=350 KiB`；工程目标是 raw `<=300 KiB`，若未达到必须用 breakdown 解释新增成本；
- 只有第二个大型 Project 或真实迁移数据证明 350 KiB target 与 hard cap 必须分离时，才另行决定 warning zone / 450 KiB hard cap；不能在本 Pass 预先放宽。

## 6. 非目标

- 不引入 React、数据库、SSR、Worker、Pagefind 或客户端路由；
- 不拆五个 View 为独立页面；
- 不把 Timeline / Thread / Person 改为 JS-only 内容；
- 不修改、缩水或回退已完成的 Player Rail 产品合同；
- 不新增 Transcript、Evidence、Event、媒体 provider 或 X widget；
- 不重开 Release Gate。

## 7. 退出条件

### Source / build

- `npm run audit:payload -- komatsu36` 给出稳定、可解释的 raw / gzip / brotli 与 projection breakdown；
- `npm run validate`、`npm exec -- tsc --noEmit`、`git diff --check` 通过；
- 初始 project HTML 不再静态包含 124 个 Source Event buttons 或 158 个 Search result buttons；
- `search.json` 恰好覆盖全部公开 Event / Thread / Person，并通过 leakage 与稳定排序验证；
- Timeline、16 个 Thread detail、18 个 Person detail 仍保留在静态 HTML；
- raw HTML 回到 `<=350 KiB`，工程目标 `<=300 KiB`；新基线写回本文件。

### Browser 1440×900 / 390×844

- YT / SP1 / SP2 的“浏览事件”首次展开、再次展开、切 Track 与 Event 选择正确；
- Space 0 / 1 / many context navigation 与 Source Index fallback 不回归；
- Search 第一次 focus 可加载，Event / Thread / Person 各抽一项并验证目标、URL、Back；
- 模拟 search JSON 请求失败时显示可读错误，核心档案仍可浏览；
- 键盘、focus、console、页面 / 组件 overflow 均通过；
- 不把开发服务器缓存当作 lazy-load 成功证据；在构建后的 preview 路由复测静态 JSON。
