# Folio 第二 Project 交接：こまちょえ生ラジオ 2026.04.25

> 文档状态：implementation-ready handoff v1  
> 编写日期：2026-08-12  
> 适用仓库：`windmet/folio` / `E:\Web_build\Megazine_blog`  
> 建议新分支：`codex/komachoe-20260425`  
> 基线提交：`eeb09159d0ea8cd932d049db6ae4d667c4df6d61`  
> 当前 Production：<https://folio-ca3.pages.dev/>  
> 新 Project 首轮状态：`draft`，不得随泛化代码一起公开

这份文档是下一任务的唯一实施入口。它吸收了 `docs/分支-·-广播存档生产流水线.md` 的产品审计，但以本轮对源码、验证脚本、母本、SRT、Chat、Comment、高精度 RAW、切片清单和媒体 metadata 的重新核对结果为准。

审计原文是讨论记录，不是最终规格；发生冲突时，以本交接的“已锁定决策”和验收门禁为准。

---

## 1. 一句话目标

以 `こまちょえ生ラジオ（2026.04.25）` 验证 Folio 的 Project Archive 能从 Komatsu36 的复杂多轨活动档案自然收缩为：

```text
1 个 YouTube Track
6 个节目 Section（底层继续使用 projectActs）
首批 12 个、正式版约 28–32 个 Event
0 Thread 合法
0 People View 合法
Overview / Sections / Timeline 三种读者入口
```

本轮要证明的是通用 Project 能力，不是制作一套 `Radio` 特供页面。

---

## 2. 当前基线与开工规则

### 2.1 已确认的仓库状态

- 当前代码分支：`codex/komatsu36-project-archive`。
- 基线 HEAD：`eeb09159d0ea8cd932d049db6ae4d667c4df6d61`。
- Cloudflare Pages Production 已部署该基线；站点 origin 已固定为 `https://folio-ca3.pages.dev`。
- `origin/main` 当前仍停在 `09cb5cc35f829a09d4562c4b74cf66f0acb0c137`，不包含 `eeb0915`；Production 是从已验证的 `dist` 手动提升并标记为 `main` environment。新分支必须从 `eeb0915`/当前审阅分支创建，不能从 stale `origin/main` 开始。
- Komatsu36 现有 Player、Timeline、Search、URL/history、人物/故事线 overlay、移动 Bubble 和失败恢复机制是冻结回归基线。
- 当前 README 仍写着真实设备、真实媒体和 Release Gate 未完成，已经与实际生产状态不一致；这属于新分支 Phase 0 的文档收口事项。

### 2.2 新任务启动命令

新窗口先执行只读检查，再开独立分支：

```powershell
Set-Location 'E:\Web_build\Megazine_blog'
git status --short --branch
git rev-parse HEAD
git fetch origin
git switch -c codex/komachoe-20260425 origin/codex/komatsu36-project-archive
```

这里以远端审阅分支为起点，是为了同时带上本交接文档；开工前仍需确认其代码父级包含 `eeb0915`。不要改成从 `origin/main` 创建。

如果该分支已经存在，则切换现有分支，不要重复创建。不得删除或覆盖工作区中用户未跟踪的审计/指导文档。

### 2.3 Komatsu36 freeze 合同

泛化期间：

- 不改现有 Komatsu36 Event ID、时间、正文、Thread 或 People 语义；
- 不重写 YouTube Player lifecycle；
- 不重写 URL/history controller；
- 不删除 Komatsu36 专项验证，只把它们从“全站规则”归位成 regression fixture；
- 每个泛化批次都要证明 `/projects/komatsu36/` 桌面端与 390px 没有回归。

建议 Phase 0 更新 README，并记录 freeze commit。是否创建 tag 由用户决定；Agent 不应自行创建远端 tag。

---

## 3. 审计结论的可行性裁决

