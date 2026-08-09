# Komatsu36 RC 0.9 Visual QA evidence

Generated from the real `/projects/komatsu36/` route on the local Astro preview server (`127.0.0.1:4322`) on 2026-08-09. These files are review evidence only; they are not published site assets.

| File | Viewport | Route/state |
|---|---:|---|
| `01-desktop-overview.png` | 1440×900 | `?view=overview` |
| `02-desktop-timeline.png` | 1440×900 | `?view=timeline` |
| `03-desktop-thread.png` | 1440×900 | `?view=storylines&thread=russian-takoyaki` |
| `04-desktop-player-loaded.png` | 1440×900 | `?view=timeline`, YouTube iframe loaded after click |
| `05-mobile-overview.png` | 390×844 | `?view=overview` |
| `06-mobile-timeline.png` | 390×844 | `?view=timeline` |
| `07-mobile-thread-sheet.png` | 390×844 | `?view=storylines&thread=russian-takoyaki` |
| `08-mobile-mini-player.png` | 390×844 | `?view=storylines&event=sp2-011242-uchida-connected`, scrolled to sticky player |

QA observations:

- Three media sources remain visible at both widths; no horizontal overflow.
- SP2 external state shows `TARGET · 01:12:42` and the canonical X CTA without a fake player clock.
- Thread opens as a narrow-screen sheet; focus containment, `inert`, Esc and focus restore were separately tested.
- `04-desktop-player-loaded.png` proves iframe load and UI layout only. It is not real-audio playback or long-soak acceptance.
- Console errors: 0 for the application page. The browser harness may emit its own unrelated telemetry timeout; that is not page console output.
