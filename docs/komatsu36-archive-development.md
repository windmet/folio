# 小松昌平 36 岁生日会 Project Archive 开发设计

> 状态：RC 0.11 IN PROGRESS（2026-08-09；RC 0.10 Reader & Entity Editorial Pass 已完成）
> 目标：把一场多平台、多人物、长时、存在跨轨回收的活动做成可浏览、可追溯、可逐步发布的专题档案，而不是把工作稿直接塞进普通博客正文。
> 当前源档根：`E:\AI_Subtitle_Studio\02_Projects\小松昌平生日会`（只通过 CLI 参数或 `KOMATSU36_SOURCE_ROOT` 提供）
> 当前权威文档集：源档根下的 `复核md/` 带版本后缀文件；根目录同名无后缀文件是旧工作稿，不得自动选用。
> 当前站点：Astro 7 静态站点，TinaCMS 只管理普通 MDX 文章。

> **CURRENT CHECKPOINT**
> RC 0.10 A0 / A / B / C / D / E 已完成本地验收；RC 0.11 UX11-A / B 已提交为 `effa314`，UX11-C Desktop Player Context Rail 已按完整合同完成本地实现与浏览器验收。当前最高优先级仍是独立的 UX11-P Static Payload Pass，顺序为 payload audit → dynamic Source Event Index → lazy static Search JSON；它不得阻塞或裁减 Rail。当前 canonical 计划见 `docs/editorial/komatsu36-archive-navigation-pass.md`，Payload 实施合同见 `docs/editorial/komatsu36-static-payload-pass.md`。本文后续 Phase / 历史 Next Step 保留为设计演进记录；与本检查点冲突时以上述两份 RC 0.11 文档为准。

## 当前实施状态（2026-08-09）

- Phase 0A 已落地：`data/source-sets/komatsu36-20260808-r1.json` 精确锁定 6 个 `复核md/` 带后缀输入，并由 `validate:sources` 校验路径、SHA-256、物理行数与 16 条 ARC；
- Phase 1 垂直切片已落地：真实 `/projects/komatsu36/` 路由、集中状态控制器、YouTube 延迟加载与 pending seek、动态时间 fallback、Timeline、Thread、Person 和 URL 恢复均已实现；
- Phase 2 已进入小批量补密：8 个 `editorialStatus: confirmed` Act、16 条 Thread、124 个代表性 Event、18 个 Person。K36-EVT-B01～B06 已覆盖 Bingo 主奖表、前后两批礼物、留守组副节目、换装回归、02:27–03:45《俺知》名场面复盘、04:14–04:55 卡拉 OK／Super Chat 并发与二次会散场，以及开场、360°形式、Space 往返、来宾批次和换场锚点；B04 同步补齐伊藤友紘与山本誠大的人物反向索引。16 条 Thread 是 canonical ARC 的首轮网页化，不表示每个源表行均已成为公开 Event；
- `validate:projects` 现在要求 `defaultTrack` 有效且至少拥有一个 Act、Thread 数与 manifest `arcCount` 一致、8 个主轨 Act 无缝覆盖完整时长、`threaded` Event 必须被至少一条 Thread 消费、`timeline-only` Event 不得伪装成 Thread 节点、Thread 不得泄露 `withheld` Event、人物不得成为孤儿引用、`qualified` Event 必须附限定说明；
- `ConcurrentLanes` 已以局部注记形式落地，只显示经确认的并发关系，并明确禁止将其消费为跨平台 offset；
- Space 播放源决策已收口：用户提供的两条 X status 按创建时间与重开顺序映射为 SP1/SP2；页面只提供 canonical Space 外链，不重托管本地媒体，也不把 X 外链伪装成支持 timestamp seek；
- 公开 Event / Thread / Person 的轻量站内检索已落地：索引只来自发布内容，结果顺序固定，Event 结果可恢复稳定深链并切换到正确 Track；不索引 Transcript 与 Chat；
- `validate:publication` 已接入统一 `npm run validate`：当前构建核对 158 条公开检索项、350 KiB 单页预算，并阻止原始 ASR 文件标记、本机源档路径、`author_id`、SRT/VTT 文件名进入发布 HTML；同时要求 `published` Project 在首页拥有真实入口，并检查两条 canonical Space URL、三 Source 导航与 Source Event Index 的发布层结构仍存在；
- `.github/workflows/validate.yml` 已接入 push / pull request 验证：固定 Node.js 22.12.0，执行 `npm ci`、`npm audit --omit=dev`、完整 `npm run validate`，再执行 `npm exec -- tsc --noEmit`；TypeScript 检查特意放在 Astro build 之后，以便使用生成的 `astro:content` 类型；它只提供可审阅的 CI 证据，不触发部署；
- Cloudflare Pages 的首次 provision、构建设置、production 复测和证据追加步骤见 `docs/cloudflare-pages-release-checklist.md`；当前仓库没有部署 token 或 Wrangler 配置，不由本地自动执行；
- 额外静态检查边界已实测：仓库自带 `tsc --noEmit` 通过；临时安装 `@astrojs/check` 后，`astro check` 会扫描生成的 `public/admin` bundle 并在约 4 GiB 堆上 OOM，因此未纳入 Release Gate，也不保留该临时依赖；
- 依赖安全边界已收口：Astro `7.2.0`、MDX `7.0.5`、PostCSS `8.5.26` 等保留在构建依赖面；Tina CLI / runtime 只用于编辑器命令，已移入 `devDependencies`，`public/admin/` 继续忽略。2026-08-09 `npm audit --omit=dev` 为 0 vulnerabilities；完整 audit 的剩余项属于 Tina/GraphQL 等 dev-only 工具链，不执行无审查的 `audit fix --force`；
- 首页已增加独立“专题档案”书架，只消费 `status: published` 的 Project，并显示由 collection 实时派生的 Event／Thread／Track 数量；专题不混入四类普通文章筛选；
- 当前实现已完成 RC Media Pass：Hero 下方有常驻三来源栏，播放器有 Source Switcher，SP1/SP2 是 `video + external`，支持 `?track=`、Event 优先、Source Event Index、canonical Space CTA 与 provenance 链接；固定截图、本地 preview QA 与 RC 0.9 Structural Editorial Audit 已完成。该审计证明结构、关系、顺序与限定没有漏项，不等于读者文案已经终审；
- RC 0.10 Reader & Entity Editorial Pass 已完成；52/52 decisions、full reader pass 与 publication leakage gate 已通过。RC 0.11 UX11-C 已本地完成，当前未完成的是 UX11-P/D/E/F/G/H 与其后的 Release Gate。RC 0.10 历史合同见 `docs/editorial/komatsu36-editorial-experience-pass.md`；自动候选写入 `docs/editorial/komatsu36-reader-copy-candidates.generated.md`，人工真值只写入 `docs/editorial/komatsu36-reader-copy-decisions.yml`，生成器不得覆盖后者。八张既有截图保存于 `docs/qa/komatsu36-rc08/`，结构性审计见 `docs/qa/komatsu36-rc08/EDITORIAL-AUDIT.md`；源档中的词级、商品、speaker、画面和账号身份 TODO 仍保持原边界，不得在后续编辑中猜测补齐。项目特例 validator 拆分延后到第二个 Project 接入前；Transcript 与 Evidence 是明确延后项，不阻塞 v1。不得因 16 条 Thread 已出现而误报为完整 Folio 愿景已经完成；
- X Space inline replay 调查对本 RC 正式关闭：`STATUS: CLOSED FOR RC`，`RESULT: unavailable through verified public integration`，`FALLBACK: first-class external source`。除非 X 的公开产品能力发生变化并可对具体 URL 复测，否则不再调查 GraphQL 私有字段、内部 HLS、临时 token、Periscope 私有 endpoint 或 `media_key` 变换。

上述数字是当前仓库快照，新增内容后必须以验证器和实际文件计数更新，不作为永久常量。

## 1. 结论先行

本项目应新增独立的 `Project Archive` 内容类型和 `/projects/[slug]/` 路由。普通采访、广播和博文继续使用现有 `/posts/[slug]/`；不要让一场五小时活动的复杂性污染普通内容模型。

Project 页面以五个视图组织内容：

1. `Overview`：五分钟理解活动、参与者、三条主轴和精选事件；
2. `Timeline`：默认阅读入口，按主直播的 8 个候选 Act 建立方向感；
3. `Storylines`：把跨几十分钟、跨平台的 setup / development / payoff 组织为 Thread；
4. `People`：从人物及其别名进入相关事件；
5. `Transcript`：面向检索与考据，延迟加载，不进入首屏。

核心关系是：

```text
Project
├─ source track（独立媒体、独立时钟）
├─ act（主时间线的章节）
├─ event（唯一事实节点，可选归入 act；显式引用 person）
├─ thread（按编辑顺序引用 event，解释事件为何构成闭环）
└─ person（由 event 反向聚合）
```

时间线回答“现在在哪里”，Thread 回答“为什么有意思”。关系只手写一个方向：`Event → Person`、`Event → Act（optional）`、`Thread → Event`；反向索引在构建时生成。Claim / Evidence 到 Phase 4 再定义正式 schema，不进入 Phase 1 的半成品模型。

Event 另有 `narrativeMode: threaded | timeline-only`。默认 `threaded` 表示它必须由至少一条 Thread 消费；`timeline-only` 用于到场、单次礼物、节目转场等值得进入完整时间线、但不应为了通过校验而硬塞进闭环故事的节点。该字段只表达阅读组织方式，不改变 Event 作为时间与播放真值的地位。

## 2. 本次盘点的事实基线

### 2.1 网站现状

当前仓库并不是已有专题系统，而是一个仍接近最小骨架的 Astro 博客：

- `/posts/[...slug].astro` 把 MDX 渲染进统一 `max-w-prose` 单栏布局；
- `BaseLayout.astro` 的正文宽度和排版适合文章，不适合桌面端正文 + sticky player 双栏；
- `YouTubeEmbed.astro` 只显示缩略图并跳转 YouTube，没有 iframe、播放器状态或 `seekTo()`；
- 内容集合只有 `posts` 与站点级 `timeline`；
- TinaCMS 只建模 `posts`，并不知道 Project、Track、Event、Thread 或 Person；
- 没有自动化测试、结构化数据校验脚本或 Project 路由；
- `docs/` 当前没有已跟踪的开发文档；
- `BaseLayout.astro` 当前设置 `noindex, nofollow`，所以即使 Project 做完也不会被搜索引擎收录，是否解除需要另行决策。

