# Komatsu36 Semantic P1 UI Reader Language Handoff

> 状态：`P1 UI LANGUAGE · SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：`docs/komatsu36_semantic_patch_20260810.md` 第 12–13 节
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体、Event 文案批次或移动播放器改造

## 1. 本批完成范围

本批只改 reader-visible label，不改内部 schema、Thread category、node role、Person participation enum、Event／Track／URL 或播放器生命周期。

- 新增 `src/lib/projectReaderLabels.ts`，统一管理 Thread category、Thread role 与 participation kind 的读者标签；
- `ProjectArchiveShell`、`MediaSourceNavigator`、`ArchivePlayer`、`ThreadPanel`、`PersonCard`、`PersonPopover`、`ProjectSearch`、`PlayerContextRail` 以及来源时间线不再直接显示 schema 词；
- Overview 与 People 的产品开发说明改成直接面向读者的故事介绍；
- Search JSON 的公开类型标签改为“事件／故事线／人物”，`kind` 字段本身仍保持稳定；
- `editorialRevision` 更新为 `2026-08-10-semantic-p1-ui-language`，Reader Copy 快照同步重建。

## 2. 映射合同

| 内部值 | 读者标签 |
|---|---|
| `running-gag / perfect-callback / cross-platform / making-of` | 连续笑点／前后回收／跨平台／制作幕后 |
| `setup / development / payoff` | 起点／发展／回收 |
| `remote-call / space-account / submitted-comment` | LINE 电话／账号出现／事前投稿 |
| Search `event / thread / person` | 事件／故事线／人物 |

内部值继续服务内容校验、路由和检索；组件必须通过共享 mapping 取展示文字，不得重新使用 `replaceAll('-', ' ')` 暴露 enum。

## 3. 自动门禁

`validate:publication` 现额外验证：

- 160 条公开搜索项按 kind 使用正确中文前缀；
- 已废弃的 UI 标签不再进入去除 script/style 后的公开 reader text；
- 新 eyebrow、Timeline、Player、Source index、Thread、Search、People 文案必须存在。

可重复浏览器验证器：

```text
node scripts/verify-komatsu36-semantic-p1-ui-language-browser.mjs <optional-screenshot-dir>
```

## 4. 验证证据

```text
npm run build                    PASS — 298,986 bytes / 160 search items
npm run validate:reader-copy     PASS — 55/55
npm run validate:publication     PASS — 126 public Events / 3 Timeline scopes
npx tsc --noEmit                 PASS
git diff --check                 PASS
```

Playwright 在 1440×900 与 390×844 验证：Overview、三来源 Timeline、Thread category／role、Person participation、三类 Search label；两端 document overflow 均为 `0`，console error/warn 均为空。截图与复现入口见 `docs/qa/komatsu36-semantic-p1-ui-language/README.md`。

## 5. 停点与后续顺序

本批到此停止，不把移动端布局混入 Semantic UI commit。

1. 2026-08-10 状态覆盖：`RC12-M1 — Mobile Player Bubble & Compliant Playback` 已完成工程／Browser 验证，真实设备仍 `NOT EXECUTED`；证据见 `docs/qa/komatsu36-rc12/m1/README.md`。
2. Semantic P1 尚未遗忘：第 14–15 节杯类奖品与 Bingo “patch” reader copy 现在作为下一独立 Event 批次继续。
3. P2 ID migration、真实媒体、Release Gate 与部署继续关闭。
