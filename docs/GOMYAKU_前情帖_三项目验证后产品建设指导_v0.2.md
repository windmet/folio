# GOMYAKU / 語脈 × 前情帖
## 三项目验证后：Publication、Corpus 与下一阶段产品建设指导 v0.2

**日期：2026-08-14**  
**适用仓库：** `windmet/folio`  
**当前审阅分支：** `codex/komachoe-20260309`  
**当前审阅 HEAD：** `9ad78eab61d9e51cb6f1866bd39aade1b8a6baf5` (`feat: publish broadcast archive entries`)  
**关键前置提交：** `e81b39f6f6782b78048a9fd15535e862a2e63648` (`feat: introduce person model v2`)

---

# 0. 这份 v0.2 为什么需要重写

v0.1 的核心任务是：

```text
Komatsu36 收口
→ 第二个简单广播
→ Genericity Audit
→ 再判断是否能抽出 GOMYAKU
```

这个阶段已经过去。

当前仓库已经同时拥有：

```text
Komatsu36
├─ 极端复杂、多 Track、多人物、多 Thread
├─ production / regression baseline
└─ 证明“复杂事件能被结构化”

こまちょえ生ラジオ 2026.04.25
├─ 单 Track
├─ 6 Section
├─ 约 30 Public Event
├─ 无重型 Storyline / People View
└─ 证明“普通广播不需要复制 Komatsu36 的复杂度”

こまちょえ生ラジオ 2026.03.09
├─ 单 Track
├─ 6 Section
├─ 38 Event
├─ 实际电话嘉宾
├─ 大量跨 Project 重复人物
└─ 逼出 Person Model v2
```

因此现在已经不是：

> “Archive Core 到底能不能支撑第二案例？”

而是：

> **“当多个真实 Project 开始形成 corpus 之后，前情帖应该怎样成为一个完整 publication？”**

v0.1 把“第二案例完成”视为 GOMYAKU 物理抽离的主要触发条件。  
v0.2 修改这个判断：

> **触发条件在技术上已经满足，但物理拆仓不再是当前最高价值动作。**

原因不是 GOMYAKU 不成立，而是三个 Project 反而暴露出一批更优先、且明显属于 **前情帖 publication** 的问题：

- 首页仍然是旧“资料室”；
- reader-facing 品牌仍然是 `Magazine`；
- Project 与普通文章仍像两个后来拼起来的站点；
- 全局 Person 数据已经存在，但没有全局人物入口；
- 跨 Project 前情已经开始自然形成，但还没有 reader surface；
- 两档广播已 `published`，站点却仍全局 `noindex,nofollow`；
- README / package metadata 仍描述旧阶段；
- 首页仍用文件名字符串猜分类；
- 关系图现在有数据诱惑，但还没有足够明确的 edge 语义。

所以，v0.2 的最高原则改成：

> **先把前情帖建设成一个真正成立的 publication，再决定何时把 GOMYAKU 物理抽出去。**

---

# 1. 当前仓库审阅结论

## 1.1 v0.1 的哪些目标已经完成

### A. Komatsu36 已经完成它作为压力测试的使命

不再把它当新功能 playground。

它继续承担：

```text
multi-track regression
player regression
thread regression
people regression
mobile/desktop interaction regression
semantic regression
payload regression
```

这正是正确的位置。

**裁决：PASS / FROZEN**

---

### B. “简单广播是否能使用同一 Reader”已经被验证，而且不是一次

4/25 与 3/09 两个广播 Project 都继续消费同一套：

```text
Project
Track
Act / Section
Event
Player
Timeline
Search
Index / Mentions
```

同时：

```text
0 heavy Storyline requirement
0 Komatsu36-style People View requirement
0 multi-track requirement
```

说明“简单 Project 看起来像自己，而不是缩小版 Komatsu36”这一条已经成立。

**裁决：PASS**

---

### C. Generic structural validation 已经真正从 Komatsu36 regression 中分离

当前完整验证体系已经包含：

```text
verify:project:presentation
validate:projects
verify:person-model
build
validate:publication
Komatsu36 regression
Komachoe 4/25 regression
Komachoe 3/09 regression
```

这是 v0.1 想要的“Core invariants + publication-specific regression”方向。

**裁决：PASS**

---

### D. Person Model v2 已经落地

当前不再把“人物”混在 Project-local Mention 中。

已有：

```text
src/content/people/*.json
        │
        │ stable identity
        ▼
Global Person

src/content/projects/<project>/people/*.json
        │
        │ project-specific context
        ▼
Project Person Context
```

Global Person 保存：

```text
displayName
reading
aliases
links
optional contextProfile
```

Project Person Context 保存：

```text
project
person
summary
presence
roles
events
```

并已经实现：

```text
host            3
on-site         2
live-call       2
live-space      2
submitted       1
referenced      0.5
account-context 0.25
```

