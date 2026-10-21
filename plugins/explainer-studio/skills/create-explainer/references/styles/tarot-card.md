# Tarot Card

Use `style: "tarot-card"`. Present the explanation as illustrated cards dealt onto crushed velvet. Preserve art-nouveau frames, celestial corner medallions, bold even outlines, muted lithograph colors, gilt borders, aged cardstock and shifting foil sheen. The cards are a visual storytelling medium; do not invent divination or product claims.

Use Cormorant Garamond, embedded offline with its license. Keep essential labels at least 28 logical pixels, headlines at least 44 and main numbers at least 64. Avoid long card titles that force the frame helper to shrink its type.

The pack exposes `velvet`, `tFace`, `tCard`, `cardBack`, `plaque`, `gArrow`, `gold`, `star`, `crescent` and `rr`. `tFace` accepts an illustration callback, preserving the reference's art window, stepped sky, rays, framing and aging around new subject matter. Author accurate topical illustrations instead of copying the source automaton or animals.

Set `window.TAROT_SCALE = ctx.canvas.width / 1280` before drawing. Request velvet at native canvas dimensions and draw it into the logical frame. Card geometry draws directly on the output canvas; foxing, scuffs, worn edges and print-grain layers allocate at output scale. Preserve the reference strengths: velvet grain 0.07, print overlay 0.55, yellowing multiply and lighter foil sweep.

Deal, flip and gather cards as the story changes. Align the midpoint of a flip with the narrated reveal so the new face appears on time. Gold filigree arrows connect a spread; brass plaques hold numbers or short takeaways. Score subtle card slides, dry taps and restrained metallic chimes beneath narration.

Inspect card reveal midpoints, readability, front/back transitions, native-resolution texture, worn corners, foil motion and the actual encoded ending. Then verify playback, export and selector behavior. Original source is preserved in `assets/styles/tarot-card/reference.js`.
