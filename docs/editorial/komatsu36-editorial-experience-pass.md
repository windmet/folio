# Komatsu36 RC 0.10 编辑体验实施规格

> 状态：READY FOR IMPLEMENTATION
> 阶段：RC 0.10 — Reader & Entity Editorial Pass
> 前置结论：RC 0.9 完成的是 Structural Editorial Audit，不是读者文案终审。
> 范围冻结：不新增 Event，不开放 Transcript / Evidence / Chat，不增加播放器能力，不重开 X Space 私有链路调查。

## 1. 为什么需要独立阶段

当前专题的路由、三媒体来源、深链、跨 Track Thread、人物反向索引、检索、键盘交互与发布门禁均已成立。剩余问题不是“功能能不能跑”，而是读者能否在不理解数据工程术语的前提下，看懂这五小时由谁构成、人物为何出现、跨平台材料如何补足叙事。

RC 0.10 只处理三个包：

1. Cast / People Pass：把实体索引升级为本项目的人物关系入口；
2. Reader Copy Pass：把内部审计语言与读者文案分层；
3. External Context Pass：用轻量来源卡承载真正改变叙事的场外材料。

三包完成后才恢复 Release Gate。`project.status: published` 只是当前首页可见条件，不等于已经获得 merge / production-accepted 结论。

## 2. 本轮指导的可行性裁决

| 建议 | 裁决 | 原因 |
|---|---|---|
| People 改为 People / Cast，并呈现昼夜矩阵 | 采纳，RC 0.10 必做 | 权威 `main` 已明确给出 8 位 cast、6 个角色和昼夜场次；当前扁平人物卡要求读者自行拼关系 |
| Person 增加参与结构、项目语境和官方链接 | 采纳，保持小 schema | 直接回答“为什么此人出现在这五小时”；不扩成通用声优百科 |
| Person 使用头像 | 本轮不做 | 没有统一且明确可再利用的图片授权；排版型档案足以建立层级 |
| `publicationStatus` / `qualification` 直接面向读者 | 修正 | 两者属于编辑与验证合同；只有改变读者理解的不确定性才转写为 `readerNote` |
| 自动扫描并自动改写 124 Event | 只采纳扫描，拒绝自动改写 | 关键词只能找嫌疑项，无法决定不确定性是否具有叙事价值 |
| 仲村烧肉 X Post 作为 Event | 不采纳 | Event 合同是 Track + native clock；外部 Post 没有 YT/SP1/SP2 时钟 |
| 仲村烧肉 X Post 作为 related source | 采纳，首个样本 | 它补全“说烧肉后消失”的场外余波，删除后会损失笑点与后续回收 |
| 默认加载官方 X Embed | RC 0.10 不做 | 第三方脚本、视觉权重、隐私与 consent 成本高于一条佐证材料的收益 |
| 复制完整 Post 到本站卡片 | 不采纳 | 会形成静态镜像与同步义务；使用编辑摘要、必要的极短引文和原帖直链 |
| 点击后再加载官方 Embed | 延后到 v1.1 评估 | 只有完成 cookie / privacy 通知、consent、失败降级和删除同步合同后才实现 |

## 3. Cast / People Pass

### 3.1 权威依据与呈现矩阵

以下结构来自 source-set manifest 锁定的 `复核md/komatsu36_main(20260808-084256).md` 第 2.1、2.2 节，不从旧的无后缀工作稿推导。

| 角色 | 昼 | 夜 |
|---|---|---|
| 岡田以蔵 | 小松昌平 | 小松昌平 |
| 沖田総司 | 伊藤友紘 | 伊藤友紘 |
| 武市半平太 | 寺島惇太 | 狩野翔 |
| 坂本龍馬 | 濱健人 | 濱健人 |
| 土方歳三 | 矢野奨吾 | 矢野奨吾 |
| 藤堂平助 | 井上雄貴 | 汐谷文康 |

production / action 的正式 credit 至少包括：小松昌平（プロデュース・脚本）、濱健人（土佐弁監修）、清典（アクション演出、ensemble）与山本誠大（ensemble）。页面必须区分源稿口头语境中的“动作监督”与正式 credit“アクション演出”，不得擅自互相纠错。

### 3.2 People 页的信息架构

按项目内职责分组，不再只按名字排序：

1. `俺を知ってくれ！ 2026 CAST`：先显示角色 × 昼夜矩阵；同一人可占两个 session；
2. `PRODUCTION / ACTION`：只列与当前档案叙事直接相关的制作与 ensemble；
3. `BIRTHDAY LIVE PARTICIPANTS`：实际进入主直播的人；
4. `X SPACE GUESTS`：实际进入 Space 或通过电话加入的人。

