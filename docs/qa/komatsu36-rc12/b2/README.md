# Komatsu36 RC 0.12-B2 QA

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；`PRODUCT-ACCEPTED` 待人工 A2/C2/D2/B2 停点
> 日期：2026-08-10
> 路由：`/projects/komatsu36/?view=timeline`
> 本地预览：`http://127.0.0.1:4322`
> 实施入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本批次补齐真实长文本的 reader-facing 全文入口：Act／章节标题、Timeline sticky current title、Media Source 平台／来源标题。既有 Player Target 与 Reading Context 的 `ResizeObserver`、真实 overflow、inline button、`aria-expanded`／`aria-controls` 机制继续保留，没有改成 tooltip-only 方案。

## 实现范围

- `ActSection.astro` 为每个 Act title 增加唯一 `data-inline-expandable` 与同 ID `aria-controls` 的展开按钮；短标题不显示按钮，超出两行时才 clamp 并提供「展开／收起」。
- `TimelineNavigator.astro` 的 sticky current title 采用同一机制；当前 Act 变更后由控制器重新测量，不把被截断标题写入唯一可读语义。
- `MediaSourceNavigator.astro` 的平台／来源标题增加同一按需入口；Source selection button 的完整 accessible name、`YT`／`SP1`／`SP2` 和事件数不删除。
- `ProjectArchiveShell.astro` 将新增节点接入既有 `ResizeObserver` 生命周期，并在 route/view/Act 更新时重新测量；`title` 只作为增强，不是全文唯一入口。

## Browser 验证矩阵

| 视口 / 场景 | 结果 |
|---|---|
| 1440×900 Timeline | 检测到 3 个 Source title、1 个 sticky current title、8 个 Act title；所有短标题真实 `overflow = false`，展开按钮保持 `hidden`，各按钮 `aria-expanded="false"` 且仍提供完整 `aria-label`；document overflow `0` |
| 390×844 Timeline | 8 个 Act title 在约 `343px` 内容宽度内保持两行以内；Timeline sticky navigator 按既有移动规则隐藏；Source title 按需节点仍存在但短标题按钮不显示；document overflow `0` |
| 真实溢出规则 | 代码只在 clamp 后 `scrollHeight > clientHeight + 1` 或 `scrollWidth > clientWidth + 1` 时显示 inline button；展开后移除 clamp、同步 `aria-expanded="true"`，再次点击可收起 |
| 220×780 Source title stress | YouTube Source title 自然触发按钮；点击后 `aria-expanded=true`、按钮变为「收起」、解除 clamp、高度约 `72px`；再次点击恢复 `aria-expanded=false`、按钮变为「展开」、clamp、高度约 `36px`；URL 不变、document overflow `0` |
| Existing player paths | Target／Reading Context 继续由原 `[data-player-text-toggle]` 处理；新增 `[data-inline-text-toggle]` 不改变 player target、context、source 或 URL 行为 |
| Console | 页面与 route 交互抽样 `error/warn = []` |

390px 是产品目标断点，当前 Act／Source 标题在该宽度下不触发按钮；此前 220×780 已真实验证 Source title 的「展开 → 收起」consumer interaction。补充的 240×780 真实路由压力样本已使 Act 02、Act 03、Act 05 自然触发展开按钮；Act 02 已验证「展开 → 收起」、`aria-expanded false → true → false`、clamp 恢复与 document overflow `0`。Timeline current title 在该样本中因播放器列宽为 `0` 未触发点击分支，仍保留 `TODO consumer-check`；压力视口只用于行为验证，不改变产品支持断点。

## 自动门禁

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
npm run build
git diff --check
```

本批次代码完成后，Astro build、publication validation、payload audit、TypeScript 和 diff check 均需在提交前复跑；Astro telemetry 受本机目录权限影响时使用 `ASTRO_TELEMETRY_DISABLED=1`，该环境问题不作为代码失败证据。

本次门禁结果：publication raw HTML `270,135` bytes；Gzip `47,664`；Brotli `30,087`；350 KiB hard gate 余量 `88,265`；publication、project、reader-copy、TypeScript、build、payload audit 和 diff check 均通过。

`validate:publication` 现在额外校验 RC12-B2 的静态发布契约：构建产物必须包含 3 个 Source title、1 个 Timeline current title、8 个 Act title，共 12 个唯一 expandable target；每个 target 恰有一个初始 `hidden`、`aria-expanded="false"` 且指向真实 `aria-controls` 的 inline toggle。该门禁只证明产物 wiring，不替代 220px Source title 或未来真实长 Act／Timeline title 的 Browser consumer-check。

## 产品停点

工程证据不自动升级为 `PRODUCT-ACCEPTED`。人工复核需要确认：

1. 超长 Act／章节标题出现时，读者能理解「展开」是全文入口，而不是被动 tooltip；
2. 展开后完整标题不会压坏 Timeline、Source card 或移动端底部安全区；
3. 短标题默认不增加额外按钮，信息密度仍保持克制；
4. Target、Context、Act title、Source title 的展开语言与收起行为一致。

## 未执行边界

- `NOT EXECUTED`：真实 YouTube 播放、真实音频、长时间 soak、生产部署和生产环境 origin 抽查。
- `NOT EXECUTED`：RC12-E Source-scoped Timeline；本批次不把 Source Event Index 伪报为多轨 Timeline。
