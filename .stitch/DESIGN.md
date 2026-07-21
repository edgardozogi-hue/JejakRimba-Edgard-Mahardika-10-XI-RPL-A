# Design System: Jejak Rimba

## 1. Visual Theme & Atmosphere
A rugged-yet-refined outdoor gear marketplace interface. Warm earth tones meet Swiss-functional clarity. Density is balanced (4/10) — airy on landing, denser on catalog. Variance is moderate (6/10) with offset asymmetric layouts. Motion is fluid (6/10) with spring physics. The atmosphere evokes a basecamp at golden hour: confident, grounded, adventure-ready.

## 2. Color Palette & Roles
- **Bark Canvas** (#1A1714) — Primary dark background surface (dark mode)
- **Bark Surface** (#23201B) — Elevated dark surface (cards, containers in dark mode)
- **Paper Canvas** (#EDE6D6) — Primary light background surface (light mode)
- **Paper Dim** (#D9D0BC) — Secondary/muted background
- **Light Surface** (#FFFFFF) — Card and container fill (light mode)
- **Dark Surface** (#2A2620) — Card fill on dark backgrounds
- **Ember Accent** (#C4622D) — Single accent for CTAs, active states, focus rings. Saturation ~60%.
- **Ember Accent Hover** (#E08148) — Brighter hover state for accent
- **Moss Secondary** (#4A5D3A) — Secondary accent, success states, stock availability
- **Moss Light** (#6B8354) — Brighter secondary on dark mode
- **Stone Text** (#8B8378) — Secondary text, descriptions, metadata
- **Charcoal Text** (#1A1714) — Primary text (light mode)
- **Paper Text** (#EDE6D6) — Primary text (dark mode)
- **Whisper Border** (rgba(26,23,20,0.12) light / rgba(237,230,214,0.12) dark) — Card borders, 1px structural lines

## 3. Typography Rules
- **Display/Headlines:** Archivo — Track-tight tracking (-0.02em), controlled scale (3xl-6xl), weight-driven hierarchy (700 bold for emphasis)
- **Body:** Archivo — Relaxed leading (1.6), 65ch max-width, neutral Stone #8B8378 for secondary
- **Mono:** JetBrains Mono — For prices, stock counts, metadata, location, elevation numbers, timestamps
- **Banned:** Inter, generic system fonts. Georgia/Garamond serif banned everywhere.

## 4. Component Stylings
- **Buttons:** Flat background, no outer glow. Tactile scale(0.96) on tap. Ember fill for primary, ghost/outline with border for secondary. Min 44px tap target.
- **Cards:** xl rounded corners (1rem/16px). 1px whisper border. 1-2px y offset on hover. Used only for equipment listings, feature cards, profile menu items. No deep shadows.
- **Filter chips:** Small pill buttons (rounded-xl, px-3 py-1). Ember fill when active, surface background when inactive. Spring scale on hover/tap.
- **Inputs/Forms:** Label above input in 11px uppercase mono. Helper text optional below. Focus ring in Ember. No floating labels.
- **Loaders:** Skeletal pulse matching layout dimensions. No circular spinners.
- **Empty States:** Centered icon + heading + description + CTA button.

## 5. Layout Principles
- Single-column collapse below 768px. All multi-column grids go to 1 column.
- Catalog grid: 1 col mobile, 3 col desktop with 1.25rem gap.
- Profile: 2 col on desktop (avatar/info left 30%, content right 70%), 1 col mobile.
- Booking cards: 1 col mobile, 2 col desktop.
- Max-width containment at 1280px (max-w-6xl).
- min-h-dvh for full-height sections (never h-screen).

## 6. Motion & Interaction
- Spring physics default: stiffness 100, damping 20 for general. Stiffness 260, damping 22 for snappy interactions.
- Staggered cascade reveals via staggerContainer (0.08s delay between children).
- Page transitions: opacity + y offset with AnimatePresence.
- Card hover: y -4px + scale 1.02 with spring.
- TiltCard: mouse-position-driven rotateX/rotateY with spring interpolation, resets on leave.
- MagneticButton: Cursor-tracked translate with useSpring for elastic feel.
- Perpetual micro: Navbar underline slides with spring on route change. Theme icon rotates on toggle.

## 7. Anti-Patterns (Banned)
- No emojis anywhere — use lucide-react icons
- No Inter font — use Archivo
- No generic serif fonts
- No pure black (#000000) — use #1A1714
- No neon/outer glow shadows
- No oversaturated accents
- No gradient text on large headers
- No glassmorphism backgrounds
- No custom mouse cursors (except MagneticButton)
- No 3-column equal card layouts
- No generic names ("John Doe", "Acme")
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No filler UI text ("Scroll to explore", bouncing chevrons)
- No broken image links — use gradient placeholders
- No em dashes in copy — use commas
- No hyphens in compound words ("real-time" → "real time")
