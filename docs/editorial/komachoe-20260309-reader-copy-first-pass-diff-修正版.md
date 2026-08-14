# こまちょえ生ラジオ 2026.03.09 · Reader Copy First-Pass Diff

- Basis: `komachoe-20260309-reader-copy-review.md`
- Mother: `komachoe_20260309_main_v1.0_source-engineering-freeze(1).md`
- Purpose: **第一轮语义润色对照，不直接回填。**
- `copy-key` / `Original hash` 保持稳定，供用户逐项校对后再生成 reviewed 回填版。
- 本轮不动 TRACK、SYSTEM/UI、机械 label，也不重写现有 readerNote；重点处理 PROJECT / ACT / EVENT 的读者语气。

## 本轮编辑原则

1. **保留母本边界，不补新事实。**
   - “下一次 / spin-off / 劇団こまちょえ / cast rotation”等仍只写现场构想，不升级成官宣。
   - 事故只写到“有事故、无人受伤”；不推机械原因。
   - 北辰一刀流只作为井上的角色研究，不写成历史定论。
2. **把工作母本语言从 Reader Copy 里拿掉。**
   - 减少“主语扩张 / 角色构造 / 关系线落地 / 回收 / 接收端 / 人际底层 / 收敛”等编辑报告式词汇。
   - 多保留节目里真实的人、动作、笑话和原话。
3. **Mention 职责沿用 4/25 后的新规则。**
   - 作品／旧团队：优先回答“这是什么”。
   - 人物：仍回答“这个人在本期为什么出现”，但去掉过度分析句。
4. **Event 继续承担故事。**
   - 标题尽量告诉读者“这一段为什么值得点”。
   - summary 允许比 4/25 稍长，因为本期是制作复盘，很多节点本来就依赖前因后果。

---

### `project:komachoe-20260309#mentions[0].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[0].summary`
- Original hash: `fcd6f904dbf3c49c70dddc2ab171d904db0ae43143aa4823ec49dfe53cea4b41`

**Before**

```text
小松昌平担任总合 producer 并主演的《俺を知ってくれ！》系列舞台。幕末篇以朗读剧与殺陣连接多位历史人物，再演中由演员、演出、动作、ヘアメイク和配信团队共同重做细节。
```

**Proposed**

```text
小松昌平担任总合 producer 并主演的《俺を知ってくれ！》系列舞台。幕末篇围绕节目中口头称作「幕末異聞 岡田以蔵と沖田総司 君がため」的作品展开，把朗读剧与殺陣放在同一场戏里；小松饰演岡田以蔵。
```

### `project:komachoe-20260309#mentions[1].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[1].summary`
- Original hash: `c419dc326d20a6fafde9793b81df6a533a6fc3a575bd1f0a0d945fb31575a033`

**Before**

```text
《俺知》幕末篇中的剧本／舞台作品。小松在本场把它称作「僕が散らばった脚本」：每个角色都拥有作者心里不同的一部分。
```

**Proposed**

```text
《さらに！俺を知ってくれ！～幕末編～》中的剧本／舞台作品。节目开场口头称作「幕末異聞 岡田以蔵と沖田総司 君がため」，以蔵、沖田、武市、龍馬、土方和平助等角色都在其中登场。
```

### `project:komachoe-20260309#mentions[2].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[2].summary`
- Original hash: `276a93d633c4469d1d0000999f2cdf5bbc3c3695689dd2036744f1415da46fdd`

**Before**

```text
小松与伊藤、河村、清典等人早期共同活动的团队语境。本场多条制作关系、旧称呼和 reprise 设计，都从这段人际前史重新接回《俺知》。
```

**Proposed**

```text
小松、伊藤、河村、清典等人早期共同活动的旧团队。成员有各自的期别，但离开、回归和原本就存在的合作关系把普通前后辈顺序搅得很乱；本期很多旧称呼和合作习惯都从这里说起。
```

### `project:komachoe-20260309#mentions[10].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[10].summary`
- Original hash: `417b421193c5c91a967ddbeca258af57c91e2752ef984777ed28d394febb86d2`

**Before**

```text
本场ヘアメイク说明的提供者。她把パンフ与正式演出中的造型判断整理出来，使角色视觉设计不再只停留在图片印象，而能被追溯到制作过程。
```

**Proposed**

```text
本场ヘアメイク说明的提供者。她从パンフ拍摄一路解释到正式演出：アイメイク为什么扩到全员、两个武市怎么拉开差异，以及各角色的发型和眼神是怎么定下来的。
```

### `project:komachoe-20260309#mentions[11].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[11].summary`
- Original hash: `2efb512f554e0876848c33b4796935ed49c4df7a7b961061030e4a8c68f769d6`

**Before**

```text
再演中的土方歳三。他会从角色出发追问“为什么这里要踢”，让既有动作重新接受人物逻辑的检查。
```

**Proposed**

```text
再演中的土方歳三。排练时会直接追问「为什么这里要踢，而不是斩」，让清典和小松重新从角色当下真正想做什么来检查既有动作。
```

### `project:komachoe-20260309#mentions[12].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[12].summary`
- Original hash: `f05ee86d6d455c1e3574cb8d5ccb7cceab283e0a4b4fbcef7cae654623b8bedb`

**Before**

```text
井上在旧オトメイトチャンネル时期认识的演员。小松得知两人的旧关系后，马上把这条现实连接转化成未来平助 spin-off 的 casting 脑洞。
```

**Proposed**

```text
井上在旧《オトメイトチャンネル》时期认识的演员。小松一听两人原来早就有关系，马上开始想：以后真做平助 spin-off，能不能把佐藤也放进来。
```

### `project:komachoe-20260309#mentions[13].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[13].summary`
- Original hash: `633a956c513504d26778f10d22a039bb6647c2aa29e7b76f9981da448c961386`

**Before**

```text
旧ヒローズ时期与小松、伊藤关系密切的成员。他送到再演现场的フラスタ，成为电话中重新打开香川时期人际前史的入口。
```

**Proposed**

```text
旧ヒローズ时期与小松、伊藤关系密切的成员。再演现场那座フラスタ一被提起，两人就一路聊回香川时期河村当副 leader／leader、以及小松和他一起跑グルメリポート的旧日子。
```

### `project:komachoe-20260309#mentions[14].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[14].summary`
- Original hash: `51107b9cd53529af6e83de6a453790be02101ee5357a35c8e5aaf67d9dd660f9`

**Before**

```text
本场广播以「さかな先生」称呼的 choreographer／振付师。她指出《青春アミーゴ》中长期做错的几个 step，并在再演中重新修正。
```

**Proposed**

```text
本场广播里称作「サカナ先生」的 choreographer／振付师。她发现《青春アミーゴ》有几个 step 从以前起就一直跳错，再演时终于重新修正。
```

### `project:komachoe-20260309#mentions[3].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[3].summary`
- Original hash: `63ff14b129762ed528eb60191b7bfabda4032c7395a154c19dfc6d62c1c355a7`

**Before**

```text
第一位电话嘉宾。通过旧ヒローズ期别、人际关系和本人反复说出的「楽しかった」，把这次舞台回归从小松单方面的愿望变成双方共同确认的经验。
```

**Proposed**

```text
第一通电话嘉宾。多年没站上舞台的他被小松拉回《俺知》，广播里又反复说「本当に楽しかった」；两人也顺着这通临时电话一路聊回旧HIROZ时期的人和关系。
```

### `project:komachoe-20260309#mentions[4].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[4].summary`
- Original hash: `feebbcb4cd53126a78cdfb963019d723ae759c2ffe5a9d0571436bb1cf30e9d2`

