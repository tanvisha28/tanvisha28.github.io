# Code Repo Update

This file is the rolling repo-update index for contributor-facing changes. Update it in the same task whenever code or docs change the repo's structure, architecture, workflow, or debugging contract.

## Update Rule

- Update this file when you change routes, top-level file ownership, shared UI contracts, homepage scene contracts, audio behavior, data contracts, verification flow, or contributor docs.
- Keep linked docs in sync in the same task when needed:
  - `AGENTS.md`
  - `codex_repo_index.md`
  - `README.md`
  - `docs/architecture.md`
  - `docs/debugging-runbook.md`
  - `docs/change-checklist.md`
- Keep entries additive and dated. Do not rewrite history unless an older entry is factually wrong.

## Current Snapshot

### 2026-03-29

- App shell:
  - `src/App.tsx` wraps the router in `SoundProvider` and keeps `ScrollToTop` at the app shell level.
- Homepage:
  - `src/pages/Home.tsx` supports both canvas mode and a DOM-only fallback when WebGL setup or canvas rendering fails.
  - Top-level homepage sections are tracked with `data-home-scroll-section` markers and remain the source of truth for scroll measurement.
  - Hero portrait alignment is measured from the DOM portrait node and passed into the 3D hero scene through `heroAnchor`.
- 3D layer:
  - `src/components/3d/StoryScene.tsx` combines the hero scene with `HomeLowerScene`.
  - `src/data/homeSceneData.ts` owns measured scene ranges, lower-scene geometry, and responsive tuning constants.
- Audio layer:
  - `src/audio/*` owns sound preference persistence, homepage soundscape state, cue timing, and interaction hooks.
  - `src/components/SoundToggle.tsx` is exposed through the shared navbar.
- Verification contract:
  - `npm run lint`
  - `npm run build`
  - Manual homepage and affected-route checks for any visual, routing, or 3D changes

## Recent Updates

### 2026-04-04

- Added exact home-scroll restoration for case-study entry and exit across the profile-scoped routes:
  - `src/utils/homeScrollState.ts` now owns the internal session-backed snapshot and restore-state contract used between `Home`, `ProjectDetail`, `Layout`, and `ScrollToTop`
  - `src/pages/Home.tsx` now snapshots the active profile homepage scroll position before project-card navigation, restores the hidden `ScrollControls` viewport on valid returns, and skips hero resets during restoration
  - `src/pages/ProjectDetail.tsx` now distinguishes true home-entry back behavior from direct-open fallback behavior, while the shared navbar logo plus `Home` / `Projects` exits preserve the last valid home snapshot
- Moved primary route-change animation ownership into the app shell:
  - `src/App.tsx` now wraps routed pages in a shared cinematic transition veil keyed by route kind (`home` vs `detail`)
  - `src/pages/Home.tsx` and `src/pages/ProjectDetail.tsx` no longer own full-page fade wrappers, so local reveal motion stays local and route transitions stay coordinated
- Updated debugging and architecture docs to reflect the new restore-aware navigation flow and the app-shell transition layer.

### 2026-04-04

- Rebuilt the profile-scoped case-study route as a richer, role-family detail experience:
  - `src/pages/ProjectDetail.tsx` now uses a premium multi-section layout with a hero metrics rail, support rail, responsive workflow cards, implementation/decision modules, and truthful cross-site CTAs instead of placeholder source/demo buttons
  - the old single-row system-flow strip was replaced with responsive cards so laptop-width layouts no longer collide with the support rail
- Expanded the project data contract in `src/data/portfolioData.ts` for every profile's case studies:
  - each project now includes `stakes`, `ownership`, `decisions`, and `impactMetrics` to support deeper, structured storytelling on the detail route
  - `flow` remains string-based with `" -> "` separators for route-level workflow rendering
- Replaced the old AI / DE / DS detail-scene mapping with role-family case-study hero scenes in `src/components/3d/ProjectScenes.tsx`:
  - Data Engineer, Software Engineer, Data Scientist, and Data Analyst routes now each use their own visual language
  - detail-page scene choice is keyed from the active `profileSlug`, while `project.type` remains part of the shared content model and homepage project tone
