# Delivery checks

1. Compare the story and labels with the factual brief; distinguish simulated behavior from verified live integration.
2. Validate beats/events and measured audio duration. Confirm key reveal times against words.
3. Seek in nonchronological order; the same timestamp must produce identical pixels.
4. Test play, pause, scrub, mute, looping and the no-audio fallback; sample mobile layout.
5. Inspect the style's representative shot, important reveals, transitions, and closing hold. Look for clipped labels, inconsistent depth, unreadable essential text, repeated headings and logo overlaps. Automated text bounds are supplementary, not a substitute for visual review.
6. Render vectors/text and all compositing layers at delivery resolution, then inspect encoded MP4 frames.
7. Decode the whole file with FFmpeg; probe resolution, frame rate, duration and audio streams; measure loudness/peak. Fail on decode errors, nonfinite values or clipping.
8. Keep a verification report, source provenance and reproducible commands. Say whether review was sampled or continuous. Never label a tool check as a human watch-through.

Style changes should reuse existing narration and timing unless the explanation also changes. Rerun checks affected by the edit; avoid regenerating paid audio for visual-only corrections.
