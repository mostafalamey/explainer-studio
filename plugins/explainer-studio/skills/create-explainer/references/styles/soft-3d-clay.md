# Soft 3D Clay

Use for rounded pastel clay props with chunky extrusion, soft core shadows, bright bounce-light rims, specular blobs and blurry floor contact shadows. This Canvas pack simulates dimensional objects; it is not a mesh-based 3D engine.

## Composition and material

Build a continuous pastel cyclorama with lavender, peach, mint, white, pink, blue, coral and butter-yellow objects. Use depth, contact shadows, gentle bobbing and a few blurred far or near props. Keep the primary explanation sharply legible. Use Fredoka at 28 logical pixels or larger for essential labels, 44 for headings and 64 for key numbers. Numbers work well inside butter-yellow badges; labels are puffy pills. Preserve supplied logos as authentic assets.

## Drawing helpers

`STYLE_PACKS['soft-3d-clay']` exports `PAL`, `roundedPoly`, `innerShadow`, `puffy`, `sphere`, `contactShadow`, `bubblePath`, `BUBBLE_BB`, `pill`, `rrect`, `clay`, `clayLabel` and `clayTube`.

`clay(ctx,path,bounds,x,y,palette,options)` draws layered extrusion, a gradient face, all three inner-shadow passes, a bounce rim and optional specular blob. Bounds are local `[left,top,right,bottom]`; options include `ext`, `rot`, `s`, `spec` and the reference's `fast` side-rendering mode. Keep the shadow/highlight strengths from the source. Tubular arrows have rounded shafts and blobby heads.

Render unchanged prop artwork into cached canvases at the output pixel scale, then animate their position, rotation and squash/stretch. Allow margins for extrusion and shadows. This retains the full lighting treatment while avoiding repeated expensive blur passes. Dynamic labels and changing props need separate cache keys. Extrusion scratch buffers must check both width and height when rendering different sprite sizes.

Use the reference's seamless multi-stop background and soft key glow, floor contact shadows and depth blur. Run the unchanged `H.grain` every frame with strength 0.018 and seed `9 + Math.floor(t*12)`. Do not replace the finish with flat rounded rectangles.

## Motion and audio

Use a damped spring such as `1-exp(-6.5*u)*cos(10*u)` with explicit start/end clamping. Contact shadows grow as an object settles; squash/stretch is subtle. Keep linked steps in one set; dolly or pull back when the explanation requires a new focus. Use pastel props appropriate to the subject rather than copying the reference's pets, AI chip or accuracy figures.

Read all semantic event times from the beat table. Keep numbers and names readable on their spoken word, with up to 0.2 seconds anticipation. Use quiet rubbery pops, soft thuds, puffs and restrained chimes below narration. Reuse existing voiceover for style comparisons.

## Review

Check native-resolution sprite detail, complete extrusion and inner shadows, readable labels, correct logo proportions, contact with the floor, clear sightlines during motion and deterministic seeks. Inspect the actual encoded ending. Report automated and sampled review separately from a continuous watch-through.
