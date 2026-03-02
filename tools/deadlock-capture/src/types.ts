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

export type CaptureConfig = {
  rconHost: string;
  rconPort: number;
  rconPassword: string;
  gameScreenshotDir: string;
  outputDir: string;
  metadataPath: string;
  teleportDelayMs: number;
  screenshotTimeoutMs: number;
};
