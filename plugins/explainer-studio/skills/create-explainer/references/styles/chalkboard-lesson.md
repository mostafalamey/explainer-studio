# Chalkboard Lesson

Use `STYLE_PACKS['chalkboard-lesson']`. The complete user-supplied source is preserved in `assets/styles/chalkboard-lesson/reference.js`. The runtime separates its chalk medium from the AI lesson, model machinery, animals and invented example statistics.

## Composition and medium

Build a teacher-style explanation on green slate with a worn oak frame and dusty chalk tray. Use white chalk for the main drawing, yellow for routes and important labels, pink for emphasis rings and pale green for a meaningful confirmed result. Preserve the cloudy eraser swirls, fine felt streaks and faint traces of earlier writing. Ghost marks are texture, not additional claims; keep them abstract or relevant to the subject.

Use hand-drawn outlines for each actual subject. Strokes consist of several pressure-varied parallel passes with seeded wobble. The final pixel treatment anchors broken chalk coverage to the board's tooth, so the texture stays attached to the slate as the camera moves. Do not substitute smooth white vector lines, a uniform noise overlay or glowing outlines.

Kalam supplies bold lesson headings and important numerals; Patrick Hand supplies labels. Embed both fonts with their OFL notices and await every weight used, including faint ghost lettering. Essential labels and corner headers must be at least 28 logical pixels, headings 44, key numbers 64. Genuine logos remain authentic and can sit cleanly above the chalk treatment.

## Items, camera and timing

Call `setScale(ctx.canvas.width / 1280)`, then `render(ctx,1280,720,t,items,cam)`. The camera is `[centreX,centreY,zoom]`; `[640,360,1]` shows the first board section. Use `XE.camAt` or an eased displacement tied to the project event table when the lesson continues farther along the slate. Hold a complete diagram long enough to read it before tracking to the next section. A new beat does not require erasing the entire board.

Each item has `k`, `role`, `a` and `b`. A line supplies `pts` and `w`; a dot supplies `x`, `y`, `r`; a text item supplies `s`, `x`, `y`, `size`, `font` (`title`, `label` or `num`), `align` and `rot`. Roles are `ink`, `acc1`, `acc2`, `acc3`. `inst:true` means already present. Set `rot:0` explicitly for ordinary text. Geometry helpers include `XE.circ`, `quad`, `cubic`, `rrect` and `head`.

Lines draw on and words appear by character, accompanied by the physical chalk stick and falling dust. Schedule significant objects to arrive on their narrated words, or up to 0.2 seconds early. Give a number enough time to be written and held; only count or re-chalk values when the factual explanation requires it. Pink rings emphasize a meaningful result. For a genuine new lesson, a felt-eraser wipe can clear a region before new writing; keep continuous connected steps on the same slate.

## Native rendering and finish

The runtime renders crisp world texture, glyph plates, chalk masks and the oak tray at delivery resolution. The original half-resolution slate base and blurred eraser clouds intentionally remain soft. The chalk grain pass maps physical output pixels back to logical world coordinates, retaining the source tooth pattern. Native glyph plates allow normal viewport clipping during camera travel; spaces advance without creating empty paint plates.

Retain the 0.22 chalk dust halo, classroom light falloff, floating dust, moving chalk stick, 0.35 vignette and 0.03 finishing grain. Cache static slate, tray and lettering rather than weakening the medium. Author long scenes within the prepared world extent or extend its texture bounds deliberately.

Use `soundKit(k)` for `knock`, `ch`, `write`, `tap` and `dust`. Drive strokes and word sounds from the same item start/end times as the drawing, using minor cues beneath narration. In the example, a quiet functional chime marks the call number; the approved English narration is reused without new voice generation.

Verify fonts, timing, deterministic seeking, camera transitions, held labels, encoded final frames and speech audibility. Report automated and sampled visual checks separately from a continuous human watch-through. Use the rendered MP4 for a smooth selector preview when live native Canvas drawing is too expensive for real-time playback.
