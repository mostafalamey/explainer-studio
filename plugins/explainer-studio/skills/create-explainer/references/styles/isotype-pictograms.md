# ISOTYPE Pictograms

Use for Vienna-Method pictorial statistics or a process explained through flat, consistent silhouettes on a ruled chart sheet. The reference uses people and machines; its historical figures and AI examples are illustrative source content, not facts to reuse.

## Visual grammar

Use warm lithographic paper (`#EFE7D4`), near-black (`#26231F`), muted blue (`#294C63`), red (`#C2432C`) and ochre (`#D49A33`). Align repeated silhouettes to a strict grid. Keep geometric Space Grotesk type, flat arrows, unshaded fills, narrow rules and generous margins. Existing shared fonts provide weights 400 and 700.

For quantity charts, establish the fixed value of one symbol with a visible key. Add identical symbols to express larger quantities; clip a proportion of a symbol for a remainder. Never enlarge symbols to imply more units. Use verified data and explain partial symbols. For a process with repeated people, explicitly say that these show the same person at successive steps; do not imply measured counts or invented throughput.

## Helpers and finishing

`STYLE_PACKS['isotype-pictograms']` exports the palette, `person`, `chip`, `factory`, `flatArrow`, `checkPic`, `crossPic`, `spaced`, `paper`, `inkLayer`, `printInk`, `wear`, `mottle` and `lithoFinish`. Draw subjects appropriate to the explanation using the same flat silhouette grammar.

Create `inkLayer(nativeWidth,nativeHeight)` and scale its drawing context to logical 1280 × 720 coordinates. `printInk` removes the reference's density drift, pinholes and roller streaks with destination-out, then prints at native resolution. It resets transforms internally.

The `paper` adapter caches a native canvas painted with the original `H.paper` seed 11 and strength 0.02. After printing ink, call `lithoFinish` at native resolution with two octaves for an explainer, then the unchanged `H.grain` at strength 0.05 with seed `9 + Math.floor(t*8)`. These finishes run on every frame; retain the subtle moving paper grain during holds. Preserve supplied logos as authentic assets.

## Timing and sound

Stamp symbols on a 12 fps stepped clock: invisible, one frame at roughly 1.14–1.15 scale and 0.8 opacity, then settled. Set the impression on or just before its spoken event and use the same quantized time for the stamp sound. Use a continuous sheet for related ideas, expanding rows or panning along the sheet; keep labels readable during movement.

Use quiet rubber-stamp thuds, number-machine clacks and sheet friction. Essential labels stay at least 28 logical pixels, headlines 44 and key numbers 64. Avoid copying the source's undersized statistical annotations.

## Review

Verify that pictogram scales, quantity keys and fractions are truthful; repeated figures in a process are clearly identified. Check stepped motion, native ink wear, exact sound/reveal timing, deterministic seeks, label bounds and the encoded ending. Use the bundled kiosk-to-reception example to test the drawing contract, not as a universal chart layout.