同一人物可以出现在多个组。组是 participation 的投影视图，不复制 Person，也不创建互相冲突的 role 字符串。

### 3.3 最小 Person schema

```ts
projectContext: string
participation: Array<{
  kind:
    | 'ore-shiri-cast'
    | 'production'
    | 'ensemble'
    | 'birthday-live'
    | 'space-guest'
    | 'submitted-comment'
  character?: string
  sessions?: Array<'day' | 'night'>
  credit?: string
}>
links: Array<{
  kind: 'x' | 'agency' | 'official'
  label: string
  url: string
}>
```

约束：

- `ore-shiri-cast` 必须有 `character` 与至少一个 `sessions`；其他 kind 不得伪造角色；
- `projectContext` 只讲此人在本场中的作用，不写通用履历；
- `links` 只收本人、事务所或项目官方入口，链接真实性需逐条核对；缺链接允许为空；
- 现有 `role` 在迁移期保留作兼容显示，完成 UI 切换后再决定是否废弃；
- 不增加头像、生日、事务所历史、代表作等百科字段。

### 3.4 Person panel 合同

第一屏必须回答“此人为什么出现在这五小时”：

- 姓名、读音；
- participation chips：角色、昼夜、制作职责、主直播/Space 参与方式；
- `projectContext`；
- 官方 links；
- Related Storylines；
- Related Events。

Related Storylines 从现有 `Thread → Event → Person` 反向派生，不在 Person JSON 手写 `threadIds`。排序先 featured，再按 Thread 编辑顺序；Related Events 延续 Track 原生时钟，不跨 Track 比较数值大小。

### 3.5 验收

- 读者无需打开多个 Person，即可看懂昼武市/夜武市、昼藤堂/夜藤堂；
- 18 个 Person 全部至少有一项 participation；
- 页面四个分组无重复实体文件、无孤儿；
- 桌面与 390px 矩阵不横向溢出；窄屏允许按角色折成六行，不缩成不可读表格；
- Person panel 可见 Related Storylines，关闭后仍恢复触发位置与焦点。

## 4. Reader Copy Pass

### 4.1 内部状态与读者说明分离

目标 schema：

```ts
publicationStatus: 'verified' | 'qualified' | 'withheld'
qualification?: string // editor / validator only
readerNote?: string    // optional, reader-facing natural language
```

渲染合同：

- `TimelineEvent` 不再自动渲染 `qualification`；
- `verified / qualified` badge 从普通读者界面移除或降为非文字、非主视觉信息；首选直接移除；
- 只有 `readerNote` 存在时才显示“补充说明”，且不得包含证据流水线或编辑指令；
- validator 继续要求 `qualified` 拥有内部 `qualification`，因此审计信息不会丢失；
- `readerNote` 不是 `qualification` 的机械改名，不能批量复制。

### 4.2 人工判断规则

逐项只问：

1. 不确定性会改变读者对人物归属、事件结果或因果的理解吗？不会则不显示读者说明；
2. 不确定的是一个细节还是整个事件？品牌、精确秒点等不影响事件时，正文只冻结可靠层级；
3. 不确定性本身是否有叙事价值？有时改写成自然语言，例如明确“解释来自现场追加，并非投稿原文”。

最终指标是“0 个不必要暴露给读者的工程说明”，不是把 42 个 `qualified` 强行改成 0。

### 4.3 队列与批次

运行：

```powershell
npm run editorial:reader-copy
```

生成 `docs/editorial/komatsu36-reader-copy-queue.md`。生成器扫描全部 124 Event 与 16 Thread；存在 `qualification` 的 Event 必进队，其余按证据词、编辑元语言和技术词筛选。它只重建队列，不编辑内容数据。

人工以 10–15 项为一批：Act 1 → Act 8，再处理 Thread；每批修改后执行完整 `npm run validate` 和真实路由抽查。队列内必须记录 keep / rewrite / listen / remove reader note 决定，避免同一条反复讨论。

### 4.4 发布层门禁

RC 0.10 完成前新增只读检查：

- 构建 HTML 不出现内部 `qualification`；
- 读者可见 Event/Thread 文案不得出现已列出的工程标记，允许项必须在小型 allowlist 中写明理由；
- `readerNote` 仅出现在 `qualified` Event；若未来需要 verified Event 注记，应先修改合同；
- 队列所有项目都有人工决定，不能用生成器运行成功代替编辑完成。

