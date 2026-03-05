import {MAP_RADIUS} from './coordinates';

/** Converts a world-space distance into a 0–1000 score. Used by Dead Reckoning. */
export function calculateScore(distance: number): number {
    return Math.max(Math.round((1 - distance / MAP_RADIUS) * 1000), 0);
}

// ── Location Guesser discrete tier scoring ────────────────────────────────────

/**
 * Configurable distance tiers for Location Guesser.
 * Each tier covers distances UP TO maxDistance (world units).
 * Ordered closest → farthest (highest score first).
 */
const divisions = 18;
export const SCORE_TIERS = [
    {maxDistance: MAP_RADIUS / divisions, score: 5, color: '#41c1c4', emoji: '💎'},
    {maxDistance: 4 * (MAP_RADIUS / divisions), score: 4, color: '#e4b937', emoji: '🥇'},
    {maxDistance: 7 * (MAP_RADIUS / divisions), score: 3, color: '#979490', emoji: '🥈'},
    {maxDistance: 10 * (MAP_RADIUS / divisions), score: 2, color: '#98612e', emoji: '🥉'},
    {maxDistance: 13 * (MAP_RADIUS / divisions), score: 1, color: '#6e5494', emoji: '🔮'},
    {maxDistance: MAP_RADIUS, score: 0, color: '#f44336', emoji: '🔴'}
] as const;

/** Emoji used when score is 0 (beyond the map). */
export const SCORE_ZERO_EMOJI = '⚫';

/** Converts a world-space distance into a 1–5 score (0 if beyond MAP_RADIUS). */
export function calculateTierScore(distance: number): number {
    for (const tier of SCORE_TIERS) {
        if (distance <= tier.maxDistance) return tier.score;
    }
    return 0;
}

/** Returns the matching SCORE_TIER for a distance, or null if score is 0. */
export function getScoreTier(distance: number) {
    return SCORE_TIERS.find(t => distance <= t.maxDistance) ?? null;
}

/** Returns the display emoji for a score value. Falls back to SCORE_ZERO_EMOJI if no tier matches. */
export function getScoreEmoji(score: number): string {
    return SCORE_TIERS.find(t => t.score === score)?.emoji ?? SCORE_ZERO_EMOJI;
}
