# Change Checklist

## Before Editing

- Stay on `main` unless the user explicitly asks for a different branch.
- Identify the owning layer:
  - content/data
  - page layout
  - shared UI
  - 3D scene
- Open the matching `AGENTS.md` and relevant playbook in `docs/skills/`.
- Confirm whether the task can stay data-only or doc-only before touching components.

## While Editing

- Keep the diff narrow.
- Preserve the dark 3D design language.
- Avoid broad refactors and new dependencies.
- If the homepage height changes materially, remember the `ScrollControls` coupling.
- If the project model changes, remember route IDs, type mapping, and project order.

## Before Finishing

- Run `npm run lint`
- Run `npm run build`
- If the UI changed, manually verify the affected route(s)
- For homepage edits, explicitly verify that `#contact` is present and the footer is directly below it
- For homepage edits, verify `#projects`, `#experience`, and `#contact` hash navigation
- Check README, AGENTS docs, and new docs for contradictions if you edited any of them

## In The Handoff Summary

- Files changed
- Checks run
- Any residual risk
- Any follow-up that should happen in a separate task
