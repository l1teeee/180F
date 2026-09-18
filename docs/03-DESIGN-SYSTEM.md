# 03 — Design System

Visual reference: the four reference frames supplied by the client (fitness dashboard, soft lavender/pastel, large rounded cards) plus master plan §12–§14. The reference is the **graphic line**, not a template to clone (§12).

What the reference establishes, in one line: *white cards on a warm off-white canvas, 24 px corners, almost no shadow, enormous numbers with tiny units, pastel pills for deltas, hatched bars with one ink-black highlight, soft purple wave charts.*

---

## 1. Colour tokens

Defined once, in `src/app/globals.css`, as a Tailwind v4 `@theme` block. Nothing else defines a colour.

```css
@theme {
  /* canvas + surfaces */
  --color-background:      #F7F7F5;
  --color-canvas-wash:     #F8F6FD;  /* faint lavender wash behind the shell */
  --color-surface:         #FFFFFF;
  --color-surface-muted:   #F1F1EF;
  --color-surface-lilac:   #F6F4FE;  /* nested panels inside gradient cards */

  /* text + lines */
  --color-ink:             #171717;  /* = text-primary, also the strong accent */
  --color-text-secondary:  #737373;
  --color-text-tertiary:   #A3A3A3;
  --color-border:          #ECECEA;
  --color-border-soft:     #F2F0FA;

  /* brand */
  --color-purple:          #7869D4;
  --color-purple-deep:     #5B4CBF;  /* text on purple-soft, AA on light */
  --color-purple-soft:     #DDD8FA;
  --color-purple-xsoft:    #F0EDFF;

  /* pastels */
  --color-yellow:          #F5D889;
  --color-yellow-soft:     #FFF4D3;
  --color-green:           #BFE5CA;
  --color-green-soft:      #E7F5EB;
  --color-pink:            #F2C9D3;
  --color-pink-soft:       #FCEFF3;
  --color-blue:            #D8E6F6;
  --color-blue-soft:       #EDF4FC;
  --color-danger:          #EF8F8F;
  --color-danger-soft:     #FCEAEA;
}
```

`--color-purple-deep`, `--color-text-tertiary`, `--color-border-soft`, `--color-canvas-wash`, `--color-surface-lilac` and the `*-soft` companions for pink/blue/danger are additions required to hit AA contrast and to reproduce the reference's layered lavender surfaces. Everything else is master plan §13 verbatim.

Distribution discipline (§13): ~70 % neutral, ~20 % pastel, ~10 % strong accent. The strong accent is **ink black**, used sparingly and deliberately — exactly as the reference uses one black bar in a field of pale bars.

---

## 2. Gradients, patterns and shadows

```css
@theme {
  --gradient-card-lilac:  linear-gradient(158deg, #FFFFFF 0%, #F7F5FE 48%, #EFEBFD 100%);
  --gradient-tile-purple: linear-gradient(150deg, #C9BFF6 0%, #A99BEB 100%);
  --gradient-tile-yellow: linear-gradient(150deg, #FBE9AE 0%, #F3D072 100%);
  --gradient-tile-ink:    linear-gradient(150deg, #2B2B2B 0%, #121212 100%);
  --gradient-chart-purple: linear-gradient(180deg, rgba(120,105,212,0.22) 0%, rgba(120,105,212,0) 100%);

  --shadow-card:  0 4px 18px rgba(0,0,0,0.04);
  --shadow-raise: 0 8px 26px rgba(23,23,23,0.07);   /* hover only */
  --shadow-tile:  0 10px 30px rgba(120,105,212,0.18);
  --shadow-modal: 0 24px 60px rgba(23,23,23,0.16);  /* overlays only, section 11 */

  --color-scrim:       rgba(23,23,23,0.28);
  --color-danger-deep: #A34A4A;   /* destructive button fill; white on it is 5.9:1 */
}
```

Two patterns, both decorative and both optional:

- **Hatch** — `repeating-linear-gradient(135deg, #EFECFB 0 6px, #F7F5FE 6px 12px)`, the fill of non-highlighted bars in the weekly chart.
- **Dot field** — a 1 px `#E4E0F5` dot on a 16 px grid, at ≤ 40 % opacity, used behind empty states and the public booking hero only. Never behind data.

