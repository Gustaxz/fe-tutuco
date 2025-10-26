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
      className="p-2 rounded-lg"
      classNames={{
        caption_label: 'text-blue-400 font-medium',
        // Use group and child selectors to target the SVG inside the nav button
        nav_button: 'group hover:bg-blue-50',
        nav_button_previous:
          'group [&>svg]:!stroke-blue-400 [&>svg]:!fill-blue-400 hover:bg-blue-50',
        nav_button_next:
          'group [&>svg]:!stroke-blue-400 [&>svg]:!fill-blue-400 hover:bg-blue-50',
        head_cell: 'text-blue-400 font-semibold',
        day_today: 'text-blue-400 font-bold',
        day_selected: '!bg-blue-400 !text-white hover:!bg-blue-500 rounded-lg',
        day: 'hover:bg-blue-50 rounded-lg',
      }}
      modifiersClassNames={{
        selected: '!bg-blue-400 !text-white hover:!bg-blue-500 rounded-lg',
      }}
      styles={{
        day: { borderRadius: '0.5rem' },
        day_selected: {
          backgroundColor: '#60a5fa',
          color: '#fff',
          borderRadius: '0.5rem',
        },
      }}
      {...props}
    />
  )
}



