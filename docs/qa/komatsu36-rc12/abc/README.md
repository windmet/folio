# Komatsu36 RC 0.12 A/B/C QA

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED` 历史证据；产品复核已要求 A2/C2/B2 返工
> 日期：2026-08-09
> 路由：`/projects/komatsu36/`
> 本地预览：`http://127.0.0.1:4321`（dev）、`http://127.0.0.1:4322`（preview）

本目录记录 RC12-A（Adaptive Player）、RC12-B（Target / Context 按需展开）与 RC12-C（People / Cast layout normalization）的实现后证据。它不改写 RC 0.11 acceptance，也不授权 merge、deploy 或公开 Release Gate。

后续产品裁决不否认本页的工程测量，但否决了当前 Compact 和 People 桌面投影，并要求补齐文本覆盖。不得再从本页“无 overflow”推导 `PRODUCT-ACCEPTED`；执行入口改为 `docs/editorial/komatsu36-rc12-product-correction-runbook.md`。

## 实现摘要

- Player 只增加 Expanded / Compact presentation mode；mode 是内存与 per-view `sessionStorage` UI state，不写 URL、不重建 YouTube Player、不改变 Event / Track / seek。
- Player Rail 在 Player 可用宽度不足时投影为底部横排 action row；四个已验收入口、disabled 状态、目标反馈和原链语义保留。
- Target 与 Reading Context 默认最多两行；只有实际 overflow 才显示 `展开`，展开后使用 `aria-expanded=true` 与 `收起`，短文本不留空按钮。
- People 以 `.people-view` inline-size container 做响应式投影；窄桌面降为单列，移动端沿用现有 PersonCard / Cast projection，不以 `overflow-x: auto` 掩盖组件越界。
- PersonCard 稳定为 `IDENTITY | PRIMARY RELATION | METADATA | COUNT` 四个视觉槽位，缺失 metadata 仍保持对齐。

## 浏览器矩阵

Browser 使用应用内 Browser，固定 100% zoom，检查真实路由、console、document overflow 和关键组件 `scrollWidth <= clientWidth`。

| 视口 / 场景 | 证据 |
|---|---|
| 1366×768 People（选中 Event） | People grid `clientWidth=808 / scrollWidth=808`；PersonCard 起点一致；窄 Player Rail 为横排；document overflow `0` |
| 901px 内容列 | People grid / PersonCard `382 / 382`；Cast desktop `display:none`、mobile projection `display:block`；document overflow `0` |
| 390×844 People | People grid、PersonCard、Cast 无横向溢出；移动端既有导航合同保持；document overflow `0` |
| 1440×900 Timeline | 默认 Expanded；Navigator 与 Rail 未见回归；document overflow `0` |
| 1920×1080 Overview | 默认 Compact；Player 保持可用层级；document overflow `0` |
| 390×844 长 Target | `yt-042252-seigura-superchat` 两行截断；`展开` 仅在 overflow 时出现；点击后 `aria-expanded=true`、按钮为 `收起`，URL 不变 |
| 1366×768 短 Target / Context | `yt-000913-first-space-departure` 与短 Context 不显示空展开按钮 |

浏览器抽查结果：console error / warning 为 `0`；Event / Track / seek 在 mode 切换前后保持；播放器 DOM 未因 mode change 重建。

## 自动门禁

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
git diff --check                         PASS
```

RC12-A/B/C 后 publication audit：raw `261,812` bytes，Gzip `46,483`，Brotli `29,518`，350 KiB hard gate 余量 `96,588` bytes。初始 Source / Search buttons、controller coverage、公开检索项与隐私泄漏门禁均通过。

## 第一版人工停点结果（已被后续裁决取代）

本页原要求在本地真实页面确认以下产品取舍。2026-08-09 后续裁决已经给出：A 的当前 Compact 与 C 的桌面 People 投影不通过，B 的机制保留但覆盖不足。以下列表只保存当时检查范围，不再是待回答问题：

1. 1366×768 People 的单列卡片与 Compact Player 是否已经达到桌面阅读层级；
2. 1440×900 Timeline 的 Expanded Player 是否仍保留足够正文空间；
3. 390×844 的长 Target / Context 按需展开是否自然，且没有破坏 RC 0.11 移动导航合同；
4. Cast desktop / medium / mobile projection 是否应保持当前三档投影。

## 未执行边界

- `NOT EXECUTED`：真实 YouTube 播放稳定性、真实音频、长时 soak、生产部署与 Cloudflare 环境复测。
- `HISTORICAL`：本页生成时 RC12-D/E/F 与产品裁决尚未执行；随后 D 第一版与本地 F QA 已执行，产品裁决为返工，E 仍未实现。
- 不将本地 preview、静态 build 或 `noAudio` 浏览器抽查表述为 `release-accepted`。
