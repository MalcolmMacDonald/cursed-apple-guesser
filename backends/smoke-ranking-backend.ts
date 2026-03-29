/**
 * smoke-ranking-backend — Val Town serverless backend for legacy pairwise smoke spot votes.
 *
 * This val stores the raw vote log. The smoke-elo-backend reads from GET /votes to backfill Elo ratings.
 *
 * Endpoints:
 *   POST /votes          { winner, loser }  → records vote
 *   GET  /leaderboard                       → [{ fileName, wins, losses }] sorted by win rate desc
 *   GET  /votes                             → [{ winner, loser, voted_at }] ordered oldest-first
 */

import { sqlite } from "https://esm.town/v/stevekrouse/sqlite";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

async function initDb() {
    await sqlite.execute(`
        CREATE TABLE IF NOT EXISTS smoke_ranking_votes (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            winner   TEXT    NOT NULL,
            loser    TEXT    NOT NULL,
            voted_at INTEGER NOT NULL
        )
    `);
}

export default async function handler(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: CORS });
    }

    await initDb();

    const url = new URL(req.url);

    // POST /votes — record a pairwise vote
    if (req.method === "POST" && url.pathname === "/votes") {
        const { winner, loser } = await req.json() as { winner: string; loser: string };
        await sqlite.execute(
            `INSERT INTO smoke_ranking_votes (winner, loser, voted_at) VALUES (?, ?, ?)`,
            [winner, loser, Date.now()],
        );
        return new Response(JSON.stringify({ ok: true }), {
            status: 201,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    // GET /votes — return all raw votes ordered oldest-first (used by smoke-elo-backend for backfill)
    if (req.method === "GET" && url.pathname === "/votes") {
        const result = await sqlite.execute(
            `SELECT winner, loser, voted_at FROM smoke_ranking_votes ORDER BY voted_at ASC`,
        );
        const votes = result.rows.map(([winner, loser, voted_at]) => ({
            winner: winner as string,
            loser: loser as string,
            voted_at: voted_at as number,
        }));
        return new Response(JSON.stringify(votes), {
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    // GET /leaderboard — aggregate win/loss totals sorted by win rate desc
    if (req.method === "GET" && url.pathname === "/leaderboard") {
        const result = await sqlite.execute(`
            SELECT fileName, SUM(isWin) AS wins, SUM(1 - isWin) AS losses
            FROM (
                SELECT winner AS fileName, 1 AS isWin FROM smoke_ranking_votes
                UNION ALL
                SELECT loser AS fileName, 0 AS isWin FROM smoke_ranking_votes
            )
            GROUP BY fileName
            ORDER BY CAST(SUM(isWin) AS REAL) / COUNT(*) DESC, COUNT(*) DESC
        `);

        const leaderboard = result.rows.map(([fileName, wins, losses]) => ({
            fileName: fileName as string,
            wins: wins as number,
            losses: losses as number,
        }));

        return new Response(JSON.stringify(leaderboard), {
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    return new Response("Not Found", { status: 404, headers: CORS });
}
