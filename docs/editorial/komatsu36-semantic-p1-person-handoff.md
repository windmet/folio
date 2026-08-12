# Komatsu36 Semantic P1 Person Metadata Handoff

> 状态：`P1 STEPS 5–7 · SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：`docs/komatsu36_semantic_patch_20260810.md` 第 5、18、19 节
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体或后续 P1 扩面

## 1. 本批边界

本批只完成 semantic patch 实施顺序中的 P1 第 5–7 项：清洗人物 aliases、加入 `トシピ`、把读者标签改为“本场常用称呼”。第 8 项“室账号的显示身份”、清典公开 offer、公告扩写、Thread 故事化、UI taxonomy reader-language pass 与内部 ID 迁移均未混入本批。

P0 的 Amazon／濱与汐谷读音合同继续有效；旧分析 MD、RAW、source-set manifest、Person slug 和 Event ID 均未回写或迁移。

## 2. 数据合同

旧 `aliases: string[]` 被拆为两层：

- `callNames: string[]`：可在 Person panel 向读者展示的真实昵称、名字简称或本场有识别价值的称呼；
- `searchAliases: string[]`：只为检索兼容服务，不在 Person panel 展示；当前 18 人均显式写为空数组；
- 正式姓名与 reading 继续进入检索；`さん／くん／君／ちゃん` 由查询归一化兼容，不再人工复制进人物数据。

当前 18 人 `callNames` 真值清单：

| Person | `callNames` |
|---|---|
| 小松昌平 | `コマッチ` |
| 濱健人 | `濱ちゃん`, `ハマ` |
| 寺島惇太 | `惇太` |
| 汐谷文康 | `ふーみん` |
| 堀金蒼平 | `蒼平` |
| 光富崇雄 | `タカオ` |
| 熊谷俊輝 | `トシピ` |
| 佐藤祐吾 | `祐吾` |
| 仲村宗悟 | `宗悟` |
| 内田修一 | `修` |
| 其余 8 人 | `[]` |

已删除的 10 条敬称型数据为：`狩野さん`、`井上君`、`矢野さん`、`光富さん`、`熊谷君`、`伊藤さん`、`観世君`、`むろさん`、`清典さん`、`山本さん`。

2026-08-10 证据覆盖：`タカオ` 的待核状态已经关闭，并作为光富崇雄的 `callNames` 发布。它是直接用名字“崇雄（たかお）”称呼本人的 call name，不与 `ふーみん` 一类固定昵称混为一谈。闭环依据为 4/14 既有音形线索、4/25 独立高精度听写连续识别、同刻 Chat 的“光富さん”响应，以及本人姓名读音／公开账号。RAW 保持原样；`光富さん` 仍只是姓＋敬称，不进入人物数据。`じゅんちゃん` 继续待核。

## 3. 展示与搜索行为

- `PersonPopover` 只消费 `callNames`；非空时显示“本场常用称呼”，为空时整行不渲染；
- 公开 Search JSON 同时消费正式姓名、reading、`callNames` 和隐藏的 `searchAliases`；
- 查询与索引使用同一个 `normalizeProjectSearchText()`：NFKC、日语小写、去除查询词末尾敬称、合并空格；
- 因此 `熊谷君`、`狩野さん`、`伊藤さん`、`井上君` 仍能搜索到正式 Person，但这些字符串不再作为人物别名发布；
- `濱ちゃん` 仍显示为真实常用称呼，同时查询归一化后可命中濱健人；
- `タカオ` 显示为光富崇雄的本场常用称呼，并可直接检索到其 Person；
- 本批不改 Person slug；例如汐谷内部 ID 仍是 `shioya-fumiyasu`。

## 4. 防回归门禁

`validate:projects` 现在拒绝：

- 任意 legacy `aliases` 字段；
- 未显式写出 `callNames` 或 `searchAliases` 的 Person；
- 两层之间的重复值；
- 以 `さん／くん／君` 结尾的人工作弊式 alias。

`validate:publication` 另外固定 18 人完整 `callNames` ledger，要求当前 `searchAliases` 全部为空，并验证：

- 页面存在“本场常用称呼”、不存在“本场别名”；
- 10 条已删除敬称不重新进入发布 HTML / Search JSON；
- `トシピ` 与 `タカオ` 同时进入展示与检索；
- P0 事实与当前 160 项公开索引合同无回归。

## 5. 验证证据

自动门禁：

```text
npm run validate:projects          PASS — 1 project
npm run validate:reader-copy       PASS — 56 candidates / 56 decisions
npm run validate                   PASS — Astro build + publication
npm exec -- tsc --noEmit           PASS
npm run validate:sources -- --root <authoritative-root>
                                     PASS — 6 files
```

真实页面消费端流程：

```text
http://127.0.0.1:4322/projects/komatsu36/?view=people&person=kumagai-toshiki
人物 deep link → “本场常用称呼 / トシピ” → 关闭面板
→ 搜索“熊谷君” → 打开熊谷俊輝 Person 结果 → 面板恢复
```

内置 Browser 完成页面身份、非空页面、无框架错误层、交互与 console 检查；固定视口 verifier 另外覆盖：

- 1440×900 与 390×844：熊谷 panel 正确，document overflow 均为 `0`，console error/warn 均为空；
- 狩野 panel 不显示空的称呼行；
- `熊谷君 / 狩野さん / 伊藤さん / 井上君 / トシピ / タカオ / 濱ちゃん` 均能命中目标 Person；
- 截图保存在仓库外的 Codex visualization 目录，不进入 Git。

可重复验证器：

```text
node scripts/verify-komatsu36-semantic-p1-person-browser.mjs <optional-screenshot-dir>
```

## 6. 后续状态

Semantic P1 第 8 项随后已由 `komatsu36-semantic-p1-account-handoff.md` 独立完成：Event 使用 `account-context` 关系显示“室元気账号”，北海道人物节点继续显示“室元気”。本文件仍只证明第 5–7 项；下一批从清典公开 offer、11 月 15 日公告解释与台本形式原则降级开始，不得提前混入 11 条 Thread 与 8 个 UI 组件的全量 reader-language pass。