权重是 **derived policy**，不是事实字段；单 Project 取最高 presence，跨 Project 相加。

这正好解决了伊藤友紘：

```text
3/09  live-call
4/14  submitted
4/25  referenced
```

同一 Person，不同 Project Context。

同时 canonical identity migration 已经至少处理：

```text
ito → ito-tomohiro
seiten → kiyoten
ham-kento → hama-kento
```

**裁决：PASS**

---

### E. 广播 Index 已经完成第一次语义升级

当前广播仍保留：

```text
?view=mentions
```

但 Reader 上已经不再把所有人物都当普通 Mention，而是：

```text
本期参与
提及人物
作品 / 企划
背景 / 词条
```

实际电话嘉宾、现场参与、投稿与纯提及能够区分。

这说明：

> **Mentions 作为 UI 名称可以继续兼容，但 Person 已经不再是 Mention 数据实体。**

**裁决：PASS**

---

## 1.2 哪些目标还没有完成

### A. 前情帖还没有真正成为站点品牌

当前 reader-facing 仍大量存在：

```text
Magazine
资料室
冷门同好熟肉存档站 · 翻阅馆藏
Project Archive
Archive in progress
```

这和当前内容已经明显失配。

**状态：P0**

---

### B. 首页信息架构已经落后于当前产品

当前首页仍是：

```text
资料室
│
├─ 专题档案
│   ├─ Komatsu36
│   ├─ 3/09
│   └─ 4/25
│
└─ 四个旧文件夹
    ├─ Interview
    ├─ Archive
    ├─ Radio
    └─ Note
```

这在只有文章时合理。

现在却形成一个明显冲突：

> 两档广播已经是最成熟的结构化 Project，  
> 但首页下面仍然另外存在一个“Radio / 电台内容存档”文件夹。

于是“媒体类型”和“产品形态”被混在一起：

```text
广播 Project
vs
Radio folder
```

读者无法知道哪个才是站点真正的主入口。

**状态：P0**

---

### C. Global Person 有数据，没有 Reader Surface

现在已经存在：

```text
src/content/people/
```

但是还没有：

```text
/people/
/people/[id]/
```

这意味着 Person Model v2 目前只是：

> “数据层完成”。

还没有兑现它最大的 reader value：

> **从一次出现进入跨 Project 前情。**

**状态：P1**

---

### D. 跨 Project corpus 已经形成，但导航还是 Project-first

当前用户可以：

```text
Project
→ Event
→ Index
```

但还不能自然完成：

```text
伊藤友紘
→ 3/09 电话
→ Komatsu36 投稿
→ 4/25 再次被提及
```

也不能：

```text
某个长期 Motif
→ 多期 Event
```

这正是第三个 Project 以后才开始成立的新问题。

**状态：P1 / P2**

---

### E. 真正 Public Launch 的 metadata 仍未完成

虽然 radio `project.status` 已经是：

```text
published
```

但当前 Layout 仍全站：

```html
<meta name="robots" content="noindex, nofollow">
```

因此必须区分两个“published”：

```text
Project published
= 可以进入本站首页

Public web launch
= 搜索引擎 / metadata / OG / About / identity 已准备好
```

目前只完成前者。

**状态：P0**

---

### F. README / package metadata 已经成为明显历史债

当前仍然：

```text
README: # Megazine Blog
package.name: megazine-blog
description: 冷门同好熟肉存档站
```

README 还写着旧泛化分支与大量 RC 文档入口。

这不是运行 blocker，但已经会严重误导未来自己 / Agent。

**状态：P1 docs cleanup**

---

# 2. 三个 Project 以后，前情帖的产品定义应该正式收窄

前情帖当前不应该被定义成：

> “一个面向所有声优的 archive platform。”

也不应该被定义成：

> “一个更复杂的广播总结站。”

建议正式采用：

# 前情帖

> **一份围绕小松昌平的非官方语境档案。**  
> 从广播、采访、活动与公开记录出发，整理那些散落在时间里的前因后果。

更短的 Reader 表达可以继续使用：

> **这句话以前是不是说过？**

或 Masthead：

> **为了看懂这一句话，我们往前翻了很久。**

核心边界：

| 维度 | v0.2 决策 |
|---|---|
| Subject | 以小松昌平为 primary subject |
| Source | public-first，优先仍可访问的一手来源 |
| Editorial | 解释脉络，不建设完整百科 |
| Governance | 个人编辑型 publication，不开放 UGC |

这意味着：

```text
subject-centered ≠ advocacy-centered
```

网站不以“维护人物形象”为编辑目标。

同时：

```text
Corrections welcome ≠ Community contribution platform
```

可以接受纠错、线索和节目推荐，但不因此建设账号、投稿、审核和社区治理体系。

---

# 3. 前情帖与 GOMYAKU 的边界现在应该更清楚，而不是更模糊

## 前情帖拥有

```text
内容选择
事实裁决
Reader Copy
视觉
首页
人物/专题如何对读者呈现
About / Editorial Policy
publication-specific regression
```

