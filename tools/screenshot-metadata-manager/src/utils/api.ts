import type { MetadataEntry, TagDefinitions } from '../types'

export async function fetchMetadata(): Promise<MetadataEntry[]> {
  const res = await fetch('/api/metadata')
  if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.statusText}`)
  return res.json()
}

export async function saveMetadata(data: MetadataEntry[]): Promise<void> {
  const res = await fetch('/api/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to save metadata: ${res.statusText}`)
}

export async function fetchTagDefs(): Promise<TagDefinitions> {
  const res = await fetch('/api/tags')
  if (!res.ok) throw new Error(`Failed to fetch tag definitions: ${res.statusText}`)
  return res.json()
}

export async function saveTagDefs(data: TagDefinitions): Promise<void> {
  const res = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to save tag definitions: ${res.statusText}`)
}

export async function deleteEntry(sessionId: string, fileName: string): Promise<void> {
  const res = await fetch('/api/entry', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, fileName }),
  })
  if (!res.ok) throw new Error(`Failed to delete entry: ${res.statusText}`)
}

export async function fetchProduction(): Promise<string[]> {
  const res = await fetch('/api/production')
  if (!res.ok) throw new Error(`Failed to fetch production: ${res.statusText}`)
  return res.json()
}

export async function promoteEntry(sessionId: string, fileName: string): Promise<void> {
  const res = await fetch('/api/promote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, fileName }),
  })
  if (!res.ok) throw new Error(`Failed to promote entry: ${res.statusText}`)
}

export async function demoteEntry(fileName: string): Promise<void> {
  const res = await fetch('/api/demote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName }),
  })
  if (!res.ok) throw new Error(`Failed to demote entry: ${res.statusText}`)
}
