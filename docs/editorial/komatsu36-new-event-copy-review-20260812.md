# Komatsu36 新增 Event 文案校对回填（2026-08-12）

- Editorial revision: `2026-08-12-new-event-copy-reviewed-final-v2`
- Reviewed authority: `komatsu36-reader-copy-review-reviewed-final-v2.md`

## 使用边界

- 本文件覆盖 2026-08-12 语义拆分新增的 5 个 Event，以及拆分后必须重审的 `yt-013840-great-payback`，共 12 个 reader-facing 字段。
- `copy-key` 是回填主键，请勿修改；可直接编辑对应 `text` 代码块，并在确认后勾选 `reviewed`。
- 本轮不重审其他人工终稿。`yt-013800-thirty-four-yen` 仅调整时间与事件粒度，现有 `title` / `summary` 保持原样；`yt-013840-great-payback` 因拆分后不应继续承担“八千万/点酒”语义，单独进入本文件重审。
- `qualification` 是内部证据边界，不是公开润色字段；文末单列供核对，不应改写成面向读者的补充说明。
- 日文专名、引号和金额可按最终文风统一，但不要把无 speaker label 的 ASR 推断扩写成确定发言人。

## 回填状态

| Event | 时间 | 当前状态 | 关联 |
| --- | ---: | --- | --- |
| `yt-013730-hama-j-coupon` | 01:37:30.600–01:37:42.000 | reviewed-final-v2 | 濱线、寺島线 |
| `yt-013827-hama-moet-budget` | 01:38:27.800–01:39:03.000 | reviewed-final-v2 | 濱线、寺島线 |
| `yt-013917-kano-spice-sensor` | 01:39:17.580–01:39:55.000 | reviewed-final-v2 | Timeline only |
| `yt-013840-great-payback` | 01:40:58–01:41:30 | reviewed-final-v2 | 濱线中的频道回馈节点 |
| `yt-014246-hama-spicy-chicken` | ≈01:42:46–01:42:54 | reviewed-final-v2 | 濱线 |
| `yt-014321-kano-ojisan` | 01:43:21–01:43:53 | reviewed-final-v2 | 狩野おじさん线 setup |

## EVENT COPY

### `event:komatsu36/yt-013730-hama-j-coupon#title`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013730-hama-j-coupon.json`
- Field: `title`

```text
濱掏出没选的 J 券：这个我能领吗？
```

### `event:komatsu36/yt-013730-hama-j-coupon#summary`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013730-hama-j-coupon.json`
- Field: `summary`

```text
小松没选的お小遣い券不知什么时候已经进了濱口袋。濱直接问能不能兑现，寺島转头先问了他一句：你今年几岁？
```

### `event:komatsu36/yt-013827-hama-moet-budget#title`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013827-hama-moet-budget.json`
- Field: `title`

```text
八千万还没影，濱已经开始按大奖预算点酒
```

### `event:komatsu36/yt-013827-hama-moet-budget#summary`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013827-hama-moet-budget.json`
- Field: `summary`

```text
Big Dream 还只存在于想象里，濱已经从十瓶 Moët Rosé 开始算，最后退到四瓶、八万日元。小松只能一边听一边求他手下留情。
```

### `event:komatsu36/yt-013917-kano-spice-sensor#title`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013917-kano-spice-sensor.json`
- Field: `title`

```text
狩野临时接班“辛さセンサー”，一口判定アウト
```

### `event:komatsu36/yt-013917-kano-spice-sensor#summary`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013917-kano-spice-sensor.json`
- Field: `summary`

```text
小松先发现炸鸡发辣，狩野这个同样怕辣的人接过试吃。只咬一口就给出「辛い、アウト」，于是现场重新点了不辣的炸鸡。
```

### `event:komatsu36/yt-013840-great-payback#title`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013840-great-payback.json`
- Field: `title`
- Current published copy: `八千万梦想把生日会说成“大还元祭”`

```text
频道攒了一年的收入，生日会被说成「大還元祭」
```

### `event:komatsu36/yt-013840-great-payback#summary`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013840-great-payback.json`
- Field: `summary`
- Current published copy: `Big Dream 的夸张奖金想象一路滑向点高价酒；小松随后解释频道收入缺少回馈场景，现场便把生日会称作“大還元祭”。`

```text
小松说，频道这一年收到的广告收入和 Super Chat 一直没找到合适的回馈方式。话题顺势把这场生日会说成了「大還元祭」，后面又开始拿收入和税金继续起哄。
```

### `event:komatsu36/yt-014246-hama-spicy-chicken#title`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014246-hama-spicy-chicken.json`
- Field: `title`

```text
濱接盘辣味炸鸡：好吃，但是真的辣
```

### `event:komatsu36/yt-014246-hama-spicy-chicken#summary`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014246-hama-spicy-chicken.json`
- Field: `summary`

```text
小松和狩野都嫌辣的炸鸡最后到了濱手里。濱说自己本来就爱吃辣，尝完的结论也很简单：好吃，是真的辣。
```

### `event:komatsu36/yt-014321-kano-ojisan#title`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014321-kano-ojisan.json`
- Field: `title`

```text
濱总结狩野这四年：越来越おじさん
```

### `event:komatsu36/yt-014321-kano-ojisan#summary`

- [x] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014321-kano-ojisan.json`
- Field: `summary`

```text
濱开始盘点狩野这四年的变化：以前觉得只有大叔会做的事，如今几乎一个个都做上了。吐槽到最后，又补了一句——还好脸长得好看。
```

## 内部证据边界（不回填公开文案）

### `yt-014246-hama-spicy-chicken`

评论人物轴将实际拿来吃的动作记录在约 01:42:35；可听到的明确评价从约 01:42:47 开始。

### `yt-014321-kano-ojisan`

起始调侃者由人工回听确认作濱健人；无 speaker ASR 仅用于句子与时间互证。

## 既有 Event 锁定说明

| Event | 新时间窗 | 人物 | 文案处理 |
| --- | ---: | --- | --- |
| `yt-013800-thirty-four-yen` | 01:37:42–01:37:52 | 濱健人、寺島惇太、小松昌平 | 保留人工终稿 |
| `yt-013840-great-payback` | 01:40:58–01:41:30 | 小松昌平 | 保留 stale ID；reviewed-final-v2 已回填 |
