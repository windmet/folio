# GOMYAKU People Context Accumulation & Public Record Workflow v0.1
## 人物语境累积、Public Record 分组与跨档案 Profile 生成补充规范

> 本文是 `GOMYAKU Workflow Guidance v0.2` 的独立补充，不重写 ASR / Source Engineering 主流程。
>
> 审计对象：`windmet/folio` 的 `codex/publication-metadata-v2` 分支，当前检查到提交 `bed15c736b1872aa51d483be35a3912593f43c86`（`refactor: group and compact People surfaces`）。
>
> 背景：三个 Project + 第一组 2016 X Public Record 已经证明 People v2 的 Global Person / Project Person Context / Index Appearance 方向是对的，但现在缺少真正的 **跨 Appearance 语义累积层**。

---

# 0. 当前结论

当前 People v2 已经有：

```text
Global Person Identity
        ↓
Project Person Context
        ↓
Index Appearance
        ↓
buildGlobalPeopleProjection()
        ↓
People index / Person detail
```

但目前 `buildGlobalPeopleProjection()` 更接近：

> **Reader-side aggregation**

而不是：

> **Authoring-side semantic accumulation**

它知道：

- 这个人出现过几个 Project；
- 这个人出现过几个 Index；
- 有多少 Event / Source node；
- 有哪些 presence / roles。

但它还不知道：

- 每次 Appearance 给人物语境新增了什么；
- 哪些 nickname 只属于某一组公开记录；
- 哪些称呼已经稳定到值得升级为全局 knownAs；
- 多次 appearance 累积以后，这个人“为什么值得认识”；
- 新材料是否真的需要改人物页首页简介；
- 多个人物的反复公开互动是否已经足够形成 Relationship Context。

下一阶段真正缺的是：

```text
Appearance Semantics
+ Context Ledger
+ Profile Diff
```

---

# 1. 当前人物简介为什么像“最后一个时间点 Project 的 mention”

当前 `src/lib/globalPeople.ts` 的逻辑等价于：

```text
identity.contextSummary
    ↓ if absent
newest Project Person Context.summary
    ↓ if no Project
generic newest Index Appearance sentence
```

而 Project contexts 又按 publication date 从新到旧排列。

因此只要某个人的 Global Person JSON 没有手工填写 `contextSummary`：

> **People 总页的大卡摘要 / 人物详情页抬头，就会被最新一个 Project 的局部 summary 占领。**

这正是目前截图里的观感来源。

它不是：

- CSS 问题；
- 某个 Person JSON typo；
- “最近这一个项目写得太长”。

而是：

> **Projection contract 本身把 Global Person Summary 与 Latest Appearance Summary 耦合了。**

这层必须拆。

---

# 2. 三种 summary 现在被错误混在一起

未来至少区分：

## Global Person Digest

回答：

> **在“前情帖”现有档案范围里，为什么需要认识这个人？**

它应该跨 publication 稳定。

---

## Appearance Summary

回答：

> **这个人在这一份 Project / Public Record 中为什么出现？**

它只属于一份 publication。

---

## Node Summary

回答：

> **具体这一条 Event / Post / Source item 发生了什么？**

它是最细粒度。

当前问题正是：

```text
Appearance Summary
       ↓
被当成
Global Person Digest
```

---

# 3. v0.1 新核心对象：Person Appearance

以后 People 工作流建议明确：

```text
Global Person
     ↓
Person Appearance
     ↓
Event / Source Nodes
```

Appearance 是：

> **一个 Person 在一份 Publication / Record Thread 中形成的一次完整语境。**

例如：

```yaml
person: hamano-daiki

publication:
  kind: public-record
  id: 2016-x-family-record

summary: >
  濱野作为这组 X 对话的起话者与主要参与者出现；
  “淳太妈妈”由他率先喊出，随后在家庭角色玩笑中成为“爸爸”。

participation:
  - author
  - conversation-participant

contextNames:
  - label: 爸爸
    kind: situational
    evidence:
      - hamano-father
      - hamano-family-meeting

nodes:
  - hamano-chicken
  - terashima-hair
  - hamano-mama
  - hamano-confirm-mama
  - komatsu-princess
  - hamano-father
  - hamano-family-meeting
```