## GOMYAKU / 語脈未来拥有

```text
Archive schema
Working / Canonical boundary
Evidence orchestration
Compiler
Generic validation
Portable identity / reference model
Authoring workflow
未来 CLI / Workbench
```

因此：

```text
前情帖 = publication
GOMYAKU = method / system
```

GOMYAKU 不应要求：

> “所有使用 GOMYAKU 的网站都长成前情帖的米白纸张 UI。”

前情帖也不应为了展示 GOMYAKU 的工程能力而把：

```text
Evidence
RAW
Review Queue
工程 taxonomy
```

暴露给普通读者。

---

# 4. v0.2 最重要的新结论：现在进入的是 Publication Architecture Phase

v0.1 的主问题：

> Core 能不能泛化？

v0.2 的主问题：

> **Corpus 怎样被读者进入？**

三个 Project 已经开始形成：

```text
Project layer
│
├─ Komatsu36
├─ 3/09 radio
└─ 4/25 radio
        │
        ▼
Person layer
│
├─ 小松昌平
├─ 伊藤友紘
├─ 清典
├─ 寺島惇太
└─ ...
        │
        ▼
Context layer
│
├─ 俺知
├─ HIROZ
├─ 某次 callback
├─ 某作品
└─ 某关系脉络
```

所以前情帖未来的基本形状不是：

```text
一堆互不相关的节目总结
```

而是：

> **一个从节目材料中按需生长出来的局部语境网络。**

注意：

**不是百科。**

百科的生产逻辑通常是：

```text
先创建人物条目
→ 想完整写人物
→ 搜全部资料
→ 维护百科
```

前情帖应该坚持：

```text
处理真实节目
→ 产生 Event
→ Event 连接 Person / Work / Context
→ 重复材料长期累积
→ 某个重要人物 / Motif 自然浮出来
```

也就是：

> **知识从真实材料中生长，而不是先设计百科目录再填空。**

---

# 5. P0：首页需要大规模重建，但先改信息架构，不要先改 CSS

当前首页最大的问题不是“视觉旧”。

而是：

> **它仍把站点理解为四种文章文件夹，而 Project Archive 已经变成真正主产品。**

因此首页 v2 应停止：

```text
Project shelf
+
Interview / Archive / Radio / Note 四文件夹
```

作为最高层结构。

---

# 6. 推荐的首页 v2 信息架构

建议第一屏：

```text
前情帖

为了看懂这一句话，
我们往前翻了很久。

一份围绕小松昌平的非官方语境档案。
从广播、采访、活动与公开记录出发，
整理那些散落在时间里的前因后果。
```

小字可以有：

```text
BROADCAST · EVENT · INTERVIEW · PUBLIC RECORD
```

而不是先解释：

```text
Project / Event / Thread / Track
```

---

## 6.1 第一入口：从“现在最值得进入的前情”开始

不要把全部 Project 按工程属性平铺。

首页首先应该回答：

> 第一次进来，我从哪看？

建议设置：

### FEATURED / 先从这里开始

Komatsu36 仍然可以是 flagship：

```text
36岁生日直播
五小时、多平台、多人事件
→ 进入专题帖
```

两档广播则可以作为：

```text
こまちょえ生ラジオ

2026.03.09
《俺知》再演后的第一次长复盘
→ 节目帖

2026.04.25
生日直播后的制作复盘
→ 节目帖
```

注意 Reader Copy 应解释：

> “为什么值得进去”。

不要主要展示：

```text
126 EVENTS
16 THREADS
3 TRACKS
```

这些可以保留为 secondary metadata，但不应成为首页信息核心。

---

## 6.2 第二入口：按人物进入

当 Global Person v1 上线以后，首页可以出现一个非常轻的：

### PEOPLE / 反复出现的人

例如：

```text
伊藤友紘
3 项档案 · 电话连线 / 投稿 / 再次提及

寺島惇太
多项档案 · 现场参与 / 舞台 / 广播提及

清典
多项档案 · 制作 / 电话 / 活动
```

这里只显示 4–6 个高 relevance Person。

完整入口：

```text
查看人物索引 →
```

**不显示 raw relevance score。**

`3.5` 只服务排序算法。

读者看到：

```text
3 项档案
电话连线
事前投稿
节目提及
```

即可。

---

## 6.3 第三入口：最近新增 / 最近整理

把当前“最近更新”从只消费普通 Post 改成：

> **统一 Publication Feed**

可以混合：

```text
节目帖
专题帖
采访
考古帖
普通文章
```

显示：

```text
2026.08.xx
节目帖 · こまちょえ 2026.03.09

2026.08.xx
节目帖 · こまちょえ 2026.04.25

2026.08.xx
专题帖 · 36岁生日直播

2026.xx.xx
采访 · ...
```

这样 Project 不再像后加在 Blog 上方的一块孤岛。

