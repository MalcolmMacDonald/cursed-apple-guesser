import type {RconClient} from "./rcon-client.ts";
import type {GetposResult} from "./types.ts";
import {parseGetpos} from "./utils.ts";

// Commands to configure the game for screenshot capture:
// - Hide the HUD
// - Enable noclip (free-flying movement)
// Note: setang is currently disabled in Deadlock, so camera angle cannot be controlled.
const SETUP_COMMANDS = [
    "citadel_hud_visible 0",
    "changeteam 1",
];

// Restore the game to normal after capturing
const TEARDOWN_COMMANDS = [
    "citadel_hud_visible 1",
    "changeteam 0",
];

export class GameCommands {
    constructor(private rcon: RconClient) {
    }

    async setup(): Promise<void> {
        for (const cmd of SETUP_COMMANDS) {
            await this.rcon.send(cmd);
        }
        console.log("[CMD] Camera setup applied (HUD hidden, noclip enabled)");
    }

    async teardown(): Promise<void> {
        for (const cmd of TEARDOWN_COMMANDS) {
            await this.rcon.send(cmd);
        }
        console.log("[CMD] Teardown applied (HUD restored, noclip disabled)");
    }

    async screenshot(): Promise<void> {
        await this.rcon.send("rcon screenshot");
    }

    async getpos(): Promise<GetposResult | null> {
        const raw = await this.rcon.send("getpos");
        return parseGetpos(raw);
    }
}
