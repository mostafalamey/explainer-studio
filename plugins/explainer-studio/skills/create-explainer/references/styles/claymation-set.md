# Claymation Set

Use `STYLE_PACKS['claymation-set']`. The complete supplied source stays unchanged in `assets/styles/claymation-set/reference.js`. The runtime extracts its material helpers, sculpted set and lens finish; it excludes the original example narrative and subject props.

## Material and composition

Build a physical miniature stage: teal plasticine wall, terracotta tabletop, soft warm key light and contact shadows. Silhouettes are hand-shaped and slightly lumpy. Use the source `bake` height-field shading with rounded waxy highlights, subsurface colour, thumbprint whorls and incised tool marks. `lumpy` makes irregular oval silhouettes; `prn` supplies deterministic fingerprint locations. Avoid replacing this medium with smooth pastel vector gradients. Soft 3D Clay is the separate clean, puffy style; this set should feel handled between exposures.

Keep objects readable as the subject changes. Show characters, tools and signs as sculpted props occupying a real tabletop. Use `place` for contact shadows and anchored squash. Layer limbs and hands so they connect. Do not carry the source's AI example, animals, accuracy claims or brain props into unrelated topics.

Use Fredoka through `glyph` and `FR` for pressed clay lettering, with small deterministic rotations. Essential labels are at least 28 logical pixels, headlines 44 and key numbers 64. Use dark clay letters on light signs or cream letters on the teal wall. Build arrows as rounded rolled coils, with their own height field and shadow. Brand logos remain authentic; do not redraw them as approximate clay symbols.

## Motion and sound

Quantize prop motion to twelve frames per second and hold squash poses on twos through `SEQ.pop`. Use a small deterministic three-variant surface boil for handled props, rather than arbitrary frame randomness. Align arrival clocks relative to each project event, so the first visible step happens at the narrated reveal. Let moving characters traverse the stage; use pop-on assembly, clay squashes and tabletop slides for meaningful changes. A short continuous journey does not require a scene transition. For a new scene, use a stepped set swap or clay wipe with a brief hold before the next narrated reveal.

Place low clay plops, soft squelches and gentle sliding friction at the same event times as the visuals. Keep minor sounds below the voice. Use a restrained functional call chime where the explanation requires it; do not add high chirps to every letter.

## Native rendering and finishing

Call `setScale(ctx.canvas.width / 1280)` before constructing cached props and clear project caches when it returns true. The runtime allocates silhouettes, height fields, glyphs and backgrounds at delivery resolution, preserves logical draw sizes, and scales fingerprint/tool-mark and shadow dimensions consistently. Runtime adaptation does not alter the stored source reference.

Call `background(ctx)` and `finish(ctx,1280,720,t)` each frame. Preserve the original blurred wall, molded tabletop, warm/cool soft-light grading, vignette, seeded exposure variation and grain at twelve-fps steps. Cache baked props for deterministic seeking and efficient export; do not omit material detail for speed.

The included Smart Queue comparison uses the approved existing English narration and illustrative G-001 ticket number. Validate fonts, event timing, deterministic seeking, connected character parts, readable signs and the encoded ending at 1080p. Report automated and sampled checks accurately.
