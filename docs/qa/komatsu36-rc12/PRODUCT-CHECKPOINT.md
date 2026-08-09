# Komatsu36 RC 0.12 人工停点核对表

> 当前状态：`PRODUCT-ACCEPTED` 待确认
> 预览地址：`http://127.0.0.1:4322/projects/komatsu36/`
> 对应交接：`docs/editorial/komatsu36-rc12-release-readiness-handoff.md`

这份表只用于记录产品裁决，不替代源码、构建或 Browser QA 证据。页面已通过本地自动门禁与响应式压力测试；请在真实页面查看后给出简短结论。

## 人工停点 1：Player / People

| 项目 | 页面 | 当前实现 | 裁决 |
|---|---|---|---|
| People 桌面层级 | `?view=people`，1366×768 | 单列 PersonCard，四槽位对齐，无组件溢出 | `PENDING` |
| Timeline Player 层级 | `?view=timeline&event=yt-042252-seigura-superchat`，1366×768 / 1440×900 | 可切换 Expanded / Compact；Event、Track、target 与 URL 不变 | `PENDING` |
| 长文本操作 | 同上，390×844 | Target 实际溢出时显示“展开”；展开后为“收起”，移动端 mode toggle 隐藏 | `PENDING` |
| Cast 投影 | People 页面，901px / 390px | medium/mobile projection，无横向拖拽 | `PENDING` |

## 人工停点 2：D / E

| 项目 | 当前建议 | 裁决 |
|---|---|---|
| RC12-D 来源图标 | 保留 YouTube / X Space monochrome 线稿；文字仍是主语义 | `PENDING` |
| RC12-E Source-scoped Timeline | 按计划默认 `DEFERRED TO V1.1`，不阻塞 v1 | `PENDING` |

## 推荐回复格式

直接回复以下任一形式即可：

```text
停点 1：ACCEPT
停点 2：D ACCEPT，E DEFERRED
```

如需修改，只需指出具体项目，例如：

```text
停点 1：People ACCEPT；Timeline Compact 需要更弱化；长文本 ACCEPT
停点 2：D ACCEPT；E DEFERRED
```

在收到裁决前，不标记 `RC 0.12 REVIEW BRANCH ACCEPTANCE COMPLETE`，不 merge、不 deploy、不修改公开状态。
