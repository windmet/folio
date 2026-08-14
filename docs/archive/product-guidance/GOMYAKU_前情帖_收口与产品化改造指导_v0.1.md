# GOMYAKU / 語脈 × 前情帖
## Komatsu36 收口、第二案例验证与产品化改造指导 v0.1

**日期：2026-08-10**  
**适用仓库：** `windmet/folio`  
**当前审阅分支：** `codex/komatsu36-project-archive`

---

## 0. 结论先行

当前最重要的不是改名、迁仓库，也不是继续给 Komatsu36 加功能，而是完成三步：

1. **把 Komatsu36 真正收口并公开成为第一个可信 Demo。**
2. **用已经准备好的单人广播做第二 Project，专门验证“现有模型到底哪些是通用的、哪些只是 Komatsu36 特例”。**
3. **只有第二 Project 跑通以后，才从 `folio` 中抽出 GOMYAKU / 語脈。**

因此，接下来应当严格执行：

```text
Komatsu36 收口
→ 真机 / 真媒体
→ Preview / Release Gate
→ 公开 Demo
→ 单人广播第二 Project
→ Genericity Audit
→ Archive Core 抽离
→ Authoring Spec v0
→ 新建 GOMYAKU 仓库
→ 前情帖反向依赖 GOMYAKU
```

在第二 Project 完成之前：

- **不迁仓库；**
- **不把 `folio` 直接改名为 `gomyaku`；**
- **不迁移 stale internal ID；**
- **不重构成 monorepo；**
- **不开发完整 GUI Authoring Workbench；**
- **不重新调查 X 私有播放接口；**
- **不为“未来可能用到”提前设计企业 / 学术场景。**

Komatsu36 是“产品发现阶段的真实压力测试”，单人广播将是“通用性反例测试”。这两个案例共同跑通后，GOMYAKU 才有资格成为产品，而不是一套为 Komatsu36 量身定做的代码。

---

# 1. 当前仓库真实状态

当前 `folio` 已经不再是最初的 Magazine 博客骨架，而是同时包含：

- 普通 MDX 内容与站点 Timeline；
- Project Archive Reader；
- Komatsu36 专题内容；
- Project / Track / Act / Event / Thread / Person / Source schema；
- Source-scoped Timeline；
- YouTube Player / external X Space handoff；
- 搜索、深链、History restore；
- 结构验证、publication validation、payload audit、CI；
- 大量 Komatsu36 专属的语义回归与 QA 文档。

当前权威开发状态可概括为：

```text
Semantic P0/P1                   DONE
RC12 A2/C2/D2/B2/F2              DONE / FROZEN
RC12 E                            ENGINEERING + BROWSER VERIFIED
RC12 T1.1                        ENGINEERING + BROWSER VERIFIED
RC12 Y1                          ENGINEERING + BROWSER VERIFIED
RC12 M1                          ENGINEERING + BROWSER VERIFIED
RC12 MT1                         ENGINEERING + BROWSER VERIFIED
Final Cleanup P0/P1              ENGINEERING + BROWSER VERIFIED
Product Review                   PENDING
Real Android / iOS               NOT EXECUTED
Real media long-session test     NOT EXECUTED
Production deploy                NOT EXECUTED
Release Gate                     CLOSED
Semantic P2 stale IDs            DEFERRED
Y2 managed external session      NOT AUTHORIZED
```

当前项目数据已经达到可以承担公开 Demo 的规模：3 条媒体 Track、8 Act、16 Thread、126 Event、18 Person；现阶段剩余主要问题不是继续补结构，而是**产品签收与真实发布验证**。

---

# 2. 先解决一个管理问题：以后不要再混用 P0 / P1 / P2

目前仓库文档里已经出现至少两套 P0/P1：

1. **Semantic P0/P1/P2**：针对事实、人物元数据、Reader 文案和 stale ID；
2. **RC12 Final Cleanup P0/P1**：针对 overlay、Player context、中文 label、Media Sources disclosure。

如果接下来产品化阶段继续直接写“P0”，很容易产生歧义。

建议从现在开始统一使用命名空间：

```text
SEM-P0 / SEM-P1 / SEM-P2     语义纠偏
RC12-P0 / RC12-P1            Komatsu36 最终 UI cleanup
REL-P0                        发布收口
GEN-P1                        第二案例 / 通用性验证
PROD-P2                       GOMYAKU 产品化抽离
FUT-P3                        Workbench 与高级能力
```