**Before**

```text
第二位电话嘉宾，也是再演中藤堂平助的 double cast 之一。他重点解释平助如何从功能性的やられ役成长为强者，以及角色研究如何重新进入殺陣。
```

**Proposed**

```text
第二通电话嘉宾，也是再演中藤堂平助的 double cast 之一。他把新增源さん场面的来由、平助为什么不该只做やられ役，以及自己怎么把角色研究带回殺陣都讲得很细。
```

### `project:komachoe-20260309#mentions[5].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[5].summary`
- Original hash: `41d4cdc07cff62bf33c32213cedf216afa3c8d59f8ff3745bcb8168c2ea09ba4`

**Before**

```text
第三位电话嘉宾，也是本场最重要的制作方法讲述者。他把殺陣明确放回芝居，解释安全距离、前説、动作修改和自己作为“踩刹车的人”的职责。
```

**Proposed**

```text
第三通电话嘉宾，也是这期制作话题最密集的一段。他从「殺陣也是芝居」一路讲到安全距离、前説、动作为什么要有角色理由，以及自己为什么必须在演员越投入时越负责踩刹车。
```

### `project:komachoe-20260309#mentions[6].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[6].summary`
- Original hash: `2f9892e293e2fdb1b87144dee6705dd2f558bb10768847e15f9d257d7d9ada49`

**Before**

```text
藤堂平助的另一位 double cast。制作后段，他把小松难以流通的手写新增台词重新誊清；角色研究阶段也与井上共享资料，再各自保留不同处理。
```

**Proposed**

```text
藤堂平助的另一位 double cast。制作后段，小松现场写出的追加台词字太难直接发给全员，最后由汐谷重新誊清；角色研究上，他也和井上共享资料，再各自演出自己的平助。
```

### `project:komachoe-20260309#mentions[7].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[7].summary`
- Original hash: `df288f137a6e262cb9470f571f54f7a8cc5b65c5c813ff3cecbf192d22386145`

**Before**

```text
再演中的坂本龍馬。清典称赞他的龍馬像“真正的人”一样耀眼；他也主动向方言、芝居、殺陣和音响等部门确认，并帮助小松细修土佐弁 accent。
```

**Proposed**

```text
再演中的坂本龍馬。清典夸他的龍馬像“真正的人”一样耀眼；而在后台，濱又会主动找方言、芝居、殺陣和音响各部门确认细节，还帮小松把土佐弁修到 accent 层级。
```

### `project:komachoe-20260309#mentions[8].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[8].summary`
- Original hash: `e4e26adebc9c950fc5226a926d03a32e58952f5e737d68d1e4ec4e224345b068`

**Before**

```text
再演中的武市半平太。他是パンフヘアメイク最早拍摄的演员之一；演出后那句「翔平、芝居上手くなったね」，也成为小松整次再演最开心的评价之一。
```

**Proposed**

```text
再演中的武市半平太。演出后，他对小松说了一句「昌平、芝居上手くなったね」；小松后来把这句话列为整次再演最开心的事情之一。
```

### `project:komachoe-20260309#mentions[9].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `mentions[9].summary`
- Original hash: `10f5c4ce9297777d6b51b95783a0d7505a596fefc4df021340305c1a130eee18`

**Before**

```text
再演中的武市半平太。造型上，他与小松版以蔵形成两种相反的“遮眼”秩序；人际关系上，他又让小松想起伊藤与河村的某种组合。
```

**Proposed**

```text
再演中的另一位武市半平太。ヘアメイク用更整齐、受控制的“遮眼”造型和小松版以蔵拉开差异；伊藤电话段里，小松又说刚认识寺島时就觉得他像「伊藤＋河村」的组合。
```

### `project:komachoe-20260309#overview.cards[0].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `overview.cards[0].summary`
- Original hash: `290d667d165b7e91af6de014b955a1aaa3f31437aac892ff20bd408e02b4fe4f`

**Before**

```text
没有预先写好的口号变化，让作品的主语从小松扩成了所有出演者。
```

**Proposed**

```text
这句口号本身没有预先写好：大家先一个个说「俺を」，最后全员一起喊成了「俺たちを知ってくれ」。
```

### `project:komachoe-20260309#overview.cards[1].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `overview.cards[1].summary`
- Original hash: `81c543dd0dcda40bc30be74baf49de9c347803241fa89d66d78698d3f4f15a02`

**Before**

```text
换装时间、旧作 reprise、平助情绪梯度与武市谋略，被收进同一段源さん场面。
```

**Proposed**

```text
给以蔵留两次换装时间、让清典再演一次源さん、接回旧HIROZ的记忆、补平助从平静到暴怒之间的一层，还让武市前面说过的计策真正发生。
```

### `project:komachoe-20260309#overview.cards[2].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `overview.cards[2].summary`
- Original hash: `d2e272fc2248b13d744fad06ff9cd536c8feaef20609edc10820757e2eee7341`

**Before**

```text
清典用一句反差强烈的话，把动作、安全与芝居的关系说到最短。
```

**Proposed**

```text
清典不是在说自己讨厌动作戏，而是在说：殺陣如果离开了角色、情绪和故事，再帅也不是他想做的芝居。
```

### `project:komachoe-20260309#overview.cards[3].summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `overview.cards[3].summary`
- Original hash: `945d611ab1afbe21dffe07cefad13d5d42e04026e3793dea9d68bc09a399f772`

**Before**

```text
不是某一个角色代表作者，而是每个角色都拿着小松心里的一部分。
```

**Proposed**

```text
小松说自己很难写出完全不存在于自己身上的东西，所以以蔵、沖田、武市、龍馬、土方和平助，每个人都拿了他心里的一点东西。
```

### `project:komachoe-20260309#overview.paragraphs[0]`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `overview.paragraphs[0]`
- Original hash: `4de3396e411dfb4577a34bd0628209c77bd41b2c3197ac0ce8dbbe673bf4edc1`

**Before**

```text
这不是把舞台剧情重新讲一遍。小松和三位临时电话嘉宾真正拆开的是制作过程：旧伙伴怎样重新回到作品，角色为什么在再演里长出新的力量，动作、造型、观众参与和安全控制又怎样互相支撑。
```

**Proposed**

```text
这期不是把舞台剧情再讲一遍。小松临时打给伊藤友紘、井上雄貴和清典，三通电话一路把再演后台拆开：老朋友为什么回来、平助为什么比初演更强、殺陣怎么兼顾芝居和安全，连ヘアメイク和前説为什么都算制作的一部分。
```

### `project:komachoe-20260309#overview.paragraphs[1]`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `overview.paragraphs[1]`
- Original hash: `c4b5104bced82bc83438ba29badd6cbe4264c03c770a34eb5f60bd186f941c4e`

**Before**

```text
想顺着节目听，可以从六个 Section 进入；如果只想先抓住本场最重要的四条线，下面分别对应共同创作、剧作结构、殺陣方法和作者自己的剧本观。
```

**Proposed**

```text
如果想顺着节目听就按六个 Section 往下走；只想先挑重点，可以从下面四个节点开始：圆阵里的「俺たち」、新增源さん、清典的殺陣观，以及小松自己的「僕が散らばった脚本」。
```

### `project:komachoe-20260309#summary`

- Source: `src/content/projects/komachoe-20260309/project.json`
- Field: `summary`
- Original hash: `689924ce5827435fc136dd1e4bc0742838d5dd6baad460e256ac9418839e1f3f`

**Before**

