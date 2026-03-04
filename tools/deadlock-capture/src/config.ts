import type { CaptureConfig } from "./types.ts";
import { join } from "path";

export function loadConfig(): CaptureConfig {
  const password = process.env["RCON_PASSWORD"];
  if (!password) {
    throw new Error(
      "RCON_PASSWORD environment variable is required.\n" +
      "Copy tools/deadlock-capture/.env.example to tools/deadlock-capture/.env and set it."
    );
  }

  const gameScreenshotDir = process.env["GAME_SCREENSHOT_DIR"];
  if (!gameScreenshotDir) {
    throw new Error(
      "GAME_SCREENSHOT_DIR environment variable is required.\n" +
      "This should be the parent directory containing date-based subdirectories\n" +
      "(e.g. 2024-06-01/screenshot_0001.jpg).\n" +
      "Example: C:\\Program Files (x86)\\Steam\\steamapps\\common\\Deadlock\\game\\citadel\\rpt"
    );
  }

  // Resolve the repo root from this file's location:
  // tools/deadlock-capture/src/ → up 3 levels → repo root
  // Decode URI encoding (e.g. %20 for spaces) before using as a filesystem path.
  const repoRoot = join(
    decodeURIComponent(new URL(".", import.meta.url).pathname.replace(/^\//, "")),
    "..", "..", ".."
  );
  const defaultOutputDir = join(repoRoot, "public", "locations");

  // Resolve tool root for session output directory
  const toolRoot = join(
    decodeURIComponent(new URL(".", import.meta.url).pathname.replace(/^\//, "")),
    ".."
  );

  const outputDir = process.env["OUTPUT_DIR"] ?? defaultOutputDir;
  const metadataPath = join(outputDir, "metadata.json");

  return {
    rconHost: process.env["RCON_HOST"] ?? "127.0.0.1",
    rconPort: parseInt(process.env["RCON_PORT"] ?? "27015", 10),
    rconPassword: password,
    gameScreenshotDir,
    outputDir,
    metadataPath,
    teleportDelayMs: parseInt(process.env["TELEPORT_DELAY_MS"] ?? "1500", 10),
    screenshotTimeoutMs: parseInt(process.env["SCREENSHOT_TIMEOUT_MS"] ?? "8000", 10),
    sessionIntervalMs: parseInt(process.env["SESSION_INTERVAL_MS"] ?? "1000", 10),
    maxPending: parseInt(process.env["MAX_PENDING"] ?? "3", 10),
    sessionOutputDir: process.env["SESSION_OUTPUT_DIR"] ?? join(toolRoot, "output", "sessions"),
  };
}