## 5. External Context Pass

### 5.1 首个样本的事实边界

候选 URL：<https://x.com/ShugoAbc/status/2044004452907266061>

2026-08-09 使用 X 官方 oEmbed 对该 URL 进行只读核对，返回作者“仲村 宗悟”、账号 `@ShugoAbc`、日期 2026-04-14，并确认内容与“当天决定吃烧肉”一致。页面只写编辑性概括：“离开 Space 后，仲村又发布了一条烧肉相关帖子”，不保存整帖文本与媒体副本。

### 5.2 Source 与 Thread relation schema

`projectSources.kind` 增加 `social`，并可选增加：

```ts
platform?: 'x' | 'web'
publishedAt?: string // ISO date 或 datetime；不得补造缺失时分秒
author?: {
  name: string
  handle?: string
}
```

Thread 增加：

```ts
relatedSources: Array<{
  source: Reference<'projectSources'>
  afterEvent: Reference<'projectEvents'>
  context: string
}>
```

验证要求：`afterEvent` 必须已存在于本 Thread 的 `nodes`；Source 与 Thread 必须属于同一 Project；首版只允许 `social` Source；`context` 是本 Thread 中的编辑概括，不复制 Post 正文。

仲村线将卡片放在 `sp1-002854-shugo-disappears` 之后、`yt-015806-yakiniku-main-recap` 之前。它不参与 Event 数、Track 时钟、seek、搜索中的 Event 类型统计。

### 5.3 SourcePost 组件

新组件使用 Folio 视觉，不复用 legacy `Tweet.astro` / `TweetEmbed.astro`，也不伪装成官方 X 卡片：

- kicker：`OUTSIDE THE STREAM · X`；
- 作者与 handle；
- Thread relation 的编辑概括；
- 只显示已核实精度的发布日期；
- 主动作：`在 X 查看原帖 ↗`；
- 原帖不可达时仍保留“来源曾用于本次编辑”的降级状态，但不显示缓存原文。

RC 0.10 不加载 `widgets.js`。X 官方文档确认 Embedded Posts 可通过 markup、oEmbed 或 JavaScript 渲染；官方政策同时要求，在不用 X for Websites 展示 X Content 时通过 API 取得当前版本并处理删除/修改，而 widgets 还涉及浏览活动、cookie 通知与适用地区的 consent。基于这些成本，本轮使用独立编辑摘要＋直链，而不是“自制 Tweet 镜像”。这是一项产品风险控制，不是法律意见。

参考：

- X Embedded Posts：<https://docs.x.com/x-for-websites/embedded-posts/overview>
- X Developer Policy，Public display of Posts：<https://docs.x.com/developer-terms/policy#public-display-of-posts>

### 5.4 外部来源准入规则

只在“删掉会明显损失笑点、因果或后续回收”时进入 Thread。普通人物主页、宣传帖或重复信息只留在 Source/Person links，不扩成相关卡片。RC 0.10 只迁移仲村烧肉一条，防止专题演变成无限社交媒体采集器。

## 6. 实施顺序与提交边界

1. `RC10-A schema`：Person participation、`readerNote`、social Source 与 Thread relation；补 validator fixture；
2. `RC10-B people`：迁移 18 人、Cast matrix、分组与 Person panel Storylines；
3. `RC10-C copy batches`：按队列逐批编辑；先停止渲染内部 qualification，再处理真正需要的 readerNote；
4. `RC10-D external context`：只迁移仲村 X source 和 SourcePost；
5. `RC10-E acceptance`：build、validator、桌面/390px、console、overflow、键盘、深链和发布 HTML 泄漏检查；
6. 完成后再恢复 Release Gate，确认 `status: published`、production URL 与 merge/deploy 意图。

每个提交只包含一个包；不得在 Reader Copy 批次顺手扩 Event、补逐字、接媒体或改普通文章组件。

## 7. RC 0.10 完成定义

- People 首屏可读出昼夜 Cast 与四类参与关系；
- Person panel 能解释项目内角色，并显示派生 Storylines / Events；
- 内部 `qualification` 和 status 文案不再直接出现在读者 HTML；
- Reader Copy Queue 全部有人工作出的决定，且没有不必要的工程说明残留；
- 仲村场外烧肉来源以编辑摘要＋原帖直链进入正确 Thread 位置；
- 不新增 X widget、Transcript、Evidence、Chat、媒体 provider 或 Event；
- 完整本地验证与两种 viewport 通过后，才能称为 Reader & Entity Editorial Pass complete。