```text
《俺知》幕末篇再演结束八天后，小松昌平用两个半小时把“为什么再演会超过初演”重新拆开：从昼夜圆阵、ヘアメイク和三通临时电话，一路谈到藤堂平助的再评价、清典的殺陣方法、安全控制、剧本观与未来构想。
```

**Proposed**

```text
《俺知》幕末篇再演刚结束不久，小松就趁热开了两个半小时复盘，还临时拉来伊藤友紘、井上雄貴和清典三通电话。从圆阵、ヘアメイク和旧ヒローズ关系，一路聊到平助为什么变强、殺陣怎么兼顾芝居与安全，以及这个系列的未来构想。
```

### `act:komachoe-20260309/act-01#summary`

- Context: ACT 1
- Source: `src/content/projects/komachoe-20260309/acts/act-01.json`
- Field: `summary`
- Original hash: `5d54e5b2c630bf267408f48f032c955b1085450b69a0bec6c9f531e97b0b1739`

**Before**

```text
八天后，小松仍想把《俺知》幕末篇再演讲清楚。昼夜两次圆阵让「俺を知ってくれ」变成「俺たちを知ってくれ」；而再演之所以更强，并不是初演失败或成员优劣，而是所有人带着一年的经验重新回来。
```

**Proposed**

```text
小松说自己还没从《俺知》里燃尽。昼夜两段圆阵先把「俺を知ってくれ」喊成了「俺たちを知ってくれ」，接着他又解释说：再演变得更强，不是初演做错了，也不是换了谁才变好，而是大家带着一年多的新经验重新回来。
```

### `act:komachoe-20260309/act-02#title`

- Context: ACT 2
- Source: `src/content/projects/komachoe-20260309/acts/act-02.json`
- Field: `title`
- Original hash: `d3e641035b3d697a447aaa48126b3caaa5ad403ce50d39d1cfbccf7bd60874a4`

**Before**

```text
ヘアメイク如何参与角色构造
```

**Proposed**

```text
ヘアメイク是怎么参与角色构造的？
```

### `act:komachoe-20260309/act-02#summary`

- Context: ACT 2
- Source: `src/content/projects/komachoe-20260309/acts/act-02.json`
- Field: `summary`
- Original hash: `248f48c810021ac22e0b8e3ff71ee9f4f522993dcde41832abbab69cb58bf1c1`

**Before**

```text
从统一パンフ与本番团队开始，逐一拆解武市、龍馬、以蔵、沖田、平助与土方的造型。眼妆、发色、遮住眼睛的方式和昼夜双卡差异，都不只是装饰，而是在视觉上继续完成角色。
```

**Proposed**

```text
西田聡子的说明从パンフ拍摄一路讲到本番：アイメイク怎么从狩野一个人的提案扩到全员，武市和以蔵为什么都遮眼却完全不是一个气质，龍馬、沖田、平助和土方又分别怎么把角色写进发型和妆面。
```

### `act:komachoe-20260309/act-03#summary`

- Context: ACT 3
- Source: `src/content/projects/komachoe-20260309/acts/act-03.json`
- Field: `summary`
- Original hash: `6d67de03cadffac6e44b3bd565f19c8c4bf64a23a056f9feaaec4e08a9fae2cb`

**Before**

```text
第一通电话几乎零打合せ，却把河村優太、旧ヒローズ期别、清典与寺島惇太的关系一路接回这次舞台。「チームこまちょえ」也在对话里从旧团队称呼，被试着扩展成观众共同体。
```

**Proposed**

```text
第一通电话几乎当天临时约、零打合せ。伊藤从河村優太的フラスタ聊起，接着一路翻出ヒローズ的期别、香川时期的人际关系、清典和寺島的旧既视感，最后又反复告诉小松：这次重新站上舞台，自己真的很开心。
```

### `act:komachoe-20260309/act-04#summary`

- Context: ACT 4
- Source: `src/content/projects/komachoe-20260309/acts/act-04.json`
- Field: `summary`
- Original hash: `89b718186963e03aabe24034d4971c18f9483e2df862dcacf60a3f6e36bac780`

**Before**

```text
新增源さん场面同时解决换装、旧作 reprise、平助情绪梯度与前段谋略回收。井上进一步解释：再演真正改变的，不只是动作熟练度，而是藤堂平助终于能在殺陣里作为一个强者成立。
```

**Proposed**

```text
新增源さん的场景不只是为了给以蔵换装：它让清典重新演回旧角色、补了平助从平静到暴怒之间的一层，也让前面武市说过的计策真正发生。再往后，井上把话题带到平助为什么终于成了强者，以及殺陣为什么不能和芝居分开。
```

### `act:komachoe-20260309/act-05#summary`

- Context: ACT 5
- Source: `src/content/projects/komachoe-20260309/acts/act-05.json`
- Field: `summary`
- Original hash: `11546e4954bbc37fe13c61bcb1daa0b9904c2ac8be18b9865479ff586f0adc86`

**Before**

```text
第三通电话从旧作 reprise 进入整场最核心的方法论：动作必须继续承担芝居，安全距离反而让刀更快。清典还谈到前説、演员为什么开始反问动作理由，以及自己为何必须在情绪越深时负责踩刹车。
```

**Proposed**

```text
清典一上线就把话题拉进制作最深处：为什么他说「俺は殺陣が嫌いだ。お芝居が好きなんだ」，为什么距离拉开以后刀反而能更快，以及演员越进入角色时，动作指导为什么越要负责踩刹车。中间还聊到前説、演员主动改动作、狩野和濱的表演，以及以后还能做什么规模的舞台。
```

### `act:komachoe-20260309/act-06#summary`

- Context: ACT 6
- Source: `src/content/projects/komachoe-20260309/acts/act-06.json`
- Field: `summary`
- Original hash: `33d9aa94efaaac854d5b300ab3adaa0e47703ae224088a3028aaba42dd6aa172`

**Before**

```text
电话结束后，小松把《君がため》形容成「僕が散らばった脚本」，再解释伊藤收到整套周边的来龙去脉。Super Chat 继续打开土佐弁、新选组扩展、spin-off、配信改进与舞蹈修正，最后回到希望更多同业与异业来看作品。
```

**Proposed**

```text
三通电话结束后，小松回到单人，先说《君がため》是「僕が散らばった脚本」，又解释伊藤为什么会收到一整套“小松周边”。后面的 Super Chat 继续把话题带到土佐弁、新选组新角色、平助 spin-off、配信改善和《青春アミーゴ》的错 step。
```

### `event:komachoe-20260309/yt-000458-enjin-oretachi#title`

- Context: yt-main · 298000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-000458-enjin-oretachi.json`
- Field: `title`
- Original hash: `fa589210109828f30d872ad200999c4d20d684ea08331d4d997b4434d935ed08`

**Before**

```text
昼圆阵里，「俺を」临场变成了「俺たちを知ってくれ」
```

**Proposed**

```text
昼圆阵里，每个人先喊「俺を」，临场变成了「俺たちを知ってくれ」
```

### `event:komachoe-20260309/yt-000458-enjin-oretachi#summary`

- Context: yt-main · 298000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-000458-enjin-oretachi.json`
- Field: `summary`
- Original hash: `a7172855c93158474a09014852d631c0e691d5b12edd224c38e87c62ce3ee46b`

**Before**

```text
昼场开演前，小松原本想用作品标题带圆阵，大家却在现场把主语接成了「俺たち」。这个没有预先写好的变化，让作品从 producer 的自我介绍扩成了全体出演者共同递出的邀请。
```

**Proposed**

```text
昼场开演前，小松原本只想拿作品名带圆阵，现场却越喊越改：先让大家一个个说「俺を」，最后全员收成「俺たちを知ってくれ」。这句并不是事先写好的流程；小松回看时也说，做到现在已经不只想让观众认识自己，也想让大家认识这一整组人。
```

### `event:komachoe-20260309/yt-000830-not-burned-out#title`