| 审计建议 | 裁决 | 落实方式 |
|---|---|---|
| 复用动态 `/projects/[slug]` | 采纳 | 禁止创建广播专属 Route |
| 复用现有 Player / Timeline / Search | 采纳 | Controller 保持原位，先抽展示层 |
| 允许 1 Track / 6 Acts / 0 Thread / 0 People | 采纳，且是 P0 | 先泛化 schema 与 validators，再创建 Project |
| 把 Storyline 变成广播环节 | 只采纳 UI 槽位直觉 | 数据上 Section 使用 `projectActs`；Thread 继续表示跨 Event 叙事链 |
| 新建 `projectSections` collection | 拒绝 | 首期使用 `projectActs + optional sectionKey` |
| 第一版只有 Overview + Timeline | 被后续审计修订 | 最终锁定 `Overview + Sections + Timeline` |
| 立即开发 Series/Episode 系统 | 延后 | 只预留稳定 `sectionKey`；第二、第三期进站后再评估 Series |
| 重新生成母本/整场 ASR/重切 42 条 | 拒绝 | 只读使用当前母本；结构变化不反写事实层 |
| 一次导入 28–32 Event | 拒绝 | 先做跨 6 Section 的 12 Event vertical slice |
| 公开 Transcript / Chat / Comment | 拒绝 | 它们只属于证据与编辑生产层 |
| 现在建立 4/25 ↔ 4/14 mapping | 延后 | 不阻塞本期独立成立与发布 |

### 3.1 对审计的两点技术修正

第一，审计说 source validator 的 checksum/lineCount “本身通用”，实际只通用了一半。当前 `scripts/validate-source-set.mjs`：

- 默认环境变量仍是 `KOMATSU36_SOURCE_ROOT`；
- 默认 manifest 写死为 Komatsu36；
- 每个文件都无条件比较 `lineCount`；
- 因而不能直接安全容纳 binary media 记录。

必须先让 `lineCount` 成为可选字段，并给二进制文件增加 `byteCount` 可选校验，或者明确把媒体只记录为 metadata、不纳入此 validator。

第二，审计第一版示例只锁 main/ASR/SRT/Chat/Comment，但本轮发现 `复核切片/00_manifest.md` 与实际目录中多出 R13。Source Set 应同时固定切片清单，避免下个窗口误以为 R13 已进入 canonical 回填。

---

## 4. Canonical Source Set

### 4.1 本机 authority root

```text
E:\AI_Subtitle_Studio\02_Projects\こまちょえ生ラジオ（2026.04.25）
```

此绝对路径只用于本地验证，不得写入 `src/content/projects/**`、构建产物、公开 Search JSON 或 HTML。

### 4.2 已核对的核心文件

下表的行数使用当前 validator 的 newline 定义：按 `\r?\n` 切分，文件以换行结尾时减一。

| 角色 | 相对路径 | Bytes | Lines | SHA-256 |
|---|---|---:|---:|---|
| canonical mother draft | `komachoe_20260425_main(8).md` | 119,784 | 2,204 | `1a713c4e6d27da08cbbbcd7d05f98b24239d278e68cd475430af740948fb857d` |
| external ASR RAW | `komachoe_20260425_external_asr_raw(7).md` | 71,426 | 1,248 | `54f5a59e2cc103545e9de47316575841a78f3ebef5acde7cfbf0633755e12124` |
| Whisper SRT | `こまちょえ生ラジオ(2026.04.25).srt` | 186,177 | 8,533 | `cc677948370ed6b45b7f128e2428c94ad45a41abb2cd8b04f900beda37135516` |
| normalized Live Chat | `chat_uyOKDPpXxMI_20260810_131407_search.jsonl` | 1,277,813 | 5,499 | `8c36ce10013d88248bbc3f154bb23bb85e46a48038a6f5df7cfb5ef8608a2554` |
| normalized Comments | `comments_uyOKDPpXxMI_20260810_132551_search.jsonl` | 5,515 | 10 | `868fa5f31a6b3bb6cf0566b4566aa53b0d97a0ece02c5345a421b246f7029725` |
| slice manifest | `复核切片/00_manifest.md` | 2,906 | 37 | `beea2579b3d6261f0327b0af1b437affaf2d7c71f6f2368133ce61b9274f79ef` |
| slice machine list | `复核切片/_slices.tsv` | 357 | 16 | `7f1a60378ff20b8be93abecd5d6244e41d8a61f320d4ba65aa5bc8f8c7569097` |

原始大 JSON 和 info JSON 可作为下载 provenance 保留，但公共建模优先消费上表中的规范化索引；不得把 comment `author_id`、头像 URL 或 Chat 用户身份发布到页面。

### 4.3 媒体与公开来源事实

