# Release Verification

## When To Use It

Use this before handing off a change, opening a PR, or merging any update that touches visible UI, content, routing, or repo scaffolding.

## Files Usually Involved

- The files you changed
- [`README.md`](../../README.md) if contributor-facing behavior changed
- [`AGENTS.md`](../../AGENTS.md) or docs if workflow guidance changed

## Constraints And Pitfalls

- `npm run lint` is typecheck only.
- `npm run build` catches bundling issues but not visual regressions.
- The homepage can pass build but still feel broken if scroll pacing, pointer events, or route hashes regress.

## Safe Workflow

1. Run `npm run lint`.
2. Run `npm run build`.
3. Manually review the affected routes.
4. If docs changed, do a contradiction pass across README, AGENTS, and the edited docs.
5. Summarize any residual risk instead of implying certainty.

## Verification Checklist

- `npm run lint`
- `npm run build`
- Home route loads and scrolls correctly
- Edited `/project/:id` routes load correctly
- Navbar links and back links behave correctly
- No doc contradictions in touched contributor files

## Repo-Specific Gotchas

- Content order in `portfolioData.projects` is a behavioral detail, not just content.
- A docs-only change can still be harmful if it tells future contributors to treat the homepage like a normal DOM page.