- Context: yt-main · 510000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-000830-not-burned-out.json`
- Field: `title`
- Original hash: `fcf33a29677726f38feb5fc38c2ab6d3ade12ea3ae07d60c62d431f44109462b`

**Before**

```text
圆阵口号就诞生在这里，但这不是“下一次”的官宣
```

**Proposed**

```text
「小松昌平は燃え尽きてません」：还想继续做，但今晚没有官宣下一次
```

### `event:komachoe-20260309/yt-000830-not-burned-out#summary`

- Context: yt-main · 510000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-000830-not-burned-out.json`
- Field: `summary`
- Original hash: `06d818e3818b533e0f81bb17f18ce671a9c364836b4c6ad04637bba66e687c11`

**Before**

```text
回看圆阵时，小松再次强调自己还没有燃尽，也很想继续做下去；不过当晚没有任何正式发表。可以确认的是创作热度和继续邀请伙伴的意愿，而不是一项已经决定的后续企划。
```

**Proposed**

```text
回看刚才临场发挥的圆阵口号，小松马上聊到以后还想继续做，也直接说「小松昌平は燃え尽きてません」。但他一边往下说，一边反复提醒“什么都没发表”；这晚能确定的是他还想继续写、继续叫人来，不是下一作已经定了。
```

### `event:komachoe-20260309/yt-001507-revival-grew#summary`

- Context: yt-main · 907000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-001507-revival-grew.json`
- Field: `summary`
- Original hash: `1ee139e2ba056347ddd7641bfb3396b04cd5d6ce0738dbb81660415b2135bca7`

**Before**

```text
小松先肯定初演已经完成了当时能做到的成果。再演之所以自然升级，是演员和制作团队经过一年积累了新的经验，大家也更主动地把自己的理解带进作品；这不是对两套成员做高下判断。
```

**Proposed**

```text
小松先把初演说得很清楚：当时已经做出了属于那一版的好东西，櫻井版沖田也有不可替代的成果。再演会继续升级，是因为一年多以后演员和制作团队都多了新的经验，也更敢把自己的理解带进来，不是谁取代了谁。
```

### `event:komachoe-20260309/yt-002014-hairmake-team#summary`

- Context: yt-main · 1214000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-002014-hairmake-team.json`
- Field: `summary`
- Original hash: `b7347b08b5447845b03c0f0010ef9052208fd3d8afebc0dea46eee0e2ddd1ef3`

**Before**

```text
这次尽量让同一支ヘアメイク团队负责パンフ拍摄和正式演出。西田聡子主动提供的说明显示，这不只保证了视觉连续性，也让熟悉小松与作品的制作成员真正进入角色构造。
```

**Proposed**

```text
这次尽量让同一支ヘアメイク团队从パンフ拍摄跟到正式本番，西田聡子还主动把每个人的造型意图整理成说明。往后听就会发现，发型和アイメイク不是拍照时好看就结束，而是从拍摄阶段一路带进角色和舞台。
```

### `event:komachoe-20260309/yt-002533-ryoma-hairmake#title`

- Context: yt-main · 1533000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-002533-ryoma-hairmake.json`
- Field: `title`
- Original hash: `5d1df07235680532bdc50f88ef4b3f436906b37323007c7fb31afc101c670b56`

**Before**

```text
濱版龍馬：行动力、西洋感和最终决定染黑的头发
```

**Proposed**

```text
濱版龍馬：行动力、西洋感，以及最后用黑色 spray 压下来的发色
```

### `event:komachoe-20260309/yt-002533-ryoma-hairmake#summary`

- Context: yt-main · 1533000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-002533-ryoma-hairmake.json`
- Field: `summary`
- Original hash: `16f63591fdd5778aa67d3af7ff0e9c6210b74178a7fe9751cf4e238217a0be89`

**Before**

```text
造型先从龍馬的行动力与西洋感出发，再根据濱健人的实际发色不断调整。最后选择用 spray 压成黑发，不是抹掉演员特征，而是让舞台上的角色关系更清楚。
```

**Proposed**

```text
濱版龍馬先抓的是行动力和西洋感。濱当时本身发色偏亮，小松又不想为了朗读剧强迫声优改发色；濱的回答很干脆：producer 觉得该做就做。于是パンフ和本番最后都用黑色 spray 压下来，让角色更贴这套世界观。
```

### `event:komachoe-20260309/yt-002711-hidden-eyes#title`

- Context: yt-main · 1631000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-002711-hidden-eyes.json`
- Field: `title`
- Original hash: `cac85300c005dacccfe971ed92b463d756a023afcdea46ea6f89260e543139c9`

**Before**

```text
同样遮住眼睛，武市和以蔵却走向相反的秩序
```

**Proposed**

```text
同样遮住眼睛：武市要整齐，以蔵要让人看不透
```

### `event:komachoe-20260309/yt-002711-hidden-eyes#summary`

- Context: yt-main · 1631000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-002711-hidden-eyes.json`
- Field: `summary`
- Original hash: `17d95f0b959d4ecef19a419b9349368d56752e7c7298a16e4f8cbd8c98d134c6`

**Before**

```text
寺島版武市把视线藏在整齐、受控制的造型里；小松版以蔵则用更散乱的前发遮住眼睛。相似的视觉动作被设计成两种相反状态：一个维持秩序，一个显得不可预测。
```

**Proposed**

```text
寺島版武市用整齐、受控制的发型把视线藏起来；小松版以蔵却故意让前发更乱，让观众看不清他此刻到底是什么表情。同样是“遮眼”，一个像始终把一切收在手里，一个则更难预测。
```

### `event:komachoe-20260309/yt-003029-double-cast-visuals#summary`

- Context: yt-main · 1829000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-003029-double-cast-visuals.json`
- Field: `summary`
- Original hash: `60ad39796174046e4fbe615cf75fdd616682a775fd2da334136a352fccae23f4`

**Before**

```text
井上雄貴与汐谷文康的藤堂平助，在保持角色共通点的同时留下各自的视觉处理。谈到矢野奨吾版土方时，小松听完说明忍不住吐槽：其中有些决定根本就是造型师的个人喜好。
```

**Proposed**

```text
平助两位演员不追求复制：井上更偏血气盛的年轻幹部，汐谷则留下另一种更俊美、有动感的处理。轮到矢野版土方，西田解释到某些细节时，小松终于忍不住吐槽：这不就是你的个人喜好吗。
```

### `event:komachoe-20260309/yt-004042-kawamura-flowers#title`

- Context: yt-main · 2442000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-004042-kawamura-flowers.json`
- Field: `title`
- Original hash: `311c00db2c669304dc09832747def4cc82609e8af0c2a79659ff5e86becb1a3d`

**Before**

```text
一座フラスタ，把河村優太和旧香川关系带回现场
```

**Proposed**

```text
河村優太的フラスタ：刚拍完又问“哪一座？”，然后一路聊回香川
```

### `event:komachoe-20260309/yt-004042-kawamura-flowers#summary`