- YouTube video ID：`uyOKDPpXxMI`
- canonical URL：<https://www.youtube.com/watch?v=uyOKDPpXxMI>
- 标题：`こまちょえ生ラジオ(2026.04.25)`
- Channel：`こまちょえチャンネル`
- Upload date：`2026-04-25`
- Availability：`public`
- Live status：`was_live`
- yt-dlp duration：`7926s`
- 本地 ffprobe duration：`7926.041s`
- 下载媒体：Opus / 48 kHz / stereo / WebM / 140,107,175 bytes
- 下载媒体 SHA-256：`e7f21aa140248983ecf14216bb38178b3e0b53a2b749bc8eca29d1842ad9e421`
- Track canonical `durationMs`：`7926041`

不要使用 SRT 最后一条约 `02:11:59` 作为 Track duration。Act 06 必须结束于 `7926041`，才能满足无 gap/overlap 的 track coverage gate。

### 4.4 证据职责

| 层 | 可以决定什么 | 不可以决定什么 |
|---|---|---|
| mother draft | Act/Section 边界、Event candidate、事件级语义、已裁决专名 | 逐字字幕发布权、母本之外的新事实 |
| SRT | 全程时间骨架、语序、候选窗口 | 单独封板高风险专名/方言音形 |
| external ASR RAW | 短窗逐字互证、旧 ASR 纠偏 | 自动覆盖 SRT 或母本 |
| Live Chat | 同刻人名/专名收敛、观众即时反应 | 主持人事实、责任归因 |
| Comments | 回看定位、audience memory | 自动升级成节目原话 |
| public sources | 正式表记、人物/作品身份 | 反写直播里没有说过的内容 |

### 4.5 R13 隔离规则

`复核切片` 当前含 `R13.m4a`，窗口为 `00:25:30–00:26:40`；但：

- mother draft TODO 只封板 R01–R12；
- external ASR RAW 只收录 R01–R12；
- R13 只在切片 manifest 标为“用户新增窗口（todo 表外）”。

因此 R13 当前状态是：

```text
supplemental / not canonical / not consumed
```

它不能阻塞 vertical slice，也不能被用来宣称 E13 已获得额外高精度确认。若未来要消费，先单独生成并人工裁决 R13 RAW，再升级 mother draft 和 Source Set revision。

---

## 5. 最终信息架构

```text
Project / Episode: komachoe-20260425
│
├─ Track: yt-main
│
├─ Section occurrence（底层 projectActs）
│  ├─ Event
│  └─ Event
│
├─ Section occurrence
│  └─ Event
│
├─ Thread / Storyline（可选，本期 P0 为 0）
│  └─ 可跨多个 Section 连接 Event
│
└─ People（可选，本期不公开 View）
```

### 5.1 三种入口的职责

- **Overview**：这一期为什么值得听；4–6 个精选入口。
- **Sections**：节目如何组成；完整显示全部 6 个环节。
- **Timeline**：每个环节中有哪些值得直接跳听的具体内容。

### 5.2 Section、Event、Thread 的边界

- Section 回答“节目进行到哪个环节”；它是连续时间结构。
- Event 回答“这个环节里有什么值得直接听”；它是选择性内容节点。
- Thread 回答“相隔较远的多个 Event 合起来形成什么故事”；它是正交叙事关系。

纯换挡节点不应占用公开 Event。例如母本 E22 `00:50:56 今月の弁明开始` 应由 Act 03 的 `startMs` 表达；E23 才是该 Section 第一条高价值 Event。

### 5.3 暂不开发 Series

第一期只增加 `sectionKey`，不新增 `Series`、`Episode`、`SegmentDefinition`、`SegmentOccurrence` collection。

`sectionKey` 是未来跨期稳定连接点，不是当前页面 Route：

```text
special-talk
mail
monthly-benmei
futsuota
superchat
ending
```

等至少第二、第三期进入同一数据层，再决定是否提升为 series-level section definition。

---

## 6. Schema 合同

### 6.1 Project 新字段

建议在现有 Project schema 增加：

```ts
views: z.array(z.enum([
  'overview',
  'sections',
  'timeline',
  'storylines',
  'people',
  'transcript',
])).min(1),

markLabel: z.string().optional(),
sourceNote: z.string().optional(),

overview: z.object({
  kicker: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string()).min(1),
  cards: z.array(z.object({
    label: z.string().optional(),
    title: z.string(),
    summary: z.string(),
    event: reference('projectEvents').optional(),
    act: reference('projectActs').optional(),
  })).default([]),
  featuredEvent: reference('projectEvents').optional(),
}).optional(),
```