---

# 4. Global Person / Appearance / Node 的职责

## Global Person

只保存稳定身份：

```text
displayName
reading
public links
reviewed global names
optional global context profile
```

回答：

> 这个人是谁？为什么在当前档案集合里值得认识？

---

## Appearance

保存 publication-specific：

```text
summary
participation / presence
roles
contextNames
node refs
relation hints
```

回答：

> 他在这份档案里为什么出现？

---

## Node

保存：

```text
Event
Source item
timestamp
excerpt
```

回答：

> 具体哪一刻、哪一条发生了什么？

---

# 5. 2016 X Family Record 正确的三层结构

当前 2016 Index 已经拥有整体 summary，但它的人物语义没有被单独投影。

未来应是：

```text
Publication / Thread
虎牙道的“爸爸”濱野、“妈妈”惇太和“公主”昌平
        ↓
Person Appearance
        ↓
Source Items
```

---

## Thread / Publication 层

标题：

```text
虎牙道的“爸爸”濱野、“妈妈”惇太和“公主”昌平
```

整体 summary：

```text
2016 年 6 月 5 日，濱野大輝从“吃鸡肉赶 Live”的 Post 起头，
寺島惇太接话，小松昌平随后加入，对话最后发展成
“爸爸 / 妈妈 / 公主”的家庭角色分配。
```

回答：

> 这组公开记录整体发生了什么？

---

## 濱野大輝 Appearance

```text
作为起话者与主要对话参与者出现；
“淳太妈妈”由他率先喊出，
随后在三人的家庭角色玩笑中被固定成“爸爸”。
```

---

## 寺島惇太 Appearance

```text
从鸡肉话题接入对话，并回应“淳太妈妈”的称呼；
随后成为这组家庭角色玩笑中的“妈妈”。
```

---

## 小松昌平 Appearance

```text
后半才加入对话，却得知自己已经在一场根本没参加的
“家庭会议”中被决定为“公主”，并以对此吐槽收尾。
```

---

# 6. 当前 Index Appearance 为什么表达不了这些

当前 Global Index Appearance 实际只有：

```text
index
date
roleLabel
entries[]
```

因此它只能生成：

```text
该人物在这项公开索引中出现于 7 个记录节点。
```

它知道数量。

但不知道：

> **这 7 条记录共同构成了什么人物语境。**

所以现在缺的不是：

```text
再给 hamano-daiki.json 写一段 contextSummary
```

而是：

> **Index / Public Record 也要拥有与 Project Person Context 对称的 Person Appearance semantics。**

---

# 7. 最小实现可以先叫 `indexPeople`

不一定现在就建立巨大的通用抽象。

可以先形成：

```text
projectPeople
+
indexPeople
```

然后 `buildGlobalPeopleProjection()` 统一消费。

示意：

```yaml
index: 2016-x-family-record
person: hamano-daiki

summary: >
  濱野作为这组对话的起话者与主要参与者出现；
  “淳太妈妈”由他率先喊出，随后成为“爸爸”。

participation:
  - author
  - conversation-participant

contextNames:
  - 爸爸

entries:
  - hamano-chicken
  - terashima-hair
  - hamano-mama
  - ...
```

未来如果 Project / Index / 其他 Publication 都稳定表现一致，再抽成通用：

```text
PersonAppearance
```

---

# 8. Global Header 禁止再用 Latest Appearance fallback

新的硬规则：

> **Global Person 的首页简介不得由 chronology[0] / newest Project summary 隐式生成。**

推荐 projection 顺序：

```text
contextProfile.deck
        ↓
explicit reviewed contextSummary
        ↓
reviewed synthesized digest
        ↓
neutral aggregate fallback
```

Neutral fallback 例如：

```text
当前前情帖收录：
3 项项目档案语境 · 1 条公开记录。
```

不要：

```text
最新 Project 里：
“他在这里作为……”
```

---

# 9. Appearance Summary 应该放在哪里

Person Detail 页：

```text
Person Header
    ↓
Appearance Chronology
    ↓
Grouped Nodes
```

