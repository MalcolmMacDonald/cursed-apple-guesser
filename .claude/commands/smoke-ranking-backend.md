# smoke-ranking-backend API Reference

Val Town backend for storing and retrieving Smoke Spot Ranking votes.

**Val:** `malloc/smoke-ranking-backend`
**Base URL:** `https://malloc--ae8f7de82aca11f1be7a42dde27851f2.web.val.run`
**Source:** `backends/smoke-ranking-backend.ts`

## Endpoints

### `POST /votes`
Submit a pairwise vote.

**Body:** `{ "winner": "<fileName>", "loser": "<fileName>" }`
**Response (201):** `{ "ok": true }`

### `GET /leaderboard`
Fetch aggregated win/loss totals for all locations, sorted by win rate descending (tiebreak: total votes).

**Response (200):**
```json
[
  { "fileName": "smoke_01.jpg", "wins": 14, "losses": 3 },
  { "fileName": "smoke_07.jpg", "wins": 11, "losses": 6 }
]
```

### `GET /votes`
Return all raw votes ordered oldest-first. Used by `smoke-elo-backend`'s `POST /backfill` to recompute Elo ratings from full vote history.

**Response (200):**
```json
[
  { "winner": "smoke_01.jpg", "loser": "smoke_07.jpg", "voted_at": 1711670400000 },
  { "winner": "smoke_03.jpg", "loser": "smoke_02.jpg", "voted_at": 1711670500000 }
]
```

## Notes

- CORS is open (`*`); supports `GET`, `POST`, `OPTIONS`.
- Uses a **single** SQLite table (`smoke_ranking_votes`): `id`, `winner` (TEXT), `loser` (TEXT), `voted_at` (INTEGER ms since epoch). Val Town enforces one table per val.
- The leaderboard aggregates raw vote rows at query time via a `UNION ALL` subquery — no pre-aggregation.
- Frontend caps results to top 20 entries.
- URL constant exported from `src/games/smoke-ranking/SmokeRankingFlow.tsx` as `SMOKE_RANKING_BACKEND_URL`.
