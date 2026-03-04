import type { MapLocation } from '../types';

export const MAP_RADIUS = 10900;
export const MAP_SIZE = MAP_RADIUS * 2;

/**
 * Converts Deadlock world coordinates to normalized [0, 1] minimap coordinates.
 * Y-axis is inverted (world Y increases north, minimap Y increases downward).
 */
export function worldToNorm(loc: MapLocation): { x: number; y: number } {
    return {
        x: (loc.x + MAP_SIZE / 2) / MAP_SIZE,
        y: 1 - (loc.y + MAP_SIZE / 2) / MAP_SIZE,
    };
}

/** Euclidean distance between two world-space MapLocations. */
export function calculateDistance(a: MapLocation, b: MapLocation): number {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