因此，现有 MDX 组件可以复用视觉语言，但不能充当这个功能的架构基础。

### 2.2 资料规模（2026-08-08 快照）

| 资料 | 实测规模 | 用途 |
|---|---:|---|
| YouTube 主视频 | 4:57:26，约 6.61 GB | 主阅读坐标系、360°画面证据 |
| Space 1 | 43:38，约 426.7 MB | 独立 source track |
| Space 2 | 2:56:11，约 327.2 MB | 独立 source track |
| 主直播 SRT | 4,415 cues | 时间定位、旧音形证据 |
| Space 1 SRT | 529 cues | SP1 时间定位 |
| Space 2 SRT | 959 cues | SP2 时间定位 |
| Live Chat 搜索稿 | 33,929 条、935 个 author ID | 同期观众认知、专名与现场视觉线索 |
| 其中 Super Chat | 378 条，另有 8 条 super sticker | 感谢环节与现场互动证据 |
| 评论搜索稿 | 32 条、27 个 author ID | 低密度章节导航线索 |
| `复核md/komatsu36_main(20260808-084256).md` | 2,103 个物理行 | 主叙事权威输入 |
| `复核md/komatsu36_arcs(10).md` | ARC-01～ARC-16，共 16 条 | Thread 候选权威输入 |
| `复核md/komatsu36_space(20260808-085743).md` | 1,741 个物理行 | Space 叙事权威输入 |
| `复核md/komatsu36_review_todo(10).md` | 197 个物理行 | 发布门禁与复核队列 |
| `复核md/komatsu36_external_asr_raw(7).md` | 6,717 个物理行 | 外部 ASR 原样证据仓 |
| `复核md/小松昌平生日会流程-所有对话存档.md` | 33,368 个物理行 | 考据过程与溯源档案，不作为正文输入 |
| 复核切片 | 35 片 | 人工复核工作集，不是网站内容 |

### 2.3 版本误读的纠正

上一轮盘点误读了根目录的旧工作稿。机械复核结果如下：

- 根目录 `komatsu36_main.md` 是 1,193 行；权威修正版是 `复核md/komatsu36_main(20260808-084256).md`，共 2,103 行；
- 根目录 `komatsu36_arcs.md` 只有 15 条 ARC；权威修正版 `复核md/komatsu36_arcs(10).md` 有 16 条，并包含 ARC-16 Bingo 集中返礼；
- `space` 与 `review_todo` 同样以 `复核md/` 下带额外后缀的 1,741 行、197 行版本为准；
- 深层修正版内部的相对链接仍写成无后缀干净文件名，不能据此反向推断磁盘上的权威文件名；
- 文件行数只用于人工识别快照，工程门禁以 SHA-256 + `arcCount` 等语义计数为准。

其余产品判断仍需保留以下限定：

- “8 个 Act”最初只是建议稿；现已按 canonical 换场点完成编辑复核并标记为 `confirmed`。03:45–03:54 的 Space 往返归入 Act 6，03:53:50 的 Bingo 返礼入口开始 Act 7；
- 文本先称“三个阅读 Mode”，随后列出五个标签。本文统一称为“五个视图”，其中 Timeline 是默认主视图；
- 04:14 后的“歌唱轨 / Super Chat / 桌边插话轨”是同一主视频中重叠发生的叙事声部，并非三个可独立播放或静音的音频轨；UI 必须叫 `lane` 或“声部”，不能伪装成真正多轨混音器；
- TimelineJS 的设计经验可以参考，但本项目不需要引入 TimelineJS。现有复古文库视觉、回链需求和播放器联动更适合自有 Astro 组件；
- Podlove 的章节 / transcript 分层理念值得借鉴，但主媒体是 360° YouTube 视频，不能据此推断 Podlove Web Player 是合适的直接实现；
- Pagefind 当前没有安装，完整 Live Chat 也不应在 v1 直接塞进浏览器索引。

### 2.4 Source Set Manifest（Phase 0A 的首要产物）

迁移脚本禁止扫描目录、比较修改时间或猜测“最新文件”。它只能读取一个明确的 source-set manifest，并在读取内容前核对哈希与语义计数。当前应冻结为：

```json
{
  "sourceSetId": "komatsu36-20260808-r1",
  "files": {
    "main": {
      "path": "复核md/komatsu36_main(20260808-084256).md",
      "sha256": "2289f8f608411469fff12ac11a710c898d56300cc2b412ccfce5b2c27ebdc0a8",
      "lineCount": 2103
    },
    "arcs": {
      "path": "复核md/komatsu36_arcs(10).md",
      "sha256": "3cb19186b79a12bcbb2bda184afe009a8dc9e4a6757fbceed72eef9dc9e45df7",
      "lineCount": 603,
      "arcCount": 16
    },
    "space": {
      "path": "复核md/komatsu36_space(20260808-085743).md",
      "sha256": "486a070b370f97805d0bfe7c17324fe375515508ce5413f263815c131111b717",
      "lineCount": 1741
    },
    "review": {
      "path": "复核md/komatsu36_review_todo(10).md",
      "sha256": "6f9cc8138b22ce08d5409e6dcd379f2a26a1986f9099343122cfaf8690bebd48",
      "lineCount": 197
    },
    "externalAsrRaw": {
      "path": "复核md/komatsu36_external_asr_raw(7).md",
      "sha256": "58281b7c0af8064bf79cf047652edd326fecdb1636b98f5e588f2ce2645dbc65",
      "lineCount": 6717
    },
    "processArchive": {
      "path": "复核md/小松昌平生日会流程-所有对话存档.md",
      "sha256": "0605df8ab3f7778da8a4f3d71ebdb6c0082c38582cd39c762fac6383cbbb703b",
      "lineCount": 33368
    }
  }
}
```

Manifest 保存相对路径，不保存 `E:\...` 绝对根；根目录由 CLI 参数或 `KOMATSU36_SOURCE_ROOT` 注入。`(10)`、`(7)`、时间戳等后缀按当前实际文件名原样保存，不猜测它们的排序语义，也不重命名成“干净版本”。`project.json` 只记录 `sourceSetId` 和编辑修订号，运行时页面不读取 manifest 或本机源档。

## 3. 职责边界

### 3.1 四个环境，不互相冒充

| 环境 | 当前材料 | 职责 | 是否进入 Git / 页面 |
|---|---|---|---|
| Source archive | MP4、SRT、原始 Chat、Comments、external ASR | 保存原始证据，不做展示层改写 | 大文件不进入博客 Git |
| Editorial workbench | manifest 指定的带后缀 `main`、`space`、`arcs`、`review_todo`、复核切片 | 人工裁决、重写、追踪疑点 | 不直接发布 |
| Publication package | Project / Track / Act / Event / Thread / Person / Source records | 网站唯一可消费的结构化内容 | 进入 Git，必须可校验 |
| Runtime UI | Astro 页面、播放器、drawer、索引 | 按不同读者任务展示 publication package | 不读取本机绝对路径 |

禁止事项：

- 不把 6–7 GB 视频、38 MB 原始 Chat JSON 或复核音频提交到博客仓库；
- 不让页面在运行时读取 `E:\AI_Subtitle_Studio\...`；
- 不让迁移脚本扫描目录或自动选择无后缀文件；source-set manifest 不匹配就失败；
- 不直接把 `main.md`、`space.md`、`arcs.md` 拼成一个超长页面；
- 不因新 ASR 看起来更通顺就覆盖旧 SRT 或人工裁决；
- 不把 `review_todo` 的所有内部疑点默认公开给普通读者；
- 不在 offset 未确认时生成“SP2 对应 YT 精确到秒”的假链接。

### 3.2 Evidence 与发布文本

原始证据、裁决和读者正文应继续分层：

- `evidence` 保存某来源实际提供了什么；
- `claim` 保存我们声称发生了什么，以及是否已被支持；
- `event.summary` 是面向读者的简洁叙述；
- `thread.body` 解释多个事件如何形成闭环；
- `review` 保存未解决问题和下一种应使用的证据手段。

证据等级 A/B/C/D 可以保留，但必须挂在具体 claim 上，而不是粗暴地给整个 event 一个平均置信度。事件事实可为 A，同时某句逐字引用仍为 D。

建议的发布状态：

| 状态 | 含义 | 页面行为 |
|---|---|---|
| `verified` | 足以作为事实发布 | 正常显示 |
| `qualified` | 事件成立，但措辞、speaker 或物件细节有限定 | 显示简短限定说明 |
| `withheld` | 会改变人物或因果的关键项仍未解决 | 不进入正文，只留在 review |

## 4. 时间模型：本项目最重要的技术约束

### 4.1 Source track 与 lane 必须分开

本项目只有三个独立可播放媒体时钟：

```text
yt-main   00:00:00 → 04:57:26
space-1   00:00:00 → 00:43:38
space-2   00:00:00 → 02:56:11
```

Live Chat 和 Comments 是带时间信息的证据流，不是播放器轨。04:14 后的 karaoke / host / table 是 `yt-main` 内的并发 narrative lanes，也不是独立媒体轨。

### 4.2 所有时间先存整数毫秒

页面展示 `HH:MM:SS`，数据内部使用：

```json
{
  "trackId": "yt-main",
  "startMs": 6134000,
  "endMs": 6160000
}
```

不存已经格式化的时间作为唯一真值，避免排序、区间计算和播放器 seek 时反复解析字符串。

### 4.3 v1 不建立伪统一时间轴

`G-01`、`G-02` 尚未完成，YT / SP1 / SP2 之间没有已验证的固定 offset。v1 的 Thread 节点必须保存 `{ eventId }`，由 Event 自己决定 track 与本地时间。跨平台 Thread 点击后切换媒体，再按该媒体的本地时间 seek。

只有在找到共同声音锚点并记录误差后，才可增加：

```json
{
  "fromTrackId": "space-2",
  "toTrackId": "yt-main",
  "offsetMs": 0,
  "toleranceMs": 1500,
  "evidenceRefs": ["evidence-sync-g02"],
  "status": "verified"
}
```

