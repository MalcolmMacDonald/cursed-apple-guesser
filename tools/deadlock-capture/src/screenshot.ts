import { watch, type FSWatcher } from "fs";
import { readdirSync } from "fs";

export type ScreenshotWatcher = {
  close: () => void;
  knownFiles: Set<string>;
};

/**
 * Watch a screenshot directory for new .jpg files.
 *
 * Deadlock saves screenshots in date-based subdirectories:
 *   <gameScreenshotDir>/2024-06-01/screenshot_0001.jpg
 *
 * The watcher watches recursively. The `onNewFile` callback receives the
 * relative path from `gameScreenshotDir` (e.g. "2024-06-01/screenshot_0001.jpg").
 */
export function createScreenshotWatcher(
  gameScreenshotDir: string,
  onNewFile: (relativePath: string) => void
): ScreenshotWatcher {
  // Snapshot all existing .jpg files recursively so we only react to new ones.
  // readdirSync with { recursive: true } returns relative paths like "2024-06-01/screenshot_0001.jpg".
  // Normalize backslashes to forward slashes for consistent tracking across platforms.
  const knownFiles = new Set(
    (readdirSync(gameScreenshotDir, { recursive: true }) as string[])
      .map((f) => f.replace(/\\/g, "/"))
      .filter((f) => f.toLowerCase().endsWith(".jpg"))
  );

  let watcher: FSWatcher;
  try {
    // On Windows, fs.watch supports { recursive: true } natively
    watcher = watch(
      gameScreenshotDir,
      { persistent: false, recursive: true },
      (_event, filename) => {
        if (!filename) return;
        // Normalize path separators to forward slashes for consistent tracking
        const normalized = filename.replace(/\\/g, "/");
        if (!normalized.toLowerCase().endsWith(".jpg")) return;
        if (knownFiles.has(normalized)) return;
        knownFiles.add(normalized);
        onNewFile(normalized);
      }
    );
  } catch (err) {
    throw new Error(
      `Failed to watch screenshot directory: ${gameScreenshotDir}\n${err}`
    );
  }

  return {
    close: () => watcher.close(),
    knownFiles,
  };
}