旧文档保持原样，不回写历史；新任务全部使用上述前缀。

---

# 3. 现有 SEM-P0 / SEM-P1 / SEM-P2 完整清单

## 3.1 SEM-P0｜事实正确性 —— 已完成，不再重开

### SEM-P0-1 Amazon 5000 円 Bingo 中奖者纠偏

旧判断把濱健人写成中奖者；最终语义采用：

- 寺島惇太；
- 堀金蒼平；
- 濱健人是随后伸手抢寺島礼券的人，不是中奖者。

### SEM-P0-2 `hama-paid-drinking` 因果链重写

正确闭环应为：

```text
没带生日礼物
→ 一路吃喝 / 高价酒
→ 只关心自己出演内容
→ 看到 Amazon 礼券精神
→ 自己没中
→ 抢寺島的卡
→ 与矢野一起拿 1000 円参加赏
→ “ギャラ＋1000円”
```

### SEM-P0-3 `bingo-payback` 对应节点纠偏

Bingo Thread 不再消费错误的“濱中奖”语义。

### SEM-P0-4 汐谷文康 reading

reader-visible reading 已从错误的 `しおや ふみやす` 修正为 `しおや ふみよし`。

**状态：全部完成。**

---

## 3.2 SEM-P1｜人物元数据 —— 已完成

1. aliases / callNames / searchAliases 分层清洗；
2. 增加真正有意义的称呼，如 `トシピ`；
3. UI “本场别名”调整为更准确的“本场常用称呼”；
4. Space 账号身份等显示关系纠偏；
5. 查询层自动兼容敬称，不再把 `さん / 君` 当作人工 aliases 塞入人物数据。

**状态：完成并进入 validator / reader-copy gate。**

---

## 3.3 SEM-P1｜故事补齐 —— 已完成

1. 清典尾段“公开 offer”独立 Event；
2. 11/15 mini event 与正式第 4 弾公告扩写；
3. “台本形式”从过强解释降级为证据可支持的表述。

**状态：完成。**

---

## 3.4 SEM-P1｜Reader Language Pass —— 已完成

1. 11 条明显“编辑台口吻”的 Thread 正文故事化；
2. UI 去除或改写 raw taxonomy / engineering wording；
3. Event reader 文案移除 `patch`、`早先误听`、`canonical`、`source-local` 等生产流程泄漏；
4. reader-copy decisions 已成为 source ↔ ledger 强门禁。

**状态：完成。**

---

## 3.5 SEM-P2｜内部 ID / slug 技术债 —— 明确延后

当前已知 stale ID：

```text
yt-040405-amazon-hama
shioya-fumiyasu
```

它们的**显示语义已经正确**，问题只在内部 ID 与最终事实不一致。

### 当前决策

**不要现在迁移。**

原因：

- 它们已经被 Event / Thread / Person reference 消费；
- 迁移只改善内部整洁度，不改善当前读者体验；
- 临近 release 做 ID 迁移会无意义增加深链、reference、search、history regression 风险。

### 何时处理

进入 `PROD-P2`、正式定义 GOMYAKU schema versioning / alias / redirect policy 时再处理。

建议届时支持：

```text
canonicalId
legacyIds[]
```

或编译期 redirect / alias map，而不是直接暴力改文件名。

---

# 4. 当前 RC12 各批次完整状态

## 已完成并冻结

### A2｜Docked Player

已完成底部 docked player 与单媒体 mount 回归。  
**处理：FREEZE。**

### C2｜People / Cast

wide / medium / mobile 投影已完成。  
**处理：FREEZE。**

### D2｜Source hierarchy / X Space icon

来源卡三层信息层级与 X Space radiowave 已完成。  
**处理：FREEZE。**

### B2｜Expandable long text

展开机制与多个 consumer 已完成。Timeline current title 仍保留一个自然触发不足的 consumer-check TODO，但不是 release blocker。  
**处理：FREEZE，TODO 留后。**

### F2｜Regression

已完成。  
**处理：FREEZE。**

---

## 工程完成，但仍需人工产品签收

### E｜Source-scoped Timeline

已完成：

- YT / SP1 / SP2 三个独立 native-clock scope；
- `?track=` 与 Event 深链；
- keyboard / focus restore；
- Source Event Index；
- 单 player mount；
- SP1/SP2 不伪造统一时钟。

