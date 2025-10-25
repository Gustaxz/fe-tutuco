// no need to import React explicitly in React 17+
import { DayPicker, type DayPickerSingleProps } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import 'react-day-picker/style.css'

export type CalendarProps = Omit<DayPickerSingleProps, 'mode'>

export function Calendar({ ...props }: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      fixedWeeks
      weekStartsOn={1}
      locale={ptBR}
      className="p-2"
      classNames={{
        caption_label: 'text-blue-400 font-medium',
        nav_button: 'text-blue-400 hover:bg-blue-50 rounded',
        head_cell: 'text-blue-400 font-semibold',
        day_today: 'text-blue-400',
        day_selected: 'bg-blue-400 text-white hover:bg-blue-500',
        day: 'hover:bg-blue-50 rounded',
      }}
      {...props}
    />
  )
}


