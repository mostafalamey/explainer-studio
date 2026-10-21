# Verification

The shared plugin is based on Explainer Studio 0.22.2. Its 18 existing samples are 1920 x 1080, 30 fps and 8.3 seconds long, with reused English narration. No new paid media generation was performed for this release.

Checks cover selector settings and clipboard copying; 18 preview files; source/reference hashes; Automatic/User-created audio routes; seven native-language labels; Windows DPAPI encryption; fake-key service create/edit/remove; keys excluded from browser storage and copied choices; origin, host and CSRF checks; local credential injection into a child process; legacy choices; and responsive layout. Key tests use disposable fake values in isolated stores.

The production workflow has also been exercised with landscape, portrait and square project settings and all eight narration/music/effects combinations. Existing video/export results belong to the original samples; new projects need their own storyboard and export review.

Validation is automated with sampled visual inspection, not a continuous human watch-through. Windows is the verified desktop platform. macOS/Linux keyring paths are implemented and require a secure OS backend; those operating systems have not been end-to-end verified here. Merely saving a custom service key does not implement that service's API.