- Context: yt-main · 2442000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-004042-kawamura-flowers.json`
- Field: `summary`
- Original hash: `295c1e6390d38648cec05070c0fd4d3d6325e2ceddb8787ff5fd80129d56469c`

**Before**

```text
伊藤友紘从河村優太送来的花说起，旧ヒローズ时期的副 leader、leader 和香川活动关系随之重新连上。对小松而言，这些不是孤立的怀旧名字，而是后来继续合作和制作作品的人际底层。
```

**Proposed**

```text
伊藤说到河村優太送来的花篮（フラスタ），小松还闹了个小笑话：明明刚看过第一座、照片也拍了，转头又问「優太送的是哪座？」接着两人一路聊回香川时期河村当副 leader／leader、以及小松和他一起跑グルメリポート的旧日子。
```

### `event:komachoe-20260309/yt-004316-heroes-seniority#summary`

- Context: yt-main · 2596000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-004316-heroes-seniority.json`
- Field: `summary`
- Original hash: `bfe01aec6d75d6243ea2c8b84c2e4dc68f6381d1ce64e6cc67794d8df692644c`

**Before**

```text
两人用非常口语的方式理清旧ヒローズ期别：伊藤是 2 期，小松是 4 期；但伊藤早期离开、后来回归，使年龄、加入顺序和实际相处资历互相错开，才形成今天这种难以用普通前后辈概括的关系。
```

**Proposed**

```text
伊藤是 2 期，小松是 4 期，照理说前后辈关系应该很简单；可两人同岁，伊藤早期又离开大约半年，回归后才真正和小松相处。于是期别上明明是先辈，在小松的实际体感里却完全不像普通先辈。
```

### `event:komachoe-20260309/yt-005132-terashima-familiarity#summary`

- Context: yt-main · 3092000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-005132-terashima-familiarity.json`
- Field: `summary`
- Original hash: `8ee55102645efea2bcb73998e6a52f83b145c3db618a47f40ac186de801ffa55`

**Before**

```text
小松把寺島惇太形容成某种“伊藤加河村”的组合：说话方式、气质和旧伙伴的影子叠在一起，让他刚认识寺島时就觉得熟悉。对话还把此前模糊的芸人名收敛为カナメストーン。
```

**Proposed**

```text
小松说刚认识寺島时，就有种说不出的熟悉感；后来才发现，对方身上像同时叠着伊藤和河村的影子。两人边讲边拆这种既视感，还顺手聊到カナメストーン和山口さん的语录。
```

### `event:komachoe-20260309/yt-005400-team-komachoe#title`

- Context: yt-main · 3240000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-005400-team-komachoe.json`
- Field: `title`
- Original hash: `757fc4efa1af14630c75c5eecef7cea172a7a166cbbcaaa94b6c2b776cb6d606`

**Before**

```text
「チームこまちょえ」从旧团队称呼，被试着递给观众
```

**Proposed**

```text
「チームこまちょえ」本来是旧称呼，这次顺手把观众也算进来
```

### `event:komachoe-20260309/yt-005400-team-komachoe#summary`

- Context: yt-main · 3240000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-005400-team-komachoe.json`
- Field: `summary`
- Original hash: `aa3689eba1bc33829171ad2f2d414e329f2328eb208ffb768328ad0c6d447305`

**Before**

```text
小松对直接说“fan”仍有些不自在，伊藤便从他们已有的团队称呼出发，把「チームこまちょえ」试着扩展到观众。这个名字不是一项正式命名仪式，而是聊天中逐渐找到的一种共同归属。
```

**Proposed**

```text
小松对直接说“fan”还是有点别扭，伊藤便顺着他们原本就会用的「チームこまちょえ」往外扩：那观众是不是也可以算进来？这也不是为了现场正式宣布 fan name，更像两个人边聊边找到一个大家都能接住的叫法。
```

### `event:komachoe-20260309/yt-005748-ito-had-fun#summary`

- Context: yt-main · 3468000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-005748-ito-had-fun.json`
- Field: `summary`
- Original hash: `a6bb5340a641b30953bf73ee15ec602f9b87c776f84da7735259ce4dd25f682b`

**Before**

```text
小松真正担心的不是伊藤是否完成演出，而是自己把多年没站舞台的朋友拉回来，会不会只是满足了自己的愿望。伊藤用反复的「本当に楽しかった」回应，也向チームこまちょえ道谢，让这条关系线在本人声音里落地。
```

**Proposed**

```text
小松真正担心的是，自己把多年没站舞台的旧友硬拉回来，会不会只是满足了自己的愿望。伊藤却一次又一次说「本当に楽しかった」，多到两个人都拿“是不是已经说了 100 遍”开玩笑，最后还认真向チームこまちょえ道谢。
```

### `event:komachoe-20260309/yt-010415-gensan-added#summary`

- Context: yt-main · 3855000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-010415-gensan-added.json`
- Field: `summary`
- Original hash: `1b3c41abc2410b66c8925a8665f5796c1637b7702d645dd554215055aecb04c5`

**Before**

```text
这段戏先为以蔵的两次换装争取时间，再让清典 reprise 旧角色井上源三郎；同时补足平助从平静到暴怒的情绪阶梯，并回收武市前段的谋略。小松还强调，它不能只是给旧伙伴看的自我满足，必须对当前作品真正有用。
```

**Proposed**

```text
新增源さん戏份不是只解决一个问题：先替以蔵两次换装争取时间，让清典重新演回旧角色，也把ヒローズ过去接进现在；剧情上又给平助补出从平静到暴怒之间的一层，并让武市前面说过的“把血气方刚的组长引出来”真的发生。
```

### `event:komachoe-20260309/yt-011148-handwritten-lines#summary`

- Context: yt-main · 4308000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-011148-handwritten-lines.json`
- Field: `summary`
- Original hash: `3e0cd89e37ab5fc5104f839360582633c6f708217c769fcebccd2911d778a78f`

**Before**

```text
新增台词是在制作后段现场写出来的，小松的手写字又难以直接流通。最后由汐谷文康把内容重新誊清，发给全员用于 rehearsal；这也解释了为什么成品舞台和销售台本之间会出现明确差异。
```

**Proposed**

```text
这场新增戏是在制作后段才写出来的，小松又是直接手写，字实在难拿去给全员用。最后由汐谷文康重新誊清，再发给大家 rehearsal；所以观众手里的销售台本里没有这段，成品舞台却已经演进去了。
```

### `event:komachoe-20260309/yt-011256-heisuke-role#summary`

- Context: yt-main · 4376000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-011256-heisuke-role.json`
- Field: `summary`
- Original hash: `d51b01352bf50dff26858f5da4ab62a26ebeb7f07f84306fd9fc6017a4de47aa`

**Before**

```text
初始剧作需要一个足够明确的对手，来显示沖田有多强，平助因此承担了やられ役功能。可小松越写越觉得这样太浪费；再演里，井上把已经会做的动作重新放回角色，让平助终于作为强者成立。
```

**Proposed**

```text
平助最初被写出来，很大一部分功能就是“让沖田显得强”：需要有人和他打，也需要有人输给他。但小松后来越来越觉得这样太浪费；再演里，井上把已经会的动作重新放回角色，终于让平助自己也像一个真正的组长和强者。
```

### `event:komachoe-20260309/yt-011603-arm-for-one-strike#title`

- Context: yt-main · 4563000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-011603-arm-for-one-strike.json`
- Field: `title`
- Original hash: `55de83cd96707bed173dbf5ca09a2d240251ba853c1cba483580086b2aff81e0`

**Before**

```text
“舍掉手臂换一击”的意义，因为平助变强而改变
```

**Proposed**

```text
平助一路压到最后，以蔵“舍掉手臂换一击”才不再只是疯狂
```

### `event:komachoe-20260309/yt-011603-arm-for-one-strike#summary`

