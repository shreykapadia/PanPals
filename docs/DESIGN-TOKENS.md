# DESIGN-TOKENS.md — PanPal Aesthetic Design System (v2.0.0)

Single source of truth for all styling. Never hardcode a hex, font, or radius in
component code — consume these via the NativeWind theme in `theme/`. This file is
the **PanPal Aesthetic Design System v2.0.0** the team adopted on 2026-07-21
(DECISIONS.md D21); it supersedes the earlier "Mindful Beauty Narrative" token
set and the retired `panpal_design.md`.

> Values below are written in Tailwind terms (the uploaded system targets Tailwind
> / a 393×852 mobile frame). We build in React Native with **NativeWind**, which
> uses the same Tailwind class names — so `rounded-full`, `h-12`, `text-sm`, etc.
> map directly. Fonts: **Libre Caslon Text** (serif, headlines) + **Satoshi**
> (everything else).

## 1. Color palette (canonical)

The seven you'll use most (from the design spec §2):

| Role                           | Hex       | Notes                                                           |
| ------------------------------ | --------- | --------------------------------------------------------------- |
| Surface / app background       | `#FFF8F4` | creamy off-white                                                |
| Card surface                   | `#FFFFFF` | pure white                                                      |
| Primary accent / CTA           | `#F2A2A2` | Soft Dusty Pink ("PanPal Rose") — CTAs + progress fill          |
| Primary text / dark neutral    | `#333333` | deep charcoal                                                   |
| Subtle border                  | `#E0D9D4` | warm grey (`border-[#E0D9D4]`) — also the ring background track |
| Success / eco badge            | `#A8C69F` | sage green                                                      |
| Warning / friction / intercept | `#F8D7DA` | soft amber/peach — never red                                    |

Full token set (from the design system frontmatter — use these in `theme/`):

```yaml
colors:
  surface: '#FFF8F4'
  surface-dim: '#e4d7d6'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fef1f0'
  surface-container: '#f8ebea'
  surface-container-high: '#f2e5e4'
  surface-container-highest: '#ede0df'
  on-surface: '#201a1a' # deepest text; practical primary text = #333333 (§2)
  on-surface-variant: '#534343' # secondary text
  inverse-surface: '#362f2e'
  inverse-on-surface: '#fbeeed'
  outline: '#857372'
  outline-variant: '#d7c1c1'
  surface-tint: '#8c4c4d'
  primary: '#8c4c4d' # deep rose — pressed/emphasis
  on-primary: '#ffffff'
  primary-container: '#f2a2a2' # "PanPal Rose" — CTAs, progress fill
  on-primary-container: '#713638'
  inverse-primary: '#ffb3b3'
  secondary: '#4a6545'
  on-secondary: '#ffffff'
  secondary-container: '#c9e8bf'
  on-secondary-container: '#4f6a49'
  tertiary: '#2c694f'
  on-tertiary: '#ffffff'
  tertiary-container: '#86c4a5'
  on-tertiary-container: '#10523a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  background: '#fff8f7'
  on-background: '#201a1a'
  surface-variant: '#ede0df'
  card-surface: '#FFFFFF'
  dark-neutral: '#333333' # primary text
  border-warm: '#E0D9D4' # subtle border + ring track
  warning-peach: '#F8D7DA' # warning / intercept
  eco-sage: '#A8C69F' # success / eco badge
  inactive-gray: '#8C857B' # inactive nav icon
  muted-text: '#666666' # body-secondary text
```

## 2. Typography hierarchy (STRICT)

Libre Caslon Text (serif) for headlines only; **Satoshi** (sans) for everything else.

> **Getting the fonts (Shrey, Phase 0):** Satoshi is not on Google Fonts — download
> it free from **fontshare.com/fonts/satoshi** (ITF Free License, commercial use OK),
> drop the `.otf`/`.ttf` weights (Regular 400, Medium 500, Semibold 600, Bold 700)
> into `assets/fonts/`, and load them with `expo-font`. Libre Caslon Text is on
> Google Fonts (`@expo-google-fonts/libre-caslon-text`). Weights used: Satoshi
> 400/500/600/700; Caslon 600/700.