**仍需人工判断：**

- 三个 scope 是否真像 Timeline 的来源索引；
- 390px 信息密度；
- native clock 是否不会被误读；
- Player 与来源头部的邻接关系是否自然。

### T1.1｜Timeline Navigator inline correction

第一版 shell-wide 已被否决并回滚。当前有效版本：

- Expanded 保持正文列内；
- Docked 随单列 workspace 自然增宽；
- 窄 segment 仅显示 Axx；
- hover / focus tooltip 显示完整 Act title。

**仍需产品签名。**

### Y1｜YouTube external handoff

已实现：

```text
点击外部 YouTube 当前时间
→ 清 pending seek
→ 停 playback sync
→ pause 内嵌播放器
→ 普通安全新标签页外链
```

**产品只需判断真实点击体验。**

Y2 不属于 Y1 验收范围。

### M1｜Mobile Player Bubble

移动端 selected Event 默认变成 56×56 Bubble，展开时浮动，不长期占据正文。

工程与浏览器模拟已验证，但：

- Android Chrome 未执行；
- iOS Safari 未执行；
- 真 YouTube 长时 iframe 生命周期未执行。

### MT1｜Mobile Timeline Density

已完成：

- 46px Act Locator；
- 76px 时间轨；
- 普通 Event 压缩到约 109–129px；
- 390px 一屏可连续扫读多条 Event；
- SP1/SP2 不伪造 Act Locator。

**仍需人工判断阅读节奏。**

---

# 5. RC12 Final Cleanup 完整状态

## RC12-P0-A｜Person → Thread overlay exclusivity

目标 invariant：

```text
Boolean(selectedPersonId) XOR Boolean(selectedThreadId)
```

当前已实现：

- 从 Person panel 打开 Thread 时直接同层替换；
- URL 不同时保留 `person` 与 `thread`；
- Back 恢复 Person；
- focus trap 只属于当前 overlay。

**工程 / Browser：PASS。产品签收：PENDING。**

## RC12-P0-B｜YT Player Act Context removal

YT Timeline 不再在 Player 里重复解释 Act；非 Timeline 只保留轻量 CTA。SP1/SP2 保留真正有意义的“关联上下文”。

**工程 / Browser：PASS。产品签收：PENDING。**

## RC12-P1-C｜中文 taxonomy label token

中文动作 / taxonomy 使用更易读的 sans-serif token；时间、代码、平台短码继续 mono；标题和正文保持既有层级。

**工程 / Browser：PASS。产品签收：PENDING。**

## RC12-P1-D｜Media Sources native disclosure

Hero 下：

```text
常驻摘要
→ 原生 <details>
→ 三张 source card / duration / provenance / browse
```

390px 与 240px 压力视口无横向 overflow。

**工程 / Browser：PASS。产品签收：PENDING。**

---

# 6. REL-P0｜从现在开始唯一真正的 P0：Komatsu36 发布收口

这一阶段禁止开发新功能。

## REL-P0-0｜Scope Freeze

立即冻结：

- Event / Thread / Person schema；
- Timeline 结构；
- Player 模式；
- Media Source 行为；
- Search；
- 当前视觉体系。

只有以下问题允许修改：

1. 明确事实错误；
2. 明显交互 bug；
3. 真机 / 真媒体阻塞；
4. 发布配置错误；
5. 可访问性硬失败；
6. 内容公开权 / 隐私问题。

“不够完美”“以后可能更好”全部进入 backlog。

---

## REL-P0-1｜一次性人工 Product Acceptance

不要再零散逐项来回签名。建议现在做一次 **Final Acceptance Session**，把以下项目合并复核：

```text
E
T1.1
Y1
M1 / MT1
FINAL-CLEANUP
FINAL-CLEANUP-P1
```

### Desktop 必看

- Overview；
- Timeline 默认 YT；
- SP1；
- SP2；
- People → Thread；
- Storylines；
- Media Sources 展开 / 收起；
- Player Expanded / Docked；
- 外部 YouTube handoff。

建议尺寸：

```text
1440×900
1366×768
901×780
```

### Mobile 必看

```text
390×844
```

重点只判断：

- 一屏 Event 密度是否舒服；
- Act Locator 是否帮助定位；
- Bubble 是否挡内容；
- Expanded Player 是否过重；
- Media Sources 是否容易理解；
- Person / Thread overlay 是否自然；
- SP1/SP2 的 native clock 是否直觉。

