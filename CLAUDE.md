# Cursed Apple Guesser

A GeoGuessr-style web game for learning the Deadlock map. Players are shown in-game screenshots and must guess the
location on the minimap. Scores are based on proximity to the correct location.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Bun** (package manager and runtime — always use `bun`, never `npm` or `yarn`)
- `seedrandom` for reproducible random location selection per session
- Deployed to **GitHub Pages** via GitHub Actions on push to `main`

## Commands

```bash
bun run dev       # Start dev server
bun run lint      # Run ESLint
bun run cms       # Start screenshot metadata manager (port 5174)
```

## Further Reading

- @docs/architecture.md — project structure, game engine, game flow, coordinate system, data types
- @docs/tools.md — deadlock-capture and screenshot-metadata-manager docs
- @rules/conventions.md — platform notes, coding conventions, deployment notes
