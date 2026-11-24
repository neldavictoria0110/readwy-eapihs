# READwy Android / Play Console Bundle Release Spec

> **Status:** Planning/spec document only. No Firebase/Render hosting changes, no signing, no AAB build, no Play Console upload performed by the agent. I will approve every commit.

## Inputs (confirmed / to confirm)

| Input | Value | Status |
|---|---|---|
| Production URL (HTTPS) | `https://readwy-eapihs.onrender.com` (user mentioned `https://readwy.onrender.com`, but it returned 404 during check; live site is `readwy-eapihs.onrender.com`) | **Confirm before Step 0** |
| Hosting for site | Render Static Site (existing). Firebase Hosting config exists in repo but must be left untouched for this task. | Confirmed constraint |
| Android package name | `com.readwy.app` | Confirmed |
| App name | `READwy` | Confirmed |
| Launcher name (<=12 chars) | `READwy` | Confirmed |
| Start URL | `/index.html?view=startup` (current manifest start_url) or `/` - confirm canonical | **Confirm** |
| Theme color / background color | `#201e16` / `#201e16` (from `manifest.webmanifest`; `https://readwy.onrender.com` was not reachable for visual check) | Confirmed from manifest |
| Initial versionCode / versionName | `1` / `1.0.0` | Confirmed |
| Play Console upload | **Manual by owner only**. Agent must not upload. | Confirmed constraint |

## Constraints

- Leave **Firebase and Render hosting configuration untouched** unless explicitly approved for a specific, minimal TWA-readiness change and I approve the commit.
- **I approve every commit.** No push/deploy/upload to Play Console or hosting provider without explicit confirmation.
- **No secrets in repo.** No keystore passwords, no key.properties values, no `.jks`/`.keystore` committed. Never print/log/echo/commit passwords.
- Work in small, reviewable steps. After each step, summarize what changed and what was verified.
- Do not modify unrelated files. Do not break assessment, intervention, or report behavior.
- If a command fails, show actual error, diagnose root cause, fix; no silent workarounds.

## Project Context

READwy (Enchanted Academy of Reading / Reading Express) is a static web-based literacy platform for students and teachers (mainly Philippines). Modules include GST, ORST, WST/SRST, Post-Test, ARAL, InterV, SRA; learner profiles, journey progression, teacher/school reports including EAPIHS Phil-IRI materials. Interactive fullscreen PWA-style experience.

## Step 0 - Audit (before changing anything)

1. **Inspect repo**
   - Framework/build: static site; `index.html` loads embedded page payload; resources under `resources/`, `public/`, `UI and owl/`.
   - Existing manifest: `manifest.webmanifest` present (`display: fullscreen`, icons 192/512 any; no maskable icon declared).
   - Service worker: no `sw.js`/`service-worker.js` found in quick scan. **PWA installability/offline gap.**
   - Hosting config: `firebase.json`, `.firebaserc`, `READwy_Firebase_Hosting_Setup/`; Render deploy uses `render/` static repo. **Do not touch Firebase/Render hosting.**
   - SPA rewrite/catch-all: verify `firebase.json` and Render settings before adding `assetlinks.json`.

2. **Check toolchain** (report missing; install/configure only what is safe)
   - Observed: Node `v24.21.0`, npm `11.19.0`, Bubblewrap installed (`C:\Users\Bench\AppData\Roaming\npm\bubblewrap*`).
   - Missing/not found on PATH: `java`, `keytool`, `adb`, `gradle`, Android SDK/cmdline-tools. **Manual action likely required**: install JDK 17, Android command-line tools/SDK, set `JAVA_HOME`/`ANDROID_HOME`, accept licenses.
   - Run `bubblewrap doctor` after SDK/JDK setup.

3. **PWA audit**
   - Run Lighthouse CLI against confirmed production URL. Record installability, service worker, manifest, maskable icon, HTTPS/mixed content, offline fallback, performance/accessibility notes relevant to TWA.

**Report before any changes.**

## Step 1 - Make Web App TWA-Ready (web project only; commit-approved)

- **Manifest:** verify/update `manifest.webmanifest`: name, short_name, start_url, scope, display (`standalone` or `fullscreen`), orientation, theme_color `#201e16`, background_color `#201e16`, `id`, icons 192x192, 512x512, maskable 512x512. Keep existing behavior.
- **Service worker:** add/register SW with careful app-shell offline fallback. **Do not cache stale assessment content or break login/progress syncing.** Use network-first/network-only for auth, Firebase, assessment submission, dynamic records; cache only static shell/assets with versioned cache.
- **index.html:** `<link rel="manifest">` and required meta tags; confirm present in embedded payload/source generation path (`copy-index.cjs`/source files, not direct edit of generated `public/index.html` except via build flow).
- **HTTPS/mixed content:** audit and fix only where needed.
- **Digital Asset Links:** create `/.well-known/assetlinks.json` with **placeholder** SHA-256 fingerprint; tell owner exactly where to paste real APP SIGNING key fingerprint from Play Console and optionally upload key fingerprint. Ensure served as `application/json` and not swallowed by SPA rewrite. **Check firebase.json rewrites / Render static settings and fix only with approval; prefer non-invasive hosting-compatible placement.** Do not touch Firebase/Render hosting without explicit approval.
- **No UI/logic changes** beyond TWA readiness. Do not break assessments/interventions/reports.

