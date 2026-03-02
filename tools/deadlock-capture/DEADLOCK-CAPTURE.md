# Deadlock Screenshot Capture Tool

A Bun CLI tool for automatically capturing in-game screenshots from Deadlock and adding them to the Cursed Apple Guesser dataset. It connects to a running Deadlock instance via the Source RCON protocol, teleports the player to a position using `setpos`, triggers a screenshot, and adds the result to `public/locations/metadata.json`.

---

## Prerequisites

1. **Deadlock must be running** on the same machine (or a reachable host).
2. **`sv_cheats 1` must be enabled** in-game — required for `setpos` (teleport) and `noclip`.
3. **RCON must be enabled** via Steam launch options.

### Steam Launch Options

Right-click Deadlock in your Steam library → **Properties** → **Launch Options**, and add:

```
-console -rcon_password yourpassword
```

Replace `yourpassword` with a password of your choice. The console will open automatically when the game starts.

### Enable cheats in-game

Open the console with `~` (tilde) and run:

```
sv_cheats 1
```

---

## Setup

1. Copy `.env.example` to `.env` in this directory:

   ```bash
   cp tools/deadlock-capture/.env.example tools/deadlock-capture/.env
   ```

2. Edit `.env` and fill in the two required values:

   ```env
   RCON_PASSWORD=yourpassword
   GAME_SCREENSHOT_DIR=C:\Program Files (x86)\Steam\userdata\<steamid>\760\remote\1422450\screenshots
   ```

   **Finding `GAME_SCREENSHOT_DIR`:** In Steam, go to **View → Recordings and Screenshots**, right-click any Deadlock screenshot, and choose **Show on Disk**. Copy the folder path that opens.

   Deadlock's Steam App ID is `1422450`, so the path is typically:
   ```
   C:\Program Files (x86)\Steam\userdata\<your-steam-id>\760\remote\1422450\screenshots
   ```

---

## Commands

Run all commands from the **repo root**:

```bash
bun run capture <command> [options]
```

Or from inside the tool directory:

```bash
bun run src/main.ts <command> [options]
```

### `status`

Verify the RCON connection and print the player's current position.

```bash
bun run capture status
# [RCON] Connecting to 127.0.0.1:27015...
# [RCON] Connected and authenticated
# [POS]  (23.41, -10053.34, 1309.13)
```

### `add`

Capture a single new location and add it to `metadata.json`.

**Capture at current position** (walk to the spot first):

```bash
bun run capture add
```

**Teleport to a specific position** (paste output from the in-game `getpos` command):

```bash
bun run capture add --getpos "setpos 1234.5 -500.0 300.0;setang 0 90 0"
```

### `recapture <fileName>`

Re-teleport to an existing entry's coordinates and replace its screenshot with a new one. The coordinates in `metadata.json` are preserved; only the filename changes.

```bash
bun run capture recapture 20250901112830_1.jpg
```

### `batch`

Iterate all entries in `metadata.json`, teleport to each, and capture a new screenshot. Metadata is written after every entry so a partial run is safe to resume.

```bash
# Preview without doing anything
bun run capture batch --dry-run

# Process all entries
bun run capture batch

# Process only entries whose filename contains "20250901"
bun run capture batch --filter 20250901
```

### `setup` / `teardown`

Send the camera configuration commands manually (useful before manual captures):

```bash
bun run capture setup     # hide HUD, enable noclip, set FOV=90
bun run capture teardown  # restore HUD, disable noclip
```

---

## Options

| Flag | Description |
|------|-------------|
| `--no-setup` | Skip sending camera setup commands before capturing |
| `--delay <ms>` | Override teleport wait time (e.g. `--delay 3000`) |
| `--dry-run` | (batch only) Preview without connecting or writing files |
| `--filter <str>` | (batch only) Only process entries whose filename contains `<str>` |
| `--help` | Show usage |

---

## Deadlock Console Commands Reference

| Command | Description |
|---------|-------------|
| `setpos x y z` | Teleport player to world coordinates |
| `getpos` | Print current position: `setpos x y z;setang pitch yaw roll` |
| `screenshot` | Save a screenshot to the game's screenshot folder |
| `noclip` | Toggle free-flying movement (requires `sv_cheats 1`) |
| `sv_cheats 1` | Enable cheat commands |
| `citadel_hud_visible 0` / `1` | Hide/show the in-game HUD |
| `citadel_camera_use_overrides 0` / `1` | Toggle camera override mode |
| `citadel_camera_override_fov <n>` | Set camera field of view |

### `getpos` output format

```
setpos 23.406250 -10053.343750 1309.125000;setang -0.812500 87.406250 0.000000
```

- `setpos x y z` — player world position
- `setang pitch yaw roll` — camera angles (**currently disabled** in Deadlock; `setang` has no effect)

Because `setang` is disabled, camera angle cannot be controlled programmatically. Screenshots will show whatever direction the player's camera was pointing when `setpos` was called.

### Map coordinate ranges

- X axis: approximately −10,900 to +10,900
- Y axis: approximately −10,900 to +10,900
- Z axis: varies by height (stored in metadata but not used by the web app)

---

## Workflow: Adding New Locations

1. Open Deadlock and load into an Explore/Practice match.
2. Run `sv_cheats 1` in the console.
3. Run `bun run capture setup` to enable noclip and hide the HUD.
4. Fly to the area you want to capture.
5. Run `getpos` in the console and copy the output.
6. Run:
   ```bash
   bun run capture add --getpos "setpos x y z;setang p y r"
   ```
7. The tool teleports back to that position, takes a screenshot, and adds the entry to `metadata.json`.

Alternatively, if you're already standing where you want to capture, just run:

```bash
bun run capture add
```

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `RCON authentication failed` | Wrong password or RCON not enabled | Check `-rcon_password` in Steam launch options matches `RCON_PASSWORD` in `.env` |
| `Connection refused` | Game not running or RCON port blocked | Start Deadlock first; check firewall |
| `Timed out waiting for screenshot` | Wrong `GAME_SCREENSHOT_DIR` | Open Steam screenshots, use "Show on Disk" to get the correct path |
| `setpos` doesn't move the player | `sv_cheats` not enabled, or wrong map mode | Run `sv_cheats 1` in console; use an Explore/Practice match |
| Screenshots show loading screen | Teleport delay too short | Increase `TELEPORT_DELAY_MS` (try `3000`) |
| `Entry not found in metadata.json` | Wrong filename for `recapture` | Check the exact filename with `cat public/locations/metadata.json` |

---

## File Structure

```
tools/deadlock-capture/
  src/
    main.ts           CLI entry point and command dispatch
    rcon-client.ts    Source RCON protocol over TCP (Bun.connect)
    commands.ts       High-level game commands (teleport, screenshot, getpos)
    screenshot.ts     Watch game screenshot dir, copy new file to public/locations/
    metadata.ts       Read/write public/locations/metadata.json
    config.ts         Load config from environment / .env file
    types.ts          TypeScript types
    utils.ts          generateFilename, parseGetpos, sleep, formatCoord
  package.json
  tsconfig.json
  .env.example
  DEADLOCK-CAPTURE.md  (this file)
```
