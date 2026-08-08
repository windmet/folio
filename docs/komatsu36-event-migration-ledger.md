# 小松昌平生日会 Event 迁移台账

> 作用：记录从 canonical 工作稿进入公开 Project Archive 的可审阅小批次。它不是第二份内容真值；事件事实仍以 source-set manifest 指向的带后缀文件为准。

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

## 后续候选批次

- K36-EVT-B02：01:21–01:41 第一批礼物与“大還元祭”前因（已迁移并通过数据、构建与浏览器抽样，6 个 `timeline-only` Event）
- K36-EVT-B03：01:55–02:25 第二批礼物、留守组卡拉 OK 与换装回归（已迁移并通过数据、构建、桌面与 390px 浏览器抽样；14 个 Event，其中 2 个进入既有 Thread，12 个为 `timeline-only`）
- K36-EVT-B04：02:27–03:45 《俺知》名场面复盘（已迁移并通过数据、构建、桌面与 390px 浏览器抽样；18 个 Event，其中 8 个制作／企划节点进入既有 Thread，10 个为 `timeline-only`；新增伊藤友紘与山本誠大 Person，并验证人物反向聚合）
- K36-EVT-B05：04:14–04:55 卡拉 OK／Super Chat 双轨与二次会散场（已迁移并通过数据、构建、真实播放器联动与 390px 抽屉复位抽样；11 个新增 Event，6 个进入既有“正式结束之后完全没结束”Thread，5 个为 `timeline-only`；另为既有 T-BOLAN Event 补充 HOST／TABLE 并发标注。曲目只作索引，不刊载歌词；声优 Grand Prix 的账号／金额，以及“修二与彰”接话的具体说话人仍保留限定）
- K36-EVT-B06：00:01–03:54 结构锚点、媒介形式与来宾批次（已迁移并通过源档、数据、构建、发布与桌面浏览器抽样；补开场、卡拉 OK 前置、360°双席视角、Space 往返、三批到场、集体庆生与 Bingo 正式开始，共 14 个 `timeline-only` Event；不拆分重叠自我介绍，也不伪造跨轨 offset）

## Act 边界复核

- 8 个 Act 已由 `draft` 升为 `confirmed`。边界分别落在首批来宾到场前、俄罗斯章鱼烧实物登场、第二批来宾到场前、名场面复盘入口、狩野名场面入口、Bingo 返礼入口与第一次正式 Ending。
- 原 03:13:00 边界会把“断刀事故”setup 与紧接的龙马台词 payoff 分到两个 Act；现前移至 03:12:58，并将两个 Event 都归入 Act 06。其余边界不拆分既有 Thread 的相邻节点。

批次编号只表示审阅顺序，不表示公开阅读顺序，也不进入页面 URL。
