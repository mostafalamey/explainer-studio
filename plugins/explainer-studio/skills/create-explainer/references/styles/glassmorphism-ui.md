# Glassmorphism UI

Use `style: "glassmorphism-ui"`. This medium is a frosted dashboard over vivid drifting gradient blobs and crisp orbs. Use translucent panels that actually blur the current backdrop, not opaque gradient cards. Keep Inter typography crisp, essential labels at least 28 logical pixels, headlines at least 44 and key numbers at least 64.

The pack exposes `background`, `glass`, `blurOf`, `orb`, `noisePattern`, `chipPill`, `glowLine` and `rr`. The reference's glass stack is shadow, clipped blurred backdrop, tint, frost grain at 0.22, diagonal sheen, one-pixel gradient border and inner top highlight. Preserve all stages.

`background` paints native-resolution moving color fields, orbs, faint grid and gradient dither; it returns a blurred source for panels. `glass` assumes its source represents the entire current screen and compensates for the drawing transform. For glass-over-glass, call `blurOf` on the already drawn canvas before placing the next panel. Allocate blur sources at the output canvas dimensions and multiply the blur radius by output width / 1280.

Panels rise and settle with soft easing. Build related ideas within one dashboard, use restrained camera glides or changing panel focus, and reveal gradient connectors with traveling light dots. Labels may float as glass pills. Numbers remain stable unless the actual story calls for counting. Use gentle taps, airy panel slides and restrained chimes beneath narration.

Preserve the product's real branding and factual sequence. Reference chat, AI network and accuracy graphics are example content, not required props. Distinguish illustrative UI from an actual product screen when relevant.

Inspect backdrop blur on both sides of panel edges, nested-glass compositing, highlight legibility, headline transitions and the encoded ending. Run deterministic seeking, native export and selector checks. The reference is preserved in `assets/styles/glassmorphism-ui/reference.js`.