- Context: yt-main · 4563000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-011603-arm-for-one-strike.json`
- Field: `summary`
- Original hash: `b6677de7fe424fd12b3093ddbffcacf8232d4fd5486fdc9ae39e1296f41047f5`

**Before**

```text
同一个动作在初演更容易被理解为以蔵的异常；当再演的平助强到持续压迫以后，它变成以蔵必须付出手臂才能换到腹部一击。对视、殺気与「緊張の糸」也让殺陣不再像暂停演戏后插入的一段动作。
```

**Proposed**

```text
初演看这个动作，很容易先觉得“以蔵居然疯到拿手臂去换一刀”。可再演里平助一路把他逼到那里以后，意思变成了：对手已经强到这种程度，以蔵不付出一只手就换不到腹部那一击。连对视和「緊張の糸」也都被算进殺陣里。
```

### `event:komachoe-20260309/yt-011854-double-cast-research#title`

- Context: yt-main · 4734000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-011854-double-cast-research.json`
- Field: `title`
- Original hash: `c54617ab3f4c887ece2be08ae09836051b2b0e206ca4bfc8682783fafba8511b`

**Before**

```text
double cast 不再彼此回避，而是共享研究后保留不同答案
```

**Proposed**

```text
井上和汐谷并没有避着彼此：资料一起看，最后演出“各自的平助”
```

### `event:komachoe-20260309/yt-011854-double-cast-research#summary`

- Context: yt-main · 4734000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-011854-double-cast-research.json`
- Field: `summary`
- Original hash: `2c1a08237150cda33604c5448464fb669ca296f48b2f586f8aa9b750a8f79f66`

**Before**

```text
井上与汐谷谈过有些双卡会刻意不看对方，但这次选择共享资料与想法，再各自完成平助。井上研究到北辰一刀流，并把个人理解带进最后一击；这里记录的是演员的表演研究，不把它扩大成历史定论。
```

**Proposed**

```text
井上和汐谷也聊过，有些 double cast 会刻意不看对方；但这次他们选择把查到的资料和想法互相分享，再各自做自己的平助。井上还研究到北辰一刀流，并把自己的理解带进最后一击。
```

### `event:komachoe-20260309/yt-012231-sato-old-connection#summary`

- Context: yt-main · 4951000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-012231-sato-old-connection.json`
- Field: `summary`
- Original hash: `4dbbc8f81d620c2b616f948e53084fb10dd2f924eefcab9da0e2726c7e2eaec9`

**Before**

```text
井上提到多年前和佐藤祐吾在オトメイトチャンネル的关系，也谈到久别重逢。小松一听两人本来就认识，producer 的思路马上转向：如果以后做平助 spin-off，这条旧关系能不能重新变成舞台上的组合。
```

**Proposed**

```text
井上提到多年前和佐藤祐吾在《オトメイトチャンネル》就认识，这些年又很久没见。小松一听两个人本来就有现实关系，producer 脑立刻启动：以后真做平助 spin-off，这条旧关系能不能直接拿来做 casting。
```

### `event:komachoe-20260309/yt-013341-tate-is-drama#summary`

- Context: yt-main · 5621000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-013341-tate-is-drama.json`
- Field: `summary`
- Original hash: `ce2bb30e5d687159cd597c4953a85ef3e9cf66fc8e17de6352d6b6b6f48cbb0d`

**Before**

```text
清典用一句故意带反差的说法概括自己的立场：他并不把帅气动作当成目的，真正喜欢的是芝居。殺陣只有继续承担人物关系、情绪和故事时，才是他想做的东西。
```

**Proposed**

```text
清典这句听起来像在骂自己本行，其实正好反过来：他讨厌的是把帅气动作单独拿出来当目的。对他来说，殺陣必须继续在演人物、演关系、演情绪，不然再漂亮也不是自己想做的芝居。
```

### `event:komachoe-20260309/yt-013446-safety-distance#summary`

- Context: yt-main · 5686000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-013446-safety-distance.json`
- Field: `summary`
- Original hash: `29c9770bcc9513257a724eff55842f682bef2d3a658ab44932ca938ece9108a0`

**Before**

```text
在足够宽的舞台上，演员可以把距离拉开，朝没有人的位置完整挥刀。这样不用在最后一刻为避开对手而减速，刀反而能更快、更有迫力；安全设计因此成为表演效果成立的基础。
```

**Proposed**

```text
清典解释，舞台够宽时反而应该把演员之间的距离拉开，让刀朝没有人的位置完整挥出去。这样不用到最后一刻为了躲人减速，动作反而能更快、更有迫力——安全不是把表演变保守，而是让演员敢真正放开做。
```

### `event:komachoe-20260309/yt-013611-no-injury-boundary#summary`

- Context: yt-main · 5771000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-013611-no-injury-boundary.json`
- Field: `summary`
- Original hash: `4825d08b6115326a358b1546bc4eeae3fde3843517a91964fd3d2638e3a53ff1`

**Before**

```text
清典确认演出中发生过事故，但没有人受伤；他也用自己受伤或伤到别人后的恐惧，解释为什么必须让所有人结束后仍能说“还想再做”。节目没有说明事故的机械原因，杀阵强度和情绪爆发不能被接成因果。
```

**Proposed**

```text
清典在节目里只先确认了两件事：演出中有事故，但没有人受伤。接着他谈自己过去受伤、或让别人受伤后的恐惧，解释为什么安全设计最终想守住的是——大家做完以后，还能说「またやりたい」。
```

### `event:komachoe-20260309/yt-013718-audience-onboarding#summary`

- Context: yt-main · 5838000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-013718-audience-onboarding.json`
- Field: `summary`
- Original hash: `18ad97ba58157791b87178760f15603e5d6a12dfaf05dc91c46ebce2a1eac3e5`

**Before**

```text
清典在前説中先示范这场演出可以如何回应、何时拍手，再把观众的声音带回后台圆阵。夜场于是形成从舞台到后台、再回到舞台的 call-and-response，第一位角色登场时观众已经敢于参与。
```

**Proposed**

```text
清典的前説先告诉大家：这里可以笑、可以回应，该拍手的时候也可以拍。观众的声音又被带进夜场后台圆阵，等第一位角色真正登场时，大家已经知道自己可以怎么参与这场戏。
```

### `event:komachoe-20260309/yt-014243-center-player#summary`

- Context: yt-main · 6163000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-014243-center-player.json`
- Field: `summary`
- Original hash: `4bd3476cfb3df5c4f7e536f0d681cd841264f472ef3315ce3f294d10034bcb6c`

**Before**

```text
清典把自己定义成支撑主角的バイプレイヤー，却说小松从旧剧团时期就有站在中心的能力和“花”。这段评价把 producer、主演和旧伙伴三种身份连到一起，也解释了他为何愿意继续参与小松的作品。
```

**Proposed**

```text
清典说自己更像给主角递球的バイプレイヤー，却觉得小松从旧剧团时期就有站在正中间的“花”：做活动、拿麦、当 captain 时，观众会自然去看他。小松明显不太会接这种正面夸奖，后面的「褒められのキャパ」也从这里一路累积。
```

### `event:komachoe-20260309/yt-014546-theater-system#summary`