No glassmorphism, no heavy gradients on content surfaces, no shadow above `--shadow-raise` (§12).

---

## 3. Shape and spacing

```css
@theme {
  --radius-card:    24px;  /* primary cards, dialogs */
  --radius-card-sm: 18px;  /* nested panels, secondary cards */
  --radius-tile:    20px;  /* category tiles */
  --radius-field:   12px;  /* inputs, selects, small buttons */
  --radius-chip:    14px;
  --radius-pill:    999px; /* badges, nav pills, avatar, icon buttons */
}
```

| Context | Value |
|---|---|
| Sidebar width | 240 px (collapses to drawer below `lg`) |
| Main content padding | 28 px desktop, 24 px tablet, 16 px mobile |
| Max content width | 1500 px |
| Grid gap | 20 px, 24 px on the dashboard bento |
| Card padding | 24 px (main), 18 px (secondary) |
| Section rhythm | 24 px between stacked cards |

---

## 4. Typography

Manrope via `next/font/google` (`--font-manrope`, weights 400/500/600/700/800), fallback `Inter, ui-sans-serif, system-ui, sans-serif`.

| Role | Size / weight / tracking | Notes |
|---|---|---|
| Page title | 30 px / 700 / -0.02em | "Fitness Overview" equivalent |
| Hero metric | 44 px / 800 / -0.03em | the reference's `24.6` scale |
| Card metric | 32 px / 700 / -0.02em | KPI cards |
| Metric unit | 14 px / 600, `--color-text-secondary` | baseline-aligned suffix (`km`, `bpm`, `%`) |
| Section title | 20 px / 650 | card headers |
| Card label | 15 px / 600 | |
| Body | 14–15 px / 500 | |
| Small label | 12–13 px / 500, secondary | table headers use 12 px / 600 uppercase, `0.04em` |
| Pill text | 12 px / 600 | |

Numbers use `font-variant-numeric: tabular-nums` everywhere they can change (KPIs, tables, capacity counters).

---

## 5. Component language

### Card
White surface, `--radius-card`, `1px solid --color-border`, `--shadow-card`. Header row: title left (section title), controls right (a `Monthly ▾` style select and/or a `⋮` icon button, both 32 px, ghost). Hero cards may swap the flat white for `--gradient-card-lilac` with `border-color: --color-border-soft`.

### Stat card
Label (small, secondary) → metric (card metric + unit) → delta pill. Optional pastel accent as a soft tinted icon square (40 px, `--radius-chip`), never a full-bleed colour block.

### Pills and badges
Height 26 px, `--radius-pill`, 12 px/600, 10 px horizontal padding.

| Meaning | Background | Text |
|---|---|---|
| Positive delta / Confirmed | `green-soft` | `#2F6B45` |
| Pending / Warning | `yellow-soft` | `#8A6B1F` |
| Cancelled / Danger | `danger-soft` | `#A34A4A` |
| Waitlist / Neutral-brand | `purple-xsoft` | `purple-deep` |
| Info | `blue-soft` | `#3A5C80` |

Status is always icon-or-shape **plus** text, never colour alone (§49).

### Ink chip bar
The reference's black stat chip: `--color-ink` background, `--radius-pill`, 12 px/600 white text, inline micro-stats separated by a 1 px `rgba(255,255,255,0.15)` divider, optional 28 px circular action button in `--color-yellow` with an ink arrow icon. Used at most once per screen — it is the strong accent.

### Category tile
`--radius-tile`, one of `--gradient-tile-purple | -yellow | -ink`, 150–170 px tall. Content: title (16 px/700, white or ink depending on tile), sublabel (12 px/500 at 80 % opacity), a status pill, and a white wavy sparkline overlay in the lower half. No stock photos of people — abstract pastel waves instead (privacy rule §9 and no licensed assets).

### Overlays
Dialogs, sheets, the command palette and every confirmation live in section 11. They are not "a card with a scrim": they have their own size scale, structure, motion and focus rules.

