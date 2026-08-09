# Komatsu36 RC 0.12-C2 QA

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；A2/C2 `PRODUCT-ACCEPTED` 待人工停点
> 日期：2026-08-09
> 路由：`/projects/komatsu36/?view=people`
> 本地预览：`http://127.0.0.1:4322`
> 执行入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本批只调整 People / Cast 的响应式投影，不改变人物数据、Lead Person、participation kinds、Person dialog、昼夜 cast 映射或 Event 回链。

## 实现摘要

- People 桌面 `wide` 与 `medium` 均使用全宽 `IDENTITY | PRIMARY RELATION | METADATA | COUNT` row，不再以三列窄卡压缩 metadata。
- People 容器判断基于 `.people-view` inline-size：`>= 960px` 与 `641–959px` 都是桌面 row；`<= 640px` 保留原移动纵向投影。
- Cast 新增独立 `cast-matrix-medium` role-row projection；每个角色明确显示昼／夜，不使用横向滚动。
- Cast wide 继续使用 `角色 | 昼 | 夜` table；mobile 继续使用六角色纵向 projection。
- 三种 Cast projection 的人物姓名继续使用同一 `data-open-person` dialog 入口。

## Browser 矩阵

Browser 使用应用内 Browser、真实 preview 路由、固定 100% zoom；检查 console、document/component overflow 和可见投影。

| 视口 / 场景 | 结果 |
|---|---|
| 1366×768 People | People container `1221px`；三组 People grid 均为单列全宽 `1221px`；Person row `1221px`；metadata 槽约 `496px`；Cast desktop `display:block`；document / grid / row overflow `0` |
| 1920×1080 People | People container `1128px`（页面内容列）；row 全宽；metadata 槽约 `452px`；Cast desktop 显示；document overflow `0` |
| 901×768 People | People container `782px`；row `780px`；Cast desktop 隐藏、medium 显示且有 6 个 role rows、mobile 隐藏；document / workspace / medium overflow `0` |
| 390×844 People | People container `343px`；mobile Cast 显示且有 6 个 role rows；medium / desktop 隐藏；mobile Person row 无横向溢出；mode 仍 Expanded；document / workspace overflow `0` |
| Person dialog | 390px 点击可见人物按钮后，Person overlay `hidden=false`、detail 可见、焦点进入 dialog，body 获得 `archive-panel-open` |

## 自动门禁

```text
npm exec -- tsc --noEmit                 PASS
npm run build                            PASS
git diff --check                         PASS
```

完整 `npm run validate` 与 payload audit 在本批提交前复跑。当前 Browser sampled console error / warning 为 0。

## 产品停点 C2

源码与 Browser 证据证明桌面 People 已恢复横向信息密度、Cast medium fallback 已存在，但不能自动产生 `PRODUCT-ACCEPTED`。人工仍需与 A2 一并确认：

1. 1366px full-width People row 是否比三列窄卡更易扫读；
2. 901px role-row 的昼／夜信息是否足够清晰；
3. 390px 纵向投影和 Person dialog 是否保持原阅读体验。

## 未执行边界

- `NOT EXECUTED`：真实 YouTube 播放、真实音频、长时 soak、生产部署；
- `NOT EXECUTED`：RC12-D2 Media Source 视觉重构与 RC12-B2 完整文本覆盖；
- `NOT EXECUTED`：A2/C2 人工 `PRODUCT-ACCEPTED`。
