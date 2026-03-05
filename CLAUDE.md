# Cursed Apple Guesser

A GeoGuessr-style web game for learning the Deadlock map. Players are shown in-game screenshots and must guess the
location on the minimap. Scores are based on proximity to the correct location.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Bun** (package manager and runtime — always use `bun`, never `npm` or `yarn`)
- `seedrandom` for reproducible random location selection per session
- Deployed to **GitHub Pages** via GitHub Actions on push to `main`

## Platform Notes

- This project runs on Windows. Use forward slashes in paths and be aware of URL-encoded spaces in Windows paths.
- When resolving relative paths, double-check parent directory traversal counts (`../`) — Windows path bugs have
  occurred multiple times.

## Commands

```bash
bun run dev       # Start dev server
bun run lint      # Run ESLint
bun run cms       # Start screenshot metadata manager (port 5174)

```

## Project Structure

```
src/
  controllers/
    game-controller.tsx   # Geo-game state machine; routes between game screens
  screens/
    hub/                  # Game selection hub; card grid with active/coming-soon games
    landing-screen/       # Geo-game title screen; seeds + selects random locations
    game/                 # Shows screenshot; renders MapSelection for guessing
    intermediate-score/   # Post-round result: distance, score, map with pins + line
    final-score/          # End-of-game total score; Play Again button
  components/
    top-bar/              # Navigation bar; shows current game name and Home button
    map-display/          # Renders the minimap image (IMG_6117.png)
    map-selection/        # Interactive minimap for clicking a guess; shows red pin
    guess-location/       # Overlays actual (white) and guessed (red) pins + SVG line
  types.ts                # Shared TypeScript types
  App.tsx                 # Root; hub/game router ('hub' | 'geoguesser'); renders TopBar

public/
  locations/
    *.jpg                 # In-game screenshots (Deadlock map)
    metadata.json         # Array of { fileName, location: { x, y, z }, tags? } in map units
    tag-definitions.json  # Global tag vocabulary { tags: string[] }

tools/
  deadlock-capture/       # Automated in-game screenshot capture tool (Bun + RCON)
  screenshot-metadata-manager/  # Web UI for viewing, filtering and tagging captures (port 5174)
```

## Game Flow

State machine in `game-controller.tsx` manages four screens:

1. **`landing`** — Player presses "Start Game". 5 locations are randomly selected using a seeded RNG (`seedrandom`).
   `GameData` is initialized.
2. **`game`** — Full-screen screenshot is shown. Player clicks on the circular minimap to place a red pin, then
   presses "Continue".
3. **`intermediate_scoring`** — Shows the minimap with:
    - White pin = actual location
    - Red pin = player's guess
    - Dashed yellow SVG line connecting them
    - Distance in map units and score for the round (max 1000)
4. **`final_scoring`** — Displays total score out of `totalRounds * 1000`. Player can restart.

## Key Data Types (`src/types.ts`)

```ts
LocationData  = { fileName: string, location: MapLocation }
MapLocation   = { x: number, y: number }
GameData      = { locations, currentRound, totalRounds, scores, guesses, seed }
GameScreenName = "landing" | "game" | "intermediate_scoring" | "final_scoring"
```

## Coordinate System

- **Source data**: Deadlock world coordinates (x, y, z). `z` is stored but unused.
- **Map range**: approximately -10,900 to +10,900 on both axes. `mapSize = 10900 * 2 = 21800`.
- **Normalization to [0,1]**: `normalizedX = (x + mapSize/2) / mapSize`; Y-axis is **inverted** (`1 - normalizedY`).
- **Map is circular**: clicks outside a 0.5-radius circle from center are ignored.
- **Scoring**: `score = Math.max(Math.round((1 - distance / 10900) * 1000), 0)`

## Assets

- `src/assets/IMG_6117.png` — The circular minimap image used for guessing
- `src/assets/map.webp`, `minimap.png`, `MINIMAP_8-28.png` — Additional map assets (not all in active use)
- `public/locations/*.jpg` — 70+ in-game screenshots with metadata in `metadata.json`

## Deployment

- Deploys automatically to GitHub Pages on push to `main`
- Vite base path is `/`

## Notes

- Scrolling and image dragging are globally disabled in `App.tsx`
- The two in-game factions are labeled on the minimap: **Amber Hand** (bottom-left, orange) and **Sapphire Flame** (
  top-right, cadetblue)
- Round count is set in `landing-screen/index.tsx` (`roundCount = 5`)
- Adding new locations: add `.jpg` files to `public/locations/` and add entries to `metadata.json` with the correct
  world coordinates

## Tools

### deadlock-capture (`tools/deadlock-capture/`)

Automated Deadlock screenshot capture tool. Uses RCON to connect to a running Deadlock instance and captures screenshots
at defined map positions with world coordinates and camera angles. Output sessions are stored in
`tools/deadlock-capture/output/sessions/`.

Run: `bun run capture`

### screenshot-metadata-manager (`tools/screenshot-metadata-manager/`)

Vite + React UI (port 5174) for reviewing, filtering, and tagging captured screenshots.

Run: `bun run cms`

Features:

- Minimap with interactive pins (select, drag-box-select, hover highlight)
- Single and multi-image views with tag editor
- Defined tag vocabulary with one-click apply to selection
- Regex tag filter with include/exclude toggle
- Arrow key navigation through screenshots
- Resizable image preview panel
- Image deletion
- Auto-saves tags back to session manifests (Ctrl+S)
