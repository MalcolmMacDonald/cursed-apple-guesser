#!/usr/bin/env bun

import {mkdirSync} from "fs";
import {join} from "path";
import {loadConfig} from "./config.ts";
import {RconClient} from "./rcon-client.ts";
import {GameCommands} from "./commands.ts";
import {CaptureSession} from "./session.ts";
import {formatCoord, generateSessionId} from "./utils.ts";
import type {CaptureConfig} from "./types.ts";

const USAGE = `
deadlock-capture — Automated screenshot capture for Map Trainer

USAGE
  bun run capture <command> [options]

COMMANDS
  session [--interval <ms>] [--no-setup]
        Start a continuous capture session. Fly around in Deadlock while
        this tool periodically captures screenshots with position data.
        Press Ctrl+C to stop and save the session manifest.

  status
        Connect to RCON and print the current player position.

  setup
        Send camera setup commands (hide HUD, enable noclip).

  teardown
        Restore the game to normal (show HUD, disable noclip).

OPTIONS
  --interval <ms>  Override capture interval (default: 1000ms)
  --no-setup       Skip sending camera setup/teardown commands
  --help           Show this help text

ENVIRONMENT (set in tools/deadlock-capture/.env)
  RCON_PASSWORD           Required. Must match -rcon_password in Steam.
  GAME_SCREENSHOT_DIR     Required. Path where Deadlock saves screenshots.
  RCON_HOST               Default: 127.0.0.1
  RCON_PORT               Default: 27015
  SESSION_INTERVAL_MS     Default: 1000
  MAX_PENDING             Default: 3
  SESSION_OUTPUT_DIR      Default: ./output/sessions
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
        const {x, y, z} = result.position;
        console.log(`[POS]  ${formatCoord(x, y, z)}`);
        console.log(`[ANG]  pitch=${result.angles.pitch.toFixed(2)} yaw=${result.angles.yaw.toFixed(2)} roll=${result.angles.roll.toFixed(2)}`);
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

async function runSession(config: CaptureConfig, noSetup: boolean): Promise<void> {
    const rcon = new RconClient();
    console.log(`[RCON] Connecting to ${config.rconHost}:${config.rconPort}...`);
    await rcon.connect(config.rconHost, config.rconPort, config.rconPassword);
    console.log("[RCON] Connected and authenticated");

    const game = new GameCommands(rcon);

    if (!noSetup) {
        await game.setup();
    }

    // Create session directory structure
    const sessionId = generateSessionId();
    const sessionDir = join(config.sessionOutputDir, sessionId);
    const capturesDir = join(sessionDir, "captures");
    mkdirSync(capturesDir, {recursive: true});

    const session = new CaptureSession(game, config, sessionDir, capturesDir, sessionId);

    // Graceful shutdown on Ctrl+C
    let shuttingDown = false;
    const shutdown = async () => {
        if (shuttingDown) return;
        shuttingDown = true;

        console.log("\n[SESSION] Shutting down...");
        await session.stop();

        if (!noSetup) {
            await game.teardown();
        }

        rcon.close();
        process.exit(0);
    };

    process.on("SIGINT", () => void shutdown());
    process.on("SIGTERM", () => void shutdown());

    console.log(`[SESSION] Starting capture session: ${sessionId}`);
    console.log(`[SESSION] Interval: ${config.sessionIntervalMs}ms`);
    console.log(`[SESSION] Output: ${sessionDir}`);
    console.log(`[SESSION] Press Ctrl+C to stop.\n`);

    await session.start();

    // Keep the process alive
    await new Promise(() => {
    });
}

// --- Entry point ---

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0 || hasFlag(args, "--help")) {
        console.log(USAGE);


        return;
    }

    const command = args[0]!;
    const noSetup = hasFlag(args, "--no-setup");

    if (command === "session") {
        const config = loadConfig();
        const intervalOverride = getFlag(args, "--interval");
        if (intervalOverride) {
            config.sessionIntervalMs = parseInt(intervalOverride, 10);
        }
        await runSession(config, noSetup);
    } else if (command === "status") {
        const config = loadConfig();
        await runStatus(config);
    } else if (command === "setup") {
        const config = loadConfig();
        await runSetup(config);
    } else if (command === "teardown") {
        const config = loadConfig();
        await runTeardown(config);
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
