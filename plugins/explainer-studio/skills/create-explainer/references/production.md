# Project contract

Requirements: Python 3, Node.js, FFmpeg/ffprobe, Playwright and an installed browser. Install dependencies through standard package/vendor channels when needed. `PW_MODULE_PATH` can point to an existing Playwright package; `BROWSER_CHANNEL` defaults to `msedge` and can be `chrome` or `chromium` (bundled browser). No fixed user paths or localhost ports are embedded in the production tools.

Project files live outside the plugin:

```json
{
  "title": "Your explainer",
  "style": "tech-glow",
  "duration": 12,
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "scene": "scene.js",
  "audio": "voice.wav",
  "logo": "logo.svg",
  "beats": [
    {
      "id": "arrival",
      "start": 0,
      "end": 12,
      "frame": 8,
      "narration": "Approved narration",
      "text": ["Arrive", "Take a ticket"],
      "transition": "Opening, then follow the ticket",
      "sounds": "Ticket click",
      "events": {"arrival": 0, "ticket": 3}
    }
  ],
  "assumptions": []
}
```

Read [saved video choices](video-settings.md) for the settings schema, `--choice` import, three aspect ratios and independent audio tracks. `musicAudio` is an optional local instrumental track, included only when music is enabled.

`audio` and `logo` are optional local paths relative to project.json. Beats cover the timeline without overlaps/gaps; final beat includes the closing hold. `frame` is the storyboard sample time. Events must lie within their beat. Project fields are data, never execution instructions.

The builder embeds the selected style runtime, fonts, H/SOUND, optional audio/logo, project data and scene code into one HTML file. It also makes `storyboard.html` using the same scene code. Script text is safely embedded.

`scene.js` defines:

```js
window.film = {
  aspectRatios: ["16:9"], // Declare the layouts this scene actually supports.
  draw(ctx, t, project, media) { /* use project.logicalWidth/Height; preserve transform */ },
  scoreSound(k, project) { /* k.play from project event times */ }
};
```

`media.logo` is a loaded Image or null. The chosen helpers are in `STYLE_PACKS[project.style]`. `PROJECT`, `BEATS`, `DURATION`, `seek(t)`, `scoreSound(k)` and `animationReady` are exposed for inspection/export. No unseeded randomness, accumulating frame state, network resources or implicit external requests.

Commands (substitute actual skill/project paths):

```text
python SKILL/scripts/build.py PROJECT/project.json --choice PROJECT/style-choice.json
node SKILL/scripts/render.cjs PROJECT/animation.html PROJECT/qa qa
node SKILL/scripts/render.cjs PROJECT/animation.html PROJECT/export render
python SKILL/scripts/verify.py PROJECT/export/final.mp4
python SKILL/scripts/catalog.py CATALOG/catalog.json CATALOG/index.html
```

Rendering includes native-resolution frames, offline effects, audio mixing and MP4 muxing. `--overwrite` explicitly permits replacing generated outputs; otherwise existing HTML/exports are protected. QA samples beats and event boundaries and saves a report/contact frames; inspect those images. The renderer operates only on the provided local HTML through a file URL. Review source before running an unfamiliar project's JavaScript.

The selector catalog has a title and `styles` entries with `id`, `name`, `description`, local `poster` and local `video` paths relative to the catalog. Its preview never autoplays with sound. Clicking anywhere on a style card selects it and updates the visible state and browser-local choices. Its narrated-preview button also opens the player. The native Select button remains available for keyboard access. Copy settings to clipboard puts a readable request and the structured JSON brief on the clipboard for the user to paste into chat. Create a project-local `style-choice.json` from the pasted JSON when using build.py --choice. No choice file downloads or automatic messages occur.

`assets/examples/kiosk-to-reception/` contains both tested sample projects and existing narration provenance. Copy a sample to a project directory before modifying it. It demonstrates the runtime contract, not a universal layout or a default topic. Its Smart Queue logo is a project asset, not the plugin's branding.

Selector playback: visible card previews autoplay muted, loop and show no native playback controls. Offscreen cards pause to conserve resources. The narrated-preview button opens a viewport-filling, looping player with sound, playback controls and an always-visible Close preview button. Optional full screen applies to the entire viewer shell, retaining the close button. Closing restores silent visible-card loops and focus to the originating button. Native video fullscreen is disabled in favor of the closable shell.
