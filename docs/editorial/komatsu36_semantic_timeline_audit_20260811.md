# Komatsu36 Folio 收口审计：时间轴 / 人物 / Storyline 语义纠偏

> 审计对象：`windmet/folio` 分支 `codex/komatsu36-project-archive`
>
> 日期：2026-08-11
>
> **边界**：本审计只处理结构化元数据（`startMs` / `endMs` / `timingStatus` / `people` / `narrativeMode` / Thread `nodes` / 缺失事件）。**不要改任何已经人工润色的 `title`、`summary`、Thread 正文、人物简介或读者向文案。** 如果正文与证据有矛盾，仅列出矛盾，不自动改文案。

---

## 0. 结论先行

这轮问题不是正文质量问题，而是早期事件迁移后留下的三类元数据漂移：

1. **范围起点漂移**：Event 的标题/摘要描述整段事件，但 `startMs` 落在中途 payoff（熊谷俳句）或铺垫之前（虎徹竹光）。
2. **人物关系漏标**：`people` 仍保留“话题对象/主持人”，却漏掉真正完成动作或补刀的人（熊谷俳句、濱的 34J / 大還元祭）。
3. **正文/Thread 已知道关系，但节点图没登记**：Thread 的 deck/body 已描述某段事件，`nodes` 却漏了现成 Event（俳句、寺島 Big Dream、濱 long-running gag、内田跨平台、《俺知》制作复盘）。

因此本轮不要重新生成文案，不要重建整个项目；只做 **metadata-only closeout patch**。

---

# 1. P0：确定应修的项目

## P0-01｜狩野俳句：02:54:49 → 02:54:44，并接入俳句 Storyline

**文件**

`src/content/projects/komatsu36/events/yt-025449-kano-haiku.json`

**当前**

- `startMs: 10489000`（02:54:49）
- `timingStatus: exact`
- `people: [kano-sho, komatsu-shohei]`
- `narrativeMode: timeline-only`

**纠正**

```text
startMs: 10484000   # 02:54:44
narrativeMode: threaded
```

`people`、正文均不改。

**证据**

- 用户已经在原视频人工定位到实际起句约 **02:54:44**。
- 旧 SRT cue 到 02:54:49.725 才写出「お祝いで／飛び出しちゃった／目出たい」，说明这一小窗的 Whisper cue 起点本身晚约 5～6 秒。
- ARC-11 明确把狩野眼睛俳句列入同一条“人气者／俳句／Space抱负”闭环。

**Thread**

在 `src/content/projects/komatsu36/threads/popular-space-haiku.md` 中加入：

```yaml
- event: komatsu36/yt-025449-kano-haiku
  role: development
```

不要改 Event 文件名。旧 ID 可继续保留，真实时间以 `startMs` 为准。

---

## P0-02｜熊谷俳句：人物集合错误，startMs 落在重复/补刀段中途

**文件**

`src/content/projects/komatsu36/events/yt-025755-kumagai-haiku.json`

**当前**

- `startMs: 10675000`（02:57:55）
- `endMs: 10692000`（02:58:12）
- `people: [kumagai-toshiki, komatsu-shohei]`
- Thread 已连接 `popular-space-haiku`

### 1) people 纠正

改成：

```json
[
  "komatsu36/kumagai-toshiki",
  "komatsu36/kano-sho",
  "komatsu36/terashima-junta"
]
```

**移除 `komatsu-shohei`。**

这里 Event 的语义主体不是“被夸的小松”，而是：

- 熊谷俊輝：给出原始 5-7-5；
- 狩野翔＋寺島惇太：以“W武市／前辈组”身份追加 7-7 毒舌下句。

历史复核记录明确把 02:57:53 的下句归为 **狩野＋寺島**，不是模糊推断。

### 2) startMs 纠正

当前 02:57:55 实际已经进入“再说一遍＋前辈下句”的 payoff，和现有摘要“熊谷认真说五七五 → 前辈补刀”的完整事件范围不匹配。

证据链：