## Step 2 - Build Android Project (Bubblewrap)

- Create `/android-twa` (or approved path). Run `bubblewrap init --manifest=https://[DOMAIN]/manifest.webmanifest` with package `com.readwy.app`, versionCode `1`, versionName `1.0.0`.
- Enable notification delegation only if web push is actually used.
- Set `targetSdkVersion` to current Google Play requirement for new apps/updates; **verify current requirement, do not assume.**
- If Bubblewrap cannot meet requirements (native file access, offline-first behavior beyond TWA capability), stop, explain trade-off, propose Capacitor fallback, wait for approval.

## Step 3 - Signing (strict)

- Generate UPLOAD keystore only if owner has none. Store outside repo or gitignored path, e.g. `~/keystores/readwy-upload.jks` / approved local path.
- **Never print/log/echo/commit passwords.** Read from env vars (`READWY_KS_PASS`, `READWY_KEY_PASS`) or gitignored `key.properties`. Ask owner to set in their shell if needed.
- Add to `.gitignore`: keystore, key.properties, `*.jks`, `*.keystore`, signing outputs as appropriate.
- After signing, output SHA-256 fingerprint of upload key (`keytool -list -v`) and explain:
  - a) With Play App Signing, `assetlinks.json` needs **APP SIGNING key SHA-256** from Play Console > Setup > App signing.
  - b) Also add upload-key fingerprint for sideloaded/internal test builds.

## Step 4 - Build AAB

- Produce release `.aab` (Bubblewrap build or `./gradlew bundleRelease` in generated project).
- Also produce signed APK for local device testing.
- Output to `/release/` with names like `readwy-1.0.0-1.aab`.
- Verify: `bundletool validate`, check packageName, versionCode, targetSdk, signing certificate.
- Test on emulator/device if available. Confirm fullscreen launch with **no browser URL bar**. Visible URL bar = asset links verification failure; debug.

## Step 5 - Automation

- Create `scripts/build-aab.sh` with version bump flag (increments versionCode every release).
- Create `RELEASE.md` with exact future release steps.

## Step 6 - Play Console Checklist (`PLAY_CHECKLIST.md`)

Cover READwy-specifics:
- Create app, enroll Play App Signing, upload AAB to Internal testing first. New personal developer accounts may need closed test with required testers/days before production; **check current rules**.
- Store listing: short/full description, 512x512 icon, 1024x500 feature graphic, phone screenshots, tablet if targeted.
- Privacy policy URL required. Draft covering student data, teacher data, assessment results, progress records, and Philippine Data Privacy Act (RA 10173).
- Data safety form: collected data (names, learner IDs, school, reading scores, usage data), purpose, sharing, encryption in transit.
- Content rating questionnaire.
- Target audience/content: app aimed at children; walk through Families Policy requirements (no non-compliant ads/SDKs etc.), implications for analytics/third-party scripts; audit web app for third-party trackers and report them.
- App access: test login credentials for reviewers if sign-in required.
- Declarations: ads yes/no, government app no, etc.

## Definition of Done

1. Signed `.aab` in `/release/` validates with `bundletool`.
2. Web app passes PWA installability checks and serves correct `assetlinks.json`.
3. Verified fullscreen launch with no URL bar.
4. `build-aab.sh`, `RELEASE.md`, `PLAY_CHECKLIST.md`, and draft privacy policy committed; no secrets in repo.
5. Short list of manual actions left for owner.

## Initial Audit Notes (observed now; not a full Step 0 report)

- `manifest.webmanifest`: exists, `fullscreen`, theme/bg `#201e16`, icons 192/512 `purpose:any`; **missing maskable 512 icon**; `id` is `./` (acceptable but confirm); start_url is `/index.html?view=startup`.
- No service worker file found in quick scan.
- `index.html` is a small bootstrap shell; manifest/meta tags may be in embedded payload - verify during Step 0.
- Toolchain: Node/npm/Bubblewrap present; **JDK 17, Android SDK/cmdline-tools, keytool, adb, gradle not found on PATH**.
- Production URL given as `https://readwy.onrender.com` returned 404; `https://readwy-eapihs.onrender.com` is the known live Render URL. **Confirm canonical production URL before TWA generation.**
- Render/Firebase hosting must remain untouched; any `assetlinks.json` hosting fix requires explicit approval.
