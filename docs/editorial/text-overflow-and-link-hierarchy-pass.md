# Project Archive · Text Overflow and Link Hierarchy Pass

## Scope

This pass applies the same reader-facing text hierarchy to Komatsu36 and `komachoe-20260425`.

## Contract

- Mention, Section, Act body, and Event titles are primary meaning. They render for at most two lines and do not gain a dedicated expand control.
- Mention summaries remain a bounded index preview: three lines on desktop, two lines on mobile, with no card expansion.
- Timeline navigator segments remain compact navigation labels. Desktop exposes the complete Act title through the existing tooltip and native `title`; the mobile Act menu allows two title lines.
- Act summaries remain compact on mobile. Event detail continues to use its existing mobile disclosure, but expanding an Event does not turn its title into an unbounded text block.
- Mention timecodes remain bordered primary actions.
- Mention sources are secondary underlined text links prefixed with `查看`; they are not rendered as a second row of boxed buttons.

## RC12-B2 supersession

The Act-title and Timeline-current-title portions of the earlier RC12-B2 inline-expansion contract are superseded by this pass. Media Source titles still use measured overflow plus explicit expand/collapse because source cards have a different, width-constrained responsibility.

## Acceptance

- Both Project routes retain zero page-level horizontal overflow at desktop and 390px.
- Body title clamps resolve to two lines in rendered CSS.
- Komatsu36 renders no Act-title inline toggles; its three Media Source title toggles remain.
- Timeline navigator tooltips remain present for all Acts.
- Komachoe Mention links have no box border or button padding and retain safe new-tab attributes.