- SRT：02:57:17.550 开始铺垫；02:57:27.690 进入熊谷正文；02:57:55.120 才进入第二遍和下句。
- 同一小窗中，狩野事件已人工确认 SRT cue 比真实视频晚约 5.7 秒。
- 粉丝时间轴把熊谷段入口放在 **02:57:21**，把下句放在 **02:57:53**。

因此建议本轮采用：

```text
startMs: 10642000   # 02:57:22
endMs:   10692000   # 暂保持 02:58:12
```

因为 02:57:22 是“人工确认的局部 cue 偏差 + 独立评论时间轴”交叉推导，而不是本次重新看视频得到，建议同时：

```text
timingStatus: approximate
```

如果以后切片时再次微窗看原视频，只需在 **02:57:21～02:57:23** 内定锚；不需要重听整段。

---

## P0-03｜俳句 Thread 漏了狩野、矢野两个已经存在的 Event

**文件**

`src/content/projects/komatsu36/threads/popular-space-haiku.md`

**当前 Thread 已有**

- 02:50:57 熊谷触发俳句企划
- 02:53:53 寺島“人気者”
- 02:57:55 熊谷＋前辈下句
- 04:55:52 小松 Space 抱负

**但 ARC-11 的完整链还有**

- 狩野眼睛俳句
- 矢野太阳镜俳句

建议 nodes 调整为：

```yaml
nodes:
  - event: komatsu36/yt-025057-birthday-haiku-formed
    role: setup
  - event: komatsu36/yt-025353-popular-haiku
    role: development
  - event: komatsu36/yt-025449-kano-haiku
    role: development
  - event: komatsu36/yt-025755-kumagai-haiku
    role: development
  - event: komatsu36/yt-030823-sunglasses-haiku
    role: development
  - event: komatsu36/yt-045552-space-ambition
    role: payoff
```

`yt-030823-sunglasses-haiku` **继续保留在 `yano-sunglasses` Thread 中**。同一 Event 同时属于“太阳镜物品线”和“当晚俳句线”是正确的多重语义，不要二选一。

---

## P0-04｜34J：濱是实际动作人，且 Thread 正文已经写到、节点却没连

**文件**

`src/content/projects/komatsu36/events/yt-013800-thirty-four-yen.json`

**当前 people**

```text
terashima-junta
komatsu-shohei
```

**应至少补入**

```text
hama-kento
```

推荐最终保留三人：

```json
[
  "komatsu36/hama-kento",
  "komatsu36/terashima-junta",
  "komatsu36/komatsu-shohei"
]
```

原因：复核记录明确指出，拿着被放弃的剩券问“这个给我吧”的人是 **濱健人**。寺島是券的提供者，小松是原始受赠/放弃方，因此三人均有事件内功能。

### Thread A：`terashima-big-dream.md`

该 Thread 的 deck 已经直接写了“濱想抢券？那就给你34円！”，但 nodes 没有这个 Event。

加入：

```yaml
- event: komatsu36/yt-013800-thirty-four-yen
  role: development
```

### Thread B：`hama-paid-drinking.md`

濱的长线本来就是：

“没带礼物 → 接被放弃的券/34円 → 高价酒/频道大還元祭 → 18TRIP → Amazon 卡 → ギャラ飲み”

同样加入：

```yaml
- event: komatsu36/yt-013800-thirty-four-yen
  role: development
```

并把 Event：

```text
narrativeMode: timeline-only
```

改为：

```text
narrativeMode: threaded
```

---

## P0-05｜频道“大還元祭”：漏掉核心动作人濱，且未接入濱长线

**文件**

`src/content/projects/komatsu36/events/yt-013840-great-payback.json`

现摘要本身已经写到：Big Dream 假设中奖 → 点高价酒 → 小松解释频道收入“大還元祭”。原始转写中“Moët Rosé 一瓶约2万、10瓶可以吗”等高价酒提议明确由 **濱** 发起。

### people

至少补：

```text
komatsu36/hama-kento
```

推荐最终：

```json
[
  "komatsu36/hama-kento",
  "komatsu36/terashima-junta",
  "komatsu36/komatsu-shohei"
]
```

### Thread

在 `hama-paid-drinking.md` 中加入：

```yaml
- event: komatsu36/yt-013840-great-payback
  role: development
```

Event 同步改：

