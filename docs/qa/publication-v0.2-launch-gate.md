# 前情帖 Publication v0.2 · Launch Gate Preflight

> 核对日期：2026-08-14
> review branch：`codex/publication-metadata-v2`
> validated code HEAD：`cb8f0ec74b2a510864a45d933b1f85df6ee8cec4`

这是一份发布前核对记录，不等同于 production-accepted，也不授权 merge、deploy 或开放 robots。

## 已取得证据

- 本地 `npm run validate`：通过；包含三个 Project regression、Home Projection、Index、People、全局搜索、站点 metadata 与发布门禁。
- 本地 `npm exec -- tsc --noEmit`：通过。
- GitHub Actions：`Validate archive site` run [31794828218](https://github.com/windmet/folio/actions/runs/31794828218) 在 `cb8f0ec` 成功；包含依赖安装、production dependency audit、repository validation 和 TypeScript check。
- HOME-05 本地浏览器验收：1440×900、1920×1080 与 390×844 通过；desktop 使用自然滚动加 `proximity` scroll snap，mobile 明确关闭 snap；无横向溢出、内容裁切或 console error。
- Reader brand、chaptered homepage、About / Editorial Policy、canonical / OG / favicon、Global People、Index 与全局搜索已经进入 review branch；`PUBLIC_LAUNCH_ENABLED` 仍为 `false`。
- 未来 public-route allowlist 已覆盖 `/indexes/`；这只修正显式 launch policy，不会在 Gate 开启前改变当前 `noindex, nofollow`。
- review 分支已推送到 GitHub；未创建 PR、未 merge、未触发 Cloudflare deployment。
- 当前远端 deployments API：0 条。

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
- robots：继续保持 `noindex, nofollow`；不从 `PUBLIC_LAUNCH_ENABLED = false` 切换。

## 下一步授权边界

只有在内容公开权、部署目标和生产环境都确认后，才进入 Cloudflare Preview/production QA；通过后再单独决定是否开放 `index, follow`。在此之前，本分支是可审阅 review branch，不是公开发布分支。
