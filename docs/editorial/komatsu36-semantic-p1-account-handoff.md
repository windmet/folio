# Komatsu36 Semantic P1 Account Identity Handoff

> 状态：`P1 STEP 8 · SOURCE + BUILD + BROWSER VERIFIED`
> 日期：2026-08-10
> 分支：`codex/komatsu36-project-archive`
> 输入 authority：`docs/komatsu36_semantic_patch_20260810.md` 第 6、19 节
> Release Gate：CLOSED；本文不授权 merge、deploy、真实媒体或故事／UI 全量扩面

## 1. 问题与裁决

Person 内容层原本已把室账号上的未知发言者与室元気本人分开，但 Event 的普通 Person chip 仍统一显示“室元気”，会在读者读到 summary 前先造成身份误认。

本批没有把 Person 全局改名为“室元気账号”，也没有创建一个与人物重复的 Account Person。原因是 `sp2-000509-hokkaido` 确实把室元気本人作为现实活动对象；全局改名会修好前三个账号节点，却破坏这个真实人物节点。

最终采用 Event→Person 关系类型：

```json
"personRelations": [
  { "person": "komatsu36/muro-genki", "kind": "account-context" }
]
```

`people` 继续提供稳定 Person 引用、搜索与反向事件列表；`personRelations` 只改变该 Event 中的 reader-facing chip 投影。当前唯一关系类型 `account-context` 显示为“{displayName}账号”。

## 2. 当前真值

以下三个 Event 使用 `account-context`：

- `sp1-004324-space-restart`
- `sp2-000131-muro-account`
- `sp2-000311-account-hijack`

`sp2-000311-account-hijack` 继续是 `qualified`，内部 qualification 不发布；页面新增自然 reader note：

> 这段只能确认使用的是室元気的账号，实际说话者未确认。

`sp2-000509-hokkaido` 不带该关系，chip 继续显示“室元気”。点击任一“室元気账号” chip 仍打开 canonical `muro-genki` Person panel；panel 保留“不把未知发言者归给室元気本人”的项目语境。

## 3. 防回归合同

Event schema 允许可选 `personRelations`，当前只允许 `account-context`。`validate:projects` 要求：

- relation target 必须是有效 Person；
- target 必须同时存在于 Event `people`；
- 同一 Event 不得重复声明同一 Person relation；
- `account-context` 只能指向拥有 `space-account` participation 的 Person。

`validate:publication` 固定三个账号 Event 的关系清单、未知发言者 reader note 与北海道节点的非账号关系，并要求发布 HTML 恰好出现三个“室元気账号” Event chip。

## 4. 验证证据

```text
npm run validate                   PASS — 295,547 bytes / 159 search items
npm exec -- tsc --noEmit           PASS
npm run validate:reader-copy       PASS — 54 / 54 decisions
git diff --check                   PASS
```

真实路由：

```text
http://127.0.0.1:4322/projects/komatsu36/?view=timeline&event=sp2-000311-account-hijack
```

Browser / Playwright 已验证：

- deep link 恢复到 `00:03:11`，chip 为“室元気账号”，reader note 可见；
- `00:01:31` setup 同样显示账号；`00:05:09` 北海道 payoff 显示本人“室元気”；
- 点击账号 chip 打开 `室元気` Person panel，身份边界文案存在；
- 1440×900 与 390×844 的 document overflow 均为 `0`，console error/warn 均为空；
- 截图保存在仓库外，不进入 Git。

可重复验证器：

```text
node scripts/verify-komatsu36-semantic-p1-account-browser.mjs <optional-screenshot-dir>
```

## 5. 下一批

Semantic P1 Person 第 5–8 项现已完成。下一批从“补故事”开始，只实现清典公开 offer 独立 Event、11 月 15 日两项公告解释与台本形式原则降级；先核对源档原文、现有 Event 时间窗和 Thread 接法，再做独立提交。不得借本关系类型扩建通用社交账号系统，也不得混入 11 条 Thread／8 个 UI 组件的全量 reader-language pass。