例如：

```text
2016.06.05
PUBLIC RECORD

虎牙道的“爸爸”濱野、“妈妈”惇太和“公主”昌平

濱野作为这组对话的起话者与主要参与者出现，
并在家庭角色玩笑中成为“爸爸”。

7 条记录
[展开]
```

展开后：

```text
17:53 鸡肉 Post
21:30 淳太妈妈
21:45 称呼确认
22:09 爸爸设定
...
```

---

# 10. Alias 体系还要再拆一层

People v2 已经正确拆成：

```text
knownAs
searchTokens
```

但第一组 X 考古证明：

> **真实 nickname 也有“全局稳定”和“局部语境”两类。**

建议最终分：

---

## `displayName`

标准显示名。

```text
伊藤友紘
```

---

## `reading`

```text
いとう ともひろ
```

---

## `knownAs`

经过人工确认、具有全局展示价值的稳定称呼。

例如如果多份材料持续出现：

```text
友ちゃん
```

---

## `contextNames`

只在特定 Appearance / Thread 中成立。

例如：

```text
hamano-daiki
  2016-x-family-record:
    爸爸

terashima-junta
  2016-x-family-record:
    淳太ママ
    妈妈

komatsu-shohei
  2016-x-family-record:
    公主
```

不要因为只出现一次，就直接污染 Global `knownAs`。

---

## `searchTokens`

机器检索用：

```text
ito tomohiro
itou tomohiro
hamano daiki
```

永远不上屏。

---

# 11. Context Name Promotion

未来 Agent 如果发现：

```text
同一个 contextName
在多个 Publication 独立复现
```

不要自动提升。

生成：

```yaml
type: context-name-promotion-candidate
person: ito-tomohiro
candidate: 友ちゃん

seen_in:
  - publication-a
  - publication-b
  - publication-c
```

人工：

```text
A — promote to knownAs
B — keep scoped
C — reject
```

这样 nickname 会随着资料增长成熟。

---

# 12. Person Context Ledger

真正适合 GOMYAKU 的不是“每次给人物重写一段简介”。

而是为人物维护一个小型、可追溯的：

> **Context Ledger**

示例：

```yaml
person: hamano-daiki

items:
  - id: ctx-2016-family-father
    kind: contextual-role
    statement: >
      在 2016-06-05 的三人 X 对话中，
      濱野被放入“爸爸”的家庭角色。
    publication: 2016-x-family-record
    evidence:
      - hamano-father
      - hamano-family-meeting
    status: confirmed

  - id: ctx-2016-family-instigator
    kind: interaction-context
    statement: >
      这组家庭角色玩笑先由濱野与寺島的前半互动形成，
      小松后加入。
    publication: 2016-x-family-record
    evidence:
      - hamano-mama
      - terashima-mama
      - komatsu-princess
    status: confirmed
```

Ledger 属于 Workspace。

Public Profile 是 Ledger 的编辑投影。

---

# 13. 下一份新材料进入后，不要重新生成人物页

标准流程：

```text
New Appearance
      ↓
Context Ledger Diff
      ↓
NEW / CONFIRM / UPDATE / CONTRADICT
      ↓
Profile Patch Candidate
      ↓
Human Review
      ↓
Incremental Patch
```

禁止：

```text
所有历史节点
↓
LLM 从头总结一次 Person
↓
覆盖旧简介
```

这和 Source Engineering 的：

```text
patch, not regenerate
```

原则完全一致。

---

# 14. Person Context Diff

每次新 Publication 完成后，Agent 应输出：

```text
PERSON CONTEXT DIFF
```

例如第二组 X 以后：

```yaml
person: hamano-daiki
publication: second-x-series

new:
  - 某个新的公开互动语境

confirmed:
  - 再次出现“爸爸”称呼

updated:
  - “爸爸”不再只是 2016 单次局部玩笑，
    已有第二份公开材料复现

relationship_candidates:
  - hamano-daiki
  - terashima-junta
  - komatsu-shohei
```

如果第二批材料没有复现：

```text
Global deck 不需要变化。
```

---

# 15. Profile Patch Gate

只有这些情况值得改 Global Person 首页简介：

