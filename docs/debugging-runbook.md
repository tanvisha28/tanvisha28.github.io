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
   - `Canvas`
   - `ScrollControls`
   - `<Scroll html>`
3. Confirm `portfolioData` still has all fields referenced by the homepage.
4. If the navbar appears over a plain black background, suspect a `Canvas` render error or an exception thrown inside a scene.
5. If some content appears but the scroll is too short, suspect `pages` measurement or a zero-height `containerRef`.

## Failure Mode: Scroll Depth Feels Wrong Or Sections Clip

Symptoms:

- The camera reaches the end too early.
- HTML sections overlap strangely.
- The contact section arrives before the 3D story settles.

Check:

1. Did a section gain or lose a lot of height in `Home.tsx`?
2. Does `containerRef.current.scrollHeight` still roughly match the page's actual content height?
3. Do `StoryScene` Z anchors still match the updated pacing?
4. Did a late-loading asset change the height after the initial `pages` calculation?

Fix strategy:

- Adjust DOM spacing first.
- Re-test.
- Only adjust `StoryScene` Z positions if the DOM fix leaves the 3D pacing visibly off.

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
3. `ScrollToTop.tsx` only resets on pathname change, while the home page itself handles hash scrolling.
4. The route still lands on `/` before the hash-based `scrollIntoView` runs.

## Failure Mode: Project Detail Shows The Wrong Scene Or Accent

Check:

1. `project.type` in `portfolioData.ts`
2. Scene mapping in `ProjectDetail.tsx`
3. Tone mapping in `HomeSections.tsx`
4. Scene implementation in `ProjectScenes.tsx`

## Failure Mode: Build Or Typecheck Breaks After Content Edits

Likely causes:

- missing required fields in `portfolioData`
- changing `flow` to a non-string structure
- introducing a new `type` value without updating unions

Use `npm run lint` first. It is the fastest repo-native guardrail.

## Practical Debugging Heuristic

- If the issue is visual but not 3D-specific, start in DOM files.
- If the issue follows a route param or project type, start in `portfolioData`.
- If the issue appears only while scrolling, inspect `Home.tsx` and `StoryScene.tsx` together.
