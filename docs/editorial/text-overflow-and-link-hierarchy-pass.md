# Project Archive · Text Overflow and Link Hierarchy Pass

## Scope

This pass applies the same reader-facing text hierarchy to Komatsu36 and `komachoe-20260425`.

## Contract

- Mention, Section, Act body, and Event titles are primary meaning. They render for at most two lines and do not gain a dedicated expand control.
- Mention summaries are complete micro-context, not truncated teasers. Normal-length copy renders at natural height; only measured overflow beyond four lines receives a `查看更多 / 收起` disclosure.
- Mobile Mentions limits page length at group level: People and Works initially show five cards, then expose `查看全部` controls. It does not shorten every card's core explanation.
- Timeline navigator segments remain compact navigation labels. Desktop exposes the complete Act title through the existing tooltip and native `title`; the mobile Act menu allows two title lines.
- Act summaries remain compact on mobile. Event detail continues to use its existing mobile disclosure, but expanding an Event does not turn its title into an unbounded text block.
- Mention timecodes remain bordered primary actions.
- Mention sources are secondary underlined text links prefixed with `查看`; they are not rendered as a second row of boxed buttons.
- Mention timecodes and the secondary source link share one wrapping footer row, preserving the distinction between primary and secondary actions without spending an extra row by default.

## RC12-B2 supersession

The Act-title and Timeline-current-title portions of the earlier RC12-B2 inline-expansion contract are superseded by this pass. Media Source titles still use measured overflow plus explicit expand/collapse because source cards have a different, width-constrained responsibility.

## Acceptance

- Both Project routes retain zero page-level horizontal overflow at desktop and 390px.
- Body title clamps resolve to two lines in rendered CSS.
- Komatsu36 renders no Act-title inline toggles; its three Media Source title toggles remain.
- Timeline navigator tooltips remain present for all Acts.
- Komachoe Mention links have no box border or button padding and retain safe new-tab attributes.
- At 390px, the `原神` Mention renders through `咔库库（カクーク）` without a clamp or disclosure; genuine four-line overflow can expand, and group controls reveal all cards.
