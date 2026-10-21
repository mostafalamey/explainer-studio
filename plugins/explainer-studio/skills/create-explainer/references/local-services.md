# Local audio services

The plugin and selector travel together in the Git repository or release package. Start the selector with:

```text
python SKILL/scripts/launch_selector.py --no-browser
```

Open the printed local URL in Codex. Omit `--no-browser` for a normal browser. The launcher checks fixed port 7719, reuses a matching running version, or starts a hidden loopback server on that same port. It reports occupied-port conflicts instead of choosing another port. The computer does the rendering. No public website or cloud render service is needed. Keep editable video projects outside the plugin.

## Any service name

In **API keys & services**, users enter a service name, API key and optional HTTPS API documentation link. There is no fixed provider list. The entry is a credential, not an API adapter or proof of access. Saving does not validate the key or make a provider request. Do not invent API endpoints or promise automatic support merely because a name/key is stored.

Windows uses DPAPI encryption tied to the current OS user, under `%LOCALAPPDATA%/ExplainerStudio/services.dat`. macOS/Linux use Python `keyring` with the OS Keychain/Secret Service backend; install `keyring` and configure a secure backend if absent. No plaintext fallback is used. `EXPLAINER_STUDIO_CONFIG_DIR` or `--config-dir` selects a private directory outside the served assets. This store does not move with the repo; each person adds their own credentials. Keys never enter browser localStorage, choices, project JSON, generated HTML, logs, screenshots, releases or Git. The server returns service metadata and key-present status only. Editing leaves a stored key unchanged when the replacement field is blank. Removing deletes the saved credential. The UI clears the password field after every save attempt.

## Automatic versus User-created

Set each track independently: `mode: automatic` or `mode: user-created`. `service` is a preferred service name or `auto`; it is nonsecret metadata and can be copied with choices. Disabled tracks retain preferences but trigger no generation. Existing schema version 2 choices remain supported: `provider: elevenlabs` maps to Automatic/ElevenLabs; `provider: google-ai-studio` maps to User-created. A legacy shared `audioProduction` remains a fallback.

For **Automatic**, first reuse approved supplied audio. Otherwise honor the selected service during authorized production. For `auto`, inspect available connected tools and local service metadata, choose one compatible with that track, and record the actual route. For an explicit name, use that service or explain missing access/API support; never silently switch a paid service. Confirm the service's current official API documentation or available connector schema before creating a provider-specific generation command. A narration API does not imply a music API. If no compatible route exists, explain the limitation and offer a User-created file. Saving a key does not authorize generation or charges.

Inspect metadata without exposing keys:

```text
python SKILL/scripts/credentials.py status
```

When a provider adapter needs an environment variable, run it through the credential wrapper:

```text
python SKILL/scripts/credentials.py run --service "Service name" --env SERVICE_API_KEY -- python PROJECT/generate_audio.py
```

The child receives the key only in its process environment. The wrapper does not print it. Never echo or log that variable, dump process environments, put keys in command arguments/URLs, or save them into the adapter source. Adapter output must be a local audio file plus nonsecret provenance. Use the saved credential when the user selected that local service entry. Connected tools can be used for automatic discovery or when the user chooses that account route; connected account access is separate from this credential store. Do not claim a stored key was tested unless an authorized provider request actually verified it.

For **User-created**, follow [audio handoff](audio-handoff.md). The user may use Suno for music, Google AI Studio, a recording, or any other service and supply separate audio files. Do not assume an official Suno API exists or treat an unrelated third-party API as Suno itself. User-created tracks do not require any API key.
