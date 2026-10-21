---
name: create-explainer
description: Produce or revise narrated Canvas explainer videos with visual storyboards, a visual style selector, synchronized sound, editable HTML and MP4 export. Use Tech Glow, Isometric Pastel, Cut-Paper Diorama, Voxel Diorama, Punk Zine Collage, Glassmorphism UI, Tarot Card, Gouache Travel Poster, ISOTYPE Pictograms, Soft 3D Clay, Flat-Vector Science, Editorial Essay Collage, Claymation Set, Neon Sign at Night, Chalkboard Lesson, Memphis Group, Bauhaus Poster or Vintage Newsprint; also use when adding another source-backed style to Explainer Studio.
---

# Create an explainer

Resolve all bundled paths relative to this skill directory. Keep project files outside the installed plugin. This is an editable Canvas production workflow; choose a different medium only when the user requests it.

## Establish the explanation

Identify the subject, audience, communication goal, authoritative facts, language, branding, duration and output format from the conversation and supplied material. Ask only for information that changes the result. Separate verified behavior from proposals or demonstrations. Do not copy an example's product claims or props into another topic.

The style selector always uses **http://127.0.0.1:7719/style-selector.html**. Before opening it, run `python SKILL/scripts/launch_selector.py --no-browser`. The launcher checks port 7719 for a compatible selector first: reuse it and show the returned clickable link if healthy; otherwise start a fresh hidden loopback server on 7719 only. Never scan for another selector port or fall back to another port. If 7719 belongs to an unrelated service or an incompatible selector, report the conflict without stopping that process or launching a duplicate. Do not launch `serve.py` directly or assume that a printed startup message proves readiness. If the execution environment blocks local health checks or kills background children, resolve that limitation and rerun the launcher. Confirm the process remains running and its health endpoint responds before reporting it ready; distinguish server checks from browser rendering checks. A requested `--config-dir` applies only to a new server and never replaces a running server's credential store. When moving from an older port, reuse the known protected credential directory without copying or exposing keys; browser-local choices belong to the old origin and may need to be selected again.

If the user has not chosen a style, open the verified selector URL. Create a project-specific catalog with `scripts/catalog.py` only when the project needs one. The selector stays bundled with the plugin/Git repository; do not publish it unless asked. It contains representative shots and playable previews. The selector copies a readable request plus a schema version 2 JSON brief to the clipboard. The user pastes it into chat; read both and use the structured choices as the production brief. For builds, save the pasted JSON as a project-local `style-choice.json`. Existing choice files and plain-text requests remain supported. Read [saved video choices](references/video-settings.md) and apply aspect ratio, narration, music, sound effects and audio creation workflow before planning. Later explicit chat instructions override saved choices. Read only the selected style:

- [Tech Glow](references/styles/tech-glow.md): luminous diagrams, graphic cards, connections and typography.
- [Isometric Pastel](references/styles/isometric-pastel.md): illustrated spaces, 30-degree projection, shaded objects and camera travel.

- [Cut-Paper Diorama](references/styles/cut-paper-diorama.md): textured cardstock, cut lettering, layered shadowboxes and tactile motion.

- [Voxel Diorama](references/styles/voxel-diorama.md): dimensional cube worlds, falling-block assembly, ambient occlusion and pixel lettering.

- [Punk Zine Collage](references/styles/punk-zine-collage.md): photocopied scraps, ransom letters, pink spot ink and eight-fps stop motion.

- [Glassmorphism UI](references/styles/glassmorphism-ui.md): live backdrop blur, frosted dashboards, layered glass panels and crisp typography.

- [Tarot Card](references/styles/tarot-card.md): aged illustrated cards, gold foil, velvet, card dealing and flips.

- [Gouache Travel Poster](references/styles/gouache-travel-poster.md): matte painted planes, dry-brush edges, bold poster lettering and cream-coat transitions.

- [ISOTYPE Pictograms](references/styles/isotype-pictograms.md): repeated flat silhouettes, fixed quantity keys, ruled charts, stepped stamps and lithographic ink.

- [Soft 3D Clay](references/styles/soft-3d-clay.md): puffy pastel objects, rounded extrusions, soft lighting, springy motion and clay tube arrows.

- [Flat-Vector Science](references/styles/flat-vector-science.md): deep space gradients, crescent shadows, parallax stars, rounded characters and camera pullbacks.

