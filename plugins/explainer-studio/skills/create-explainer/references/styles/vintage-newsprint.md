# Vintage Newsprint

Source: `assets/styles/vintage-newsprint/reference.js`. Runtime: `STYLE_PACKS['vintage-newsprint']`. Supplied on 2026-10-21 to replace Cosmic Star Chart. User-provided source does not establish public redistribution rights. Libre Baskerville, Oswald, Playfair Display and UnifrakturMaguntia are embedded with their OFL licenses.

## Material and typography

Use the reference's 1950s broadsheet language: yellowed pulp, blackletter masthead, condensed banner headline, justified greeked columns, coarse halftone illustrations, hairline rules and a red grease-pencil emphasis mark. Set the masthead in UnifrakturMaguntia, headlines and key numbers in Oswald, body texture in Libre Baskerville, and pull quotes in italic Playfair Display. Story-bearing labels remain at least 28 logical pixels, headlines 44, key numbers 64. Tiny columns are decorative texture and must carry no essential explanation.

Preserve the explainer's print composite: PAPER [228,214,178], INK [30,28,27], edge aging 0.07, low-frequency mottling 0.035/0.015, fibre noise 12, dark pulp flecks at 0.9975, blurred mirrored reverse print at 0.075, original ink coverage threshold/density and 0.025 dropout. `initPaper(backDraw)` caches the reference's 320 x 180 two-channel noise field and blurred reverse alpha. Supply a topic-appropriate reverse page rather than copying invented news. `renderSheet` composites native-resolution front ink through those paper coordinates; call `setScale(project.width/1280)` and draw the returned canvas back at logical 1280 x 720. Do not add unrelated grain, glow or vignette. The hero reference has additional smear/fold treatments; this runtime preserves the explainer's own finish.

## Drawing and staging

`graySrc` creates a softened greyscale illustration; `halfDots` screens it on the original coarse 45-degree grid. Draw actual topic subjects into that source: a patient, kiosk and reception desk for the bundled comparison, not the reference's robot, tape cabinets, cats or dogs. `npArrow` draws crisp newspaper diagram shafts and solid heads. `pencilRing` preserves three seeded, wobbly red passes at the source's widths and opacity. `column` creates decorative justified text; omit the source's AI-specific optional subheads and datelines.

The opening may whirl a newspaper out of the dark and settle it with a papery slap. Let the camera read the page, following the headline into a diagram or key number. A physical page turn is appropriate when the story genuinely moves to another spread; a new beat alone does not require one. Put camera, rule, number and pencil events in the project timing table. Keep figures, labels and a held ending clear of page edges during tracking. Preserve authentic logo artwork separately from the monochrome ink pass.

## Sound and validation

`soundKit` retains soft paper rustle, papery knock, minor taps/ticks, a dry pen rule and waxy grease-pencil strokes. Keep cues on their visual events and below narration. Audio providers and toggles follow the shared production settings.

Inspect halftone spacing, pulp texture, reverse show-through, ink dropout, red emphasis, label bounds and the actual encoded ending at native resolution. Native pixel compositing can be slower than real-time in the editable HTML; the selector uses rendered MP4 previews. The kiosk-to-reception sample demonstrates this medium and the production contract, not a fixed layout for every topic or aspect ratio.