在此之前，页面不得显示同步播放、共同 scrubber 或换算后的伪精确时间。

## 5. Publication package 数据设计

### 5.1 建议目录

使用 Astro Content Layer 的 `glob()` loader，对每类小文件分别做 Zod 校验。这样避免一个 `episode.json` 包打天下，也保持 Git diff 可审阅。Phase 1 不创建 `topics/`、`claims/` 或 `evidence/`；Event 暂用普通 `tags`，考据模型到 Phase 4 一次性定义。

```text
src/content/projects/
└─ komatsu36/
   ├─ project.json
   ├─ tracks/
   │  ├─ yt-main.json
   │  ├─ space-1.json
   │  └─ space-2.json
   ├─ acts/
   │  ├─ act-01.json
   │  └─ ...
   ├─ events/
   │  ├─ yt-011522-takoyaki-proposed.json
   │  └─ ...
   ├─ threads/
   │  ├─ russian-takoyaki.md
   │  └─ ...
   ├─ people/
   │  ├─ komatsu-shohei.json
   │  └─ ...
   └─ sources/
      ├─ youtube-main.json
      └─ ...
```

Loader 分组建议：`projects`、`projectTracks`、`projectActs`、`projectEvents`、`projectThreads`、`projectPeople`、`projectSources`。Astro collection entry ID 是唯一内部 ID，JSON / frontmatter 不再重复手写一个可能漂移的 `id` 字段。

`glob()` 必须通过 `generateId()` 生成全站 namespaced ID：

```text
komatsu36/project.json                         → projects: komatsu36
komatsu36/tracks/yt-main.json                  → projectTracks: komatsu36/yt-main
komatsu36/acts/act-03.json                     → projectActs: komatsu36/act-03
komatsu36/events/yt-030923-takoyaki-payoff.json → projectEvents: komatsu36/yt-030923-takoyaki-payoff
komatsu36/threads/russian-takoyaki.md           → projectThreads: komatsu36/russian-takoyaki
komatsu36/people/horikane-sohei.json            → projectPeople: komatsu36/horikane-sohei
```

Schema 尽可能使用 Astro `reference()`：Event 的 project / track / optional act / people，以及 Thread nodes 的 event 都由 Content Layer 验证存在性。`validate-projects.mjs` 只补 Astro schema 不表达的业务约束。`getCollection()` 结果顺序不稳定，任何页面顺序都必须显式按 `order`、`startMs` 或 Thread `nodes` 排列。

### 5.2 Project

```json
{
  "schemaVersion": 1,
  "sourceSetId": "komatsu36-20260808-r1",
  "editorialRevision": "2026-08-08-r1",
  "slug": "komatsu36",
  "title": "小松昌平 36歳 Birthday Special",
  "status": "draft",
  "defaultTrack": "komatsu36/yt-main",
  "defaultView": "timeline",
  "summary": "生日会、《俺を知ってくれ！》打ち上げ与 X Space 凸待ち交错的长时间直播。",
  "featuredThreads": ["komatsu36/russian-takoyaki", "komatsu36/uchida-line-call"]
}
```

Project 不保存 `personIds`；人物集合由 Event 的 people 引用反向聚合。`featuredThreads` 是有意维护的首页精选顺序，不是 Thread 归属的双向副本。

### 5.3 Track

```json
{
  "project": "komatsu36",
  "kind": "video",
  "label": "YouTube 主直播",
  "durationMs": 17846000,
  "clock": "native",
  "transcriptPolicy": "private",
  "playback": {
    "provider": "youtube",
    "videoId": "jszQ4MQfRg8"
  },
  "fallbackUrl": "https://www.youtube.com/watch?v=jszQ4MQfRg8"
}
```

`transcriptPolicy` 枚举为 `private | excerpted | public`，避免工程默认“已有 SRT 就公开五小时全文”。Space 在 v1 中固定使用 `playback.provider: external`：媒体存在且拥有 canonical 原来源，但 Folio 不具备受支持的站内播放或 seek 能力；不得使用 `unavailable` 把合法外部来源伪装成资源缺失，也不得为了完成 UI 把本地文件路径写进公开 JSON。

SP1 / SP2 的 `playback.url` 与 `fallbackUrl` 都指向 canonical `/i/spaces/{id}`，作为用户消费媒体的唯一主动作。对应 status Post 只作为发布上下文与来源证明保留在 `projectSources`，不在播放器并列显示第二个主按钮。现有 validator 要求 external URL 必须存在于 `projectSources`，因此数据迁移应保留两类职责清楚的 Source record；不为此向 Track 增加 `spaceUrl`、`statusUrl`、`embedUrl`、`mediaKey` 或 `broadcastCandidate`。

### 5.4 Act

Act 只负责主直播的章节化方向感：

```json
{
  "project": "komatsu36",
  "track": "komatsu36/yt-main",
  "order": 3,
  "startMs": 6134000,
  "endMs": 6900000,
  "title": "礼物、俄罗斯章鱼烧与 Big Dream",
  "summary": "..."
}
```

首版 8 Act 可从建议稿起步，但必须经过一次编辑复核后才写入数据。Act 边界是导航信息，不应伪装成原始事实；Event 的 act 引用必须 optional，允许 transition、interlude、Space 往返和暂未分类节点不被强塞进 Act。

### 5.5 Event：唯一事实节点

```json
{
  "project": "komatsu36",
  "track": "komatsu36/yt-main",
  "act": "komatsu36/act-05",
  "startMs": 11363000,
  "endMs": 11560000,
  "title": "堀金踩中被遗忘约 80 分钟的俄罗斯章鱼烧",
  "summary": "最后一颗高芥末章鱼烧重新进入现场，毫不知前情的堀金蒼平中招。",
  "people": ["komatsu36/horikane-sohei", "komatsu36/hama-kento", "komatsu36/kano-sho"],
  "tags": ["俄罗斯章鱼烧", "perfect-callback"],
  "publicationStatus": "verified",
  "laneAnnotations": []
}
```

要求：

- Event 不复制完整 Thread 前因；
- Event 不保存 `threadIds`；Thread 是 Thread → Event 关系的唯一所有者，Event → Thread 由构建期 reverse index 生成；
- Thread 不复制 Event 的时间和人物字段，只按 Event reference 引用；
- Person 页由 Event 的 `people` 聚合，不再维护另一份“此人事件列表”；
- `act` 可省略；存在时才要求 Event 时间落在 Act 区间；
- `≈` 时间通过 `timingStatus: approximate` 表示，不把波浪号塞进时间字符串；
- 原话只有在逐字级证据足够时进入 `quotes`，否则只写事实摘要。

### 5.6 Thread

Thread 使用 Markdown 正文 + 薄 frontmatter：

```yaml
---
project: komatsu36
title: 俄罗斯章鱼烧“定时炸弹”
category: perfect-callback
nodes:
  - event: komatsu36/yt-011522-takoyaki-proposed
    role: setup
  - event: komatsu36/yt-014214-takoyaki-arrives
    role: development
  - event: komatsu36/yt-014731-takoyaki-forgotten
    role: development
    transition: 赛马开始，最后一颗章鱼烧暂时退出全场注意力。
  - event: komatsu36/yt-030923-takoyaki-payoff
    role: payoff
featured: true
---
```

正文只解释“为什么这是一条闭环”、编辑取舍和推荐阅读路径。节点标题、时间、人物从 Event 解析，避免 `main` 与 `arcs` 的重复维护问题进入网站数据。`nodes` 的顺序永远是编辑顺序；跨 Track Thread 禁止按各自 local time 自动排序。单 Track Thread 可以由 validator 辅助检查时间递增，但不改写声明顺序。`transition` 是可选的跨轨/跨时段过渡文案。

Thread 分类首版使用：

- `running-gag`
- `perfect-callback`
- `cross-platform`
- `making-of`

ARC 编号保留在迁移映射中，不作为用户必须遵守的阅读顺序。

### 5.7 Person；Claim / Evidence 延后

Person 只保存稳定身份与本项目别名：

```json
{
  "project": "komatsu36",
  "displayName": "熊谷俊輝",
  "aliases": ["トシピ"],
  "role": "现场来宾"
}
```

Phase 1 不出现 `topicIds`、`claimIds`、`claims/` 或 `evidence/`。Claim / Evidence 到 Phase 4 根据真实公开边界一次性定义；在此之前，复核信息留在 editorial workbench。公开 Evidence 将来也只放来源类型、时间窗和裁决摘要；原始 ASR、聊天作者 ID、付费信息、复核音频默认不公开。

## 6. 页面与组件合同

### 6.1 路由和布局

新增：

```text
src/pages/projects/[slug].astro
src/layouts/ProjectLayout.astro
src/components/project/
```

`ProjectLayout` 不继承 `BaseLayout` 的 `max-w-prose` 主体约束，但复用字体、颜色 token、页头和页脚。桌面可使用约 `minmax(0, 1fr) + 320–400px` 的播放器侧栏；窄屏回到单栏。

URL 状态建议：

```text
/projects/komatsu36/                       # Overview 或默认入口
/projects/komatsu36/?view=timeline
/projects/komatsu36/?view=storylines
/projects/komatsu36/?view=people
/projects/komatsu36/?view=transcript
/projects/komatsu36/?view=timeline&event=yt-030923-takoyaki-payoff
```

首版使用同路由 + query/hash 即可，不必为五个视图生成五套页面。事件应有稳定可复制深链，并在刷新后恢复选中状态。

Canonical 规则：Event 是内容定位的主要真值。`event=...` 被解析后，由 Event 推导 track 与 `startMs`；URL 不再同时保存可能互相矛盾的 `track` 和 `t`。只有不对应 Event 的手动播放器分享才使用 `?track=yt-main&t=11363`。URL 使用项目内短 ID，Controller 在当前 Project 命名空间下解析为 `komatsu36/yt-030923-takoyaki-payoff`。

### 6.2 首版核心组件

