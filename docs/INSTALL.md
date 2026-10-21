# Installation and troubleshooting

## 1. Install the plugin

Requirements for the selector: Git, Git LFS, Python 3.10+ and Codex with plugin support. The Codex CLI must be on PATH. Follow the official [Codex plugin packaging and marketplace guide](https://developers.openai.com/plugins/build/plugins) if your client does not expose these commands.

```sh
git lfs install
git clone https://github.com/mostafalamey/explainer-studio.git
cd explainer-studio
git lfs pull
codex plugin marketplace add .
codex plugin add explainer-studio@explainer-studio
python tests/smoke.py
```

Use `python3` on systems where that is the Python 3 command. Keep the entire checkout: marketplace paths and media references are relative. The plugin uses the supported `.codex-plugin/plugin.json` compatibility manifest. The marketplace is named `explainer-studio`; it is separate from any older `explainer-studio-local` development installation.

If the skill is not visible after installation, start a new Codex chat. Ask Codex to use `$create-explainer` and open the selector. A new chat alone does not install missing dependencies.

## 2. Start the selector

```sh
python plugins/explainer-studio/skills/create-explainer/scripts/launch_selector.py
```

Add `--no-browser` to print the URL for an agent to open. The process stays local and can be reused. If the first port is occupied, the launcher tries another port. To run a foreground server you can stop with Ctrl+C:

```sh
python plugins/explainer-studio/skills/create-explainer/scripts/serve.py plugins/explainer-studio/skills/create-explainer/assets --port 8869
```

API-key management requires this bundled server; opening the HTML as a `file://` page cannot save keys. Clipboard choices contain a readable request and a JSON brief, never credentials. Paste the result into your chat and add the topic you want to explain.

## Video production dependencies

The selector itself does not need Node.js, FFmpeg or Playwright. Rendering a new MP4 does.

Install a supported [Node.js LTS](https://nodejs.org/en/download), [FFmpeg/ffprobe](https://ffmpeg.org/download.html) on PATH, then from this repository:

```sh
npm ci
npx playwright install chromium
```

The package pins Playwright in `package-lock.json`. On Linux, Playwright may also require OS packages; follow the [official Playwright installation guide](https://playwright.dev/docs/intro). Windows users can use an installed Edge browser; Chrome is also supported.

If Codex runs tools from its installed plugin cache, point the renderer to the repository dependency in the same terminal or process that runs the render command. In PowerShell, from the repository root:

```powershell
$env:PW_MODULE_PATH = (Resolve-Path node_modules/playwright).Path
$env:BROWSER_CHANNEL = 'chromium'
```

On macOS/Linux:

```sh
export PW_MODULE_PATH="$PWD/node_modules/playwright"
export BROWSER_CHANNEL=chromium
```

Use `msedge` or `chrome` instead when using an installed browser. These settings are local runtime paths, not API keys. An agent can set them for each render process without changing system-wide settings.

The skill's production reference documents build, QA and export commands. The supplied samples support landscape composition; a new portrait or square film needs an appropriate storyboard/composition rather than a blind crop.

## Local API keys

Use **API keys & services** in the local selector. Provide a service name, key and optional HTTPS documentation link. Choose that name as the preferred service for an Automatic track, or choose User-created when you will supply the audio file.

- Windows: DPAPI encrypts the credential store for the current OS user under `%LOCALAPPDATA%/ExplainerStudio/services.dat`.
- macOS/Linux: install the optional dependency with `python -m pip install -r requirements-keyring.txt` and configure OS Keychain/Secret Service. Restart the selector if the secure backend was missing. The protected store is user-local and does not travel with a Git clone.
- Blank replacement key during Edit keeps the saved key. Remove deletes that service credential. Saved keys are not displayed again.
- Automatic generation uses an available compatible API/tool during approved production. A service name or saved key does not guarantee narration/music support, quota or subscription entitlement. User-created tracks require no API key; Suno music can be supplied as a separate audio file.

Agents can inspect service metadata using `credentials.py status` and inject a selected credential into an authorized provider-specific child process using `credentials.py run`. Read the bundled [local-services reference](../plugins/explainer-studio/skills/create-explainer/references/local-services.md); never dump a key or process environment.

## Update

From the checkout, fetch updates and refresh the installation:

```sh
git pull --ff-only
git lfs pull
codex plugin marketplace upgrade explainer-studio
codex plugin add explainer-studio@explainer-studio
npm ci
```

Run `npm ci` only if using video production or developer tools. Start a new Codex chat if needed. User credentials are stored separately and are excluded from updates.

## Troubleshooting

| Problem | What to check |
|---|---|
| `codex` or `codex plugin` unavailable | Install/update the supported Codex CLI/client and verify its PATH. |
| Preview videos fail to load | Run `git lfs pull` and `python tests/smoke.py`. A small text file beginning with `version https://git-lfs.github.com/spec/v1` is a pointer, not a fetched MP4. |
| Selector uses another port | Open the exact URL printed by the launcher. Browser choices are stored per origin/port. |
| API settings unavailable | Use the bundled local server, check its startup output, and restart after configuring an OS credential backend. |
| Playwright module not found | Run `npm ci` in the checkout and set `PW_MODULE_PATH` for the render process. |
| Browser executable missing | Install Chromium with Playwright and set `BROWSER_CHANNEL=chromium`, or select an installed Edge/Chrome. |
| `ffmpeg` or `ffprobe` unavailable | Install FFmpeg and reopen the terminal so PATH is refreshed. |
| Custom service cannot generate audio | Supply its official API documentation or a compatible connected tool; alternatively use User-created audio. Saving a key is not an adapter installation. |

## Developer checks

```sh
python tests/smoke.py
```

On the verified Windows environment, deeper disposable fake-key checks are available:

```sh
python tests/local-services-contract.py
python tests/run-local-services-ui.py
```

The browser test needs `npm ci` and a supported browser. It uses an isolated credential store and does not call a provider. No paid generation is part of installation or testing.
