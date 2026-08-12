# 小松昌平生日会 Event 迁移台账

> 作用：记录从 canonical 工作稿进入公开 Project Archive 的可审阅小批次。它不是第二份内容真值；事件事实默认以 source-set manifest 指向的带后缀文件为准。若后续 semantic patch 明确登记 `OVERRIDE`，则只在该事项上由 patch 覆盖旧分析结论，RAW 与原 MD 仍保持不可变。

## 批次规则

1. 每批只覆盖一个连续时间窗或一条已有 Thread，避免把整场自动抽取结果一次发布。
2. 候选必须同时给出 Track 原生时间、公开摘要、人物引用、publication status 与 narrative mode；`threaded` 必须有消费它的 Thread，`timeline-only` 则必须保持无 Thread 引用。
3. 去重键以 `track + startMs + 事件语义` 为准；标题不同不构成新 Event，跨轨相似事件也不得合并为共享时钟。
4. canonical 标为“事件已解决”只证明可形成事件摘要，不自动证明商品 SKU、逐字引文、speaker 或因果关系已封板。
5. 未解决的细节必须省略或写入 `qualification`；不得从商品搜索、Chat 昵称或旧 ASR 猜补。
6. 不为了满足 Thread 覆盖率把普通时间线节点硬塞进 ARC；到场、单次礼物与转场优先使用显式 `narrativeMode: timeline-only`。
7. 每批通过 `validate:sources`、`validate:projects`、Astro build、`validate:publication` 和真实路由抽样后，才记为已迁移。

## K36-EVT-B01：Bingo 缺失主奖轮次

- 状态：已迁移，待最终视觉抽样
- 范围：YT 03:56:33–04:07:58，Act 07，ARC-16
- canonical 依据：`komatsu36_main(20260808-084256).md` 时间轴第 230–235 行；`komatsu36_arcs(10).md` ARC-16 主奖表第 560–566 行；`komatsu36_review_todo(10).md` YT-29～32
- 迁移前覆盖：7 轮主奖中页面已有 Amazon 5000×2 与虎徹竹光，共 2 轮
- 本批新增：国産牛／汐谷、誠杯／光富、蛋白饮／佐藤、誠扇子／井上、Switch 2 Pro 控制器／熊谷，共 5 个 Event
- 消费关系：全部加入既有 `bingo-payback` Thread，保持 YouTube 原生时间升序
- 保留边界：杯与扇子的品牌、材质、正式 SKU 仍是 VIS-07；页面仅发布已锁定的品类、号码语境与中奖者
- 去重结果：没有与既有 56 个 Event 发生 `track + startMs` 冲突；Amazon 与虎徹节点保持原 ID，不重复生成

### 2026-08-10 Semantic override

- semantic patch 覆盖旧分析 MD 中“寺島＋濱中奖”的判断：Amazon 5000 円×2 的 winners 采用寺島惇太＋堀金蒼平；
- 旧 `yt-040405-amazon-hama` ID 为兼容深链保留，people 已改为寺島／堀金；读者层只发布“两人同时 Bingo”，第二位中奖者的排除证据保留在内部 `qualification`；
- 濱没有中主奖；`04:05:24` 抢寺島 Amazon 卡另拆为 `yt-040524-hama-grabs-amazon-card`；
- 原始 source-set 与 RAW 不回写；当前 derived authority 为 `docs/komatsu36_semantic_patch_20260810.md` 第 1～3 节；
- 本次新增 1 个 Event，当前公开总数为 125。

## 后续候选批次

- K36-EVT-B02：01:21–01:41 第一批礼物与“大還元祭”前因（已迁移并通过数据、构建与浏览器抽样，6 个 `timeline-only` Event）
- K36-EVT-B03：01:55–02:25 第二批礼物、留守组卡拉 OK 与换装回归（已迁移并通过数据、构建、桌面与 390px 浏览器抽样；14 个 Event，其中 2 个进入既有 Thread，12 个为 `timeline-only`）
- K36-EVT-B04：02:27–03:45 《俺知》名场面复盘（已迁移并通过数据、构建、桌面与 390px 浏览器抽样；18 个 Event，其中 8 个制作／企划节点进入既有 Thread，10 个为 `timeline-only`；新增伊藤友紘与山本誠大 Person，并验证人物反向聚合）
- K36-EVT-B05：04:14–04:55 卡拉 OK／Super Chat 双轨与二次会散场（已迁移并通过数据、构建、真实播放器联动与 390px 抽屉复位抽样；11 个新增 Event，6 个进入既有“正式结束之后完全没结束”Thread，5 个为 `timeline-only`；另为既有 T-BOLAN Event 补充 HOST／TABLE 并发标注。曲目只作索引，不刊载歌词；声优 Grand Prix 的账号／金额，以及“修二与彰”接话的具体说话人仍保留限定）
- K36-EVT-B06：00:01–03:54 结构锚点、媒介形式与来宾批次（已迁移并通过源档、数据、构建、发布与桌面浏览器抽样；补开场、卡拉 OK 前置、360°双席视角、Space 往返、三批到场、集体庆生与 Bingo 正式开始，共 14 个 `timeline-only` Event；不拆分重叠自我介绍，也不伪造跨轨 offset）