约束：

- `defaultView` 必须属于 `views`；
- `sections` 要求至少一个 Act；
- `storylines` 要求至少一个 Thread；
- `people` 要求至少一个 Person；
- `mark` 缺失时不渲染 stamp；不得 fallback 为 `A`；
- `markLabel` 只有 `mark` 存在时才有意义；
- Overview 卡片同一条只能链接 Event 或 Act，不能两者同时存在。

### 6.2 Track 新字段

```ts
order: z.number().int().positive(),
```

所有 Track 按 `order` 排序，不再通过 `yt-main / space-1 / space-2` ID 推断。

Komatsu36 迁移值：YT=1、SP1=2、SP2=3。广播：YT=1。

### 6.3 Act 新字段

```ts
sectionKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
presentationLabel: z.string().optional(),
```

`sectionKey` 是稳定机器 ID；`title` 是本期标题。`presentationLabel` 只在确有显示需要时使用，首批可不填。不要增加与 Act 重叠的 Section collection。

### 6.4 Event

首批广播 Event：

```json
{
  "people": [],
  "personRelations": [],
  "narrativeMode": "timeline-only",
  "laneAnnotations": []
}
```

Event 正文可以自然提到寺島惇太、細谷佳正等姓名；这不要求第一版建立 People entity。只有决定公开 People View 或需要稳定人物聚合时，才引入 Person 数据。

---

## 7. Project skeleton

目标目录：

```text
src/content/projects/komachoe-20260425/
├─ project.json
├─ tracks/
│  └─ yt-main.json
├─ acts/
│  ├─ act-01.json
│  ├─ act-02.json
│  ├─ act-03.json
│  ├─ act-04.json
│  ├─ act-05.json
│  └─ act-06.json
└─ events/
```

不要为了 Git 空目录创建 placeholder `threads/`、`people/`、`sources/`。

### 7.1 project.json 初始合同

文案仍需后续人工审校；结构先固定：

```json
{
  "schemaVersion": 1,
  "sourceSetId": "komachoe-20260425-r1",
  "editorialRevision": "2026-08-12-vertical-slice",
  "slug": "komachoe-20260425",
  "title": "こまちょえ生ラジオ｜2026.04.25",
  "eyebrow": "BROADCAST ARCHIVE · 2026.04.25",
  "status": "draft",
  "defaultTrack": "komachoe-20260425/yt-main",
  "defaultView": "overview",
  "views": ["overview", "sections", "timeline"],
  "summary": "待人工审校",
  "featuredThreads": [],
  "overview": {
    "kicker": "QUICK ORIENTATION",
    "title": "这期广播从哪里开始听？",
    "paragraphs": ["待人工审校"],
    "cards": []
  }
}
```

`defaultView: overview` 是本交接的首轮产品决定：root route 先帮助读者理解这期与 4/14 的关系，再进入 Sections/Timeline。vertical slice QA 后如证据显示大多数用户更需要直接跳听，可以单独产品裁决为 `sections` 或 `timeline`，不要在泛化过程中反复切换。

### 7.2 Track

```json
{
  "project": "komachoe-20260425",
  "order": 1,
  "kind": "video",
  "label": "YouTube 生ラジオ",
  "shortLabel": "YT",
  "durationMs": 7926041,
  "clock": "native",
  "transcriptPolicy": "private",
  "playback": {
    "provider": "youtube",
    "videoId": "uyOKDPpXxMI"
  },
  "sourcePublishedAt": "2026-04-25T21:54:09+09:00",
  "fallbackUrl": "https://www.youtube.com/watch?v=uyOKDPpXxMI"
}
```

`sourcePublishedAt` 由已保存 metadata 的 Unix timestamp `1777121649` 转换得到，不是从 upload date 猜测；若未来重新抓取 metadata 出现差异，应先保留 provenance 再决定是否升级 Source Set。

### 7.3 六个 Section/Act

