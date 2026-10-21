# Tech Glow

Load `assets/styles/tech-glow/runtime.js` through the project builder. Its helpers are exposed as `STYLE_PACKS["tech-glow"]`. `reference.js` preserves the entire supplied original as a visual reference; its AI-learning topic, fixed scene count and timestamps are not production requirements.

Deep navy/indigo space, drifting electric light, perspective floor grid, thin gradient borders, luminous line icons and gradient typography. Use Space Grotesk for headlines and Inter for supporting text. Maintain negative space around the dominant idea.

Use `background`, `card`, `tile`, `gtext`, `connector`, `bez`, `ring` and `glowDot`. Register subject-specific line art in `ICONS`; do not force unrelated reference icons into a story. For `gtext`, choose `align` explicitly. `revealLine` sets its own alpha: pass the parent opacity with `a` when fading a group, or draw text within a correctly managed save/restore scope.

Run `bloom` after scene content on each frame; it composites in pixel coordinates and restores the incoming transform. Run `H.vignette` in logical coordinates. Keep glow subordinate to readable text.

Transitions can carry a ticket, label, node or card between ideas, build connections, or change scenes when the narrative changes. Avoid replacing every beat with a fresh slide. Sound choices: restrained glass hits, ticks, electronic confirmations, soft transition movement, all timed from project events.