### Buttons
| Variant | Style |
|---|---|
| Primary | `--color-purple-deep` fill, white text, `--radius-field`, 40 px, hover `#4E40A8`. White on `--color-purple` measures 4.40:1 and fails AA for normal text, so the deeper token is the fill and `--color-purple` is reserved for data marks, rails and focus rings. |
| Ink | `--color-ink` fill, white text, `--radius-pill`, used for the single hero CTA per screen (`+ New booking`) |
| Secondary | white fill, `1px --color-border`, ink text |
| Ghost | transparent, secondary text, hover `surface-muted` |
| Icon | 40 px circle, white, `1px --color-border`, hover `--shadow-raise` |

### Navigation
Sidebar item: 44 px tall, `--radius-field`, 14 px/600, icon 18 px. Active = `--color-purple-xsoft` background, `--color-ink` text, `--color-purple` 3 px left rail (§15). Hover = `--color-surface-muted`. The reference's ink pill is reserved for CTAs and the calendar `Today` control so the sidebar stays calm.

### Inputs
40 px, `--radius-field`, `1px --color-border`, white; focus = `--color-purple` border + 3 px `rgba(120,105,212,0.18)` ring. Search input carries a 16 px leading icon and the placeholder `Search customers, classes...`.

### Table
No outer border, 1 px `--color-border` row dividers, 52 px rows, 12 px/600 uppercase header in `--color-text-tertiary`, hover row `--color-surface-muted`. Below `md` the table becomes a card list (§14).

### Avatars
Circular, initials fallback on a deterministic pastel from the token set. `AvatarGroup` overlaps at `-8px` with a white 2 px ring and a `+N` counter chip.

---

## 6. Data visualisation

Recharts, restrained, always paired with a text summary for screen readers (§18, §49).

- **Weekly bookings** — bar chart. Bars `--radius-pill` (fully rounded), 28–34 px wide, filled with the hatch pattern; the highlighted bar (today, or the hovered bar) is solid `--color-ink`. No vertical grid, horizontal grid `1px dashed --color-border-soft`, no axis lines. A lavender annotation pill with a dashed `#C9C1F0` connector may mark the highlighted value, exactly as the reference marks `25%`.
- **Trend / area** — smooth `monotone` line, `--color-purple`, 2.5 px, area filled with `--gradient-chart-purple`, single dot marker (6 px purple fill, 3 px white ring) on the focused point.
- **Occupancy bars** — horizontal, 8 px tall, `--radius-pill`, track `--color-surface-muted`, fill in the class accent; the percentage sits to the right in tabular numerals.
- **Tooltip** — white card, `--radius-card-sm`, `--shadow-card`, no border, 13 px, label in secondary, value in ink 600.
- Palette order for multi-series: purple, yellow, green, blue, pink. Never more than three series in one chart.

---

## 7. Motion

The full motion system is section 12. In one line: 150-260 ms, `--ease-out`, opacity and transform only, nothing loops except skeletons, and everything collapses under `prefers-reduced-motion`.

---

## 8. Responsive behaviour

| Breakpoint | Layout |
|---|---|
| ≥ 1440 px | sidebar + 12-column bento, KPI row of 4 |
| 1280–1439 px | same, gaps 20 px, hero metric 40 px |
| 1024–1279 px | sidebar persists, KPI row of 2 |
| 768–1023 px | sidebar becomes drawer, single-column cards, tables → card lists |
| < 768 px | 16 px gutters, KPI cards stack, public booking is the mobile-first reference experience |

---

## 9. shadcn/ui bridge

shadcn primitives are the starting point only (§3). `globals.css` maps shadcn's semantic variables onto the tokens above so every primitive inherits the brand without per-component overrides:

Two blocks are required, and only the second one makes Tailwind emit utilities. Declaring `--primary` on `:root` alone does **not** create `bg-primary` in Tailwind v4: the semantic names must also be registered as theme colours.

