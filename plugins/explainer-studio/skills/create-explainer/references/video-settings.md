# Saved video choices

The selector remembers choices locally in the browser. **Copy settings to clipboard** copies a readable production request plus a schema version 2 JSON brief; it does not download a file or send a chat message. The user pastes it into chat. Read the pasted brief at intake and write its JSON to a project-local `style-choice.json` for the existing builder. Copying alone does not authorize generation. Defaults: landscape 16:9, English narration on, music off, sound effects on. Language and voice are preferences; a voice name is not a provider voice ID. Music defaults to instrumental, calm mood. `narration.mode` and `music.mode` independently select `automatic` or `user-created`. Each track's `service` is a preferred service name or `auto`; copied settings contain no API keys. See [local services](local-services.md) for the protected credential store, generation wrapper and backward compatibility.

```json
{
  "schemaVersion": 2,
  "style": "tech-glow",
  "name": "Tech Glow",
  "settings": {
    "aspectRatio": "9:16",
    "narration": {"enabled": false, "language": "English", "voice": "Auto — suit the story", "mode": "automatic", "service": "auto"},
    "music": {"enabled": true, "mood": "calm", "mode": "user-created", "service": "auto", "instrumental": true},
    "soundEffects": {"enabled": true}
  }
}
```

Read saved choices at intake, before scripting or drawing. Explicit later chat instructions override earlier saved values; update the choice file with the resolved values before building so a stale file cannot undo the change. Old `{style,name}` files remain supported and receive selector defaults. Validate unknown styles, versions, ratios, moods and boolean fields with `scripts/choices.py`.

Use `python SKILL/scripts/build.py PROJECT/project.json --choice PROJECT/style-choice.json`. The builder embeds the resolved settings in PROJECT, selects the style, and sets output dimensions. It does not rewrite project.json. Keep the choice file with the editable handoff; pass it on every rebuild or copy its resolved settings and dimensions into project.json.

## Aspect ratio is composition

| Format | Output | Logical stage |
| --- | --- | --- |
| 16:9 | 1920 × 1080 | 1280 × 720 |
| 9:16 | 1080 × 1920 | 720 × 1280 |
| 1:1 | 1080 × 1080 | 720 × 720 |

Author the scene using `project.logicalWidth` and `project.logicalHeight`, or distinct compositions per format. Declare `film.aspectRatios` as the ratios the scene actually supports. Existing samples support 16:9 only; the player rejects an undeclared portrait/square scene instead of distorting it. Re-stage the chosen style's objects, camera paths, background and labels for the requested frame. A changed ratio requires a new storyboard. Offscreen textures must follow the intended output scale. Check native resolution, text bounds and the encoded final frame.

## Audio choices

`settings.narration.enabled=false` omits the `audio` file from built HTML and export, disables voice loading, and uses the visual clock. Write on-screen explanations and sufficient reading time; do not merely mute a narration-dependent story. Narration on uses `audio` as before. Missing enabled audio is allowed in a clearly labelled provisional storyboard preview, but final export fails until it is supplied.

`settings.music.enabled=true` embeds `musicAudio`, a relative local audio path. Supply a track covering the full video; edit or extend it first if it is too short. Preview music seeks, pauses, loops and mutes with the animation and fades at both ends. It is reduced under voice. Export normalizes stems, fades music, ducks music using the voice signal, mixes only enabled tracks, and limits peaks. The interactive preview uses a conservative fixed reduction under narration; encoded mixing uses dynamic ducking. Listen to the encoded mix.

`settings.soundEffects.enabled=false` prevents the scene score from running in live and offline playback. Style score music calls are disabled; background music is a separate supplied/generated track. Keep effect scores limited to action/transition sounds. All three audio choices off yields an MP4 with no audio stream. `verify.py` reads the adjacent render-report.json to check expected dimensions, duration and audio presence; `--silent` verifies standalone silent exports without a report.

## Music production

First honor `music.mode` independently of narration. For User-created, prepare a prompt suitable for Suno or another tool and wait for the supplied music file. For Automatic, follow [local services](local-services.md), use a compatible selected service/connected tool, and verify its current official API or tool schema. Reuse approved tracks. Never infer automatic API access from a saved service name or from a consumer subscription.

Follow existing authorization for paid generation; a saved setting alone does not authorize a new paid run. After the storyboard/timing is approved, compose to the final length with restrained instrumentation and a natural ending. Reuse one approved music asset across revisions. Record provider, actual model, prompt, duration, usage/cost when returned, and asset provenance. Keep credentials out of HTML, choice files, source examples and plugin ZIPs. No provider call occurs in the selector or builder.

The selector's representative MP4s remain the original 16:9 narrated comparison samples; changing production settings does not claim to regenerate or remix these baked previews.

Track-level `mode` and `service` fields extend schema version 2. Old provider/shared audioProduction fields are migrated as described in local-services.md. Turning a track off retains its source/service preference but performs no generation. Sound effects remain independently controlled.

Vintage Newsprint replaces Cosmic Star Chart from v0.21.0. The selector and choice normalizer map an older `cosmic-star-chart` selection to `vintage-newsprint`, retaining video settings. The old scene code is not automatically converted into the new medium; use the new pack and example when authoring.
