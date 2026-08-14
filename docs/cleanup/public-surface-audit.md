# BOUNDARY-01A · Public Surface Audit

> 核对日期：2026-08-14
> branch：`codex/publication-metadata-v2`
> baseline HEAD：`4a42de5`
> 范围：当前工作树、`dist/`、所有本地/远端 Git refs，以及 `E:\GOMYAKU\Projects`

这份清单只裁决材料去向，不授权历史改写、公开部署或开放 robots。`Project` 内部的 Timeline 是单场档案阅读结构，不属于本轮要退役的站级 `/timeline/`。

## 边界定义

| 分区 | 用途 | 可进入公开构建的内容 |
| --- | --- | --- |
| Public Archive | 面向读者的产品 | 公开来源 metadata、编辑概要、语境、来源链接、必要短摘录 |
| Private Research / Evidence | 编辑与事实核验 | 购买杂志、付费/限定内容、完整原文与完整译文、私人存档 |
| Legacy Compatibility | 等待迁移的旧容器 | 只维护已有读者入口；不新增 authoring、taxonomy 或 CMS 能力 |

核心原则：Source 可以用于事实核验，不代表 Source 内容可以被 publication 输出。Workspace、Private Evidence 与 Public Archive 是三个不同层级。

## 当前内容清单

| 对象 | 当前事实 | 裁决 | 目标批次 |
| --- | --- | --- | --- |
| `src/content/projects/`、People、Indexes | 当前产品的一等模型 | **KEEP / ACTIVE CORE** | 无 |
| REMOVED — src/content/posts/bmc-interview.mdx | 32,942 bytes；完整日文采访；无原始 public URL；由 `17a42d3` 引入 | **PRIVATE / EXTRACTED** | 01B complete |
| REMOVED — src/content/posts/bmc-interview-cn.mdx | 28,707 bytes；完整中文译文；引用本地杂志封面/版面图；由 `17a42d3` 引入 | **PRIVATE / EXTRACTED** | 01B complete |
| REMOVED — public/uploads/14aa0f612f505da94c45e6106501d643.jpg | 258,850 bytes；《声優グランプリ》2025-06 封面/版面图 | **PRIVATE / EXTRACTED** | 01B complete |
| REMOVED — src/content/posts/xhs-exporter.mdx | 3,667 bytes；个人工具开发日志 | **PRIVATE / EXTRACTED** | 01C complete |
| REMOVED — scripts/xhs-exporter/ | 本地切图工具；曾跟踪 27 张输出图，共 13,903,852 bytes；Git 历史另有已删除的 page 28–93 | **PRIVATE TOOLING / EXTRACTED** | 01C complete |
| `src/content/posts/ancient-tweets.mdx` | 公开 X 对话内容；没有任何原 Post URL；依赖 fake Tweet UI | **MIGRATE** | 01D |
| `public/uploads/炸鸡.jpg` | 419,466 bytes；公开社交图片的本地镜像；由 `09cb5cc` 引入 | **MIGRATE / SOURCE REVIEW** | 01D |
| `posts` collection 与 `/posts/[...slug]` | 目前承载上述 4 篇旧文 | **DEPRECATED / MAINTENANCE-ONLY** | 01C/01D 后复核 |
| `test-article.mdx` | 当前已删除，仍在 Git 历史 | **HISTORY ONLY** | 历史清理决策 |

两份 BMC 全文及其图片的 SHA-256：

- 日文：`0939277105de2bb80be179a5aba6bb822b29b9011a9f61ddfbe9ecfd3e8a5ae1`
- 中文：`20ef5f50ee2df3e232748041a814272930f459e7c4a488f07160d87aef2c6e18`
- 图片：`c7fc2c1f6958f799216b46257e96341bb40706f92f4f665e8e9f838da5421520`

首次核对时，`E:\GOMYAKU\Projects` 只有三个广播 Project，没有找到上述 BMC、XHS、杂志或社交图片的仓库外副本。

01B 随后建立了 `E:\GOMYAKU\Private Research\public-surface-extraction-20260814`：复制后逐文件比对源/目标 SHA-256 均一致；manifest 记录了复制前 231 个 payload files、32,814,630 bytes，以及 tree SHA-256 `13546349cea3dadbddbc04c991d20420ed2fee475688150ce57796424cc3a2c9`。该副本包含 BMC 日中全文、杂志图、XHS 文章/工具快照，以及迁移中的 ancient tweets 与社交图片。

## Tina / authoring machinery

