# Relationship Candidate Log

> REL-02A · internal editorial notes · candidate records only

这份日志只记录未来可能需要的关系数据，不是读者页面，也不是已经裁决的关系事实。它不计算关系强度、不生成 graph、不把 `Work / Context` 从 Project-local 层提升为全局实体。

## Contract

每条候选记录保留五个字段：

| 字段 | 含义 |
| --- | --- |
| pair | 两个稳定 Global Person ID |
| why relevant | 为什么值得继续核对 |
| supporting Project/Event | 可回看的 Project 与 Event anchor |
| candidate relation label | 暂定语义，不代表已确认 |
| reader-facing context needed | 是否可能需要读者层解释 |

所有候选的状态均为 `needs-human-review`。公开页面继续使用现有 Project / Person / Event 合同，不读取本日志。

## Candidates

### RC-001 · `komatsu-shohei` ↔ `ito-tomohiro`

- why relevant：三档材料分别记录电话连线、投稿、持续联系与未能参加活动的说明，值得核对“旧共演者／持续联系”是否应成为稳定语义。
- supporting Project/Event：
  - `komachoe-20260309 / yt-005748-ito-had-fun`
  - `komachoe-20260309 / yt-015127-brake-not-cause`
  - `komachoe-20260425 / yt-015153-seiten-and-ito`
  - `komatsu36 / yt-032451-ito-submission`
- candidate relation label：`former-collaborator / continued-contact`
- reader-facing context needed：`可能，需要先确认编辑措辞`

### RC-002 · `komatsu-shohei` ↔ `kiyoten`

- why relevant：清典在不同 Project 中分别以动作指导、演出负责人和后续企划参与者出现，语义可能是制作协作而不是普通出演关系。
- supporting Project/Event：
  - `komachoe-20260309 / yt-013341-tate-is-drama`
  - `komachoe-20260309 / yt-013611-no-injury-boundary`
  - `komachoe-20260425 / yt-003730-broken-bamboo-sword`
  - `komatsu36 / sp2-025404-public-offer`
- candidate relation label：`production / action-collaboration`
- reader-facing context needed：`暂不需要，保留 Project-local`

### RC-003 · `inoue-yuki` ↔ `sato-yugo`

- why relevant：井上段落明确提到两人在旧节目时期的关系，并将其连接到平助 spin-off 的假设；这是候选语境，不是已成立的共同项目。
- supporting Project/Event：
  - `komachoe-20260309 / yt-012231-sato-old-connection`
  - `komachoe-20260309 / yt-022313-heisuke-spinoff`
- candidate relation label：`legacy-peer / hypothetical-cast-context`
- reader-facing context needed：`需要，且必须保留“假设”限定`

### RC-004 · `inoue-yuki` ↔ `shioya-fumiyasu`

- why relevant：两人分别承担昼／夜场藤堂平助 double cast，多个事件共同解释角色研究与二次会语境。
- supporting Project/Event：
  - `komachoe-20260309 / yt-003029-double-cast-visuals`
  - `komachoe-20260309 / yt-011854-double-cast-research`
  - `komatsu36 / yt-034011-blood-flick-research`
- candidate relation label：`double-cast-counterpart`
- reader-facing context needed：`可能，需避免把角色关系写成人物关系`

### RC-005 · `komatsu-shohei` ↔ `terashima-junta`

- why relevant：三档材料都出现寺島作为共演者、后台协助者或活动参与者的不同进入方式，适合验证“共演／现场协作”是否能跨 Project 稳定复用。
- supporting Project/Event：
  - `komachoe-20260309 / yt-005132-terashima-familiarity`
  - `komachoe-20260425 / yt-002351-terashima-backstage-mc`
  - `komachoe-20260425 / yt-002803-terashima-midnight-ramen`
  - `komatsu36 / sp2-011723-terashima-requested`
- candidate relation label：`co-performer / event-support`
- reader-facing context needed：`暂不需要，先由 Person context 承载`

## Exit criteria

只有在更多 Project 提供同一语义、且人工确认 label 不会混淆人物关系与角色／作品关系后，才考虑把某一类候选提升为正式数据合同。当前不实现 graph、D3、Cytoscape、edge score 或关系首页入口。
