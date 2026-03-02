import type { RconClient } from "./rcon-client.ts";
import type { GetposResult, WorldCoord } from "./types.ts";
import { parseGetpos, sleep } from "./utils.ts";

// Commands to configure the game for screenshot capture:
// - Hide the HUD
// - Enable noclip (free-flying movement)
// - Set FOV to 90
// Note: setang is currently disabled in Deadlock, so camera angle cannot be controlled.
const SETUP_COMMANDS = [
  "citadel_hud_visible 0",
  "noclip",
  "citadel_camera_use_overrides 1",
  "citadel_camera_override_fov 90",
];

// Restore the game to normal after capturing
const TEARDOWN_COMMANDS = [
  "citadel_hud_visible 1",
  "noclip",
  "citadel_camera_use_overrides 0",
];

export class GameCommands {
  constructor(private rcon: RconClient) {}

  async setup(): Promise<void> {
    for (const cmd of SETUP_COMMANDS) {
      await this.rcon.send(cmd);
    }
    console.log("[CMD] Camera setup applied (HUD hidden, noclip enabled, FOV=90)");
  }

  async teardown(): Promise<void> {
    for (const cmd of TEARDOWN_COMMANDS) {
      await this.rcon.send(cmd);
    }
    console.log("[CMD] Teardown applied (HUD restored, noclip disabled)");
  }

  async teleport(coord: WorldCoord, delayMs: number): Promise<void> {
    const cmd = `setpos ${coord.x} ${coord.y} ${coord.z}`;
    await this.rcon.send(cmd);
    console.log(`[CMD] Teleported to (${coord.x}, ${coord.y}, ${coord.z}) — waiting ${delayMs}ms...`);
    await sleep(delayMs);
  }

  async screenshot(): Promise<void> {
    await this.rcon.send("screenshot");
    console.log("[CMD] Screenshot command sent");
  }

  async getpos(): Promise<GetposResult | null> {
    const raw = await this.rcon.send("getpos");
    return parseGetpos(raw);
  }
}