---

## 6.4 Interview / Archive / Radio / Note 不需要删除，但应该退位

当前四文件夹可以继续作为：

```text
文章筛选
馆藏类型
legacy content lane
```

而不是首页最高信息架构。

例如以后：

```text
文章与旧档
[采访] [考古] [广播旧文] [随笔]
```

它们负责：

> “网站收藏了什么类型的旧文章”。

而不是：

> “网站是什么”。

---

# 7. 首页重建前必须先解决一个数据问题：不要再靠 filename substring 猜分类

当前首页通过：

```text
id.includes('interview')
id.includes('radio')
id.includes('tweet')
```

决定文章类型。

这个机制在旧站够用，现在不应该继续扩张。

建议给 Post frontmatter 增加显式 publication metadata，例如：

```yaml
section: interview | archaeology | radio | note
```

Project 则增加 **publication-only metadata**，不要把它污染 Archive Core。

建议：

```json
"publication": {
  "kind": "special" | "episode",
  "date": "2026-04-25",
  "seriesKey": "komachoe-radio",
  "featured": true,
  "homeDeck": "生日直播后的两小时制作复盘"
}
```

字段名可以调整，但原则不变：

> **首页不要通过 `tracks === 1 && threads === 0` 猜“这是广播”。**

Track / Thread 数量是 Archive implementation。

“节目帖 / 专题帖”是 publication semantics。

这是两层不同的事实。

---

# 8. P1：Global People v1 是首页之后最值得做的 Reader 能力

Person Model v2 的数据已经完成。

下一步不要再继续扩 schema。

直接兑现 Reader value：

```text
/people/
/people/[id]/
```

---

# 9. `/people/` 应该是什么

不是声优百科。

而是：

> **当前前情帖中反复出现的人物索引。**

默认按 derived relevance 排序。

卡片显示：

```text
伊藤友紘
いとう ともひろ

3 项档案
电话连线 · 事前投稿 · 节目提及

第一次进入：
《俺知》再演复盘广播
```

可以提供：

```text
查看前情 →
```

不要显示：

```text
RELEVANCE 3.5
```

也不要因为有人进了 global Person 就自动补：

```text
生日
身高
血型
全部出演作
完整人物履历
```

---

# 10. `/people/[id]/` 第一版应非常克制

以伊藤友紘为例：

```text
伊藤友紘
いとう ともひろ

前情帖内收录：3 项档案

────────────────

2026.03.09
こまちょえ生ラジオ
[电话连线]

第一通电话嘉宾。与小松聊回旧 HIROZ、
再演复归与过去关系。

00:43:16 →
00:57:48 →
...

────────────────

2026.04.14
36岁生日直播
[事前投稿]

本人未到现场，通过投稿参与名场面复盘。

查看相关节点 →

────────────────

2026.04.25
こまちょえ生ラジオ
[节目提及]

小松再次谈到两人的联系与打ち上げ。

01:51:53 →
```

这页已经成立。

完全不需要先写：

> 伊藤友紘完整人物传。

---

# 11. Contextual Person Profile 应该是 Optional Upgrade

Global Person 已经允许：

```text
contextProfile
```

这是正确方向。

没有：

```text
→ 自动生成跨 Project 索引页
```

有：

```text
→ 页面顶部多一小段“为什么在前情帖里需要认识他”
```

例如伊藤以后可以增加：

> 小松出道前时期的重要旧友，也是《俺知》相关过去经历的一名共同见证者。虽然已经长期离开公开活动领域，他仍在 2026 年的数次相关材料中，以电话、投稿和被再次提及的不同形式进入叙事。

然后停止。

不要推断其退圈后的私人生活。

因此：

> **页面深度由语境价值决定，而不是现实知名度决定。**

---

# 12. Project Index → Global Person 要形成第二跳

当前广播：

```text
Timeline
→ 本期 Index
```

很好。

下一步在 Project Person Index card 里增加一行：

```text
查看跨档案前情 →
```

跳：

```text
/people/ito-tomohiro/
```

不要让 Event inline link 直接离开 Project。

推荐阅读路径：

```text
Event
↓
本期 Index
↓
先知道“他在这一期是什么位置”
↓
需要更多
↓
Global Person
↓
跨 Project 前情
```

这样信息剂量是逐层增加的。

---

# 13. 关系图现在不要做

当前已有 Person relevance。

但：

```text
人物 relevance
≠ 关系强度
```

例如：

```text
伊藤 global score 高
```

只说明：

> 他在当前 corpus 中反复重要。

不说明：

> 小松—伊藤关系的“强度数值”。

未来 Relationship edge 必须来自明确语义，例如：

```text
direct conversation
co-participation
shared work
submitted message
A mentions B
callback
public interaction
```

所以当前最多建立：

```text
docs/editorial/relationship-candidates.md
```

记录：

```text
pair
why relevant
supporting Project/Event
candidate relation label
whether reader-facing context is needed
```

