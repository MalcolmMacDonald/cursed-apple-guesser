export interface WorldCoord {
  x: number
  y: number
  z: number
}

export interface MetadataEntry {
  /** Unique key: `${sessionId}/${fileName}` */
  id: string
  sessionId: string
  fileName: string
  location: WorldCoord
  angles: { pitch: number; yaw: number; roll: number }
  capturedAt: string
  tags: string[]
}

export interface TagDefinitions {
  tags: string[]
}