| Act | sectionKey | startMs | endMs | 本期标题 | 属性 |
|---:|---|---:|---:|---|---|
| 01 | `special-talk` | 0 | 1,824,000 | 36 岁生日配信／360°制作复盘 | 本期特有 |
| 02 | `mail` | 1,824,000 | 3,056,000 | 生日配信没读到的《俺知》邮件 | 来信 |
| 03 | `monthly-benmei` | 3,056,000 | 5,286,000 | 今月の弁明／近期出演与告知 | 固定环节 |
| 04 | `futsuota` | 5,286,000 | 6,535,000 | ふつおた：家族与方言 | 固定环节 |
| 05 | `superchat` | 6,535,000 | 7,377,000 | Super Chat 与补充回答 | 固定环节 |
| 06 | `ending` | 7,377,000 | 7,926,041 | 游戏近况与 Ending | 收尾 |

这六段必须连续覆盖整个默认 Track；不要重新从 SRT 自动聚类。

---

## 8. 首批 12 Event vertical slice

首批不是“最精彩 12 条”，而是覆盖产品能力最完整的 12 条。新 Project 尚未公开，ID 可以从一开始采用稳定的时间语义形式：

| Candidate | 建议 Event ID | Act | startMs | endMs | 工作标题 |
|---|---|---:|---:|---:|---|
| E03 | `yt-000250-no-detailed-script` | 01 | 170,000 | 397,000 | 不设细台本，最终时间严重不足 |
| E05 | `yt-000643-360-experience-worked` | 01 | 403,000 | 500,000 | 360°体验本身成功 |
| E06 | `yt-000820-camera-model-gap` | 01 | 500,000 | 659,000 | 实际租用相机与想象不同 |
| E08 | `yt-001242-backstage-became-visible` | 01 | 762,000 | 932,000 | backstage カンペ全部进入画面 |
| E12 | `yt-002351-terashima-backstage-mc` | 01 | 1,431,000 | 1,510,000 | 寺島事前被授权为裏MC |
| E13 | `yt-002510-no-more-dual-platform` | 01 | 1,510,000 | 1,630,000 | 不再由自己同时跑 X 与 YouTube |
| E21 | `yt-004333-producer-casting` | 02 | 2,613,000 | 3,034,000 | producer 视角的四人假想 casting |
| E23 | `yt-005144-what-is-a-gilet` | 03 | 3,104,000 | 3,269,000 | 「ジレってなんですか」与专业衣装 staff |
| E29 | `yt-012036-trpg-event-format` | 03 | 4,836,000 | 5,129,000 | 《盤・番・絆》TRPG 与可控 event 形式 |
| E32 | `yt-013430-hontou-wa-accent` | 04 | 5,670,000 | 5,941,000 | 「本当は」accent、にゃ与 Chat 判定 |
| E36 | `yt-015153-seiten-and-ito` | 05 | 6,713,000 | 6,770,000 | 清典出席、伊藤未能参加与私下约饭 |
| E40 | `yt-020257-game-backlog-and-recovery` | 06 | 7,377,000 | 7,572,000 | 游戏 backlog、五小时块与身体恢复 |

写入 JSON 前必须按 mother draft 对每条做以下核对：

1. 时间落在对应 Act 内；
2. 标题和 summary 不引入母本之外的新因果；
3. A/B/C 是编辑证据等级，不直接等于 `publicationStatus`；
4. 仍有逐字不确定、但事件级已成立的内容写入 internal `qualification`，不要把 ASR 过程暴露给读者；
5. 身体状态只描述本人所说，不做医学归因；
6. Chat/Comment 只作为互证，不把观众责任判断写成事实。

E13 与补充 R13 切片名称相同只是编号碰巧一致：Event candidate E13 已在 mother draft 成立；复核切片 R13 尚未消费。实现时不要混淆。

正式内容扩展只从 mother draft E01–E42 中选择，目标 28–32 条。纯结构节点 E17/E22 等默认不公开。

---

## 9. Validation 泛化

### 9.1 `scripts/validate-projects.mjs`

必须先完成：