| 组件 | 职责 | 非职责 |
|---|---|---|
| `ProjectArchiveShell` | 唯一共享状态控制器；协调 URL/history、track、seek、panel、焦点与滚动恢复 | 不渲染具体 Event 内容 |
| `ProjectHero` | 标题、媒体规模、入口、精选事件 | 不展示全部证据 |
| `ProjectNav` | 五视图切换、当前状态 | 不直接维护 URL/history |
| `MediaSourceNavigator` | 位于 Hero 与五视图导航之间，以克制的 source strip 常驻展示全部 Track 的标签、时长、媒体类型、可播放性与来源动作 | 不属于任何 View，不做 Hero 级巨型卡片，不成为第六个顶栏 View，不伪装未具备的播放能力 |
| `ArchivePlayer` | track 切换、seek、fallback | 不推断跨轨 offset |
| `ActSection` | 章节边界、摘要、包含事件 | 不复述 Thread |
| `TimelineEvent` | 时间、标题、摘要、人物、播放与 Thread 入口 | 不内嵌整条 ARC |
| `ThreadPanel` | 在不丢阅读位置的情况下展示闭环 | 不维护重复时间数据 |
| `PersonPopover` | 桌面快速身份说明 | 移动端不强制使用小浮层 |
| `PersonSheet` | 移动端人物详情和事件列表 | 不维护手写反向列表 |
| `ConcurrentLanes` | 标注同一媒体时段的重叠声部 | 不提供虚假的独立音轨控制 |

`ProjectArchiveShell.astro` 配合一个小型 vanilla Custom Element / `project-controller.ts` 即可；Phase 1 不为此引入 React/Vue。控制器唯一持有：

```ts
{
  view,
  activeTrackId,
  selectedEventId,
  selectedThreadId,
  selectedPersonId,
  playerReady,
  pendingSeekMs
}
```

子组件只派发 `archive:seek`、`archive:open-thread`、`archive:open-person`、`archive:switch-view`、`archive:switch-track` 等事件，不使用多套互相查询 DOM 的脚本。Controller 负责 history、刷新恢复、焦点归还和 Timeline 滚动位置。

### 6.3 播放器可行性

YouTube IFrame Player API 原生提供 `seekTo(seconds, allowSeekAhead)`，因此时间戳点击跳转可行。Project 播放器应单独实现，保留普通文章现有的“缩略图后外链”组件，避免全站行为改变。Folio v1 只调用播放、暂停、seek、currentTime 与 state；使用官方 iframe 保留平台原生 360°能力，但不自行实现 yaw / pitch / fov 控制。官方说明 360°在移动设备上支持有限，不能把不受支持设备的视角限制算成 Folio 缺陷。

首版播放器要求：

- 用户点击后才加载 iframe，避免首屏自动请求和自动播放；
- iframe 加 `enablejsapi=1` 和正确 `origin`；
- timestamp 在 player ready 前被点击时记录 `pendingSeekMs`，在 `onReady` 后执行一次 seek；
- API 未加载、视频不可嵌入或被下架时，根据当前 Event 动态生成带时间参数的 YouTube 外链，不能只使用 Track 的无时间 fallback；
- 保留 360°视频由 YouTube 原生播放器处理，不用普通 HTML `<video>` 把等距柱状画面当平面视频播放；
- Space 使用 canonical `/i/spaces/{id}` 作为原来源外链：允许切换 Track 与显示该 Track 的本地事件时钟，但不伪造站内播放、Range 能力或 timestamp seek；status Post 只进入 provenance，不与“打开 X 回放”争夺主动作；
- Media Sources 必须先把三条 Track 作为一等信息展示出来：Hero 与五视图导航之间或紧邻其下方放常驻来源摘要，播放器内提供 Source Switcher。外链来源的动作名应为“打开原来源”，不能写成“播放此源”；“浏览事件”必须进入该 Track 的已发布 Event 列表或过滤结果，不得误导用户进入只含 YT 的主 Timeline；
- Overview 的“生日会／《俺知》／Space 技术线”是内容结构；`YT / SP1 / SP2` 是媒体载体结构。两组概念必须分别标注，不能用三张内容卡代替来源导航；
- X 官方说明 Recorded Spaces 一般可以嵌入网站，因此官方 X widget 曾是 Space 站内回放的首选探测方向；但本项目两条 canonical Space URL 的探测均未通过：oEmbed 返回 404，X Publish 的 Embedded Broadcast 返回 `Not found`。RC 不新增 `x-embed` provider，也不加载 `platform.x.com/widgets.js`；
- 这应记录为 Space 产品与公开集成能力之间的断层，而不是用户 URL 操作错误：X Create / Business 仍声称 Recorded Spaces 可嵌入，当前 X for Websites 则只正式定义 Embedded Posts 与 Timelines，未定义 standalone Space replay widget；
- **不得再把 Embedded Broadcast 描述成缺乏官方支撑或疑似陈旧入口。** X 当前 Media Studio Producer 帮助文档明确把 Broadcast 定义为由 RTMP / HLS source 创建的 live video 对象，并给出“Broadcast 发布成 Post 后，将 Post URL 粘贴到 publish.x.com 并选择 Embedded Video”的外部嵌入流程。这里真正未被证明的是 **Space → Broadcast** 的对象映射，而不是 Broadcast 本身能否嵌入；
- 2026-08-09 对两条真实 Space 做只读元数据复核：当前 yt-dlp `twitter:spaces` 提取器分别取得 `media_key` `28_2043996135577268231` 与 `28_2044007602237964288`，通过 `AudioSpaceById` 和 `live_video_stream/status/{media_key}` 取回媒体信息，但结果没有 `broadcast_id`。同一代码库的 `twitter:broadcast` 是独立提取器，使用 `/i/broadcasts/{broadcast_id}` 与 `broadcasts/show.json`；两条 Space ID 及两个 `media_key` 作为 Broadcast 候选均返回 `Broadcast no longer exists`。因此 `media_key` 只能视为内部媒体管线标识，不能当作公开 Broadcast URL 或稳定嵌入合同；
- 保留未来的渐进增强合同：若 X 后续重新允许这两条录制 Space 生成可播放 widget，才采用 click-to-load。Folio 只控制 Source、当前 Event 与目标时间提示；播放、暂停和拖动由 X 控件负责，不声明 `programmaticSeek` 或 `timeSync`；
- provider 能力先由代码中的单一 capability registry 派生，例如 YouTube 为 embed + seek + time sync，X widget 为 embed-only。RC 不在每个 Track JSON 重复保存可互相矛盾的布尔值；只有出现同 provider 不同 Track 能力时才下沉为内容字段；
- `external` 是受支持的一等能力等级，不代表播放器“尚未完成”。SP1 / SP2 的公开合同就是 metadata + native local clock + Event target + canonical source link；播放器使用正常的 `X SPACE REPLAY / EXTERNAL SOURCE` 状态、canonical CTA 与能力说明，不使用警告图标、“播放器出错”或空白 viewport。可以如实标注“站内播放：不支持”“程序化定位：不支持”，但不能把能力边界渲染成故障；
- 若以后获得权利明确且技术可用的媒体 URL，再重新评估 `html5` provider。只有在第二种可编程 provider 真正公开可用后，才引入薄 `PlaybackAdapter`；不能为了尚不存在的生产 URL 提前重构控制器；
- 禁止把 X 内部 HLS / m3u8、私有接口或临时 token 当正式 provider。它们不属于公开稳定的 Spaces 回放接口，并会把来源嵌入退化为脆弱的二次分发；
- 不把三个多 GB MP4 放进 `public/` 或 Cloudflare Pages 构建产物。

手动选源的状态与 URL 合同：

- 用户点击 Event：设置 `selectedEventId`、从 Event 派生 `activeTrackId` 与 `targetMs`；URL 只写 `event`，不写冗余 `track`；
- 用户主动切换 Source：先清空 `selectedEventId` 与旧 target，再设置 `activeTrackId`；URL 删除 `event` 并写入 `?track={trackId}`。不得保留互相冲突的 `event=yt-...&track=space-2`；
- 刷新恢复时 Event 优先于 track；非法或不属于当前 Project 的 Event / track 分别忽略或回退到 `defaultTrack`，且不得触发 seek；
- 手动选择 external Source 而尚无 Event 时，显示总时长与“尚未选择定位节点”，不显示伪造的 `00:00:00`、`TARGET 00:00:00` 或可 seek 状态；只有选中该 Track 的 Event 后才显示可信的 `TARGET hh:mm:ss`。

“浏览事件”使用轻量 Source Event Index：按 Track 列出已发布 Event 的本地时间、标题与数量，点击后仍走标准 Event selection。桌面可在 `MediaSourceNavigator` 下方页内展开，窄屏可使用可访问的 bottom sheet 或页内展开；不新增 Source View、独立 source route，也不把只承载 YT canonical clock 的 Timeline 改成多轨混排。

### 6.4 响应式行为

桌面：播放器侧栏 sticky，正文滚动，Thread 使用右侧 panel。
窄屏：播放器位于导航下方；开始播放后可缩为非遮挡式 mini player；Thread 与 Person 使用 bottom sheet 或页内展开。

必须避免：

- sticky player 占满 390px 宽屏并遮住 Timeline；
- drawer 打开后背景仍可滚动导致阅读位置漂移；
- popover 只能 hover、键盘和触屏无法进入；
- 为固定侧栏而破坏 360°播放器的可用视口。

## 7. 搜索、Transcript 与 Chat 的边界

### 7.1 v1 首屏只加载编辑数据

首屏数据应限于 Project、Act、Event、精选 Thread 和 Person。5,903 个 SRT cues 与 33,929 条 Chat 不进入首屏 HTML。

### 7.2 轻量公开索引

v1 在构建时把公开 Event、Thread 与 Person 生成为页面内轻量索引，不安装 Pagefind，也不读取工作稿、SRT 或 Chat。Event 检索字段限于公开标题、摘要、标签、限定说明及关联人物公开名称/别名；结果点击后由 Event 推导 Track 与本地时钟，并写回稳定 `event` 深链。索引顺序必须显式排序，不能依赖 Content Layer 的文件枚举顺序。

当前快照为 124 个公开 Event + 16 条 Thread + 18 个 Person，共 158 条。`validate:publication` 在构建后从源 collection 推导应有数量，并同时执行体积和私有标记门禁；这里的数字只是方便人工审阅的当前快照。

### 7.3 Transcript 分片

