# 前情帖 Publication v0.2 · Launch Gate Preflight

> 核对日期：2026-08-14
> review branch：`codex/publication-metadata-v2`
> validated code HEAD：`3c5dbd7`（VIS-03 / PEOPLE-03 / INDEX-03 / DOC-P0）

这是一份发布前核对记录，不等同于 production-accepted，也不授权 merge、deploy 或开放 robots。

## 已取得证据

- 本地 `npm run validate`：通过；包含三个 Project regression、Home Projection、Index、People、全局搜索、站点 metadata 与发布门禁。
- 本地 `npm exec -- tsc --noEmit`：通过。
- GitHub Actions：`Validate archive site` run [31798467723](https://github.com/windmet/folio/actions/runs/31798467723) 在 `3c5dbd7` 成功；包含依赖安装、production dependency audit、repository validation（含 documentation entrypoints）和 TypeScript check。
- HOME-05 本地浏览器验收：1440×900、1920×1080 与 390×844 通过；desktop 使用自然滚动加 `proximity` scroll snap，mobile 明确关闭 snap；无横向溢出、内容裁切或 console error。
- VIS-03 本地浏览器验收：1280×720 与 390×844 通过。Archive / People / Index 均回到 warm paper；广播、专题与 Index 的类型色只保留在左边线、顶线、kicker、日期和 marker；People 首页改为双栏 ledger，非 Cover scene 改为顶部偏置且允许弹性高度。
- PEOPLE-03 本地浏览器验收：伊藤友紘 fixture 的三个 Project 默认按新→旧排列，可切换旧→新；1–3 个 Event 直显、4–20 个默认折叠、小松昌平在 Komatsu36 的 81 个节点改由完整 Project Timeline 承接。桌面与 390px 无横向溢出，排序控件 focus outline 可见。
- PEOPLE-03 读者摘要收口：人物页不再显示重复的 `PROJECTS / CONTEXTS / ALIASES` 工程统计；伊藤 fixture 显示“3 项档案 · 电话连线 / 预投稿 / 被提及”，首页 ledger 使用相同语义顺序。1280×720 与 390×844 均保持单行且无横向溢出。
- INDEX-03 本地浏览器验收：两个 Index detail 已消费与 People 共用的 Chronology Rail；公开记录默认新→旧并可切换旧→新。`ore-shiri` 与 `ban-ban-ban` 在 1280×720 / 390×844 均无横向溢出，移动 rail、节点与 28px 内容缩进对齐，排序控件 focus outline 可见。
- Global `/timeline/` 已退出五个主要 Layout 的一级导航；旧 route 继续保留为兼容入口，不与 Project Timeline 或实体 chronology 混用。
- DOC-P0 已收口：根 README 只保留当前三项目、Person Model v2、active review branch、noindex 状态、验证命令与发布边界；原 Komatsu36 RC / Semantic 长历史入口已完整迁入 `docs/archive/komatsu36-history.md`。新增 `verify:documentation` 会验证当前/归档入口及 README 引用路径。
- 窄屏 `#people` / `#indexes` deep link 会停在 57px sticky header 下方；mobile 继续禁用 scroll snap。
- Reader brand、chaptered homepage、About / Editorial Policy、canonical / OG / favicon、Global People、Index 与全局搜索已经进入 review branch；`PUBLIC_LAUNCH_ENABLED` 仍为 `false`。
- 未来 public-route allowlist 已覆盖 `/indexes/`；这只修正显式 launch policy，不会在 Gate 开启前改变当前 `noindex, nofollow`。
- review 分支已推送到 GitHub；未创建 PR、未 merge、未触发 Cloudflare deployment。
- 当前远端 deployments API：0 条。
- 阶段完成度审计已汇总到 `docs/qa/publication-v0.2-review-handoff.md`：PUB-02A/B/C、PER-02A、CTX-02A、COR-02A、REL-02A 与 DOC-P0 均有直接实现或验证证据；PUB-02D 为工程完成、公开发布待授权。
- 最新文档收口 CI：`Validate archive site` run [31798827351](https://github.com/windmet/folio/actions/runs/31798827351) 在 `fc866f3` 成功。
- Komatsu36 payload 当前 raw 388,302 bytes，距离 380 KiB gate 仅余 818 bytes；后续 Project UI 变更必须继续运行 `npm run audit:payload -- komatsu36`。

## Production 探测

当前配置的 `https://folio-ca3.pages.dev/` 可返回 HTTP 200，但仍是旧站 fallback：

| URL | bytes | SHA-256 | title |
| --- | ---: | --- | --- |
| `/` | 10,265 | `111fc55d60c96e38886a355a16802eb5280e447cb945c2f8a7878e74cab93293` | `资料室 — Magazine` |
| `/indexes/` | 10,265 | `111fc55d60c96e38886a355a16802eb5280e447cb945c2f8a7878e74cab93293` | `资料室 — Magazine`（旧 fallback） |
| `/about/` | 10,265 | `111fc55d60c96e38886a355a16802eb5280e447cb945c2f8a7878e74cab93293` | `资料室 — Magazine`（旧 fallback） |
| `/projects/komatsu36/` | 383,511 | `de470bf804bef464b53bb44a9f0faadd65f918f133eeaa42102c61837039d676` | `小松昌平 36歳 Birthday Special — Magazine` |

`/indexes/` 与 `/about/` 返回和旧首页完全相同的 bytes / hash；这证明它们当前只是旧站 fallback，而不是本分支路由。`/people/` 与 `/search/` 同样没有当前分支的生产证据。因此 production URL 只证明旧站可达，不证明本分支已部署。

## 仍未满足的 Gate

- 内容公开权与正式部署意图：等待独立确认。
- 当前 validated code HEAD 对应的 production deploy：未执行。
- 生产 desktop / 390px spot check：未执行；本地 preview 已完成相同范围检查。
- 真实媒体基本链路与长时播放：未执行；本地静态构建和 iframe 壳不替代真实媒体验收。
- production console / overflow / focus / deep-link：未执行。
- 外部浏览器的纯键盘 Tab 顺序 spot check：未执行；本轮内置浏览器的 Tab 注入未离开 `BODY`，只取得语义控件、点击交互与 focus-visible 的分项证据，不把它写成完整键盘验收。
- robots：继续保持 `noindex, nofollow`；不从 `PUBLIC_LAUNCH_ENABLED = false` 切换。

## 下一步授权边界

只有在内容公开权、部署目标和生产环境都确认后，才进入 Cloudflare Preview/production QA；通过后再单独决定是否开放 `index, follow`。在此之前，本分支是可审阅 review branch，不是公开发布分支。
