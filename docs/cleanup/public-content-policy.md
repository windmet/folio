# 前情帖 Public Surface Policy v0.1

## Active public product

前情帖的一等公开对象是 Archive、People、Index 与 Source。Post 只保留为 maintenance-only 兼容层，不再新增 CMS、投稿体验、复杂 presentation component 或 taxonomy。

## Source access classes

- `public`：本站可以公开描述的第一方公开材料。
- `public-external`：公开可访问、由外部平台承载的材料。
- `private-reference`：私人存档或内部研究证据，只能辅助编辑判断。
- `paid-reference`：购买、付费或限定材料，只能辅助编辑判断。

Source 可用于事实核验，不代表其内容可以进入 publication 输出。`private-reference` 与 `paid-reference` 默认只允许 metadata-only，不允许完整原文、完整翻译、扫描图或截图进入 public build。

## Public rendering

公开页面可以包含来源 metadata、编辑概要、语境、原始公开链接，以及理解记录所必需的短摘录。长内容使用概要；视觉或回复链重要时可以提供原链接。第三方官方 embed 只能作为读者主动加载的可选增强，不能默认加载。

外部 Post 的 verified 状态必须有精确原 URL。找不到原 URL 时使用 `unresolved`，页面明确显示“待核实”，不得根据作者、日期或文本猜造 status URL。公开 X、微博、官方博客、YouTube Community 与网页来源统一消费平台无关的 Source contract，不仿制平台 UI。

Source 作者可以用 `author.person` 指向 Global Person。只要提供这一引用，`author.name` 就必须与对应人物的 `displayName` 或精确 alias 一致；消费该 Source 的 Index Entry 也必须在 `people[]` 中包含作者。不能因为姓名局部相似或现有人物池缺项，把两个真人合并到同一 Person。

`editorialContext` 只记录正文无法自行表达、但理解来源可靠性或缺失条件所必需的信息。它不用于逐句解释笑点、复述称呼变化或替读者概括每一次接话。同一组 public record 的图片政策、链接核实范围等共通说明应集中在页首表达一次。

Index 的时间方向由自身 `chronology.defaultOrder` 与 `chronology.reversible` 声明。节目或活动检索可以默认新到旧并允许切换；具有因果顺序的公开对话应默认旧到新，并可固定为不可逆的阅读序列。`source-sequence` 展示只呈现时间、作者、摘录、译文与来源状态，不重复 Entry 标题、摘要和逐条编辑说明。

## Private extraction and Git history

从 current tree 删除只会撤出后续构建，不代表 Git 历史已经清除。历史改写或 sanitized repository 必须独立决策，并在备份、冻结协作与枚举 refs 后执行。
