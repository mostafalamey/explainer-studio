# Neon Sign at Night

Use `STYLE_PACKS['neon-sign-at-night']`. The complete user-supplied reference is preserved in `assets/styles/neon-sign-at-night/reference.js`. Its AI story, brain and animal signs are examples, not reusable content requirements.

## Staging and materials

Create hand-bent glass neon mounted on an old brick wall after rain. A continuous wall lets the camera travel between connected signs. Draw subject-specific tube paths, not filled dashboard icons. Use cyan, pink and warm yellow as the main tube colours, with violet, red or green only when meaningful. Authentic logos remain unchanged.

Call `setScale(ctx.canvas.width / 1280)` before `render(ctx,1280,720,t,paint,cam)`. The paint callback receives `tube`, `ntext`, `wordByLetter`, `arrow`, `frame`, `clip`, `elec`, `blockout`, `wordGap`, `quadPt`, `ellClip`, `ign` and `NX`. Draw in logical world coordinates; `cam` is the horizontal camera displacement. Tubes retain dark unlit glass, white-hot narrow cores and saturated multiscale halos. Add real mounting clips, electrode housings and painted-out connecting runs at plausible positions. A curved cable is not a luminous route unless the explanation calls for one.

Use Gloria Hallelujah for bent-script headlines and Poiret One for thin sign labels and large digits. Both are embedded with OFL notices. Essential labels and corner headers are at least 28 logical pixels, headlines 44, key numbers 64. Leave enough interior clearance that glow and glass do not merge into sign borders. Cached native text stamps permit normal viewport clipping while the camera pans; inspect complete held signs separately from transition frames.

## Motion and explanation

Use the reference's `ign` stutter followed by steady light, and `wordByLetter` for sign lettering. Key objects must become visible at their project event, leading the named word by at most 0.2 seconds. Give important signs enough time to latch and read. Optional failing tubes can flicker occasionally; do not obscure a key number or create broad rapid flashing across the whole frame.

Use segmented `arrow` paths as chase lights toward their targets. Numbers are neon digits that re-light when their value actually changes; never invent data to show the effect. Ring emphasis and a restrained pulse can highlight a call number. Carry the existing sign into the next beat when the idea continues. For a change of place, whip-pan along the wall using an eased camera displacement tied to the beat table, then hold the new sign. Do not force a camera pan on every sentence.

## Rendering and sound

`render` retains the original brick and mortar texture, low-resolution sign light map, illuminated brick edges, contact shadows, physical supports, saturated bloom, wet concrete and rippled puddle reflection. Keep its final 0.55 vignette and 0.045 grain. Do not substitute a generic glow filter or omit the reflection. Native tube, text and material buffers retain delivery resolution; reduced-resolution lighting and vertical reflection smear are intentional techniques from the reference.

Use `soundKit(k)` to obtain the original `relay`, `buzzRun`, `ignite` and `chase` helpers. Their ignition buzz uses the same deterministic flicker hash as the visual. Drive their times from the project events. Keep letter strikes and relay ticks minor under narration. A functional call chime and a short air smear can support the Smart Queue example; ambience beds are optional and drop out in voiceover mode.

The bundled comparison reuses approved English narration, real word timings and illustrative ticket G-001. Validate the camera pan, held text spacing, hardware placement, matching call number, deterministic seeking, sound mix and encoded ending. Report automated and sampled visual checks separately from a continuous human watch-through.
