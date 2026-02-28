import { useRef } from 'react'
import { FiArrowDown, FiArrowUp, FiCopy, FiMove, FiTrash2 } from 'react-icons/fi'

function moveItem(items, fromIndex, toIndex) {
  if (fromIndex === toIndex) return items
  const copy = [...items]
  const [moved] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, moved)
  return copy
}

export default function SortableCardsEditor({
  title,
  description,
  items,
  addLabel = 'Add Item',
  emptyMessage = 'No items yet.',
  onChange,
  onAdd,
  onDuplicate,
  renderBody,
  itemLabel,
  className = '',
}) {
  const dragIndexRef = useRef(-1)

  function updateItem(index, patch) {
    const next = [...items]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  function removeItem(index) {
    const next = [...items]
    next.splice(index, 1)
    onChange(next)
  }

  function handleDrop(targetIndex) {
    const fromIndex = dragIndexRef.current
    dragIndexRef.current = -1
    if (fromIndex < 0 || fromIndex >= items.length || fromIndex === targetIndex) return
    onChange(moveItem(items, fromIndex, targetIndex))
  }

  function moveBy(index, delta) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    onChange(moveItem(items, index, target))
  }

  return (
    <article className={['admin-card p-5', className].join(' ')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        <button type="button" onClick={onAdd} className="admin-button-secondary">
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <section
              key={item.id || `${title}-${index}`}
              draggable
              onDragStart={() => {
                dragIndexRef.current = index
              }}
              onDragOver={(event) => {
                event.preventDefault()
              }}
              onDrop={(event) => {
                event.preventDefault()
                handleDrop(index)
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <FiMove className="h-3.5 w-3.5" aria-hidden="true" />
                  {itemLabel ? itemLabel(item, index) : `Item ${index + 1}`}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBy(index, -1)}
                    className="admin-button-secondary px-2"
                    aria-label="Move item up"
                  >
                    <FiArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBy(index, 1)}
                    className="admin-button-secondary px-2"
                    aria-label="Move item down"
                  >
                    <FiArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {onDuplicate ? (
                    <button
                      type="button"
                      onClick={() => onDuplicate(item, index)}
                      className="admin-button-secondary px-2"
                      aria-label="Duplicate item"
                    >
                      <FiCopy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="admin-button-secondary px-2 text-rose-700 hover:bg-rose-50"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {renderBody({ item, index, updateItem: (patch) => updateItem(index, patch) })}
            </section>
          ))}
        </div>
      )}
    </article>
  )
}