等至少 4–5 个 Project 后再看哪些 edge type 真正稳定。

**不要现在上 D3 / Cytoscape。**

图不是当前缺的东西。

当前缺的是：

> 每一条边到底代表什么。

---

# 14. Works / Context 暂时不要跟着 Person 一起 globalize

现在 `ore-shiri` 已经在多个广播 Project 里重复。

确实会产生第二个问题：

> Work 是否也应该变成 Global Entity？

v0.2 决策：

**先不做。**

原因：

Person 已经出现了明确 reader use case：

```text
这个人跨三期以不同方式出现，我要把它串起来。
```

Work / Context 当前的 Project-local summary 仍然承担：

> “这一期为什么提到它”。

例如同一个《俺知》：

3/09 的重点和 4/25 的重点不同。

等出现：

```text
同一 Work 跨 ≥3–4 Project
+
稳定 metadata / official source 被明显重复维护
+
读者确实需要跨 Project Work 页面
```

再做：

```text
Global Work Identity
+
Project Work Context
```

不要因为 Person Model 成功就提前把所有 Entity 都抽象成 giant graph schema。

---

# 15. P0：Reader-facing Brand Pass 现在应该正式做

v0.1 当时还建议品牌两阶段。

现在三个 Project 已经让“前情帖”这个 publication 有实际内容支撑。

建议正式把 Reader 层：

```text
Magazine
资料室
```

替换为：

```text
前情帖
```

推荐首屏：

```text
前情帖

为了看懂这一句话，
我们往前翻了很久。

一份围绕小松昌平的非官方语境档案。
```

可以保留英文小字：

```text
CONTEXT ARCHIVE
```

或：

```text
BROADCAST · EVENT · INTERVIEW · PUBLIC RECORD
```

不要把：

```text
GOMYAKU
```

放成普通读者第一屏主品牌。

---

# 16. GOMYAKU 应该出现在 About / Footer，而不是抢 Publication 品牌

例如：

```text
Built with GOMYAKU / 語脈
```

或 About：

> 前情帖使用 GOMYAKU / 語脈 的结构化工作流整理长媒体、事件与语境。

这是一个“懂的人可以继续点”的第二层。

普通读者完全不需要先理解：

```text
Archive Core
Observation
Claim
Review Queue
```

才有资格看广播。

---

# 17. P0：必须增加 About / Editorial Policy

当前真正 Public Launch 前，建议至少有：

```text
/about/
```

内容短而清楚。

必须说清四件事：

## 17.1 Subject

> 前情帖目前以小松昌平相关公开内容为主要对象；其他人物只在理解相关材料所需的范围内进入档案。

## 17.2 Source

> public-first。尽量指向仍可访问的一手公开媒体，不以重新托管媒体为目标。

## 17.3 Editorial

> 区分事实、来源、编辑连接与推断；不为填满页面制造 certainty。

## 17.4 Governance

> 个人编辑项目。欢迎纠错与线索，但不是开放投稿社区。

可以再增加：

```text
Corrections
Rights / Contact
```

不要一开始写成法律论文。

原则：

> Source owns the contact route.

真正需要联系权利方时，从当前主要 Source 的官方联系链开始，而不是因为页面出现十个声优就逐个联系事务所。

---

# 18. P0：`noindex,nofollow` 必须成为一次明确发布决策

当前两个 Layout 仍全局 noindex。

因此下一步不要“顺手删”。

请建立显式 Launch Gate：

```text
[ ] 前情帖 reader brand
[ ] homepage v2
[ ] About / Editorial Policy
[ ] title / description
[ ] OG metadata
[ ] favicon / mark
[ ] production origin QA
[ ] robots decision
```

全部通过后再：

```text
noindex,nofollow
→
index,follow
```

或者先只对白名单 route 开 index。

最重要的是：

> `project.status = published` 不等于“已经同意搜索引擎公开收录”。

---

# 19. 首页工程顺序：先 Projection，再视觉

用户当前希望大改首页，这个方向正确。

但建议 Coding Agent 不要从：

> “重新设计 index.astro”

开始。

正确顺序：

```text
Home IA Contract
↓
explicit publication metadata
↓
Home projection helper
↓
People index route contract
↓
wireframe
↓
visual implementation
↓
mobile QA
```

当前 `index.astro` 已经同时承担：

```text
数据获取
类型推断
folder config
project shelf
recent list
hash filter
CSS
```

v0.2 可以顺手把它拆成：

```text
src/lib/homeProjection.ts
src/components/home/HomeMasthead.astro
src/components/home/FeaturedArchive.astro
src/components/home/PeopleTeaser.astro
src/components/home/RecentFeed.astro
src/components/home/LegacyCollections.astro
src/pages/index.astro
```

不要因此引入 React。

Astro 继续足够。

---

# 20. Homepage v2 的视觉方向

保留当前项目最有价值的：

