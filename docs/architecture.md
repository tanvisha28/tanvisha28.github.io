# Architecture

## Runtime Map

- Entry point: [`src/main.tsx`](../src/main.tsx)
- Router shell: [`src/App.tsx`](../src/App.tsx)
- Shared layout/nav/footer: [`src/components/Layout.tsx`](../src/components/Layout.tsx)
- Homepage route: [`src/pages/Home.tsx`](../src/pages/Home.tsx)
- Project detail route: [`src/pages/ProjectDetail.tsx`](../src/pages/ProjectDetail.tsx)
- Data model: [`src/data/portfolioData.ts`](../src/data/portfolioData.ts)
- Global styling: [`src/index.css`](../src/index.css)
- Vite config: [`vite.config.ts`](../vite.config.ts)

## Route Structure

- `/`
  - Renders a fade transition wrapper with `motion`.
  - Uses a fixed full-screen `Canvas`.
  - Uses `ScrollControls` and `<Scroll html>` to combine WebGL depth with DOM content.
- `/project/:id`
  - Reads `id` from the route.
  - Looks up the matching project in `portfolioData.projects`.
  - Chooses one of three 3D scenes from `ProjectScenes.tsx`.

## Homepage Architecture

The homepage is the most fragile part of the repo because it mixes three systems at once:

1. A fixed full-screen WebGL scene.
2. DOM sections rendered inside Drei's `<Scroll html>`.
3. Motion transitions and browser hash navigation layered on top.

### Rendering Layers

- `Layout` renders the navbar and wraps the route.
- `Home` mounts a fixed black background and `Canvas`.
- `SceneLights` and `StoryScene` render the 3D environment.
- The actual content sections are children of `<Scroll html>`.
- A `containerRef` measures the total HTML height so `ScrollControls.pages` can match the real document length.

### Why It Is Fragile

- `pages` is derived from `containerRef.current.scrollHeight / window.innerHeight`. Large content or spacing changes can leave the 3D scroll depth out of sync with the HTML.
- `StoryScene` uses hard-coded Z anchors:
  - Hero around `0`
  - Skills beat around `-40`
  - Project beats around `-80`, `-100`, `-120`
  - End glow around `-170`
- Interactivity depends on the outer scroll container using `pointer-events-none`, with inner sections opting back into `pointer-events-auto`.

## Project Detail Architecture

- `ProjectDetail` is a conventional DOM page with a hero `Canvas` at the top and standard sections below it.
- Accent color and project scene are selected from `project.type`.
- The next-project CTA is computed from the current index in `portfolioData.projects`.

### Consequences

- Project order is user-visible, not just data order.
- Adding a new project type is a cross-cutting change.
- The current source/demo buttons are placeholders because the data model does not yet store URLs for them.

## Data Flow

- All display content comes from `portfolioData`.
- `Home.tsx`, `Layout.tsx`, `HomeSections.tsx`, and `ProjectDetail.tsx` all read directly from that file.
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
- [`src/components/3d/Common.tsx`](../src/components/3d/Common.tsx)
  - shared particles and lighting
- [`src/components/3d/HeroScene.tsx`](../src/components/3d/HeroScene.tsx)
  - hero scene primitives and animation
- [`src/components/3d/ProjectScenes.tsx`](../src/components/3d/ProjectScenes.tsx)
  - AI / DE / DS detail scenes

## Known Architectural Constraints

- The homepage scroll system is intentionally a single-canvas composition. See [`docs/decisions/001-homepage-scroll-controls.md`](decisions/001-homepage-scroll-controls.md).
- Tailwind is configured through Tailwind v4's CSS-first setup in `src/index.css`, not a repo `tailwind.config.*` file.
- `npm run lint` is typecheck-only, so visual and interaction regressions still require manual verification.
