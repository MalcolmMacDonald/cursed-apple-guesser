# Tools

## deadlock-capture (`tools/deadlock-capture/`)

Automated Deadlock screenshot capture tool. Uses RCON to connect to a running Deadlock instance and captures
screenshots at defined map positions with world coordinates and camera angles.

- Output sessions: `tools/deadlock-capture/output/sessions/{sessionId}/`
- Manifest format: `{ captures: [{ fileName, position:{x,y,z}, angles:{pitch,yaw,roll}, capturedAt, tags }] }`
- Tag definitions: `tools/deadlock-capture/output/tag-definitions.json`

Run: `bun run capture`

## screenshot-metadata-manager (`tools/screenshot-metadata-manager/`)

Vite + React UI (port 5174) for reviewing, filtering, and tagging captured screenshots.

Run: `bun run cms`

Vite plugin in `vite.config.ts`:
- Serves `/map.png` → `src/assets/IMG_6117.png`
- Serves `/sessions/{sessionId}/captures/{fileName}` → actual JPEG files
- API: `GET/POST /api/metadata`, `GET/POST /api/tags`, `DELETE /api/entry`, `POST /api/promote`, `POST /api/demote`
- Promote writes `{ fileName, location, tags }` to `public/locations/metadata.json`

Features:
- Minimap with interactive pins (select, drag-box-select, hover highlight)
- Single and multi-image views with tag editor
- Defined tag vocabulary with one-click apply to selection
- Regex tag filter with include/exclude toggle
- Arrow key navigation through screenshots
- Resizable image preview panel
- Image deletion
- Auto-saves tags back to session manifests (Ctrl+S)

Known quirks:
- `handleSave` must be declared before keyboard-shortcut `useEffect` (TDZ bug if reversed)
- MetadataEntry id: `${sessionId}/${fileName}` (composite key)
