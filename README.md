# Elite 3D Engineering Portfolio

Premium React + Vite + Three.js portfolio for an engineering profile, built around a single immersive homepage canvas and data-driven case-study pages.

## Quickstart

Prerequisites: Node.js 20+ and npm.

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the local URL printed by Vite

Useful commands:

- `npm run dev`: local development server on port `3000`
- `npm run lint`: TypeScript typecheck
- `npm run build`: production build
- `npm run preview`: preview the built app

## Current Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS v4
- React Router 7
- Framer Motion
- React Three Fiber + Drei + Postprocessing

## Project Structure

- [`src/pages/Home.tsx`](src/pages/Home.tsx): homepage with `Canvas`, `ScrollControls`, and HTML overlay sections
- [`src/pages/ProjectDetail.tsx`](src/pages/ProjectDetail.tsx): project detail route
- [`src/components/3d`](src/components/3d): shared 3D scenes and effects
- [`src/components`](src/components): shared layout and section components
- [`src/data/portfolioData.ts`](src/data/portfolioData.ts): single source of truth for content

## How The Homepage Works

The homepage is intentionally not a conventional DOM page.

- A fixed full-screen `Canvas` renders the 3D story.
- Drei `ScrollControls` drive the camera movement.
- The visible text sections are rendered inside `<Scroll html>`.
- Total page height is measured to keep `ScrollControls.pages` aligned with the HTML content.

That coupling is the main source of both the experience quality and the repo's layout fragility. Treat homepage spacing work carefully.

## Contributor Operating Docs

Start here for future work:

- Root repo instructions: [`AGENTS.md`](AGENTS.md)
- Rolling repo update index: [`code_repo_update.md`](code_repo_update.md)
- Contributor workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Architecture: [`docs/architecture.md`](docs/architecture.md)
- Frontend system: [`docs/frontend-system.md`](docs/frontend-system.md)
- Content model: [`docs/content-model.md`](docs/content-model.md)
- Debugging runbook: [`docs/debugging-runbook.md`](docs/debugging-runbook.md)
- Change checklist: [`docs/change-checklist.md`](docs/change-checklist.md)

Repo-specific playbooks:

- [`docs/skills/homepage-layout-fixes.md`](docs/skills/homepage-layout-fixes.md)
- [`docs/skills/3d-scroll-debugging.md`](docs/skills/3d-scroll-debugging.md)
- [`docs/skills/content-and-portfolio-data-updates.md`](docs/skills/content-and-portfolio-data-updates.md)
- [`docs/skills/case-study-page-edits.md`](docs/skills/case-study-page-edits.md)
- [`docs/skills/release-verification.md`](docs/skills/release-verification.md)

## Verification Expectations

Minimum for any meaningful change:

- `npm run lint`
- `npm run build`

If the UI changed, also manually verify the homepage scroll flow and any affected project detail pages.

## Audio Setup

Place these files under `public/audio/`:

- `ambient-loop.mp3`
- `choir-hit.mp3`
- `hero-hum.mp3`
- `ui-click.mp3`
- `ui-hover.mp3`
- `section-sweep.mp3`

The cinematic sound layer lives in `src/audio/` and is wired through `SoundProvider`, `useSound`, and the central `soundRegistry`. Audio stays off by default, initializes lazily after opt-in, keeps ambient playback limited to the homepage, and uses IntersectionObserver-based triggers for major section beats and large reveal moments instead of raw scroll events.

To retune the system later, update `src/audio/soundConfig.ts` for per-sound volume, ambient fade timings, ducking levels, and cooldowns. The provider in `src/audio/SoundProvider.tsx` owns preference persistence, reduced-motion behavior, homepage soundscape activation, and visibility pause/resume handling.

## Notes On Environment And AI Studio Remnants

- `.env.example` still contains AI Studio/Gemini placeholders.
- `vite.config.ts` still injects `process.env.GEMINI_API_KEY`.
- The visible portfolio currently does not call Gemini or an Express backend in the UI path.

Those remnants are safe to leave alone unless a task explicitly reintroduces productized AI features.