```text
纸张
文件夹
低饱和
serif
细线
档案感
```

不要重做成 SaaS Dashboard。

但“文件夹”不必再承担全部 IA。

建议：

### Masthead
大留白 + 前情帖品牌。

### Featured
更像几张“已归档材料”的大纸页，而不是四个彩色应用入口。

### Radio
蓝色继续作为节目帖的类型提示，但只是 accent。

### Komatsu36
继续暖砖红 / 旧纸色。

### People
可用中性灰 / ink 色，不再强行给每个人彩色分类。

首页应该让人看到：

> 这是一个有很多入口的个人档案 publication。

而不是：

> 这是一个四色分类 dashboard。

---

# 21. Reader Vocabulary 可以开始替换工程词，但不要动 schema

内部继续：

```text
Project
Event
Thread
Person
Source
```

Reader 可以逐渐说：

```text
专题帖
节目帖
人物帖
考古帖
```

例如：

```text
Komatsu36 → 专题帖
こまちょえ → 节目帖
Global Person → 人物前情 / 人物帖
旧推文章 → 考古帖
```

但不需要现在一夜之间把所有 UI 都改成“帖”。

先在首页 / About / entry labels 测试。

---

# 22. Site-wide Search 是很自然的下一步，但不阻塞首页 v2

当前每个 Project 已有局部 Search。

当：

```text
3 Project
+
Global Person
```

出现以后，站级搜索开始真正有价值。

未来：

```text
搜索：伊藤友紘
↓
人物
伊藤友紘 · 3 项档案

节目
3/09 · 4 个节点
4/25 · 1 个节点

专题
Komatsu36 · 2 个节点
```

但首页 v2 第一轮不必为了 Search 再拖一个大阶段。

优先：

```text
People route
+
统一 Recent feed
```

之后再做：

```text
/search/
```

---

# 23. 工作流 v0.1 文档怎么处理

上传的：

```text
00_README
01_WORKFLOW_ARCHAEOLOGY
02_TRANSCRIPT_EVIDENCE_PIPELINE
03_AUTHORING_SOP
04_AGENT_HUMAN_AUTOMATION_BOUNDARY
```

**不要覆盖。**

它们是两项目时期的真实工作流考古记录。

其中大量原则仍然有效：

```text
Source Freeze
Observation → Claim → Review Task
RAW 不覆盖
Archive-grade first
Selective refinement
incremental patch
Coding Agent 不重读 RAW
Human owns final editorial/product decisions
Workspace ≠ Public Archive
```

这些不需要因为首页重建而改变。

---

# 24. 但 Authoring 文档未来需要一个 v0.2 Addendum

第三个 Project + Person Model v2 已经补充了一个 v0.1 没有验证过的事实：

> **People View optional，不等于 Person Context optional。**

v0.1 的旧规则容易读成：

```text
普通广播没有 People View
→ 不需要 Person 数据
```

现在应改成：

```text
Global Person Identity
= 低成本稳定 entity，可以跨 Project 复用

Project Person Context
= 这个人在本 Project 中怎么进入叙事

Heavy People View
= 完全 optional 的 Reader projection
```

也就是说：

> **数据身份和 Reader View 是否存在，是两件事。**

---

# 25. Authoring SOP v0.2 以后应加入 Person Canonicalization Pass

建议未来在：

```text
Discovery
→ Canonical Event Inventory
```

之间或之后增加：

## Entity / Person Resolution

Agent 先输出：

```text
surface name
possible canonical person
project presence
role
event anchors
identity conflict
```

例如：

```text
伊藤
伊藤友紘
ito
ito-tomohiro
```

统一到：

```text
global Person = ito-tomohiro
```

Project Context 再写：

```text
live-call
submitted
referenced
```

这样以后不会再等第三个 Project 才发现 ID 漂移。

---

# 26. v0.1 的 Workflow 仍是 Authoring Track，不应该抢当前 Product Track

当前两条工作线需要明确分开：

```text
A. 前情帖 Publication Track
首页 / People / Brand / About / Reader / cross-project navigation

B. GOMYAKU Authoring Track
ASR / Evidence / Review / Mother Draft / Compiler / Automation
```

当前主线：

# A

B 继续保持：

> “有新 Project 时改进实际工作流”。

不要为了理论上可以产品化就暂停前情帖，去造：

```text
GUI Workbench
通用 ASR 管线
自动 speaker resolver
```

---

# 27. v0.2 对物理拆仓的重新裁决

v0.1：

```text
第二 Project 完成
→ 可以开始 GOMYAKU extraction
```

v0.2：

> **“可以”不等于“现在最该”。**

目前逻辑边界已经足够清楚：

```text
Archive data
validation
Person identity/context
Reader presentation
publication regression
```

但前情帖本身刚刚从：

```text
单 Project
→ corpus
```

转型。

如果现在拆：

```text
windmet/gomyaku
windmet/qianqingtie
```