1. 新 appearance 改变了人物在站内的主要位置；
2. 一个 local context 在多个档案中复现；
3. 新增重要跨 Project / Index 关系；
4. 旧 profile statement 被新 Evidence 修正；
5. Indexed Person 升级为 Contextual Person；
6. 新语境能明显解释后续大量内容。

普通：

```text
“又被提到一次”
```

只增加 appearance/node。

不改首页 deck。

---

# 16. People Depth 继续 Progressive

保留：

```text
Mention
→ Indexed Person
→ Contextual Person
→ Core Person
```

---

## Mention

只做 identity resolution。

---

## Indexed Person

Appearance chronology 已够。

不必人工写人物百科。

---

## Contextual Person

跨多个 Publication 或理解成本高。

才需要：

```text
contextProfile
Context Ledger
Profile Diff
```

---

## Core Person

长期主轴人物。

允许稳定 global deck 和更多导航能力。

---

# 17. Public Record 还缺 Thread / Cluster 层

当前 2016 数据还是：

```text
Index
→ 10 entries
```

但 Reader 真正想看的主单位是：

```text
Index / Collection
        ↓
Record Thread
        ↓
Source Items
```

现在只有第一组时：

```text
Index ≈ Thread
```

还能工作。

但用户明确还没有完成第二大系列推文考古。

第二组进入以后很可能应该变成：

```text
2016 X Public Records
├─ Family Role Thread
├─ Second Thread
└─ ...
```

因此不要现在假定：

> 一个 Index 永远等于一组对话。

---

# 18. Public Record Thread 的职责

Thread 保存：

```text
title
summary
people
date range
source sequence
person appearances
```

Source Items 保存：

```text
author
time
excerpt
translation
source status
```

人物页只引用：

> Thread / Appearance

而不是 10 条 Source Item 全部平铺。

---

# 19. 不要现在建立 Relationship Graph

第一组 X 很容易让系统直接生成：

```text
濱野 ─ 寺島 ─ 小松
```

甚至算“关系强度”。

不要。

因为：

> 第二大系列还没考古。

当前最多保存：

```yaml
type: relationship-candidate
people:
  - hamano-daiki
  - terashima-junta
  - komatsu-shohei
basis:
  - 2016-x-family-record
status: candidate
```

以后多份 Publication 独立形成同一前情，再决定要不要正式建立：

```text
Relationship Context
```

---

# 20. Relationship Context 的未来门槛

不是：

```text
共同出现一次
```

而是至少具备：

- 多个 Publication；
- 或一条特别强的跨时间 Thread；
- 明确 direct interaction；
- 对理解后续档案确实有帮助。

它回答：

> 为什么这些人在后续公开内容里可以这样互动？

它不是：

- CP 页；
- 私人关系断言；
- 亲密度评分。

---

# 21. 每个新 Project / Index 的 People Pass

People 不应该在 ASR 初稿阶段就做完。

它应该发生在：

> **Canonical Publication / Event 已经稳定之后。**

---

## Step 1 — Detect

从：

```text
Event
Mention
Index Entry
Source Author
```

发现 Person candidate。

---

## Step 2 — Resolve Identity

对 Global Person ID。

禁止 fuzzy match 直接落库。

不确定就进入：

```text
Identity Review
```

---

## Step 3 — Classify Appearance

例如：

### Project

```text
host
on-site
live-call
live-space
submitted
referenced
```

### Public Record

```text
author
conversation-participant
referenced
source-subject
```

---

## Step 4 — Group Nodes

按：

```text
Publication
+ Thread / Section
```

先形成 Appearance。

不要：

```text
一个 mention
→ 一条人物页主节点
```

---

## Step 5 — Write Appearance Summary

只回答：

> **这个人在这一份 Publication 中为什么出现？**

---

## Step 6 — Extract Context Names

记录 scoped nickname。

---

## Step 7 — Update Context Ledger

分类：

```text
NEW
CONFIRM
UPDATE
CONTRADICT
```

---

## Step 8 — Profile Diff

只有 material change 才提出 global patch。

---

## Step 9 — Relationship Candidate

重复交互足够强才提。