```text
narrativeMode: threaded
```

**不要重写现有摘要。**

---

## P0-06｜内田 LINE 跨平台 Thread 漏了 YouTube 侧 18TRIP 节点

**文件**

`src/content/projects/komatsu36/threads/uchida-line-call.md`

ARC-09 的完整因果不是只有 Space 电话：

1. 主直播说内田修一要来电话；
2. 小松离席；
3. **主区 18TRIP 成员聚集，濱问「エイトリって何ですか？」**；
4. Space 内田连通；
5. 内田要求寺島；
6. 寺島被跨房间召唤过去。

当前已有 Event：

`komatsu36/yt-020644-eight-trip`

应加入 `uchida-line-call`：

```yaml
- event: komatsu36/yt-020644-eight-trip
  role: development
  transition: 小松离席接内田电话后，主直播一侧因为18TRIP成员聚集又自行长出支线。
```

它已经属于濱自己的 running-gag Thread，继续保留双重归属。

---

## P0-07｜《俺知》制作 Thread 的正文写了“俳句即兴”，却漏了现成 controlled-adlib Event

**Thread**

`src/content/projects/komatsu36/threads/ore-shiri-making-of.md`

其 deck/body 明确把“轻松的俳句即兴”“声优的即兴能力”列为十人名场面复盘的一部分，但 nodes 从 02:41 左右直接跳到 03:27，漏掉已有：

`src/content/projects/komatsu36/events/yt-024207-controlled-adlib.json`

该 Event 正是：

- 熊谷选择喜剧/ad-lib 段；
- 讨论“受控即兴”；
- 直接形成后续生日俳句的前因。

建议：

```yaml
- event: komatsu36/yt-024207-controlled-adlib
  role: development
```

并把 Event 的：

```text
narrativeMode: timeline-only
```

改为：

```text
narrativeMode: threaded
```

这是“Thread 文案已经承认它存在，但节点图漏登记”的典型迁移残留。

---

## P0-08｜虎徹竹光：04:08:10 → 04:08:24

**文件**

`src/content/projects/komatsu36/events/yt-040820-kotetsu-kano.json`

**当前**

```text
startMs: 14890000   # 04:08:10
timingStatus: approximate
```

**复核**

- 冻结主稿：虎徹竹光段 **04:08:24～04:09:50**。
- SRT：04:08:05 还是“这是目玉／最大奖”的铺垫；04:08:20 才“俺を知ってくれと言えばこちら”；**04:08:24.640 才真正揭晓竹光**；04:09:17 才报 58 番并进入中奖。

现 Event 摘要包含“奖品是什么＋狩野中奖＋适配度”，所以点击起点应落在奖品揭晓，而不是前一个铺垫句中间。

建议：

```text
startMs: 14904000   # 04:08:24
```

`timingStatus` 可继续保留 `approximate`，不要仅凭本轮审计升级证据等级。

**不要改文件名 `yt-040820-...`。** ID 是稳定链接，不是真值字段。

---

# 2. P1：建议修，但属于“完整语义图”而非明显页面错误

## P1-01｜Birthday Payback Thread 缺室元気 7/31 这一环

Canonical ARC-02 的完整链是：

観世 10/15 → 室账号 7/31 → 内田电话聊很久却漏问 → 清典 11/14 → 才想起忘问内田。

当前 `birthday-payback.md` 只有：

- 観世规则建立；
- 清典生日；
- 想起漏问内田。

中间“规则确实对室账号也执行过”的发展节点缺失，而且当前没有独立的 00:04:46 Event。

如果希望 Thread 与 ARC 完全同构，建议新增一个很薄的 metadata Event：

```text
sp2-000446-muro-birthday
startMs: 286000
track: sp2
people: [komatsu-shohei]
personRelations:
  - person: muro-genki
    relation: account-context
narrativeMode: threaded
```

这里**不要把账号上的未知说话者直接标成室元気本人**。这是现有 schema 中 `account-context` 最适合发挥作用的地方。

如本轮不想新增读者可见 Event，可先留作 P1，不影响现有正文正确性。

---

## P1-02｜Bingo Thread 可补正式启动节点 03:54:21

当前 `bingo-payback.md` 已有：