你会同时承担：

```text
package boundary
versioning
dependency publishing
migration
CI
two-repo coordination
```

而这些并没有解决当前用户痛点。

所以建议新的物理拆仓 trigger：

```text
[ ] 前情帖 Homepage v2 稳定
[ ] Global People v1 稳定
[ ] 至少 4 个真实 Project
[ ] 出现至少一个“前情帖之外”的 GOMYAKU consumer / fixture
    或者本地 Authoring 已经明确需要独立 package
[ ] schema / validator boundary 连续两个 Project 无 publication-specific patch
[ ] extraction 能减少维护成本，而不是增加
```

满足再拆。

---

# 28. 关系网的真正启动条件

不要按“项目数量”机械启动。

至少满足：

```text
[ ] Global Person page 已稳定
[ ] 用户已有明确跨 Person 导航需求
[ ] 至少 3 种可解释的 edge type
[ ] edge 可指向 supporting Event / Project
[ ] 不需要用主观“关系强度”补空白
```

然后才定义：

```text
Relationship Context
```

最后才是 Graph。

---

# 29. 当前 README / docs 应该怎么收口

建议在 Homepage v2 分支开始前先做一个非常小的：

## DOC-P0

### README
更新为：

```text
前情帖 / folio
当前 3 个 Project
Person Model v2
当前 active branch
当前 public/noindex 状态
验证命令
```

大量 Komatsu36 RC 历史入口移到：

```text
docs/archive/komatsu36-history.md
```

README 第一屏不要再列十几份 RC 文件。

### package.json
`name: megazine-blog` 可以暂时不改，避免把 package rename 和 brand pass 绑死。

但 description 应至少不要继续误导。

### old docs
冻结，不全量重写。

新增：

```text
docs/product/GOMYAKU_QIANQINGTIE_GUIDE_v0.2.md
```

即可。

---

# 30. 推荐的新阶段命名

不要继续沿用 v0.1 的：

```text
REL-P0
GEN-P1
PROD-P2
```

因为那些阶段已经完成/变形。

建议：

```text
PUB-02   前情帖 publication / brand / homepage
COR-02   cross-project corpus navigation
PER-02   global people reader surface
CTX-02   context / backlink / cross-project discovery
REL-02   relationship candidate / future graph
AUT-02   authoring workflow improvements
GOM-02   future physical GOMYAKU extraction
```

当前顺序：

```text
PUB-02
→ PER-02
→ COR-02 / CTX-02
→ REL-02 candidate only
→ GOM-02 later
```

---

# 31. 推荐实际实施顺序

## Phase PUB-02A — Freeze current three-project baseline

基线：

```text
9ad78eab
```

验收：

```text
npm run validate
Komatsu36 regression
3/09 regression
4/25 regression
Person Model regression
```

之后 Homepage 重建不能破坏三个 Project。

---

## Phase PUB-02B — Publication metadata

目标：

- Post 不再 filename heuristic 分类；
- Project 不再靠 track/thread 数推断 reader kind；
- 建立统一 Home Projection。

不要改 Reader Core。

---

## Phase PER-02A — Global People routes

实现：

```text
/people/
/people/[id]/
```

先自动聚合已有 Project Person Context。

不写 Relationship。

不要求 contextProfile。

---

## Phase PUB-02C — Homepage v2

实现：

```text
Masthead
Featured archive
Recent publication feed
People teaser
Legacy article collections
About entry
```

桌面 / 手机都重新产品签收。

---

## Phase CTX-02A — Project ↔ Global Person

在 Project Index card 中：

```text
查看跨档案前情 →
```

Global Person 页反向：

```text
Project
→ Event anchors
```

形成闭环。

---

## Phase PUB-02D — Brand / launch metadata

处理：

```text
Magazine → 前情帖
title
description
OG
favicon
About
Editorial Policy
Contact / correction
robots
```

production QA 后再决定开放 index。

---

## Phase COR-02A — Global search（可后置）

统一索引：

```text
Project
Event
Person
Work/Context
Post
```

这一步不阻塞前面几项。

---

## Phase REL-02A — Relationship Candidate Log

只记录数据需求。

不画 Graph。

---

# 32. Homepage v2 的 Acceptance Criteria

必须满足：

### Brand
- 第一屏能在 10 秒内说明“前情帖是什么”；
- 不需要先理解 GOMYAKU；
- 不再显示 `Magazine` 为主品牌。

### Information Architecture
- Project 不再作为后来追加的特殊 shelf；
- 两档广播不会和一个独立 Radio folder 产生概念冲突；
- 普通文章仍有入口，不被 Project 吞掉。

### Reader Orientation
- 新人能找到“从哪里开始”；
- 老读者能找最近更新；
- 想找人物的人有入口；
- 想看旧采访/考古的人仍然能进入。

### Mobile
- 首屏不出现四张巨大分类卡把内容推到很后；
- Featured 不横向溢出；
- People teaser 不变成人名墙；
- Typography 保持前情帖纸本视觉。

