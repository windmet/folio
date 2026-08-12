# こまちょえ生ラジオ 2026.04.25 · Mentions 重构指导

> 目标：让 `mentions` 回到“**这个被提到的人／作品／企划是什么**”的职责，不再重复 Timeline / Event 已经讲过的故事。
>
> 本文件是给 agent 的实施指导，**不是 review 回填文件**。人物 Mention 沿用上一轮已经审过的版本；本轮只重构作品／企划／游戏与概念项，并补外部链接。

---

## 1. 信息架构原则

### Event
回答：

> **这一刻发生了什么？小松说了什么？为什么值得点进去听？**

例如：
- 「ジレってなんですか」
- 細谷的「焚き火」
- “昼夜演得不一样”是否属于「邪念」
- 第 5 名 crew 的选择
- 游戏 backlog / 五小时开播习惯

这些都只留在 Event，不要再塞进作品 Mention。

### Mention
回答：

> **这个名字到底是什么？小松和它有什么关系？**

作品／企划／游戏 Mention 的 summary 应优先使用：
1. 官方定位；
2. 最短必要的作品背景；
3. 小松在该作品中的出演／关系。

不要再总结“本期围绕它聊了哪些梗”。

### 人物 Mention
**保持上一轮人工审阅后的现状，不在本轮重写。**

人物 Mention 仍然回答：
> “这个人在本期为什么出现？”

这与作品 Mention 的“它是什么”并不冲突。

---

# 2. 需要保留并重写的作品／企划／游戏 Mentions

## A. `さらに！俺を知ってくれ！～幕末編～`

### label
```text
さらに！俺を知ってくれ！～幕末編～
```

### summary · 定稿候选
```text
小松昌平担任 producer 并主演的《俺を知ってくれ！》系列舞台，以幕末为舞台，将朗读剧与动作表演结合。小松饰演冈田以蔵，2026 年再演由伊藤友紘饰演另一位主人公沖田総司。
```

### primary external link
```text
https://seigura.com/news/165385/
```

### suggested metadata
```yaml
url: https://seigura.com/news/165385/
urlLabel: 声優グランプリ
```

### supporting links
- 2026 再演介绍
  https://seigura.com/news/165385/
- 再演视频／介绍页
  https://seigura.com/movie/166284/

### source note
声優グランプリ将本作介绍为“动作与朗读剧融合”的 hybrid stage，并明确：
- 舞台为幕末；
- 小松昌平饰演岡田以蔵；
- 2026 再演中伊藤友紘饰演另一位主人公沖田総司。

---

## B. `プロトデウスの方舟`

### label
```text
プロトデウスの方舟
```

### summary · 定稿候选
```text
以“无法返回地球的宇宙船”为舞台的密室 SF mystery，将声优会话剧与钢琴、萨克斯二重奏结合。全企划由 38 名声优与 2 名演奏者轮换出演；小松在 4 月 12 日昼夜两场饰演飞行员 Leo。
```

### primary external link
```text
https://sfjazzreading.com/
```

### suggested metadata
```yaml
url: https://sfjazzreading.com/
urlLabel: 公式サイト
```

### source note
官网可直接确认：
- `オリジナルSF朗読劇 × ジャズセッション`
- “无法返回地球的宇宙船”为舞台的密室 SF mystery；
- 38 名声优 + 2 名演奏者；
- 钢琴 + 萨克斯二重奏；
- Leo 是一流飞行员；
- 4/12 12:30 与 17:30 两场的 Leo 均为小松昌平。

---

## C. `STRANGE EDEN`

### label
```text
STRANGE EDEN
```

### summary · 定稿候选
```text
THINKR 原作・企划的「怪綺的異類交遊ミステリ」。以ミイツ市为舞台，围绕人类、拥有不可思议力量的「エコー」与谜之物品「レガシー」展开，通过 Voice Drama、音乐与 MV 推进故事；小松饰演エコー・瑠何。
```

### primary external link
```text
https://miitsu.city/
```

### suggested metadata
```yaml
url: https://miitsu.city/
urlLabel: 公式サイト
```

