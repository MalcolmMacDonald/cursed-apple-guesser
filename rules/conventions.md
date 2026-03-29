# Conventions

## Platform Notes

- This project runs on Windows. Use forward slashes in paths and be aware of URL-encoded spaces in Windows paths.
- When resolving relative paths, double-check parent directory traversal counts (`../`) — Windows path bugs have
  occurred multiple times.
- Always use `bun`, never `npm` or `yarn`.

## Coding Conventions

- Styling: inline styles throughout (no CSS modules or Tailwind).
- Scrolling and image dragging are globally disabled in `App.tsx`.
- Round count is set in each game's `definition.tsx` (`ROUND_COUNT = 5`).
- The two in-game factions are labeled on the minimap: **The Hidden King** (bottom-left) and **The Archmother** (top-right).

## Adding New Locations

Add `.jpg` files to `public/locations/` and add entries to `metadata.json` with the correct world coordinates.
Prefer using the `screenshot-metadata-manager` + promote workflow.

## Feature Implementation Workflow

When implementing a feature (whether via the automated Claude Feature Development action or manually):

1. Implement the feature following existing conventions.
2. **Update documentation** to reflect the change. This includes:
   - `CLAUDE.md` — if the project structure, commands, or high-level context changed.
   - `docs/architecture.md` — if new screens, components, game engine changes, or data types were added/modified.
   - `docs/tools.md` — if tooling (deadlock-capture, screenshot-metadata-manager) changed.
   - `rules/conventions.md` — if a new coding convention or workflow step was introduced.
   - `.claude/` skill files — if Claude-specific workflows or settings changed.
   - Only update docs that are **actually affected** — don't make gratuitous edits.
3. Commit implementation and documentation changes together.

## Val Town Backend Conventions

- Each Val Town val has exactly **one** SQLite table. Never create a second `CREATE TABLE` in the same val.
- Vals under the same account share a single SQLite instance, so a val may **read from or write to another val's table** when needed (e.g. `smoke-elo-backend` writes/reads `smoke_ranking_votes` owned by `smoke-ranking-backend`).
- Backend source files live in `backends/`. API reference skill files live in `.claude/commands/`.

## Deployment

- Deploys automatically to GitHub Pages on push to `main`.
- Vite base path is `/`.
- GitHub Actions workflow handles the build + deploy.
