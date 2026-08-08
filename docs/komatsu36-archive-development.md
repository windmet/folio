# 小松昌平 36 岁生日会 Project Archive 开发设计

> 状态：Draft 0.3（2026-08-08，首个可运行档案切片与发布门禁）
> 目标：把一场多平台、多人物、长时、存在跨轨回收的活动做成可浏览、可追溯、可逐步发布的专题档案，而不是把工作稿直接塞进普通博客正文。
> 当前源档根：`E:\AI_Subtitle_Studio\02_Projects\小松昌平生日会`（只通过 CLI 参数或 `KOMATSU36_SOURCE_ROOT` 提供）
> 当前权威文档集：源档根下的 `复核md/` 带版本后缀文件；根目录同名无后缀文件是旧工作稿，不得自动选用。
> 当前站点：Astro 6 静态站点，TinaCMS 只管理普通 MDX 文章。

## 当前实施状态（2026-08-08）

- Phase 0A 已落地：`data/source-sets/komatsu36-20260808-r1.json` 精确锁定 6 个 `复核md/` 带后缀输入，并由 `validate:sources` 校验路径、SHA-256、物理行数与 16 条 ARC；
- Phase 1 垂直切片已落地：真实 `/projects/komatsu36/` 路由、集中状态控制器、YouTube 延迟加载与 pending seek、动态时间 fallback、Timeline、Thread、Person 和 URL 恢复均已实现；
- Phase 2 已进入小批量补密：8 个 `editorialStatus: confirmed` Act、16 条 Thread、124 个代表性 Event、18 个 Person。K36-EVT-B01～B06 已覆盖 Bingo 主奖表、前后两批礼物、留守组副节目、换装回归、02:27–03:45《俺知》名场面复盘、04:14–04:55 卡拉 OK／Super Chat 并发与二次会散场，以及开场、360°形式、Space 往返、来宾批次和换场锚点；B04 同步补齐伊藤友紘与山本誠大的人物反向索引。16 条 Thread 是 canonical ARC 的首轮网页化，不表示每个源表行均已成为公开 Event；
- `validate:projects` 现在要求 Thread 数与 manifest `arcCount` 一致、8 个主轨 Act 无缝覆盖完整时长、`threaded` Event 必须被至少一条 Thread 消费、`timeline-only` Event 不得伪装成 Thread 节点、Thread 不得泄露 `withheld` Event、人物不得成为孤儿引用、`qualified` Event 必须附限定说明；
- `ConcurrentLanes` 已以局部注记形式落地，只显示经确认的并发关系，并明确禁止将其消费为跨平台 offset；
- Space 播放源决策已收口：用户提供的两条 X status 按创建时间与重开顺序映射为 SP1/SP2；页面只提供外链，不重托管音频，也不把 X 外链伪装成支持 timestamp seek；
- 公开 Event / Thread / Person 的轻量站内检索已落地：索引只来自发布内容，结果顺序固定，Event 结果可恢复稳定深链并切换到正确 Track；不索引 Transcript 与 Chat；
- `validate:publication` 已接入统一 `npm run validate`：当前构建核对 158 条公开检索项、350 KiB 单页预算，并阻止原始 ASR 文件标记、本机源档路径、`author_id`、SRT/VTT 文件名进入发布 HTML，同时要求 `published` Project 在首页拥有真实入口；
- 首页已增加独立“专题档案”书架，只消费 `status: published` 的 Project，并显示由 collection 实时派生的 Event／Thread／Track 数量；专题不混入四类普通文章筛选；
- 当前仍未完成：主稿的高密度逐事件迁移、Transcript、Evidence，以及 Phase 2 完整视觉裁决；这些不得因 16 条 Thread 已出现而被误报为完成。

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

`transcriptPolicy` 枚举为 `private | excerpted | public`，避免工程默认“已有 SRT 就公开五小时全文”。Space 的 `playback.provider` 在媒体托管方案确定前应为 `unavailable`，但仍可拥有受 policy 控制的 Transcript 和 Event。不要为了完成 UI 把本地文件路径写进公开 JSON。

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
- Space 当前使用用户提供的 X status 作为原来源外链：允许切换 Track 与显示该 Track 的本地事件时钟，但不伪造站内播放、Range 能力或 timestamp seek；若以后获得权利明确且技术可用的媒体 URL，再单独升级播放能力；
- 不把三个多 GB MP4 放进 `public/` 或 Cloudflare Pages 构建产物。

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
- 加入 `qualified` 的限定显示；
- 实现 `ConcurrentLanes` 局部组件。

退出条件：Event 无重复 ID，Thread 引用完整，主时间线可从头到尾浏览，普通文章构建无回归。

### Phase 3：跨平台与 Transcript

- 已迁移首批 Space 1 / Space 2 Event；
- 已实现跨 Track 切换；YouTube 使用原生时间 seek，X status 只外链且明确不支持 seek；
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
- 刷新深链仍能恢复视图与 Event；
- YouTube API 成功、失败、不可嵌入三种状态都有可理解反馈；
- sticky player 不遮挡正文和底部内容；
- 切换 track 时清楚显示当前时钟域；
- 关闭 Thread 后保留原来的 Timeline 滚动位置。

### 11.4 Visual Review Gate

每个前端阶段除功能 QA 外，固定输出以下真实路由截图：

```text
1440×900：Overview 首屏、Timeline、Thread 打开、Player 已播放
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
| Space 媒体公开托管 | v1 决定不重托管 | 使用两条 X status 原来源外链；不把本地 MP4 发进站点，不伪装 seek 能力 |
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
- TinaCMS JSON single-document collection（证明 JSON 可建模，但不代表适合本项目的大规模编辑）：<https://tina.io/docs/editing/single-document-collections>
- Podlove Web Player（仅借鉴章节与 transcript 的分层理念）：<https://docs.podlove.org/podlove-web-player/>
- TimelineJS 文档（仅借鉴时间线不应承担所有叙事）：<https://timeline.knightlab.com/docs/index.html>

## 15. 下一步

端到端垂直切片、16 条 Thread 首轮网页化、跨 Track 外链、轻量检索与发布门禁已经可运行。下一批工作应转向主稿的高密度 Event 迁移：先定义可审阅的小批次与去重规则，再逐批补足 Timeline，复核 8 个 draft Act 的边界及 Phase 2 桌面/390px 视觉裁决。Transcript 和 Evidence 继续保持关闭，直到公开权、分片格式与隐私边界分别通过专项决策；不得用“已有 SRT”替代该决策。