1. `readCollection()` 捕获目录不存在的 `ENOENT` 并返回 `[]`；其他错误继续抛出。
2. 删除全站 `acts.length === 8`。
3. 保留并强化默认 Track：至少 1 Act、order 连续、首段 start=0、相邻无 gap/overlap、末段 end=duration。
4. `manifest.files.arcs?.arcCount` 存在时才校验 Thread 数。
5. 校验 `defaultView ∈ views`。
6. 校验可选 View 与数据能力一致。
7. 校验 Track `order` 在 Project 内唯一且连续。
8. `sections` View 只消费 Acts，不要求 Thread。
9. 保留 narrativeMode 与 Thread consumption 规则。
10. 保留本机路径、`author_id` 与私有数据禁入规则。

因为 `views` 与 Track `order` 在本交接中设计为必填，Phase 1 必须在同一提交中迁移 Komatsu36：

```json
"views": ["overview", "timeline", "storylines", "people", "transcript"]
```

以及 `yt-main=1 / space-1=2 / space-2=3`。不得先把 schema 改成 required、留下旧 Project 构建失败。

### 9.2 Publication gate 拆层

当前 `scripts/validate-publication.mjs` 从 `projectId = komatsu36` 开始，并含大量具体 Event/Person/Thread DOM 断言。它不是 generic gate。

推荐结构：

```text
scripts/validate-publication.mjs              # 遍历所有 Project 的 generic gate
scripts/verify-komatsu36-publication.mjs      # 当前严格脚本归位
```

Generic gate 至少检查：

- 每个 Project route 与 `search.json` 存在；
- `published` 进入首页，`draft` 不进入首页；
- Search item 数等于 public Event + Thread + People；
- HTML 不含本机路径、`author_id`、`.srt`、`.jsonl`、`external_asr_raw`；
- 只渲染 `views` 声明的导航和 panel；
- 单 Track 不渲染 Media Source Navigator、Timeline Scope、无意义的 Source selector；
- 0 Thread / 0 People 时不存在空 Storylines/People UI；
- controller JSON 只含当前 Project 数据。

Komatsu36 regression 保留现有具体语义与 DOM 断言。

### 9.3 Reader Copy 工具归位

当前 reader-copy 生成、导出、应用与 validator 都写死 Komatsu36。第一阶段只重命名 npm gate，使职责诚实：

```text
verify:komatsu36:reader-copy
```

不要为了 12 条广播 Event 立即泛化整套人工队列。广播正式扩展到 28–32 条后，如果人工润色流程证明确实需要，再做 project 参数化。

### 9.4 Source Set validator

目标调用：

```powershell
node scripts/validate-source-set.mjs `
  --manifest data/source-sets/komachoe-20260425-r1.json `
  --root 'E:\AI_Subtitle_Studio\02_Projects\こまちょえ生ラジオ（2026.04.25）'
```

实现合同：

- `--manifest` 和 `--root` 优先；
- 可支持 `PROJECT_SOURCE_ROOT`；
- `KOMATSU36_SOURCE_ROOT` 仅作旧兼容；
- `sha256` 必填；
- `lineCount` 仅文本项填并校验；
- `byteCount` 可选并校验；
- 特定语义计数（如 arcCount）只有 manifest 声明时才运行；
- 不在日志中展开 source 文件正文。

### 9.5 Payload audit

`audit-payload.mjs` 必须接受缺失 optional sections，且支持任意 Project slug：

```powershell
npm run audit:payload -- komatsu36
npm run audit:payload -- komachoe-20260425
```

不要把 Komatsu36 当前 386,048-byte hard gate直接套给广播；先记录 vertical slice baseline，再为广播设置有证据的 budget。

---

## 10. Presentation 泛化

### 10.1 最小修改原则

当前 `ProjectArchiveShell.astro` 同时包含展示与稳定 Controller。首轮只抽/参数化 presentation：

```text
ProjectHero.astro
ProjectViewNav.astro
ProjectOverview.astro
ProjectSectionsView.astro
ProjectTimelineView.astro（可后置，先参数化原区块也可）
```

不要同时移动：

- YouTube API load/retry；
- player mount/reset；
- pending seek；
- URL restore/history；
- overlay focus/scroll；
- mobile dock/bubble；
- search navigation。

### 10.2 必须消除的硬编码

源码已确认以下 Komatsu36 假设仍存在：

- `leadPersonId = 'komatsu-shohei'`
- `payoffEvent = yt-030923-takoyaki-payoff`
- `yt-main / space-1 / space-2` trackOrder
- Hero 固定“三份媒体”和生日章
- 五个固定 View
- Overview 完整生日会文案
- Timeline 固定“八个 Act / X Space”说明
- People 固定俺知/Birthday/Space 分组
- Transcript 固定文案

