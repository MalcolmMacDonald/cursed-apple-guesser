const HALF_MAP = 10900
const MAP_SIZE = HALF_MAP * 2

/** Normalize world coordinates to [0, 1] range for map rendering. */
export function normalizeCoords(x: number, y: number): { nx: number; ny: number } {
  return {
    nx: (x + HALF_MAP) / MAP_SIZE,
    // Y-axis is inverted to match map image orientation
    ny: 1 - (y + HALF_MAP) / MAP_SIZE,
  }
}