Transcript 可在第二阶段转换为按 track + 时间段分片的 JSON，例如每 10–15 分钟一片；进入 Transcript 视图后再按需加载。构建脚本保留 cue 的原始文本、时间和来源 ID，不在迁移中“自动纠正”内容。

### 7.4 Chat 不等于 Transcript

Live Chat 的公开用途应先限定为：

- 支持事件时间窗与同期观众认知；
- 生成离线专名候选；
- 在少量已编辑事件的 Evidence 中显示去身份化摘录或计数。

v1 不提供完整 Chat 浏览器。若未来公开，必须先决定作者名、author ID、Super Chat 金额和删除请求的隐私政策，再做分片和搜索索引。

## 8. TinaCMS 与编辑工作流

TinaCMS 技术上可以建模 JSON collection，但不建议把 v1 的数十个事件、跨文件引用和 34k Chat 直接交给当前 Tina 表单：

- 当前 Tina 只配置普通文章；
- Event / Thread 的引用完整性需要跨集合校验；
- 批量迁移和时间修订更适合 Git diff + validator；
- CMS 表单无法替代 claim/evidence 的人工裁决流程。

首版工作流：

```text
工作稿与复核结果
  → 迁移脚本生成/更新 publication package 候选
  → 人工审阅小批 diff
  → validate-project 校验
  → Astro build
  → 浏览器验收
```

Tina 集成作为后续独立任务，只管理 Project 摘要、精选顺序等低风险字段；Event / Thread 批量编辑是否进入 Tina 要经过一次真实编辑体验验证。

## 9. 迁移策略

### 9.1 不做“一键全自动发布”

自动化适合抽取候选，不适合裁决叙事：

| 可自动化 | 必须人工确认 |
|---|---|
| Markdown 时间戳与标题提取 | Event 是否值得发布 |
| SRT 转 cue JSON | speaker 与重叠说话 |
| ARC 的 event 候选引用 | setup / payoff 是否构成因果 |
| 人名和别名候选 | 视觉物件、商品、正式名 |
| 跨引用完整性检查 | 精确引用是否达到发布等级 |
| Transcript 分片 | Evidence 是否适合公开 |

### 9.2 首批迁移样本

不要一开始迁完整五小时。用一个同时覆盖长回收、多人物和时间跳转的垂直切片验证模型：

1. 建 Project 与三个 Track；
2. 建 Act 2、Act 3、Act 5 的最小数据；
3. 迁移“俄罗斯章鱼烧”Thread 的 4–6 个 Event；
4. 建狩野翔、濱健人、堀金蒼平三个人物；
5. 接 YouTube 时间戳 seek；
6. 验证 Timeline → Thread → Event 回链和移动端阅读位置；
7. 通过后再迁移 `uchida-line-call`，验证跨 YT / SP2 切轨且不依赖统一 offset。

这个样本同时验证数据去重、播放器、Thread、人物聚合、跨 Act 回链和响应式布局，是最小但有代表性的压力测试。

## 10. 分阶段实施计划

### Phase 0A：Source Selection（最高优先级）

- 以 `复核md/` 下的精确带后缀文件为 canonical revised set；
- 生成并提交 `komatsu36-20260808-r1` source-set manifest；
- 核对 SHA-256、lineCount、arcCount 与必需标题；
- 迁移命令只接受 manifest + `KOMATSU36_SOURCE_ROOT` / CLI root；
- manifest 不匹配时立即失败，不 fallback 到根目录旧工作稿。

退出条件：输入快照可重现；任意 Agent 读取到 15 ARC 或 1,193 行 main 时会被门禁阻止。

### Phase 0B：Editorial Gate

- 确认主 YouTube 是否仍可公开嵌入；
- 决定 Space 的公开播放权与托管方式；
- 为每个 Track 决定 `transcriptPolicy`；
- 决定 Evidence 与 Chat 摘录的公开边界；
- 将 8 Act 边界标记为 `draft` 并人工复核；
- 明确 canonical `review_todo(10)` 中哪些项阻塞首批 Event 发布。

退出条件：“页面上允许出现什么”已有书面边界，工程不会默认公开完整 Transcript。

### Phase 0C：Publication Contract

- 锁定 `schemaVersion: 1`；
- 锁定 namespaced collection ID 与 URL 短 ID 映射；
- 锁定 `Thread → Event`、`Event → Person`、`Event → optional Act` 单向所有权；
- 锁定 native track time、Thread `nodes` 编辑顺序和 URL Event 真值；
- 锁定 `ProjectArchiveShell` 的共享状态合同。

退出条件：关系、ID、时间与状态模型无需由 Phase 1 实现者临场决定。

### Phase 1：薄骨架 + 章鱼烧垂直切片

- 新增 Project content collections 与 Zod schema；
- 用 Astro `reference()` 校验集合引用，并新增业务 validator；
- 新增 `/projects/[slug]/` 与 `ProjectLayout`；
- 实现 `ProjectArchiveShell`、Overview、Timeline、播放器、ThreadPanel、Person 展示；
- 只迁移章鱼烧样本；
- Event 只使用 `tags` 与 `publicationStatus`，不创建 Topic / Claim / Evidence 半套 schema；
- 保持现有 `/posts/` 外观与行为不变。

退出条件：真实路由可在桌面和 390px 宽度完成“打开 Project → Timeline → 01:15 狩野提出章鱼烧 → seek → 打开 Thread → 显示 setup/development/payoff → 跳 03:09 堀金踩雷 → 打开堀金 Person → 关闭 panel → 返回原滚动位置 → 刷新 URL 后恢复状态”。

### Phase 2：主时间线与 16 条 Thread

- 复核并迁移 8 个 Act；
- 从 `main` 提炼 Event，不复制整段工作稿；
- 将 canonical arcs 修正版的 16 条 ARC 迁移为分类 Thread；
- 实现 People 聚合；
- 加入 `qualified` 的限定显示（历史实现；RC 0.10 将内部 `qualification` 与可选 `readerNote` 分离，不再把工程说明自动显示给读者）；
- 实现 `ConcurrentLanes` 局部组件。

退出条件：Event 无重复 ID，Thread 引用完整，主时间线可从头到尾浏览，普通文章构建无回归。

### Phase 2.5：RC Media Pass（已实现，冻结前复测完成）

- **Commit A 已完成**：将 SP1 / SP2 的 `kind` 从 `audio` 修正为经本地媒体探测确认的 `video`；`playback.provider` 固定为 `external`，`playback.url` 与 `fallbackUrl` 改用 canonical Space URL；status Post 作为独立 provenance Source record 保留，不扩 Track schema；
- X Native Embed Probe 已完成并判定失败：`/i/spaces/1dKrPEwrAoQJX` 与 `/i/spaces/1OxwblPnkDDJB` 的 oEmbed 均为 404，X Publish Embedded Broadcast 均显示 `Not found`；两条 `/i/status/...` 虽返回 200，却只生成普通 Embedded Post markup，不能证明录音可播放；
- canonical Post Probe 也已完成到 RC 所需边界：`https://x.com/shohei_k0414/status/2043996150802592097` 与 `.../2044007616284897782` 的 oEmbed 均为 200，但仍只返回 `twitter-tweet` + Space 的 `t.co` 链接，没有 Broadcast / Space 标记。Publish 会提供 Embedded Video / Embedded Post 选项，但未取得可复测的 Space replay player 输出；普通 Post 可嵌入不等于 Space 可站内播放；
- Space → Broadcast Mapping Probe 已完成：SP1 / SP2 的 Space ID 与 yt-dlp 取得的两个 `media_key` 共四个候选，在独立 `twitter:broadcast` 接口中均返回 `Broadcast no longer exists`；Space JSON 也没有 `broadcast_id`。这只否定本项目两条来源的公开映射，不否定 Media Studio Broadcast 的官方嵌入能力；
- SP1 / SP2 继续使用 `external`。主 UI 只提供指向 canonical Space URL 的“打开 X 回放”动作；status URL 作为发布帖/来源证明留在数据层，RC 播放器不并列两个主按钮；不新增 `x-embed`，该失败不得阻塞来源导航和 v1 发布；
- **Commit B 已完成**：增加常驻 `MediaSourceNavigator` 与播放器 Source Switcher，完整显示 YT / SP1 / SP2、时长、媒体类型、active 状态与真实可用动作；不增加第六个顶栏 View；
- **Commit B 已完成**：支持无 Event 的手动 `track` URL 状态，并保持“Event 优先于 track”的 canonical 规则；手动选源会清除当前 Event 与 target，避免刷新后跳回旧 Event 所属 Track；
- **Commit C 已完成**：修正播放器的来源专属说明；YT 显示 360°说明，Space external 显示正常态外部来源、canonical CTA、TARGET / NO TARGET 与不可 seek 说明；
- **Commit D 已完成**：实现可复测的轻量 Source Event Index；桌面页内展开、窄屏页内展开，保持 Timeline 只承载 YT canonical clock 的现有边界，不新增 View / route；
- 不在本阶段上传本地 MP4，不接 R2、`html5` provider、内部 m3u8 或 PlaybackAdapter；R2 / HTML5 已退出活动中的 RC 计划，仅在官方 X Embed 对具体来源不可用且公开托管权另行确认后重新评估。

退出条件已在本地通过：读者进入页面十秒内可理解档案由三份独立媒体组成，并可主动选择任一来源；任何按钮文案都不夸大当前 embed、播放与 seek 能力；external 呈现为正常能力而非错误；手动 source、Event 深链、刷新恢复和 back/forward 均满足上述状态合同；SP2 事件索引节点可定位；既有 Event / Thread 跨 Track 定位无回归。退出后立即冻结功能，不继续做 X 技术探测或新媒体 provider。

### Phase 2.6：RC 0.10 Reader & Entity Editorial Pass（A0 / A / B / C / D / E 已完成）

