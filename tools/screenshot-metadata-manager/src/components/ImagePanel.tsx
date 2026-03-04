import {useState, useRef, useCallback} from 'react'
import type {MetadataEntry} from '../types'
import TagEditor from './TagEditor'

interface Props {
    selectedEntries: MetadataEntry[]
    selectedIds: string[]
    tagDefs: string[]
    onAddTag: (ids: string[], tag: string) => void
    onRemoveTag: (ids: string[], tag: string) => void
    onAddTagDef: (tag: string) => void
    onRemoveTagDef: (tag: string) => void
    onApplyTagToSelected: (tag: string) => void
    onDeleteEntry: (id: string) => void
    onHoverEntry: (id: string | null) => void
    onSelectSingle: (id: string) => void
    productionFileNames: Set<string>
    onPromote: (id: string) => void
    onDemote: (fileName: string) => void
}

export default function ImagePanel({
                                       selectedEntries,
                                       selectedIds,
                                       tagDefs,
                                       onAddTag,
                                       onRemoveTag,
                                       onAddTagDef,
                                       onRemoveTagDef,
                                       onApplyTagToSelected,
                                       onDeleteEntry,
                                       onHoverEntry,
                                       onSelectSingle,
                                       productionFileNames,
                                       onPromote,
                                       onDemote,
                                   }: Props) {
    const ids = selectedEntries.map((e) => e.id)

    return (
        <div style={styles.panel}>
            {/* Content area */}
            <div style={styles.content}>
                {selectedEntries.length === 0 ? (
                    <EmptyState/>
                ) : selectedEntries.length === 1 ? (
                    <SingleImageView
                        entry={selectedEntries[0]}
                        isInProduction={productionFileNames.has(selectedEntries[0].fileName)}
                        onDeleteEntry={onDeleteEntry}
                        onPromote={onPromote}
                        onDemote={onDemote}
                    />
                ) : (
                    <MultiImageView
                        entries={selectedEntries}
                        productionFileNames={productionFileNames}
                        onHoverEntry={onHoverEntry}
                        onSelectSingle={onSelectSingle}
                        onDeleteEntry={onDeleteEntry}
                        onPromote={onPromote}
                    />
                )}

                {selectedEntries.length > 0 && (
                    <TagEditor
                        selectedEntries={selectedEntries}
                        tagDefs={tagDefs}
                        onAddTag={(tag) => onAddTag(ids, tag)}
                        onRemoveTag={(tag) => onRemoveTag(ids, tag)}
                        onAddTagDef={onAddTagDef}
                    />
                )}
            </div>

            {/* Defined tags section — always visible at bottom */}
            <TagDefsSection
                tagDefs={tagDefs}
                hasSelection={selectedIds.length > 0}
                onAddTagDef={onAddTagDef}
                onRemoveTagDef={onRemoveTagDef}
                onApplyTag={onApplyTagToSelected}
            />
        </div>
    )
}

function EmptyState() {
    return (
        <div style={styles.empty}>
            <div style={styles.emptyIcon}>📍</div>
            <div style={styles.emptyText}>Click a pin on the map to select images</div>
            <div style={styles.emptyHint}>Shift+Click or Ctrl+Click for multi-select · ←/→ to step</div>
        </div>
    )
}

