# Case Study Page Edits

## When To Use It

Use this when editing the `/project/:id` experience, including the hero scene, summary grid, content sections, sticky sidebar, or next-project flow.

## Files Usually Involved

- [`src/pages/ProjectDetail.tsx`](../../src/pages/ProjectDetail.tsx)
- [`src/data/portfolioData.ts`](../../src/data/portfolioData.ts)
- [`src/components/3d/ProjectScenes.tsx`](../../src/components/3d/ProjectScenes.tsx)

## Constraints And Pitfalls

- Scene choice and accent color are tied to `project.type`.
- The next-project CTA is tied to array order, not an explicit relationship field.
- The source/demo controls are styled buttons, not real links today.
- The route redirects home when `id` lookup fails.

## Safe Workflow

1. Decide whether the change is content-only or page-structure.
2. If content-only, start in `portfolioData.ts`.
3. If page-structure, preserve the existing section hierarchy unless the task needs a clear behavioral change.
4. Keep the hero cinematic, but avoid burying key information inside the 3D layer.
5. If adding new project metadata, wire it through data and rendering together.

## Verification Checklist

- `npm run lint`
- `npm run build`
- Open the edited project detail page directly by URL
- Use the back link
- Use the next-project CTA
- Confirm the selected scene and accent color still match the project type

## Repo-Specific Gotchas

- `flow` rendering depends on splitting the string with `" -> "`.
- `portfolioData.projects.findIndex(...)` is used inline for the next-project link, so missing IDs or duplicates break navigation assumptions.
