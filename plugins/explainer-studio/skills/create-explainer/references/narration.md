# Narration and timing

- Existing audio: measure with ffprobe; use supplied word timestamps or transcribe using available tools. Do not regenerate a voice just to change the style.
- New audio: settle the script and pronunciation first. Use authorized provider tools; save a local file through their supported output mechanism. Record actual generation usage rather than assuming a credit price.
- Estimated storyboard times remain provisional until measured audio is available.
- For a source excerpt, cut at sentence boundaries, preserve speech, subtract the excerpt's start from word/event timestamps, and add about one second after the final word. Never include the start of the next sentence in the hold.
- `events` use absolute seconds within the project. A visual may lead its spoken word by up to 0.2 seconds and should not lag. Build one idea through its sentence and leave reading time.
- Audio is the player clock when loaded. Without audio use the player's own clock. Seek, pause, mute and replacement audio must stop/restart effects correctly.
- The stock renderer mixes synthesized effects conservatively beneath narration, ducks them using the narration as sidechain input, and targets -16 LUFS / -1.5 dBTP for the result. Check measured output.
- Provide captions separately when desired. Direction tags are not spoken transcript words.
- Credentials, signed download URLs and account balances do not belong in reusable style packs.
