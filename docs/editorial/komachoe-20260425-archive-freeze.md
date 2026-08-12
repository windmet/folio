# Komachoe 2026-04-25 Archive Freeze

> 冻结日期：2026-08-12
>
> 分支：`codex/komachoe-20260425`
>
> 发布状态：`draft`

## 冻结范围

- Source Set：`komachoe-20260425-r1`。
- 1 条 YouTube Track，时长 `7,926,041ms`。
- 6 个连续 Act，以 `sectionKey` 投影为节目 Section。
- 30 个经人工选择与审校的 Timeline Event；29 个 `exact`，1 个 `approximate`。
- 0 Thread、0 People、0 Source directory；不为页面完整性制造关系数据。
- 公开页面只提供 Overview / Sections / Timeline。
- 视觉主题为数据驱动的 `broadcast-blue`：雾蓝底纸、广播蓝结构锚点、深色播放器焦点。

内容扩展只取自 canonical mother draft 的 E01–E42 候选。本期未重新运行整场 ASR，未自动生成全部 42 个节点；纯结构节点 E17 / E22 未公开。

## 公开输出边界

构建产物不得包含本机 source root、字幕或 JSONL 文件名、ASR 批次、Chat 身份字段与复核切片标记。广播 Project 保持单来源投影，不实例化 Media Sources、Timeline Scope、Source tabs、Storylines、People 或 Transcript。

## 本地验收快照

- `npm run validate`：通过。
- `npx tsc --noEmit`：通过。
- Komachoe publication gate：`64,569 bytes`、30 Events、draft route 未进入首页。
- Komachoe browser gate：1440×900、1920×1080、390×844、360×800、414×896 通过；无 page overflow 或 console error。
- Section → Timeline、Back/Forward、URL restore、搜索、播放器失败重试、Event seek、current-time handoff 与移动端 Bubble：通过。
- Komatsu36 publication：`383,640 / 386,048 bytes`，余量 `2,408 bytes`。
- Komatsu36 semantic closeout 7/7、YouTube N1、overlay scroll、RC12 Y1 / MT1 / PA1 / E / T1 / M1：通过。

## 尚未执行的发布 gate

以下项目没有被本地自动化替代，完成前不得把 Project 改为 `published`：

1. Cloudflare Preview 生产环境路由验收；
2. 手机 Wi-Fi 下真实 YouTube 播放与 seek；
3. 手机蜂窝网络下真实 YouTube 播放与 seek；
4. 用户明确授权公开。

`4/25 ↔ 4/14` 关联档案仍是发布后的独立实验，不阻塞本期独立成立，也不在本次冻结范围内。
