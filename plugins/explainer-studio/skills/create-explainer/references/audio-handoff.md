# User-created audio

Apply this handoff to an enabled track with `mode: user-created` (or legacy `provider: google-ai-studio`). The other track may independently use Automatic. The user can create music in Suno, narration/music in Google AI Studio, record it, or use another platform. Prepare the script/prompt and wait for their files instead of generating that track. No API key is needed. Do not promise a model, subscription entitlement, quota, API or music tool on the user's account.

## Prepare the handoff

Complete factual scope, script and visual storyboard through the usual approval. If narration uses this source, deliver the exact approved plain-text script separately from voice direction: selected language, voice preference, intended audience, tone, pace, pronunciation and pauses. Avoid embedding stage directions into spoken text. Explain that storyboard times are provisional until the returned recording is measured.

If music is enabled and uses this source, provide a separate music prompt with the chosen mood, instrumentation suited to the visual style, target duration, emotional progression, and a clean ending. Specify instrumental/no singing, restrained melody under speech when narration is on, and no voiceover or sound effects baked into the track. If narration is also enabled, measure the returned narration first to set the actual music length; provide an initial duration estimate if useful, clearly labeled provisional.

Request only enabled assets assigned to User-created: `narration.wav` or MP3 when narration is on, `music.wav` or MP3 when music is on. Ask for separate clean files. Do not require a narration track for a text-only video. The user can attach them to chat or provide local paths. Do not repeat file requests after suitable assets have already been supplied.

## Ingest and finish

Probe/decode the supplied files, check duration, intelligibility and clipping, and retain provenance as user-created audio, naming the service only when supplied. Record any voice/model details the user supplies; never invent them. Bind narration to `audio` and music to `musicAudio` in project.json. Derive actual word/event timing from the supplied narration when needed. Match the approved script; surface substantive differences before retiming the whole explanation.

Re-time visual beats to narration or the planned reading pace. Music must cover the final video, including the held ending; edit or ask for an extension if necessary. Keep narration/music separate, fade the bed, duck it under speech, and follow normal export and audio QA. The existing builder can show a provisional storyboard with enabled assets pending but refuses a final export until they are present. Provider metadata records the route; it does not itself generate anything.
