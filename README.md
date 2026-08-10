# Megazine Blog

一个用于保存声优采访、电台／播客与多线活动档案的 Astro 静态站点。当前最完整的专题档案是小松昌平 36 岁生日企划：它把主直播、两段 X Space、事件、人物和编辑 Thread 组织成一个可追溯的 Project Archive。

## 当前检查点

- Komatsu36：RC 0.10 与 RC 0.11 review-branch acceptance 已完成。RC 0.12 的 A2/C2/D2/B2/F2、E1–E5、T1.1、Y1 与 M1 Mobile Player Bubble 已完成工程／Browser 验证；M1 真实 Android/iOS 设备为 `NOT EXECUTED`。2026-08-10 Semantic P0、P1 Person／Story／Thread 与 UI Reader Language 已完成，下一批继续 Semantic P1 Event 流程词。T1/Y1 产品停点、真实媒体与 Release Gate 均未完成，Y2 managed external session 未授权。
- 审阅分支：[codex/komatsu36-project-archive](https://github.com/windmet/folio/tree/codex/komatsu36-project-archive)
- 专题路由：`/projects/komatsu36/`
- Visual QA 与编辑审计：`docs/qa/komatsu36-rc08/`
- 详细合同与剩余 Release Gate：`docs/komatsu36-archive-development.md`
- RC 0.10 编辑体验规格：`docs/editorial/komatsu36-editorial-experience-pass.md`
- RC 0.11 导航与视觉层级规格：`docs/editorial/komatsu36-archive-navigation-pass.md`
- RC 0.11 静态 payload 实施规格：`docs/editorial/komatsu36-static-payload-pass.md`
- RC 0.11 分批收尾 Runbook：`docs/editorial/komatsu36-rc11-closeout-runbook.md`
- RC 0.12 当前修正总入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`
- RC12-T1 实施与产品复核指导：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`
- Semantic 审计与分批交接：`docs/komatsu36_semantic_patch_20260810.md`、`docs/editorial/komatsu36-semantic-p0-handoff.md`、`docs/editorial/komatsu36-semantic-p1-person-handoff.md`、`docs/editorial/komatsu36-semantic-p1-account-handoff.md`、`docs/editorial/komatsu36-semantic-p1-story-handoff.md`、`docs/editorial/komatsu36-semantic-p1-thread-language-handoff.md`、`docs/editorial/komatsu36-semantic-p1-ui-language-handoff.md`
- Mobile Bubble 实施规格与证据：`docs/editorial/komatsu36-rc12-m1-mobile-player-bubble-runbook.md`、`docs/qa/komatsu36-rc12/m1/README.md`
- RC12-Y1 外链 handoff QA：`docs/qa/komatsu36-rc12/y1/README.md`
- RC12-Y2 managed external session 实验指导（未授权实现）：`docs/editorial/komatsu36-rc12-y2-managed-external-session-experiment.md`
- RC12-Y2 隔离 WindowProxy 实验页（不进入生产路由）：`scripts/experiments/rc12-y2-windowproxy.html`
- RC 0.12 人工产品停点：`docs/qa/komatsu36-rc12/PRODUCT-CHECKPOINT.md`
- Reader Copy 自动候选：`docs/editorial/komatsu36-reader-copy-candidates.generated.md`
- Reader Copy 人工裁决：`docs/editorial/komatsu36-reader-copy-decisions.yml`
- Cloudflare Pages provision / 首次部署清单：`docs/cloudflare-pages-release-checklist.md`

## 本地开发

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4321
```

常用验证命令：

```sh
npm run validate:projects   # 内容关系、时间范围、隐私边界
npm run build               # 生成 dist/
npm run audit:payload -- komatsu36 # 固定 payload / projection 审计
npm run validate:publication # 发布 HTML、检索项和单页预算
npm run validate            # 按上述顺序执行完整门禁
```

每次 push 或 pull request 都会由 `.github/workflows/validate.yml` 在 Node.js 22.12.0 上重复执行 `npm ci` 与 `npm run validate`。该 workflow 只做验证，不负责部署。

构建后的本地预览可以使用另一个端口，避免打断长期运行的开发服务器：

```sh
npm run preview -- --host 127.0.0.1 --port 4322
```

## 发布边界

`project.json` 中的 `status: published` 会让首页显示该专题，因此合并到部署分支可能等同于正式发布。独立 `codex/` 分支只用于审阅，不代表 production-accepted；合并前必须确认内容公开权、production URL 抽查和部署意图。

Komatsu36 的 X Space 在 RC 中采用 first-class external source：页面保留 canonical Space 链接、来源帖 provenance 和事件目标时间，不伪造站内回放、seek 或 X 私有接口。Transcript、Evidence、Chat 浏览器和本地大文件托管不属于本 RC 的发布范围。

## 内容结构

专题数据位于 `src/content/projects/`，按 Project、Act、Event、Thread、Person、Source 和 Track 分层。发布层不得包含原始 ASR 文件标记、本机源档路径、字幕文件名或其他私有来源信息；新增内容后应重新执行 `npm run validate`。
