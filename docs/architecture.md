# Architecture

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
    top-bar/              # Navigation bar; exports TOPBAR_HEIGHT = 52
    map-display/          # Renders the minimap layers (base, lines, gameplay, underground)
    map-selection/        # Interactive minimap for clicking a guess; shows red pin
    guess-location/       # Overlays actual (white) and guessed (red) pins + SVG line
  types.ts                # Shared TypeScript types
  App.tsx                 # Root; hub/game router ('hub' | 'location-guesser'); renders TopBar

public/
  locations/
    *.jpg                 # In-game screenshots (Deadlock map)
    metadata.json         # Array of { fileName, location: { x, y, z }, tags? } in map units
    tag-definitions.json  # Global tag vocabulary { tags: string[] }

tools/
  deadlock-capture/       # Automated in-game screenshot capture tool (Bun + RCON)
  screenshot-metadata-manager/  # Web UI for viewing, filtering and tagging captures (port 5174)
```

## Game Engine (`src/game-engine/`)

- `types.ts` — `GameDefinition<TState>`, `BaseGameState`, screen prop interfaces
- `GameFlow.tsx` — generic state machine: landing→game→intermediate_scoring→final_scoring
- `screens/GameLanding.tsx` — shared landing shell (icon, title, daily buttons, storage key)
- `screens/GameFinal.tsx` — shared final score shell (total, copy results, play again)

## Games (`src/games/`)

- `location-guesser/definition.tsx` — exports `locationGuesserDefinition` and `LG_DAILY_KEY`
- `location-guesser/screens/Round.tsx` — screenshot + MapSelection gameplay
- `location-guesser/screens/Scoring.tsx` — pins + distance + mirror mechanic

## Utils (`src/utils/`)

- `coordinates.ts` — `worldToNorm()`, `calculateDistance()`, `MAP_RADIUS`, `MAP_SIZE`
- `scoring.ts` — `calculateScore(distance)` → 0–1000
- `rng.ts` — `makeDailyDate()`, `makeRandomSeed()`

## Game Flow

State machine in `game-engine/GameFlow.tsx` manages four screens:

1. **`landing`** — Player presses "Start Game". Locations are randomly selected using seeded RNG (`seedrandom`).
   `GameData` is initialized.
2. **`game`** — Full-screen screenshot is shown. Player clicks on the circular minimap to place a pin, then presses "
   Continue".
3. **`intermediate_scoring`** — Shows the minimap with actual/guessed pins, dashed line, distance, and score.
4. **`final_scoring`** — Displays total score. Player can restart or exit.

## Key Data Types (`src/types.ts`)

```ts
LocationData  = { fileName: string, location: MapLocation }
MapLocation   = { x: number, y: number }
```

## Coordinate System

- **Source data**: Deadlock world coordinates (x, y, z). `z` is stored but unused.
- **Map range**: approximately -10,900 to +10,900 on both axes. `MAP_SIZE = 10900 * 2 = 21800`.
- **Normalization to [0,1]**: `normalizedX = (x + MAP_SIZE/2) / MAP_SIZE`; Y-axis is **inverted** (`1 - normalizedY`).
- **Map is circular**: clicks outside a 0.5-radius circle from center are ignored.
- **Scoring**: `score = Math.max(Math.round((1 - distance / 10900) * 1000), 0)`

## Assets

- `src/assets/Map_Base_HiddenKing.png` — Base minimap layer
- `src/assets/Map_Overlay_Lines.png`, `Map_Overlay_GameplayElements.png`, `Map_Overlay_Underground.png` — Map overlay
  layers
- `public/locations/*.jpg` — 70+ in-game screenshots with metadata in `metadata.json`

## Backends

Val Town serverless backends (see `.claude/commands/` for full API reference):

- `malloc/map-trainer-backend` — stores and histograms daily Location Guesser scores (`POST /scores`, `GET /scores?date=`)
- `malloc/smoke-ranking-backend` — stores pairwise smoke spot votes and serves aggregated leaderboard (`POST /votes`, `GET /leaderboard`)

## Planned Games

| ID                 | Name             | Status |
|--------------------|------------------|--------|
| `location-guesser` | Location Guesser | Done   |
| `navigate`         | Dead Reckoning   | TODO   |
| `nameit`           | Name That Spot   | TODO   |
| `aboutface`        | About Face       | TODO   |
