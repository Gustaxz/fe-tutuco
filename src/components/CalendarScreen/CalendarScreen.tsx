import { useEffect, useMemo, useState, type ComponentType, useCallback } from 'react'
import { type Booking } from '../../api/ScheduleMock'
import { ScheduleApiService, type Room, type SurgeryCenter } from '../../api/ScheduleApi'
import { DatePicker } from '../ui/date-picker'
import { Button } from '../ui/button'
import { MultiSelect, type MultiSelectOption } from '../ui/multi-select'
import { Home, RefreshCw, CalendarPlus } from 'lucide-react'
import { FaHeart, FaBrain, FaBone, FaVenus } from 'react-icons/fa'
import { GiKidneys } from 'react-icons/gi'
import { BookingDetailsModal } from '../BookingModal/BookingDetailsModal'
import { getStatusColors, translateStatus } from '../../utils/statusMapper'
import Scheduler from '../Scheduler/Scheduler'

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

type CenterStyle = { bg: string, text: string, border: string, badge: string, Icon: ComponentType<{ className?: string; color?: string }>, color?: string }

// Uses real centers from the mock service (ids: c1..c5) — extend as needed
const centerStylePresets: Record<string, CenterStyle> = {
    // c1: Centro cardíaco → heart
    c1: { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-rose-500', Icon: FaHeart, color: '#ef4444' },
    '21e960a9-4acd-4daf-b188-7b94b6ecf74b': { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-rose-500', Icon: FaHeart, color: '#ef4444' },
    // c2: Centro neurocirúrgico → brain
    c2: { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-violet-500', Icon: FaBrain, color: '#8b5cf6' },
    '20e960a9-4acd-4daf-b188-7b94b6ecf74b': { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-violet-500', Icon: FaBrain, color: '#8b5cf6' },
    // c3: Centro ortopédico → bone
    c3: { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-amber-500', Icon: FaBone, color: '#f59e0b' },
    '22e960a9-4acd-4daf-b188-7b94b6ecf74b': { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-amber-500', Icon: FaBone, color: '#f59e0b' },
    // c4: Centro urológico → kidneys
    c4: { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-emerald-500', Icon: GiKidneys, color: '#10b981' },
    // c5: Centro ginecológico → uterus
    c5: { bg: 'bg-gray-100', text: 'text-black', border: 'border-gray-300', badge: 'bg-pink-500', Icon: FaVenus, color: '#ec4899' },
}

function isoToDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
}

interface CalendarScreenProps {
    setShowCalendar: (value: React.SetStateAction<boolean>) => void
    showCalendar: boolean
}

export function CalendarScreen({ setShowCalendar, showCalendar }: CalendarScreenProps) {
    const [centers, setCenters] = useState<SurgeryCenter[]>([])
    const [allRooms, setAllRooms] = useState<Room[]>([])

    const [selectedCenterIds, setSelectedCenterIds] = useState<string[]>([])
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
    const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<string[]>([])
    const [professionals, setProfessionals] = useState<Array<{ id: string; name: string }>>([])
    const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoDate())

    const [bookings, setBookings] = useState<Booking[]>([])

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
    const rowHeightPx = 56
    const pxPerMinute = rowHeightPx / 60

    const [slideClass, setSlideClass] = useState<string>('')

    // Modal state
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showScheduler, setShowScheduler] = useState(false)

    // Refresh state
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const [fetchedCenters, fetchedRooms, fetchedPros] = await Promise.all([
                        ScheduleApiService.getSurgeryCenters(),
                        ScheduleApiService.getRooms(),
                        ScheduleApiService.getProfessionals({ available: false })
                    ])
                    if (!mounted) return
                    setCenters(fetchedCenters)
                    // Select all centers by default
                    setSelectedCenterIds(fetchedCenters.map(c => c.id))
                    setAllRooms(fetchedRooms)
                    setProfessionals(fetchedPros.map(p => ({ id: p.id, name: p.name })))
                } catch (error) {
                    console.error('Error loading data:', error)
                    // Could show an error message to the user here
                }
            })()
        return () => {
            mounted = false
        }
    }, [])

    const roomsForSelectedCenters = useMemo(() => {
        if (!selectedCenterIds || selectedCenterIds.length === 0) return allRooms
        const set = new Set(selectedCenterIds)
        return allRooms.filter(r => set.has(r.centerId))
    }, [allRooms, selectedCenterIds])

    const visibleRoomIds = useMemo(() => {
        if (selectedRoomIds.length > 0) return selectedRoomIds
        return roomsForSelectedCenters.map(r => r.id)
    }, [selectedRoomIds, roomsForSelectedCenters])

    const visibleRooms = useMemo(() => {
        const set = new Set(visibleRoomIds)
        return roomsForSelectedCenters.filter(r => set.has(r.id))
    }, [visibleRoomIds, roomsForSelectedCenters])

    const centerIdToName = useMemo(() => {
        const m = new Map<string, string>()
        centers.forEach(c => m.set(c.id, c.name))
        return m
    }, [centers])

    const professionalOptions: MultiSelectOption[] = useMemo(() => {
        return professionals.map(p => ({ value: p.id, label: p.name }))
    }, [professionals])

    const centerIdToStyle = useMemo(() => {
        const defaultStyle: CenterStyle = {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
            badge: 'bg-gray-400',
            Icon: Home,
        }
        const m = new Map<string, CenterStyle>()
        centers.forEach((c) => {
            const preset = centerStylePresets[c.id]
            m.set(c.id, preset ?? defaultStyle)
        })
        return m
    }, [centers])

    // Function to fetch bookings - can be called manually or by scheduler
    const fetchBookings = useCallback(async () => {
        try {
            setIsRefreshing(true)
            const data = await ScheduleApiService.getBookingsByDate(
                selectedDate,
                undefined,
                visibleRoomIds,
            )
            setBookings(data)
        } catch (error) {
            console.error('Error loading bookings:', error)
            setBookings([])
        } finally {
            setIsRefreshing(false)
        }
    }, [selectedDate, visibleRoomIds])

    // Fetch bookings when date or rooms change
    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchBookings()
        }, 10000) // 10 seconds

        return () => {
            clearInterval(intervalId)
        }
    }, [fetchBookings])

    // Keep selected rooms aligned with available rooms for selected centers
    useEffect(() => {
        const newRoomIds = roomsForSelectedCenters.map(r => r.id)
        const allowed = new Set(newRoomIds)
        setSelectedRoomIds(curr => {
            const filtered = curr.filter(id => allowed.has(id))
            if (filtered.length > 0) return filtered
            return newRoomIds
        })
    }, [roomsForSelectedCenters])

    // centers/rooms are managed via MultiSelect components

    function changeDate(nextIso: string) {
        const next = isoToDate(nextIso)
        const curr = isoToDate(selectedDate)
        setSlideClass(next.getTime() > curr.getTime() ? 'slide-in-left' : 'slide-in-right')
        setSelectedDate(nextIso)
    }

    function handleBookingClick(booking: Booking) {
        setSelectedBooking(booking)
        setShowBookingModal(true)
    }

    function closeBookingModal() {
        setShowBookingModal(false)
        setSelectedBooking(null)
    }

    const centerOptions: MultiSelectOption[] = useMemo(() => centers.map(c => ({ value: c.id, label: c.name })), [centers])
    const roomOptions: MultiSelectOption[] = useMemo(() => roomsForSelectedCenters.map(r => ({ value: r.id, label: r.name })), [roomsForSelectedCenters])

    return (
        <>
            <header className="bg-gray-50 p-4 flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <div className="nav-brand" onClick={() => setShowCalendar(false)} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-hospital"></i>
                        <span>MedCore</span>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Button className='border-blue-400 border-2 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-5 cursor-pointer rounded-2xl bg-transparent' onClick={() => changeDate(getTodayIsoDate())}>Hoje</Button>
                            <DatePicker value={selectedDate} onChange={changeDate} />
                        </div>
                    </div>
                </div>

                <ul className="nav-menu">
                    <li><a href="#" className={!showCalendar ? 'active' : ''} onClick={() => setShowCalendar(false)}><i className="fas fa-home"></i> Dashboard</a></li>
                    <li><a href="#" className={showCalendar ? 'active' : ''} onClick={() => setShowCalendar(true)}><i className="fas fa-calendar-plus"></i> Agenda</a></li>
                </ul>
            </header>
            <div className="p-4 space-y-4">

                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="min-w-80 w-md">
                            <span className="text-sm text-gray-600">Centros cirúrgicos</span>
                            <div className="mt-2">
                                <MultiSelect
                                    placeholder="Selecione os centros..."
                                    options={centerOptions}
                                    values={selectedCenterIds}
                                    onChange={setSelectedCenterIds}
                                />
                            </div>
                        </div>

                        <div className="min-w-80 w-md">
                            <span className="text-sm text-gray-600">Salas</span>
                            <div className="mt-2">
                                <MultiSelect
                                    placeholder="Selecione as salas..."
                                    options={roomOptions}
                                    values={visibleRoomIds}
                                    onChange={setSelectedRoomIds}
                                />
                            </div>
                        </div>

                        <div className="min-w-80 w-md">
                            <span className="text-sm text-gray-600">Profissionais</span>
                            <div className="mt-2">
                                <MultiSelect
                                    placeholder="Selecione profissionais..."
                                    options={professionalOptions}
                                    values={selectedProfessionalIds}
                                    onChange={setSelectedProfessionalIds}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-2">
                        <Button 
                            className='border-blue-500 border-2 text-blue-500 hover:bg-blue-500 hover:text-white px-6 py-3 cursor-pointer rounded-2xl bg-transparent flex items-center gap-2' 
                            onClick={() => setShowScheduler(true)}
                        >
                            <CalendarPlus className="h-5 w-5" />
                            Nova Cirurgia
                        </Button>
                        <Button 
                            className='border-green-400 border-2 text-green-400 hover:bg-green-400 hover:text-white px-6 py-3 cursor-pointer rounded-2xl bg-transparent flex items-center gap-2' 
                            onClick={() => fetchBookings()}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                    </div>
                </div>

                <div className={`rounded-2xl overflow-hidden ${slideClass}`} key={selectedDate}>
                    <div className="grid" style={{ gridTemplateColumns: `120px 1fr` }}>
                        <div className="p-3 text-gray-600">Horários</div>
                        <div className="overflow-x-auto">
                            <div className="">
                                <div className="grid border-b border-gray-300" style={{ gridTemplateColumns: `repeat(${visibleRooms.length}, minmax(180px, 1fr))` }}>
                                    {visibleRooms.map(room => {
                                        const style = centerIdToStyle.get(room.centerId)
                                        const Icon = style?.Icon
                                        return (
                                            <div key={room.id} className={`p-3 border-r border-gray-300 last:border-r-0 bg-gray-100`}>
                                                <div className="flex items-center gap-2">
                                                    {Icon ? <Icon className="h-4 w-4" color={style?.color} /> : <span className={`inline-block h-2.5 w-2.5 rounded-full ${style?.badge ?? 'bg-gray-400'}`} />}
                                                    <div className="font-medium">{room.name}</div>
                                                </div>
                                                <div className={`text-xs text-black`}>{centerIdToName.get(room.centerId) ?? ''}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: `120px 1fr` }}>
                        <div className="">
                            <div className="relative" style={{ height: `${rowHeightPx * 24}px` }}>
                                {hours.map(h => (
                                    <div key={h} className="flex items-start border-b border-gray-300 last:border-b-0" style={{ height: `${rowHeightPx}px` }}>
                                        <div className="px-3 text-xs text-gray-700 font-semibold">{formatHourLabel(h)}</div>
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
                                        {Array.from({ length: 24 * visibleRooms.length }, (_, idx) => {
                                            const cols = visibleRooms.length
                                            const isLastCol = cols > 0 ? (idx % cols) === cols - 1 : false
                                            const isLastRow = Math.floor(idx / (cols || 1)) === 23
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`border-gray-300 ${isLastCol ? '' : 'border-r'} ${isLastRow ? '' : 'border-b'}`}
                                                />
                                            )
                                        })}
                                    </div>

                                    <div className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleRooms.length}, minmax(180px, 1fr))` }}>
                                        {visibleRooms.map(room => {
                                            const roomBookings = bookings
                                                .filter(b => b.roomId === room.id)
                                                .filter(b => selectedProfessionalIds.length === 0
                                                    ? true
                                                    : (b.team ?? []).some(m => selectedProfessionalIds.includes(m.id)))
                                            return (
                                                <div key={room.id} className="relative border-r border-gray-300 last:border-r-0">
                                                    {roomBookings.map(b => {
                                                        const startM = parseTimeToMinutes(b.start)
                                                        const endM = Math.max(startM + 15, parseTimeToMinutes(b.end))
                                                        const top = startM * pxPerMinute
                                                        const height = Math.max(20, (endM - startM) * pxPerMinute)
                                                        const style = centerIdToStyle.get(room.centerId)
                                                        const statusStyle = getStatusColors(b.status)
                                                        return (
                                                            <div
                                                                key={b.id}
                                                                onClick={() => handleBookingClick(b)}
                                                                className={`absolute left-2 right-2 rounded text-white shadow cursor-pointer hover:shadow-lg transition-shadow ${style?.badge ?? 'bg-blue-500'}`}
                                                                style={{ top, height }}
                                                                title={`${b.title} (${b.start} - ${b.end})`}
                                                            >
                                                                <div className="px-2 pt-1 space-y-1">
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <div className="text-xs font-semibold truncate flex-1">{b.title}</div>
                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}>
                                                                            {statusStyle.icon}  {translateStatus(b.status)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[11px] opacity-90">{b.start} - {b.end}</div>
                                                        
                                                                </div>
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

            <BookingDetailsModal
                isOpen={showBookingModal}
                onClose={closeBookingModal}
                booking={selectedBooking}
                room={selectedBooking ? visibleRooms.find(r => r.id === selectedBooking.roomId) ?? null : null}
                centerName={selectedBooking ? centerIdToName.get(visibleRooms.find(r => r.id === selectedBooking.roomId)?.centerId ?? '') ?? '' : ''}
                onStatusUpdate={fetchBookings}
            />

            <Scheduler
                open={showScheduler}
                onClose={() => {
                    setShowScheduler(false)
                    // Refresh bookings after scheduling
                    fetchBookings()
                }}
            />
        </>
    )
}