## Act 边界复核

- 8 个 Act 已由 `draft` 升为 `confirmed`。边界分别落在首批来宾到场前、俄罗斯章鱼烧实物登场、第二批来宾到场前、名场面复盘入口、狩野名场面入口、Bingo 返礼入口与第一次正式 Ending。
- 原 03:13:00 边界会把“断刀事故”setup 与紧接的龙马台词 payoff 分到两个 Act；现前移至 03:12:58，并将两个 Event 都归入 Act 06。其余边界不拆分既有 Thread 的相邻节点。

## Canonical 剩余项发布裁决

本节回答“复核 TODO 尚有未关闭项，为什么页面仍可发布”。它不改写 canonical 状态，只记录网页层采用的边界。

| canonical 剩余类别 | 网页处理 | 当前裁决 |
|---|---|---|
| `G-01` / `G-02` 跨轨绝对 offset | Track 保留各自 native clock；Thread 只引用 Event，由 Event 决定 Track 与本地时间 | **明确不迁移为 offset**。在找到共同收音锚点前，任何 YT ↔ SP 跳转换算都属于伪精确 |
| `SP1-R*`、`SP2-*` 逐字尾词、`YT-R*` 助词／speaker／动作动词 | v1 不公开完整 Transcript；Event 只给事件级摘要和必要限定 | **明确省略**。未来若开放逐字字幕，再按短窗队列复核，不反向污染当前 Event |
| `VIS-01`～`VIS-07`、`VIS-09` 商品型号／包装／staff 身份 | 只发布已锁定品类、人物关系或现场笑点；品牌、SKU、材质、款式不猜补 | **事件已覆盖，物件层 withheld**。没有画面证据就不增加商品字段 |
| `SP2-01` / `VIS-10` 室账号“乗っ取り”者 | 保留 qualified Event，明确“账号归属”不等于“实际发言者”；Person 角色也只写账号关联 | **身份 withheld**。不按账号、声音印象或 Chat 猜人 |
| `VIS-08` Space 纵横屏画面 | 技术 Thread 只记录现场已确认的无声、横向、重开与最终竖向事件 | **不升级为逐帧视觉事实**。现有节点足以表达技术闭环 |
| 卡拉 OK 歌词、合いの手逐句、多人重叠自我介绍 | 发布曲目、参与者和并发 lane；不刊载歌词，不强拆 speaker | **明确省略**，兼顾证据强度、可读性与版权边界 |
| Super Chat 显示名、`author_id`、金额、完整 Chat | 只保留对事件有解释力的“收到哪一侧消息／现场如何反应” | **私有层关闭**。不进入首屏 HTML、搜索索引或公开 JSON |
| 主时间轴中同一事件的连续强化句、重复确认和过场寒暄 | 吸收到最近的 Event 摘要，或仅由 Act 提供导航 | **不单独建 Event**。Event 的单位是可复用事实节点，不是每一行转写 |

### 当前覆盖结论

- 125 个公开 Event 已覆盖 canonical 主时间轴的全部结构换场、三条原生 Track 的代表性节点、16 条 ARC 的首轮网页化，以及 review 中所有标为“事件级解决”且对公开阅读有独立价值的项目；其中新增的抢卡节点来自 2026-08-10 semantic override。
- 未进入 Event 的剩余项都落入上表的明确边界；当前没有“事件级已解决、会改变人物或因果解释、但既未发布也未说明省略理由”的已知条目。
- 该结论是 **source-audited** 的编辑覆盖结论，不等同于逐字字幕完成、跨轨同步完成或商品视觉法证完成。

## 最终视觉与交互裁决（2026-08-09）

- 桌面 1280px：首页专题入口可点击，Project 五个视图均可达；Timeline 显示已复核 Act 文案，搜索 `360°镜头` 返回唯一 Event 并恢复稳定深链；页面横向溢出为 0。
- 真实 YouTube 播放从 04:23:04 跨到 04:23:33 时，右栏说明由声优 Grand Prix Super Chat 自动切换为滨的歌曲间隙自我评价；播放器时钟、fallback 时间参数与 `event` URL 同步更新，但不新增浏览历史层。
- 390px：Hero、五视图导航、播放器 poster、13 节点 Thread bottom sheet 与 Person bottom sheet 均可读，横向溢出为 0；关闭抽屉在同一帧恢复原滚动位置，不再从页面顶部平滑滚回。
- Person 相关节点显示 YT／SP1／SP2 原生轨标签。YT 节点返回 Timeline；Space 节点返回 Storylines、打开消费该 Event 的 Thread，并切换右栏来源，避免不同原生时钟被误读成同一时间轴。
- Transcript 视图继续明确显示暂不公开；X Space 只给原 status 外链，不伪造站内播放或 timestamp seek。

批次编号只表示审阅顺序，不表示公开阅读顺序，也不进入页面 URL。
