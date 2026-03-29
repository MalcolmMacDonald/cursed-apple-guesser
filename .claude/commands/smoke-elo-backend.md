# smoke-elo-backend API Reference

Val Town backend for Elo-based smoke spot ranking.

**Val:** `malloc/smoke-elo-backend`
**Base URL:** `https://malloc--b83909f4289a11f1b97142dde27851f2.web.val.run`
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
Reset all Elo ratings and recompute from the full vote history in `smoke-ranking-backend`.
No request body needed — votes are fetched automatically from `smoke-ranking-backend`'s `GET /votes`.

**Response (200):**
```json
{ "ok": true, "locations": 25, "votes": 312 }
```

**Response (502):** `{ "ok": false, "error": "Failed to fetch votes from smoke-ranking-backend" }`

## Notes

- CORS is open (`*`); supports `GET`, `POST`, `OPTIONS`.
- Uses a **single** SQLite table (`smoke_elo_ratings`): `fileName` (TEXT PK), `elo` (REAL), `wins` (INTEGER), `losses` (INTEGER). Val Town enforces one table per val — vote history lives in `smoke-ranking-backend`.
- Elo K-factor: 32. Starting Elo: 1500.
- Backfill fetches raw votes from `smoke-ranking-backend`'s `GET /votes` endpoint (ordered oldest-first) and replays them in chronological order.
- URL constant exported from `src/games/smoke-ranking/SmokeRankingFlow.tsx` as `SMOKE_ELO_BACKEND_URL`.