### 最终签名建议统一为

```text
RC12-FINAL-PRODUCT：ACCEPT
```

如果需要修正，只记录真正阻塞的问题，不再开启新的大型 RC。

---

## REL-P0-2｜真实媒体与真实设备

### Windows / Desktop 真媒体

至少完成：

- 真 YouTube iframe 加载；
- Event seek；
- 连续播放 20–30 分钟；
- Expanded ↔ Docked；
- 外部时间链接；
- Tab 返回后页面状态；
- SP1/SP2 外链；
- History back / forward；
- console。

### Android Chrome

重点：

- Bubble safe-area；
- Bubble → Expanded；
- 页面滚动；
- 横屏；
- iframe 回收；
- 返回键；
- 外部 YouTube app / browser handoff。

### iOS Safari

如果有真实设备则测试；如果没有，不要伪称通过。发布记录写：

```text
iOS REAL DEVICE: NOT EXECUTED
```

可以公开，但必须保留证据等级。

---

## REL-P0-3｜部署 Preview

此时仍不必 rename repo。

Cloudflare：

```text
Framework: Astro Static
Build: npm run build
Output: dist
Node: 22.12.0
Install: npm ci
Production branch: main
```

先获得真实 `*.pages.dev` 地址，完成 production origin QA。

### 注意

当前 `project.status` 在 review branch 已是 `published`；首页只消费 published Project。因此 **merge 到 production branch 本身可能等同正式展示**。不要把 merge 当作普通代码动作。

---

## REL-P0-4｜品牌采用“两阶段”而不是阻塞发布

目前不建议为了品牌做大迁移。

### 阶段 A：Soft Launch

如果“前情帖”仍想再放两天：

- repo 继续 `folio`；
- package 继续旧名；
- production preview 保持 `noindex`；
- 只把 URL 发给少量同好 / 测试者；
- 收集真实阅读反馈。

### 阶段 B：Public Launch

当“前情帖”名称确认后，只做 reader-facing brand pass：

```text
Magazine → 前情帖
首页 masthead
<title>
meta description
OG title / description
favicon / mark
About
```

推荐首页：

```text
前情帖

这句话以前是不是说过？

广播、采访、活动，以及那些没有被写进百科的前因后果。
```

此时再明确决定是否移除 `noindex,nofollow`。

**repo / package rename 仍然延后。**

---

## REL-P0-5｜Release Gate

Release Gate 只能在以下证据同时存在时打开：

- 内容公开权确认；
- latest CI success；
- 本地 `npm run validate` success；
- production URL 可达；
- desktop + 390px production spot check；
- 真媒体基本链路通过；
- 已知未测边界明确记录；
- console / overflow / focus / deep-link 无阻塞错误。

然后记录：

```text
Production URL
Release time
HEAD SHA
QA screenshots
Known limitations
```

至此 Komatsu36 才算真正毕业。

---

# 7. 明确“不做”的项目

## Y2 managed external session

继续：

```text
NOT AUTHORIZED / NOT REQUIRED FOR V1
```

理由：

- 不是 Archive 核心价值；
- 浏览器跨 tab 管理能力脆弱；
- 容易投入大量精力解决边缘播放体验；
- Y1 的安全 handoff 已足够。

除非公开后大量用户明确提出同一痛点，否则不再调查。

## Transcript / Evidence / Chat 浏览器

继续 deferred。

它们未来属于 GOMYAKU Authoring / Evidence layer，不阻塞第一个 Reader Demo。

## Stale IDs

继续 SEM-P2 deferred。

---

# 8. GEN-P1｜第二个单人广播：不是“继续加内容”，而是通用性实验

第二 Project 是下一阶段最重要的工程实验。

它的目标不是证明“Reader 还能放一个节目”，而是证明：

> **把 Komatsu36 全部内容删掉以后，Archive Core 仍然成立。**

---

## 8.1 第二案例应刻意保持简单

推荐约束：

```text
1 source track
50–70 min
1 main speaker（可引用其他人物）
10–20 Event
2–4 Thread
Act 可选，最好只有 3–5 个，甚至测试无 Act 模式
无多平台 source
无复杂 player handoff
无并发 lane
```

不要复制 Komatsu36 的 8 Act / 16 Thread 模板。

---

## 8.2 第二案例开始前只修“绝对阻塞”的 genericity bug

### 必修 1：删除全局 `acts.length === 8`