- A0 Editorial Infrastructure（已完成）：自动生成的 candidates 与人工 decisions 分离；计数从目录派生，正文动作与 reader-note 动作分开，非法或 stale decision 失败；
- Cast / People（已完成）：以 canonical `main` 的 cast / staff 表为依据呈现角色 × 昼夜矩阵、production/action、主直播参与者和 `X SPACE / REMOTE`；participation 区分 `space-guest`、`remote-call` 与 `space-account`，避免把室账号或内田电话错误描述为普通 Space guest；Person 只增加项目语境、参与结构与官方链接，不扩成百科，不引入头像；
- Reader Copy（已完成）：保留 `publicationStatus` 与 `qualification` 供 editor / validator 使用，增加可选 `readerNote`；普通读者不再看到“已复核／有限定”或内部 qualification 的机械输出；52 个候选已完成 decisions 与全量 reader pass；
- ProjectSearch（已完成）：停止把 qualification、Event tags 与 readerNote 写入 `data-search-text`，`validate:publication` 增加内部限定泄漏 fixture；People Search 只使用新字段；
- `npm run editorial:reader-copy` 扫描实际目录中的全部 Event 与 Thread，只重建 generated candidates，不自动改写，也不写 decisions；`npm run validate:reader-copy` 现在强制每个候选都有完整 action。最终目标是 0 个不必要的工程说明，而不是 0 个 `qualified` Event；
- External Context（已完成）：首版只接仲村宗悟 2026-04-14 烧肉 X Post，以 `social` Source + Thread `relatedSources` + Folio `SourcePost` 呈现编辑摘要与原帖直链；它不是 Event，不加载官方 widget，不复制完整 Post。绝对时序未核实前只使用“同日”，不写“离开后／几分钟后”；
- 具体 schema、validator、UI、分批编辑和验收合同以 `docs/editorial/komatsu36-editorial-experience-pass.md` 为准。

退出条件已通过：People 首屏能解释昼夜 cast 与四类参与关系；Person panel 可看到按主 Storylines 同一规则排序的相关 Storylines；读者 HTML 不含内部 qualification；Reader Copy decisions 覆盖全部候选且完成脱离关键词的 full reader pass；首个外部来源卡插入正确 Event 节点之间并通过桌面／390px QA。Release Gate 继续等待 RC 0.11 与明确发布授权。

### Phase 3：跨平台与 Transcript

- 已迁移首批 Space 1 / Space 2 Event；
- 已实现由 Event 驱动的跨 Track 切换；YouTube 使用原生时间 seek，X Space 只外链且明确不支持 seek；无 Event 的手动 Source 切换留在 Phase 2.5；
- 完成 G-01/G-02 后再考虑 offset 映射；
- SRT 转换、校验和分片；
- Transcript 视图延迟加载；
- 已增加事件 / 人物 / Thread 的轻量搜索。

退出条件：不同 track 的时间不串用，首屏不下载全量 Transcript，搜索结果能回到稳定事件深链。

### Phase 4：Evidence 与编辑工具

- 定义公开 Evidence 的隐私和版权边界；
- 迁移经筛选的 claim/evidence；
- 对 Chat 做离线统计或去身份化摘录；
- 评估 Tina 是否只管理低风险元数据；
- 按真实编辑痛点决定是否开发专用管理界面。

## 11. 验证与验收

### 11.1 数据验证

`npm run validate:projects` 至少检查：

- 所有 ID 在项目内唯一；
- collection ID 在全站唯一并带 Project namespace；
- manifest 路径、SHA-256、lineCount、arcCount 与 canonical source set 一致；
- Astro `reference()` 已验证 project / track / optional act / event / thread / person 引用存在；
- `startMs < endMs <= track.durationMs`；
- Event 属于 Act 时，时间位于 Act 区间，例外需显式声明；
- Thread 永远保留 `nodes` 声明顺序；单 Track 可检查时间递增，跨 Track 禁止比较 local time 或自动重排；
- Event 不得包含 `threadIds`、`topicIds` 或 `claimIds`；
- 页面 query 结果按显式字段排序，不依赖 `getCollection()` 返回顺序；
- `withheld` Event 不进入公开 Timeline；
- 未验证 offset 不可被页面消费；
- publication package 不含本地绝对路径、大媒体或原始 author ID。

### 11.2 构建验证

- `npm run build`；
- 保留现有 posts、首页、timeline 的静态路由；
- Project 数据错误时构建失败，不静默丢节点；
- 检查生成产物没有多 GB 媒体、原始 Chat 或 `.env`；
- 对生成数据做体积预算，首屏不包含全量 Transcript。

### 11.3 浏览器验收

至少覆盖 Chromium：

- 桌面 1440×900；
- 窄屏 390×844；
- 页面 console 无 error；
- 横向 overflow 为 0；
- 键盘可切换视图、打开/关闭 Thread、触发时间戳；
- drawer / sheet 有焦点管理，Esc 可关闭，关闭后焦点回到触发器；
- `aria-modal="true"` 的 Thread / Person 打开后，背景必须 `inert` 或等价地不可 Tab，Tab / Shift+Tab 在当前 dialog 内循环；只验证进入焦点、Esc 和 focus restore 不算完整通过；
- 刷新深链仍能恢复视图与 Event；
- YouTube API 成功、失败、不可嵌入三种状态都有可理解反馈；
- sticky player 不遮挡正文和底部内容；
- 切换 track 时清楚显示当前时钟域；
- Overview 与播放器均有三 Track 显式入口；无 Event 的 `?track=` 可恢复，Event 深链仍覆盖冲突 track；external Track 不显示 YouTube 360°说明或伪造可 seek 时钟；
- 关闭 Thread 后保留原来的 Timeline 滚动位置。

### 11.4 Visual Review Gate

每个前端阶段除功能 QA 外，固定输出以下真实路由截图：

```text
1440×900：Overview 首屏、Timeline、Thread 打开、Player 已载入（仅证明 iframe/UI，不等同于真实音频验收）
390×844：Overview、Timeline、Thread bottom sheet、mini player
```

同时维护 mismatch ledger，把视觉判断压缩成有限裁决：

| 项目 | 证据 | 裁决示例 |
|---|---|---|
| Player 是否过抢视觉 | 桌面/移动截图 | 保留 / 缩小 |
| Act 间距 | Timeline 截图 | ±8px |
| Thread panel 宽度 | 打开状态截图 | 360 / 420px |
| Event 信息密度 | 普通与高密度节点 | 减字段 / 保留 |
| Person 标签显眼程度 | Timeline + panel | 降低 / 提升 |

截图之外仍须同时保存 console、overflow 和真实交互路径结果；“build 成功”不能代替页面验收。

### 11.5 内容抽样验收

每批至少抽查：

- 一个普通线性 Event；
- 一个跨 Act Thread；
- 一个跨平台 Thread；
- 一个 `qualified` Event；Phase 4 后再增加 claim 抽样；
- 一个多人重叠 / lane annotation；
- 一个没有可播放媒体、只有 Transcript 的节点；
- 人物别名 `トシピ → 熊谷俊輝`、`タカオ → 光富崇雄` 的聚合结果。

## 12. 风险与未决策项

| 风险 / 决策 | 当前判断 | 处理方式 |
|---|---|---|
| 主 YouTube 可嵌入性 | 已通过真实路由载入、seek、连续播放与跨 Event 说明联动 | 始终保留带当前 Event 时间参数的外链 fallback |
| Space 媒体类型与公开托管 | 本地 SP1 / SP2 都含 H.264 视频轨；Track 已修正为 `kind: video`，v1 仍未取得可公开自托管的书面边界 | Track 主动作使用 canonical Space URL，status Post 只作 provenance；不把本地媒体发进 Git / Pages，不伪装 seek 能力 |
| SP2 浏览器兼容性 | 文件名虽为 `.mp4`，但 `ffprobe` 识别为 MPEG-TS，含 timed ID3、H.264 400×224 与 AAC | 未来 HTML5 发布前必须 remux/transcode 成真实浏览器兼容容器，并在目标浏览器做加载、拖动与续播验证；不能只改扩展名或 MIME |
| R2 / HTML5 媒体发布 | Cloudflare Pages 单文件上限为 25 MiB，本地两份 Space 分别约 407 MiB、312 MiB | 只有发布权确认后才使用 R2 自定义域等外部媒体托管；验证 Content-Type、byte-range seek、缓存策略和 `preload="metadata"`，生产环境不用限速的 `r2.dev` 地址 |
| X 官方 Embed | 官方文档允许 Recorded Spaces 一般性嵌入；本项目两条 status 的 oEmbed 只返回普通 `twitter-tweet`，两条 canonical Space URL 的 oEmbed 为 404，Publish Embedded Broadcast 均为 `Not found` | **RC Probe 已失败**：保持 external，不实现 `x-embed`；未来平台行为变化时才复测。不能把 oEmbed HTTP 200 等同于回放成功 |
| Space → Broadcast 映射 | Media Studio Broadcast 的官方嵌入能力仍有效，但 Space 是另一类产品对象。SP1 / SP2 元数据有 `media_key`、无 `broadcast_id`；Space ID 和 `media_key` 共四种 `/i/broadcasts/` 候选均不存在 | 不把 `media_key`、内部 HLS 或推测 URL 写入站点；只有具体 Space 得到公开、稳定且可复测的 replay widget 时，才增加 provider |
| X 文档 / 产品断层 | Recorded Spaces 产品页仍写“可嵌入网站”，X for Websites 未定义 standalone Space replay；Media Studio 文档则明确支持 RTMP / HLS Broadcast 经发布帖生成 Embedded Video | 精确记录为 **Space → 可嵌入 Broadcast / replay widget 的缺失映射**，不得笼统写成 Embedded Broadcast 没有官方文档 |
| X 回放控制 | 公开 Spaces API用于 live / scheduled Space 的发现与元数据；官方文档明确结束后不可再由这些 endpoint 获取，未提供公开 replay media URL、seek 或 currentTime 接口 | Event 点击只切 Source 并显示 `TARGET 01:12:42` 等人工定位提示；不得伪造自动 seek / playback sync |
| 360°播放 | 普通 `<video>` 不足；YouTube 移动端支持也有限 | 使用 YouTube 原生能力，Folio v1 不承诺自行控制视角 |
| karaoke 版权 | 公开切片/自托管风险高于文字索引 | 首版只链接原来源时间，不另行分发歌曲媒体 |
| Chat 隐私 | 含 author ID、昵称、付费信息 | 默认不公开原始记录 |
| 完整 Transcript 公开权与质量 | 五小时逐字再发布不同于摘要/短引文；ASR 也不是真值 | 每 Track 明确 `transcriptPolicy`，不自动公开或合并 |
| Tina 大规模编辑 | 技术可接，但体验和引用完整性未证实 | 不作为 Phase 1 前置条件 |
| 8 Act 边界 | 已完成编辑复核并标记 `confirmed` | validator 保证无缝覆盖；迁移台账记录 03:12:58 边界修正 |
| ARC 数量变化 | canonical r1 当前 16，未来可能增删 | source manifest 记录语义计数；用户侧不把编号当阅读顺序 |
| SEO | 全站当前 `noindex` | 与内容公开性、版权决策一起单独处理 |