### Engineering
- 不引入 slug-specific homepage conditional；
- 不使用 filename substring 作为新内容 taxonomy；
- 不复制 Project 数据；
- `npm run validate` 全绿；
- Komatsu36 HTML/payload 不因为 Homepage 重建发生无关增长。

---

# 33. Person v1 Acceptance Criteria

`/people/[id]/` 第一版满足：

```text
stable identity
reading
optional official links
optional contextProfile
Project count
ordered Project contexts
presence labels
project-local summary
event anchors
```

不要求：

```text
biography
完整 career
relationship graph
所有作品
生日/身高/血型
第三方百科补完
```

伊藤友紘应成为第一个验收 fixture：

```text
3/09 live-call
4/14 submitted
4/25 referenced
```

如果这一页第一次能让读者明白：

> “原来生日会那封投稿为什么重要。”

Person v1 就成功了。

---

# 34. 现在不要做的东西

这一轮明确禁止把 scope 扩成：

- GOMYAKU 独立仓库；
- monorepo；
- GUI Workbench；
- Relationship graph；
- 主观 relationship strength；
- Global Works encyclopedia；
- 自动 NER 把所有名字变 Person；
- 自动生成 Context Profile；
- 自动给人际关系下定义；
- 重做 Komatsu36 Reader；
- 为了新首页重写 ProjectArchiveShell；
- 自建媒体托管；
- 全量公开 Transcript；
- 为搜索引擎开放之前先忽略 About / source / editorial boundary。

---

# 35. 这轮最重要的产品思想更新

v0.1 最重要的问题是：

> “一套极端复杂 Archive 能否变成通用工具？”

v0.2 的问题变成：

> **“当多个 Archive 开始共享人物、作品和旧事以后，怎样让读者沿着脉络继续走？”**

于是当前产品的三个尺度终于出现：

```text
一次节目
→ Project / Event / Section

多次节目
→ Person / recurring context / cross-project anchors

长期馆藏
→ 前情帖
```

GOMYAKU 真正要抽象的，也不只是：

```text
怎样生成一个 Project
```

而逐渐变成：

> **怎样让局部、被审过的 context 随真实材料长期累积，而不退化成百科、AI 总结或无证据关系图。**

---

# 36. 对 GOMYAKU 工作流文档的 v0.2 修正摘要

原 v0.1 继续有效的核心：

1. Source Freeze；
2. RAW Observation 不覆盖；
3. Observation → Claim → Review Task；
4. Archive-grade 优先；
5. Event discovery 先于逐字精修；
6. Selective Refinement；
7. 高影响冲突才升级 Pro / Human；
8. Mother Draft 增量 patch；
9. Canonical Inventory 后 Coding Agent 不重读 RAW；
10. Human 负责 publication / narrative / final copy；
11. Workspace ≠ Public Archive；
12. Generic validator 与 publication regression 分离。

v0.2 需要补充：

13. **Global Identity ≠ Project Context**；
14. **Person Context 可以存在，即使 Project 不显示重型 People View**；
15. **Presence 与 Role 分离**；
16. **canonical identity resolution 应在多 Project 累积前完成**；
17. **cross-project reader surface 是 Archive 累积后的自然第二阶段**；
18. **relevance 是排序 policy，不是人物事实**；
19. **Relationship edge 必须有可解释语义和 evidence anchor**；
20. **Publication homepage / brand 不属于 GOMYAKU Core。**

---

# 37. 最终决策

当前阶段不应继续问：

> “什么时候才能开始 GOMYAKU？”

因为：

> **GOMYAKU 的方法论已经在仓库和工作流里存在。**

现在真正要做的是让：

> **前情帖本身第一次完整成立。**

也就是：

```text
三个已发布 Project
+
Person Model v2
+
跨 Project 人物入口
+
新的 Publication 首页
+
清晰 Subject / Source / Editorial / Governance 边界
+
真正的 Public Launch metadata
```

当这些完成以后，前情帖才会从：

> “三个做得很完整的 Project 共用一个首页”

变成：

> **“一个能够让人从一句话、一个人或一档节目不断往前追的语境馆藏。”**

这应该是 v0.2 的主要建设目标。

---

# 38. 一句话 Roadmap

```text
冻结三项目基线
↓
显式 Publication metadata
↓
Global People Reader
↓
前情帖 Homepage v2
↓
Project ↔ Person 跨档案闭环
↓
About / Editorial / Public Launch
↓
站级 Search
↓
Relationship candidate
↓
第四、第五项目继续验证
↓
再决定 GOMYAKU 物理抽离
```

**不要把“现在已经有资格抽 GOMYAKU”误解成“现在必须先抽 GOMYAKU”。**

目前最有价值的动作，是把已经存在的这些结构真正组织成一个读者会自然进入、自然追下去的 **前情帖**。
