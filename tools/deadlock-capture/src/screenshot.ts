import { watch } from "fs";
import { copyFileSync, readdirSync } from "fs";
import { join } from "path";
import { sleep } from "./utils.ts";

export type ScreenshotResult = {
  sourceFile: string;
  destFile: string;
  fileName: string;
};

export async function waitForNewScreenshot(
  gameScreenshotDir: string,
  outputDir: string,
  destFileName: string,
  timeoutMs: number
): Promise<ScreenshotResult> {
  // Snapshot what's already there before triggering the screenshot command
  const before = new Set(
    readdirSync(gameScreenshotDir).filter((f) => f.toLowerCase().endsWith(".jpg"))
  );

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      watcher.close();
      reject(
        new Error(
          `Timed out after ${timeoutMs}ms waiting for a new screenshot.\n` +
          `Check that GAME_SCREENSHOT_DIR is correct:\n  ${gameScreenshotDir}`
        )
      );
    }, timeoutMs);

    const watcher = watch(gameScreenshotDir, { persistent: false }, (_event, filename) => {
      if (!filename) return;
      if (!filename.toLowerCase().endsWith(".jpg")) return;
      if (before.has(filename)) return;

      clearTimeout(timer);
      watcher.close();

      const sourceFile = join(gameScreenshotDir, filename);
      const destFile = join(outputDir, destFileName);

      // Short delay to ensure the game has finished writing the file
      sleep(200).then(() => {
        try {
          copyFileSync(sourceFile, destFile);
          console.log(`[FILE] Copied: ${filename} → ${destFileName}`);
          resolve({ sourceFile, destFile, fileName: destFileName });
        } catch (err) {
          reject(new Error(`Failed to copy screenshot: ${err}`));
        }
      });
    });
  });
}
