# smoke-ranking-backend API Reference

Val Town backend for storing and retrieving Smoke Spot Ranking votes.

**Val:** `malloc/smoke-ranking-backend`
**Base URL:** `https://malloc--ae8f7de82aca11f1be7a42dde27851f2.web.val.run`
**Source:** https://www.val.town/x/malloc/smoke-ranking-backend/code/main.ts

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

## Notes

- CORS is open (`*`); supports `GET`, `POST`, `OPTIONS`.
- Votes stored in per-val SQLite table (`smoke_ranking_votes`): `id`, `winner` (TEXT), `loser` (TEXT), `voted_at` (INTEGER ms since epoch).
- The leaderboard aggregates raw vote rows at query time via a `UNION ALL` subquery — no pre-aggregation.
- Frontend caps results to top 20 entries.
- URL constant exported from `src/games/smoke-ranking/SmokeRankingFlow.tsx` as `SMOKE_RANKING_BACKEND_URL`.
