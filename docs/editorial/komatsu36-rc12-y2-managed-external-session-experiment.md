# Komatsu36 RC12-Y2 Managed External Session 实验指导

> 状态：`DESIGN ONLY — NOT AUTHORIZED FOR IMPLEMENTATION`
> 所属阶段：RC 0.12；前置批次：T1、Y1
> 当前分支：`codex/komatsu36-project-archive`
> Release Gate：`CLOSED`

本文把审阅中提出的“Folio 控制自己打开的 YouTube 页面”整理成可审查的实验合同。它不是 Y1 的实现说明，也不代表已经允许修改站点。没有用户明确授权前，任何 agent 不得因为看到本文件就实现 WindowProxy、删除 `noopener noreferrer`、改变 Timeline 点击路径或新增 playback target。

## 1. 实验目标

验证一个受限的 managed external session 是否能在 Chromium／Edge 中安全、可解释地工作：

1. 只有用户在 Folio 内直接点击“连接 YouTube 360°窗口”时，才由 Folio 创建或复用一个由自己命名的 browsing context；
2. Folio 只保存自己创建的 `WindowProxy`，不枚举、搜索或检测用户已有的任意 YouTube 标签页；
3. 后续 Timeline Event 点击只把该窗口导航到新的 canonical timestamp URL，不读取 YouTube DOM、URL、播放状态或 360°视角；
4. Folio 与外部窗口之间没有双向播放同步，站内 iframe 不得与外部页面同时发声；
5. 任何 popup、COOP、浏览器策略或 WindowProxy 异常都降级为普通 Y1 外链，不能为了保住联动而削弱安全默认。

## 2. 明确不做的事情

- 不扫描浏览器标签页，也不声称“检测到 YouTube”；
- 不接管用户手动打开的 YouTube 页面；
- 不调用原生 YouTube 页面内部的 `seekTo()`、`pauseVideo()` 或读取其播放进度；
- 不读取跨源 `window.location.href`、DOM、播放器状态或视角；
- 不把 session、播放目标或窗口状态写入 content schema、发布 JSON、URL 或 history；
- 不自动从已关闭的外部窗口回退到 embedded 并播放；
- 不为实验全站删除现有 `_blank` + `noopener noreferrer`；
- 不在移动端默认启用 popup/managed session；移动端必须继续使用 Y1 普通外链，除非另有独立产品裁决。

## 3. 运行时状态合同

状态只能存在于当前页面内存，不进入 URL 或内容数据：

```text
embedded
  └─ 用户点击连接
       ↓
connecting
  ├─ WindowProxy 有效 → external-youtube
  ├─ popup 被阻止 / 返回 null → y1-fallback
  └─ COOP 或策略切断引用 → y1-fallback

external-youtube
  ├─ Event 点击 → 站内状态照常更新 + 外部窗口 location.replace(timestamp)
  ├─ focus → 尝试 focus()，失败不阻断页面
  ├─ closed === true → external-closed（不自动播放站内 iframe）
  └─ 用户再次连接 → connecting

external-closed
  └─ 用户主动重新连接 → connecting
```

建议的 runtime-only playback target：`embedded | external-youtube`。它必须与现有 `activeTrackId`、Event、source-local clock 分离；选择 Event 时，external target 不能再触发 `seekTo()` + `playVideo()` 的 embedded 路径。

## 4. 受控打开路径

只有直接用户手势内允许尝试 managed path。推荐顺序：

1. 在点击处理器中先执行 Y1 合同：清除 `pendingSeekMs`、停止 playback sync、调用站内 `pauseVideo()`；
2. 使用固定且产品可识别的命名 browsing context 尝试打开 `about:blank`；
3. 在尚为同源的空白页阶段尽快切断不必要的 opener 关系，再写入 canonical YouTube URL；
4. 立即保存返回的 WindowProxy，并把状态显示为“连接中”，不得宣称已读取或确认 YouTube 页面内部状态；
5. 若 `window.open()` 返回 `null`、引用立即表现为 closed、导航被 COOP 切断或安全检查不通过，关闭 managed path，沿用 Y1 的普通 `_blank` + `noopener noreferrer` 外链。

这部分必须先用最小独立实验页验证，不能直接在 ProjectArchiveShell 内试错。任何 opener/COOP 处理都需要在 Chromium 与 Edge 中记录实际结果，不能只凭源码推断。

## 5. Event 导航合同