### supporting links
- 世界观 / ABOUT
  https://miitsu.city/about/
- 瑠何 Character
  https://miitsu.city/characters/shuichiro-luka/
- Discography（含 `Boy meets xxx`）
  https://miitsu.city/discography/

### source note
官网明确：
- 原作・企画：THINKR；
- 类型：`怪綺的異類交遊ミステリ`；
- 舞台：ミイツ市；
- 重要概念：エコー / レガシー；
- 小松昌平饰演瑠何；
- `Boy meets xxx` 为瑠何（CV.小松昌平）的 CHARACTER song。

**不要**再在 Mention summary 里写赛车 MV、口型、“角色自己的声音”等，这些留给 Event。

---

## D. `小松昌平の盤・番・絆!（BAN・BAN・BAN）`

### label
```text
小松昌平の盤・番・絆!（BAN・BAN・BAN）
```

> 如果项目现有正式表记希望保留末尾 `!`，统一按 SECOND LINE 官网表记处理，不再使用单纯的 `小松昌平の盤・番・絆`。

### summary · 定稿候选
```text
以小松昌平为 host，邀请声优嘉宾挑战 Board Game、Card Game 的活动企划。通过合作与对战呈现出演者的个性、关系与「絆」，由 SECOND LINE 制作。
```

### primary external link
```text
https://2ndl.co.jp/banbanban/
```

### suggested metadata
```yaml
url: https://2ndl.co.jp/banbanban/
urlLabel: 公式サイト
```

### supporting link
- ABOUT
  https://2ndl.co.jp/banbanban/about/

### source note
SECOND LINE 的 ABOUT 页面直接将其定义为：
- 小松昌平担任 host；
- 出演声优挑战 Board Game / Card Game；
- 通过合作、对战与游戏中的意外展开呈现出演者的关系和“絆”。

**本期“TRPG 太自由会超时，因此往更像桌游的形式收”属于 Event，不写入 Mention。**

---

## E. `生徒会長とヤンキーくん`

### label
```text
生徒会長とヤンキーくん
```

### summary · 定稿候选
```text
飴玉舐め子创作的 BL 漫画，以生徒会长・白山与不良少年・黒谷的关系为中心。2026 年 5 月发行的特装版附迷你语音剧，小松在其中饰演白山光成。
```

### primary external link
```text
https://kir-comics.com/comics/12411/
```

### suggested metadata
```yaml
url: https://kir-comics.com/comics/12411/
urlLabel: KiR 作品页
```

### source note
KiR 官方作品页确认：
- 作者：飴玉舐め子；
- 2026/05/21 发售；
- 存在 `ミニボイス付特装版`；
- 核心人物为生徒会长白山与ヤンキー黒谷。

“小松昌平 = 白山光成”沿用本项目已经在广播母本／出演资料中封板的身份，不需要在 Mention 里重新讲本期那句“品行方正的完美学生会长很适合小松昌平”。

---

## F. `原神`

### label
```text
原神
```

### summary · 定稿候选
```text
HoYoverse 推出的开放世界冒险 RPG。小松昌平在日语版中为璃月角色嘉明配音，并兼任纳塔的咔库库（カクーク）的日语配音。
```

### primary external link
```text
https://genshin.hoyoverse.com/ja/
```

### suggested metadata
```yaml
url: https://genshin.hoyoverse.com/ja/
urlLabel: 公式サイト
```

### supporting links
- 原神日本官网
  https://genshin.hoyoverse.com/ja/
- 嘉明官方 Character Intro（原神日本官方 X）
  https://x.com/Genshin_7/status/1736689008112218438
- 嘉明官方 Character Demo（标题标注 `嘉明（CV：小松昌平）`）
  https://www.youtube.com/watch?v=8M5Gn3jD4kU
- カクーク日本语 CV 官方发布（原神日本官方 X）
  https://x.com/Genshin_7/status/1900519222297366595

### identity note
- 中文简体：咔库库
- 日文：カクーク
- 英文：Cacucu

这里保留“嘉明 + 咔库库”很有价值，因为它直接回答：
> 小松和《原神》到底有什么出演关系？

