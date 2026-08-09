# Komatsu36 RC 0.12-F2 Final Regression Handoff

> 状态：`F2 SOURCE-VERIFIED` + `BROWSER-VERIFIED`；用户本地复核反馈“基本能接受”，允许继续收口
> 分支：`codex/komatsu36-project-archive`
> F2 实施基线：`828e563`
> 本地预览：`http://127.0.0.1:4322/projects/komatsu36/`
> Release Gate：`CLOSED`

本文是 RC12-A2/C2/D2/B2 完成后的 F2 回归交接，不回写 RC 0.11 acceptance，也不授权 merge、deploy 或修改 `project.status`。用户的“基本能接受”被记录为**允许继续 F2 的产品复核反馈**；它不等同于生产媒体、长时稳定性或 Release Gate 授权。

## 1. 批次状态

| 批次 | 源码 / Browser | 产品状态 | 证据 |
|---|---|---|---|
| RC12-A2 | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | 用户本地复核基本接受，进入 F2 | `docs/qa/komatsu36-rc12/a2/README.md` |
| RC12-C2 | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | 用户本地复核基本接受，进入 F2 | `docs/qa/komatsu36-rc12/c2/README.md` |
| RC12-D2 | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | 用户本地复核基本接受，进入 F2 | `docs/qa/komatsu36-rc12/d2/README.md` |
| RC12-B2 | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | 用户本地复核基本接受，Source title 已在 220px stress 完成展开／收起；Act／Timeline title 当前 fixture 仍是 `TODO consumer-check` | `docs/qa/komatsu36-rc12/b2/README.md` |
| RC12-E | `DEFERRED / NOT IMPLEMENTED` | P1 backlog，未纳入本轮 | Source-scoped Timeline 不得伪报完成 |

## 2. F2 Browser 回归矩阵

使用应用内 Browser、真实构建预览和 100% zoom：

| 场景 | 结果 |
|---|---|
| Overview 1440×900 | 三张 Source card 同行，约 `392px`；6 个复用平台图标；Source list 与 document overflow `0`；默认 Docked，Player column 为 `contents`，底部安全区约 `124px` |
| Overview Player mode | Docked → Expanded 后 URL 不变、单一 player mount 保持 `1`、Player column 恢复 `block`、body bottom padding 从 `124px` 恢复 `0px` |
| Source selection | 选择 SP2 后 URL 为 `?view=overview&track=space-2`；Source card 与 Player switcher 的 SP2 `aria-pressed="true"` 同步；播放器显示 external source 合同 |
| SP2 Source Event Index | 打开 `X Space ② · 事件索引`，显示 `12` 个事件按钮，不新增 View 或 route |
| Source Event deep link | 点击 `sp2-000003-finally-vertical` 后 URL 为 `?view=overview&event=sp2-000003-finally-vertical`；Player context 可见；Back 恢复 `track=space-2`，Forward 恢复 Event URL |
| People 1366×768 | Docked、Player column `contents`；People group 与 row 宽约 `1221px`；Cast desktop 显示 6 行；document overflow `0` |
| People 901×768 | Cast desktop `none`、medium role-row `block`、6 行；People group 宽／scrollWidth `782px`；document overflow `0` |
| People 390×844 | Docked mode 强制 Expanded、mode toggle 隐藏；Cast mobile 显示；document overflow `0`；Person dialog 打开后可见详情、焦点进 dialog、关闭后 body 解锁并恢复到 `小松昌平` 触发器 |
| Timeline 1440×900 | 8 Acts、104 Timeline events、8 段 Navigator；首个事件选择后 URL 写入 `event=yt-000100-stream-start`，Target 与 `ACT 01 · 开场与生日会准备` context 可见，Player Rail 可见，overflow `0` |
| Search | 输入 `小松` 得到 86 条公开结果；点击 SP1 Event 后恢复 `?view=storylines&event=sp1-000240-audio-finally-live&thread=space-technical-hell`，Player source 为 `X Space ①`，Storyline dialog 可打开／关闭，body lock 正确恢复 |
| Browser console | 页面 `dev.logs({levels: ['error','warn']})` 抽样为空。Browser 工具自身 Statsig dropped-events 警告不属于页面 console，不纳入产品错误证据 |

## 3. 自动门禁

F2 代码回归使用 `ASTRO_TELEMETRY_DISABLED=1`（仅规避本机 telemetry 配置目录权限）：

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
npm run build                            PASS
git diff --check                         PASS
```

最新 publication audit：raw `270,135` bytes；Gzip `47,664`；Brotli `30,087`；350 KiB hard gate 余量 `88,265`；158 个公开检索项、3 个 Source track list、124 个 controller Event record、0 个初始 Source Event button 和 private-marker gate 均通过。

本次 publication validator 同时通过 B2 静态 wiring：12 个 expandable title target（3 Source、1 Timeline current、8 Act）均唯一，并各自关联一个初始隐藏、`aria-expanded="false"`、`aria-controls` 指向真实 DOM id 的 inline toggle。此项只补强 `SOURCE-VERIFIED`，不替代 Act／Timeline 长标题的 Browser consumer-check。

## 4. 提交链与工作区

- `f19443b` — `feat(komatsu36): refine media source hierarchy`
- `f091eb7` — `feat(komatsu36): complete expandable title coverage`
- `828e563` — `docs(komatsu36): clarify b2 consumer check`

F2 handoff 文档本身将在本批次形成独立 scoped commit；提交后必须再次确认当前分支、HEAD、远端同步和 `git status --short` 清洁。

## 5. 保留边界

- `NOT EXECUTED`：真实 YouTube 播放、真实音频、X 外部回放、连续播放长 soak、生产 preview、Cloudflare Pages、merge、deploy、公开状态变更。
- `Source title consumer-check PASS`：220×780 压力断点自然触发 YouTube Source title 展开按钮，已验证展开／收起、ARIA、clamp、高度、URL 和 overflow；该断点仅用于行为验证，不改变产品支持断点。`TODO consumer-check` 仅保留给当前 fixture 未触发的 Act／Timeline title 点击分支。
- `DEFERRED / NOT IMPLEMENTED`：RC12-E Source-scoped Timeline；现有 Source Event Index、`?track=` 和 Source icon 不等于多轨 Timeline。

下一步只有两种合法方向：用户继续提供具体视觉修正，或在接受当前分支证据后另行授权 Release Gate。任何 agent 不得仅凭 F2 本地证据自动 merge、deploy 或改变 `project.status`。