当 `playbackTarget === 'external-youtube'` 且 WindowProxy 仍未关闭时：

- 先按现有 Event selection 更新 Timeline、Target、Context、URL/history 合同；
- 生成与 Y1 相同的 canonical YouTube URL 和 `t=<seconds>s`；
- 仅调用持有的跨源 WindowProxy 的 `location.replace(url)`，必要时调用 `focus()`；
- 不调用 embedded `seekTo()` 或 `playVideo()`；
- `location.replace` 抛错或引用关闭时，显示“窗口未连接/已关闭，重新连接”，保持站内暂停，不自动播放。

SP1／SP2 仍只能打开各自 canonical X Space URL；不能因为存在 external target 就伪造 timestamp 或把 X Space 当作 YouTube session。

## 6. UI 文案与可访问性

首版只允许显式、可回退的状态：

- `播放目标：站内播放器`
- `连接 YouTube 360°窗口`
- `YouTube 360°窗口已连接`
- `YouTube 360°窗口已关闭；重新连接`
- `无法连接外部窗口，已使用普通 YouTube 外链`

不得出现“检测到 YouTube”“已接管标签页”“已同步播放器”等超出跨源能力的表述。连接状态必须有可读文本、键盘可达的重新连接动作和不依赖颜色的状态差异；红框／蓝框仍只是 QA 标注，不能成为产品色板。

## 7. 实验前置检查

在获得实现授权前，只做独立实验页或手工浏览器验证：

- Chromium 与 Edge，popup 允许与阻止各一轮；
- `window.open()` 返回值、`closed`、`focus()`、`location.replace()` 的跨源实际结果；
- YouTube 的 COOP／跨源导航是否切断 WindowProxy；
- 现有普通外链的 `_blank` + `noopener noreferrer` 不受影响；
- 关闭窗口、用户把窗口导航到其他站点、刷新 Folio、Back／Forward、重复点击连接；
- 失败时站内 iframe 保持 paused，不能出现双声道或意外自动播放；
- 390px 与触摸设备不启用 managed path，页面无 overflow；
- 控制台无未处理异常，所有结果记录为 `SOURCE-VERIFIED`、`BROWSER-VERIFIED` 或 `NOT EXECUTED`。

## 8. 实现授权后的最小文件面

只有产品明确授权 Y2 后，才允许另开独立批次，预计文件面如下：

- `src/components/project/ProjectArchiveShell.astro`：runtime target、WindowProxy 生命周期、Event 导航分支；
- `src/components/project/ArchivePlayer.astro`：显式 playback target 控件与降级文案；
- `src/styles/project.css`：状态控件、连接/关闭/降级状态，不改变现有档案色板；
- `scripts/validate-publication.mjs`：只添加稳定的 runtime markup 合同，不把 WindowProxy 行为伪装成静态通过；
- `docs/qa/komatsu36-rc12/y2/README.md`：实验矩阵、浏览器结果、失败降级和未执行边界。

不得在同一批修改 T1 Navigator、E Source-scoped Timeline、content schema、URL schema 或普通文章 YouTubeEmbed。

## 9. 接受、回滚与证据

Y2 只有同时满足以下条件才可进入产品复核：

1. 用户明确回复允许启动 Y2；
2. 独立实验页在 Chromium／Edge 完成 popup、COOP、关闭窗口、重复 Event 导航和失败降级矩阵；
3. 真实 Project route 验证 external target 不会触发 embedded seek/play，不产生双声道或横向溢出；
4. 普通 Y1 外链、`noopener noreferrer`、SP1／SP2 外部来源合同无回归；
5. 有 scoped commit、QA ledger、`NOT EXECUTED` 清单和独立产品停点。

任何一项失败都回滚 managed path，保留 Y1 普通外链作为唯一行为。Release Gate、merge、deploy 与真实长时媒体播放仍需另外授权。

## 10. 后续 agent 启动检查

1. 先读本文、RC12 总 runbook、T1/Y1 QA ledger 和当前 branch/HEAD/worktree；
2. 没有用户明确授权时，不新增 Y2 runtime code；
3. 如果获得授权，先提交独立实验页和威胁模型，再动 Project route；
4. 每批报告 source、browser、product 三种状态，不把窗口引用存在误报为“已连接”；
5. 保持 T1/Y1 产品停点、Release Gate CLOSED 与现有 git scoped-commit 纪律。
