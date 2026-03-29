# smoke-elo-backend API Reference

Val Town backend for Elo-based smoke spot ranking.

**Val:** `malloc/smoke_elo_backend`
**Base URL:** `https://malloc--f34c83322b8c11f1ae2742dde27851f2.web.val.run`
**Source:** `backends/smoke-elo-backend.ts`

## Endpoints

### `POST /votes`

Submit a pairwise vote and update both players' Elo ratings.

**Body:** `{ "winner": "<fileName>", "loser": "<fileName>" }`
**Response (201):** `{ "ok": true }`

### `GET /leaderboard`

Fetch all locations sorted by Elo rating descending.

**Response (200):**

```json
[
  { "fileName": "smoke_01.jpg", "elo": 1623, "wins": 14, "losses": 3 },
  { "fileName": "smoke_07.jpg", "elo": 1541, "wins": 11, "losses": 6 }
]
```

### `POST /backfill`

Reset all Elo ratings and recompute from a provided chronological vote list.

**Body:** `{ "votes": [{ "winner": "<fileName>", "loser": "<fileName>", "voted_at": "<timeStamp>" }, ...] }`

To obtain votes from the legacy backend: `GET https://malloc--4cd57d1e2b8d11f1967042dde27851f2.web.val.run/raw-votes`

**Response (200):**

```json
{ "ok": true, "locations": 334, "votes": 197 }
```

## Notes

- CORS is open (`*`); supports `GET`, `POST`, `OPTIONS`.
- Uses two SQLite tables in the project-scoped DB:
    - `smoke_elo_ratings`: `fileName` (TEXT PK), `elo` (REAL), `wins` (INTEGER), `losses` (INTEGER)
    - `smoke_elo_votes`: `id` (INTEGER PK), `winner` (TEXT), `loser` (TEXT), `voted_at` (INTEGER ms)
- Cross-val SQLite access is not available (each val uses its own project-scoped DB). Vote history is stored locally in
  `smoke_elo_votes`.
- Elo K-factor: 32. Starting Elo: 1500.
- URL constant exported from `src/games/smoke-ranking/SmokeRankingFlow.tsx` as `SMOKE_ELO_BACKEND_URL`.