| 对象 | 当前事实 | 裁决 | 目标批次 |
| --- | --- | --- | --- |
| REMOVED — tina/config.ts、tina/tina-lock.json | Tina schema 与生成锁 | **RETIRED** | 01C complete |
| REMOVED — `@tinacms/cli`、`tinacms` | 已从 package manifests / lockfile 清除；root lockfile 从 805,149 降至 262,951 bytes | **RETIRED** | 01C complete |
| REMOVED — `tina:dev`、`tina:host`、`tina:build` | package scripts 不再提供旧 authoring 模式 | **RETIRED** | 01C complete |
| REMOVED — public/admin/ | 曾在本机有 92 files / 10,811,779 bytes，并被 Astro 复制进 `dist/admin/`；已移出网站树 | **QUARANTINED** | 01C complete |
| REMOVED — tina/__generated__/ | 生成物已移出网站树（若存在） | **QUARANTINED** | 01C complete |
| REMOVED — `Question`、`Annotation`、`QuoteLine`、`HeroImage` | BMC/XHS consumer 清零后删除 | **ZERO-CONSUMER RETIRED** | 01C complete |
| `@astrojs/mdx`、Typography | Post 与 MDX presentation 仍可能消费，不是 Tina runtime | **KEEP UNTIL ZERO-CONSUMER PROOF** | 后续 |

重要发现：`public/admin/` 虽然未被 Git 跟踪，但曾位于 Astro `public/` 下，`dist/admin/` 因而包含相同的 92 个文件和 10.8 MB 内容。01C 已将它移到 Private Research quarantine；后续 build 必须证明 `dist/admin/` 不再生成。

本机 ignored `.env` 仍有三个 Tina key name，但配置、命令与依赖均已退役，构建不再读取它们。本轮不改写用户私有 secrets 文件；这些值不属于仓库或 public build，可以由用户在确认无其他用途后自行撤销。

## Social source / fake platform UI

| 对象 | 当前 consumer | 裁决 |
| --- | --- | --- |
| `Tweet.astro` | `ancient-tweets.mdx` | **DEPRECATED → SourcePost** |
| `Reply.astro` | `ancient-tweets.mdx` | **DEPRECATED → SourcePost** |
| `QuoteTweet.astro` | `ancient-tweets.mdx` | **DEPRECATED → SourcePost** |
| `TweetEmbed.astro` | 只被 Post route 注册，没有内容 consumer | **DELETE AFTER ROUTE MIGRATION** |
| `public/uploads/炸鸡.jpg` | `ancient-tweets.mdx` | **不得默认镜像发布；先补 public URL / 来源判断** |

01D 的平台无关合同至少包含：`platform`、`author`、`publishedAt`、`publicUrl`，以及可选的 `excerpt`、`translation`、`editorialContext`。原链接是公开记录的必要字段；官方 embed 只能由读者主动加载，不能成为默认渲染路径。

## Global Timeline consumer graph

```text
timeline collection
  └─ src/content/timeline/timeline.json
       └─ src/pages/timeline.astro
            └─ Timeline.astro
                 └─ TimelineItem.astro

/timeline/
  ├─ BaseLayout footer 的“旧时间线”
  ├─ siteMetadata.ts 未来 public allowlist
  └─ verify-site-metadata.mjs route regression
```

全部 consumer 都是 legacy global Timeline 自身，未发现 Posts、Homepage、People 或 Index 读取该 collection。`src/components/project/TimelineEvent.astro`、`TimelineNavigator.astro` 与 `SourceTimeline.astro` 属于单个 Project 的 active reader contract，必须保留。

因此全局 Timeline 可以在 01E 一次性移除；顺序仍是 consumer → route → collection → components → verifier expectation。

## Git 历史暴露

以下材料不仅存在于当前 HEAD，也能从 `origin/main` 的祖先 commit 取得：

| 引入 commit | 仍可取得的材料 |
| --- | --- |
| `17a42d3` | BMC 日文全文、中文全文、杂志图片、Tina 配置 |
| `c35cf41` | XHS 文章/工具/输出、ancient tweets、global Timeline、fake Tweet UI |
| `09cb5cc` | `public/uploads/炸鸡.jpg` |

所以 current-tree 删除只能解决下一次构建，不会清除 Git 历史。上线前需另立不可混入普通 feature commit 的决策：

1. 私有仓库保留历史，但发布 sanitized repository；或
2. 在备份、冻结协作和枚举所有 refs 后，用 `git filter-repo` 改写历史并强制更新远端。

本轮不执行历史改写，也不把“当前页面已删除”写成“历史已清除”。

## 执行 Gate

- **01B complete**：网站 repo 外的 Private Research 副本已建立并校验；BMC 全文与杂志图已撤出 current public tree。
- **01C complete**：Tina、`public/admin/`、XHS public consumer 与零 consumer 旧博客 UI 已退役；待 build 复核生成物。
- **01D 前置**：为 2016 X 记录补齐可验证的 public URLs；在无法核实的条目上保留 `sourceStatus`，不伪造链接。
- **01E 前置**：01D 不再依赖 fake Tweet family；确认全站没有 `/timeline/` 链接或 collection consumer。
- 每批都必须运行 `npm run validate`、`npm exec -- tsc --noEmit`、`git diff --check`；涉及 Project shell 时追加 payload audit。
