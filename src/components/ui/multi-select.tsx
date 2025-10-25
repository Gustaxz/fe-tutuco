export type MultiSelectOption = { value: string; label: string }

import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Check, ChevronDown, X } from 'lucide-react'

export function MultiSelect({
  placeholder,
  options,
  values,
  onChange,
  className,
  searchPlaceholder = 'Search...',
  showSelectAll = true,
  selectAllLabel = 'Selecionar todos'
}: {
  placeholder: string
  options: MultiSelectOption[]
  values: string[]
  onChange: (next: string[]) => void
  className?: string
  searchPlaceholder?: string
  showSelectAll?: boolean
  selectAllLabel?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const selected = React.useMemo(() => new Set(values), [values])
  const valueToLabel = React.useMemo(() => {
    const m = new Map<string, string>()
    for (const o of options) m.set(o.value, o.label)
    return m
  }, [options])
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  function toggle(value: string) {
    if (selected.has(value)) {
      onChange(values.filter(v => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  function selectAllVisible() {
    const visible = filtered.map(o => o.value)
    const allFilteredSelected = visible.every(v => selected.has(v))
    if (allFilteredSelected) {
      // unselect all visible
      onChange(values.filter(v => !visible.includes(v)))
    } else {
      // add all visible
      const set = new Set(values)
      for (const v of visible) set.add(v)
      onChange(Array.from(set))
    }
  }

  const summary = React.useMemo(() => {
    if (values.length === 0) return placeholder
    const labels: string[] = []
    for (const v of values) {
      const lbl = valueToLabel.get(v)
      if (lbl) labels.push(lbl)
    }
    return labels.join(', ')
  }, [values, valueToLabel, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`justify-between w-full ${className ?? ''}`}>
          <span className="truncate text-left">{summary}</span>
          <div className="flex items-center gap-1">
            {values.length > 0 && (
              <X className="h-4 w-4 opacity-60 hover:opacity-100" onClick={clearAll} />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-64">
        <div className="p-2 border-b flex items-center gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 rounded border px-2 py-1 text-sm"
          />
        </div>
        <div className="max-h-56 overflow-auto p-1">
          {showSelectAll && (
            <button
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100"
              onClick={selectAllVisible}
            >
              <span className={`h-4 w-4 rounded border flex items-center justify-center ${filtered.every(o => selected.has(o.value)) && filtered.length > 0 ? 'bg-blue-400 border-blue-400 text-white' : 'border-gray-300'}`}>
                {filtered.every(o => selected.has(o.value)) && filtered.length > 0 && <Check className="h-3 w-3" />}
              </span>
              <span className="truncate">{selectAllLabel}</span>
            </button>
          )}
          {filtered.map(opt => (
            <button
              key={opt.value}
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => toggle(opt.value)}
            >
              <span className={`h-4 w-4 rounded border flex items-center justify-center ${selected.has(opt.value) ? 'bg-blue-400 border-blue-400 text-white' : 'border-gray-300'}`}>
                {selected.has(opt.value) && <Check className="h-3 w-3" />}
              </span>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-2 py-2 text-sm text-gray-500">No results</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
