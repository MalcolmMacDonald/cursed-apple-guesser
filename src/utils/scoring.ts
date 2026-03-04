import { MAP_RADIUS } from './coordinates';

/** Converts a world-space distance into a 0–1000 score. */
export function calculateScore(distance: number): number {
    return Math.max(Math.round((1 - distance / MAP_RADIUS) * 1000), 0);
}
