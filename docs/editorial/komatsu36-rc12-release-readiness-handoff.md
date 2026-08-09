# Komatsu36 RC 0.12 Release-readiness handoff

> 状态：LOCAL QA COMPLETE — `PRODUCT-ACCEPTED` 待人工停点 1/2
> 分支：`codex/komatsu36-project-archive`
> 交接快照基线：`22301ca`（后续文档同步提交不改变实现范围）
> Release Gate：CLOSED；本文不授权 merge、deploy 或修改 `project.status`

本 handoff 记录 RC12-A/B/C/D 与 RC12-F 本地复核结果。它是 review branch 的交接草案，不把本地 preview、静态门禁或短时交互提升为生产接受。

## 1. 已实现批次

| 批次 | 状态 | 证据 |
|---|---|---|
| RC12-A | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | Adaptive Player、per-view mode preference、responsive Rail；移动端强制 Expanded 并隐藏 mode toggle |
| RC12-B | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | Target / Reading Context 实际 overflow 才显示展开；ARIA、inline expansion、ResizeObserver |
| RC12-C | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | People container projection、PersonCard 四槽位、Cast medium/mobile fallback |
| RC12-D | `SOURCE-VERIFIED` + `BROWSER-VERIFIED` | `MediaPlatformIcon.astro`；来源卡与 Player Source Switcher 的 YouTube / X Space 线稿图标 |
| RC12-E | `DEFERRED BY DEFAULT`（待人工停点 2 最终记录） | 未实现 Source-scoped Timeline；不伪报多轨 Timeline |
| RC12-F | 本地 QA 完成 | 本文矩阵与自动门禁；产品接受、真实媒体和生产仍未完成 |

## 2. 当前提交链

- `cdc9aab` — Adaptive Player modes；
- `90e79b0` — Target / Context expandable text 与 People / Cast normalization；
- `931b9ad` — source platform pictograms 与 D QA；
- `864658a` — 修正移动端 mode toggle 必须隐藏的 RC12-A 缺口。
- `bb23d83` — RC12-F 本地 QA 与 release-readiness handoff 草案。
- `22301ca` — 补充 focus restore、modal containment 与 Event history 证据。
- `fdf50b2` — 同步 handoff 快照基线与提交链。

工作树已清洁，分支已推送远端。

## 3. 自动门禁

```text
npm run validate                         PASS
npm run audit:payload -- komatsu36       PASS
npm exec -- tsc --noEmit                 PASS
git diff --check                         PASS
```

当前 publication audit：raw `263,348` bytes、Gzip `47,020`、Brotli `29,783`；350 KiB hard gate 余量 `95,052` bytes；158 个公开检索项、3 个 Source track list、124 个 controller Event record 与 private marker gate 通过。

## 4. RC12-F 浏览器证据

应用内 Browser，构建预览 `http://127.0.0.1:4322/projects/komatsu36/`，100% zoom：

| 场景 | 结果 |
|---|---|
| Overview 1440×900 | Compact；6 个平台图标（来源卡 3 + Player 3）；source card 无组件溢出；document overflow `0` |
| Timeline 长 Event 1366×768 | 初始可切换 Compact / Expanded；mode 切换后 Event、Track、target 文本和 URL 保持；document overflow `0` |
| People 901×768 | People / Cast 窄内容列无横向溢出；document overflow `0` |
| Overview 390×844 | 强制 Expanded；mode toggle `hidden=true`；来源卡纵向堆叠；document overflow `0` |
| 长 Target 390×844 | “展开”可见；点击后 `aria-expanded=true`、按钮变“收起”、URL 不变；document overflow `0` |
| Source selector | `X Space ①` 选择后 `?track=space-1`；Source card 与 Player switcher 同步 active；Back 恢复 YouTube 来源 |
| Thread / Person | 打开后 dialog 获得焦点、背景锁定；Escape 关闭并解除锁定；焦点精确回到原触发按钮 |
| Search | 输入 `Bingo` 得到 13 条公开结果；无错误态；document overflow `0` |
| Event history | 从 Timeline Event 切到 People 后 Back 恢复 Timeline、原 Event、active card 与深链 URL；document overflow `0` |
| 应用 console | Browser dev logs 为空；未发现 page error / warning |

文字与 ARIA 降级核验：来源按钮 accessible label 为 `选择YouTube 主直播`、`选择X Space ①`、`选择X Space ②`；播放器 Source Switcher 保留 `YT` / `SP1` / `SP2` 文本；Target / Context 两个展开按钮的 `aria-controls` 均解析到唯一目标 ID，页面无重复 ID。Browser 评估 DOM 为只读，因此未把临时禁用 CSS 伪报成执行过的测试。

追加压力矩阵覆盖 320、360、375、390、414、540、600、768、820、900、901、1024、1100、1200、1280、1366、1440、1600、1920px：People grid、PersonCard、Cast projection、来源卡与 Player 均无组件溢出，document overflow 全部为 `0`。

A/B/C 与 D 的独立批次证据分别见：

- `docs/qa/komatsu36-rc12/abc/README.md`；
- `docs/qa/komatsu36-rc12/d/README.md`。

## 5. 人工停点

### 人工停点 1：Player / People 产品接受

用户需要确认 1366×768 People 单列卡片、Timeline Expanded / Compact 层级、390px 长文本按需展开是否达到预期。源码和 Browser 证据不能自动产生 `PRODUCT-ACCEPTED`。

### 人工停点 2：D / E 裁决

当前建议保留 RC12-D 的线稿图标，并将 RC12-E 记为 `DEFERRED TO V1.1`；只有用户明确提升 Source-scoped Timeline 优先级时，才重新打开 E 批次。该建议仍待用户确认。

## 6. 未执行边界

- `NOT EXECUTED`：真实 YouTube 播放、真实音频、长时 soak、播放器连续播放稳定性；
- `NOT EXECUTED`：生产 preview、Cloudflare Pages、merge、deploy、公开状态变更；
- `NOT EXECUTED`：人工停点 1/2 的 `PRODUCT-ACCEPTED`；
- `NOT EXECUTED`：RC12-E Source-scoped Timeline。

只有人工停点记录完成、required 批次与 RC12-F 交接均确认后，才能把 RC 0.12 标记为 `REVIEW BRANCH ACCEPTANCE COMPLETE`；Release Gate 仍需用户另行授权。