```css
:root {
  --background: var(--color-background);   --card: var(--color-surface);
  --foreground: var(--color-ink);          --popover: var(--color-surface);
  --primary: var(--color-purple-deep);     --primary-foreground: #FFFFFF;
  --secondary: var(--color-surface-muted); --secondary-foreground: var(--color-ink);
  --muted: var(--color-surface-muted);     --muted-foreground: var(--color-text-secondary);
  --accent: var(--color-purple-xsoft);     --accent-foreground: var(--color-purple-deep);
  --destructive: var(--color-danger);      --destructive-foreground: #FFFFFF;
  --card-foreground: var(--color-ink);     --popover-foreground: var(--color-ink);
  --border: var(--color-border);           --input: var(--color-border);
  --ring: var(--color-purple);             --radius: 12px;
}

@theme inline {
  --color-primary: var(--primary);        --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);    --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);            --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);          --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);--color-destructive-foreground: var(--destructive-foreground);
  --color-card: var(--card);              --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);        --color-popover-foreground: var(--popover-foreground);
  --color-input: var(--input);            --color-ring: var(--ring);
}
```

`--color-border` and `--color-background` already exist in the `@theme` block, so `border-border` and `bg-background` work without a second mapping. Do not map a name onto a variable that resolves back to itself, which creates a cycle Tailwind cannot evaluate.

After installation every primitive is restyled: radii to the scale in §3, shadows to `--shadow-card`, focus rings to the purple ring, default `rounded-md` replaced. A screen that still reads as stock shadcn is a review failure (§3, §69).

---

## 10. Accessibility floor

