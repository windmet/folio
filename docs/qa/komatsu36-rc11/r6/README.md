# RC 0.11 R6 QA — Mobile navigator decision gate

> 状态：已裁决；R7 不需要代码实现
> 路由：`/projects/komatsu36/?view=timeline`
> 视口：390×844，100% zoom，build preview

## 固定基线

R5 build 后的 publication 仍为 raw `261,080`、Gzip `46,163`、Brotli `29,420`，raw hard gate 余量 `97,320`；`npm run validate`、`npm exec -- tsc --noEmit` 与 `git diff --check` 在 R5 已通过。

## 三案对照

| 方案 | 实测/推断影响 | 决策 |
|---|---|---|
| 非 sticky 章节下拉 | 不新增常驻遮挡，但重复表达 Timeline 定位；现有 Act heading 与完整事件卡已可顺序阅读 | 不采纳，收益不足 |
| 合并进 mini-player | 需要把阅读位置状态塞进播放器上下文，混淆 Reading Position 与 Media Position；外部 Space 也没有同等播放头 | 不采纳，职责不清 |
| Player 未激活时 sticky、激活后收起 | 状态切换复杂，且未激活时仍会占用阅读高度 | 不采纳，复杂度高 |

## 真实 preview 证据

- 未选中 Event：Project Nav 高约 `58.9px`；完整 Player 约 `382.5px`，Navigator `display:none`；页面 overflow `0`。
- 选中 Event `yt-000100-stream-start`：mini-player sticky top 约 `59px`，高度约 `214.4px`，底部约 `273.4px`；Project Nav 与 mini-player 已共同占据首屏固定层级，继续叠加 36–42px Act bar 会进一步遮挡 Act heading 与事件内容。
- 选中状态下 Act header 仍由既有 Event context jump 定位；未选中状态按原 Timeline 顺序阅读。R5 Navigator 仅在 `>900px` 显示，390px 不产生第三条 sticky bar；页面 overflow `0`。
- `tabP1.dev.logs()` 返回 `[]`。

## R6 裁决

**`NO ADDITIONAL MOBILE NAV FOR V1`**。R7 标记 `NOT REQUIRED`，不创建空组件、不把 Desktop Navigator 压缩后叠加到手机。保留 Project Nav、既有 mini-player、Act heading 与 Event context jump；若未来重新提出移动导航，必须另开规格并重新测量首屏可见阅读区域。

真实音频、长时播放、生产部署与 Release Gate 仍为 `NOT EXECUTED`。
