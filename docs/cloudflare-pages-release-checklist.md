# Cloudflare Pages Release Checklist

这份清单只描述首次 provision / promotion 所需的外部操作；当前仓库没有 Cloudflare token、Wrangler 配置或 deployment 记录，因此不会由本地脚本自动执行。

## Provision 前

- [ ] 确认内容公开权、production URL 和正式发布意图。
- [ ] 确认 GitHub 仓库 `windmet/folio` 与审阅分支 `codex/komatsu36-project-archive` 的 CI run 为 success（当前 HEAD `86db08b`，run `31289096765` 已成功）。
- [ ] 在 Cloudflare Pages 创建或连接项目；候选项目名可使用 `megazine-blog`，但最终以 Cloudflare 控制台实际生成的 `*.pages.dev` 地址为准。
- [ ] 生产分支设置为 `main`；`codex/*` 只作为 review / preview 分支，不直接代表 production。

## Build 设置

| 设置 | 值 |
|---|---|
| Framework preset | Astro（Static） |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js | `22.12.0`，与 `.github/workflows/validate.yml` 一致 |
| Install command | `npm ci` |
| Repository secrets | 本站静态构建不需要 Tina token；不要把本机源档路径或任何 token 写入仓库 |

## 首次部署后

1. 记录 Cloudflare 实际生成的 production URL；只有 DNS 可解析且 HTTPS 可访问后，才替换 `astro.config.mjs` 中的候选 `site` 值。
2. 对首页和 `/projects/komatsu36/` 做 desktop / 390px 抽查，确认三 Source、首页专题入口、事件深链和外部 X CTA。
3. 检查浏览器 console、横向 overflow、YouTube `origin`、Thread / Person focus containment，以及 `?track=` / Event back-forward。
4. 重新执行 `npm run validate`，并记录 production URL、时间、HEAD SHA 与截图。
5. 将“production 可达 + 内容授权 + 部署意图”三项证据追加到 `docs/qa/komatsu36-rc08/EDITORIAL-AUDIT.md`，之后才可把 Release Gate 标记为通过。

## 当前已知状态

截至 2026-08-09，候选 `https://megazine-blog.pages.dev` 在公共 DNS 返回 NXDOMAIN，GitHub deployments API 为 0，`origin/main` 尚未包含 Komatsu36。因此当前分支是可审阅的 RC，不是 production-accepted。
