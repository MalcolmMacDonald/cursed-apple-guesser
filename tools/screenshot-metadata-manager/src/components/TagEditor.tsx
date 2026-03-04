import { useState, useRef } from 'react'
import type { MetadataEntry } from '../types'

interface Props {
  selectedEntries: MetadataEntry[]
  tagDefs: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onAddTagDef: (tag: string) => void
}

export default function TagEditor({ selectedEntries, tagDefs, onAddTag, onRemoveTag, onAddTagDef }: Props) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isMulti = selectedEntries.length > 1

  // Count how many selected entries have each tag
  const tagCounts = new Map<string, number>()
  for (const entry of selectedEntries) {
    for (const tag of entry.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  const commonTags = [...tagCounts.entries()]
    .filter(([, count]) => count === selectedEntries.length)
    .map(([tag]) => tag)
    .sort()

  const partialTags = [...tagCounts.entries()]
    .filter(([, count]) => count < selectedEntries.length)
    .map(([tag]) => tag)
    .sort()

  // Single image tags
  const singleTags = selectedEntries[0]?.tags.slice().sort() ?? []

  const trimmedInput = input.trim()
  const suggestions = tagDefs.filter(
    (def) =>
      trimmedInput &&
      def.toLowerCase().includes(trimmedInput.toLowerCase()) &&
      !tagCounts.has(def)
  )

  const handleAdd = () => {
    if (!trimmedInput) return
    onAddTag(trimmedInput)
    setInput('')
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (tag: string) => {
    onAddTag(tag)
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const displayTags = isMulti ? commonTags : singleTags

  return (
    <div style={styles.editor}>
      <div style={styles.header}>
        {isMulti ? `Tags — ${selectedEntries.length} images selected` : 'Tags'}
      </div>

      {/* Common tags (or single image tags) */}
      <div style={styles.tagGroup}>
        {displayTags.length === 0 && (
          <span style={styles.noTags}>{isMulti ? 'No tags shared by all' : 'No tags'}</span>
        )}
        {displayTags.map((tag) => (
          <span key={tag} style={styles.tag}>
            {tag}
            <button
              className="btn-remove"
              style={styles.removeBtn}
              onClick={() => onRemoveTag(tag)}
              title={isMulti ? 'Remove from all selected' : 'Remove'}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Partial tags (multi-select only) */}
      {isMulti && partialTags.length > 0 && (
        <div>
          <div style={styles.partialLabel}>Partial (on some images):</div>
          <div style={styles.tagGroup}>
            {partialTags.map((tag) => (
              <span key={tag} style={styles.partialTag}>
                {tag}
                <span style={styles.partialCount}>
                  {tagCounts.get(tag)}/{selectedEntries.length}
                </span>
                <button
                  className="btn-remove"
                  style={styles.removeBtn}
                  onClick={() => onRemoveTag(tag)}
                  title="Remove from all that have it"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div style={styles.inputRow}>
        <div style={styles.inputWrap}>
          <input
            ref={inputRef}
            style={styles.input}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={isMulti ? 'Add tag to all selected...' : 'Add tag...'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') {
                setInput('')
                setShowSuggestions(false)
              }
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={styles.suggestions}>
              {suggestions.map((s) => (
                <div
                  key={s}
                  className="suggestion-item"
                  style={styles.suggestion}
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="btn-add" style={styles.addBtn} onClick={handleAdd}>
          Add
        </button>
        {trimmedInput && !tagDefs.includes(trimmedInput) && (
          <button
            className="btn-define"
            style={styles.defineBtn}
            onClick={() => onAddTagDef(trimmedInput)}
            title="Save to defined tags for future use"
          >
            + Define
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 14,
    background: '#0f0f22',
    borderRadius: 8,
    border: '1px solid #222244',
  },
  header: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6060aa',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  tagGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 28,
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#252550',
    border: '1px solid #4040aa',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 12,
    color: '#ccccff',
  },
  partialTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#1a1a38',
    border: '1px solid #333366',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 12,
    color: '#7777aa',
  },
  partialCount: {
    fontSize: 10,
    color: '#555577',
    background: '#111133',
    borderRadius: 3,
    padding: '1px 4px',
  },
  partialLabel: {
    fontSize: 11,
    color: '#444466',
    marginBottom: 5,
  },
  noTags: {
    fontSize: 12,
    color: '#444466',
    fontStyle: 'italic',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#666688',
    cursor: 'pointer',
    fontSize: 15,
    lineHeight: 1,
    padding: '0 1px',
    marginLeft: 1,
  },
  inputRow: {
    display: 'flex',
    gap: 6,
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
  },
  input: {
    width: '100%',
    background: '#141430',
    border: '1px solid #333366',
    borderRadius: 6,
    padding: '6px 10px',
    color: '#e0e0f0',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#18183a',
    border: '1px solid #333366',
    borderTop: 'none',
    borderRadius: '0 0 6px 6px',
    zIndex: 100,
    maxHeight: 180,
    overflowY: 'auto',
  },
  suggestion: {
    padding: '7px 10px',
    fontSize: 12,
    color: '#aaaacc',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  addBtn: {
    background: '#1e3a5a',
    border: '1px solid #2a5080',
    borderRadius: 6,
    color: '#88bbff',
    cursor: 'pointer',
    fontSize: 12,
    padding: '5px 12px',
    whiteSpace: 'nowrap',
  },
  defineBtn: {
    background: '#1a3a28',
    border: '1px solid #2a6040',
    borderRadius: 6,
    color: '#88ccaa',
    cursor: 'pointer',
    fontSize: 12,
    padding: '5px 10px',
    whiteSpace: 'nowrap',
  },
}
