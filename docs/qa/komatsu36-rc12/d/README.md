# Komatsu36 RC 0.12-D QA

> 状态：`SOURCE-VERIFIED` + `BROWSER-VERIFIED`；人工停点 1/2 尚未 `PRODUCT-ACCEPTED`
> 日期：2026-08-09
> 路由：`/projects/komatsu36/`
> 本地预览：`http://127.0.0.1:4322`

RC12-D 只增加来源平台的站内 monochrome SVG pictogram，不改变 Track、Event、Source Event Index、播放能力、URL 或外链合同。它作为独立 P1 技术批次记录；即使图标已实现，也不替代人工停点 1 对 Player / People 层级的产品裁决。

## 实现范围

- 新增 `MediaPlatformIcon.astro`，受限枚举为 `youtube | x-space`。
- YouTube 使用几何播放窗；X Space 使用圆形声场／mic 线稿，不复刻官方彩色 Logo。
- 图标同时出现在常驻 `MediaSourceNavigator` 来源卡与 `ArchivePlayer` Source Switcher。
- SVG `aria-hidden="true"`，完整平台名称、来源状态、时长、事件数与动作文字继续可见；关闭 CSS / SVG 后仍可完成来源理解与操作。
- 没有新增 provider、外链、媒体请求或 URL 参数。

## 浏览器证据

应用内 Browser，100% zoom：

| 场景 | 结果 |
|---|---|
| 1440×900 Overview | 3 张来源卡各有平台图标；Source Switcher 3 个按钮各有图标；document overflow `0` |
| 390×844 Overview | 来源卡纵向堆叠；每张 `clientWidth=333 / scrollWidth=333`；document overflow `0`；6 个图标均渲染 |
| Source selection | 点击 `X Space ①` 后 URL 为 `?view=overview&track=space-1`；来源卡与 Player Switcher 均保持 `aria-pressed=true`；播放器标题为 `X Space ①` |
| 文本降级 | 来源按钮仍包含 `YouTube 主直播`、`X Space ①`、`X Space ②` 等完整文本；图标不是唯一识别方式 |

## 自动门禁

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
git diff --check                         PASS
```

本批 publication audit：raw `263,348` bytes，Gzip `47,019`，Brotli `29,781`，350 KiB hard gate 余量 `95,052` bytes；158 个公开检索项、3 个 Source track list、controller coverage 与 private marker gate 通过。

## 未执行边界

- `NOT EXECUTED`：生产部署、真实 YouTube 播放、真实音频、长时 soak。
- `NOT EXECUTED`：人工停点 1 对 Player / People 取舍的产品接受，以及人工停点 2 对 D 是否足够、E 是否进入 v1 的裁决。
- RC12-E Source-scoped Timeline 未实现；没有把来源图标批次误报为多轨时间线完成。