处理方式必须是 capability/data-driven，不得新增：

```ts
if (project.data.slug === 'komachoe-20260425')
```

### 10.3 单 Track UI

当 `tracks.length === 1`：

- 不实例化 `MediaSourceNavigator`；
- 不渲染 `Timeline Scope`；
- Player 不显示只有一个选择的 Source tabs；
- 保留当前 Event、seek、外部 YouTube 当前时间入口；
- Timeline 直接从 Section navigator 进入 Act/Event。

这是“不渲染”，不是 CSS 隐藏。Publication validator 应从 HTML 证明这些节点不存在。

### 10.4 Sections View

新增轻量 `ProjectSectionsView.astro`，只消费 ordered Acts 和每个 Act 的 public Event count。

每张卡显示：

```text
sectionKey 对应的短 kicker（可由 labels map 提供）
Act title
HH:MM:SS → HH:MM:SS
Act summary
N 个精选节点
```

点击卡片：

```text
切换到 timeline view
→ 保持当前 Track
→ 聚焦对应 Act heading
→ scrollIntoView
→ 写入一次 history
```

首轮不需要 `section=` URL 参数。若 Back/Forward 无法恢复 Sections→Timeline 的 origin，再单独设计；不得复用 `thread=` 冒充 Section。

### 10.5 Komatsu36 视觉不应被迫广播化

- Komatsu36 可继续显示 Act 01–08；
- 广播用 Section 语言呈现同一底层 Act；
- `sectionKey` 缺失时沿用现有 Act 展示；
- Komatsu36 不需要为了广播补虚假的 sectionKey。

---

## 11. 分批实施顺序

### Phase 0 — Freeze 与分支

范围：README 当前状态、freeze note、独立分支。无 UI 改动。

验收：基线 `npm run validate` 和 production commit 记录清楚。

### Phase 1 — Generic validation

范围：content schema、`validate-projects`、source-set validator、generic/Komatsu publication split、reader-copy gate 归位、payload 参数化、npm scripts。

此阶段不创建 4/25 Project。

验收：

```powershell
npm run validate
npx tsc --noEmit
git diff --check
```

Komatsu36 所有专项验证继续通过。

### Phase 2 — Generic presentation

范围：views、Hero、Overview、optional stamp/source note、Track order、single-source conditional、Sections view。

仍不创建 4/25 数据。建议用最小 fixture 或 unit/static assertions 验证 optional capability，不要把临时 fixture 发布。

验收：Komatsu36 desktop/390px 视觉和交互无回归。

### Phase 3 — 4/25 vertical slice

创建 Source Set manifest、Project、1 Track、6 Acts、12 Events；状态保持 `draft`。

验收：route 可在本地静态构建中生成，但首页不出现 draft Project。

### Phase 4 — Product QA

桌面：1440×900；至少再抽查 1920×1080。  
移动：390×844；再抽查 360×800、414×896。

必须验证：

- Overview / Sections / Timeline；
- Section → Timeline 聚焦；
- 6 段 navigator；
- Event seek；
- Search（无 People/Thread 仍能搜姓名和主题文本）；
- YouTube lazy load/retry；
- mobile bubble；
- external current-time handoff；
- Back/Forward 与 URL restore；
- console error；
- page-level overflow。

真实 YouTube 播放由普通浏览器/真机网络签字，不以自动化浏览器的 Provider 成败作为唯一证据。

### Phase 5 — 内容扩展

12 → 28–32 Events。只从 canonical mother draft 取材，不重跑整场 ASR，不批量改写母本。

### Phase 6 — 人工文案

最后审校：ASR 味、工程黑话、证据强度、中日文表记、summary 长度、时间精度和内部 qualification。

### Phase 7 — 发布与关联实验

先独立发布 4/25；真机 QA 通过后再把 `status` 改为 `published` 并部署。`4/25 ↔ 4/14` 关联档案是发布后的独立实验，不阻塞本期。

---

## 12. 推荐提交序列

```text
chore(archive): freeze komatsu36 v1 baseline
refactor(validation): split generic project gates
refactor(project): generalize archive presentation
feat(komachoe): add 20260425 vertical slice
test(komachoe): verify single-source archive
content(komachoe): expand reviewed broadcast timeline
docs(komachoe): freeze 20260425 archive
```