- Context: yt-main · 6346000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-014546-theater-system.json`
- Field: `summary`
- Original hash: `67bb5418caba12bc8cc092ed4c552cea9895b96d3bdc04d9dcc66f3b924742fe`

**Before**

```text
两人设想大型本公演之外，也可以做人数更少的 spin-off。所谓「こまちょえシステム」则指向一种写法：朗读剧里的台本不只是演员手上的道具，它在故事世界里也必须有出现和被阅读的理由。
```

**Proposed**

```text
两人先拿「劇団こまちょえ」开玩笑：完整大本公演可以做，小人数 spin-off 也可以穿插着做。顺着聊到「こまちょえシステム」，小松又解释自己的写法——朗读剧里的“台本”不只是演员手里的纸，在故事里也得有一个角色为什么会拿到、为什么会读它的理由。
```

### `event:komachoe-20260309/yt-014839-action-from-character#summary`

- Context: yt-main · 6519000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-014839-action-from-character.json`
- Field: `summary`
- Original hash: `113bc0af570ea659f1dd42870beaa050e5d2668ab28d007c86c03a4cdcabbb0c`

**Before**

```text
再演排练里，矢野奨吾会追问土方为什么选择踢而不是斩，龍馬的构え也被反复检查。演员不再只执行既定动作，而是从人物当下真正想做什么出发，反过来修改殺陣。
```

**Proposed**

```text
再演排练里，矢野奨吾会直接问：土方为什么这里要踢，不是更想斩吗？龍馬反复構え的动作也被拿出来重新讨论。演员开始从“这个人现在到底想做什么”反问动作，既有的殺陣也就跟着改。
```

### `event:komachoe-20260309/yt-015127-brake-not-cause#summary`

- Context: yt-main · 6687000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-015127-brake-not-cause.json`
- Field: `summary`
- Original hash: `52ff85518404fb6fb697f782067d1efc3916b566f8c09ffda8d7138b355b3a6a`

**Before**

```text
角色进入得越深，演员越可能本能地想让动作真的碰到对方。清典的职责不是压低芝居，而是在这种强度里守住距离和刀身控制；伊藤相隔十多年回到舞台，仍能在高情绪中保留控制，也让旧训练重新显现。
```

**Proposed**

```text
演员越进角色，身体越容易本能地想把那一下真的送到对方身上。清典说自己的工作不是把情绪压回去，而是在情绪已经很高的时候继续守住距离和刀身控制；伊藤相隔十多年再回舞台，最后仍能做到这一点。
```

### `event:komachoe-20260309/yt-015626-kano-quote#title`

- Context: yt-main · 6986000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-015626-kano-quote.json`
- Field: `title`
- Original hash: `0e34dea673058e1d82fe400d8f9b10548a0d458f5624d8c8f533d2c930709a7d`

**Before**

```text
狩野对小松说：「翔平、芝居上手くなったね」
```

**Proposed**

```text
狩野对小松说：「昌平、芝居上手くなったね」
```

### `event:komachoe-20260309/yt-015626-kano-quote#summary`

- Context: yt-main · 6986000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-015626-kano-quote.json`
- Field: `summary`
- Original hash: `fdb67cce3a42c25f43ca8408cf43e899cc816b4301c36b4b95d65e3fa3ceb7ae`

**Before**

```text
小松把这句话列为整次再演最开心的事情之一。狩野翔先用“由我来说可能很冒昧”作铺垫，再直接肯定小松的芝居变好了；对一个长期一起工作的演员而言，这份认可比泛泛称赞更具体。
```

**Proposed**

```text
小松说，这是整次再演里最让自己开心的事之一。狩野先很客气地铺垫「由我来说可能有点冒昧」，然后直接告诉他：「昌平、芝居上手くなったね」。小松到广播里提起时，显然还记得很清楚。
```

### `event:komachoe-20260309/yt-015821-real-ryoma#summary`

- Context: yt-main · 7101000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-015821-real-ryoma.json`
- Field: `summary`
- Original hash: `75bf2521f188ff33a49fd7d200617b46089c57c19ce3f940e643070c3e91a842`

**Before**

```text
清典说濱健人的龍馬有一种真正人物般的耀眼感；与此同时，濱会主动向方言、芝居、殺陣和音响等不同部门确认细节。角色的自由与现场的严谨，在这段评价里并不是两件相反的事。
```

**Proposed**

```text
清典夸濱演出来的龍馬像真的人一样“有光”、会让视线自然追过去；但后台的濱又非常细，会自己跑去问方言、芝居、殺陣、音响各部门“这里到底怎么做更好”。台上的自由感，背后其实是一轮轮确认做出来的。
```

### `event:komachoe-20260309/yt-020037-no-regrets-next#summary`

- Context: yt-main · 7237000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-020037-no-regrets-next.json`
- Field: `summary`
- Original hash: `efe1c2588f399625d90a602888be913a3e3c9d3e33e7dde3d90a1f93dc773e69`

**Before**

```text
清典确认这次没有再产生需要靠下一次弥补的心残り，小松也说这一版已经出し切った。可当小松提到脚本仍有成长空间，清典立刻用「言質取りました」把它变成未来承诺的玩笑；小松随即提醒，当晚没有任何官方发表。
```

**Proposed**

```text
清典说这次终于没有再生出“下次一定要补回来”的心残り，小松也觉得这一版已经出し切った。结果小松刚说脚本以后还能继续成长，清典马上抓住一句「言質取りました」；两个人已经顺势聊到下一次，小松又赶紧提醒：今天什么都没官宣。
```

### `event:komachoe-20260309/yt-020408-komacchi#summary`

- Context: yt-main · 7448000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-020408-komacchi.json`
- Field: `summary`
- Original hash: `d46ebbddd79dba2fd9f729ddb18eddcaccd3ccc5ded39b7349bc6e6c1b487e2f`

**Before**

```text
小松希望旧伙伴不要因为自己现在是声优和 producer，就突然改用更客气的称呼。「こまっち」保留的是ヒローズ时代的关系：当年怎么叫，现在仍然怎么叫。一路被夸到这里，他终于说自己已经超过“被夸奖的容量”。
```

**Proposed**

```text
清典问以后到底该继续叫「こまっち」还是改叫「昌平」，小松认真选了前者。因为这个称呼留着的是ヒローズ时期的关系：自己现在成了声优、producer，也不想让旧朋友突然客气起来。清典后面又继续正面夸，他终于投降说已经超过「褒められのキャパ」。
```

### `event:komachoe-20260309/yt-020721-scattered-script#summary`

- Context: yt-main · 7641000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-020721-scattered-script.json`
- Field: `summary`
- Original hash: `d58b41ff0eb35c2d093ed936009d9603c1fffdd86223745e77c5e5210cc5fea7`

**Before**

```text
小松说，人很难写出自己完全没有的东西。《君がため》里的以蔵、沖田、武市、龍馬、土方和平助，并不是由某一个人代表作者；而是每个角色都拿着他心里的一部分，整部作品像一份“散落着自己的剧本”。
```

**Proposed**

```text
小松说，人很难写出自己身上完全没有的东西。所以《君がため》里不是某一个角色“最像小松”，而是以蔵、沖田、武市、龍馬、土方和平助分别拿走了他心里不同的一小块——这就是他所谓的「僕が散らばった脚本」。
```

### `event:komachoe-20260309/yt-020939-goods-truth#summary`

- Context: yt-main · 7779000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-020939-goods-truth.json`
- Field: `summary`
- Original hash: `e14a1c24c1e6a5d966b31b524a675e2f6081b6e29d5ea95226a26308d5293607`

**Before**

```text
小松只请声グラ把伊藤参加过的パンフ相关资料寄给本人，以为对方收到的是パンフ或确认材料。直到アフタートーク才知道，staff 还把アクスタ、ブロマイド等一并寄出；这场弁明把动作主体重新说清楚。
```

**Proposed**

```text
小松原本只请声グラ把伊藤参加过的パンフ相关资料寄给本人，自己一直以为对方收到的也就是パンフ或确认材料。直到アフタートーク才知道，staff 连アクスタ、ブロマイド等一整套都一起塞过去了——所以那包“小松周边”并不是他私人亲手打包寄的。
```

### `event:komachoe-20260309/yt-021442-tosa-accent#summary`