## 13. 首个开发批次的文件范围

首批实现应限制在以下范围，便于审阅与回滚：

```text
src/content.config.ts
src/content/projects/komatsu36/...
src/pages/projects/[slug].astro
src/layouts/ProjectLayout.astro
src/components/project/ProjectArchiveShell.astro
src/components/project/ArchivePlayer.astro
src/components/project/ActSection.astro
src/components/project/TimelineEvent.astro
src/components/project/ThreadPanel.astro
src/components/project/PersonPopover.astro
src/styles/project.css
scripts/validate-projects.mjs
data/source-sets/komatsu36-20260808-r1.json
package.json
```

暂不修改：普通 `/posts/` 路由、现有 `YouTubeEmbed.astro`、Tina posts schema、首页分类逻辑。Project 如何出现在首页应在垂直切片通过后单独设计。

## 14. 参考实现依据

- Astro Content Collections / loaders：<https://v6.docs.astro.build/en/guides/content-collections/>
- YouTube IFrame Player API（`seekTo`、`origin`、播放器事件，以及移动端 360°限制）：<https://developers.google.com/youtube/iframe_api_reference>
- Cloudflare Pages limits（单个静态资源 25 MiB；更大文件建议使用 R2）：<https://developers.cloudflare.com/pages/platform/limits/>
- Cloudflare R2 public buckets（生产公开媒体使用自定义域；`r2.dev` 仅用于开发且限速）：<https://developers.cloudflare.com/r2/buckets/public-buckets/>
- X Recorded Spaces（官方说明录制 Space 可回放、分享并嵌入网站）：<https://business.x.com/en/products/twitter-spaces/recorded-spaces>
- X oEmbed API（无认证返回官方 widget markup；返回 markup 不等于其中媒体可播放）：<https://docs.x.com/x-for-websites/oembed-api>
- X Embedded Posts（正式支持 Post、Post 媒体与 Card；未定义 standalone Space replay widget）：<https://docs.x.com/x-for-websites/embedded-posts/overview>
- X Help：Embed Post（普通公开 Post 的官方嵌入流程）：<https://help.x.com/en/using-x/how-to-embed-a-post>
- X Media Studio Producer（RTMP / HLS Broadcast、回放及通过发布帖生成 Embedded Video 的官方流程）：<https://help.x.com/en/using-x/how-to-use-live-producer>
- X Spaces API（公开 endpoint 面向 live / scheduled Space，结束后不可再检索）：<https://docs.x.com/x-api/spaces/introduction>
- yt-dlp Twitter extractor（用于核对当前 `TwitterSpacesIE` 与 `TwitterBroadcastIE` 的对象和接口边界，不作为网站运行时依赖）：<https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/twitter.py>
- TinaCMS JSON single-document collection（证明 JSON 可建模，但不代表适合本项目的大规模编辑）：<https://tina.io/docs/editing/single-document-collections>
- Podlove Web Player（仅借鉴章节与 transcript 的分层理念）：<https://docs.podlove.org/podlove-web-player/>
- TimelineJS 文档（仅借鉴时间线不应承担所有叙事）：<https://timeline.knightlab.com/docs/index.html>

## 15. 下一步

端到端档案、16 条 Thread、跨 Track 外链、轻量检索、Media Pass 与发布门禁已经可运行。RC 不再寻找媒体或播放器新能力，按以下小批次和顺序收口：

1. **Commit A — Media metadata（已完成）**：SP1 / SP2 `audio → video`；Track external URL 改为 canonical Space URL；`projectSources` 同时满足媒体 URL 的 validator 关系并保留 status Post provenance；
2. **Commit B — Source selection（已完成）**：实现 Hero 与五视图导航之间的克制 `MediaSourceNavigator`、播放器 Source Switcher、无 Event 的 `?track=` 恢复、Event 优先规则，以及手动选源清除 Event / target；
3. **Commit C — External source state（已完成）**：实现正常态 external panel、canonical CTA、Event TARGET、无 Event 时的“尚未选择定位节点”，并修复 Space 下仍显示 YouTube 360°说明的 P0 缺陷；
4. **Commit D — Browse source events（已完成）**：实现 per-track Source Event Index，不新增 View / route；完成后已冻结新增媒体功能；
5. **已完成**：修复 YouTube 动态 `origin` 与 Thread / Person focus containment；
6. **RC 0.9 已完成**：执行 Structural Editorial Audit；逐 Act 检查标题、summary、密度、入点和 qualification 是否完整，逐 Thread 检查 setup / development / payoff、transition、跨平台顺序及推断边界，抽查 People 别名、reading、role 与回链。它证明结构正确，不证明 reader-facing copy 已终审；记录见 `docs/qa/komatsu36-rc08/EDITORIAL-AUDIT.md`；
7. **已完成**：执行桌面与 390px 的八张固定截图、console、overflow、键盘、深链及 back/forward 复测；截图保存于 `docs/qa/komatsu36-rc08/`，并以 1440×900 本地 preview 复测构建产物；
8. **已完成**：刷新 Astro / MDX、PostCSS、Tina 编辑器依赖并将 Tina CLI / runtime 留在 `devDependencies`；`npm run validate`、`npx tsc --noEmit` 与 `npm audit --omit=dev` 均通过。完整 `npm audit` 的 22 条告警仍属于编辑器开发链，未执行无审查的 `audit fix --force`；
9. **RC 0.10-A0（已完成）**：Reader Copy 基础设施已改为 generated candidates 与人工 decisions 分离，目录计数派生，action 双维度化；
10. **RC 0.10-A（已完成）**：落实 schema 与 leakage gate；补 `remote-call` / `space-account`，ProjectSearch 停止索引 qualification；
11. **RC 0.10-B（已完成）**：迁移 18 人、昼夜矩阵、四类分组、Person projectContext / links 与派生 Storylines；Search 已切换到新字段；
12. **RC 0.10-C（已完成）**：按“全量裁决 → 五批修改 → 网站连续通读”处理 Reader Copy；停止渲染内部 qualification，完成 52/52 decisions 与 full reader pass；
13. **RC 0.10-D（已完成）**：以仲村烧肉 X Post 完成首个 `social` related source 与 Folio SourcePost，插入指定 Event 后；不扩 Event、不加载 widget；
14. **RC 0.10-E（本地完成）**：已重跑完整验证和桌面／390px 编辑体验 QA；当前 `project.status` 仍为 `published`，首页又只筛选 `published` Project，因此合并到部署分支等价于正式发布，不得把 merge 当作无外部影响的代码整理。Release Gate 仍待明确的合并／部署授权。
15. **RC 0.11（实施中）**：UX11-A / B 已提交为 `effa314`，包括 Cast / People 降密度、Person / Search / Player 共用 Event 上下文导航、YT 稳定 scroll/focus、Space 0 / 1 / many 与 URL/Back 修正。UX11-C Desktop Player Context Rail 已按完整合同完成本地实现与浏览器验收。新审阅提升的 Static Payload Pass 仍按 UX11-P0/P1/P2 执行：先建立 raw/gzip/brotli breakdown，再动态化 124 个 Source Event Index buttons，最后把 158 项 Search 索引迁移到 Astro build-time static JSON；它是独立工程治理，不得以体积为由缩水 Rail。完整顺序见 `docs/editorial/komatsu36-archive-navigation-pass.md`，Payload 合同见 `docs/editorial/komatsu36-static-payload-pass.md`。

通用 validator 与 komatsu36 fixture 的分层不再列入本次 Release Blocker：通用层最终只校验 schema、关系、时间、隐私和确定性排序；`8 Acts`、manifest ARC 数与小松专属 publication assertions 留在项目 fixture，但该工作延后到第二个 Project 接入前完成。

Media Pass、RC 0.9 Structural Editorial Audit 与 RC 0.10 Reader & Entity Editorial Pass 均已通过本地验证。新的 RC 0.11 只收口导航与视觉层级；Release Gate 仍独立等待明确授权：

| Blocker | 状态 / 完成标准 |
|---|---|
| Media Sources 主动可见、可选 | **已完成并复测**；三 Source 常驻可见、Source Switcher 与 Source Event Index 可用 |
| provider 文案与 external 行为 | **已完成并复测**；canonical CTA、TARGET / no-target、无伪 seek、无错误态 |
| YouTube `origin` | **已完成代码修正**；使用 `window.location.origin`，仍需随最终 preview / production 做一次部署环境抽查 |
| dialog focus containment | **已完成并复测**；背景不可 Tab、焦点循环、Esc 与 restore 均通过 |
| 构建与生产依赖安全 | **本地与 CI 均有门禁**；`npm ci` 后执行 `npm audit --omit=dev`（当前为 0 vulnerabilities）与 `npm exec -- tsc --noEmit`；`npm run validate` 通过，完整 audit 的 dev-only 告警不作为生产站点漏洞接受 |
| Cast / People 信息架构 | **RC 0.11 UX11-A 本地完成**：People 使用 group-specific compact projection；Cast 390px 使用六行布局，页面与组件均无横滚 |
| Initial HTML payload | **RC 0.11 P0**：`effa314` 为 352,541 raw bytes；完整 UX11-C 为 353,913 bytes，仍通过 350 KiB hard gate。Search section 73,355 bytes、Source Event Index 24,973 bytes；下一步独立移除工具型重复 DOM，不裁减 Rail |
| Reader-facing copy | **RC 0.10 已完成**：52/52 decisions、full reader pass 与 publication leakage gate 已通过 |
| External context 首样本 | **RC 0.10 已完成**：仲村烧肉 Post 已作为 related source 插入 Thread，不成为 Event 或静态 Post 镜像 |

