import type { GetposResult } from "./types.ts";

export function generateFilename(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const ts =
    String(now.getFullYear()) +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  return `${ts}_1.jpg`;
}

// Parse getpos output:
// "setpos 23.406250 -10053.343750 1309.125000;setang -0.812500 87.406250 0.000000"
// setang is optional — it is currently disabled in Deadlock.
export function parseGetpos(raw: string): GetposResult | null {
  const posMatch = raw.match(/setpos\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
  if (!posMatch) return null;

  const [, x, y, z] = posMatch;

  const angMatch = raw.match(/setang\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);

  return {
    position: {
      x: parseFloat(x),
      y: parseFloat(y),
      z: parseFloat(z),
    },
    angles: angMatch
      ? { pitch: parseFloat(angMatch[1]), yaw: parseFloat(angMatch[2]), roll: parseFloat(angMatch[3]) }
      : { pitch: 0, yaw: 0, roll: 0 },
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCoord(x: number, y: number, z: number): string {
  return `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;
}