- 03:53:50：为什么突然做 Bingo / 返礼目的；
- 03:55:20：规则开始形成；

但中间已经存在 `yt-035421-bingo-starts`（「ビンゴ大会やります！」）而未进入 Thread。

建议加入：

```yaml
- event: komatsu36/yt-035421-bingo-starts
  role: development
```

这不是时间纠错。**03:53:50 与 03:54:21 是两个不同语义节点：前者是返礼目的前置，后者是正式宣布 Bingo。不要把前者改成 03:54:21。**

---

## P1-03｜《俺知》making-of 是否做“全 Pick 覆盖”需要一次产品层选择

ARC-10 实际枚举了从 02:25 到 03:45 的大量 Pick：光富、堀金/井上、佐藤、熊谷、寺島、狩野、汐谷、濱、夜武市死亡、伊藤投稿、清典、小松总结等。

当前 `ore-shiri-making-of.md` 是“代表节点型”Thread，而标题/正文读起来又接近“十人全景型”Thread。

本轮 **确定必须补** `yt-024207-controlled-adlib`（见 P0-07）。

其余如寺島髪掴み、断刀事故、夜武市死亡等已经有独立 Storyline 或自身完整事件，是否全部再挂到 making-of，应由你决定页面希望：

- **代表节点模式**：保持现在的稀疏图，只补正文直接提到且明显缺失的 controlled-adlib；
- **全景索引模式**：把 ARC-10 枚举的所有主直播 Pick Event 都作为 development 节点挂进 making-of。

为了避免 Storyline 页面过长，本审计推荐 **代表节点模式**，不自动把所有 Event 重复挂载。

---

# 3. 已复核“看起来有偏移，但不要改”的节点

这部分用于防止 Agent 做机械 timestamp diff 时把正确数据改坏。

## KEEP-01｜02:53:53 寺島「人気者」俳句

评论时间轴可能把整个寺島思考/点题段标在约 02:53:28，但当前 Event 描述的是实际成句「これだけの／人が集まる／人気者」，主稿和事件范围使用 02:53:53 合理。

**保持。**

## KEEP-02｜03:28:28 清典 Opening

当前：`yt-032828-seiten-opening` `startMs = 03:28:28`。

冻结主稿也明确把 **03:28:28** 定义为“清典投稿入口”。粉丝时间轴的 03:28:52 更像读稿/发言内部节点，不应覆盖 canonical 入口。

**保持。**

## KEEP-03｜03:45:07 小松再次去 Space

早期第一版长梳理曾写约 03:45:35；但后续冻结主稿已经把「あとXを締めてくるんで」定位到 **≈03:45:07**，当前 Event qualification 也明确说明使用 canonical 03:45:07。

**保持当前 03:45:07，不回退到早期 03:45:35。**

## KEEP-04｜03:53:50 vs 03:54:21 Bingo

不是 offset：

- 03:53:50 = 为什么现在做 Bingo／把生日返礼一次结清；
- 03:54:21 = 「ビンゴ大会やります！」正式启动。

两条都应存在。

## KEEP-05｜`yt-040405-amazon-hama` 文件名与 startMs 不一致

当前文件名保留历史 ID，但内部 `startMs` 已在约 **04:05:05**。SRT 04:05:06.980 报 23 番，符合该轮中奖段。

**不要按文件名把 `startMs` 改回 04:04:05，也不要为了“看起来一致”重命名 ID。**

---

# 4. People 字段：本项目收口时采用的语义规则

目前错误的一部分根源，是 `people` 的语义在迁移时不够严格。

本轮建议固定为：

> **`people` = 在该 Event 中实际发言、行动、被现场明确拉入交互链，或对事件结果负有直接功能的人。**

不要因为某人只是：

- 被夸的对象；
- 被谈论的第三人；
- 节目主持人但该瞬间没有事件动作；
- 仅存在于账号名/资料背景中；

就自动进入 `people`。

### 例外

如果人物虽然未开口，但其物品/决定是该 Event 的直接因果输入，可以保留。例如 34J 中寺島是券的提供者、小松是原始受赠/放弃方，仍属于事件机制。

### 账号身份不等于 speaker