function SingleImageView({
                             entry,
                             isInProduction,
                             onDeleteEntry,
                             onPromote,
                             onDemote,
                         }: {
    entry: MetadataEntry
    isInProduction: boolean
    onDeleteEntry: (id: string) => void
    onPromote: (id: string) => void
    onDemote: (fileName: string) => void
}) {
    const [previewHeight, setPreviewHeight] = useState(880)
    const dragStartY = useRef<number | null>(null)
    const dragStartH = useRef(320)

    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        dragStartY.current = e.clientY
        dragStartH.current = previewHeight

        const onMove = (me: MouseEvent) => {
            if (dragStartY.current === null) return
            const delta = me.clientY - dragStartY.current
            setPreviewHeight(Math.max(80, Math.min(800, dragStartH.current + delta)))
        }
        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
            dragStartY.current = null
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }, [previewHeight])

    return (
        <div style={styles.singleView}>
            <div style={styles.imageWrapper}>
                <img
                    src={`/sessions/${entry.sessionId}/captures/${entry.fileName}`}
                    alt={entry.fileName}
                    style={{...styles.preview, maxHeight: previewHeight}}
                />
                {/* Drag handle to resize preview height */}
                <div
                    style={styles.resizeHandle}
                    onMouseDown={handleResizeMouseDown}
                    title="Drag to resize preview"
                />
            </div>
            <div style={styles.imageInfo}>
                <div style={styles.imageInfoRow}>
                    <span style={styles.fileName}>{entry.fileName}</span>
                    <button
                        style={styles.deleteBtn}
                        onClick={() => onDeleteEntry(entry.id)}
                        title="Delete this image permanently"
                    >
                        🗑 Delete
                    </button>
                </div>
                <span style={styles.sessionLabel}>{entry.sessionId}</span>
                <span style={styles.coords}>
          x: {entry.location.x.toFixed(1)} &nbsp; y: {entry.location.y.toFixed(1)} &nbsp; z: {entry.location.z.toFixed(1)}
                    &nbsp;|&nbsp;
                    pitch: {entry.angles.pitch.toFixed(1)}° &nbsp; yaw: {entry.angles.yaw.toFixed(1)}°
        </span>
                <span style={styles.capturedAt}>{new Date(entry.capturedAt).toLocaleString()}</span>
                <div style={styles.productionRow}>
                    {isInProduction ? (
                        <>
                            <span style={styles.inProductionLabel}>✓ In Production</span>
                            <button
                                style={styles.demoteBtn}
                                onClick={() => onDemote(entry.fileName)}
                                title="Remove from public/locations"
                            >
                                Demote
                            </button>
                        </>
                    ) : (
                        <button
                            style={styles.promoteBtn}
                            onClick={() => onPromote(entry.id)}
                            title="Copy to public/locations and add to metadata.json"
                        >
                            Promote to Production
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function MultiImageView({
                            entries,
                            productionFileNames,
                            onHoverEntry,
                            onSelectSingle,
                            onDeleteEntry,
                            onPromote,
                        }: {
    entries: MetadataEntry[]
    productionFileNames: Set<string>
    onHoverEntry: (id: string | null) => void
    onSelectSingle: (id: string) => void
    onDeleteEntry: (id: string) => void
    onPromote: (id: string) => void
}) {
    const nonproductionEntries = entries.filter((e) => !productionFileNames.has(e.fileName))

    const handleBulkPromote = () => {
        for (const entry of nonproductionEntries) {
            onPromote(entry.id)
        }
    }

    return (
        <div style={styles.multiView}>
            <div style={styles.multiHeader}>
                <span>{entries.length} images selected</span>
                {nonproductionEntries.length > 0 && (
                    <button
                        style={styles.bulkPromoteBtn}
                        onClick={handleBulkPromote}
                        title={`Promote ${nonproductionEntries.length} non-production image${nonproductionEntries.length === 1 ? '' : 's'} to public/locations`}
                    >
                        Promote {nonproductionEntries.length} to Production
                    </button>
                )}
            </div>
            <div style={styles.thumbnailGrid}>
                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        className="thumb-item"
                        style={styles.thumbItem}
                        onMouseEnter={() => onHoverEntry(entry.id)}
                        onMouseLeave={() => onHoverEntry(null)}
                        onClick={() => onSelectSingle(entry.id)}
                        title={`${entry.sessionId}/${entry.fileName}\nClick to view solo`}
                    >
                        <div style={styles.thumbImgWrap}>
                            <img
                                src={`/sessions/${entry.sessionId}/captures/${entry.fileName}`}
                                alt={entry.fileName}
                                style={styles.thumb}
                            />
                            {productionFileNames.has(entry.fileName) && (
                                <span style={styles.thumbProductionBadge} title="In production">P</span>
                            )}
                            <button
                                style={styles.thumbDeleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEntry(entry.id)
                                }}
                                title="Delete"
                            >
                                ×
                            </button>
                        </div>
                        {entry.tags.length > 0 && (
                            <div style={styles.thumbTags}>
                                {entry.tags.slice(0, 2).map((t) => (
                                    <span key={t} style={styles.thumbTag}>{t}</span>
                                ))}
                                {entry.tags.length > 2 && (
                                    <span style={styles.thumbTag}>+{entry.tags.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function TagDefsSection({
                            tagDefs,
                            hasSelection,
                            onAddTagDef,
                            onRemoveTagDef,
                            onApplyTag,
                        }: {
    tagDefs: string[]
    hasSelection: boolean
    onAddTagDef: (tag: string) => void
    onRemoveTagDef: (tag: string) => void
    onApplyTag: (tag: string) => void
}) {
    const [input, setInput] = useState('')

    const handleAdd = () => {
        const trimmed = input.trim()
        if (trimmed) {
            onAddTagDef(trimmed)
            setInput('')
        }
    }

    return (
        <div style={styles.tagDefsSection}>
            <div style={styles.sectionHeader}>
                Defined Tags
                {hasSelection && (
                    <span style={styles.tagDefsHint}>· click to apply to selection</span>
                )}
            </div>
            <div style={styles.tagDefsList}>
                {tagDefs.length === 0 && (
                    <span style={styles.noTagDefs}>No defined tags yet</span>
                )}
                {tagDefs.map((tag) => (
                    <span
                        key={tag}
                        style={{
                            ...styles.tagDef,
                            cursor: hasSelection ? 'pointer' : 'default',
                            ...(hasSelection ? styles.tagDefClickable : {}),
                        }}
                        onClick={() => {
                            if (hasSelection) onApplyTag(tag)
                        }}
                        title={hasSelection ? `Apply "${tag}" to all selected images` : tag}
                    >
            {tag}
                        <button
                            className="tag-def-remove"
                            style={styles.tagDefRemove}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveTagDef(tag)
                            }}
                            title="Remove from definitions"
                        >
              ×
            </button>
          </span>
                ))}
            </div>
            <div style={styles.newTagRow}>
                <input
                    style={styles.newTagInput}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Define new tag (e.g. area/amber)..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd()
                    }}
                />
                <button className="btn-add" style={styles.newTagBtn} onClick={handleAdd}>
                    + Define
                </button>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    panel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
    },
    content: {
        flex: 1,
        overflow: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
    },
    empty: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#444466',
        gap: 8,
        padding: 40,
    },
    emptyIcon: {
        fontSize: 36,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: '#555577',
    },
    emptyHint: {
        fontSize: 12,
        color: '#333355',
    },
    singleView: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    imageWrapper: {
        background: '#080818',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #222244',
        position: 'relative',
    },
    preview: {
        width: '100%',
        objectFit: 'contain',
        display: 'block',
    },
    resizeHandle: {
        height: 6,
        background: '#1e1e44',
        cursor: 'row-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
    },
    imageInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '0 2px',
    },
    imageInfoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    fileName: {
        fontSize: 12,
        color: '#8888aa',
        fontFamily: 'monospace',
    },
    deleteBtn: {
        background: '#2a1010',
        border: '1px solid #552020',
        borderRadius: 4,
        color: '#cc6666',
        cursor: 'pointer',
        fontSize: 11,
        padding: '2px 8px',
        flexShrink: 0,
    },
    sessionLabel: {
        fontSize: 11,
        color: '#555577',
        fontFamily: 'monospace',
    },
    coords: {
        fontSize: 11,
        color: '#444466',
        fontFamily: 'monospace',
    },
    capturedAt: {
        fontSize: 10,
        color: '#383855',
        fontFamily: 'monospace',
    },
    multiView: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    multiHeader: {
        fontSize: 13,
        color: '#8888cc',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    bulkPromoteBtn: {
        background: '#1a2a4a',
        border: '1px solid #2a5090',
        borderRadius: 4,
        color: '#6699dd',
        cursor: 'pointer',
        fontSize: 11,
        padding: '3px 10px',
        flexShrink: 0,
    },
    thumbnailGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 8,
    },
    thumbItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        borderRadius: 6,
        overflow: 'hidden',
        background: '#080818',
        border: '1px solid #1a1a38',
        cursor: 'pointer',
        transition: 'border-color 0.12s, box-shadow 0.12s',
    },
    thumbImgWrap: {
        position: 'relative',
    },
    thumb: {
        width: '100%',
        aspectRatio: '16/9',
        objectFit: 'cover',
        display: 'block',
    },
    thumbDeleteBtn: {
        position: 'absolute',
        top: 3,
        right: 3,
        background: 'rgba(40,0,0,0.8)',
        border: '1px solid #882222',
        borderRadius: 3,
        color: '#ff6666',
        cursor: 'pointer',
        fontSize: 13,
        lineHeight: 1,
        padding: '1px 4px',
        opacity: 0,
    },
    thumbTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        padding: '3px 5px',
    },
    thumbTag: {
        fontSize: 9,
        color: '#7777aa',
        background: '#1a1a38',
        borderRadius: 3,
        padding: '1px 4px',
    },
    tagDefsSection: {
        padding: '12px 16px',
        borderTop: '1px solid #1a1a38',
        background: '#0a0a1e',
        flexShrink: 0,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: 700,
        color: '#5050aa',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    tagDefsHint: {
        fontSize: 10,
        color: '#445566',
        fontWeight: 400,
        textTransform: 'none',
        letterSpacing: 0,
        fontStyle: 'italic',
    },
    tagDefsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 5,
        marginBottom: 8,
        minHeight: 26,
    },
    noTagDefs: {
        fontSize: 12,
        color: '#333355',
        fontStyle: 'italic',
    },
    tagDef: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        background: '#161630',
        border: '1px solid #303060',
        borderRadius: 4,
        padding: '2px 7px',
        fontSize: 11,
        color: '#9090cc',
        transition: 'background 0.1s, border-color 0.1s',
    },
    tagDefClickable: {
        background: '#1a1a3a',
        border: '1px solid #4040aa',
    },
    tagDefRemove: {
        background: 'none',
        border: 'none',
        color: '#555577',
        cursor: 'pointer',
        fontSize: 13,
        lineHeight: 1,
        padding: 0,
        marginLeft: 1,
    },
    newTagRow: {
        display: 'flex',
        gap: 6,
    },
    newTagInput: {
        flex: 1,
        background: '#141430',
        border: '1px solid #2a2a55',
        borderRadius: 6,
        padding: '5px 10px',
        color: '#e0e0f0',
        fontSize: 12,
        outline: 'none',
    },
    newTagBtn: {
        background: '#1a2a4a',
        border: '1px solid #2a4070',
        borderRadius: 6,
        color: '#7799cc',
        cursor: 'pointer',
        fontSize: 12,
        padding: '5px 10px',
        whiteSpace: 'nowrap',
    },
    productionRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    inProductionLabel: {
        fontSize: 11,
        color: '#44cc88',
        fontWeight: 600,
    },
    promoteBtn: {
        background: '#1a2a4a',
        border: '1px solid #2a5090',
        borderRadius: 4,
        color: '#6699dd',
        cursor: 'pointer',
        fontSize: 11,
        padding: '3px 10px',
    },
    demoteBtn: {
        background: '#1a2a1a',
        border: '1px solid #2a5030',
        borderRadius: 4,
        color: '#669966',
        cursor: 'pointer',
        fontSize: 11,
        padding: '3px 10px',
    },
    thumbProductionBadge: {
        position: 'absolute' as const,
        bottom: 3,
        left: 3,
        background: 'rgba(0,100,50,0.85)',
        border: '1px solid #2a8855',
        borderRadius: 3,
        color: '#66ffaa',
        fontSize: 9,
        fontWeight: 700,
        lineHeight: 1,
        padding: '2px 4px',
    },
}
