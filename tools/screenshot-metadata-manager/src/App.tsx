import {useState, useEffect, useCallback, useRef} from 'react'
import type {MetadataEntry} from './types'
import {fetchMetadata, saveMetadata, fetchTagDefs, saveTagDefs, deleteEntry, fetchProduction, promoteEntry, demoteEntry} from './utils/api'
import MapView from './components/MapView'
import ImagePanel from './components/ImagePanel'

type SaveState = 'saved' | 'dirty' | 'saving' | 'error'
type FilterMode = 'include' | 'exclude'
type ProductionFilter = 'all' | 'production' | 'dev'

const DEFAULT_MAP_PANEL_WIDTH = 1230
const MIN_MAP_PANEL_WIDTH = 280
const MAX_MAP_PANEL_WIDTH = 1230

export default function App() {
    const [entries, setEntries] = useState<MetadataEntry[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [filterMode, setFilterMode] = useState<FilterMode>('include')
    const [tagDefs, setTagDefs] = useState<string[]>([])
    const [saveState, setSaveState] = useState<SaveState>('saved')
    const [saveError, setSaveError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [mapPanelWidth, setMapPanelWidth] = useState(DEFAULT_MAP_PANEL_WIDTH)
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [productionFileNames, setProductionFileNames] = useState<Set<string>>(new Set())
    const [productionFilter, setProductionFilter] = useState<ProductionFilter>('all')

    // Refs so event handlers always see latest values without re-registering
    const entriesRef = useRef(entries)
    entriesRef.current = entries
    const saveStateRef = useRef(saveState)
    saveStateRef.current = saveState
    const mapPanelWidthRef = useRef(mapPanelWidth)
    mapPanelWidthRef.current = mapPanelWidth
    const selectedRef = useRef(selected)
    selectedRef.current = selected
    const filteredEntriesRef = useRef<MetadataEntry[]>([])
    const productionFileNamesRef = useRef(productionFileNames)
    productionFileNamesRef.current = productionFileNames

    // ── Persist (declared early so keyboard effect can reference it) ──
    const handleSave = useCallback(async () => {
        setSaveState('saving')
        try {
            await saveMetadata(entriesRef.current)
            setSaveState('saved')
            setSaveError(null)
        } catch (err) {
            setSaveState('error')
            setSaveError(String(err))
        }
    }, [])

    // ── Load on mount ─────────────────────────────────────────
    useEffect(() => {
        Promise.all([fetchMetadata(), fetchTagDefs(), fetchProduction()])
            .then(([meta, defs, production]) => {
                setEntries(meta)
                setTagDefs(defs.tags)
                setProductionFileNames(new Set(production))
                setLoading(false)
            })
            .catch((err) => {
                setLoadError(String(err))
                setLoading(false)
            })
    }, [])

    // ── Keyboard shortcuts ────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't fire when typing in an input/textarea
            const target = e.target as HTMLElement
            const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (saveStateRef.current === 'dirty') handleSave()
                return
            }
            if (e.key === 'Escape') {
                setSelected(new Set())
                return
            }
            // Arrow key navigation — step through filtered entries when 1 is selected
            if (!inInput && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                const sel = selectedRef.current
                if (sel.size !== 1) return
                const filtered = filteredEntriesRef.current
                const currentId = [...sel][0]
                const idx = filtered.findIndex((e) => e.id === currentId)
                if (idx === -1) return
                let nextIdx = e.key === 'ArrowRight' ? idx + 1 : idx - 1
                if (nextIdx < 0) nextIdx = filtered.length - 1
                if (nextIdx >= filtered.length) nextIdx = 0
                const nextId = filtered[nextIdx]?.id
                if (nextId) setSelected(new Set([nextId]))
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleSave])

    // ── Derived state ─────────────────────────────────────────
    const filteredEntries = (() => {
        let result = entries

        // Production/dev filter
        if (productionFilter === 'production') {
            result = result.filter((e) => productionFileNames.has(e.fileName))
        } else if (productionFilter === 'dev') {
            result = result.filter((e) => !productionFileNames.has(e.fileName))
        }

        // Tag filter
        if (!searchQuery.trim()) return result
        try {
            const regex = new RegExp(searchQuery, 'i')
            const matches = (e: MetadataEntry) => e.tags.some((tag) => regex.test(tag))
            return filterMode === 'include'
                ? result.filter(matches)
                : result.filter((e) => !matches(e))
        } catch {
            return filterMode === 'include' ? [] : result
        }
    })()

    // Keep ref in sync so arrow key handler can access it
    filteredEntriesRef.current = filteredEntries

    const selectedEntries = entries.filter((e) => selected.has(e.id))

    // ── Selection ─────────────────────────────────────────────
    const handleSelect = useCallback((id: string, multi: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (multi) {
                if (next.has(id)) next.delete(id)
                else next.add(id)
            } else {
                if (next.size === 1 && next.has(id)) next.clear()
                else {
                    next.clear();
                    next.add(id)
                }
            }
            return next
        })
    }, [])

    const handleDeselectAll = useCallback(() => setSelected(new Set()), [])

    const handleSelectAll = useCallback(() => {
        setSelected(new Set(filteredEntries.map((e) => e.id)))
    }, [filteredEntries])

    const handleSelectMultiple = useCallback((ids: string[], add: boolean) => {
        setSelected((prev) => {
            const next = add ? new Set(prev) : new Set<string>()
            for (const id of ids) next.add(id)
            return next
        })
    }, [])

    const handleSelectSingle = useCallback((id: string) => {
        setSelected(new Set([id]))
    }, [])

    // ── Panel resize ──────────────────────────────────────────
    const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        const startX = e.clientX
        const startWidth = mapPanelWidthRef.current

        const onMove = (me: MouseEvent) => {
            const delta = me.clientX - startX
            setMapPanelWidth(
                Math.max(MIN_MAP_PANEL_WIDTH, Math.min(MAX_MAP_PANEL_WIDTH, startWidth + delta))
            )
        }

        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }, [])

    // ── Metadata mutations ────────────────────────────────────
    const mutateEntries = useCallback(
        (updater: (prev: MetadataEntry[]) => MetadataEntry[]) => {
            setEntries((prev) => updater(prev))
            setSaveState('dirty')
            setSaveError(null)
        },
        []
    )

    const handleAddTag = useCallback(
        (ids: string[], tag: string) => {
            const trimmed = tag.trim()
            if (!trimmed) return
            mutateEntries((prev) =>
                prev.map((e) =>
                    ids.includes(e.id) && !e.tags.includes(trimmed)
                        ? {...e, tags: [...e.tags, trimmed].sort()}
                        : e
                )
            )
        },
        [mutateEntries]
    )

    const handleRemoveTag = useCallback(
        (ids: string[], tag: string) => {
            mutateEntries((prev) =>
                prev.map((e) =>
                    ids.includes(e.id)
                        ? {...e, tags: e.tags.filter((t) => t !== tag)}
                        : e
                )
            )
        },
        [mutateEntries]
    )

    const handleDeleteEntry = useCallback(async (id: string) => {
        const entry = entriesRef.current.find((e) => e.id === id)
        if (!entry) return
        try {
            // If this image is in production, demote it first so it's removed from public/locations
            if (productionFileNamesRef.current.has(entry.fileName)) {
                await demoteEntry(entry.fileName)
                setProductionFileNames((prev) => {
                    const next = new Set(prev)
                    next.delete(entry.fileName)
                    return next
                })
            }
            await deleteEntry(entry.sessionId, entry.fileName)
            setEntries((prev) => prev.filter((e) => e.id !== id))
            setSelected((prev) => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        } catch (err) {
            setSaveError(String(err))
        }
    }, [])

    // ── Bulk demote selected ──────────────────────────────────
    const handleDemoteSelected = useCallback(async () => {
        const ids = [...selectedRef.current]
        const toDemote = entriesRef.current.filter(
            (e) => ids.includes(e.id) && productionFileNamesRef.current.has(e.fileName)
        )
        try {
            for (const entry of toDemote) {
                await demoteEntry(entry.fileName)
            }
            setProductionFileNames((prev) => {
                const next = new Set(prev)
                for (const entry of toDemote) next.delete(entry.fileName)
                return next
            })
        } catch (err) {
            setSaveError(String(err))
        }
    }, [])

    // ── Bulk delete selected ──────────────────────────────────
    const handleDeleteSelected = useCallback(async () => {
        const ids = [...selectedRef.current]
        const toDelete = entriesRef.current.filter((e) => ids.includes(e.id))
        try {
            for (const entry of toDelete) {
                if (productionFileNamesRef.current.has(entry.fileName)) {
                    await demoteEntry(entry.fileName)
                }
                await deleteEntry(entry.sessionId, entry.fileName)
            }
            const deletedIds = new Set(ids)
            const deletedFileNames = new Set(toDelete.map((e) => e.fileName))
            setEntries((prev) => prev.filter((e) => !deletedIds.has(e.id)))
            setProductionFileNames((prev) => {
                const next = new Set(prev)
                for (const fileName of deletedFileNames) next.delete(fileName)
                return next
            })
            setSelected(new Set())
        } catch (err) {
            setSaveError(String(err))
        }
    }, [])

    // ── Production promote / demote ───────────────────────────
    const handlePromote = useCallback(async (id: string) => {
        const entry = entriesRef.current.find((e) => e.id === id)
        if (!entry) return
        try {
            await promoteEntry(entry.sessionId, entry.fileName)
            setProductionFileNames((prev) => new Set([...prev, entry.fileName]))
        } catch (err) {
            setSaveError(String(err))
        }
    }, [])

    const handleDemote = useCallback(async (fileName: string) => {
        try {
            await demoteEntry(fileName)
            setProductionFileNames((prev) => {
                const next = new Set(prev)
                next.delete(fileName)
                return next
            })
        } catch (err) {
            setSaveError(String(err))
        }
    }, [])

    // ── Tag definitions ───────────────────────────────────────
    const handleAddTagDef = useCallback(
        (tag: string) => {
            const trimmed = tag.trim()
            if (!trimmed || tagDefs.includes(trimmed)) return
            const next = [...tagDefs, trimmed].sort()
            setTagDefs(next)
            saveTagDefs({tags: next}).catch((err) => setSaveError(String(err)))
        },
        [tagDefs]
    )

    const handleRemoveTagDef = useCallback(
        (tag: string) => {
            const next = tagDefs.filter((t) => t !== tag)
            setTagDefs(next)
            saveTagDefs({tags: next}).catch((err) => setSaveError(String(err)))
        },
        [tagDefs]
    )

    const handleApplyTagToSelected = useCallback(
        (tag: string) => {
            const ids = [...selectedRef.current]
            if (ids.length === 0) return
            handleAddTag(ids, tag)
        },
        [handleAddTag]
    )

    // ── Render ────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={styles.fullCenter}>
                <div style={styles.loadingText}>Loading…</div>
            </div>
        )
    }

    if (loadError) {
        return (
            <div style={styles.fullCenter}>
                <div style={styles.errorText}>Failed to load: {loadError}</div>
                <div style={styles.errorHint}>Is the dev server running from the right directory?</div>
            </div>
        )
    }

    let regexInvalid = false
    if (searchQuery.trim()) {
        try {
            new RegExp(searchQuery)
        } catch {
            regexInvalid = true
        }
    }

    const ids = selectedEntries.map((e) => e.id)

    return (
        <div style={styles.app}>
            {/* ── Header ── */}
            <header style={styles.header}>
                <span style={styles.title}>Screenshot Metadata Manager</span>

                <div style={styles.searchWrap}>
                    <button
                        style={{
                            ...styles.filterModeBtn,
                            background: productionFilter === 'all' ? '#1a1a2e' : productionFilter === 'production' ? '#1e2e1e' : '#2e1e1e',
                            border: productionFilter === 'all' ? '1px solid #33336a' : productionFilter === 'production' ? '1px solid #2a6040' : '1px solid #603030',
                            color: productionFilter === 'all' ? '#8888cc' : productionFilter === 'production' ? '#88cc88' : '#cc8888',
                        }}
                        onClick={() => setProductionFilter((f) => f === 'all' ? 'production' : f === 'production' ? 'dev' : 'all')}
                        title={productionFilter === 'all' ? 'Showing all — click to show production only' : productionFilter === 'production' ? 'Showing production only — click to show dev only' : 'Showing dev only — click to show all'}
                    >
                        {productionFilter === 'all' ? 'all' : productionFilter === 'production' ? 'prod' : 'dev'}
                    </button>
                    <button
                        style={{
                            ...styles.filterModeBtn,
                            background: filterMode === 'include' ? '#1e3a1e' : '#3a1e1e',
                            border: filterMode === 'include' ? '1px solid #2a6040' : '1px solid #603030',
                            color: filterMode === 'include' ? '#88cc88' : '#cc8888',
                        }}
                        onClick={() => setFilterMode((m) => m === 'include' ? 'exclude' : 'include')}
                        title={filterMode === 'include' ? 'Showing matches — click to exclude matches' : 'Hiding matches — click to include matches'}
                    >
                        {filterMode === 'include' ? 'incl' : 'excl'}
                    </button>
                    <input
                        style={{...styles.searchInput, border: regexInvalid ? '1px solid #aa3333' : '1px solid #2e2e66'}}
                        placeholder="Filter by tag (regex)…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        spellCheck={false}
                    />
                    {searchQuery && (
                        <span style={styles.filterBadge}>
              {regexInvalid ? 'invalid regex' : `${filteredEntries.length} / ${entries.length}`}
            </span>
                    )}
                    {searchQuery && (
                        <button style={styles.clearSearch} onClick={() => setSearchQuery('')}>×</button>
                    )}
                </div>

                <div style={styles.headerRight}>
                    {saveError && <span style={styles.errorLabel}>{saveError}</span>}
                    {saveState === 'saved' && <span style={styles.savedLabel}>✓ Saved</span>}
                    {saveState === 'dirty' && (
                        <button className="btn-save" style={styles.saveBtn} onClick={handleSave}>
                            Save (Ctrl+S)
                        </button>
                    )}
                    {saveState === 'saving' && (
                        <button style={{...styles.saveBtn, opacity: 0.6}} disabled>Saving…</button>
                    )}
                    {saveState === 'error' && (
                        <button className="btn-save" style={{...styles.saveBtn, background: '#662222'}} onClick={handleSave}>
                            Retry Save
                        </button>
                    )}
                    <span style={styles.totalBadge}>{entries.length} images</span>
                </div>
            </header>

            {/* ── Main ── */}
            <main style={styles.main}>
                <MapView
                    entries={filteredEntries}
                    allEntries={entries}
                    selected={selected}
                    hoveredId={hoveredId}
                    width={mapPanelWidth}
                    onSelect={handleSelect}
                    onSelectMultiple={handleSelectMultiple}
                    onDeselectAll={handleDeselectAll}
                    onSelectAll={handleSelectAll}
                />

                {/* Draggable divider */}
                <div
                    className="panel-divider"
                    style={styles.divider}
                    onMouseDown={handleDividerMouseDown}
                />

                <ImagePanel
                    selectedEntries={selectedEntries}
                    tagDefs={tagDefs}
                    onAddTag={(ids, tag) => handleAddTag(ids, tag)}
                    onRemoveTag={(ids, tag) => handleRemoveTag(ids, tag)}
                    onAddTagDef={handleAddTagDef}
                    onRemoveTagDef={handleRemoveTagDef}
                    onApplyTagToSelected={handleApplyTagToSelected}
                    onDeleteEntry={handleDeleteEntry}
                    onDeleteSelected={handleDeleteSelected}
                    onDemoteSelected={handleDemoteSelected}
                    onHoverEntry={setHoveredId}
                    onSelectSingle={handleSelectSingle}
                    selectedIds={ids}
                    productionFileNames={productionFileNames}
                    onPromote={handlePromote}
                    onDemote={handleDemote}
                />
            </main>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    app: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0d0d1e',
        color: '#ddddf0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 16px',
        background: '#0a0a1c',
        borderBottom: '1px solid #1e1e44',
        flexShrink: 0,
    },
    title: {
        fontSize: 14,
        fontWeight: 700,
        color: '#8080cc',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    searchWrap: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    filterModeBtn: {
        border: '1px solid',
        borderRadius: 5,
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
    },
    searchInput: {
        flex: 1,
        background: '#131330',
        border: '1px solid #2e2e66',
        borderRadius: 6,
        padding: '6px 11px',
        color: '#e0e0f0',
        fontSize: 13,
        outline: 'none',
        fontFamily: 'monospace',
    },
    filterBadge: {
        fontSize: 11,
        color: '#666688',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    clearSearch: {
        background: 'none',
        border: 'none',
        color: '#555577',
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: '1',
        padding: '0 2px',
        flexShrink: 0,
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },
    errorLabel: {
        fontSize: 11,
        color: '#ff6666',
        maxWidth: 200,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    savedLabel: {
        fontSize: 12,
        color: '#44aa66',
    },
    saveBtn: {
        background: '#3535aa',
        color: '#e0e0ff',
        border: 'none',
        borderRadius: 6,
        padding: '6px 14px',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
    },
    totalBadge: {
        fontSize: 11,
        color: '#444466',
        background: '#111130',
        border: '1px solid #222244',
        borderRadius: 4,
        padding: '2px 8px',
    },
    main: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    divider: {
        width: 5,
        background: '#161628',
        cursor: 'col-resize',
        flexShrink: 0,
    },
    fullCenter: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0d0d1e',
        color: '#ddddf0',
        gap: 10,
    },
    loadingText: {
        fontSize: 16,
        color: '#8080cc',
    },
    errorText: {
        fontSize: 14,
        color: '#ff6666',
    },
    errorHint: {
        fontSize: 12,
        color: '#555577',
    },
}
