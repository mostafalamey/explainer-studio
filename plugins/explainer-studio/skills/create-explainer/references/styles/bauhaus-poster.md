# Bauhaus Poster

Source: `assets/styles/bauhaus-poster/reference.js`. Runtime: `STYLE_PACKS['bauhaus-poster']`. User-provided source does not establish public redistribution rights. Syne is bundled with its OFL license; Space Grotesk uses the shared embedded font.

## Material and typography

Use primary red, yellow and blue plus near-black on aged cream stock. Subject drawings are constructed from circles, semicircles, squares, bars and triangles. Favor strict grid rules, asymmetrical space, heavy Syne headlines and Space Grotesk labels and stamped counters. The reference's `letter` helper supports only o/b/r/t; use it only for applicable lettering, rather than emitting missing letters or copying its robot title.

Keep the reference's lithographic treatment. `plateCtx` draws into four knockout colour separations. Cream shapes knock out ink to reveal paper. `finish` multiplies the plates with registration offsets yellow [2,-1], red [-1.5,1], blue [1,2] and black [0,0], then applies ink mottle 0.22 and speckle 0.004. The original fibrous paper, edge aging, 26 foxing spots, two fold creases, 260 fold scuffs, 0.06 animated monochrome grain and 0.18 brown vignette remain at their original strengths.

Call `setScale(project.width/1280)` before drawing. Draw `exPaper(1280,720)` into logical 1280×720; obtain `plateCtx(1280,720)` for the drawing and finish with `finish(ctx,1280,720,t)`. Offscreen paper, plates and print composite are native resolution. Noise cells, foxing radii and misregistration distances scale with output size. Keep flat colours from C; arbitrary colours fall back to the black plate. The proxy forwards native Canvas path and transform methods. Draw authentic logos separately to preserve their original colours.

## Staging and motion

Compose a long ruled information sheet. Track the camera along it when the story advances, preserving the baseline and relevant objects; a final pullback is optional only if the result remains readable. Do not force the reference's four-panel structure onto every explanation. Do not reuse its robot, training cards, percentages or claims.

Objects drop onto the sheet with a small overshoot. `exTag` labels land beside the objects they name. `exArrow` is a thick bar with a triangular head. Space Grotesk numbers stamp on, and a red ring draws around the important result. Keep camera, object and sound timings in project beats. Manage label visibility as objects enter or leave the framing; do not retain stale headings over a logo ending.

## Sound and validation

`soundKit` preserves wooden block knocks, type-sort taps, numbering-machine clacks, paper slides with a stop clack and soft wooden marimba tones. Mark small details minor and keep the existing narration prominent. No music or room bed is needed in voiceover mode.

Check correct knockout holes, thin misregistration edges, grain and mottle at native resolution, text visibility during tracking, matching ticket/call numbers and the encoded ending. Native pixel passes can be slower than real-time; use rendered MP4 previews in the selector. The bundled kiosk-to-reception example demonstrates this medium and its production contract, not a universal template.
