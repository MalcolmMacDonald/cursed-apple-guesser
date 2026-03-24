import {MAP_RADIUS} from './coordinates';

/** Converts a world-space distance into a 0–1000 score. Used by Dead Reckoning. */
export function calculateScore(distance: number): number {
    return Math.max(Math.round((1 - distance / MAP_RADIUS) * 1000), 0);
}

// ── Location Guesser golf-style scoring ───────────────────────────────────────

/** Default scoring radius for Location Guesser (world units). ~25% of map radius. */
export const DEFAULT_SCORING_RADIUS = 750; // 2725

/** Golf-style scores: 1 = best (direct hit), 2 = mirror hit, 3 = miss. */
export const GOLF_SCORE_INFO = {
    1: {emoji: '🥇', color: '#e4b937', label: 'Direct hit!'},
    2: {emoji: '🪞', color: '#41c1c4', label: 'Mirror scored'},
    3: {emoji: '❌', color: '#f44336', label: 'Miss'},
} as const;

export type GolfScore = 1 | 2 | 3;

/**
 * Calculates a golf-style score (1–3) for Location Guesser.
 * 1 = direct guess within radius, 2 = mirrored location within radius, 3 = miss.
 */
export function calculateGolfScore(
    originalDistance: number,
    mirrorDistance: number,
    minRadius: number
): {score: GolfScore; usedMirror: boolean} {
    if (originalDistance <= minRadius) return {score: 1, usedMirror: false};
    if (mirrorDistance <= minRadius) return {score: 2, usedMirror: true};
    return {score: 3, usedMirror: false};
}

/** Returns the display emoji for a golf score. */
export function getGolfScoreEmoji(score: number): string {
    return GOLF_SCORE_INFO[score as GolfScore]?.emoji ?? '❓';
}
