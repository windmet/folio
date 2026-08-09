# Komatsu36 RC 0.10 编辑体验实施规格

> 状态：RC10-A / B / C / D / E LOCAL ACCEPTANCE COMPLETE；Release Gate 仍待外部发布决策
> 阶段：RC 0.10 — Reader & Entity Editorial Pass
> 前置结论：RC 0.9 完成的是 Structural Editorial Audit，不是读者文案终审。
> 范围冻结：不新增 Event，不开放 Transcript / Evidence / Chat，不增加播放器能力，不重开 X Space 私有链路调查。

## 1. 为什么需要独立阶段

当前专题的路由、三媒体来源、深链、跨 Track Thread、人物反向索引、检索、键盘交互与发布门禁均已成立。剩余问题不是“功能能不能跑”，而是读者能否在不理解数据工程术语的前提下，看懂这五小时由谁构成、人物为何出现、跨平台材料如何补足叙事。

RC 0.10 只处理三个包：

1. Cast / People Pass：把实体索引升级为本项目的人物关系入口；
2. Reader Copy Pass：把内部审计语言与读者文案分层；
3. External Context Pass：用轻量来源卡承载真正改变叙事的场外材料。

三包完成后才恢复 Release Gate。实施前另加 `RC10-A0 Editorial Infrastructure`，先消除会覆盖人工决定的生成流程。`project.status: published` 只是当前首页可见条件，不等于已经获得 merge / production-accepted 结论。

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
4. `X SPACE / REMOTE`：区分实际上麦、LINE 电话加入与仅有账号关联的人。

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
    | 'remote-call'
    | 'space-account'
    | 'submitted-comment'
  character?: string
  sessions?: Array<'day' | 'night'>
  credit?: string
}>
links: Array<{
  kind: 'social' | 'agency' | 'official'
  platform?: 'x' | 'instagram' | 'youtube'
  label: string
  url: string
}>
```

约束：

- `ore-shiri-cast` 必须有 `character` 与至少一个 `sessions`；其他 kind 不得伪造角色；
- `space-guest` 只表示本人实际上麦；内田修一使用 `remote-call`，室元気只使用 `space-account`，不得把账号出现升级为本人参加；
- `projectContext` 只讲此人在本场中的作用，不写通用履历；
- `links` 只收本人、事务所或项目官方入口，链接真实性需逐条核对；缺链接允许为空；
- 旧 `role` / `note` 已在 RC10-B 完成迁移后删除；项目语境只保留 `projectContext`，参与关系只保留 `participation`，不能形成第二份人物真值；
- 链接核验记录写入 `docs/editorial/komatsu36-people-link-audit.md`，不把 `verifiedAt` 等审计字段塞进 Person JSON；
- 不增加头像、生日、事务所历史、代表作等百科字段。

### 3.4 18 人迁移基线

| 人物 | participation |
|---|---|
| 小松昌平 | `ore-shiri-cast` 岡田以蔵 day/night；`production` プロデュース・脚本；`birthday-live` |
| 伊藤友紘 | `ore-shiri-cast` 沖田総司 day/night；`submitted-comment` |
| 寺島惇太 | `ore-shiri-cast` 武市半平太 day；`birthday-live` |
| 狩野翔 | `ore-shiri-cast` 武市半平太 night；`birthday-live`；`space-guest` |
| 濱健人 | `ore-shiri-cast` 坂本龍馬 day/night；`production` 土佐弁監修；`birthday-live` |
| 矢野奨吾 | `ore-shiri-cast` 土方歳三 day/night；`birthday-live` |
| 井上雄貴 | `ore-shiri-cast` 藤堂平助 day；`birthday-live` |
| 汐谷文康 | `ore-shiri-cast` 藤堂平助 night；`birthday-live` |
| 清典 | `production` アクション演出；`ensemble`；`space-guest`；`submitted-comment` |
| 山本誠大 | `ensemble` |
| 光富崇雄、堀金蒼平、佐藤祐吾、熊谷俊輝 | 各自 `birthday-live` |
| 仲村宗悟、観世智顕 | 各自 `space-guest` |
| 室元気 | `space-account` |
| 内田修一 | `remote-call` |

本表是迁移基线，不代替逐 Person 的 `projectContext` 与链接核验。室账号上的不明发言者不是第二个 Person，也不得归因给室元気。

### 3.5 Person panel 合同

第一屏必须回答“此人为什么出现在这五小时”：

- 姓名、读音；
- participation chips：角色、昼夜、制作职责、主直播/Space 参与方式；
- `projectContext`；
- 官方 links；
- Related Storylines；
- Related Events。

Related Storylines 从现有 `Thread → Event → Person` 反向派生，不在 Person JSON 手写 `threadIds`。它与 Storylines 主视图复用当前唯一确定排序：`featured desc → title.localeCompare('zh-CN')`；当前数据没有“编辑顺序”真值，因此不新增 Person 专用 `order`。Related Events 延续 Track 原生时钟，不跨 Track 比较数值大小。

### 3.6 验收

- 读者无需打开多个 Person，即可看懂昼武市/夜武市、昼藤堂/夜藤堂；
- 18 个 Person 全部至少有一项 participation；室与内田分别保持 account / remote-call 事实边界；
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

### 4.3 RC10-A0：可保存的候选与裁决

自动产物与人工真值必须分离：

```text
komatsu36-reader-copy-candidates.generated.md  # 可删除、可重建
komatsu36-reader-copy-decisions.yml            # 只由人工维护，生成器永不写入
```

运行：

```powershell
npm run editorial:reader-copy
```

生成器读取但绝不覆盖 decisions；输出中显示已记录决定。总 Event / Thread 数从目录实际派生，不硬编码 124 / 16；内部限定标记名为 `has-internal-qualification`，避免误称“当前一定可见”。已经记录决定的条目即使改写后不再命中扫描词，也会以 `resolved-decision` 留在生成清单中；只有指向不存在 Event / Thread 的 ID 才是 stale ID。对不存在的候选 ID、非法 action 或错误 decisions 版本立即失败。

Event 决策有两个独立维度：

```yaml
copyAction: keep | rewrite | listen
readerNoteAction: none | add
newTitle: optional
newSummary: optional
readerNote: optional
note: optional editorial rationale
```

Thread 只要求 `copyAction`，可选记录 `newDeck` / `newBody`。正文需要改写不意味着必须添加 reader note。

### 4.4 人工三遍法

第一遍只裁决全部候选，不现场展开长篇查证：

- `keep`；
- `rewrite`；
- `listen`。

第二遍按 Act 1–2、3–4、5–6、7–8、Threads 五批修改，每批约 10–15 项并执行完整验证。Agent 可以调取 source pointer、提供上下文或候选文案，但不得批量自动覆盖正文。

第三遍脱离关键词候选，从真实网站头到尾连续阅读。它负责发现没有命中工程词、但仍生硬或断裂的文案。RC 0.10 acceptance 同时要求 decisions 全部 resolved 与 `full reader pass: complete`，不能只凭 52/52 自动候选结案。

### 4.5 Search 与发布层门禁

当前 `ProjectSearch.astro` 会把 `event.data.qualification` 写入 `data-search-text`，因此仅从 Timeline 移除可见段落并不能满足“内部 qualification 不进入读者 HTML”。RC10-A 必须同步：

- 从 Event searchText 删除 `qualification`；首版也不索引 `readerNote`，搜索只回答“发生了什么”；
- Person searchText 从旧 `role` / `note` 切到 displayName、reading、aliases、projectContext、participation 与 link label；
- `validate:publication` 对构建 HTML 增加 qualification 泄漏断言，不能只检查 ASR / SRT / 本地路径；实现时使用确定的内部 marker fixture，避免误伤正文中普通同词；
- status badge 与内部限定文案都不得进入读者 HTML。

RC 0.10 完成前新增只读检查：

- 构建 HTML 不出现内部 `qualification`；
- 读者可见 Event/Thread 文案不得出现已列出的工程标记，允许项必须在小型 allowlist 中写明理由；
- `readerNote` 仅出现在 `qualified` Event；若未来需要 verified Event 注记，应先修改合同；
- decisions 覆盖全部当前候选且无 stale ID，不能用生成器运行成功代替编辑完成；
- `npm run validate:reader-copy` 检查每个生成候选都有完整 action；rewrite 必须提供替换文案，readerNote 只能由 qualified Event 使用；
- `full reader pass: complete` 被追加到 RC 0.10 QA 记录。

## 5. External Context Pass

### 5.1 首个样本的事实边界

候选 URL：<https://x.com/ShugoAbc/status/2044004452907266061>

2026-08-09 使用 X 官方 oEmbed 对该 URL 进行只读核对，返回作者“仲村 宗悟”、账号 `@ShugoAbc`、日期 2026-04-14，并确认内容与“当天决定吃烧肉”一致。绝对时序核验完成前，页面只写：“同日，仲村又发布了一条烧肉相关帖子”，不提前使用“离开后／几分钟后”，也不保存整帖文本与媒体副本。

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

`ThreadPanel` 实现必须先构建 `relatedSourcesByAfterEvent`，每渲染一个 Event node 后立即渲染对应 SourcePost，再进入下一个 node；不得把全部外部来源堆在 Thread 尾部。

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

### 5.5 RC10-D-TODO：仲村 Post 绝对时序

该核验增强措辞，但不阻塞 related source schema 或使用“同日”这一保守表述：

1. 从 SP1 metadata 取得 `started_at`；不得用 Space 发布 status Post 的创建时间冒充；
2. 分别计算 `started_at + 00:28:41`（烧肉发言）与 `started_at + 00:28:54`（发现连接结束）；
3. 使用字符串 / `BigInt` 解码 Post Snowflake `2044004452907266061` 的创建时间，避免 JavaScript 53-bit 精度损失；
4. 记录两个 delta 秒与批准措辞：`几分钟后`、`同晚稍后`，或若顺序相反则撤回“之后”。

当前 yt-dlp `TwitterSpacesIE` 把 Space metadata 的 `started_at` 映射为 `release_timestamp`，`created_at` 映射为 `timestamp`；X 官方 X IDs 文档确认 Post Snowflake 编码创建时间并要求 JavaScript 使用字符串或 BigInt。该核验只读取时间元数据，不重开 HLS、token、Broadcast mapping 或站内回放调查。

参考：

- yt-dlp `TwitterSpacesIE`：<https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/twitter.py>
- X IDs / Snowflake：<https://docs.x.com/fundamentals/x-ids>

## 6. 实施顺序与提交边界

1. `RC10-A0 editorial infrastructure`（已完成）：generated candidates 与 decisions 分离、目录计数派生、双维度 action、stale/非法 decision 检查；未改页面；
2. `RC10-A schema + leakage gate`（已完成）：Person participation（含 remote-call / space-account）、`readerNote`、social Source 与 Thread relation；ProjectSearch 停止索引 qualification；补 validator / publication fixture；
3. `RC10-B people`（已完成）：迁移 18 人、Cast matrix、分组、Person panel Storylines 与 link audit；Search 切到新字段；旧 role / note 已删除；
4. `RC10-C copy batches`（已完成）：按三遍法处理 52 个 decisions；停止渲染内部 qualification，完成脱离关键词的全量 reader pass；
5. `RC10-D external context`（已完成）：只迁移仲村 X source 和插入正确节点间的 SourcePost；时序未核实时使用“同日”；
6. `RC10-E acceptance`（本地完成）：build、validator、桌面/390px、console、overflow、键盘、深链、full reader pass 和发布 HTML 泄漏检查；
7. 完成后再恢复 Release Gate，确认 `status: published`、production URL 与 merge/deploy 意图。

每个提交只包含一个包；不得在 Reader Copy 批次顺手扩 Event、补逐字、接媒体或改普通文章组件。

## 7. RC 0.10 完成定义

- People 首屏可读出昼夜 Cast 与四类参与关系；
- Person panel 能解释项目内角色，并显示派生 Storylines / Events；
- 内部 `qualification` 和 status 文案不再直接出现在读者 HTML；
- Reader Copy decisions 覆盖全部派生候选、无 stale ID；full reader pass 完成，且没有不必要的工程说明残留；
- 仲村场外烧肉来源以编辑摘要＋原帖直链进入正确 Thread 位置；
- 不新增 X widget、Transcript、Evidence、Chat、媒体 provider 或 Event；
- 完整本地验证与两种 viewport 通过后，才能称为 Reader & Entity Editorial Pass complete。
