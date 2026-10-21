# Editorial Essay Collage

Use `STYLE_PACKS['editorial-essay-collage']`. The complete reference is preserved under `assets/styles/editorial-essay-collage/reference.js`; the runtime extracts medium helpers and excludes the example AI story, animal photos and historical map.

## Composition and material

Arrange warm grainy paper, torn white-bordered halftone prints, serif news clippings, flat muted red blocks and condensed cut-out headline strips. Give each layer a purpose and a different depth; avoid applying a collage filter to a fixed dashboard. Photographic-looking illustrations must be described as illustrations, not evidence or archival records.

Use `treat` for grayscale scenes: original soft blur, luminance contrast, seeded grain, rotated coarse halftone dots, duotone ink, dust and hairline scratches. `makePrint`, `edgePoly`, `shadowFill`, `texture` and `tape` retain torn fibres, paper colour and contact/cast shadows. Preserve translucent yellow `hilite` sweeps with felt streaks and pooled ink; emphasize meaningful details with the red `marker` and `loopPts`. Thin `inkArrow` routes connect ideas.

Typography: Anton for large condensed headline/number strips, Libre Baskerville for serif clipping headings and italic notes, Oswald for compact labels. Bundle fonts with their OFL notices. Essential labels and corner headers remain at least 28 logical pixels, headlines 44, key numbers 64. Decorative newspaper columns are optional; never hide a necessary claim in miniature filler.

## Motion and timing

Use `q12` and `arrive`/`putSpr` for cutouts moving in 12 fps steps, with a smoothly moving camera through `place` depth planes. Align stepped clocks relative to the project event so the first visible frame cannot lag the narrated reveal by a whole step. Shared ideas stay on the same paper surface. For a true scene change, use a speed-blurred camera whip or a new paper sheet sliding up on steps; allocate any blur layers at delivery resolution. Do not require a whip in an eight-second continuous journey.

## Native rendering and finishing

Call `setScale(ctx.canvas.width / 1280)` before building cached sprites; clear project sprite caches when it returns true. Runtime sprites, text and grayscale treatment render at native output resolution, with logical draw dimensions. The source reference is unchanged; only runtime allocation, image drawing and shadow pixel radii are adapted. Static fibre/grain caches remain deterministic.

Run `bgPaper` and `finish(ctx,t,.24)` every frame: the original fibre texture, 0.26 overlay grain switching at 12 fps and multiply vignette are required. Do not substitute uniform noise or remove halftone to speed up rendering.

Sound: low paper taps, soft slides, masking-tape pulls, felt highlighter strokes and pen routes. Use the same project event times for sound and visuals, with frequent cues marked minor beneath the narration. The sample reuses the approved Smart Queue narration and illustrative G-001 number.
