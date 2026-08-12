# Komachoe 2026-04-25 Archive Freeze

> 冻结日期：2026-08-12
>
> 分支：`codex/komachoe-20260425`
>
> 发布状态：`draft`

## 冻结范围

- Source Set：`komachoe-20260425-r1`。
- 1 条 YouTube Track，时长 `7,926,041ms`。
- 6 个连续 Act，以 `sectionKey` 投影为节目 Section。
- 30 个经人工选择与审校的完整叙事 Timeline Event；30 个均使用母版冻结的 `exact` 主时间窗。
- 0 Thread、0 People、0 Source directory；不为页面完整性制造关系数据。
- 公开页面只提供 Overview / Sections / Timeline。
- 视觉主题为数据驱动的 `broadcast-blue`：暖白纸张基底、低饱和雾蓝结构锚点、深色播放器焦点。专题色不再大面积染蓝阅读 surface。

内容选择以 `komachoe_20260425_main(9).md` v1.0 为 canonical mother draft。母版中的 42 条现只作为 Locator Inventory，不等于 42 个网页 Event；公开层严格采用 P01–P30，并以“点进去能重听一整段叙事”为成项标准。投稿内容、主持回应、Chat interpretation 与编辑推论保持分层，短回应只有真正改变结论时才独立成 Event。

本轮将相机结构与拼接盲区合并为一段；补入空间收音、わさびたこ焼き、寺島深夜陪吃家系与宮﨑后台玩笑。X 竖屏回应降为 P09 的后段证据，不再独立成项；`不審者` 不作人物映射。工作人员涂鸦、后辈原则、生日蛋糕与 Ending 等短 locator 不占公开 Timeline 节点。

## 公开输出边界

构建产物不得包含本机 source root、字幕或 JSONL 文件名、ASR 批次、Chat 身份字段与复核切片标记。广播 Project 保持单来源投影，不实例化 Media Sources、Timeline Scope、Source tabs、Storylines、People 或 Transcript。

## 本地验收快照

- `npm run validate`：通过。
- `npx tsc --noEmit`：通过。
- Komachoe publication gate：`66,132 bytes`、30 Events、draft route 未进入首页。
- Komachoe browser gate：1440×900、1920×1080、390×844、360×800、414×896 通过；无 page overflow 或 console error。
- Section → Timeline、Back/Forward、URL restore、搜索、播放器失败重试、Event seek、current-time handoff 与移动端 Bubble：通过。
- Komatsu36 publication：`383,640 / 386,048 bytes`，余量 `2,408 bytes`。
- Komatsu36 semantic closeout 7/7、YouTube N1、overlay scroll、RC12 Y1 / MT1 / PA1 / E / T1 / M1：通过。

## 上一冻结点的远端与 Production 审计

审计时间：2026-08-12（Asia/Shanghai）。以下记录对应叙事重编排之前的上一实现 HEAD；本轮提交与远端状态以交付消息为准，Production 边界不变。

- 本次实现 HEAD：`993d1d714685c10bf7d22ac9d8b5d8d71f8b3152`；包含 Production 基线 `eeb09159d0ea8cd932d049db6ae4d667c4df6d61`。
- 审计时远端分支 `origin/codex/komachoe-20260425` 与本地实现 HEAD 一致。
- GitHub Actions：[`31593715093`](https://github.com/windmet/folio/actions/runs/31593715093) 对该实现 HEAD 成功；覆盖 `npm ci`、production dependency audit、`npm run validate` 与 TypeScript。
- GitHub PR：未创建。当前“继续完成本地与远端证据”的指令不扩大解释为 merge / deploy 授权。
- GitHub deployments API：0 条；仓库没有 Cloudflare token 或 Wrangler 自动部署配置。
- 当前 Production 首页 `https://folio-ca3.pages.dev/`：HTTP 200，UTF-8 内容 `10,265 bytes`，SHA-256 `111fc55d60c96e38886a355a16802eb5280e447cb945c2f8a7878e74cab93293`。
- 当前 Production Komatsu36：HTTP 200，UTF-8 内容 `383,511 bytes`，SHA-256 `de470bf804bef464b53bb44a9f0faadd65f918f133eeaa42102c61837039d676`。
- 当前 Production Komachoe URL 返回 HTTP 200，但内容大小与 SHA-256 均与首页完全相同；这是 Pages fallback，不是广播 Project 页面。因此 Production 保持未变，不能记为 Preview 或 route PASS。

## 尚未执行的发布 gate

以下项目没有被本地自动化替代，完成前不得把 Project 改为 `published`：

1. Cloudflare Preview 生产环境路由验收；
2. 手机 Wi-Fi 下真实 YouTube 播放与 seek；
3. 手机蜂窝网络下真实 YouTube 播放与 seek；
4. 用户明确授权公开。

### 真机签字表

真机测试必须访问部署后的 Preview URL，不能用桌面 Playwright Provider 或本地局域网结果替代。

| 环境 | 页面加载与 30 Event | 真实 YouTube 播放 | Event seek | 返回页面状态 | console / 横向溢出 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 手机 Wi-Fi | 待执行 | 待执行 | 待执行 | 待执行 | 待执行 | `NOT EXECUTED` |
| 手机蜂窝 | 待执行 | 待执行 | 待执行 | 待执行 | 待执行 | `NOT EXECUTED` |

### 下一次允许的状态迁移

1. 用户明确授权创建 Draft PR / Cloudflare Preview；
2. 对生成的 Preview URL 完成桌面、390px 与上述两条真机签字；
3. 用户审阅 Preview 后明确授权公开；
4. 才可把 `project.status` 从 `draft` 改为 `published`，随后另行 merge / deploy；
5. Production 路由必须再次验证为真实 Komachoe 页面，不能只以 HTTP 200 判定成功。

`4/25 ↔ 4/14` 关联档案仍是发布后的独立实验，不阻塞本期独立成立，也不在本次冻结范围内。