---

## Step 10 — Human Inbox

人只需要审核：

```text
new identity
identity conflict
new contextual name
context-name promotion
material profile patch
relationship candidate
contradiction
```

普通 mention 自动归入已有 Appearance。

---

# 22. `.gomyaku` 工作区建议补充

```text
.gomyaku/
├─ people/
│  ├─ identity_candidates.yml
│  ├─ appearance_candidates.yml
│  ├─ context_ledger.yml
│  ├─ profile_patches.yml
│  └─ relationship_candidates.yml
```

---

# 23. 与 ASR / Source Engineering 主流程的接口

普通广播：

```text
Source Engineering Freeze
        ↓
Canonical Event Inventory
        ↓
People Extraction
        ↓
Identity Resolution
        ↓
Appearance Grouping
        ↓
Appearance Summary
        ↓
Context Ledger Diff
        ↓
Profile Patch Queue
```

People Pass 属于：

> **Editorial Enrichment**

不是 ASR 本身。

---

# 24. X / Public Record 专用流程

```text
Raw Source Items
        ↓
Source Identity Closure
        ↓
Conversation / Record Thread Reconstruction
        ↓
Thread Summary
        ↓
Per-person Appearance
        ↓
Context Names
        ↓
Context Ledger
        ↓
Profile / Relationship Diff
```

尤其注意：

```text
author
reply participant
referenced person
```

不是同一种 participation。

---

# 25. 当前仓库最小修复：Phase A

这是现在就值得做的。

不需要大 migration。

---

## A1 — Remove Latest Appearance Fallback

`globalPeople.ts` 不再允许：

```text
personContexts[0].summary
```

直接成为 Global Person context summary。

---

## A2 — Neutral Global Fallback

没有 reviewed global deck：

```text
当前前情帖收录 3 项项目语境 · 1 条公开记录。
```

---

## A3 — Index Person Appearance Summary

让 Index appearance 能保存：

```text
person-specific summary
```

---

## A4 — 2016 Fixture

分别补：

```text
hamano
terashima
komatsu
```

三条不同 appearance summary。

---

## A5 — Person Detail

Index chronology card 显示：

```text
appearance.summary
```

而不是：

```text
该人物在这项公开索引中出现于 N 个记录节点。
```

节点数留做 meta。

---

## A6 — Scoped Context Names

给 2016 fixture 预留：

```text
爸爸
淳太ママ / 妈妈
公主
```

但不要立刻全部升级成 global `knownAs`。

---

## A7 — Regression

验证：

> 新增一个更新日期更晚的 `referenced` Project，不得自动改变 Person Global Header。

---

# 26. 第二组 X 考古前后：Phase B

建立 Authoring 概念：

```text
Person Appearance
Context Names
Context Ledger
Profile Diff
```

存储第一版可以仍是：

```text
projectPeople
+
indexPeople
```

Reader 统一 projection。

不必现在把全仓库重构成一张巨大 graph。

---

# 27. 多个系列以后：Phase C

只有当数据真的证明需要时，再考虑：

```text
Relationship Context
Record Collection
Cross-publication Thread
```

原则：

> Do not invent schema before repeated demand.

---

# 28. Reader Projection Contract

## People Board

大卡可显示：

```text
displayName
reading
counts
reviewed global digest
top presence
```

禁止：

```text
latest appearance summary
```

---

## Person Header

顺序：

```text
contextProfile.deck
→ reviewed contextSummary
→ synthesized reviewed digest
→ neutral aggregate
```

---

## Appearance Chronology

显示：

```text
publication title
appearance role
appearance summary
record count
```

---

## Expanded Nodes

才显示具体：

```text
time
event / source title
```

---

# 29. Validator 建议

## PEOPLE-CONTEXT-01

Global summary 不得隐式读取：

```text
personContexts[0]
chronology[0]
latestAppearance
```

---

## PEOPLE-CONTEXT-02

Index-only Person 必须允许有有意义的 Appearance summary。

---

## PEOPLE-CONTEXT-03

`searchTokens` 永不公开渲染。

---

## PEOPLE-CONTEXT-04

`contextName` 必须带：

