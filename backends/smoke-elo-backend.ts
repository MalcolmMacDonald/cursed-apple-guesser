/**
 * smoke-elo-backend — Val Town serverless backend for Elo-based smoke spot ranking.
 *
 * Deploy as a new Val Town HTTP val (e.g. malloc/smoke-elo-backend).
 * After deploying, update SMOKE_ELO_BACKEND_URL in SmokeRankingFlow.tsx with the generated URL.
 *
 * Each Val Town val may only use a single SQLite table. This val owns `smoke_elo_ratings`.
 * Votes are persisted in `smoke_ranking_votes` (owned by smoke-ranking-backend val).
 * Both vals share the same Val Town SQLite instance per account, so cross-table reads/writes work.
 *
 * Endpoints:
 *   POST /votes          { winner, loser }  → records vote in smoke_ranking_votes, updates both Elos
 *   GET  /leaderboard                       → [{ fileName, elo, wins, losses }] sorted by elo desc
 *   POST /backfill                          → resets & recomputes all Elos from smoke_ranking_votes
 */

import { sqlite } from "https://esm.town/v/stevekrouse/sqlite";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

const ELO_K = 32;
const ELO_START = 1500;

function expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function applyElo(winnerElo: number, loserElo: number): [number, number] {
    const expWinner = expectedScore(winnerElo, loserElo);
    const expLoser = expectedScore(loserElo, winnerElo);
    return [
        winnerElo + ELO_K * (1 - expWinner),
        loserElo + ELO_K * (0 - expLoser),
    ];
}

async function initDb() {
    await sqlite.execute(`
        CREATE TABLE IF NOT EXISTS smoke_elo_ratings (
            fileName TEXT PRIMARY KEY,
            elo      REAL    NOT NULL DEFAULT ${ELO_START},
            wins     INTEGER NOT NULL DEFAULT 0,
            losses   INTEGER NOT NULL DEFAULT 0
        )
    `);
}

async function getOrDefault(fileName: string): Promise<{ elo: number; wins: number; losses: number }> {
    const result = await sqlite.execute(
        `SELECT elo, wins, losses FROM smoke_elo_ratings WHERE fileName = ?`,
        [fileName],
    );
    if (result.rows.length === 0) return { elo: ELO_START, wins: 0, losses: 0 };
    const [elo, wins, losses] = result.rows[0];
    return { elo: elo as number, wins: wins as number, losses: losses as number };
}

async function upsertElo(fileName: string, elo: number, wins: number, losses: number) {
    await sqlite.execute(
        `INSERT INTO smoke_elo_ratings (fileName, elo, wins, losses) VALUES (?, ?, ?, ?)
         ON CONFLICT(fileName) DO UPDATE SET elo = excluded.elo, wins = excluded.wins, losses = excluded.losses`,
        [fileName, elo, wins, losses],
    );
}

export default async function handler(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: CORS });
    }

    await initDb();

    const url = new URL(req.url);

    // POST /votes — record one vote in smoke_ranking_votes and update Elos
    if (req.method === "POST" && url.pathname === "/votes") {
        const { winner, loser } = await req.json() as { winner: string; loser: string };

        const winnerData = await getOrDefault(winner);
        const loserData = await getOrDefault(loser);

        const [newWinnerElo, newLoserElo] = applyElo(winnerData.elo, loserData.elo);

        await upsertElo(winner, newWinnerElo, winnerData.wins + 1, winnerData.losses);
        await upsertElo(loser, newLoserElo, loserData.wins, loserData.losses + 1);

        // Persist vote in the shared smoke_ranking_votes table (owned by smoke-ranking-backend val)
        await sqlite.execute(
            `INSERT INTO smoke_ranking_votes (winner, loser, voted_at) VALUES (?, ?, ?)`,
            [winner, loser, Date.now()],
        );

        return new Response(JSON.stringify({ ok: true }), {
            status: 201,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    // GET /leaderboard — return all locations sorted by Elo descending
    if (req.method === "GET" && url.pathname === "/leaderboard") {
        const result = await sqlite.execute(
            `SELECT fileName, elo, wins, losses FROM smoke_elo_ratings ORDER BY elo DESC`,
        );

        const leaderboard = result.rows.map(([fileName, elo, wins, losses]) => ({
            fileName: fileName as string,
            elo: Math.round(elo as number),
            wins: wins as number,
            losses: losses as number,
        }));

        return new Response(JSON.stringify(leaderboard), {
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    // POST /backfill — reset all Elos and recompute from smoke_ranking_votes (chronological order).
    // No request body needed — reads votes directly from the shared smoke_ranking_votes table.
    if (req.method === "POST" && url.pathname === "/backfill") {
        // Read all votes from the shared smoke_ranking_votes table, oldest first
        const votesResult = await sqlite.execute(
            `SELECT winner, loser FROM smoke_ranking_votes ORDER BY voted_at ASC`,
        );
        const votes = votesResult.rows as [string, string][];

        // Reset ratings
        await sqlite.execute(`DELETE FROM smoke_elo_ratings`);

        // Replay votes in chronological order
        const eloMap: Record<string, { elo: number; wins: number; losses: number }> = {};

        for (const [winner, loser] of votes) {
            const w = eloMap[winner] ?? { elo: ELO_START, wins: 0, losses: 0 };
            const l = eloMap[loser] ?? { elo: ELO_START, wins: 0, losses: 0 };
            const [newW, newL] = applyElo(w.elo, l.elo);
            eloMap[winner] = { elo: newW, wins: w.wins + 1, losses: w.losses };
            eloMap[loser] = { elo: newL, wins: l.wins, losses: l.losses + 1 };
        }

        for (const [fileName, { elo, wins, losses }] of Object.entries(eloMap)) {
            await upsertElo(fileName, elo, wins, losses);
        }

        return new Response(
            JSON.stringify({ ok: true, locations: Object.keys(eloMap).length, votes: votes.length }),
            { headers: { ...CORS, "Content-Type": "application/json" } },
        );
    }

    return new Response("Not Found", { status: 404, headers: CORS });
}
