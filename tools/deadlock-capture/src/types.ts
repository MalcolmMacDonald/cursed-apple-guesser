export type WorldCoord = {
  x: number;
  y: number;
  z: number;
};

export type MetadataEntry = {
  fileName: string;
  location: WorldCoord;
};

export type GetposResult = {
  position: WorldCoord;
  angles: { pitch: number; yaw: number; roll: number };
};

export type CaptureEntry = {
  index: number;
  fileName: string;
  capturedAt: string;
  position: WorldCoord;
  angles: { pitch: number; yaw: number; roll: number };
  tags: string[];
};

export type SessionManifest = {
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  intervalMs: number;
  captureCount: number;
  captures: CaptureEntry[];
};

export type PendingCapture = {
  index: number;
  position: WorldCoord;
  angles: { pitch: number; yaw: number; roll: number };
  capturedAt: string;
};

export type CaptureConfig = {
  rconHost: string;
  rconPort: number;
  rconPassword: string;
  gameScreenshotDir: string;
  outputDir: string;
  metadataPath: string;
  teleportDelayMs: number;
  screenshotTimeoutMs: number;
  sessionIntervalMs: number;
  maxPending: number;
  sessionOutputDir: string;
};