当前 validator 把 Komatsu36 的 8 Act 当成全局规则。必须改成：

```text
如果 Project 使用 Acts：
  defaultTrack 至少 1 个 Act
  order contiguous
  无 gap / overlap
  覆盖完整 track（如果项目声明 fullCoverage）
否则：
  允许 0 Act
```

不要把“8”换成另一个固定数字。

### 必修 2：拆开 generic validator 与 Komatsu regression

当前 `validate-publication.mjs` 直接硬编码：

```text
projectId = komatsu36
Amazon / 濱 / semantic patch assertions
```

目标：

```text
validate-core.mjs
  └ schema / refs / ranges / privacy / publication invariants

validate-project-komatsu36.mjs
  └ Amazon / Person / Thread / semantic regressions
```

`npm run validate` 同时跑两者，但第二 Project 不接受 Komatsu-specific assertion。

### 必修 3：Project-local participation / taxonomy

当前 Person participation 与 Thread category 中有明显 Komatsu 专有 vocabulary。

第二 Project 不要立即设计终极 schema，而是记录：

- 哪些 enum 完全无法表达新案例；
- 哪些只是 UI label；
- 哪些应该成为 project-local metadata；
- 哪些才值得进入 Core。

原则：

> **第二案例逼出来的需求才进入 v0 Core。**

---

# 9. 第二案例必须建立 `GENERICITY_LOG.md`

建议文件：

```text
docs/genericity/second-project-genericity-log.md
```

每次遇到问题记录：

| 字段 | 内容 |
|---|---|
| Problem | 新 Project 哪里无法表达 |
| Komatsu assumption | 哪个现有规则来自 Komatsu36 |
| Temporary workaround | 是否临时绕过 |
| Generic fix | 真正的通用改法 |
| Core or publication | 属于 GOMYAKU 还是前情帖 |
| Priority | blocker / later |

禁止“看见不顺手就顺便重构”。

---

# 10. 第二案例的成功标准

只有全部满足，才进入 PROD-P2：

1. Komatsu36 仍完整通过现有回归；
2. 第二 Project 通过 generic validator；
3. Reader 不需要复制一套组件；
4. 不要求第二 Project 强行拥有 8 Act；
5. 不要求拥有 Komatsu-specific participation/category；
6. 单 Track 场景不会显示无意义的多来源 UI；
7. Thread 仍能解释“为什么这一段有意思”；
8. Event 可 timeline-only，不必硬造故事线；
9. 深链 / Search / Person / Thread 能正常工作；
10. `GENERICITY_LOG` 能明确指出 Core 边界。

最关键的成功标志：

> **第二 Project 看起来像它自己，而不是“缩小版 Komatsu36”。**

---

# 11. PROD-P2｜这时才开始真正抽 GOMYAKU / 語脈

GOMYAKU 不应该被定义成一个 Astro Theme，也不应该只是 ProjectArchiveShell。

推荐定义：

> **A lightweight authoring and archive workflow for high-context, low-documentation communities.**

中文：

> **把原本只存在于圈内共同记忆里的语脉，以低成本转成可追溯、可阅读的档案。**

---

# 12. GOMYAKU 的三层架构

```text
┌──────────────────────────────┐
│  GOMYAKU Authoring Workspace│
│  候选 / 证据 / 未决 / 审核   │
└──────────────┬───────────────┘
               │ compile
               ▼
┌──────────────────────────────┐
│      GOMYAKU Archive Core   │
│ Event / Thread / Person /   │
│ Source / Track / optional Act│
└──────────────┬───────────────┘
               │ render
               ▼
┌──────────────────────────────┐
│       GOMYAKU Reader        │
│ Find → Understand → Explore │
└──────────────────────────────┘
```

“前情帖”只拥有自己的：

```text
content
editorial decisions
visual identity
homepage
publication-specific regression
```

---

# 13. 现有技术向 GOMYAKU 的映射

| Folio 当前资产 | 未来位置 |
|---|---|
| Project / Event / Thread / Person / Source | Archive Core Schema |
| Track / timestamp | Media / Evidence coordinate |
| Act | optional navigation structure |
| ProjectArchiveShell | Reader prototype |
| Search / deep-link | Reader navigation |
| validate-projects | Core Validator（去特例） |
| Komatsu semantic assertions | 前情帖 regression |
| source-set manifest | Ingest provenance primitive |
| reader-copy ledger | Editorial review primitive |
| raw transcript / ASR scripts | Authoring ingest |
| QA handoff docs | Workflow / trust model 的原型 |

