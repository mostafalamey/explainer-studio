# Voxel Diorama

Use `style: "voxel-diorama"` with the shared production contract. Build a floating toy-scale voxel world from individual cubes. Retain the reference renderer's three-tone face lighting, exposed-face culling, per-vertex ambient occlusion, ray-marched cast shadows, depth darkening and deterministic falling-block assembly.

Use warm cream backgrounds, orange focal objects, green or mint scenery and earthy undersides. Build subjects appropriate to the explanation. The source robot, pond and AI examples are demonstration content, not required props.

Use Fredoka for readable labels and Silkscreen for counters and pixel typography. Both are bundled offline with licenses. Keep essential labels at least 28 logical pixels and numbers at least 64. `vxPixelText` extrudes rasterized letter pixels; choose scale so the actual headline glyph height reaches 44 pixels. `vxBlockTag` gives labels physical depth.

Use `K`, `setYaw`, `makeProj`, `drawVoxels`, `vxBlockTag`, `vxPixelText` and `finish` from `STYLE_PACKS["voxel-diorama"]`. Voxel positions use integers and the supplied key function's bounded grid (x/y roughly -32 to 95; z above -8). Camera yaw must remain in the positive-facing quadrant supported by the renderer. Use seeded randomness. Landed voxels provide occlusion and shadows; falling voxels are separate until they settle.

Truck or orbit gently around a continuous scene; blocks assemble in order, numbers click into place and route arrows form chains of cubes. Use quiet block clicks, restrained chip tones and a clear call chime under narration. Read timing from the project beat table.

Run `finish` each frame: warm vignette at 0.18 and static fine grain at 0.025, preserving the reference strengths. Grain allocates at output resolution. The scene geometry draws directly at native canvas resolution. Inspect overlaps, voxel sorting, shadow creases, block assembly and actual encoded frames before adding the shot and preview to the selector.