> **2026-07-26 revision (font-size accessibility audit):** Body/button/caption
> sizes bumped up a step — 12px and 14px land below the ~16px floor most
> platform accessibility guidance (Apple HIG, Material, Lighthouse "legible
> font sizes") treats as safe for anything conveying real information, not
> just decoration. Error, legal, and form-hint copy were the worst offenders
> at 12px. Headings (H1/H2) were already fine and are unchanged.

| Style                  | Font              | Size               | Weight | Line height        | Notes                    |
| ---------------------- | ----------------- | ------------------ | ------ | ------------------ | ------------------------ |
| H1 / hero title        | Libre Caslon Text | 24px (`text-2xl`)  | 700    | 32px (`leading-8`) |                          |
| H2 / section header    | Libre Caslon Text | 18px (`text-lg`)   | 600    | 24px (`leading-6`) |                          |
| H3 / card title        | Satoshi           | 16px (`text-base`) | 600    | 20px (`leading-5`) |                          |
| Body primary           | Satoshi           | 16px (`text-base`) | 400    | 24px (`leading-6`) |                          |
| Body secondary / muted | Satoshi           | 14px (`text-sm`)   | 400    | 20px               | color `#666666`          |
| Button label           | Satoshi           | 16px (`text-base`) | 600    | —                  | `tracking-wide` (0.25px) |
| Badge / micro-copy     | Satoshi           | 12px (`text-xs`)   | 500    | —                  | uppercase / badge style  |

## 3. Radius & spacing

```yaml
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px # buttons, inputs, chips (pills)
spacing:
  page-padding-x: 1rem # px-4 (16px)
  page-padding-y: 1rem # py-4 (16px)
  gutter: 1rem
  header-height: 3.5rem # h-14 (56px)
  footer-height: 5.5rem # h-22 (88px) — increased from 80px for centre ⊕ Log action (D23)
```

Target viewport: mobile app frame **393 × 852**.

## 4. Standard UI components

- **Primary CTA:** full width (`w-full`), height `h-12` (48px), `rounded-full`
  (pill), background `#F2A2A2`, text `#333333`, `font-semibold`.
- **Secondary / outline button:** `h-12`, `rounded-full`, `border border-[#E0D9D4]`,
  background `#FFFFFF`, text `#333333`.
- **Text input:** `h-12`, `rounded-2xl`, `border border-[#E0D9D4]`, background
  `#FFFFFF`, text `text-sm` (14px).
- **Card:** `rounded-3xl` (24px), background `#FFFFFF` (or `#FAFAFA`),
  `border border-[#E0D9D4]`, padding `p-4` (16px), `shadow-sm` or flat. Never hard
  black shadows or heavy borders — hierarchy comes from tonal layering.
- **Progress donut / rings:** stroke `stroke-[10px]`, **rounded caps always**,
  fill `#F2A2A2`, background track `#E0D9D4`.
- **Chips / badges:** pill, low-contrast (e.g. light sage bg + dark sage text).
- **Icons:** 1.5–2pt line icons, rounded terminals; filled only for active states.
- **Warnings never alarm:** the soft amber/peach `#F8D7DA` informs without anxiety;
  intercept banners use blush tones, not red. Error red `#ba1a1a` is for real failures only.

## 5. Navigation & shell

- **Top app bar:** height `h-14` (56px), background `#FFF8F4`, centered "PanPal"
  serif wordmark (Libre Caslon Text, 20px, bold), 1px bottom border `#E0D9D4`.
- **Bottom navigation bar:** fixed, height `h-22` (88px), top corners
  `rounded-t-3xl`, background `#FFFFFF`, 1px top border `#E0D9D4`. Active icon
  `#F2A2A2`, inactive icon `#8C857B`.
- **Bottom destinations (4 + ⊕ Log):** **Home | Inventory | ⊕ Log | Wishlist | Empties** —
  icon + label each. Centre ⊕ keeps a 64pt footprint: a **flat** rose disc (`#F2A2A2`, 56pt —
  no gradient, no sheen) inside a 4pt `#FFFFFF` ring, so the bar's top border stops at the ring
  instead of running behind the disc. Soft charcoal lift (`#333333`, offset {0,3}, opacity 0.12,
  radius 6) — never a coloured glow. Charcoal `Plus` glyph (`#333333`, 24pt, stroke 2, matching the
  destination icons), 11pt Satoshi-Medium "Log" label in inactive `#8C857B` so the label row reads as
  one row (the disc carries the emphasis). Overhangs the bar by -18pt (-10pt Android).
  "You" (profile/settings) is reached from the Home top app bar (`/you`, `href: null`).

> **Nav decision (7/27, D23):** restored the design system's centre "Quick Log (+)" and renamed the
> fifth tab to **Empties** (private finish archive). "You" moves to the Home app bar profile button (PR #29).

## 6. Screen ground truth

`docs/mockups/` — when a mockup and this file disagree on a value, this file
wins; when this file is silent on a layout question, match the mockup.

| File                    | Screen                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| home-dashboard.png      | Home (shows old five-destination footer and 3-pill quick-action row; this file wins — footer is 4 tabs + ⊕ Log (D23), and "Log Item" pill is removed)                    |
| home-dashboard-wide.png | Home, tablet reference                                                                                                                                                   |
| log-modal.png           | F1 fast-log modal                                                                                                                                                        |
| wishlist-intercept.png  | F5 intercept banner + cooling-off CTA                                                                                                                                    |
| empties-feed.png        | **Reference only — community feed deferred (D13).** Reuse its card layout for the _private_ empties archive (Empties tab); drop the like button and author/feed framing. |
