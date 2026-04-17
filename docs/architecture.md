# Architecture

## Project Structure

```
src/
  config.ts             # Shared constants: LG_API_URL, SMOKE_ELO_BACKEND_URL
  types.ts              # Shared TypeScript types
  main.tsx              # Root entry → PageShell → HubScreen
  entries/
    play/               # Multi-page entry: Location Guesser SPA
    smoke-ranking/      # Multi-page entry: Smoke Spot Ranking SPA
    github-kanban/      # Multi-page entry: GitHub Kanban (dev only)
  screens/
    hub/                # Game selection hub; card grid with active/coming-soon games
  games/
    location-guesser/   # Location Guesser flow + screens
    smoke-ranking/      # Smoke Spot Ranking flow + screens
  components/
    top-bar/            # Navigation bar; exports TOPBAR_HEIGHT = 52
    map-display/        # Renders the minimap layers (base, lines, gameplay, underground)
    map-selection/      # Interactive minimap for clicking a guess; zoom/pan/pinch support
    guess-location/     # Overlays actual (white) and guessed (red) pins + SVG line
    daily-histogram/    # Bar chart of daily score distribution
    build-badge/        # Shows dev build timestamp (dev deploy only)
    PageShell.tsx       # Wraps all pages; disables text selection, renders TopBar

public/
  locations/
    *.jpg               # In-game screenshots (Deadlock map)
    metadata.json       # Array of { fileName, location: { x, y, z }, tags } in map units
    tag-definitions.json  # Global tag vocabulary { tags: string[] }

tools/
  deadlock-capture/     # Automated in-game screenshot capture tool (Bun + RCON)
  screenshot-metadata-manager/  # Web UI for viewing, filtering and tagging captures (port 5174)

backends/
  smoke-elo-backend.ts  # Val Town source for the Elo ranking backend
```

## Games

### Location Guesser (`src/games/location-guesser/`)

- `LocationGuesserFlow.tsx` — state machine (landing → round → score → final); exports `LG_ROUND_COUNT`, `LG_DAILY_KEY`, `LG_DAILY_SCORE_KEY`, `LG_PENDING_SEED_KEY`, `LG_PENDING_DAILY_KEY`
- `screens/Landing.tsx` — start screen; advanced options (seed, round count, scoring radius in dev)
- `screens/Round.tsx` — screenshot + MapSelection gameplay
- `screens/Scoring.tsx` — pins + distance + mirror mechanic
- `screens/Final.tsx` — per-round scores, total, copy results, daily histogram, score submission

### Smoke Spot Ranking (`src/games/smoke-ranking/`)

- `SmokeRankingFlow.tsx` — view toggle (vote ↔ leaderboard); daily vote count persistence
- `screens/Vote.tsx` — two images side-by-side; responsive portrait/landscape layout
- `screens/Leaderboard.tsx` — top/bottom 5 by Elo; entries unlock progressively with votes

## Hub (`src/screens/hub/`)

- `index.tsx` — game card grid; each `GameEntry` in the `games` array carries its own navigation callbacks (`onPlay`, `onDaily`), localStorage keys (`dailyStorageKey`, `dailyScoreKey`), and routing info (`leaderboardPath`).
- `GameCard` is fully generic — no game-specific logic; histogram display driven by `dailyScoreKey` + `totalRounds` fields on the entry.

## Utils (`src/utils/`)

- `coordinates.ts` — `worldToNorm()`, `calculateDistance()`, `MAP_RADIUS`, `MAP_SIZE`
- `scoring.ts` — `calculateGolfScore()`, `getGolfScoreEmoji()`, `DEFAULT_SCORING_RADIUS`
- `rng.ts` — `makeLocalDate()`, `makeDailyDate()`, `nextLocalMidnightMs()`, `makeRandomSeed()`

## Config (`src/config.ts`)

Centralised backend URL constants:
- `LG_API_URL` — map-trainer-backend (Location Guesser scores + histogram)
- `SMOKE_ELO_BACKEND_URL` — smoke-elo-backend (votes + leaderboard)

## Multi-Page App (Vite)

Three SPAs served from a single Vite config:
- `/` → hub (`src/main.tsx`)
- `/play/` → Location Guesser (`src/entries/play/`)
- `/smoke-ranking/` → Smoke Ranking (`src/entries/smoke-ranking/`)

Vite plugin post-build moves `dist/src/entries/X` → `dist/X`.

## Game Flow (Location Guesser)

State machine in `LocationGuesserFlow.tsx` manages four views:

1. **`landing`** — Player configures and starts. Locations selected with seeded RNG (`seedrandom`).
2. **`round`** — Full-screen screenshot shown. Player clicks circular minimap to place a pin.
3. **`score`** — Shows minimap with actual/guessed pins, dashed line, distance, and score.
4. **`final`** — Displays per-round scores and total. Daily: submits to API, shows histogram.

Hub → Play handoff: hub writes `LG_PENDING_SEED_KEY` / `LG_PENDING_DAILY_KEY` to `sessionStorage`, then navigates to `/play/`. Flow reads and clears them on mount.

## Key Data Types (`src/types.ts`)

```ts
LocationData  = { fileName: string, tags: string[], location: MapLocation }
MapLocation   = { x: number, y: number }
RoundScore    = { score: number, maxScore: number }
```

## Coordinate System

- **Source data**: Deadlock world coordinates (x, y, z). `z` is stored but unused.
- **Map range**: approximately -10,900 to +10,900 on both axes. `MAP_SIZE = 10900 * 2 = 21800`.
- **Normalization to [0,1]**: `normalizedX = (x + MAP_SIZE/2) / MAP_SIZE`; Y-axis is **inverted** (`1 - normalizedY`).
- **Map is circular**: clicks outside a 0.5-radius circle from center are ignored.

## Assets

- `src/assets/Map_Base_HiddenKing.png` — Base minimap layer
- `src/assets/Map_Overlay_Lines.png`, `Map_Overlay_GameplayElements.png`, `Map_Overlay_Underground.png` — Overlay layers
- `public/locations/*.jpg` — 300+ in-game screenshots with metadata in `metadata.json`

## Backends

Val Town serverless backends (see `.claude/commands/` for full API reference):

- `malloc/map-trainer-backend` — stores and histograms daily Location Guesser scores (`POST /scores`, `GET /scores?date=`)
- `malloc/smoke-elo-backend` — Elo-based smoke spot ranking: updates Elo on every vote (`POST /votes`, `GET /leaderboard`, `POST /backfill`). Source: `backends/smoke-elo-backend.ts`.

## Planned Games

| ID                 | Name             | Status |
|--------------------|------------------|--------|
| `location-guesser` | Location Guesser | Done   |
| `smoke-ranking`    | Smoke Spot Ranking | Done  |
| `navigate`         | Dead Reckoning   | TODO   |
| `nameit`           | Name That Spot   | TODO   |
| `aboutface`        | About Face       | TODO   |
