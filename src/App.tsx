import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { ScheduleService, type Booking, type Room, type SurgeryCenter } from './api/ScheduleService'
import { DatePicker } from './components/ui/date-picker'
import { Button } from './components/ui/button'
import { Building2, Landmark, Home } from 'lucide-react'

function formatHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

function getTodayIsoDate(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseTimeToMinutes(time24h: string): number {
  const [h, m] = time24h.split(':').map(Number)
  return h * 60 + m
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function App() {
  const [centers, setCenters] = useState<SurgeryCenter[]>([])
  const [allRooms, setAllRooms] = useState<Room[]>([])

  const [selectedCenterId, setSelectedCenterId] = useState<string>('')
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoDate())

  const [bookings, setBookings] = useState<Booking[]>([])

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const rowHeightPx = 56
  const pxPerMinute = rowHeightPx / 60

  const [slideClass, setSlideClass] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [fetchedCenters, fetchedRooms] = await Promise.all([
        ScheduleService.getSurgeryCenters(),
        ScheduleService.getRooms(),
      ])
      if (!mounted) return
      setCenters(fetchedCenters)
      setAllRooms(fetchedRooms)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const roomsForSelectedCenter = useMemo(() => {
    if (!selectedCenterId) return allRooms
    return allRooms.filter(r => r.centerId === selectedCenterId)
  }, [allRooms, selectedCenterId])

  const visibleRoomIds = useMemo(() => {
    if (selectedRoomIds.length > 0) return selectedRoomIds
    return roomsForSelectedCenter.map(r => r.id)
  }, [selectedRoomIds, roomsForSelectedCenter])

  const visibleRooms = useMemo(() => {
    const set = new Set(visibleRoomIds)
    return roomsForSelectedCenter.filter(r => set.has(r.id))
  }, [visibleRoomIds, roomsForSelectedCenter])

  const centerIdToName = useMemo(() => {
    const m = new Map<string, string>()
    centers.forEach(c => m.set(c.id, c.name))
    return m
  }, [centers])

  const centerIdToStyle = useMemo(() => {
    // deterministic style mapping per center id
    const palette = [
      { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600' },
      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-600' },
      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-600' },
      { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-600' },
      { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-600' },
    ] as const
    const icons = [Building2, Landmark, Home] as const
    const m = new Map<string, { bg: string, text: string, border: string, badge: string, Icon: ComponentType<{ className?: string }> }>()
    centers.forEach((c, idx) => {
      const style = palette[idx % palette.length]
      const Icon = icons[idx % icons.length]
      m.set(c.id, { ...style, Icon })
    })
    return m
  }, [centers])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const data = await ScheduleService.getBookingsByDate(
        selectedDate,
        selectedCenterId || undefined,
        visibleRoomIds,
      )
      if (!mounted) return
      setBookings(data)
    })()
    return () => {
      mounted = false
    }
  }, [selectedDate, selectedCenterId, visibleRoomIds])

  function toggleRoom(roomId: string) {
    setSelectedRoomIds(curr =>
      curr.includes(roomId) ? curr.filter(id => id !== roomId) : [...curr, roomId],
    )
  }

  function handleCenterChange(centerId: string) {
    setSelectedCenterId(centerId)
    const nextRooms = centerId ? allRooms.filter(r => r.centerId === centerId) : allRooms
    setSelectedRoomIds(nextRooms.map(r => r.id))
  }

  function selectAllRooms() {
    setSelectedRoomIds(roomsForSelectedCenter.map(r => r.id))
  }

  function clearRooms() {
    setSelectedRoomIds([])
  }

  function changeDate(nextIso: string) {
    const next = isoToDate(nextIso)
    const curr = isoToDate(selectedDate)
    setSlideClass(next.getTime() > curr.getTime() ? 'slide-in-left' : 'slide-in-right')
    setSelectedDate(nextIso)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <DatePicker value={selectedDate} onChange={changeDate} />
            <Button className='bg-blue-400 px-6 py-4 cursor-pointer rounded-2xl text-white' onClick={() => changeDate(getTodayIsoDate())}>Hoje</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Surgery Center</label>
          <select
            value={selectedCenterId}
            onChange={e => handleCenterChange(e.target.value)}
            className="border rounded px-3 py-2 min-w-48"
          >
            <option value="">All Centers</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="w-64">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Rooms</span>
            <div className="flex gap-2">
              <button onClick={selectAllRooms} className="text-xs text-blue-600 underline">Select all</button>
              <button onClick={clearRooms} className="text-xs text-gray-600 underline">Clear</button>
            </div>
          </div>
          <div className="mt-2 max-h-24 overflow-auto border rounded p-2 grid grid-cols-1 gap-2">
            {roomsForSelectedCenter.map(r => (
              <label key={r.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleRoomIds.includes(r.id)}
                  onChange={() => toggleRoom(r.id)}
                />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={`border rounded overflow-hidden ${slideClass}`} key={selectedDate}>
        <div className="grid" style={{ gridTemplateColumns: `120px 1fr` }}>
          <div className="bg-gray-50 border-r p-3 font-medium">Time</div>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="grid border-b" style={{ gridTemplateColumns: `repeat(${visibleRooms.length}, minmax(180px, 1fr))` }}>
                {visibleRooms.map(room => {
                  const style = centerIdToStyle.get(room.centerId)
                  const Icon = style?.Icon
                  return (
                    <div key={room.id} className={`p-3 border-r last:border-r-0 ${style?.bg ?? 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        {Icon ? <Icon className={`h-4 w-4 ${style?.text ?? 'text-gray-600'}`} /> : <span className={`inline-block h-2.5 w-2.5 rounded-full ${style?.badge ?? 'bg-gray-400'}`} />}
                        <div className="font-medium">{room.name}</div>
                      </div>
                      <div className={`text-xs ${style?.text ?? 'text-gray-500'}`}>{centerIdToName.get(room.centerId) ?? ''}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: `120px 1fr` }}>
          <div className="border-r">
            <div className="relative" style={{ height: `${rowHeightPx * 24}px` }}>
              {hours.map(h => (
                <div key={h} className="flex items-start border-b last:border-b-0" style={{ height: `${rowHeightPx}px` }}>
                  <div className="px-3 pt-1 text-sm text-gray-700">{formatHourLabel(h)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="relative" style={{ height: `${rowHeightPx * 24}px` }}>
                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateRows: `repeat(24, ${rowHeightPx}px)`, gridTemplateColumns: `repeat(${visibleRooms.length}, minmax(180px, 1fr))` }}
                >
                  {Array.from({ length: 24 * visibleRooms.length }, (_, idx) => (
                    <div key={idx} className="border-b border-r last:border-r-0" />
                  ))}
                </div>

                <div className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleRooms.length}, minmax(180px, 1fr))` }}>
                  {visibleRooms.map(room => {
                    const roomBookings = bookings.filter(b => b.roomId === room.id)
                    return (
                      <div key={room.id} className="relative border-r last:border-r-0">
                        {roomBookings.map(b => {
                          const startM = parseTimeToMinutes(b.start)
                          const endM = Math.max(startM + 15, parseTimeToMinutes(b.end))
                          const top = startM * pxPerMinute
                          const height = Math.max(20, (endM - startM) * pxPerMinute)
                          const style = centerIdToStyle.get(room.centerId)
                          return (
                            <div
                              key={b.id}
                              className={`absolute left-2 right-2 rounded text-white shadow ${style?.badge ?? 'bg-blue-500'}`}
                              style={{ top, height }}
                              title={`${b.title} (${b.start} - ${b.end})`}
                            >
                              <div className="text-xs font-semibold px-2 pt-1 truncate">{b.title}</div>
                              <div className="text-[11px] px-2 pb-1 opacity-90">{b.start} - {b.end}</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
