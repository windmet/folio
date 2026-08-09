# Komatsu36 RC 0.12-A2 QA

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；`PRODUCT-ACCEPTED` 待人工停点 A2
> 日期：2026-08-09
> 路由：`/projects/komatsu36/`
> 本地预览：`http://127.0.0.1:4322`
> 执行入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本批将第一版右栏 `compact` 重定义为真正的 `docked` bottom player。它没有创建第二个播放器，也没有改变 Track、Event、seek、URL 或 source-local clock 合同。

## 实现摘要

- `ProjectArchiveShellElement` 的最终 presentation mode 为 `expanded | docked`；旧 v1 session preference 中的 `compact` 会迁移为 `docked`，新值写入 v2 key。
- Timeline / Storylines 默认 Expanded；Overview / People / Transcript 默认 Docked；移动端始终 Expanded，mode toggle 隐藏。
- Docked 时 `.project-player-column` 释放为 `display: contents`，`.project-workspace` 恢复单列，Player frame 固定在视口底部；Expanded 恢复原右栏 sticky grid。
- Dock 保留缩略图／媒体占位、当前来源、当前本地时间、Target 单行和“展开完整播放器”；Context Rail 以底部 action row 保留节点、Act、线索、原链入口。
- Docked 不复制 `[data-player-mount]`；切换前后 mount 数量保持 1，URL 不变。
- 页面 body 在 Docked 时增加底部安全区，最大滚动位置不让页脚落入 Dock 覆盖范围。

## Browser 矩阵

Browser 使用应用内 Browser、真实 preview 路由、固定 100% zoom；每次切换后检查 URL、mode、布局、console 和 overflow。

| 场景 | 结果 |
|---|---|
| 1366×768 People，默认模式 | `data-player-mode=docked`；frame `position: fixed`、高度约 `72px`、左右边界约 `23px`；aside `display: contents`；workspace 单列，`scrollWidth === clientWidth` |
| 1366×768 People，Docked → Expanded → Docked | URL 始终 `?view=people`；mount 数量 `1 → 1 → 1`；Expanded 恢复右栏 `808px + 372px`，Docked 恢复单列与底栏 |
| 1366×768 Timeline + `yt-042252-seigura-superchat` | Event 初始 Expanded；切 Docked 后 Target 仍为 `04:22:52`，Rail 可见，URL 与 Event 不变，document overflow 为 0 |
| 1440×900 Timeline | 默认 Expanded；aside `block`，frame `position: relative`，右栏恢复 |
| 1920×1080 Overview | 默认 Docked；frame 宽约 `1305px`，按内容壳左右对齐，document 无横向溢出 |
| 390×844 People | 强制 Expanded；mode toggle 隐藏；body 无 Docked class；workspace overflow `0` |
| 最大滚动位置 | body Docked bottom padding `124px`；按最大滚动计算，页脚底部约在 Dock top 上方 `35.9px`，不被固定栏覆盖 |
| per-view preference | People 保持 Docked；Timeline 单独切换为 Expanded 后返回 People，People 仍为 Docked |

## 自动门禁

```text
npm exec -- tsc --noEmit                 PASS
npm run build                            PASS
git diff --check                         PASS
```

完整 `npm run validate` 与 payload audit 在本批提交前复跑；其结果写入交接摘要。Astro build 使用 `ASTRO_TELEMETRY_DISABLED=1`，仅避免沙箱写入用户配置目录，不改变构建内容。

## 产品停点 A2

源码与 Browser 证据证明 Docked 已经是独立底部播放栏，但还不能自动产生 `PRODUCT-ACCEPTED`。人工需要重点确认：

1. 1366×768 People 是否真正释放了正文阅读宽度；
2. Dock 的 56–72px 视觉重量、Target 单行和四个 Rail 动作是否自然；
3. 1440×900 Timeline 在 Expanded 与 Docked 间切换是否足够明显；
4. 页脚、Search、Thread／Person dialog 和键盘焦点是否没有被 Dock 覆盖或截断。

未收到 A2 产品裁决前，不进入 C2、D2、B2 的产品收尾，也不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`。

## 未执行边界

- `NOT EXECUTED`：真实 YouTube 播放、真实音频、长时 soak、生产部署与 Cloudflare 环境复测；
- `NOT EXECUTED`：Docked 下已载入真实 iframe 后的连续播放长时稳定性；本批只验证同一 mount 不重建的静态／DOM 合同；
- `NOT EXECUTED`：A2 人工 `PRODUCT-ACCEPTED`。
