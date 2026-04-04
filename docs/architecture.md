# Architecture

## Runtime Map

- Entry point: [`src/main.tsx`](../src/main.tsx)
- Router shell and global providers: [`src/App.tsx`](../src/App.tsx)
- Shared layout/nav/footer: [`src/components/Layout.tsx`](../src/components/Layout.tsx)
- Shared sound toggle: [`src/components/SoundToggle.tsx`](../src/components/SoundToggle.tsx)
- Homepage route: [`src/pages/Home.tsx`](../src/pages/Home.tsx)
- Project detail route: [`src/pages/ProjectDetail.tsx`](../src/pages/ProjectDetail.tsx)
- Data model: [`src/data/portfolioData.ts`](../src/data/portfolioData.ts)
- Homepage lower-scene data and section ranges: [`src/data/homeSceneData.ts`](../src/data/homeSceneData.ts)
- Audio runtime and hooks: [`src/audio`](../src/audio)
- Global styling: [`src/index.css`](../src/index.css)
- Vite config: [`vite.config.ts`](../vite.config.ts)

## Route Structure

- `/`
  - Redirects to the default profile homepage at `/dataengineer`.
- `/:profileSlug`
  - Reads `profileSlug` from the route.
  - Loads the matching profile from `portfolioProfiles`.
  - Uses a fixed full-screen `Canvas` when WebGL setup succeeds.
  - Falls back to a DOM-only homepage when WebGL capability detection fails or the canvas throws at runtime.
  - Uses `ScrollControls` and `<Scroll html>` to combine WebGL depth with DOM content in canvas mode.
- `/:profileSlug/project/:id`
  - Reads `profileSlug` and `id` from the route.
  - Looks up the matching project only inside the active profile's `projects` array.
  - Chooses one of three 3D scenes from `ProjectScenes.tsx`.
- `/project/:id`
  - Redirects legacy project URLs to `/dataengineer/project/:id` when the project exists in the default profile.

## Homepage Architecture

The homepage is the most fragile part of the repo because it mixes three systems at once:

1. A fixed full-screen WebGL scene.
2. DOM sections rendered inside Drei's `<Scroll html>`.
3. Motion transitions and browser hash navigation layered on top.

### Rendering Layers

- `App` wraps the router in `SoundProvider`, so sound state is available to both route-level pages and shared layout chrome.
- `Layout` renders the navbar, sound toggle, and route wrapper using the active profile's shared copy and links.
- `Home` gates canvas rendering through `canCreateWebGLContext` plus `CanvasErrorBoundary`.
- `ScrollViewportBridge` captures Drei's scroll viewport so the page can drive hash navigation, measurement, and motion viewport roots from the same element.
- `SceneLights` and `StoryScene` render the homepage 3D environment.
- `StoryScene` combines `HeroScene` with `HomeLowerScene`.
- `HomeScrollContent` renders the actual content sections inside `<Scroll html>` in canvas mode and directly in DOM fallback mode.
- Top-level homepage sections are tracked with `data-home-scroll-section` markers. They are the source of truth for both `pages` measurement and section-range measurement.
- The current homepage section stack for each `/:profileSlug` route is `hero -> about -> skills -> projects -> experience -> education -> contact -> footer`.
- `homeSceneData.ts` owns the lower-scene geometry, responsive density tuning, and default measured section ranges used by `HomeLowerScene`.

### Why It Is Fragile

- `pages` is derived from measured top-level section offsets/heights plus the scroll viewport height. Breaking the section markers or changing top-level structure can desync the 3D scroll depth from the HTML.
- `sectionRanges` for `projects`, `experience`, and `contact` are measured from live DOM positions and drive `HomeLowerScene`. If those sections move or resize significantly, the lower-scene pacing changes too.
- Hero alignment depends on the DOM portrait measurement in `Home.tsx` feeding `heroAnchor`, which `StoryScene` and `HeroScene` use to place the orbit system behind the portrait.
- `StoryScene` still keeps the hero anchored near `0` and blends the later beats from measured section ranges, so large DOM shifts can still require scene tuning.
- Interactivity depends on the outer scroll container using `pointer-events-none`, with inner sections opting back into `pointer-events-auto`.
- The homepage has two valid render paths now: canvas mode and DOM fallback mode. A change can break one without obviously breaking the other.

## Project Detail Architecture

- `ProjectDetail` is a conventional DOM page with a hero `Canvas` at the top and standard sections below it.
- Accent color and project scene are selected from `project.type`.
- The next-project CTA is computed from the current index in the active profile's `projects` array.

### Consequences

- Project order is user-visible, not just data order.
- Adding a new project type is a cross-cutting change.
- The current source/demo buttons are placeholders because the data model does not yet store URLs for them.

## Data Flow

- All display content comes from the `portfolioProfiles` map exported by `portfolioData.ts`.
- `Home.tsx`, `Layout.tsx`, `HomeSections.tsx`, and `ProjectDetail.tsx` all resolve the active profile and read from that map.
- Each active profile's `education` array is a visible homepage section, not just stored background data.
- Shared nav, footer, resume links, and hash routes stay scoped to the active `profileSlug`.
- `homeSceneData.ts` drives the lower homepage scene geometry and tuning separately from copy/content.
- `SoundProvider` owns persisted sound preference, user-activation gating, homepage soundscape state, and visibility handling.
- `useSoundInteractions` injects click and hover cues into shared UI and homepage interactions.
- There is no backend request path in the current UI.
- AI Studio remnants still exist:
  - `metadata.json`
  - `.env.example`
  - `vite.config.ts` injects `process.env.GEMINI_API_KEY`
  - `@google/genai`, `express`, and `dotenv` are present in `package.json`
- Those pieces are not part of the visible portfolio flow today.

## Major Modules

- [`src/components/HomeSections.tsx`](../src/components/HomeSections.tsx)
  - `SkillsGrid`
  - `ProjectTree`
  - `ExperienceTimeline`
  - `EducationGrid`
- [`src/components/3d/Common.tsx`](../src/components/3d/Common.tsx)
  - shared particles and lighting
- [`src/components/3d/HeroScene.tsx`](../src/components/3d/HeroScene.tsx)
  - hero scene primitives and animation
- [`src/components/3d/HomeLowerScene.tsx`](../src/components/3d/HomeLowerScene.tsx)
  - measured lower-scene visuals for projects, experience, and contact
- [`src/components/3d/ProjectScenes.tsx`](../src/components/3d/ProjectScenes.tsx)
  - AI / DE / DS detail scenes
- [`src/audio`](../src/audio)
  - sound provider, controller, config, and interaction hooks

## Known Architectural Constraints

- The homepage scroll system is intentionally a single-canvas composition. See [`docs/decisions/001-homepage-scroll-controls.md`](decisions/001-homepage-scroll-controls.md).
- Tailwind is configured through Tailwind v4's CSS-first setup in `src/index.css`, not a repo `tailwind.config.*` file.
- `npm run lint` is typecheck-only, so visual and interaction regressions still require manual verification.
- If a change modifies the repo contract for future contributors, keep [`code_repo_update.md`](../code_repo_update.md) in sync.
