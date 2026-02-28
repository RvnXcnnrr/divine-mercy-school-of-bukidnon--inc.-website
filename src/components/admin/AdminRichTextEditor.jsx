import { useEffect, useRef } from 'react'
import { FiBold, FiItalic, FiList, FiType, FiUnderline } from 'react-icons/fi'

const COMMANDS = [
  { label: 'Bold', icon: FiBold, command: 'bold' },
  { label: 'Italic', icon: FiItalic, command: 'italic' },
  { label: 'Underline', icon: FiUnderline, command: 'underline' },
  { label: 'Bullets', icon: FiList, command: 'insertUnorderedList' },
]

export default function AdminRichTextEditor({ label, value, onChange, placeholder = 'Write content...', minHeight = 140 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  function runCommand(command) {
    if (typeof document === 'undefined') return
    ref.current?.focus()
    document.execCommand(command, false)
    onChange(ref.current?.innerHTML || '')
  }

  return (
    <div>
      {label ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-2 py-2">
          {COMMANDS.map((item) => (
            <button
              key={item.command}
              type="button"
              onClick={() => runCommand(item.command)}
              className="admin-button-secondary px-2"
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-slate-500">
            <FiType className="h-3.5 w-3.5" aria-hidden="true" />
            Rich text
          </span>
        </div>

        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
          data-placeholder={placeholder}
          className="admin-rich-editor min-h-[140px] px-3 py-2 text-sm text-slate-800 focus:outline-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}
