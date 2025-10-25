import * as React from 'react'
import { DayPicker, type DayPickerSingleProps } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

export type CalendarProps = Omit<DayPickerSingleProps, 'mode'>

export function Calendar({ ...props }: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      fixedWeeks
      weekStartsOn={1}
      {...props}
    />
  )
}