而不是像旧 summary 那样只说“这是待播游戏之一”。

---

## G. `ヴァレット／VARLET`

### label
```text
ヴァレット／VARLET
```

### summary · 定稿候选
```text
FuRyu 推出的学园 RPG，以“寻找真正的自己”为主题，在逐渐崩坏的学园中展开故事。玩家所扮演的主人公由小松昌平配音。
```

### primary external link
```text
https://www.cs.furyu.jp/varlet/
```

### suggested metadata
```yaml
url: https://www.cs.furyu.jp/varlet/
urlLabel: 公式サイト
```

### supporting links
- 游戏官网
  https://www.cs.furyu.jp/varlet/
- 主人公 Character
  https://www.cs.furyu.jp/varlet/character/hero/

### source note
FuRyu 官网明确：
- Genre：学园 RPG；
- 主题围绕“自己究竟是什么样的人 / 寻找真正的自己”；
- 主人公 CV：小松昌平。

---

## H. `Slay the Spire 2`

### label
```text
Slay the Spire 2
```

### summary · 定稿候选
```text
Mega Crit 开发的 Roguelike Deckbuilder《Slay the Spire》续作，通过反复攀塔、构筑牌组与收集 Relic 形成每局不同的路线。
```

### primary external link
```text
https://www.megacrit.com/press-kits/slay-the-spire-2/
```

### suggested metadata
```yaml
url: https://www.megacrit.com/press-kits/slay-the-spire-2/
urlLabel: Official Site
```

### supporting links
- Official press kit
  https://www.megacrit.com/press-kits/slay-the-spire-2/
- Early Access launch
  https://www.megacrit.com/news/2026-03-05-early-access-launch/

### source note
Mega Crit 官方将其定义为原作的续篇与 `roguelike deckbuilder`：
- 构筑独特 deck；
- 遭遇敌人；
- 收集 relic；
- 反复攀登不断变化的 Spire。

“最近玩到做梦还在算牌”继续只属于本期 Event。

---

# 3. 概念 Mentions：只保留 `筑豊弁`

## KEEP · `筑豊弁`

### label
```text
筑豊弁
```

### summary · 建议定稿
```text
福冈县筑丰地区一带使用的方言统称；即使同属筑丰，地区、世代与说话者之间也会存在差异。本期具体谈到「ぶちくらす／うちくらす」等表达。
```

### optional external link
```text
https://www.pref.fukuoka.lg.jp/life/2/50/226/
```

### suggested metadata
```yaml
url: https://www.pref.fukuoka.lg.jp/life/2/50/226/
urlLabel: 福岡県｜筑豊地域
```

### supporting link
饭塚市官网也直接把当地表达「かてて！」说明为“筑豊の方言”：
```text
https://www.city.iizuka.lg.jp/site/kosodate/1038.html
```

> 注意：外链只用于给“筑豊”地域／地方语言背景一个可靠入口，不要把政府页面当成完整方言词典。
> 本期具体音高、`ぶちくらす／うちくらす` 分布等仍以广播 Event / 母本中的谨慎边界为准。

---

# 4. 概念 Mentions：删除

以下项目都不再作为 Mention 独立存在。

```text
360°直播
空间收音
「本当は」的重音
TRPG 活动形式
打ち上げ
```

### 理由

#### `360°直播`
这是本项目的媒体／制作形式。Overview 与多个 Event 已经解释得比一个 Mention 更充分。

#### `空间收音`
这是 4/14 生日配信的具体制作方案，不是需要建立跨项目索引的独立实体。

#### `「本当は」的重音`
这是这期广播中的完整笑点／Event，不是一个需要百科式解释的外部概念。

#### `TRPG 活动形式`
与 `小松昌平の盤・番・絆!（BAN・BAN・BAN）` 完全重叠。
“为什么这次不做高自由度 TRPG”留在 Event。

#### `打ち上げ`
词本身太泛；本页真正有价值的是两次具体的打ち上げ以及各自发生的事情，这些已经被 Event 和人物 Mention 覆盖。

---

# 5. 人物 Mentions