这意味着 GOMYAKU 已经有 Reader / Archive / Validator 的 prototype；真正缺的是 **Authoring 前半段**。

---

# 14. GOMYAKU Authoring v0 应该长什么样

不要一开始做 GUI。

先定义数据流：

```text
RAW EVIDENCE
├ media
├ transcript
├ chat
├ social
└ notes
      ↓
WORKING MEMORY
├ Candidate Event
├ Entity / Alias Ledger
├ Evidence Pointer
├ Context Gap
├ Thread Candidate
├ Unresolved Item
└ Focus / Priority
      ↓
HUMAN REVIEW
      ↓
DISCOVERED
→ SUPPORTED
→ VERIFIED
→ CONTEXTUALIZED
→ PUBLISHED
      ↓
ARCHIVE CORE
      ↓
READER
```

核心原则：

> **Workspace ≠ Public Archive。**

AI 猜测、模糊名字、可能的 callback、未确认旧推，都允许存在于 Workspace；只有人工签收后才进入 Archive。

---

# 15. GOMYAKU CLI v0 的目标

先设计 contract，后实现。

建议最终最小命令：

```bash
gomyaku init
gomyaku ingest
gomyaku compile
gomyaku validate
gomyaku build
```

其中：

### `gomyaku ingest`

输入：

- SRT / ASS / TXT；
- source metadata；
- notes；
- social links。

输出 Working layer，而不是直接生成公开 Event。

### `gomyaku compile`

把人工裁决后的 Working layer 编译为 Archive Core。

### `gomyaku validate`

验证：

- reference；
- time range；
- publication status；
- evidence sufficiency；
- private/public boundary；
- legacy ID；
- search/deeplink stability。

### `gomyaku build`

生成 Reader-consumable output。

---

# 16. 什么时候才允许拆仓库

只有以下 Trigger 全部满足：

```text
[ ] Komatsu36 已公开
[ ] 第二 Project 已完成
[ ] generic validator 支持两个 Project
[ ] validate-publication 中 Komatsu-specific 断言已拆走
[ ] 8 Act 硬编码已删除
[ ] Core schema 不再依赖 Komatsu-specific participation/category
[ ] Reader 能读取至少两个 fixture
[ ] Genericity log 已完成
[ ] Authoring Spec v0 已写出
```

然后创建：

```text
windmet/gomyaku
```

建议结构：

```text
gomyaku/
├ packages/
│  ├ schema/
│  ├ compiler/
│  ├ validator/
│  └ reader/
├ apps/
│  └ workbench/        # 后续
├ examples/
│  ├ simple-radio/
│  └ multi-source-event/
├ docs/
│  ├ archive-model.md
│  ├ authoring-workflow.md
│  ├ evidence-policy.md
│  └ migration.md
└ README.md
```

**不要一开始就为了“看起来像产品”拆很多 package。** 如果实际只有一个 package 有稳定边界，就先保持一个 package。

---

# 17. 前情帖仓库何时改名

当前 `folio` 不急着动。

推荐顺序：

```text
现在：windmet/folio
  ↓ Komatsu36 release
  ↓ 第二 Project
  ↓ GOMYAKU extraction
之后：windmet/qianqingtie
```

最终：

```text
windmet/gomyaku      产品 / OSS
windmet/qianqingtie  publication / content / showcase
```

仓库 slug 使用拼音只是技术地址，不是英文品牌。

---

# 18. FUT-P3｜真正的 Authoring Workbench

只有 CLI / schema / compiler 证明可用以后才进入。

未来 Workbench 可采用四区：

```text
左上  Media / Player
左下  Transcript / Chat / Raw sources
右上  Candidate Event / Entity Ledger
右下  Evidence / Threads / Review queue
```

重点能力：

- 选 transcript span → candidate Event；
- attach evidence；
- unresolved marker；
- Person alias merge；
- detect/reuse existing lore/context node；
- Thread assembly；
- evidence sufficiency review；
- publish preview。

它属于 GOMYAKU，不属于前情帖 Reader。

---

# 19. 接下来推荐的实际执行顺序

## 本轮：只做 Komatsu36 收口

