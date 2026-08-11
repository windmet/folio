# Komatsu36 新增 Event 文案校对回填（2026-08-12）

## 使用边界

- 本文件覆盖 2026-08-12 语义拆分新增的 5 个 Event，以及拆分后必须重审的 `yt-013840-great-payback`，共 12 个 reader-facing 字段。
- `copy-key` 是回填主键，请勿修改；可直接编辑对应 `text` 代码块，并在确认后勾选 `reviewed`。
- 本轮不重审其他人工终稿。`yt-013800-thirty-four-yen` 仅调整时间与事件粒度，现有 `title` / `summary` 保持原样；`yt-013840-great-payback` 因拆分后不应继续承担“八千万/点酒”语义，单独进入本文件重审。
- `qualification` 是内部证据边界，不是公开润色字段；文末单列供核对，不应改写成面向读者的补充说明。
- 日文专名、引号和金额可按最终文风统一，但不要把无 speaker label 的 ASR 推断扩写成确定发言人。

## 回填状态

| Event | 时间 | 当前状态 | 关联 |
| --- | ---: | --- | --- |
| `yt-013730-hama-j-coupon` | 01:37:30.600–01:37:42.000 | P0 / 新增 | 濱线、寺島线 |
| `yt-013827-hama-moet-budget` | 01:38:27.800–01:39:03.000 | P1 / 新增 | 濱线、寺島线 |
| `yt-013917-kano-spice-sensor` | 01:39:17.580–01:39:55.000 | P0 / 新增 | Timeline only |
| `yt-013840-great-payback` | 01:40:58–01:41:30 | P0 / 拆分后重审 | 濱线中的频道回馈节点 |
| `yt-014246-hama-spicy-chicken` | ≈01:42:46–01:42:54 | P1 / 新增 | 濱线 |
| `yt-014321-kano-ojisan` | 01:43:21–01:43:53 | P0 / 新增 | 狩野おじさん线 setup |

## EVENT COPY

### `event:komatsu36/yt-013730-hama-j-coupon#title`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013730-hama-j-coupon.json`
- Field: `title`

```text
濱从口袋拿出剩下的 J 券要求兑现
```

### `event:komatsu36/yt-013730-hama-j-coupon#summary`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013730-hama-j-coupon.json`
- Field: `summary`

```text
濱承认被放弃的お小遣い券已经在自己口袋里，随即问能否直接领取；寺島转而追问他的年龄，准备按 34J 结算。
```

### `event:komatsu36/yt-013827-hama-moet-budget#title`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013827-hama-moet-budget.json`
- Field: `title`

```text
还没中八千万，濱先按大奖预算点酒
```

### `event:komatsu36/yt-013827-hama-moet-budget#summary`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013827-hama-moet-budget.json`
- Field: `summary`

```text
Big Dream 仍是假设，濱已经把 Moët Rosé 从十瓶算到四瓶、合计八万日元；小松只能连续求他手下留情。
```

### `event:komatsu36/yt-013917-kano-spice-sensor#title`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013917-kano-spice-sensor.json`
- Field: `title`

```text
狩野接手“辛さセンサー”，一口判定出局
```

### `event:komatsu36/yt-013917-kano-spice-sensor#summary`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013917-kano-spice-sensor.json`
- Field: `summary`

```text
小松发现炸鸡发辣，狩野以怕辣者身份接过平时由寺島承担的试辣任务，尝过后马上判定“辛い、アウト”，现场改点不辣的炸鸡。
```

### `event:komatsu36/yt-013840-great-payback#title`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013840-great-payback.json`
- Field: `title`
- Current published copy: `八千万梦想把生日会说成“大还元祭”`

```text
频道一年收入终于有了“大還元祭”
```

### `event:komatsu36/yt-013840-great-payback#summary`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-013840-great-payback.json`
- Field: `summary`
- Current published copy: `Big Dream 的夸张奖金想象一路滑向点高价酒；小松随后解释频道收入缺少回馈场景，现场便把生日会称作“大還元祭”。`

```text
小松解释频道过去一年收到的广告收入与 Super Chat 一直缺少合适的回馈场景，现场随即把这场生日会称作“大還元祭”，又顺势拿收入与税金继续起哄。
```

### `event:komatsu36/yt-014246-hama-spicy-chicken#title`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014246-hama-spicy-chicken.json`
- Field: `title`

```text
濱接手辣鸡：好吃，但确实很辣
```

### `event:komatsu36/yt-014246-hama-spicy-chicken#summary`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014246-hama-spicy-chicken.json`
- Field: `summary`

```text
濱把小松和狩野吃不下的辣味炸鸡接过去，表示自己喜欢吃辣，也确认味道虽好、辣度却是真的。
```

### `event:komatsu36/yt-014321-kano-ojisan#title`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014321-kano-ojisan.json`
- Field: `title`

```text
狩野被诊断为“四年来越来越おじさん”
```

### `event:komatsu36/yt-014321-kano-ojisan#summary`

- [ ] reviewed
- Source: `src/content/projects/komatsu36/events/yt-014321-kano-ojisan.json`
- Field: `summary`

```text
濱逐条吐槽狩野近四年越来越像大叔，连年轻时觉得只有大叔会做的事都做遍了；最后又补上一句，幸好只是脸长得好看。
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
| `yt-013840-great-payback` | 01:40:58–01:41:30 | 小松昌平 | 保留 stale ID；新 title/summary 等待本文件人工确认 |
