# Komatsu36 RC 0.12-D2 QA

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；`PRODUCT-ACCEPTED` 待人工 D2 停点
> 日期：2026-08-10
> 路由：`/projects/komatsu36/?view=overview`
> 本地预览：`http://127.0.0.1:4322`
> 实施入口：`docs/editorial/komatsu36-rc12-product-correction-runbook.md`

本批次只处理 Media Source 的平台识别、信息层级和来源图标，不改变 Track 数据、Source Event Index、canonical Space URL、external 播放边界或 Source-scoped Timeline 的 backlog 状态。

## 实现范围

- `MediaPlatformIcon.astro` 保留 YouTube 几何播放窗，并将 X Space 图标重绘为单色圆形声场／radiowave 图形；两种平台共用相同的 SVG、stroke weight、光学尺寸和 `aria-hidden="true"` 合同。
- `MediaSourceNavigator.astro` 将每张卡固定分成三层：平台身份（图标、`YT`／`SP1`／`SP2`、完整平台名、事件数）、次要状态（`INLINE PLAYBACK`／`EXTERNAL SOURCE`、时长、`VIDEO`、YouTube 的 `360°`）和动作（站内播放／打开原来源／浏览事件）。
- Source card 与 Player Source Switcher 继续复用同一 `MediaPlatformIcon` 组件；完整平台文字仍是 accessible name，图标不承担唯一语义。
- Source selection、`?track=`、Event 优先、手动选源清除旧 Event／target、Source Event Index 与 external CTA 均未改合同。

## Browser 验证矩阵

| 视口 / 场景 | 结果 |
|---|---|
| 1366×768 Overview | 三张 Source card 同行；宽度约 `388.6px`；Source list `clientWidth = scrollWidth = 1166px`；组件和 document 横向 overflow 均为 `0`；共 6 个平台图标（Source card 3 + Player switcher 3）；动作文案保留站内播放／打开原来源／浏览事件 |
| 390×844 Overview | 三张 Source card 纵向排列；每张约 `334.3px × 93.8px`；Source list 与 document overflow 均为 `0`；三张卡仍常驻可见，共 6 个复用图标；状态文字为低对比度次要层级，元数据不挤占平台身份 |
| 390×844 选择 SP1 | 点击 `选择X Space ①` 后 URL 为 `?view=overview&track=space-1`；Source card 与 Player Source Switcher 对应按钮 `aria-pressed="true"`；播放器显示 `CURRENT SOURCE X Space ①` 与 external replay 说明 |
| SP1 Source Event Index | 点击 `data-source-browse="space-1"` 后打开 Source Event Index；索引显示 `X Space ① · 事件索引` 和 8 个事件按钮；未新增 View 或 route |
| Console | 上述页面与交互抽样 `error/warn = []` |

## 自动门禁

本批次提交前执行：

```text
npm run validate
npm run audit:payload -- komatsu36
npm exec -- tsc --noEmit
npm run build
git diff --check
```

`npm run build` 已在 D2 代码完成后通过；完整 `npm run validate`、payload audit、TypeScript 和 diff check 在提交前复跑并记录于交接提交中。

## D2 产品停点

工程和 Browser 证据不自动升级为 `PRODUCT-ACCEPTED`。人工复核需要确认：

1. 1440／1366 桌面首眼是否按「平台身份 → 状态／时长 → 动作」顺序理解；
2. X Space 声场图标是否脱离具象麦克风含义，同时仍能与 YouTube 区分；
3. 390px 纵向卡片是否保持可扫读，且没有因状态和动作层级造成拥挤；
4. Source card 与 Player switcher 的复用图标是否形成一致语言。

## 未执行边界

- `NOT EXECUTED`：真实 YouTube 播放、真实音频、X 外部回放、长时间 soak、生产部署和生产环境 origin 抽查。
- `NOT EXECUTED`：RC12-B2 的 Act title／Source 长标题完整展开覆盖。
- `NOT EXECUTED`：RC12-E Source-scoped Timeline；本批次只保留现有 Source Event Index，不把它伪报为多轨 Timeline。