Space②室元気账号的未知 speaker 继续遵守现有安全规则：

```text
personRelations: account-context
```

而不是直接写进 `people` 当成说话人。

---

# 5. 时间轴收口规则

## 5.1 真值优先级

对于网站点击时间：

1. 用户/人工视频微窗确认；
2. 已冻结 canonical 主稿的无 `≈` 精确节点；
3. 高精度稿 + 旧 SRT 对齐；
4. 多来源评论时间轴交叉；
5. 单一旧 SRT cue；
6. 文件名/旧 ID —— **永远不能作为真值。**

## 5.2 Event start 必须匹配摘要语义范围

不要只问“这句话几点说”，还要问：

> 当前标题/摘要是在描述 setup、payoff，还是 setup→payoff 的整个事件？

例如熊谷 Event 不能从毒舌下句才开始，因为摘要同时叙述了熊谷原始 5-7-5。

## 5.3 不建立全局 Whisper 固定 offset

狩野这一小窗出现约 5.7 秒 cue 延迟，可以用来辅助同一局部的熊谷定位；**不可据此把整场 SRT 全部统一减 5.7 秒**。不同段的 VAD/断句偏差并不恒定。

## 5.4 `timingStatus` 与 `publicationStatus` 不混用

`publicationStatus: verified` 不代表 `timingStatus: exact`。

本轮 metadata patch 不应因为正文已验证，就自动把 approximate 时间升级 exact。

---

# 6. Thread / narrativeMode 收口规则

新增 Thread node 后，必须同步检查 Event：

```text
narrativeMode != timeline-only
```

本轮至少需要同步：

- `yt-025449-kano-haiku` → threaded
- `yt-013800-thirty-four-yen` → threaded
- `yt-013840-great-payback` → threaded
- `yt-024207-controlled-adlib` → threaded

已有其他 Thread 归属的 Event（如 `yt-030823-sunglasses-haiku`、`yt-020644-eight-trip`）无需因为新增第二个 Thread 再改模式。

---

# 7. 建议新增到 validator 的收口断言

当前 validator 能挡住已知的定点错误，但 `people`/Thread/时间范围的内容语义仍可能通过结构校验。建议把本轮确定项做成 regression assertions。

伪代码要求：

```text
assert yt-025449.startMs == 10484000
assert yt-025449.narrativeMode == "threaded"

assert yt-025755.people == {kumagai, kano, terashima}
assert yt-025755.startMs in [10641000, 10643000]

assert popular-space-haiku contains yt-025449
assert popular-space-haiku contains yt-030823

assert yt-013800.people contains hama
assert yt-013800.narrativeMode == "threaded"
assert terashima-big-dream contains yt-013800
assert hama-paid-drinking contains yt-013800

assert yt-013840.people contains hama
assert hama-paid-drinking contains yt-013840

assert uchida-line-call contains yt-020644

assert ore-shiri-making-of contains yt-024207
assert yt-024207.narrativeMode == "threaded"

assert yt-040820.startMs == 14904000
```

另加一个通用结构断言：

```text
for each thread.nodes.event:
    referenced event must exist
    referenced event.narrativeMode must not be "timeline-only"
```

**不要**新增“event ID 中的 HHMMSS 必须等于 startMs”这种断言；这会直接破坏项目已经采用的 stable deep-link 设计。

---

# 8. 预期统计变化（用于 patch 后 smoke test）

只计算本轮 P0 people 修正，至少应看到：

- 熊谷俊輝：事件数不因 P0-02 改变；
- 狩野翔：**+1**（熊谷俳句补刀参与）；
- 寺島惇太：**+1**（熊谷俳句补刀参与）；
- 小松昌平：**-1**（熊谷俳句从 related people 移除）；
- 濱健人：至少 **+2**（34J、频道大還元祭补标）；

Thread 关联数/“相关剧情线”显示也应相应增加：

- `yt-025449-kano-haiku`：0 → 至少 1 条（俳句线）；
- `yt-030823-sunglasses-haiku`：1 → 2 条（太阳镜线 + 俳句线）；
- `yt-013800-thirty-four-yen`：0 → 2 条（寺島 Big Dream + 濱长线）；
- `yt-013840-great-payback`：0 → 1 条（濱长线）；
- `yt-020644-eight-trip`：原有濱线基础上再 +1（内田跨平台线）；
- `yt-024207-controlled-adlib`：0 → 1（俺知 making-of）。

