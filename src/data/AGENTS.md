# Data AGENTS

Scope: everything in `src/data`.

## Local Rules

- `portfolioData.ts` is the single source of truth for homepage content, project case studies, experience, and shared personal links.
- Keep this file plain data. No JSX, hooks, rendering helpers, or cross-file imports.
- Keep `project.id` values stable and URL-safe.
- Keep `projects` array order intentional because it controls homepage ordering and the next-project link on detail pages.
- `Project.type` must stay aligned with the supported UI values:
  - `AI`
  - `DE`
  - `DS`
- Adding a new project type requires coordinated updates in:
  - `src/pages/ProjectDetail.tsx`
  - `src/components/HomeSections.tsx`
  - `src/components/3d/ProjectScenes.tsx`
- `certifications` are stored but not currently displayed anywhere.
- `public/profile.jpg` is the profile image used on the homepage. Data changes alone do not replace that asset.

## Required Checks After Data Edits

- `npm run lint`
- `npm run build`
- Manual homepage review
- Manual review of each edited project detail page
