# RC 0.11 R1 QA — Opaque Player + Lead Person

> 状态：通过，已随 R1 批次提交
> 路由：`/projects/komatsu36/?view=people&event=yt-020742-action-group-prelude`
> 构建基线：R1 review branch 当前提交；raw 354,388 bytes

## 固定样本

| Viewport | 结果 |
|---|---|
| 1440×900 | 页面级 overflow `0`；Player frame `390px`；Player / Context 实色；Lead 可见 |
| 1366×768 | 页面级 overflow `0`；Player frame `372px`；Rail 与 Lead display 正常 |
| 390×844 | 页面级 overflow `0`；Lead width `343.18px`、scrollWidth `341px`；Rail `display:none`；Context CTA 与 fallback 可见 |

## 交互与结构

- `00 HOST / BIRTHDAY` 的 `data-open-person="komatsu-shohei"` 可打开 Person panel，URL 为 `person=komatsu-shohei`；
- Production 中的小松入口可打开同一 Person；Cast 中昼 / 夜两处入口仍存在；
- Birthday Live participant grid 不包含小松；
- 1440 / 1366 / 390 的 Player background 为实色 `rgb(247, 244, 237)`，Context 为实色 `rgb(238, 232, 220)`；
- 应用 console error / warning：0；
- 真实音频、长时播放与 production preview：`NOT EXECUTED`，不由本批宣称。

## 命令

```text
npm run validate
npm exec -- tsc --noEmit
git diff --check
```
