# RC12 Final Cleanup 产品复核包

> 目的：把 RC12 Final Cleanup 的人工产品停点固定为可重复的路径、预期状态和签名格式。
> 工程基线：`78d0430 docs(komatsu36): refresh cleanup baseline`
> 本地入口：`http://127.0.0.1:4322/projects/komatsu36/`
> Release Gate：`CLOSED`

这份文件不替代 Browser QA，也不把工程通过升级为 `PRODUCT-ACCEPTED`。它只定义下一步人工确认应检查什么；未确认前不得 merge、deploy、修改 `project.status` 或启动 Y2。

## A. P0 交互层级

### A1. Person → Thread 同层替换

1. 打开：`/projects/komatsu36/?view=people&person=muro-genki`。
2. 在 Person panel 中点击“相关事件线”里的 `空间技术地狱`。
3. 确认：
   - Person panel 隐藏，Thread panel 可见；
   - 页面只保留 `thread=space-technical-hell`，没有 `person=`；
   - Tab 仍被 Thread dialog 捕获；
   - Back 恢复 Person panel 与 `person=muro-genki`。
4. 签名：

```text
FINAL-CLEANUP：ACCEPT
```

### A2. YT Player Act Context removal

1. 打开：`/projects/komatsu36/?view=timeline&event=yt-012514-three-gift`。
2. 桌面与窄屏各检查一次 Expanded Player。
3. 确认 YT Timeline 不再出现重复 Act Context；Overview／Storylines／People／Transcript 只保留轻量 Timeline CTA。
4. 切到 `X Space ①`，打开 `sp1-000240-audio-finally-live`，确认 Player 仍显示“关联上下文”与相关事件线数量，且可进入 Storyline。

## B. P1 视觉降噪

### B1. 中文 taxonomy label token

旧版产品包中的中文结构级 kicker 与 `.archive-label-zh` 方案已被最终视觉收口批次 supersede：结构级 kicker 恢复英文 mono，读者语义 taxonomy 使用 `.archive-taxonomy` 小号衬线 token。参与方式、Thread category 与来源事件标签仍保持中文；时间、平台短码、Event count 和正文标题保持原有层级。

### B2. Media Sources disclosure

1. 打开：`/projects/komatsu36/?view=timeline&event=yt-012514-three-gift`。
2. 初始状态确认：摘要显示 `YouTube 主直播 + X Space ① / ②`，完整 source card 默认收起。
3. 点击摘要展开，确认三张 source card、时长、来源证明和 `浏览事件 →` 均存在。
4. 选择 `X Space ①` 的 `浏览事件 →`，确认：
   - Source Event Index 可见；
   - URL 为 `?view=timeline&track=space-1`；
   - 8 个 SP1 Event 可浏览；
   - 页面没有横向滚动。
5. 键盘：将焦点放在原生 `<summary>`，分别用 Enter 与 Space 展开／收起；确认焦点仍在 summary，展开前后没有布局跳动或 overflow。
6. 签名：

```text
FINAL-CLEANUP-P1：ACCEPT
```

## C. 仍独立存在的产品停点

以下项目不属于本批次自动关闭范围，必须分别确认：

| 项目 | 当前证据 | 人工决定 |
|---|---|---|
| RC12-T1.1 Navigator | 工程／Browser verified | `T1：ACCEPT` 或具体修正 |
| RC12-Y1 handoff | 工程／Browser verified；Y2 未授权 | 接受 Y1，不启动 Y2 |
| RC12-MT1 | 工程／Browser verified；真实设备未执行 | `MT1：ACCEPT` 或具体修正 |
| 真实 Android/iOS、真实媒体长时播放 | `NOT EXECUTED` | 另行授权 |
| Release Gate | `CLOSED` | 不得由本包自动开启 |

## D. 证据和边界

- P1 390px 与 240px 压力视口、Source browse、`?track=`、Source Event Index、console 与 overflow 已由 Browser QA 记录；B2 Act 02 在 240px 已完成“展开 → 收起” consumer-check。
- Timeline current title 在 240px 样本中因播放器列宽为 `0` 未自然触发展开分支，仍保留 `TODO consumer-check`；不得伪造长标题或把 Act 证据扩大为 Timeline current title 已覆盖。
- `npm run validate`、`npx tsc --noEmit`、`npm run audit:payload -- komatsu36` 与 `git diff --check` 是工程门禁，不等于产品签名。