- Body text ≥ 4.5:1 on its surface. `--color-text-secondary` (#737373, 4.6:1 on white) passes and is the floor for any text that carries meaning. `--color-text-tertiary` (#A3A3A3, 2.5:1) is **decorative or disabled-state only** — never table headers, never labels, never any text a reader must read.
- Text on a pastel or gradient surface is `--color-ink`, not white. White on the lavender tile measures 1.7:1 to 2.5:1. White text is used only on `--color-ink` surfaces and on the `--color-purple-deep` button fill.
- Pastel fills are backgrounds only — text on them uses the darker paired token from §5.
- Focus is always visible, and it is an `outline`, not a `box-shadow` — see section 12.6. A box-shadow ring does not follow `border-radius`, which is why an early build drew a square ring around a rounded search input.
- Charts carry a text summary and a data table alternative where the chart is the only source of a number.
- Hit targets ≥ 40 px; icon-only buttons carry `aria-label`.

---

## 11. Overlays: dialogs, sheets and the command palette

Six overlay patterns cover every modal surface the demo needs. They share one container language so a booking dialog and a cancellation confirm read as the same product.

### 11.1 Scrim

`--color-scrim` (`rgba(23,23,23,0.28)`) with `backdrop-filter: blur(2px)`. One scrim only — overlays never stack. The scrim fades in over 150 ms and closes the overlay on click, except on a destructive confirm, where the user must choose explicitly.

### 11.2 Container

| Property | Value |
|---|---|
| Surface | `--color-surface` |
| Radius | `--radius-card` (24 px) |
| Border | `1px --color-border` |
| Shadow | `--shadow-modal` |
| Padding | 24 px |
| Max height | `85vh`, body scrolls, header and footer stay fixed |

Size scale, by content rather than by taste:

| Size | Width | Used by |
|---|---|---|
| `sm` | 420 px | confirmations, single-field edits |
| `md` | 520 px | forms with up to six fields (`BookingDialog`, `PlanEditDialog`) |
| `lg` | 680 px | message previews, anything with a preview pane |
| `sheet` | 420 px, right-anchored | `SessionDetailsSheet` |
| `palette` | 560 px, anchored 12vh from the top | global search |

### 11.3 Structure

```
Header    title (section title, 20px/650)
          description (14px, --color-text-secondary)   optional
          close button (40px circle, ghost, top-right, aria-label "Close")
Body      20px gap stack, scrollable, never more than two columns
Footer    1px --color-border top rule, 20px padding-top,
          actions right-aligned, 12px gap, secondary left of primary
```

Below `sm` the footer becomes a full-width stack with the primary action on top, because a thumb reaches the bottom of the screen first.

### 11.4 The six patterns

**A. Form dialog** — `md`. `BookingDialog` is the reference: customer and class selects on one row, date and time on the next, instructor read-only and derived from the session. Above the footer sits a capacity strip: an `OccupancyBar` plus `12 / 15 spots reserved` in tabular numerals, which turns into the amber `Almost full` pill at >= 85 % and the `Full` pill at capacity. When the session is full the primary action switches to `Join waitlist` instead of being disabled, and the reason is stated in one line.

**B. Confirm dialog** — `sm`, destructive. A 40 px tinted square (`--color-danger-soft` background, `--color-danger-deep` icon) sits above the title. Body states the consequence in one sentence, naming the record. Footer is `Cancel` (secondary) and the destructive action filled with `--color-danger-deep` and white text. Clicking the scrim does not close it.

**C. Side sheet** — `sheet`. Inset 12 px from the viewport edges so it floats like every other card, all four corners at 24 px. `SessionDetailsSheet` shows class, date, time, instructor, room, a capacity block and the booking list, with `View bookings` and `Edit class` in a sticky footer. Enters with a 220 ms `translateX(100%) -> 0`.

**D. Bottom sheet** — the automatic mobile form of A and C below `sm`. Anchored to the bottom edge, full width, top corners 24 px, bottom corners 0, with a 36x4 px `--color-border` grab handle centred above the header. Enters with `translateY(100%) -> 0` over 220 ms.

**E. Command palette** — `palette`. Search row with a leading 18 px icon, no border and no focus ring (the container carries the focus state), placeholder `Search customers, classes...`. Results group under 12 px uppercase `--color-text-secondary` labels: Customers, Classes, Instructors. The active row is `--color-purple-xsoft` with ink text and moves with the arrow keys, never only on hover. A footer rule carries keycaps for up and down, Enter and Esc. Empty query shows recent entities; empty result shows an `EmptyState` with no illustration.

**F. Message preview dialog** — `lg`. Used by the WhatsApp simulation. A left column holds the template fields, a right column renders the message as a chat bubble on `--color-green-soft` with a `Delivered` timestamp. A `Simulated` pill in `--color-purple-xsoft` sits in the header and is never removable: nothing here may look like a real send (master plan 33 and 66.9). `Send test` shows a spinner for about 800 ms then raises the toast `Test message sent`.

### 11.5 Motion

Scrim 150 ms fade. Container 200 ms, `opacity 0 -> 1` with `translateY(8px) -> 0`, easing `cubic-bezier(0.22, 1, 0.36, 1)`. Sheet and bottom sheet 220 ms on their own axis. Closing runs at 150 ms. Under `prefers-reduced-motion: reduce` everything degrades to opacity alone.

### 11.6 Accessibility, non-negotiable

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the title, `aria-describedby` on the description when one exists.
- Focus moves into the overlay on open — to the first field in a form, to the safe action in a confirm, never to the destructive one.
- Focus is trapped while open, `Esc` closes, and focus returns to the element that opened it.
- Background scroll is locked; the page behind must not move.
- The close button is an icon button with `aria-label="Close"`; closing is never available only by clicking the scrim.
- The command palette is fully operable from the keyboard: arrows move, Enter opens, Esc closes, and the active option is exposed with `aria-activedescendant`.

---

## 12. Motion system

Motion here has one job: make state changes legible. It never decorates, never delays a click, and never re-runs because data changed.

### 12.1 Tokens

```css
@theme {
  --duration-instant:    100ms;  /* press feedback */
  --duration-fast:       150ms;  /* hover, scrim, exits */
  --duration-base:       200ms;  /* the default for anything entering */
  --duration-slow:       260ms;  /* larger surfaces, progress fills */
  --duration-deliberate: 320ms;  /* bottom sheet, mobile drawer */
  --duration-shimmer:   1400ms;  /* skeleton sweep, the only loop */

  --ease-out:      cubic-bezier(0.22, 1, 0.36, 1);     /* entrances - the default */
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);          /* exits */
  --ease-inout:    cubic-bezier(0.65, 0, 0.35, 1);      /* moving between two visible states */
  --ease-emphasis: cubic-bezier(0.34, 1.26, 0.64, 1);   /* one restrained overshoot, rare */
}
```

`--ease-emphasis` is permitted in exactly two places: the success check on the booking confirmation, and the switch knob. Anywhere else it reads as a toy.

### 12.2 The patterns

| # | Pattern | Properties | Duration / easing | Used by |
|---|---|---|---|---|
| 1 | Hover lift | `box-shadow` card -> raise, `translateY(-2px)` | fast / out | clickable cards and tiles only |
| 2 | Press | `scale(0.98)` | instant / out | buttons, clickable cards |
| 3 | Fade up | `opacity 0->1`, `translateY(8px)->0` | base / out | page sections, dialogs, popovers |
| 4 | Stagger | pattern 3 with `40ms` per child | capped at 6 children | KPI row, card grids |
| 5 | Shimmer | `translateX(-100% -> 100%)` over a gradient | shimmer / linear, loops | skeletons |
| 6 | Number roll | count up to the final value | 600ms / out | KPI metrics, first data arrival only |
| 7 | Bar fill | `width 0 -> n%` | slow / out | occupancy bars, progress |
| 8 | Chart draw | Recharts `animationDuration` | 400ms, `60ms` stagger per series | mount only |
| 9 | Route change | content `opacity` only | fast / out | the main content area; the sidebar never animates |
| 10 | Toast | `translateY(16px)->0` + fade | base in / fast out | sonner, auto-dismiss at 4s |
| 11 | Overlays | see section 11.5 | | dialog, sheet, bottom sheet, palette |
| 12 | Collapse | `grid-template-rows 0fr -> 1fr` | base / inout | accordions, filter panels |
| 13 | Tab indicator | `transform` | base / inout | tab bars, status tabs |
| 14 | Drawer | `translateX(-100%)->0`, scrim fade | deliberate / out | mobile sidebar |
| 15 | Switch knob | `translateX` | 160ms / emphasis | toggles |
| 16 | Focus ring | none - appears instantly | — | every interactive element |

Collapse uses `grid-template-rows`, not a `max-height` guess, because a wrong guess either clips content or adds dead delay.

### 12.3 Rules

1. Animate `opacity` and `transform` only. The two exceptions are bar fills (`width`) and collapses (`grid-template-rows`), both on small surfaces.
2. **Data changes do not animate.** A chart re-runs its draw on mount and never again; a KPI rolls once, on first arrival. When a booking is created the numbers must move instantly, because the point of that demo moment is that every screen already agrees.
3. Nothing loops except the skeleton shimmer and the simulated send spinner.
4. No animation ever gates input. A dialog is interactive from the first frame.
5. Stagger is capped at six children. A 148-row table does not cascade.
6. No parallax, no scroll-driven motion, no spring overshoot outside `--ease-emphasis`'s two uses.
7. Entrances use `--ease-out`, exits `--ease-in` and are always faster than the entrance.

### 12.4 Reduced motion

Under `prefers-reduced-motion: reduce`:

- every transform-based pattern drops to opacity alone, capped at `--duration-fast`;
- the shimmer becomes a static `--color-surface-muted` fill;
- the number roll renders the final value immediately;
- bar fills and chart draws render at their final state with no transition;
- overlays still fade, because an instant appearance is disorienting; nothing translates.

This is implemented once, as a global block in `globals.css`, not per component.

### 12.5 Implementation

Keyframes and utilities live in `globals.css` next to the tokens: `animate-fade-up`, `animate-stagger` (via a `--stagger-index` custom property), `animate-shimmer`, `animate-scrim-in`, `animate-dialog-in`, `animate-sheet-in`, `animate-bottom-sheet-in`, `animate-toast-in`, `animate-drawer-in`. Components reference a utility; they never write a bespoke `transition` or `@keyframes`.

### 12.6 Focus, corrected

The focus ring is an `outline`, never a `box-shadow`: an outline follows `border-radius`, a box-shadow does not, which is what produced a square ring around the rounded search input. It is also scoped to genuinely interactive elements rather than every focusable node:

```css
@layer base {
  :where(a[href], button, input, select, textarea, summary,
         [role="button"], [role="option"], [role="tab"],
         [tabindex]:not([tabindex="-1"])):focus-visible {
    outline: 2px solid var(--color-purple);
    outline-offset: 2px;
  }
}
```

Rules that follow:

- `:focus-visible` only. A mouse click on an input must not paint a ring; keyboard navigation must.
- Never `outline: none` without this replacement.
- A container, card, section or wrapper `div` never shows a ring. If one does, it carries a `tabindex` it should not have.
- The ring does not transition. It appears on the frame the element is focused.
- A specimen that illustrates the focused state in the design system uses a static class, never the live pseudo-class, and is marked as a specimen.
