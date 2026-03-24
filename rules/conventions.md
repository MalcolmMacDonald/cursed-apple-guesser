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

## Deployment

- Deploys automatically to GitHub Pages on push to `main`.
- Vite base path is `/`.
- GitHub Actions workflow handles the build + deploy.
