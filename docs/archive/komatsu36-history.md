# Komatsu36 工程与验收历史索引

这份文件承接曾经堆在根 README 第一屏的 Komatsu36 RC、Semantic 与实验入口。它们继续作为回归、决策来源和历史证据保存，但不代表当前 review branch 已完成 production deploy 或 Public Launch。

## 当前基线

- Project route：`/projects/komatsu36/`
- 架构、状态与长期回归合同：`docs/komatsu36-archive-development.md`
- RC 0.12 人工产品停点：`docs/qa/komatsu36-rc12/PRODUCT-CHECKPOINT.md`
- Cloudflare Pages provision / 首次部署清单：`docs/cloudflare-pages-release-checklist.md`

Komatsu36 已完成其多平台、多 Track、多人物压力测试职责。后续泛化不得改变既有 Event ID、时间、正文、Thread / People 语义、Player lifecycle 或 URL / history controller。

## RC 0.08–0.11

- Visual QA 与编辑审计：`docs/qa/komatsu36-rc08/`
- RC 0.10 编辑体验规格：`docs/editorial/komatsu36-editorial-experience-pass.md`
- RC 0.11 导航与视觉层级规格：`docs/editorial/komatsu36-archive-navigation-pass.md`
- RC 0.11 静态 payload 实施规格：`docs/editorial/komatsu36-static-payload-pass.md`
- RC 0.11 分批收尾 Runbook：`docs/editorial/komatsu36-rc11-closeout-runbook.md`

## RC 0.12

- 当前修正总入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`
- Timeline Navigator：`docs/editorial/komatsu36-rc12-t1-timeline-navigator-polish-runbook.md`
- Mobile Bubble：`docs/editorial/komatsu36-rc12-m1-mobile-player-bubble-runbook.md`
- Mobile Bubble QA：`docs/qa/komatsu36-rc12/m1/README.md`
- Mobile Timeline 密度与章节层级：`docs/editorial/komatsu36-rc12-mt1-mobile-timeline-runbook.md`
- Mobile Timeline QA：`docs/qa/komatsu36-rc12/mt1/README.md`
- Final Interaction & Hierarchy Cleanup：`docs/editorial/komatsu36-rc12-final-interaction-hierarchy-cleanup.md`
- Final Cleanup QA：`docs/qa/komatsu36-rc12/final-cleanup/README.md`
- Y1 外链 handoff QA：`docs/qa/komatsu36-rc12/y1/README.md`
- Y2 managed external session 指导（未授权实现）：`docs/editorial/komatsu36-rc12-y2-managed-external-session-experiment.md`
- Y2 隔离 WindowProxy 实验页（不进入生产路由）：`scripts/experiments/rc12-y2-windowproxy.html`

## Semantic 与 Reader Copy

- Semantic 总补丁：`docs/komatsu36_semantic_patch_20260810.md`
- Semantic P1 closeout audit：`docs/editorial/komatsu36-semantic-p1-closeout-audit.md`
- P0 handoff：`docs/editorial/komatsu36-semantic-p0-handoff.md`
- Person handoff：`docs/editorial/komatsu36-semantic-p1-person-handoff.md`
- Account handoff：`docs/editorial/komatsu36-semantic-p1-account-handoff.md`
- Story handoff：`docs/editorial/komatsu36-semantic-p1-story-handoff.md`
- Thread language handoff：`docs/editorial/komatsu36-semantic-p1-thread-language-handoff.md`
- UI language handoff：`docs/editorial/komatsu36-semantic-p1-ui-language-handoff.md`
- Event language handoff：`docs/editorial/komatsu36-semantic-p1-event-language-handoff.md`
- Reader Copy 自动候选：`docs/editorial/komatsu36-reader-copy-candidates.generated.md`
- Reader Copy 人工裁决：`docs/editorial/komatsu36-reader-copy-decisions.yml`

## 使用边界

- 历史 Browser、source-only 或短时证据只证明其原始声明，不自动升级为当前 production acceptance。
- Y2、关系图、Transcript / Evidence / Chat 浏览器和本地媒体托管仍需独立授权。
- 当前公开决策与部署状态以 `docs/qa/publication-v0.2-launch-gate.md` 为准。