- [Editorial Essay Collage](references/styles/editorial-essay-collage.md): warm paper, torn halftone prints, serif clippings, highlighter sweeps and stepped cutouts.

- [Claymation Set](references/styles/claymation-set.md): waxy plasticine, thumbprints, sculpted sets, clay lettering and twelve-fps stop motion.

- [Neon Sign at Night](references/styles/neon-sign-at-night.md): glass tubes, coloured halos, wet brickwork, physical mounting hardware and rippled reflections.

- [Chalkboard Lesson](references/styles/chalkboard-lesson.md): dusty green slate, broken chalk strokes, handwritten lessons, moving chalk and an oak tray.

- [Memphis Group](references/styles/memphis-group.md): clashing pastel grounds, hard outlines and shadows, terrazzo, springy cutouts and striped scene wipes.

- [Bauhaus Poster](references/styles/bauhaus-poster.md): primary geometry, ruled layouts, aged cream paper, lithographic ink and camera travel along a printed sheet.

- [Vintage Newsprint](references/styles/vintage-newsprint.md): yellowed broadsheets, blackletter mastheads, coarse halftone images, uneven ink, ruled diagrams and red pencil emphasis.

These are distinct staging systems, not color themes on one fixed layout. Keep the explanation and event timing separate from visual composition.

## Storyboard and narration

When narration is off, write an on-screen explanation with enough reading time, omit voice generation and timing alignment, and plan visual beats from that reading pace. When narration is on, write natural standalone narration and a beat table: spoken text, on-screen keywords, visual action, transition rationale, sound events and timing confidence. Use supplied audio and timestamps when present. Otherwise estimate timing for the storyboard, label it provisional, and retime after narration is generated. Never claim estimates are word timestamps.

Draw a visual storyboard with the selected pack's real drawing code. Include exact on-screen text, transitions, sound notes and assumptions. Normally obtain storyboard approval before full animation or paid voice generation. Existing approval applies to unchanged work; explicit requests for test renders authorize those tests without another approval loop.

Honor each enabled track's `mode` independently: Automatic generates through an available compatible service; User-created prepares a script/prompt and waits for the user's file, including music made in Suno. Read [local services and keys](references/local-services.md) for the generic credential list, preferred service, legacy migration and secret-free generation wrapper. A saved service name/key does not itself implement an API or authorize paid generation. Use only verified provider APIs or connected tools, and explain missing support rather than silently switching services. Follow [audio handoff](references/audio-handoff.md) for User-created tracks. Never request API keys in chat; direct users to the local settings.

Follow [narration and timing](references/narration.md). Reuse approved audio. If new narration is authorized, discover the available provider tools and record voice/model, actual duration, usage and provenance. The plugin does not contain credentials or assume an ElevenLabs connection. Keep sound effects below speech when enabled. Honor all audio toggles in both preview and export; see the saved video choices guide for optional music production and mixing.

## Build and review

Follow [project contract and commands](references/production.md). Author `scene.js` with the selected runtime helpers. The same draw function produces storyboard frames and animation. All visual and sound events read the project timing table; camera motion and sound panning share camera data. Keep random behavior seeded and seeking deterministic.

Use the selected format: 1920 x 1080 landscape, 1080 x 1920 portrait or 1080 x 1080 square, at 30 fps by default. Draw in the corresponding logical stage from PROJECT.logicalWidth / logicalHeight, with offscreen layers allocated at output resolution. Declare only supported compositions in film.aspectRatios. Essential labels are at least 28 logical pixels, headlines 44, key numbers 64. Scale composition for other aspect ratios rather than cropping blindly.

Preserve the selected medium's finishing passes. Manage element lifetimes explicitly: old headings must exit before a held logo ending. Honor authentic logos and the user's brand constraints. Avoid burned-in narration sentences unless requested; optional captions are a separate file.

Run the renderer's QA and inspect representative frames, transitions, important reveals and the actual encoded ending. Read [quality checks](references/quality.md). Report automated/sampled checks separately from continuous human viewing. Fix observed problems and rerun affected checks.

Deliver the MP4, editable HTML, project/scene/timing sources, narration provenance, and verification report. Use `scripts/catalog.py` to present alternate styles or tests together. Report actual files and any remaining limitations; a package is not installed merely because it exists.

## Adding a style

Read [adding styles](references/add-style.md). Add a pack and selector entry, preserving its source and distinct motion language. Extend the shared engine only when a concrete new requirement needs it. Do not duplicate the whole workflow per style.
