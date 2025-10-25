import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(iso: string): string {
  const d = isoToDate(iso)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d)
}

export function DatePicker({ value, onChange }: { value: string, onChange: (nextIso: string) => void }) {
  function goPrevDay() {
    const d = isoToDate(value)
    d.setDate(d.getDate() - 1)
    onChange(dateToIso(d))
  }

  function goNextDay() {
    const d = isoToDate(value)
    d.setDate(d.getDate() + 1)
    onChange(dateToIso(d))
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goPrevDay} aria-label="Previous day">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal min-w-56"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Calendar
            selected={isoToDate(value)}
            onSelect={(d: Date | undefined) => d && onChange(dateToIso(d))}
          />
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="icon" onClick={goNextDay} aria-label="Next day">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}