上述工程、媒体与 RC 0.10 编辑 Blocker 已完成，UX11-C Player Context Rail 也已按完整合同通过本地验收。RC 0.11 当前下一阶段是 UX11-P Static Payload Pass；它只抽离 Search / Source Index 的工具型重复投影，保留 Timeline / Thread / Person 的静态 reader content，不改变资料、Rail、媒体能力或 URL schema。之后继续 UX11-D/E；RC 0.11 全部完成后仍只剩明确的 Release Gate。

除上述 Media Pass 外冻结新的基础 UI、Event 数量扩张、Tina Project 编辑器、Transcript、Evidence 与 Chat 浏览器。Transcript 和 Evidence 继续保持关闭，直到公开权、分片格式与隐私边界分别通过专项决策；不得用“已有 SRT”替代该决策。

## 16. 2026-08-09 RC 指导复核记录

| 指导项 | 本地证据 | 裁决 / 待办 |
|---|---|---|
| 显式媒体来源导航缺失 | 原 Overview 只显示 `YT + 2 Spaces`，无 Media Sources 区；现已加入常驻三 Source strip 与播放器 Source Switcher | **已完成并复测**：不新增第六 View；桌面与 390px 均无横向 overflow |
| Space 只能经 Event 间接发现 | 原先只能从 `event=sp2-011242-uchida-connected` 间接切到 SP2；现已支持 Source 卡、Source Switcher、`?track=` 与 Source Event Index | **已完成并复测**：手动选源清除旧 Event / target；Event 深链优先于 track |
| SP1 / SP2 是视频 | 本地 `ffprobe`：SP1 为 MP4/H.264 1280×720 + AAC，2618.260 秒，426,659,115 字节；SP2 含 H.264 400×224 + AAC，10571.251 秒，327,236,748 字节 | **元数据立即修正**：`kind: audio → video`；现有整数毫秒时长与探测值一致 |
| 现在直接接 HTML5 / R2 | 没有生产媒体 URL 或公开再分发决策；SP2 实际容器为 MPEG-TS，而非浏览器意义上的 MP4 | **有条件采纳**：R2/html5/adapter 不是本次 RC blocker；通过权利、容器、range 与浏览器 gate 后再实施 |
| YouTube `origin` | `playerVars` 已增加 `origin: window.location.origin` | **代码已修正**：最终 preview / production 抽查仍列入 Release Gate |
| modal focus containment | Thread / Person 打开后背景 children 设置 `inert`；Tab / Shift+Tab 由 controller 循环；Esc 后返回触发器 | **已完成并复测**：Thread / Person 均通过焦点留在 dialog 内与 restore |
| validator 通用性 | `validate-projects.mjs` 遍历所有项目，却硬编码 `acts.length !== 8` 并将 Thread 数绑定 manifest `arcCount`；`validate-publication.mjs` 固定 `projectId = 'komatsu36'` | **第二个 Project 前必须拆分**，不是当前 v1 blocker；拆分时保留小松 fixture 的严格度 |
| merge 即发布 | `project.json` 为 `status: published`，首页 `index.astro` 只筛选 `published`；截至 2026-08-09 `origin/main` 尚未包含 Komatsu36，GitHub deployments API 为 0，候选 `megazine-blog.pages.dev` 在公共 DNS 返回 NXDOMAIN | **Release Gate**：合并前必须确认内容公开、截图 QA、Cloudflare Pages provision/deploy 和部署意图 |
| 播放器说明随来源变化 | 原 SP2 Event 下错误显示“使用 YouTube 原生 360°能力”；现按 provider 更新 external panel、note、CTA 与 target/no-target | **已完成并复测**：SP2 显示 `EXTERNAL SOURCE`，不再显示 YouTube 360°说明 |
| X 原生回放指导 | X 官方一般性文档支持 Recorded Spaces 网站嵌入；2026-08-09 实测 SP1 `1dKrPEwrAoQJX` 与 SP2 `1OxwblPnkDDJB`：status oEmbed 只得到 `twitter-tweet` + `t.co`，canonical Space oEmbed 均为 404，X Publish Broadcast 均显示 `Not found` | **本项目 Probe 未通过**：RC 不实现 X widget；baseline 固定为 external + target time + canonical Space 链接，并保留 status 来源帖 |
| canonical Post 最后探测 | 两条标准 `x.com/shohei_k0414/status/{id}` 均可由 oEmbed 生成普通 Post；Publish 识别为 Embedded Video / Embedded Post 候选，但没有得到可验证的 Space replay player | **不改变结论**：可嵌入来源帖是可选装饰，不是播放能力；RC 不加载 X widget，只保留轻量直链 |
| Embedded Broadcast 文档修正 | X Media Studio Producer 当前官方文档明确支持 RTMP / HLS Broadcast，并说明发布后可通过 publish.x.com 生成 Embedded Video；它不是无文档的陈旧入口 | **修正文案**：承认 Broadcast 能力有效；把未决问题精确限定为本项目 Space 是否映射到公开 Broadcast |
| Space → Broadcast 元数据核对 | yt-dlp 2026.06.16 对 SP1 / SP2 使用独立 `twitter:spaces` 提取器，得到两个 `media_key` 但没有 `broadcast_id`；Space ID 和 `media_key` 四个 Broadcast 候选均返回不存在 | **映射假设未成立**：不得以内部 `media_key` / HLS 绕过公开 widget；RC external 决策不变 |
| 停止 X 私有链路调查 | oEmbed、Publish、canonical Post、Space / Broadcast 元数据和四种 ID 候选已覆盖 RC 的公开集成判断；继续研究内部 HLS / token 不会改善公开产品合同 | **CLOSED FOR RC**：未来只有公开产品行为变化且具体 URL 可复测时才重开 |
| 5.3 `unavailable` 旧合同 | Track schema 与 validator 已支持 `external`，SP1 / SP2 也已使用该 provider；旧句与最终能力模型冲突 | **已修正**：v1 固定 `video + external`，合法外部来源不使用 `unavailable` |
| canonical Space 与 status Post 分工 | Track / Source 数据已分为 canonical `/i/spaces/...` 媒体记录与 `/i/status/...` provenance 记录；validator 关系已通过 | **Commit A 已完成**：不扩 Track schema，来源证明链接以轻量 provenance 区呈现 |
| 手动 Source 状态冲突 | controller 已实现 `?track=`；手动选源清除 Event / target，Event selection 删除冗余 track，刷新时 Event 优先 | **Commit B 已完成并复测** |
| Source Event 浏览范围 | 主 Timeline 是 YT canonical clock，不能承载 SP1 / SP2 的本地时钟 | **Commit D 合同**：使用轻量 per-track Source Event Index；不新增第六 View、route 或多轨 Timeline |
| Structural Editorial 全量结构审计 | 124 个公开 Event 按 YT 104 / SP1 8 / SP2 12 分布；82 个 `verified`、42 个 `qualified`、16 条 Thread、18 个 Person；逐 Act / 逐 Thread 核对 setup / development / payoff、跨 Track 顺序、限定完整性与 Person 回链 | **RC 0.9 通过**：它不代表 reader-facing copy 终审；记录见 `docs/qa/komatsu36-rc08/EDITORIAL-AUDIT.md` |
| People 仍是扁平实体索引 | 旧 Person schema 只有 displayName / reading / aliases / role / note；权威 main 已有完整昼夜 cast 与 production credit | **RC 0.10 已落实**：按独立编辑体验规格实现 Cast matrix、participation、projectContext、links 与派生 Storylines，并删除旧 role / note；不加头像 |
| qualification 暴露工程语言 | `TimelineEvent.astro` 自动显示“已复核／有限定”及每条 qualification；`ProjectSearch.astro` 还把 qualification 写入隐藏 `data-search-text`；初次扫描得到 43 个 Event、9 个 Thread 嫌疑项 | **RC 0.10 采纳**：内部 qualification 与 readerNote 分层，Search 与 HTML gate 同步切断；generated candidates 只 flag，人工 decisions 独立保存 |
| Reader Copy 生成器覆盖风险 | 原生成器直接重写带人工 checkbox / new copy 区的 Markdown；开始裁决后再次运行会丢失劳动 | **RC10-A0 已修正合同与工具**：generated candidates 可重建，decisions YAML 永不由生成器写入；两者连续运行 hash 已验证稳定 |
| Space 参与身份不能压平 | 室元気只与账号出现有关，内田修一通过 LINE 电话加入；两者都写成 `space-guest` 会制造本人上麦的事实错误 | **RC10-A/B 强约束**：增加 `space-account` / `remote-call`；People 分组改为 `X SPACE / REMOTE` |
| Related Storylines 排序真值 | 当前没有 Thread `order`；主视图实际使用 `featured desc → title zh-CN` | **不新增 order**：Person panel 复用主视图唯一排序，不制造第二套顺序 |
| 仲村烧肉场外余波 | X 官方 oEmbed 于 2026-08-09 确认 `ShugoAbc/status/2044004452907266061` 的作者、日期及烧肉语境；该材料没有 Track 原生时钟 | **作为 related source 采纳**：不是 Event；默认编辑摘要＋直链，不复制完整 Post、不加载 widget |
| 仲村 Post 的“之后”措辞 | oEmbed 只证明同日；status Post 创建时间不是 Space `started_at`。yt-dlp 当前将 `started_at` 映射为 `release_timestamp`，X Snowflake 可解码 Post 创建时刻 | **RC10-D 增强核验，不阻塞 schema**：核验前只写“同日”；按 started_at + local clock 与 Snowflake 时间计算 delta 后再批准“几分钟后／同晚稍后” |
| 浏览器 Release QA | 1440×900 与 390×844 的八张真实路由截图已保存于 `docs/qa/komatsu36-rc08/`；三 Source 可见、无横向 overflow；console 0 error；Event / `?track=` / back-forward、Source Event Index、Thread / Person inert 与 focus trap 已实测；4322 preview 构建复测通过；候选 `megazine-blog.pages.dev` 的本轮 production 探测返回 `net::ERR_CONNECTION_CLOSED`，未取得 production 证据 | **本轮通过**：本地 QA 已完成；production 仍需在可达环境复测并确认发布意图 |

本表中的“已采纳”表示指导与仓库/媒体证据一致；“有条件采纳”表示方向可行但尚未满足发布前提。它不把本地持有媒体、文件后缀或可播放样本等同于公开托管授权与生产可用性。
