# Semantic P1 UI Reader Language QA

日期：2026-08-10  
路由：`http://127.0.0.1:4322/projects/komatsu36/`

## 自动验收

```text
node scripts/verify-komatsu36-semantic-p1-ui-language-browser.mjs docs/qa/komatsu36-semantic-p1-ui-language
```

| 视口 | 覆盖 | 结果 |
|---|---|---|
| 1440×900 | Overview、Timeline SP1、Bingo Thread、内田 Person、Event／Thread／Person Search | overflow `0`；console `[]` |
| 390×844 | 同一完整交互链 | overflow `0`；console `[]` |

截图：`1440x900-ui-language.png`、`390x844-ui-language.png`。

本目录只证明 Semantic P1 标签修改没有造成当前布局回归；它不接受下一批 Mobile Bubble 播放器。