- Updated contributor docs to reflect the new case-study contract, profile-family hero-scene mapping, and removal of placeholder project-link buttons.

### 2026-04-04

- Converted the portfolio from a single profile into four role-specific variants served from profile-scoped routes:
  - `/` redirects to `/dataengineer`
  - `/:profileSlug` renders the active profile homepage
  - `/:profileSlug/project/:id` renders the active profile case-study route
  - `/project/:id` remains as a legacy redirect into the default profile when possible
- Replaced the single exported `portfolioData` object with a profile-keyed `portfolioProfiles` map in `src/data/portfolioData.ts`:
  - profile-specific headlines, about copy, focus areas, metrics, skills, experience emphasis, project framing, resume URLs, contact copy, and footer taglines now live in data
  - project display labels and project card icons are now data-driven while 3D scene selection still depends on the existing `AI` / `DE` / `DS` visual types
- Updated shared layout, homepage, and project detail navigation so hash links, resume links, back links, and next-project flows stay inside the active profile route.
- Refreshed contributor docs to describe the new routing and data contract, including profile-specific resume assets and profile-scoped project IDs.
- Updated `build:pages` so GitHub Pages now emits static `index.html` entry points for every profile homepage and every profile-scoped or legacy project path, keeping direct route requests on `200` responses instead of the generic `404.html` fallback.

### 2026-04-04

- Migrated GitHub Pages deployment from the old project-site URL to the root user-site URL `https://tanvisha28.github.io/`:
  - Vite production base path is now `/`
  - the router and shared public-asset helpers continue to resolve from `import.meta.env.BASE_URL`
  - `.github/workflows/deploy.yml` publishes `dist` to GitHub Pages from `main`
  - `npm run build:pages` remains the release build entrypoint and still generates `404.html` and `.nojekyll`
- Updated contributor-facing deployment docs in `README.md` to reflect the new Pages contract for `tanvisha28.github.io`.

### 2026-04-04

- Stabilized homepage scroll initialization in canvas mode:
  - the inner Drei `ScrollControls` viewport now initializes once per no-hash home entry instead of relying on duplicate reset paths
  - the homepage resets the hidden scroll viewport to Drei's expected top offset (`scrollTop = 1`) rather than `0`
  - clearing a home hash back to `/` resets the canvas viewport to the hero without affecting direct hash entry
- Narrowed global smooth-scroll CSS so it no longer applies to every element:
  - the hidden `ScrollControls` viewport is now explicitly `scrollBehavior: auto`
  - global smooth scrolling is limited to the document root, while intentional section jumps still use explicit smooth scrolling

### 2026-03-29

- Added a durable repo-maintenance rule that contributor-facing changes must also update this file and the linked repo docs.
- Refreshed repo docs to reflect the current homepage systems:
  - WebGL capability/error fallback
  - measured homepage section ranges for lower-scene pacing
  - homepage sound system and sound toggle
  - hero portrait-to-scene anchoring
- Corrected the hero orbit-system alignment so the 3D hero background uses the measured portrait center without an extra downward offset.
- Standardized the shared resume asset to `public/resume.pdf` and updated the personal contact/link data in `portfolioData.personal`.
- Switched shared email actions from `mailto:` to Gmail compose URLs so homepage and footer contact links open reliably in-browser.
- Rewrote the portfolio content around the uploaded resume, added a visible homepage education section, and replaced the placeholder case studies with resume-grounded narratives while preserving existing project ids.
- Added GitHub Pages project-site deployment support for `https://makkinaganesh25.github.io/tanvisha/`:
  - Vite production base path is `/tanvisha/`
  - the router uses the Pages base path at runtime
  - shared public assets and audio now resolve through the current base path
  - `npm run build:pages` generates `dist/404.html` and `.nojekyll` for Pages hosting
