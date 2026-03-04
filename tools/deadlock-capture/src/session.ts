import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { GameCommands } from "./commands.ts";
import { createScreenshotWatcher, type ScreenshotWatcher } from "./screenshot.ts";
import type { CaptureConfig, CaptureEntry, PendingCapture, SessionManifest } from "./types.ts";
import { formatCoord, generateCaptureFilename, sleep } from "./utils.ts";

export class CaptureSession {
  private manifest: SessionManifest;
  private pendingQueue: PendingCapture[] = [];
  private captureIndex = 0;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private watcher: ScreenshotWatcher | null = null;
  private running = false;

  constructor(
    private game: GameCommands,
    private config: CaptureConfig,
    private sessionDir: string,
    private capturesDir: string,
    sessionId: string,
  ) {
    this.manifest = {
      sessionId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      intervalMs: config.sessionIntervalMs,
      captureCount: 0,
      captures: [],
    };
  }

  async start(): Promise<void> {
    this.running = true;

    // Ensure captures directory exists
    mkdirSync(this.capturesDir, { recursive: true });

    // Write initial manifest
    await this.writeManifest();

    // Start watching for new screenshot files
    this.watcher = createScreenshotWatcher(
      this.config.gameScreenshotDir,
      (filename) => void this.handleNewFile(filename),
    );

    // Start the capture tick loop
    this.ticker = setInterval(() => void this.tick(), this.config.sessionIntervalMs);

    // Start stale entry cleanup (every 5 seconds)
    this.cleanupTimer = setInterval(() => this.cleanupStaleEntries(), 5000);

    console.log("[SESSION] Capture loop started");
  }

  async stop(): Promise<void> {
    this.running = false;

    // Stop the ticker
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }

    // Stop stale cleanup
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Grace period: wait for any pending screenshots to arrive
    if (this.pendingQueue.length > 0) {
      console.log(`[SESSION] Waiting 2s for ${this.pendingQueue.length} pending screenshot(s)...`);
      await sleep(2000);
    }

    // Close file watcher
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    // Finalize manifest
    this.manifest.endedAt = new Date().toISOString();
    await this.writeManifest();

    const duration = (
      (new Date(this.manifest.endedAt).getTime() - new Date(this.manifest.startedAt).getTime()) / 1000
    ).toFixed(0);

    console.log(`[SESSION] Session complete`);
    console.log(`[SESSION]   Captures: ${this.manifest.captureCount}`);
    console.log(`[SESSION]   Duration: ${duration}s`);
    console.log(`[SESSION]   Manifest: ${join(this.sessionDir, "manifest.json")}`);
  }

  private async tick(): Promise<void> {
    if (!this.running) return;

    // Backpressure: skip if too many pending
    if (this.pendingQueue.length >= this.config.maxPending) {
      console.log(`[WARN] Backpressure: ${this.pendingQueue.length} screenshots pending, skipping tick`);
      return;
    }

    // Get current position + angles
    let getposResult;
    try {
      getposResult = await this.game.getpos();
    } catch (err) {
      console.log(`[WARN] getpos failed: ${err instanceof Error ? err.message : err}`);
      return;
    }

    if (!getposResult) {
      console.log("[WARN] getpos returned no data, skipping tick");
      return;
    }

    // Record pending capture
    this.captureIndex++;
    const pending: PendingCapture = {
      index: this.captureIndex,
      position: getposResult.position,
      angles: getposResult.angles,
      capturedAt: new Date().toISOString(),
    };
    this.pendingQueue.push(pending);

    // Fire screenshot command (don't wait for file)
    try {
      await this.game.screenshot();
    } catch (err) {
      // Remove the pending entry since screenshot command failed
      this.pendingQueue.pop();
      this.captureIndex--;
      console.log(`[WARN] screenshot command failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  private async handleNewFile(filename: string): Promise<void> {
    // Dequeue oldest pending capture
    if (this.pendingQueue.length === 0) {
      console.log(`[WARN] Orphan screenshot detected: ${filename} (no pending capture)`);
      return;
    }

    const pending = this.pendingQueue.shift()!;

    // Wait for file write to settle
    await sleep(200);

    // Copy to captures dir with descriptive filename
    const destFilename = generateCaptureFilename(pending.index, pending.position);
    const sourceFile = join(this.config.gameScreenshotDir, filename);
    const destFile = join(this.capturesDir, destFilename);

    try {
      copyFileSync(sourceFile, destFile);
    } catch (err) {
      console.log(`[WARN] Failed to copy ${filename}: ${err instanceof Error ? err.message : err}`);
      return;
    }

    // Build capture entry
    const entry: CaptureEntry = {
      index: pending.index,
      fileName: destFilename,
      capturedAt: pending.capturedAt,
      position: pending.position,
      angles: pending.angles,
      tags: [],
    };

    this.manifest.captures.push(entry);
    this.manifest.captureCount = this.manifest.captures.length;

    // Persist manifest (crash-safe)
    await this.writeManifest();

    const { x, y, z } = pending.position;
    console.log(`[CAP] #${pending.index} at ${formatCoord(x, y, z)} -> ${destFilename}`);
  }

  private cleanupStaleEntries(): void {
    const now = Date.now();
    const timeout = this.config.screenshotTimeoutMs;

    const stale = this.pendingQueue.filter(
      (p) => now - new Date(p.capturedAt).getTime() > timeout
    );

    for (const entry of stale) {
      const idx = this.pendingQueue.indexOf(entry);
      if (idx !== -1) {
        this.pendingQueue.splice(idx, 1);
        console.log(`[WARN] Capture #${entry.index} timed out (no screenshot after ${timeout}ms) -- dropping`);
      }
    }
  }

  private async writeManifest(): Promise<void> {
    const manifestPath = join(this.sessionDir, "manifest.json");
    await Bun.write(manifestPath, JSON.stringify(this.manifest, null, 2) + "\n");
  }
}