每个提交必须可单独审计；不要把 validation 拆层、Player 重构和 30 条内容导入塞进同一个 commit。

---

## 13. Release gates

### 13.1 Generic data gate

- 1 Track / 6 contiguous Acts；
- Track duration = `7926041ms`；
- 0 Thread / 0 People / 0 Source directory 合法；
- 12 vertical-slice Events 全部在对应 Act 内；
- 所有 public Event 为 `timeline-only`；
- `defaultView` 存在于 `views`；
- `sections` 只依赖 Acts。

### 13.2 Public output gate

构建产物不得出现：

```text
E:\AI_Subtitle_Studio
.srt
.jsonl
external_asr_raw
author_id
复核切片
R01 / R13 等内部批次标记
```

### 13.3 UI gate

- 只显示 Overview / Sections / Timeline；
- 没有空 Storylines / People / Transcript；
- 没有单项 Source chooser；
- Section 卡能进入正确 Timeline Act；
- Event 点击 seek 到正确本地时间；
- 390px 无 page overflow；
- mobile 一屏可扫读，不照搬 Komatsu36 高密度人物/故事线结构。

### 13.4 Regression gate

Komatsu36：

- `npm run validate`；
- TypeScript；
- payload；
- semantic closeout；
- YouTube N1；
- overlay scroll；
- 已保留的 RC12 浏览器回归；
- production route desktop/390px 抽查。

### 13.5 发布 gate

只有同时满足以下条件，才将广播 Project 从 `draft` 改为 `published`：

1. 28–32 Event 人工文案完成；
2. 本地 generic + Komatsu regression 全绿；
3. Cloudflare Preview 生产环境路由通过；
4. 手机 Wi-Fi、蜂窝至少各完成一次真实 YouTube 播放/seek；
5. 用户明确授权公开。

---

## 14. Anti-goals

本阶段禁止：

- 广播专属 Route 或第二套 Player；
- 把 Thread schema 改造成节目环节；
- 新建与 Act 重叠的 Section collection；
- 立即开发完整 Series 系统；
- 发布全文 Transcript、Chat browser、Comment dump；
- 把 4/14 已知事实反写成 4/25 发言；
- 为页面完整性人工制造 Thread/People；
- 自动生成 42 条 Event；
- 重新跑整场 ASR；
- 全面重写 `ProjectArchiveShell` Controller；
- 因广播简单而削弱 Komatsu36 regression；
- 在公开 JSON/HTML 中留下本机 source root 或证据文件名。

---

## 15. 新窗口首轮任务卡

新窗口不要立即导入广播内容。第一轮只做 Phase 0 + Phase 1：

1. 确认 HEAD、worktree、origin 和当前生产基线；
2. 新建/切换 `codex/komachoe-20260425`；
3. 更新 README 的 Komatsu36 freeze/production 状态；
4. 为 `views / sectionKey / track.order` 增加 schema；
5. 泛化 `validate-projects` 的 8 Act、arcs、空目录假设；
6. 拆 generic publication 与 Komatsu regression；
7. 泛化 source-set validator；
8. 参数化 payload；
9. 跑完整 Komatsu36 regression；
10. 独立提交，停下来给用户审阅。

Phase 1 通过前，不创建 `src/content/projects/komachoe-20260425`。

建议用户在新任务中直接发送：

> 阅读 `docs/editorial/komachoe-20260425-project-handoff.md`，从 Phase 0 + Phase 1 开始。先核对当前 HEAD、工作区和 Production 状态，再创建 `codex/komachoe-20260425`；本轮只做 Komatsu36 freeze 与 Generic Validation，不导入广播 Project 数据，完成后运行全部回归并提交。

---

## 16. 最终产品命题

Komatsu36 证明了 Folio 能处理复杂、多轨、跨平台、多人和跨时段回收的活动档案。

`こまちょえ生ラジオ 2026.04.25` 要证明另一件事：同一套系统也能理解“节目本身有稳定格式”的连续广播——Section 保留节目结构，Event 只挑值得直接听的内容，Thread 则继续保留给真正跨环节发生的故事。

只有这三层职责不混，后续五六期广播才有可能自然累积，而不是复制五六个缩小版 Komatsu36。
