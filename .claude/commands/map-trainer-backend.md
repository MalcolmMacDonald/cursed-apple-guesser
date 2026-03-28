# map-trainer-backend API Reference

Val Town backend for storing and retrieving daily Location Guesser scores.

**Val:** `malloc/map-trainer-backend`
**Base URL:** `https://malloc--b83909f4289a11f1b97142dde27851f2.web.val.run`
**Source:** https://www.val.town/x/malloc/map-trainer-backend/code/main.ts

## Endpoints

### `POST /scores`
Submit a score for today's daily challenge.

**Body:** `{ "score": <integer> }`
**Response (201):** `{ "ok": true }`

### `GET /scores?date=YYYY-MM-DD`
Fetch a score histogram for a given UTC day.

**Query param:** `date` — e.g. `?date=2026-03-28`
**Response (200):**
```json
{
  "date": "2026-03-28",
  "totalCount": 12,
  "scores": [
    { "score": 3000, "count": 2 },
    { "score": 4200, "count": 5 }
  ]
}
```

## Notes

- CORS is open (`*`); supports `GET`, `POST`, `OPTIONS`.
- Scores are stored in a per-val SQLite table (`location_guesser_scores`) with columns: `id`, `date` (Unix day timestamp, UTC midnight), `score`.
- `date` is stored as seconds since epoch floored to UTC midnight (`Date.now() - Date.now() % 86_400_000`).
- The histogram endpoint groups scores by value and sorts ascending.