- Context: yt-main · 8082000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-021442-tosa-accent.json`
- Field: `summary`
- Original hash: `da0fa9a71a2ac2d41fa65baaa6a0bb72fa94716fd53fab03f0c3d97f877d50d1`

**Before**

```text
听到观众夸土佐弁准确，小松说再演有濱参与后又修了许多细部，并现场用「君がため」「心は」「水の泡」示范高低变化。文字能记录讨论内容，但这些重复示范的真正价值仍在原音。
```

**Proposed**

```text
听到观众夸土佐弁，小松说濱加入再演后又帮忙细修了不少地方，已经细到词里的高低 accent。广播里他直接拿「君がため」「心は」「水の泡」反复示范；这一段光看文字很难还原，最适合直接跳回原音听。
```

### `event:komachoe-20260309/yt-022019-shinsengumi-expansion#summary`

- Context: yt-main · 8419000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-022019-shinsengumi-expansion.json`
- Field: `summary`
- Original hash: `b052757d2d2c74e8bfc6fa09a302eb1f18d0081c2d1deb66139a58a21b98f9c2`

**Before**

```text
如果继续扩展新选组，小松最先想到原田左之助：舞台目前主要使用刀，槍会立刻增加不同的动作颜色。服部武雄的二刀流也同样适合设计；话题甚至扩大到更多声优参与的大型舞台，但仍停留在创作脑洞。
```

**Proposed**

```text
如果还要往新选组里加人，小松先想到原田左之助：现在台上主要都是刀，突然来一把槍，动作颜色马上就不一样。服部武雄的二刀流也很适合做；说着说着，脑洞又一路扩大到更多声优参加的大舞台。
```

### `event:komachoe-20260309/yt-022313-heisuke-spinoff#summary`

- Context: yt-main · 8593000ms · qualified
- Source: `src/content/projects/komachoe-20260309/events/yt-022313-heisuke-spinoff.json`
- Field: `summary`
- Original hash: `c492648d98e84d3ad0d3902e8a8784147e4cc7485031993b849ca9ea13ca72cd`

**Before**

```text
观众提出平助 spin-off、继续 double cast，以及让小松改演沖田等想法。小松觉得这些方向都能讨论，更明确说到：如果系列继续扩展，自己不必每次出演，更不必固定成为主角。
```

**Proposed**

```text
观众想看平助 spin-off、井上／汐谷继续 double cast，甚至让小松自己去演沖田。小松觉得这些都可以聊，更重要的是他第一次把话说到这里：如果真叫 spin-off，自己好像完全可以不当主角，甚至不必每一次都出演。
```

### `event:komachoe-20260309/yt-022830-stream-improved#title`

- Context: yt-main · 8910000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-022830-stream-improved.json`
- Field: `title`
- Original hash: `bbd325195f170fa417365eea45a195e66424c9c5c11c58a0f9d908a43ed2fc86`

**Before**

```text
配信的 camera 与音响，把初演留下的遗憾大部分收回
```

**Proposed**

```text
再演配信终于补上了初演时最在意的 camera 和音响
```

### `event:komachoe-20260309/yt-022830-stream-improved#summary`

- Context: yt-main · 8910000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-022830-stream-improved.json`
- Field: `summary`
- Original hash: `68fe6e7c0834dec7701d5af4026b33ac258dc3f82508eaaf05793d8a20c374df`

**Before**

```text
小松谈到再演配信时，特别肯定 camera work、switcher 与音响带来的改善。初演时没能完整传递到屏幕另一端的东西，这次大多被重新接住；它也是再演“完成感”不只存在于现场的证据。
```

**Proposed**

```text
小松说这次确实对关键 camera work 提了要求，不过自己更在意的其实是音响的临场感。最终 switcher 还是得交给现场团队，但他明显觉得再演的配信比初演进步很多；初演时没能完整传递到屏幕另一端的东西，这次大部分都补上了。
```

### `event:komachoe-20260309/yt-023017-eyes-received#title`

- Context: yt-main · 9017000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-023017-eyes-received.json`
- Field: `title`
- Original hash: `3aa74e899d90fce5ba71a5e3ba80674b0dcaa5f517d4c39ceee9804a17fda65e`

**Before**

```text
观众看见了前髪后的眼睛，视觉设计真正抵达接收端
```

**Proposed**

```text
观众说喜欢以蔵前髪深处的眼睛，小松：那正是想做的效果
```

### `event:komachoe-20260309/yt-023017-eyes-received#summary`

- Context: yt-main · 9017000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-023017-eyes-received.json`
- Field: `summary`
- Original hash: `048f95cf71634dbd877d137edfe0b339f63ff3a827666622e8dc18a0fd692d6f`

**Before**

```text
有观众提到以蔵前髪深处露出的眼神，小松因此确认，ヘアメイク想做的效果确实被接收到了。这条很短，却把前半段制作说明和观众最终看到的结果连成一条完整链。
```

**Proposed**

```text
前半ヘアメイク说明里，小松讲过自己故意用乱掉的前髪挡住以蔵的眼睛，让人没法一下看懂他的表情。到了节目最后，真的有观众说很喜欢前髪深处露出来的那双眼睛，小松马上回答：对，这就是当时想做的效果。
```

### `event:komachoe-20260309/yt-023132-seishun-amigo#summary`

- Context: yt-main · 9092000ms · verified
- Source: `src/content/projects/komachoe-20260309/events/yt-023132-seishun-amigo.json`
- Field: `summary`
- Original hash: `1bb9fec0b59f49af2dff355aa741d0a6e42ea6f0e5cca906fd370f561d3066d5`

**Before**

```text
小松说，舞蹈里有几个 step 从以前起就一直做错，这次由 SA.KANA先生指出并重新修正。它和方言、造型、殺陣一样，说明再演升级来自一个个具体部门对旧细节的重新检查。
```

**Proposed**

```text
小松笑说，《青春アミーゴ》里有几个 step 其实从以前起就一直跳错，这次终于被 SA.KANA先生抓出来重新修正。到节目快结束还在冒出这种小事，也很像这次再演：不是一句“升级了”就结束，而是一项一项把旧东西重新看过。
```

## 暂时不动的部分

- `readerNote`：现有 10 条主要承担事实边界，当前都还有用，不在语义润色里删除。
- `overview.title` 与四张卡片 title：整体已经够有辨识度；本轮只改 card summary。
- 大部分 Act title：结构清楚，仅将 `ヘアメイク如何参与角色构造` 改得更口语。
- UI / player / search / sourceNote：属于功能文案，不混入本轮 editorial copy。
- Event 未列出的 title：说明当前标题已经足够自然，只调整 summary。

## 两个值得用户人工确认的小点

### ⚑ `君がため` Mention 的正式表记
母本只封到节目内口头名乘：
`幕末異聞 岡田以蔵と沖田総司 君がため`

本轮 Proposed 不把它当作外部正式页面标题，只写“节目开场口头称作”。如果后续给 Mention 加官网链接，再用官方页面决定最终 label / 正式标点。

### ⚑ `ヒローズ` Mention 的“是什么”
本场材料非常擅长解释期别、人际关系和香川时期活动，但没有专门做一段百科式组织定义。因此本轮只安全写成“早期共同活动的旧团队”，不自行补公司／剧团／养成体系等外部分类。
