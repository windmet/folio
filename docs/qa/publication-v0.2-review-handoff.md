# 前情帖 Publication v0.2 · Review Handoff

> 核对日期：2026-08-14
> review branch：`codex/publication-metadata-v2`
> review HEAD：`fc866f32ca610c09942a7bad7fdef9e60b34f187`
> base：`origin/main@09cb5cc35f829a09d4562c4b74cf66f0acb0c137`

这份 handoff 用于审阅当前 Publication Architecture，而不是授权 merge、deploy 或开放 robots。当前 branch 没有 PR；相对 `origin/main` 为 184 commits、528 files、约 90,740 insertions，因此不建议把 GitHub 的整包 Files changed 当成唯一审阅入口。

## Phase completion matrix

| Phase | 状态 | 直接证据 |
| --- | --- | --- |
| PUB-02A · 三项目基线 | ENGINEERING VERIFIED | `9ad78ea`；`validate:regressions` 覆盖 Komatsu36、3/09、4/25 |
| PUB-02B · Publication metadata | COMPLETE | `b2adf78`；显式 Project publication / Post section；`verify:home-projection` |
| PER-02A · Global People | COMPLETE | `40639ad`、`dc5e5c7`、`934b8d5`；24 People、42 Project Context；伊藤三项目 fixture |
| PUB-02C · Homepage v2 | COMPLETE | `8fe0422`、`33a4701`、`dc5e5c7`；桌面与 390px Browser QA |
| CTX-02A · Project ↔ Person | COMPLETE | Project Person card → Global Person；Global Person → Project Event anchors；`verify:person-closure` |
| PUB-02D · Brand / metadata | ENGINEERING COMPLETE · LAUNCH PENDING | `b4eb2bb`；前情帖 title / canonical / OG / favicon / About / correction；robots 仍关闭 |
| COR-02A · Global search | COMPLETE | 232 items / 5 public kinds；Work / Context 保持 Project-local；`verify:global-search` |
| REL-02A · Candidate log | COMPLETE WITH BOUNDARY | 5 个 `needs-human-review` candidate；无 graph / score / reader consumer；`verify:relationship-log` |
| DOC-P0 | COMPLETE | `3c5dbd7`；当前 README + Komatsu36 history archive；`verify:documentation` |

Index chronology 是三项目验证后的追加收口：`7fdf4aa` 让 People 与 Index 消费同一 Chronology Rail；它没有扩展 schema，也没有改变 Project Reader。

## 推荐审阅顺序

1. 首页 `/`：Cover → Archives → People → Index → publication-date tail。
2. 伊藤友紘 `/people/ito-tomohiro/`：三项目 chronology、排序、1–3 直显与 4–20 折叠。
3. 小松昌平 `/people/komatsu-shohei/`：81 节点不会复制到人物页，回到完整 Project Timeline。
4. `/indexes/ore-shiri/`：跨年份 Index chronology 与新旧排序。
5. `/search/`：Project / Event / Person / Index / Post；Work / Context 不 globalize。
6. 三个 Project route：确认 Homepage / Global People 改造没有改变各自 Reader 行为。
7. `/about/` 与页面 metadata：确认 publication identity、来源、编辑、纠错与权利边界。

## 验证入口

```sh
npm ci
npm run validate
npm exec -- tsc --noEmit
npm run audit:payload -- komatsu36
```

最近成功的完整 CI：[`Validate archive site` #31798827351](https://github.com/windmet/folio/actions/runs/31798827351)，对应 `fc866f3`。

## Payload 注意事项

当前 `dist/projects/komatsu36/index.html`：

- raw：388,302 bytes
- gate：389,120 bytes（380 KiB）
- remaining：818 bytes
- gzip level 9：64,106 bytes
- brotli quality 11：39,244 bytes

这不是当前失败项，但余量已经很小。Homepage、People、Index 或文档工作不应顺手修改 `ProjectArchiveShell` 或向 Komatsu36 HTML 注入站级数据；任何后续 Project UI 修改都必须重新运行 payload audit。

## 已取得的本地证据

- `npm run validate` 与 TypeScript check 通过。
- 首页完成 1440×900、1920×1080、1280×720 与 390×844 的分批 Browser QA。
- People / Index chronology 完成 1280×720 与 390×844 的排序、折叠、focus-visible 与 overflow 检查。
- mobile 首页关闭 scroll snap；`#people` / `#indexes` deep link 停在 sticky header 下方。
- 四份本地 authoring / workflow 材料未纳入本分支提交。

## 仍需独立授权或外部环境的 Gate

- 是否创建 Draft PR，以及以何种 review / merge 策略处理 184-commit 大分支。
- 内容公开权与 production deployment 意图。
- Cloudflare authenticated preview / production deploy；本地没有可用 Wrangler / Cloudflare auth 证据。
- production desktop / 390px、console、overflow、focus、deep-link 与真实媒体验收。
- 外部浏览器纯键盘 Tab 顺序；内置浏览器只取得 semantic control、click 与 focus-visible 分项证据。
- 最后才决定是否把 `PUBLIC_LAUNCH_ENABLED` 从 `false` 切为 `true`。

正式发布状态、旧 production fallback 探测和 robots 边界以 `docs/qa/publication-v0.2-launch-gate.md` 为准。
