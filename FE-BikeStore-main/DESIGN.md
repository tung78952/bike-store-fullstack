# Design System Specification: The Precision Atelier

## 1. Overview & Creative North Star
**Creative North Star: "The Mechanical Ledger"**
This design system rejects the "cluttered dashboard" trope of legacy enterprise tools. Instead, it adopts a high-end editorial aesthetic inspired by technical manuals and premium cycling journals. We treat bike store management as a craft. By combining the geometric precision of *Be Vietnam Pro* with a sophisticated tonal layering system, we create an environment that feels authoritative yet breathable.

The system breaks the "template" look through **Intentional Asymmetry**. We utilize generous white space on the left-axis (the "Reading Spine") contrasted with high-density data modules on the right. Overlapping elements—such as status chips partially breaking the boundary of a container—create a sense of tactile depth that feels custom-tailored rather than auto-generated.

---

## 2. Colors & Surface Architecture
The palette is rooted in a deep, mechanical Navy and a high-performance Emerald. However, the secret to the "Enterprise Creative" look is not the colors themselves, but how they are layered.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be defined solely through background color shifts.
*   **Surface:** `#f7f9fc` (The canvas)
*   **Surface-Container-Low:** `#f2f4f7` (Secondary navigation/sidebar)
*   **Surface-Container-Lowest:** `#ffffff` (Primary content cards/data tables)

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
- **Level 0 (Base):** `surface`
- **Level 1 (Sub-sections):** `surface-container-low`
- **Level 2 (Interactive Cards):** `surface-container-lowest`
By placing a `surface-container-lowest` card on a `surface-container-low` background, the 12px (`md`) radius creates a crisp definition without a single line of CSS border.

### The "Glass & Gradient" Rule
To add visual "soul," use a subtle linear gradient on primary CTAs: `primary` (#00355f) to `primary_container` (#0f4c81) at a 135° angle. For floating utility panels (e.g., a quick-tool inventory popover), use **Glassmorphism**: `surface_container_lowest` at 85% opacity with a `20px` backdrop-blur.

---

## 3. Typography: The Editorial Voice
We use typography to establish a clear hierarchy that feels like a technical specification sheet.

*   **Display & Headlines (Be Vietnam Pro):** This is our "Brand Voice." Use `display-md` for main dashboard headers. The tight tracking and geometric apertures of Be Vietnam Pro convey high-performance engineering.
*   **Body & Labels (Inter):** This is our "Utility Voice." Inter is used for all data points, inventory lists, and status updates. Its neutral tone ensures that complex bike part numbers and SKU data remain legible at high densities.
*   **The Power Scale:** Use `label-sm` in all-caps with `0.05rem` letter-spacing for metadata (e.g., "SKU: 4902-B"). This creates an "architectural" feel that distinguishes data from narrative text.

---

## 4. Elevation & Depth
In this design system, shadows are an exception, not a rule.

### The Layering Principle
Depth is achieved by stacking. A "Quick Action" panel should not have a shadow; it should simply sit on a `surface-container-high` (`#e6e8eb`) backdrop to distinguish it from the workspace.

### Ambient Shadows
When an element must "float" (e.g., a Modal or a global Search bar), use an **Ambient Shadow**:
- `box-shadow: 0 20px 40px rgba(17, 24, 39, 0.04);`
The shadow must be tinted with the `on_surface` color at an extremely low opacity (4-8%) to mimic natural light passing through a high-end workshop.

### The "Ghost Border" Fallback
If an element (like a search input) risks disappearing into the background, use a **Ghost Border**: `outline-variant` (#c2c7d1) at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_container`), `md` (0.75rem) radius. No border. Text: `label-md` bold, white.
- **Secondary:** `surface_container_low` background with `on_surface` text. This blends into the UI until hovered.
- **Tertiary:** Text-only, using `secondary` (#006a69) for the label to draw attention without adding visual weight.

### Input Fields & Search
- **Structure:** Forbid the 4-sided box. Use a "Soft Inset" style: `surface_container_low` background with a 2px bottom-accent of `outline_variant` at 20% opacity.
- **State:** On focus, the bottom accent transitions to `secondary` (#0ea5a4).

### Cards & Lists (Data Density)
- **Forbid Dividers:** Do not use `<hr>` or border-bottoms between list items. Use the Spacing Scale `3` (0.6rem) to create separation through "negative tension."
- **Nesting:** Place a white `surface-container-lowest` card on a `surface-container-low` background. Use a `12px` (md) radius.

### Custom Component: The "Part-Spec" Chip
For bike shop management, specific data like "In Stock" or "Backordered" needs priority.
- **Styling:** Use a `full` (pill) radius. Background: `secondary_fixed` (#7df5f4) at 20% opacity. Text: `secondary` (#006a69). This provides a "glow" without being neon or futuristic.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `2.5` (0.5rem) and `5` (1.1rem) spacing to create rhythm.
- **Do** use asymmetrical layouts where the left sidebar is significantly wider than typical to allow for high-end typography and branding.
- **Do** use "Optical Alignment": text inside cards should have more horizontal padding than vertical padding (e.g., `px-5 py-3.5`).

### Don't:
- **Don't** use icons as decoration. If an icon doesn't trigger an action or clarify a complex status, remove it.
- **Don't** use pure black (#000) for text. Always use `on_surface` (#191c1e).
- **Don't** use standard "Drop Shadows." If a card needs lift, use a 1px `outline-variant` at 10% opacity instead.
- **Don't** use "AI-blue" or "Neon-Teal." Keep the Emerald accent grounded and professional.