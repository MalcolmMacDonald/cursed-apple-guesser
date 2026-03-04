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
