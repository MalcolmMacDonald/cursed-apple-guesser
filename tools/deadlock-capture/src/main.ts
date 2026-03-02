#!/usr/bin/env bun

import { loadConfig } from "./config.ts";
import { RconClient } from "./rcon-client.ts";
import { GameCommands } from "./commands.ts";
import { waitForNewScreenshot } from "./screenshot.ts";
import { readMetadata, appendEntry, replaceEntry } from "./metadata.ts";
import { generateFilename, parseGetpos, formatCoord, sleep } from "./utils.ts";
import type { CaptureConfig, MetadataEntry } from "./types.ts";
import { join } from "path";

// Default metadata path, resolved from this file's location (tools/deadlock-capture/src/)
// Decode URI encoding (e.g. %20 for spaces) before using as a filesystem path.
const DEFAULT_METADATA_PATH = join(
  decodeURIComponent(new URL(".", import.meta.url).pathname.replace(/^\//, "")),
  "..", "..", "..", "public", "locations", "metadata.json"
);

const USAGE = `
cursed-capture — Automated screenshot capture for Cursed Apple Guesser

USAGE
  bun run capture <command> [options]

COMMANDS
  status
        Connect to RCON and print the current player position.
        Use this to verify your RCON connection and credentials.

  setup
        Send the camera setup commands to the game (hides HUD,
        enables noclip, sets FOV to 90). Run before manual captures.

  teardown
        Restore the game to normal (re-shows HUD, disables noclip).

  add [--getpos "<getpos string>"]
        Capture a single new location and add it to metadata.json.
        If --getpos is given, teleport there first.
        Otherwise, capture at the current in-game position.

  recapture <fileName>
        Re-capture an existing metadata.json entry. Teleports to the
        stored coordinates, takes a new screenshot with a new filename,
        and replaces the old entry.

  batch [--filter <partial>] [--dry-run]
        Iterate all metadata.json entries (or a subset matched by
        --filter), teleport to each, and capture a new screenshot.
        Metadata is updated after every entry (crash-safe).
        --dry-run shows what would happen without connecting to RCON.

OPTIONS
  --no-setup    Skip sending camera setup commands before capturing
  --delay <ms>  Override teleport wait time (default from config)
  --help        Show this help text

ENVIRONMENT (set in tools/deadlock-capture/.env)
  RCON_PASSWORD           Required. Must match -rcon_password in Steam.
  GAME_SCREENSHOT_DIR     Required. Path where Deadlock saves screenshots.
  RCON_HOST               Default: 127.0.0.1
  RCON_PORT               Default: 27015
  TELEPORT_DELAY_MS       Default: 1500
  SCREENSHOT_TIMEOUT_MS   Default: 8000
`.trim();

// --- Argument parsing ---

function getFlag(args: string[], flag: string): string | null {
  const i = args.indexOf(flag);
  return i !== -1 ? (args[i + 1] ?? null) : null;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

// --- Command implementations ---

async function runStatus(config: CaptureConfig): Promise<void> {
  const rcon = new RconClient();
  console.log(`[RCON] Connecting to ${config.rconHost}:${config.rconPort}...`);
  await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);
  console.log("[RCON] Connected and authenticated");

  const game = new GameCommands(rcon);
  const result = await game.getpos();

  if (!result) {
    console.error("[ERROR] Could not parse getpos response from the game");
  } else {
    const { x, y, z } = result.position;
    console.log(`[POS]  ${formatCoord(x, y, z)}`);
  }

  rcon.close();
}

async function runSetup(config: CaptureConfig): Promise<void> {
  const rcon = new RconClient();
  await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);
  const game = new GameCommands(rcon);
  await game.setup();
  rcon.close();
}

async function runTeardown(config: CaptureConfig): Promise<void> {
  const rcon = new RconClient();
  await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);
  const game = new GameCommands(rcon);
  await game.teardown();
  rcon.close();
}

async function runAdd(
  config: CaptureConfig,
  getposArg: string | null,
  noSetup: boolean
): Promise<void> {
  const rcon = new RconClient();
  console.log(`[RCON] Connecting to ${config.rconHost}:${config.rconPort}...`);
  await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);
  console.log("[RCON] Connected");

  const game = new GameCommands(rcon);
  if (!noSetup) await game.setup();

  let coord;
  if (getposArg) {
    const parsed = parseGetpos(getposArg);
    if (!parsed) {
      rcon.close();
      throw new Error(
        `Could not parse --getpos argument.\nExpected format: "setpos x y z;setang p y r"\nGot: ${getposArg}`
      );
    }
    coord = parsed.position;
    await game.teleport(coord, config.teleportDelayMs);
  } else {
    const result = await game.getpos();
    if (!result) {
      rcon.close();
      throw new Error("Could not get position from the game — is sv_cheats 1 enabled?");
    }
    coord = result.position;
    console.log(`[POS]  Capturing at current position ${formatCoord(coord.x, coord.y, coord.z)}`);
  }

  const destFileName = generateFilename();
  const screenshotPromise = waitForNewScreenshot(
    config.gameScreenshotDir,
    config.outputDir,
    destFileName,
    config.screenshotTimeoutMs
  );

  await game.screenshot();
  await screenshotPromise;

  const entry: MetadataEntry = {
    fileName: destFileName,
    location: { x: coord.x, y: coord.y, z: coord.z },
  };
  await appendEntry(config.metadataPath, entry);

  console.log(`[META] Added: ${destFileName} at ${formatCoord(coord.x, coord.y, coord.z)}`);
  rcon.close();
}

