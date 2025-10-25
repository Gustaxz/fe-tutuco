import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

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
      <div className='flex items-center gap-0'>
        <Button className='bg-transparent text-black p-2 rounded-full hover:bg-gray-200 cursor-pointer' onClick={goPrevDay} aria-label="Previous day">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button className='bg-transparent text-black p-2 rounded-full hover:bg-gray-200 cursor-pointer' onClick={goNextDay} aria-label="Next day">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="text-left gap-4 font-normal text-2xl min-w-56 bg-transparent text-black hover:bg-gray-100 border-0"
          >
            {formatDisplayDate(value)}
            <ChevronDown className="h-4 w-4 opacity-60" strokeWidth={3}/>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-2">
          <Calendar
            selected={isoToDate(value)}
            onSelect={(d: Date | undefined) => d && onChange(dateToIso(d))}
          />
        </PopoverContent>
      </Popover>

    </div>
  )
}


