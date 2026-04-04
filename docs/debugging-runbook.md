# Debugging Runbook

## Baseline Commands

- `npm run dev`
- `npm run lint`
- `npm run build`

Start with the smallest relevant command. Use the browser for anything visual.

## Failure Mode: Navbar Loads But Page Content Does Not

This repo can fail in a specific way where the fixed navbar renders, but the homepage body looks blank or incomplete. That usually means the route shell mounted but the homepage `Canvas` or scroll HTML layer failed.

Check in this order:

1. Open the browser console and look for runtime errors from:
   - `Home.tsx`
   - `StoryScene.tsx`
   - `HeroScene.tsx`
   - `ProjectScenes.tsx`
2. Confirm [`src/pages/Home.tsx`](../src/pages/Home.tsx) still renders:
   - the fixed black wrapper
   - canvas mode when enabled
   - DOM fallback mode when canvas is disabled
   - `ScrollControls`
   - `<Scroll html>`
3. Confirm the active profile entry in `portfolioData.ts` still has all fields referenced by the homepage.
4. If the navbar appears over a plain black background with no hero DOM content, inspect the `CanvasErrorBoundary`, `canCreateWebGLContext`, and `HomeScrollContent` path together.
5. If the hero DOM content appears but the 3D layer does not, suspect a canvas-only error or a disabled WebGL path rather than missing route content.
6. If some content appears but the scroll is too short, suspect `pages` measurement or a zero-height `containerRef`.

## Failure Mode: Scroll Depth Feels Wrong Or Sections Clip

Symptoms:

- The camera reaches the end too early.
- HTML sections overlap strangely.
- The contact section arrives before the 3D story settles.

Check:

1. Did a section gain or lose a lot of height in `Home.tsx`?
2. Do all top-level homepage sections still have the expected `data-home-scroll-section` markers?
3. Does the measured bottom edge of the top-level sections still roughly match the actual page height?
4. Do the measured `sectionRanges` for `projects`, `experience`, and `contact` still line up with the intended lower-scene pacing?
5. Did a late-loading asset change the height after the initial `pages` calculation?

Fix strategy:

- Adjust DOM spacing first.
- Re-test.
- Only adjust `StoryScene` Z positions if the DOM fix leaves the 3D pacing visibly off.

## Failure Mode: Homepage Opens Mid-Page Instead Of The Hero

Likely cause: the hidden Drei `ScrollControls` viewport kept or inherited a non-top scroll position.

Check:

1. [`src/pages/Home.tsx`](../src/pages/Home.tsx) still initializes the canvas scroll viewport once on a no-hash home entry instead of resetting it from multiple places.
2. The inner viewport still resets to Drei's expected top offset (`scrollTop = 1`) rather than `0`.
3. Direct hash entry such as `/dataengineer#projects` still skips the hero reset and scrolls to the target section.
4. [`src/index.css`](../src/index.css) does not apply `scroll-behavior: smooth` to every element, which can affect the hidden scroll container created by `ScrollControls`.
5. The `<ScrollControls>` style in `Home.tsx` still forces `scrollBehavior: "auto"` on the hidden viewport.

## Failure Mode: Hero Background No Longer Centers On The Portrait

Likely cause: the DOM-to-scene anchor path drifted.

Check:

1. `heroPortraitRef` in [`src/pages/Home.tsx`](../src/pages/Home.tsx) still targets the portrait wrapper and not a differently sized parent.
2. The hero portrait dimensions or surrounding layout did not change in a way that makes the measured center misleading.
3. `heroAnchorX` and `heroAnchorY` are still being updated from the scroll viewport measurements.
4. [`src/components/3d/HeroScene.tsx`](../src/components/3d/HeroScene.tsx) still uses the measured world anchor directly instead of adding a hard-coded vertical bias.
5. `StoryScene.tsx` camera positioning still treats the hero as the locked intro state at the top of the page.

## Failure Mode: Buttons Or Links Stop Working On The Homepage

Likely cause: `pointer-events` layering.

Check:

1. The outer scroll HTML container should remain `pointer-events-none`.
2. Interactive section wrappers should remain `pointer-events-auto`.
3. Any new button, card, or link added inside the scroll layer must still sit inside a clickable wrapper.

## Failure Mode: Hash Navigation Does Not Reach The Expected Section

Check:

1. The target section `id` still exists in `Home.tsx`.
2. Navbar links still point to the right hash.
3. `ScrollViewportBridge` is still capturing the correct scroll viewport element in canvas mode.
4. `ScrollToTop.tsx` only resets on pathname change, while the home page itself handles hash scrolling.
5. The route still lands on the expected `/:profileSlug` homepage before the hash-based scroll runs.
6. The active route should be `/:profileSlug#section`, not an unscoped hash like `/#projects`.

## Failure Mode: GitHub Pages Direct Routes Return 404

Likely cause: the published `dist/` artifact is missing static route entry points for profile or project paths.

Check:

1. `npm run build:pages` still runs `scripts/build-pages.ts` after `vite build`.
2. The built `dist/` directory contains:
   - `dataengineer/index.html`
   - `softwareengineer/index.html`
   - at least one profile project path such as `dataengineer/project/lakehouse-platform/index.html`
   - at least one legacy path such as `project/lakehouse-platform/index.html`
3. `dist/404.html` still exists as the fallback entry.
4. `.github/workflows/deploy.yml` still deploys `dist/` from `main`.

## Failure Mode: Sound Toggle Shows But Audio Never Starts

Likely causes:

- missing files in `public/audio/`
- `SoundProvider` no longer wrapping the app
- no user-gesture activation
- stored preference or reduced-motion gating not behaving as expected

Check:

1. [`src/App.tsx`](../src/App.tsx) still wraps the router in `SoundProvider`.
2. [`src/components/SoundToggle.tsx`](../src/components/SoundToggle.tsx) still calls `toggleSound`.
3. The expected audio files still exist in `public/audio/`.
4. `SoundProvider` still waits for user activation before playback and still persists the opt-in state through `SOUND_STORAGE_KEY`.
5. Automatic section cues are not being mistaken for a full audio outage when reduced motion is enabled.

## Failure Mode: Project Detail Shows The Wrong Scene Or Accent

Check:

1. `project.type` in `portfolioData.ts`
2. Scene mapping in `ProjectDetail.tsx`
3. Tone mapping in `HomeSections.tsx`
4. Scene implementation in `ProjectScenes.tsx`
5. The project lookup is happening inside the expected profile's `projects` array rather than another profile.

## Failure Mode: Build Or Typecheck Breaks After Content Edits

Likely causes:

- missing required fields in a profile entry inside `portfolioData`
- changing `flow` to a non-string structure
- introducing a new `type` value without updating unions
- introducing a new profile slug or profile map entry without updating route handling

Use `npm run lint` first. It is the fastest repo-native guardrail.

## Practical Debugging Heuristic

- If the issue is visual but not 3D-specific, start in DOM files.
- If the issue follows a route param, profile slug, or project type, start in `portfolioData`.
- If the issue appears only while scrolling, inspect `Home.tsx` and `StoryScene.tsx` together.
