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
      "Example: C:\\Program Files (x86)\\Steam\\userdata\\<steamid>\\760\\remote\\1422450\\screenshots"
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
  };
}
