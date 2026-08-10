# Komatsu36 RC12-MT1 — Mobile Timeline Density & Act Hierarchy

> 状态：`SOURCE-VERIFIED + BROWSER-VERIFIED — PRODUCT REVIEW PENDING`
> 日期：2026-08-10
> 权威来源：本轮移动 Timeline 产品审阅；RC12-M1 Mobile Player Bubble 是已冻结前置
> QA 账本：`docs/qa/komatsu36-rc12/mt1/README.md`

## 1. 为什么重新打开移动 Timeline

RC 0.11 曾拒绝在手机上增加章节导航，当时的前提是完整播放器长期 sticky，额外导航会继续挤压阅读区。RC12-M1 已把移动播放器改成可折叠 Bubble，这个前提不再成立。旧裁决不被删除，但其“移动端不得有 Act 导航”的投影由 MT1 在新前提下覆盖。

当前手机 Timeline 仍把桌面 Event 卡纵向堆叠：时间、标题、摘要、人物与事件线全部常驻，390×844 一屏通常只能看到约两条 Event。MT1 的目标是恢复档案目录的扫读节奏，不是删除叙事内容，也不是为了 payload 大小缩水功能。

## 2. 冻结边界

- 桌面 8-Act duration-ratio Navigator、Axx-only 窄段和 hover/focus tooltip 冻结；
- RC12-M1 Player Bubble、Expanded Player、单媒体 mount 与 YouTube handoff 冻结；
- Event/Act/Track 数据、三来源 native clock、URL schema 与现有 current-Act 计算逻辑冻结；
- SP1/SP2 不引入伪 Act，也不显示 YT Act Locator；
- 不以字号过小、隐藏标题或只保留时间戳换取密度。

## 3. 产品合同

1. YT scope 在 `<=900px` 显示单行 Act Locator；不恢复桌面八段条。
2. Locator 显示当前 `ACT xx / 08`、标题和时间范围，展开后提供八章目录。
3. 目录项复用 `navigateToAct()`；滚动时复用现有 current-Act 计算更新 Locator。
4. Locator 支持 button、`aria-expanded`、`aria-current=step`、Escape、外部点击关闭和选择后关闭。
5. `<=600px` Event 使用约 76px 时间轨＋正文的双栏行；时间 `▶` 保持 seek／展开 Player 语义。
6. Event 默认保留标题与摘要，各最多约两行；不得退化成纯日志。
7. 点击标题是选择／阅读：展开当前 Event 的全文、注释、并行提示和事件线，不直接播放媒体；移动 Player 进入 Bubble。
8. 当前 Event 的标题与摘要显示全文，`aria-expanded` 与视觉 `＋/−` 同步。
9. Act header 改成章节带，明确显示 Act、总 Act、时间范围、标题、两行短摘要与 Event 数量。
10. SP1/SP2 继续使用自身 source-local Timeline；不得显示 Act Locator。
11. 390×844 应能稳定扫读约 3–5 条普通 Event，且正文不低于可读尺寸。
12. 红框／蓝框仅是审阅标注，不进入产品色彩；继续使用现有纸张、墨色和档案红。

## 4. 实现批次

- `MT1-A`：移动 Act Locator 与八章目录；
- `MT1-B`：Act chapter band 与 Event 两栏紧凑投影；
- `MT1-C`：Event title/detail 与 time/seek 语义分离；
- `MT1-D`：360×800、390×844、414×896、1440×900 Browser QA 与静态门禁；
- `MT1-E`：人工产品停点。工程验证不得自动升级为 `PRODUCT-ACCEPTED`。

## 5. 验收边界

必须验证 YT Locator 显示／目录八项／滚动 current Act／跳章、普通 Event 密度、标题展开、时间 seek、Bubble/Expanded 分流、SP1/SP2 无 Locator、横向 overflow、console 和桌面 T1 回归。真实 Android/iOS、真实 YouTube 长时播放、merge、deploy 与 Release Gate 均保持 `NOT EXECUTED / CLOSED`，除非用户另行授权。

## 6. 实施结果

MT1-A–D 已完成。自动 Browser 在 360×800、390×844、414×896 测得 Locator 高度 46px、八个目录项、普通 Event 高度约 109–129px、前四条合计低于 560px且横向 overflow 为 0；标题选择进入 Bubble 并展开／再次收起阅读详情，时间轨保持 Expanded＋seek/play。SP1/SP2 的 Locator 祖先为 hidden，Event 同样保持紧凑双栏；1440×900 仍显示八个桌面 T1 segment 与 110px 时间栏。

构建后公开 HTML 为 349,157 bytes，仍低于 350 KiB hard gate；该门禁只记录发布约束，不是削减功能的产品依据。截图与完整数字见 QA 账本。

`Takao Mitsutomi` 的英文检索别名是独立语义补项，不混入 MT1 视觉提交；`タカオ` 人物称呼裁决仍按已完成语义批次生效。
