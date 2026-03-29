# Content Model

## Source Of Truth

All user-facing portfolio content lives in [`src/data/portfolioData.ts`](../src/data/portfolioData.ts).

## Top-Level Shape

- `personal`
- `metrics`
- `skills`
- `projects`
- `experience`
- `education`
- `certifications`

## `personal`

Used by:

- homepage hero
- about section chips
- contact section
- navbar and footer links

Important fields:

- `name`
- `headline`
- `about`
- `focusAreas`
- `email`
- `linkedin`
- `github`
- `resume`
- `location`

Repo-specific notes:

- The homepage avatar comes from [`public/profile.jpg`](../public/profile.jpg), not from `portfolioData`.
- `resume` is linked in multiple places and should normally point at the shared asset path `/resume.pdf`.

## `metrics`

Used by the homepage "About" area for highlight cards. Keep labels short enough to fit in small cards.

## `skills`

Used by `SkillsGrid` on the homepage.

Rules:

- Keep categories short and scannable.
- Keep each skill entry concise. Long strings wrap and quickly make the grid uneven.

## `projects`

Used by:

- homepage project tree
- project detail route lookup
- project detail hero accents and 3D scene choice
- next-project CTA

Required fields:

- `id`
- `title`
- `type`
- `summary`
- `role`
- `domain`
- `techStack`
- `problem`
- `context`
- `goals`
- `architecture`
- `implementation`
- `flow`
- `challenges`
- `outcomes`
- `lessons`

Repo-specific rules:

- `id` must stay stable and URL-safe because it becomes `/project/:id`.
- `type` must stay one of `AI`, `DE`, or `DS` unless the UI is extended.
- `flow` is split on `" -> "` in `ProjectDetail.tsx`. Keep that exact delimiter if you want the visual system flow pills to render correctly.
- `projects` array order drives:
  - the homepage project sequence
  - the next-project CTA on detail pages

Known gap:

- The current data model does not contain source-code URLs or live-demo URLs, so the detail page buttons are still placeholder actions.

## `experience`

Used by the homepage `ExperienceTimeline`.

Rules:

- Keep bullet copy short enough for card layout.
- Skills should stay tag-friendly and not become sentence fragments.

## `education`

Used by the homepage education section.

Required fields:

- `school`
- `degree`
- `period`
- `location`
- `details`

Rules:

- Keep `details` concise enough to fit inside the existing card layout.
- Fold GPA and coursework into `details` instead of introducing extra rendered fields unless the UI is intentionally expanded.

## `certifications`

Currently stored but not rendered anywhere. Updating this section alone has no visible product effect.

## When A Content Change Needs Code

- New project type: yes
- New route: yes
- New rendered content section: yes
- Text, metrics, skills, experience, project case-study copy: usually no
- Replacing profile image: asset change in `public/profile.jpg`, not just data
