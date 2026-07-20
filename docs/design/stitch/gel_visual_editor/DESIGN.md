---
name: GEL Visual Editor
colors:
  surface: '#101319'
  surface-dim: '#101319'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353b'
  on-surface: '#e1e2eb'
  on-surface-variant: '#bacac5'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2d3037'
  outline: '#859490'
  outline-variant: '#3c4a46'
  surface-tint: '#3cddc7'
  primary: '#57f1db'
  on-primary: '#003731'
  primary-container: '#2dd4bf'
  on-primary-container: '#00574d'
  inverse-primary: '#006b5f'
  secondary: '#f9bc50'
  on-secondary: '#432c00'
  secondary-container: '#bd871d'
  on-secondary-container: '#3a2600'
  tertiary: '#66f3b6'
  on-tertiary: '#003824'
  tertiary-container: '#44d69b'
  on-tertiary-container: '#00593b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62fae3'
  primary-fixed-dim: '#3cddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffdead'
  secondary-fixed-dim: '#f9bc50'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#101319'
  on-background: '#e1e2eb'
  surface-variant: '#32353b'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 16px
  panel-gap: 1px
  element-gap: 8px
  compact-padding-y: 4px
  compact-padding-x: 12px
---

## Brand & Style
The design system is engineered for technical precision and high-cognitive-load environments. It adopts a **Premium IDE aesthetic**, prioritizing focus and visual hierarchy through a sophisticated dark-theme palette.

The visual direction is rooted in **Modern Professionalism** with a slight lean toward **Minimalism**. It avoids unnecessary decorative elements, instead using subtle borders and intentional color accents to guide the developer's eye through complex logical structures. The atmosphere is calm, technical, and high-performance, evoking the feel of a high-end code editor or node-based logic engine.

## Colors
The palette is centered around a **Deep Slate** foundation to reduce eye strain during long sessions. 

- **Primary (Electric Teal):** Reserved for primary actions, active selection states, and focus rings. It provides high contrast against the dark background to signal interactivity.
- **Secondary (Soft Amber):** Specifically used for warnings, pending states, or non-destructive alerts.
- **Tertiary (Emerald Green):** Dedicated to "Valid," "Success," and "Live" status indicators.
- **Surface & Borders:** A tiered system of charcoals creates the physical architecture of the UI. The **Slate-Gray** border provides the necessary definition between panels without creating visual clutter.

## Typography
The system employs a dual-font strategy to differentiate between functional UI and manipulated data.

- **Inter:** Used for all interface elements, navigation, and labels. It is chosen for its exceptional legibility at small sizes and its neutral, modern character.
- **JetBrains Mono:** Utilized exclusively for technical content, including SQL fragments, XML nodes, scripts, and data variables. The increased x-height and clear character distinction facilitate error detection in code.

Typography is kept compact to maximize information density. Titles use a slightly tighter letter spacing for a more "locked-in" professional feel.

## Layout & Spacing
This design system utilizes a **Fixed Sidebar + Fluid Canvas** layout model. The workspace is divided into functional panels (Navigator, Canvas, Inspector) separated by 1px borders to maximize screen real estate.

- **Density:** The system uses a "Compact" density model. Standard vertical padding for inputs and list items is 4px to 6px.
- **Grid:** A 4px baseline grid ensures alignment across labels and icons.
- **Layout Adapation:** On smaller screens, the side panels collapse into icons, and the Inspector panel transitions into an overlay drawer. The primary canvas remains fluid to accommodate large logic trees.

## Elevation & Depth
In this IDE-inspired system, depth is communicated through **Tonal Layering** rather than heavy shadows. 

- **Level 0 (Base):** Deep Slate (#0F1218) for the main application background.
- **Level 1 (Panels):** Lighter Charcoal (#171C26) for sidebars and the header.
- **Level 2 (Modals/Popovers):** A slightly lighter charcoal (#1F2430) with a subtle 8px blur shadow to indicate a floating state.
- **Depth Markers:** 1px solid borders in Slate-Gray (#2A3140) define the perimeter of every interactive area. Avoid drop shadows on nested components to maintain a clean, flat appearance.

## Shapes
The design system uses a consistent **8px (0.5rem)** corner radius for all major UI containers, panels, and logic blocks. This provides a modern, refined feel that softens the "brutal" nature of dark-themed developer tools.

- **Pill Shapes:** Segmented controls and certain status tags use a fully rounded (pill) radius to distinguish them from structural blocks.
- **Nested Blocks:** When blocks are nested (e.g., a loop inside a conditional), the outer block maintains the 8px radius while inner elements may scale down to 4px to maintain visual harmony.

## Components

### Buttons & Controls
- **Primary Button:** Solid Electric Teal background with dark slate text. No gradient.
- **Ghost Button:** 1px Slate-Gray border, transparent background, Teal text on hover.
- **Segmented Controls:** Pill-shaped toggle groups with a subtle background highlight for the active state.

### Developer-Specific Elements
- **Logic Blocks:** Containers for loops and conditionals should have a thick 2px left-border accent in the Primary color to denote scope.
- **Variable Chips:** Small, pill-shaped tokens with a low-opacity Teal background and a "close" icon for removal. Font: JetBrains Mono.
- **Nested Containers:** Use a darker "Well" background (Deep Slate) when nesting logic to provide immediate visual hierarchy.

### Inputs & Lists
- **Input Fields:** 1px Slate-Gray border, deepening to Electric Teal on focus. Use JetBrains Mono for the input text if it's a data value.
- **Lists:** High-density rows (28px - 32px height) with a subtle highlight on hover.
- **Icons:** Use 1.5px stroke-weight icons for a lightweight, precise look that matches the Inter typeface.