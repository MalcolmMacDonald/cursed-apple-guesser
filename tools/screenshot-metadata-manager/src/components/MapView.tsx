import { useRef, useCallback, useState } from 'react'
import type { MetadataEntry } from '../types'
import { normalizeCoords } from '../utils/coords'

interface Props {
  entries: MetadataEntry[]
  allEntries: MetadataEntry[]
  selected: Set<string>
  hoveredId?: string | null
  width: number
  onSelect: (id: string, multi: boolean) => void
  onSelectMultiple: (ids: string[], add: boolean) => void
  onDeselectAll: () => void
  onSelectAll: () => void
}

interface DragBox {
  startX: number
  startY: number
  endX: number
  endY: number
  active: boolean
}

export default function MapView({
  entries,
  allEntries,
  selected,
  hoveredId,
  width,
  onSelect,
  onSelectMultiple,
  onDeselectAll,
  onSelectAll,
}: Props) {
  const MAP_PX = Math.max(200, width - 48)
  const mapRef = useRef<HTMLDivElement>(null)
  const [dragBox, setDragBox] = useState<DragBox | null>(null)

  // Refs so document-level handlers always see latest values without re-registering
  const entriesRef = useRef(entries)
  entriesRef.current = entries
  const mapPxRef = useRef(MAP_PX)
  mapPxRef.current = MAP_PX
  const onSelectMultipleRef = useRef(onSelectMultiple)
  onSelectMultipleRef.current = onSelectMultiple
  const onDeselectAllRef = useRef(onDeselectAll)
  onDeselectAllRef.current = onDeselectAll

  const handleMapMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return
    e.preventDefault()
    const rect = mapRef.current.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    let box: DragBox = { startX, startY, endX: startX, endY: startY, active: false }
    setDragBox(box)

    const onMove = (me: MouseEvent) => {
      const mapPx = mapPxRef.current
      const ex = Math.max(0, Math.min(me.clientX - rect.left, mapPx))
      const ey = Math.max(0, Math.min(me.clientY - rect.top, mapPx))
      const moved = Math.abs(ex - box.startX) > 4 || Math.abs(ey - box.startY) > 4
      box = { ...box, endX: ex, endY: ey, active: moved }
      setDragBox({ ...box })
    }

    const onUp = (ue: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)

      if (box.active) {
        // Box select — collect pins within the rectangle
        const x0 = Math.min(box.startX, box.endX)
        const x1 = Math.max(box.startX, box.endX)
        const y0 = Math.min(box.startY, box.endY)
        const y1 = Math.max(box.startY, box.endY)
        const mapPx = mapPxRef.current
        const ids = entriesRef.current
          .filter((entry) => {
            const { nx, ny } = normalizeCoords(entry.location.x, entry.location.y)
            const px = nx * mapPx
            const py = ny * mapPx
            return px >= x0 && px <= x1 && py >= y0 && py <= y1
          })
          .map((e) => e.id)
        if (ids.length > 0) {
          onSelectMultipleRef.current(ids, ue.shiftKey || ue.ctrlKey || ue.metaKey)
        }
      } else {
        // Plain click on background → deselect all
        onDeselectAllRef.current()
      }

      setDragBox(null)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const visibleCount = entries.length
  const totalCount = allEntries.length

  return (
    <div style={{ ...styles.panel, width }}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>Map</span>
        <div style={styles.headerActions}>
          <span style={styles.count}>
            {visibleCount === totalCount
              ? `${totalCount} locations`
              : `${visibleCount} / ${totalCount} visible`}
          </span>
          {selected.size > 0 && (
            <button style={styles.actionBtn} onClick={onDeselectAll}>
              Clear ({selected.size})
            </button>
          )}
          <button style={styles.actionBtn} onClick={onSelectAll}>
            Select All
          </button>
        </div>
      </div>

      <div style={styles.mapWrap}>
        <div
          ref={mapRef}
          style={{ ...styles.mapContainer, width: MAP_PX, height: MAP_PX }}
          onMouseDown={handleMapMouseDown}
        >
          <img
            src="/map.png"
            alt="Deadlock minimap"
            style={{ ...styles.mapImage, width: MAP_PX, height: MAP_PX }}
            draggable={false}
          />

          {entries.map((entry) => {
            const { nx, ny } = normalizeCoords(entry.location.x, entry.location.y)
            const isSelected = selected.has(entry.id)
            const isHovered = hoveredId === entry.id
            const tagSummary = entry.tags.length > 0 ? `\n[${entry.tags.join(', ')}]` : ''

            // Direction indicator — yaw→screen: dx=cos(yaw), dy=−sin(yaw) (map Y is inverted)
            const yawRad = (entry.angles.yaw * Math.PI) / 180
            const dirX = Math.cos(yawRad)
            const dirY = -Math.sin(yawRad)

            const pinColor = isHovered ? '#ff8800' : isSelected ? '#ffcc00' : '#4488ff'
            const strokeColor = isHovered ? '#aa4400' : isSelected ? '#cc6600' : '#1133aa'
            const lineColor = isHovered ? '#ff6600' : isSelected ? '#ffaa00' : '#6699ff'

            return (
              <svg
                key={entry.id}
                className="map-pin"
                style={{
                  position: 'absolute',
                  left: nx * MAP_PX - 6,
                  top: ny * MAP_PX - 6,
                  width: 12,
                  height: 12,
                  overflow: 'visible',
                  cursor: 'pointer',
                  zIndex: isHovered ? 4 : isSelected ? 3 : 1,
                }}
                title={`${entry.sessionId}/${entry.fileName}${tagSummary}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(entry.id, e.shiftKey || e.ctrlKey || e.metaKey)
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Direction indicator line */}
                <line
                  x1="6"
                  y1="6"
                  x2={6 + dirX * 10}
                  y2={6 + dirY * 10}
                  stroke={lineColor}
                  strokeWidth={isSelected ? 2 : 1.5}
                  strokeLinecap="round"
                />
                {/* Pin dot */}
                <circle
                  cx="6"
                  cy="6"
                  r={isHovered ? 6 : isSelected ? 5 : 4}
                  fill={pinColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
              </svg>
            )
          })}

          {/* Box-select overlay */}
          {dragBox && dragBox.active && (
            <div
              style={{
                position: 'absolute',
                left: Math.min(dragBox.startX, dragBox.endX),
                top: Math.min(dragBox.startY, dragBox.endY),
                width: Math.abs(dragBox.endX - dragBox.startX),
                height: Math.abs(dragBox.endY - dragBox.startY),
                border: '1px dashed #aaaaee',
                background: 'rgba(100, 100, 220, 0.12)',
                pointerEvents: 'none',
                zIndex: 20,
              }}
            />
          )}
        </div>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: '#4488ff' }} />
          <span>Unselected</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: '#ffcc00' }} />
          <span>Selected ({selected.size})</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: '#ff8800' }} />
          <span>Hovered</span>
        </div>
        <div style={styles.legendHint}>Shift/Ctrl+click or drag to select · ←/→ to step</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0f0f22',
    flexShrink: 0,
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid #222244',
    gap: 8,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7070bb',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontSize: 11,
    color: '#555577',
  },
  actionBtn: {
    background: '#1a1a38',
    border: '1px solid #333366',
    borderRadius: 4,
    color: '#8888cc',
    cursor: 'pointer',
    fontSize: 11,
    padding: '3px 8px',
  },
  mapWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flex: 1,
    overflow: 'hidden',
  },
  mapContainer: {
    position: 'relative',
    cursor: 'crosshair',
    flexShrink: 0,
    userSelect: 'none',
  },
  mapImage: {
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    padding: '8px 14px',
    borderTop: '1px solid #222244',
    fontSize: 11,
    color: '#666688',
    alignItems: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  legendHint: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#44445a',
    fontStyle: 'italic',
  },
}
