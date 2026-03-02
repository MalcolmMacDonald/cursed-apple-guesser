import type { MetadataEntry } from "./types.ts";

export async function readMetadata(path: string): Promise<MetadataEntry[]> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return [];
  }
  return file.json() as Promise<MetadataEntry[]>;
}

export async function writeMetadata(path: string, entries: MetadataEntry[]): Promise<void> {
  // 2-space indent + trailing newline to match the existing file format exactly
  await Bun.write(path, JSON.stringify(entries, null, 2) + "\n");
}

export async function appendEntry(
  metadataPath: string,
  entry: MetadataEntry
): Promise<MetadataEntry[]> {
  const entries = await readMetadata(metadataPath);
  const existing = entries.findIndex((e) => e.fileName === entry.fileName);
  if (existing !== -1) {
    entries[existing] = entry;
  } else {
    entries.push(entry);
  }
  await writeMetadata(metadataPath, entries);
  return entries;
}

export async function replaceEntry(
  metadataPath: string,
  oldFileName: string,
  newEntry: MetadataEntry
): Promise<MetadataEntry[]> {
  const entries = await readMetadata(metadataPath);
  const idx = entries.findIndex((e) => e.fileName === oldFileName);
  if (idx === -1) {
    throw new Error(`Entry not found in metadata.json: ${oldFileName}`);
  }
  entries[idx] = newEntry;
  await writeMetadata(metadataPath, entries);
  return entries;
}