```text
scope
evidence
```

---

## PEOPLE-CONTEXT-05

一个 contextName 不得自动升级成 `knownAs`。

---

## PEOPLE-CONTEXT-06

人物页默认阅读单位保持：

```text
Appearance
```

而不是 Node。

---

## PUBLIC-RECORD-01

有因果顺序的 conversation：

```text
source order = asc
```

---

## PUBLIC-RECORD-02

Source item 不得成为人物页同级 Publication 主节点。

---

# 30. 给 Coding Agent 的实施合同

可以直接交：

```text
任务：People Context Accumulation v0.1

审计基线：
codex/publication-metadata-v2
bed15c736b1872aa51d483be35a3912593f43c86

这不是单纯修改 hamano-daiki.json 文案。

先审计：
- src/lib/globalPeople.ts
- src/content.config.ts
- src/content/people/*
- src/content/projects/*/people/*
- src/content/indexes/2016-x-family-record.json
- src/pages/people/index.astro
- src/pages/people/[id].astro
- People validators

目标：
1. 去除“最新 Project summary 自动成为 Global Person summary”的耦合；
2. Global Person 无 reviewed deck 时改用 neutral aggregate fallback；
3. 为 Index / Public Record 增加 person-specific Appearance summary；
4. 2016 family record 的濱野 / 寺島 / 小松分别拥有不同 Appearance semantics；
5. 为 scoped contextNames 预留结构；
6. “爸爸 / 妈妈 / 公主”不自动污染 global knownAs；
7. Project Person summary 继续只用于该 Project Appearance；
8. Person page 的 Index card 使用 Appearance summary；
9. 不建立 Relationship Graph；
10. 不修改 Player / Timeline / ASR workflow；
11. 添加 regression verifier。

开始编码前先输出：

A. 当前 summary provenance 图
B. Global / Project / Index 三类人物语义来源
C. 最小 schema diff
D. 2016 fixture expected projection
E. migration 风险
F. validators 需要补什么
```

---

# 31. 2016 Fixture Expected Projection

## Thread

```text
虎牙道的“爸爸”濱野、“妈妈”惇太和“公主”昌平
```

---

## Hamano

Global Header（如果没有正式 deck）：

```text
当前前情帖收录 1 条公开记录语境。
```

Appearance：

```text
濱野作为这组对话的起话者与主要参与者出现；
“淳太妈妈”由他率先喊出，随后在家庭角色玩笑中成为“爸爸”。
```

Scoped name：

```text
爸爸
```

---

## Terashima

Appearance：

```text
从鸡肉话题接入对话，并回应“淳太妈妈”的称呼；
随后成为家庭角色玩笑中的“妈妈”。
```

Scoped names：

```text
淳太ママ
妈妈
```

---

## Komatsu

Appearance：

```text
后半加入，却发现自己已经在一场根本没参加的家庭会议中
被决定成了“公主”，并以对此吐槽收尾。
```

Scoped name：

```text
公主
```

---

# 32. 为什么现在不建议手写全站人物简介

因为第二大系列 X 还没有完成。

如果现在直接把：

```text
爸爸
妈妈
公主
旧交
某某关系
```

全部手写进 Global Person Profile，

下一批材料进来后又要重写。

更可持续的是：

```text
Appearance
→ Context Ledger
→ Profile Diff
```

新证据只更新真正发生变化的部分。

---

# 33. People Workflow 与 Source Engineering 的共通哲学

Source Engineering v0.2 解决：

> 两小时音频里，哪些几十秒真的值得人重新听？

People Context Workflow 要解决：

> 二十份档案里，这个人到底新增加了什么前情？

它们本质一致：

```text
保存稳定状态
↓
新材料只产生 diff
↓
机器处理普通累积
↓
人只审核 material change
```

---

# 34. 一句话结论

> **People 不应该是“最新 Mention / Project 的摘要”，而应该是多个 Publication Appearance 经过可追溯累积后形成的编辑投影。**

当前 People v2 已经完成：

```text
Identity
+ Reader Aggregation
```

下一步真正缺的是：

```text
Appearance Semantics
+ Context Ledger
+ Profile Diff
```
