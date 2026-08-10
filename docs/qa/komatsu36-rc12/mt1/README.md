# Komatsu36 RC12-MT1 QA Ledger

> 当前状态：`SOURCE-VERIFIED + BROWSER-VERIFIED — PRODUCT REVIEW PENDING`
> 实施入口：`docs/editorial/komatsu36-rc12-mt1-mobile-timeline-runbook.md`
> 目标页面：`http://127.0.0.1:4322/projects/komatsu36/?view=timeline`

## 当前基线

实施前 390×844 真实页面测得移动 Act Navigator 为 `display:none`，普通 YT Event 卡高度约 210–334px，一屏通常只有约两条完整 Event。该数据只用于说明 MT1 的密度问题，不否定 RC11 当时的历史验收。

## 已执行矩阵

| 断点 | 必验内容 | 状态 |
|---|---|---|
| 360×800 | Locator 46px；8 项；Event 109–129px；76px rail；overflow 0 | `PASS` |
| 390×844 | 前四条普通 Event 约 438px；title 展开／收起；time seek；Bubble/Expanded 分流 | `PASS` |
| 414×896 | Locator 46px；8 项；跳转 Act 07 后 current Act 更新；overflow 0 | `PASS` |
| 1440×900 | 桌面 8 segment 可见；mobile locator hidden；110px 时间栏；overflow 0 | `PASS` |
| SP1 / SP2 mobile | scope 分别恢复；YT Locator hidden；Event 约 109px；overflow 0 | `PASS` |

## 执行命令与产物

```text
npm run validate                                      PASS
npx tsc --noEmit                                      PASS
npm run audit:payload -- komatsu36                    PASS
npm run verify:rc12:mt1 -- <external-output-dir>      PASS
git diff --check                                      PASS
```

Publication：126 个 Event reading trigger、8 个 mobile Act option、8 个 Act Event count；raw HTML `349,157 bytes`，Gzip `56,396`，Brotli `35,964`，350 KiB gate 剩余 `9,243 bytes`。

自动证据截图：`C:\Users\windm\.codex\visualizations\2026\08\09\019fe4e6-7482-73b2-b761-0d03d6e5571d\rc12-mt1\390x844-mobile-timeline.png`。

In-app Browser 另外复核了 390px Act chapter band、四至五条普通 Event 的实际扫读效果、八章目录、Act 07 跳转、SP1 hidden Locator、console `[]` 与桌面投影。自动 verifier 覆盖 title/detail 的第二次点击收起、显式 time seek/play 与三断点 console。

## 证据等级

- `SOURCE-VERIFIED`：组件、控制器、CSS 和静态发布门禁通过；
- `BROWSER-VERIFIED`：上述断点在真实构建路由完成交互、console 与 overflow；
- `PRODUCT REVIEW PENDING`：用户仍需判断章节带、密度、标题／摘要裁切和扫读节奏；
- `NOT EXECUTED`：真实 Android/iOS、真实媒体长时播放、生产部署与 Release Gate。
