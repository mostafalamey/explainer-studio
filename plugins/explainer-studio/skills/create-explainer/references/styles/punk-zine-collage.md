# Punk Zine Collage

Use `style: "punk-zine-collage"`. Create photocopied cut-and-paste spreads: torn halftone scraps, ransom letters, typewritten strips, masking tape and a single fluorescent pink spot ink. Black toner and pink ink remain separate plates until compositing.

Preserve `scrapPoly`, `maskTape`, mismatched `RANSOM_FONTS`, the 45-degree halftone screen, copier crush, drum streaks, edge darkening, toner boil, incomplete spot coverage and off-register multiply compositing. All fonts are embedded with their licenses. The supplied source remains in `assets/styles/punk-zine-collage/reference.js`.

Call `STYLE_PACKS["punk-zine-collage"].render(ctx,1280,720,t,paint)`. The paint callback receives black and spot contexts (`b`, `sp`), eight-fps stepped time, and helpers for scraps, typed strips, ransom letters, scrawls, marker arrows, tape and slap motion. It returns whether a brief copier impact flash should show. Native-resolution plates retain logical coordinates. Completed frames are cached by the eight-fps step and output width; use one scene per page, or invalidate the cache if replacing its content.

Each significant idea can land as a new pasted sheet with a tiny rotation and impact scale. Letter jitter and toner noise are seeded per eight-fps step. Quantize sound and reveal times to the same step, allowing at most 0.125 seconds of frame quantization. Reuse the product's approved facts and narration.

Keep essential labels at least 28 logical pixels, headlines around 58 or larger and main numbers at least 64. Reserve room for random letter widths, ascenders and rotation. Build topical illustrations; the original reference's AI graphics and commentary are not part of the style. Preserve the authentic brand mark.

Inspect every spread, first impact frames, number visibility, text boundaries and marker arrows. Copier processing is heavier than the other styles; the encoded MP4 is the smooth playback deliverable. Run export verification and selector checks, and distinguish sampled review from a continuous watch-through.
