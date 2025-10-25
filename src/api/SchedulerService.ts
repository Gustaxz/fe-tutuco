export type SurgeryCenter = {
  id: string
  name: string
}

export type Room = {
  id: string
  name: string
  centerId: string
}

export type Booking = {
  id: string
  title: string
  roomId: string
  date: string // YYYY-MM-DD
  start: string // HH:MM (24h)
  end: string // HH:MM (24h)
}

const centers: SurgeryCenter[] = [
  { id: 'c1', name: 'Center A' },
  { id: 'c2', name: 'Center B' },
]

const rooms: Room[] = [
  { id: 'r1', name: 'Room 1', centerId: 'c1' },
  { id: 'r2', name: 'Room 2', centerId: 'c1' },
  { id: 'r3', name: 'Room 3', centerId: 'c1' },
  { id: 'r4', name: 'Room 1', centerId: 'c2' },
  { id: 'r5', name: 'Room 2', centerId: 'c2' },
]

// Sample data for demonstration
const sampleDate = '2025-10-25'

const bookings: Booking[] = [
  { id: 'b1', title: 'Knee Arthroscopy', roomId: 'r1', date: sampleDate, start: '09:30', end: '11:00' },
  { id: 'b2', title: 'Hip Replacement', roomId: 'r2', date: sampleDate, start: '13:00', end: '15:30' },
  { id: 'b3', title: 'Appendectomy', roomId: 'r4', date: sampleDate, start: '08:00', end: '09:15' },
]

export const ScheduleService = {
  async getSurgeryCenters(): Promise<SurgeryCenter[]> {
    return centers
  },

  async getRooms(centerId?: string): Promise<Room[]> {
    if (!centerId) return rooms
    return rooms.filter(r => r.centerId === centerId)
  },

  async getBookingsByDate(date: string, centerId?: string, roomIds?: string[]): Promise<Booking[]> {
    let filtered = bookings.filter(b => b.date === date)
    if (centerId) {
      const roomIdsForCenter = new Set(rooms.filter(r => r.centerId === centerId).map(r => r.id))
      filtered = filtered.filter(b => roomIdsForCenter.has(b.roomId))
    }
    if (roomIds && roomIds.length > 0) {
      const set = new Set(roomIds)
      filtered = filtered.filter(b => set.has(b.roomId))
    }
    return filtered
  },
}