```text
01 Freeze feature scope
02 Final product acceptance
03 Windows real media
04 Android real device
05 iOS（有设备则测，无则明确未测）
06 Cloudflare preview deploy
07 Production-origin QA
08 品牌是否前情帖：最后确认
09 Public metadata / noindex decision
10 Release Gate
11 merge / public release
```

## 下一轮：单人广播

```text
12 建 second project skeleton
13 只修 8 Act 等硬阻塞
14 完成 10–20 Event
15 完成 2–4 Thread
16 做 Genericity Log
17 分离 generic / Komatsu validator
18 双 Project regression
19 发布第二案例
```

## 再下一轮：GOMYAKU v0

```text
20 写 Archive Core v0 contract
21 写 Authoring Spec v0
22 定义 Working Layer
23 定义 Evidence Sufficiency
24 抽 generic validator
25 抽 compiler
26 抽 Reader boundary
27 新建 gomyaku repo
28 把前情帖作为真实 showcase 接回
```

---

# 20. 给本地 Agent 的三个阶段 Prompt

## A. Komatsu36 收口 Prompt

```text
当前目标不是新增功能，而是完成 Komatsu36 RC12 的 release closeout。

首先阅读：
- docs/qa/komatsu36-rc12/PRODUCT-CHECKPOINT.md
- docs/qa/komatsu36-rc12/final-cleanup/PRODUCT-REVIEW-PACKET.md
- docs/komatsu36-archive-development.md
- docs/cloudflare-pages-release-checklist.md

硬约束：
1. 不重开已冻结 A2/C2/D2/B2/F2。
2. 不实施 Y2。
3. 不迁移 semantic P2 stale IDs。
4. 不新增 Reader feature。
5. 只处理产品签收发现的 blocker、真实媒体/设备 blocker 与 release configuration。
6. 每个修改必须说明属于事实错误、interaction blocker、device/media blocker 还是 release blocker。
7. 完成后更新统一 release-closeout 证据，不再制造新的大型 RC 文档树。
```

## B. 第二 Project Genericity Prompt

```text
目标：使用一个 50–70 分钟、单 source 的单人广播，验证当前 Project Archive 是否真正通用。

不要把它做成缩小版 Komatsu36。

要求：
1. 先建立 docs/genericity/second-project-genericity-log.md。
2. 新 Project 使用 1 Track、10–20 Event、2–4 Thread；Act 必须允许少于 8，优先测试 optional Act。
3. 每遇到无法表达之处，先登记 Komatsu-specific assumption，再决定是否修改 Core。
4. 不为了新案例复制 Reader 组件。
5. 将 generic structural validation 与 Komatsu semantic regression 分离。
6. 所有改动必须同时保证 Komatsu36 regression 通过。
7. 最终输出一份 Archive Core 候选边界：哪些字段属于 Core，哪些属于 publication-local metadata。
```

## C. GOMYAKU Extraction Prompt

```text
前提：Komatsu36 与第二 Project 均已发布并通过同一 Reader / generic validator。

目标：从 folio 中提取 GOMYAKU，而不是整体 rename。

请先完成 boundary audit：
- Core Schema
- Compiler
- Validator
- Reader
- Publication-specific content/style/regression

硬约束：
1. 前情帖拥有内容与视觉；GOMYAKU 拥有结构、authoring、validation、portability。
2. 不把 Komatsu-specific taxonomy / semantic regression 带入 Core。
3. Working Layer 与 Public Archive 分离。
4. 先写 Authoring Spec v0，再写 GUI。
5. 保留 legacy ID / migration 兼容策略。
6. 抽离后必须有 simple-radio 与 multi-source-event 两个 fixture。
```

---

# 21. 最终产品判断

当前阶段最危险的不是“做得不够”，而是**已经足够发布，却因为看见未来产品形态而提前大重构**。

因此必须保护当前成果：

> **Komatsu36 不再承担 GOMYAKU 的全部未来需求。**

它只需要证明：

> “这套方法可以把一个近五小时、多平台、高 context 的活动整理成真正可读、可追溯的 archive。”

第二个单人广播则证明另一件事：

> “这套方法不是只有五小时、多平台、16 Thread 才成立；简单的一档普通广播同样可以低成本使用。”

当这两个命题都成立时，产品边界才真正出现：

```text
前情帖 = 我们用这套方法做出来的馆藏
GOMYAKU / 語脈 = 让别人也能重复这套方法的工作流与工具
```

这就是接下来所有工程决策的最高优先级判断标准。