如果页面统计没有这些变化，优先排查：

1. Thread 反向索引是否在 build 时缓存；
2. `narrativeMode` 是否仍是 timeline-only；
3. person stats 是否读取 `people` 还是另一个 manifest；
4. reader-copy manifest 是否需要重新生成。

---

# 9. Agent 执行顺序

建议严格按下面顺序，避免一边修节点一边被旧生成物覆盖：

1. **只修改 Event metadata**：P0-01 / 02 / 04 / 05 / 07 / 08。
2. **修改 Thread nodes**：haiku、terashima-big-dream、hama-paid-drinking、uchida-line-call、ore-shiri-making-of。
3. 可选执行 P1：Muro birthday、Bingo formal-start node。
4. 跑 publication/schema validator。
5. 重新生成 reader-copy / semantic manifest / 搜索索引（如果项目脚本有这些步骤）。
6. 做统计 smoke test（见 §8）。
7. 页面人工只抽查 8 个定点，不再全场重听：
   - 02:54:44
   - 02:57:22
   - 02:57:55（确认现在只是 payoff，不再是卡片入口）
   - 03:08:23（确认同时显示两条 storyline）
   - 01:38:00 / 01:38:40（濱人物与 storyline）
   - 02:42:07（making-of storyline）
   - 04:08:24（虎徹入口）
8. **不要执行任何 reader-copy rewrite / AI copy regeneration。** 如果生成脚本会覆盖人工正文，先禁用该步骤或仅重建纯索引产物。

---

# 10. 本轮明确禁止的修改

- 不改 `title`。
- 不改 `summary`。
- 不改 Thread 正文/deck，除非未来用户单独要求。
- 不把 RAW ASR 用校正版覆盖。
- 不因为 filename/ID 与时间不一致而 rename Event。
- 不把粉丝评论时间轴当作逐字真值。
- 不建立整场固定 SRT offset。
- 不把 Space 账号名等同于实际 speaker。
- 不把已有后期语义裁决退回更早的第一版梳理结果。

---

# 11. 本轮优先级摘要

### 必做

1. Kano haiku `02:54:44` + thread。
2. Kumagai haiku `people = 熊谷/狩野/寺島` + start ≈ `02:57:22`。
3. Haiku thread 补 Kano + Yano。
4. 34J 补 Hama + 两条 Thread。
5. Great Payback 补 Hama + Hama Thread。
6. Uchida Thread 补 `yt-020644-eight-trip`。
7. Making-of 补 `yt-024207-controlled-adlib`。
8. Kotetsu start → `04:08:24`。

### 可选收口

9. Birthday-payback 新建 Muro 7/31 薄 Event。
10. Bingo Thread 补 03:54:21 正式启动节点。

### 明确保持

- 02:53:53 寺島俳句。
- 03:28:28 清典 Opening。
- 03:45:07 去 Space。
- 03:53:50 Bingo 返礼前置与 03:54:21 正式启动并存。
- stale Event ID / filename 不做 rename。

---

## 12. 审计依据

本轮以以下材料交叉：

- `komatsu36_main(20260808-084256).md`：冻结主时间轴 / 事件级事实。
- `komatsu36_arcs(10).md`：跨时段闭环与 Storyline canonical。
- `komatsu36_external_asr_raw(7).md`：外部模型原始音形，不反向覆盖。
- `komatsu36_review_todo(10).md`：已解决/仍待二审边界。
- 主直播 SRT：局部 cue / 时间定位。
- YouTube Live Chat：人物归属、即时反应和 Bingo 等多人场景的辅助证据。
- 评论区时间轴：第三层导航证据。
- 当前 GitHub 分支 `codex/komatsu36-project-archive` 的 Event / Thread / schema / validator。

本轮的目标不是再次“解释这五小时发生了什么”，而是让 **现有人工正文、时间索引、人物统计和非线性 Storyline 图重新对齐**。
