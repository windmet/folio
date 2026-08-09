# Komatsu36 RC 0.9 结构性编辑审计

日期：2026-08-09
范围：`src/content/projects/komatsu36/` 的公开发布层数据；不把本机源档或原始 ASR 复制到站点。

## 结论

Structural Editorial Audit 已完成。当前没有发现 Event、Thread、Person 关系错误、跨 Track 顺序错误或内部限定缺失；这证明发布数据结构可进入下一阶段，不等于 reader-facing copy 已经终审，也不再直接进入 Release Gate。

2026-08-09 的后续网页审阅确认：当前 People 更接近实体索引，`TimelineEvent` 又会把 `publicationStatus` 与 `qualification` 自动暴露给读者。因此新增 RC 0.10 Reader & Entity Editorial Pass，合同见 `docs/editorial/komatsu36-editorial-experience-pass.md`，嫌疑项队列见 `docs/editorial/komatsu36-reader-copy-queue.md`。

这不是“逐字稿全部封板”的声明。源档仍保留词级、人名 speaker、商品 SKU、画面确认和账号真实身份等 TODO；这些问题在页面中被限定、降级为事件级摘要，或明确不归因，不得在后续编辑中被补写成确定事实。

## 结构与数量核对

| 检查项 | 结果 | 证据 |
|---|---:|---|
| Act | 8 | `act-01.json` 至 `act-08.json`；主 YT Track 从 0 覆盖至 `17:50:46`，无间隙/重叠 |
| Event | 124 | 公开 Event 全部具备 title、summary、track、时间范围和 people 字段 |
| publication status | 82 `verified` / 42 `qualified` | 42 个 `qualified` Event 均有 qualification；无公开 `withheld` Event 被 Thread 引用 |
| Thread | 16 | 每条 Thread 都有 `setup` 与 `payoff`；节点引用完整 |
| 跨 Track Thread | 7 | `birthday-payback`、`muro-account`、`ore-shiri-making-of`、`rom-rule`、`shugo-yakiniku`、`space-technical-hell`、`uchida-line-call` |
| Person | 18 | 每个 Person 都被至少一个 Event 引用，具备 display name、reading、alias、role 与 note |

## 编辑审计要点

- 主时间线仍是 YouTube 的 canonical clock；SP1 / SP2 只在各自原生时间轴中定位。跨 Track Thread 使用编辑顺序，不按不同媒体的数值时间强行排序。
- `timeline-only` Event 不进入 Thread；其余公开 Event 均被 Thread 消费，避免事件既无叙事归属又被误报为完整线索。
- 账号身份、并发发言、回听不稳定的人名、产品品牌和商品型号均保留 qualification 或摘要级限定。尤其是室账号上的“乗っ取り”发言，没有归给室元気本人。
- 事件因果只在资料支持的范围内表达。例如俄罗斯章鱼烧明确写为“赛马制造遗忘条件”，而没有把它升级为当事人的逐字因果陈述。
- Thread 的 setup / development / payoff 与正文 deck/body 相互一致；没有为中间材料稀疏的线补造不存在的桥段。
- 播放层只提供 YouTube 内嵌或 canonical X Space 外链。截图中的 Player loaded 只证明 iframe/UI 载入，不证明真实音频播放、长时稳定性或 X 回放持续可用。

## 有意保留的源级 TODO

权威 TODO 文档 `komatsu36_review_todo(10).md` 仍列出若干不影响当前事件级发布的复核项，包括词级听辨、人名 speaker、商品 SKU/画面、Space 账号真实身份及跨 Track 的绝对 offset。它们不应通过猜测补齐；若未来要做逐字字幕、商品索引或身份归因，应逐项回听/看画面，并新增证据后再提升 publication status。

本审计采用的权威文件集位于源档根下的 `复核md/`，包括：

- `komatsu36_arcs(10).md` — `3CB19186B79A12BCBB2BDA184AFE009A8DC9E4A6757FBCEED72EEF9DC9E45DF7`
- `komatsu36_main(20260808-084256).md` — `2289F8F608411469FFF12AC11A710C898D56300CC2B412CCFCE5B2C27EBDC0A8`
- `komatsu36_space(20260808-085743).md` — `486A070B370F97805D0BFE7C17324FE375515508CE5413F263815C131111B717`
- `komatsu36_review_todo(10).md` — `6F9CC8138B22CE08D5409E6DCD379F2A26A1986F9099343122CFAF8690BEBD48`

## 交互回归复测（2026-08-09）

- 在保持 `127.0.0.1:4321` 不重启的条件下复测真实 `/projects/komatsu36/` 路由；页面提供 105 个主时间线 Event 定位控件。先选中 `yt-013840-great-payback`，播放器头部显示 `TARGET · 01:38:40` 及对应标题；再选中 `yt-014214-takoyaki-arrives`，文本更新为 `TARGET · 01:42:14` 及新标题，说明 Event selection 与右侧解释性文案保持联动；
- 在 Storylines 视图点击底部 Thread 触发器，触发器自动定位到页面下方（关闭前记录 `scrollY=3608.2756`）；打开详情时 body 进入锁定态，关闭后恢复到 `scrollY=3608.2756`，没有从页面顶部重新滚动回当前位置；
- 从 `event=sp2-011242-uchida-connected` 手动切换 YT 后，URL 清除旧 Event，回到 `?view=timeline`，播放器显示“选择时间节点开始定位”；在 SP2 上展开“浏览事件”时，12 个 SP2 节点可见，YT 的 104 个与 SP1 的 8 个列表保持隐藏。点击 SP2 节点后恢复 `event=sp2-000003-finally-vertical` 深链与 `TARGET · 00:00:03`；随后手动切 SP1，URL 变为 `?view=timeline&track=space-1`，并显示 `NO TARGET SELECTED`，没有残留旧 Event；
- YouTube iframe 本轮可载入（页面出现 1 个 iframe），但这只证明播放器壳/iframe 载入，不提升为真实音频连续播放、长时稳定性或 Release Gate 的 production media 证据。

## Release Gate

截至 2026-08-09 的外部状态核对：

- `origin/main` 为 `09cb5cc`，尚未包含 `src/content/projects/komatsu36/project.json`；当前专题只存在于审阅分支。
- GitHub repository deployments API 返回 `0` 条部署记录。
- `megazine-blog.pages.dev` 在本机 DNS、Cloudflare 公共 DNS `1.1.1.1` 和 Google 公共 DNS `8.8.8.8` 均返回 NXDOMAIN；因此候选 production 域名当前没有可验证的公开站点。

本审计完成后，发布前顺序修正为：

1. 完成 RC 0.10 Cast / People、Reader Copy 与首个 External Context 样本；
2. 确认 `project.status: published` 是否代表现在就允许合并到部署分支；
3. 如要正式发布，再对 production URL 做与本地 preview 同范围的抽查。2026-08-09 对 `https://megazine-blog.pages.dev/` 的只读探测未完成：应用浏览器返回 `net::ERR_CONNECTION_CLOSED`，PowerShell HTTPS 连接也在握手阶段关闭；这只能证明本次环境没有取得 production 证据，不能推断该站点全球不可用。

在这两个决定完成前，不把当前分支称为 production-accepted，也不合并到部署分支或执行 production 部署。当前 review 分支可以继续推送供 CI 与人工审阅，但这不等于正式发布。