## 不重写

沿用上一轮已审阅版本，包括：

```text
寺島惇太
細谷佳正
前田佳織里
宮﨑雅也
熊谷俊輝
佐藤祐吾
堀金蒼平
光富崇雄
清典
伊藤友紘
```

不要把人物 Mention 改成一般声优百科简介。

人物卡继续回答：

> **“这个人在这期广播里为什么出现？”**

这与作品卡的：

> **“这个作品到底是什么？”**

形成明确分工。

---

# 6. 外链字段实现建议

如果现有 `mention` schema 只有：

```yaml
label:
summary:
```

建议新增可选字段：

```yaml
url:
urlLabel:
```

示例：

```yaml
- label: プロトデウスの方舟
  summary: 以“无法返回地球的宇宙船”为舞台的密室 SF mystery，将声优会话剧与钢琴、萨克斯二重奏结合。全企划由 38 名声优与 2 名演奏者轮换出演；小松在 4 月 12 日昼夜两场饰演飞行员 Leo。
  url: https://sfjazzreading.com/
  urlLabel: 公式サイト
```

前端只需要在 Mention card / row 的末尾提供轻量链接：

```text
公式サイト ↗
```

### UI 原则

- 外链是补充资料入口，不要抢过 Mention summary。
- 默认新标签页打开：
  - `target="_blank"`
  - `rel="noopener noreferrer"`
- 没有 `url` 的人物 Mention 不显示空按钮。
- 不要把 supporting links 全塞进正式页面；正式数据通常只保留一个 primary URL。
- supporting links 主要供维护者和 agent 复核。

---

# 7. Agent 实施顺序

1. **不要修改人物 Mention 文案。**
2. 按“作品／企划／游戏”名称定位条目，**不要依赖旧数组 index**。
3. 将上面 8 项作品／企划／游戏的 label / summary 更新为定稿候选。
4. `原神` summary 必须补入：
   - 嘉明；
   - 咔库库（カクーク）；
   - 两者日语 CV 均为小松昌平。
5. 保留并轻调 `筑豊弁`。
6. 删除以下 5 个概念 Mention：
   - `360°直播`
   - `空间收音`
   - `「本当は」的重音`
   - `TRPG 活动形式`
   - `打ち上げ`
7. 若 schema 尚无外链字段，新增 optional：
   - `url`
   - `urlLabel`
8. 为 8 个作品／企划／游戏和 `筑豊弁` 写入上面的 primary URL。
9. 运行类型检查 / schema validation / build。
10. fresh export reader-copy review，确认：
    - 不再出现被删除的 5 个概念 Mention；
    - 不因数组删除造成错误映射；
    - 人物 Mention 原文保持不变；
    - Works / Projects / Games 的 Mention 不再重复 Event 梗概。

---

# 8. 最终职责检查

修改完成后，随便抽一条检查：

### `プロトデウスの方舟`

Mention 应回答：

> 这是一个什么作品？
> 小松在里面演谁？
> 去哪里看官网？

Event 应回答：

> 他为什么管細谷的做法叫「焚き火」？
> 为什么说刻意制造昼夜差异是「邪念」？
> 为什么开始纠结 Leo 要不要向 Kiana 道歉？

如果两边仍然在讲同一件事，就说明 Mention 还写得太像 Event。

---

## Primary external URLs · quick copy

```text
さらに！俺を知ってくれ！～幕末編～
https://seigura.com/news/165385/

プロトデウスの方舟
https://sfjazzreading.com/

STRANGE EDEN
https://miitsu.city/

小松昌平の盤・番・絆!（BAN・BAN・BAN）
https://2ndl.co.jp/banbanban/

生徒会長とヤンキーくん
https://kir-comics.com/comics/12411/

原神
https://genshin.hoyoverse.com/ja/

ヴァレット／VARLET
https://www.cs.furyu.jp/varlet/

Slay the Spire 2
https://www.megacrit.com/press-kits/slay-the-spire-2/

筑豊弁（地域资料入口）
https://www.pref.fukuoka.lg.jp/life/2/50/226/
```