async function runRecapture(
  config: CaptureConfig,
  fileName: string,
  noSetup: boolean
): Promise<void> {
  const entries = await readMetadata(config.metadataPath);
  const entry = entries.find((e) => e.fileName === fileName);
  if (!entry) {
    throw new Error(`"${fileName}" not found in metadata.json`);
  }

  const { x, y, z } = entry.location;
  console.log(`[META] Found: ${fileName} at ${formatCoord(x, y, z)}`);

  const rcon = new RconClient();
  console.log(`[RCON] Connecting to ${config.rconHost}:${config.rconPort}...`);
  await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);

  const game = new GameCommands(rcon);
  if (!noSetup) await game.setup();

  await game.teleport(entry.location, config.teleportDelayMs);

  const destFileName = generateFilename();
  const screenshotPromise = waitForNewScreenshot(
    config.gameScreenshotDir,
    config.outputDir,
    destFileName,
    config.screenshotTimeoutMs
  );

  await game.screenshot();
  await screenshotPromise;

  await replaceEntry(config.metadataPath, fileName, {
    fileName: destFileName,
    location: entry.location,
  });

  console.log(`[META] Replaced: ${fileName} → ${destFileName}`);
  rcon.close();
}

async function runBatch(
  config: CaptureConfig | null,
  filter: string | null,
  dryRun: boolean,
  noSetup: boolean
): Promise<void> {
  const metadataPath = config?.metadataPath ?? DEFAULT_METADATA_PATH;
  let entries = await readMetadata(metadataPath);
  if (filter) {
    entries = entries.filter((e) => e.fileName.includes(filter));
  }

  if (entries.length === 0) {
    console.log("[BATCH] No entries to process.");
    return;
  }

  if (dryRun) {
    console.log(`[DRY-RUN] Would process ${entries.length} entries:`);
    for (const e of entries) {
      const { x, y, z } = e.location;
      console.log(`  ${e.fileName}  ${formatCoord(x, y, z)}`);
    }
    return;
  }

  if (!config) throw new Error("config is required for non-dry-run batch");

  const rcon = new RconClient();
  console.log(`[RCON] Connecting to ${config.rconHost}:${config.rconPort}...`);
  await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);
  console.log("[RCON] Connected");

  const game = new GameCommands(rcon);
  if (!noSetup) await game.setup();

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const { x, y, z } = entry.location;
    console.log(`\n[BATCH] ${i + 1}/${entries.length}  ${entry.fileName}  ${formatCoord(x, y, z)}`);

    try {
      await game.teleport(entry.location, config.teleportDelayMs);

      const destFileName = generateFilename();
      const screenshotPromise = waitForNewScreenshot(
        config.gameScreenshotDir,
        config.outputDir,
        destFileName,
        config.screenshotTimeoutMs
      );

      await game.screenshot();
      await screenshotPromise;

      const oldFileName = entry.fileName;
      await replaceEntry(config.metadataPath, oldFileName, {
        fileName: destFileName,
        location: entry.location,
      });
      entries[i] = { ...entry, fileName: destFileName };

      console.log(`[BATCH] OK: ${oldFileName} → ${destFileName}`);
      succeeded++;

      // Brief pause between entries
      await sleep(500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[BATCH] FAILED on ${entry.fileName}: ${message}`);
      failed++;
    }
  }

  await game.teardown();
  rcon.close();

  console.log(`\n[BATCH] Done. ${succeeded} captured, ${failed} failed.`);
}

// --- Entry point ---

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || hasFlag(args, "--help")) {
    console.log(USAGE);
    return;
  }

  const command = args[0]!;

  if (command === "status" || command === "setup" || command === "teardown") {
    const config = loadConfig();
    if (command === "status") await runStatus(config);
    else if (command === "setup") await runSetup(config);
    else await runTeardown(config);
    return;
  }

  const noSetup = hasFlag(args, "--no-setup");
  const dryRun = hasFlag(args, "--dry-run");
  const delayOverride = getFlag(args, "--delay");
  const getposArg = getFlag(args, "--getpos");
  const filterArg = getFlag(args, "--filter");

  // Dry-run batch doesn't need RCON credentials — handle it before loadConfig()
  if (command === "batch" && dryRun) {
    await runBatch(null, filterArg, true, noSetup);
    return;
  }

  let config = loadConfig();
  if (delayOverride !== null) {
    config = { ...config, teleportDelayMs: parseInt(delayOverride, 10) };
  }

  if (command === "add") {
    await runAdd(config, getposArg, noSetup);
  } else if (command === "recapture") {
    const fileName = args[1];
    if (!fileName) {
      console.error("Usage: bun run capture recapture <fileName>");
      process.exit(1);
    }
    await runRecapture(config, fileName, noSetup);
  } else if (command === "batch") {
    await runBatch(config, filterArg, dryRun, noSetup);
  } else {
    console.error(`Unknown command: "${command}"\nRun with --help for usage.`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n[ERROR] ${message}`);
  process.exit(1);
});
