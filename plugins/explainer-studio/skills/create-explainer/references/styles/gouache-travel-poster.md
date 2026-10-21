# Gouache Travel Poster

Use for a mid-century painted poster: six opaque matte colors, receding color planes, dry-brush boundaries and large block lettering. The source's industrial landscape and AI-learning story are examples, not required subject matter.

## Medium and composition

Use the supplied navy, teal, orange, mustard, cream and rose palette, with restrained cream tints for distance. Build subjects as bold silhouette masses with a few shadow planes. Reserve a dark lettering band and a hand-trimmed cream border; use flat arrows and an orange starburst for emphasis. Show the requested subject accurately rather than importing mountains, factories or cooling towers without a reason.

Bebas Neue provides the large poster lettering; Oswald handles short labels. Both fonts and their licenses are bundled. Keep essential labels at least 28 logical pixels, headings at least 44 and key numbers at least 64. Preserve authentic project logos as supplied.

## Rendering

Load `assets/styles/gouache-travel-poster/runtime.js`. `STYLE_PACKS['gouache-travel-poster']` exposes `PAL`, `tint`, `field`, `gpCache`, `makePainter` and a native-resolution adapter `poster(width,height)`.

Call `poster(ctx.canvas.width,ctx.canvas.height)` for each frame. Its `paint(color,bounds,drawMask,options)` accepts logical 1280 × 720 coordinates while allocating masks, blur and pixel buffers at output resolution. Bounds are `[left,top,right,bottom]`, including every drawn pixel. `drawMask` draws white fill/stroke geometry; color is applied by the painter.

Options include `p` for brush progress, `dir` (`h`, `v`, `d`), `edge`, `rag`, `tex` and `key`. Keep reference strengths: default edge 2.5 logical pixels, rag 0.8 and body texture 0.07. Edge noise, anisotropic broad strokes, dried paint ridges and chalk bloom are part of the medium. `finish(ctx)` adds the original board grain at full strength and copies the result to the main canvas. Call it every frame.

Static coverage is cached for complete passes and reused with the original front-coverage formula for partial brush sweeps. Prime required static passes after fonts load and before playback, as demonstrated in the example. Cache finished static passes with unique keys; never reuse a key for moving or changed shapes. A completed background can be cached in `cache.BG` before final grain, then restored into `buf`. Seeded source fields preserve deterministic seeking. The native adapter scales texture cells and blur with output size; do not render at 720p and upscale.

## Motion and sound

Reveal subjects color by color using horizontal or vertical brush sweeps, with parallax between receding planes where the story needs camera movement. Keep linked steps in the same composition. For a true scene change, sweep a fresh coat of cream across the board, then paint the next poster; avoid a generic dissolve.

Tie reveals, arrows, counters, starburst stamps and band repainting to the beat table and spoken events. Aim for the semantic reveal to finish on its word, leading by at most 0.2 seconds. Use quiet brush friction, dabs, taps and occasional stamp impacts beneath narration. Reuse existing narration when comparing styles.

## Review

Check matte grain, readable rough-edged lettering, full-strength finishing, native-resolution masks, deliberate object lifetimes and subject accuracy. Read back representative frames and the encoded ending. Measure draw performance and use static-pass/background caching without reducing the texture treatment.
