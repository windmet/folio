# Person Model v2

Person Model v2 separates stable identity from project-specific editorial context. This phase is intentionally limited to the data model, compatibility projection, broadcast Index, search, and validation. It does not add global Person routes or a relationship graph, and it does not redesign Player, Timeline, Sections, or the existing Komatsu36 People view.

## Authority boundary

- `src/content/people/*.json` is the global identity layer. A Person stores a canonical file ID, stable display name, reading, aliases, public links, and an optional small context profile. It is not a biography or Wiki page.
- `src/content/projects/<project>/people/*.json` is Project Person Context. It references one global Person and stores only this project's summary, presence, roles/credits, and Event anchors.
- `project.json#mentions` stores Works and Context only. People do not have a second identity representation there.
- A project context filename remains a local compatibility ID. For example, `komatsu36/seiten` still satisfies existing Event references, while its `person` field targets canonical global ID `kiyoten`.

Canonical identity corrections in this migration are:

- `ito` → `ito-tomohiro`
- `seiten` → `kiyoten`
- `ham-kento` → `hama-kento`

## Presence and roles

Presence answers how a Person appears in this project. Allowed values are `host`, `on-site`, `live-call`, `live-space`, `submitted`, `referenced`, and `account-context`.

Roles answer what the Person is credited for. They are independent of presence and use `cast`, `production`, `action`, `host`, or `ensemble`, with optional work, character, sessions, and credit details.

The derived relevance score is implemented in `src/lib/projectPeople.ts`:

| Presence | Weight |
| --- | ---: |
| host | 3 |
| on-site | 2 |
| live-call | 2 |
| live-space | 2 |
| submitted | 1 |
| referenced | 0.5 |
| account-context | 0.25 |

Within one project, relevance is the maximum presence weight. Across projects, those project scores are summed. This avoids double-counting a Person who has several presence labels in the same project.

## Reader projection

Broadcast projects keep the public URL `?view=mentions`, but the fourth tab is now a lightweight Index grouped as 本期参与, 提及人物, Works, and Context. Timeline inline Person links point to that project Index card first.

Komatsu36 keeps its existing People presentation. The loader joins the global identity and Project Person Context, then derives the legacy view fields expected by the established components. This adapter is a UI compatibility boundary, not a second source of truth.

## Verification

Run `npm run verify:person-model` for canonical IDs, context counts, identity uniqueness, and relevance rules. `npm run validate` also runs content validation, build, publication checks, and existing project regressions.
