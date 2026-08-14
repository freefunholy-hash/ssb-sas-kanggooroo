# Design Brief

## Direction

Sky Pitch Simplified — a clean football-academy identity on a confident blue field, with crisp white box-style menus and a friendly kangaroo mascot as the brand anchor.

## Tone

Simple, confident, friendly. Blue dominates, white boxes hold the navigation and content, and the kangaroo mascot brings warmth. Green is a quiet accent — never the hero.

## Differentiation

White box menus floating on a deep blue field, a prominent kangaroo logo, and mono-set stats make the academy feel like a real club sheet — not a generic form app.

## Color Palette

| Token       | OKLCH          | Role                                         |
| ----------- | -------------- | -------------------------------------------- |
| background  | 0.52 0.15 250  | Blue page field                              |
| foreground  | 0.99 0.005 240 | Near-white body text                         |
| card        | 1 0 0          | Pure white elevated cards / menu boxes       |
| primary     | 0.45 0.18 250  | Athletic blue — CTAs, links, active menu     |
| secondary   | 0.30 0.10 255  | Deep navy — footer, admin sidebar            |
| muted       | 0.46 0.13 250  | Darker blue band for alternating sections    |
| accent      | 0.55 0.16 145  | Pitch green — badges, mascot only (minimal)  |
| destructive | 0.55 0.20 25   | Red card — delete / error                    |

## Typography

- Display: Space Grotesk — headings, club wordmark, section titles (700, tight tracking)
- Body: DM Sans — paragraphs, forms, labels (400/500)
- Mono: GeistMono — NISN, squad numbers, stats (tabular-nums)
- Scale: hero `text-5xl md:text-7xl font-display`, h2 `text-3xl font-display`, label `text-sm font-medium uppercase tracking-wide`, body `text-base`

## Elevation & Depth

White boxes lift off the blue field with soft navy-tinted shadows (`shadow-subtle` default, `shadow-menu` on nav boxes, `shadow-elevated` on hover); the hero uses a radial blue gradient for atmospheric depth.

## Structural Zones

| Zone    | Background         | Border     | Notes                                            |
| ------- | ------------------ | ---------- | ------------------------------------------------ |
| Header  | `bg-card`          | `border-b` | Sticky white bar, kangaroo logo + `.nav-box` menu |
| Hero    | `bg-hero-field`    | —          | Radial blue gradient, prominent kangaroo mascot   |
| Content | `bg-background` / `bg-muted/40` alt | — | Alternating blue & darker-blue section bands    |
| Stats   | `bg-card`          | `border`   | White stat cards with mono numbers                |
| Footer  | `bg-secondary`     | `border-t` | Deep navy, near-white text, academy contact info |

## Spacing & Rhythm

Section gaps `py-16 md:py-24`; content grouping `gap-6`; cards `p-6`; nav boxes `px-4 py-2` with `gap-2`; form fields `space-y-4`.

## Component Patterns

- Nav boxes: `.nav-box` white chip with blue text, hover lifts + shadow, active state flips to blue bg
- Buttons: primary `bg-primary text-primary-foreground rounded-md`, hover lifts + `shadow-elevated`
- Cards: `rounded-xl bg-card shadow-subtle border`, hover `shadow-elevated` + `transition-smooth`
- Badges: position/squad pills `rounded-full bg-accent/15 text-accent`, mono number chips
- Forms: white inputs `rounded-md border-input`, focus `ring-ring`

## Motion

- Entrance: `animate-fade-in-up` 0.6s on hero + section content, staggered
- Hover: `transition-smooth` on cards/buttons/nav boxes, shadow lift + slight `translateY(-2px)`
- Decorative: `animate-mascot-float` 4s on kangaroo mascot; `animate-mascot-bounce` on interaction

## Constraints

- Public registration pages must not require login; admin edit/delete surfaces live in a separate dark sidebar zone
- PDF generation is backend-only — no browser print UI; design a "Cetak PDF" button that calls backend, never `window.print`
- Use only bundled fonts (Space Grotesk, DM Sans, GeistMono); no Google Fonts CDN
- Green accent stays minimal — badges and mascot only, never large surface fills

## Signature Detail

The kangaroo mascot in a football kit, prominently placed in the hero and header logo, gently floating over the blue field with a subtle bounce on interaction — the single most memorable brand moment of the academy.
