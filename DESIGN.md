```markdown
# Design System Specification: Sovereign Trust

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Institution"**

This design system moves away from the "startup" aesthetic and toward a "Digital Institution" philosophy. It balances the high-velocity precision of Stripe with the authoritative weight of a modern government entity. We are not just building a voting app; we are designing a digital monument to democracy.

To achieve this, we break the "template" look by utilizing **Architectural Asymmetry**. We favor large, intentional whitespace (breathing room) over cluttered grids. Information is not just displayed; it is curated through a sophisticated hierarchy that uses high-contrast typography scales and layered tonal depth to guide the voter’s eye through the most secure moment of their civic life.

---

## 2. Colors: Tonal Architecture
The palette is built on "Trustworthy Blues" and "Crisp Whites." We use a high-contrast logic to ensure kiosk accessibility while maintaining an editorial feel.

### The "No-Line" Rule
**Lines are a failure of hierarchy.** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts.
*   **Example:** A `surface-container-low` (#f1f3ff) section sitting on a `surface` (#f9f9ff) background creates a clean, sophisticated break without the visual noise of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
*   **Base:** `surface` (#f9f9ff)
*   **Sectioning:** `surface-container-low` (#f1f3ff)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Active Modals:** `surface-container-high` (#e0e8ff)

### The "Glass & Gradient" Rule
To elevate the "blockchain" aspect, use Glassmorphism for floating security badges or status indicators. Use `surface-container-lowest` with a 70% opacity and a `24px` backdrop-blur. 

**Signature Textures:** For primary CTAs, do not use flat colors. Apply a subtle linear gradient from `primary` (#003d9b) to `primary_container` (#0052cc) at a 135-degree angle to provide a "machined" professional polish.

---

## 3. Typography: The Editorial Voice
We use **Manrope** for its geometric authority in displays and **Inter** for its unparalleled legibility in functional text.

*   **Display-LG (Manrope, 3.5rem):** Reserved for "Thank You" screens or major section headers. Letter spacing: -0.02em.
*   **Headline-MD (Manrope, 1.75rem):** Used for candidate names and ballot questions. Bold weight to convey stability.
*   **Body-LG (Inter, 1rem):** The workhorse for voter instructions. Line height should be generous (1.6) to ensure readability on kiosk screens.
*   **Label-MD (Inter, 0.75rem):** Used for "Blockchain Verified" metadata. Always uppercase with +0.05em tracking.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering**.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "soft lift."
*   **Ambient Shadows:** If a card must "float" (e.g., a candidate selection), use a shadow tinted with the `on-surface` color: `rgba(20, 27, 44, 0.06)` with a 40px blur and 20px Y-offset. 
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., high-contrast mode), use `outline-variant` (#c3c6d6) at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Precision Built

### Oversized Kiosk Buttons
*   **Primary:** Gradient (Primary to Primary-Container), `xl` (0.75rem) corner radius. Height: 64px minimum for touch.
*   **Secondary:** `surface-container-highest` (#dbe2f9) with `on-primary-fixed-variant` (#0040a2) text. No border.

### Candidate Cards
Forbid divider lines. Use `surface-container-low` as the card base. When selected, transition the background to `primary_fixed` (#dae2ff) and add a "Ghost Border" of `primary` at 20% opacity. Use `title-lg` for names to ensure they are the clear focal point.

### Dynamic Progress Indicators
Instead of a thin line, use a "Segmented Block" approach. Use `surface-container-highest` for empty states and `surface_tint` (#0c56d0) for active states. Each segment should have a `sm` (0.125rem) radius.

### Blockchain Security Badges
A signature component. Use Glassmorphism (70% white, backdrop-blur) with a tiny `tertiary` (#7b2600) accent dot to indicate "Live Encryption."

### Input Fields
Large-scale (56px height). Use `surface-container-lowest` background. The active state is signaled by a 2px bottom-only highlight in `primary`, rather than a full box stroke.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., 80px left, 120px right) on desktop layouts to create an editorial feel.
*   **Do** use `surface-dim` (#d2daf0) for footer areas to anchor the page.
*   **Do** prioritize "voter intent"—ensure the selected candidate card is visually dominant using `primary_fixed` saturation.

### Don't:
*   **Don't** use pure black (#000000). Always use `on-background` (#141b2c) for text to maintain a premium "ink" look.
*   **Don't** use standard 1px dividers. If separation is needed, use an 8px or 16px vertical gap of whitespace.
*   **Don't** use "alert red" for minor errors. Use `error_container` (#ffdad6) backgrounds with `on_error_container` (#93000a) text for a more professional, less "panic-inducing" tone.

---

## 7. Interaction Note
All interactive elements should utilize a subtle scale-down effect (0.98x) on `active` states. On a kiosk, this provides the tactile feedback necessary to confirm a vote has been cast in a system without physical buttons.```