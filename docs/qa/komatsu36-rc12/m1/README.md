# RC12-M1 Mobile Player Bubble QA

> 状态：`SOURCE + BUILD + BROWSER VERIFIED · REAL DEVICE NOT EXECUTED`
> 日期：2026-08-10
> 路由：`http://127.0.0.1:4322/projects/komatsu36/`

## 1. 已验证合同

| 合同 | 证据 |
|---|---|
| Mobile selected Event 默认 Bubble | 360×800、390×844、414×896 均为 fixed 56×56；Player panel `display:none`，正文 layout 无占位 |
| Mobile expanded floating panel | 视口分别为 326×200、356×200.25、380×213.75；不锁 body，overflow `0` |
| 收起合规暂停 | mock provider：`pauseVideo=1`、pending seek 清空、resume `4,783,250ms` |
| 恢复不 autoplay | 位置漂移时 seek 到 `4783.25s`；`playVideo=0` |
| 明确播放动作 | Timeline 时间按钮进入 expanded，seek `4723s`，`playVideo=1` |
| 普通选择 | Source Event Index 选择进入 Bubble；Back 恢复 track-only，Forward 恢复 Event Bubble |
| Modal | Person dialog 打开时 Bubble `visibility:hidden`，关闭后恢复 |
| External Source | SP1 Bubble 为 `SP1 ↗`；展开仍为 External Source，iframe `0` |
| Single mount | 所有状态 `.archive-player__mount = 1`，iframe 不超过 `1` |
| Desktop regression | 1440×900 保持 expanded ↔ docked；overflow `0` |
| Landscape | 844×390 Bubble 与展开均通过；面板不越过安全高度 |
| Console | 全部自动化路径 error/warn `[]` |

## 2. 重复命令

```text
node scripts/verify-komatsu36-rc12-m1-browser.mjs <optional-screenshot-dir>
```

`validate:publication` 同时固定：唯一 Bubble／唯一 mount、ARIA target、三态类型、safe-area、200px media minimum、暂停方法和 PLAYING-while-bubble 防线，并拒绝旧 sticky 59px／132×84 CSS。

## 3. 应用内 Browser

390×844 实际页面完成：页面身份、非空 DOM、无 framework overlay、console clean、Bubble → floating panel 交互和截图复核。视觉上 Bubble 位于右下；expanded panel 左右安全边距约 16px，媒体高度为 200px，正文仍可滚动。

## 4. 未执行边界

- Android Chrome 真实设备：`NOT EXECUTED`；
- iOS Safari 真实设备：`NOT EXECUTED`；
- 真实 YouTube 播放长时保持、旋转与 iframe lifecycle：`NOT EXECUTED`。

因此本批证明工程与桌面 Chromium 移动视口合同，不证明真实设备或 release acceptance。
