export type SurgeryCenter = {
  id: string
  name: string
}

export type Room = {
  id: string
  name: string
  centerId: string
}

export type TeamMember = {
  id: string
  name: string
  roles: string[]
  type: 'OWNED' | 'THIRD_PARTY'
  available?: boolean
}

export type Booking = {
  id: string
  title: string
  roomId: string
  date: string // YYYY-MM-DD
  start: string // HH:MM (24h)
  end: string // HH:MM (24h)
  doctorName: string
  patientName: string
  surgeryType: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  team?: TeamMember[]
}

const centers: SurgeryCenter[] = [
  { id: 'c1', name: 'Centro cardíaco' },
  { id: 'c2', name: 'Centro neurocirúrgico' },
  { id: 'c3', name: 'Centro ortopédico' },
  { id: 'c4', name: 'Centro urológico' },
  { id: 'c5', name: 'Centro ginecológico' },
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
  // Centro Cardíaco - Room 1
  { 
    id: 'b1', 
    title: 'Revascularização Miocárdica', 
    roomId: 'r1', 
    date: sampleDate, 
    start: '08:00', 
    end: '12:00',
    doctorName: 'Dr. João Silva',
    patientName: 'Maria Santos',
    surgeryType: 'Revascularização do Miocárdio',
    urgency: 'high'
  },
  { 
    id: 'b2', 
    title: 'Troca Valvar Aórtica', 
    roomId: 'r1', 
    date: sampleDate, 
    start: '14:00', 
    end: '18:00',
    doctorName: 'Dra. Ana Costa',
    patientName: 'José Oliveira',
    surgeryType: 'Substituição de Válvula Aórtica',
    urgency: 'high'
  },
  
  // Centro Cardíaco - Room 2
  { 
    id: 'b3', 
    title: 'Angioplastia', 
    roomId: 'r2', 
    date: sampleDate, 
    start: '09:00', 
    end: '11:00',
    doctorName: 'Dr. Roberto Cardoso',
    patientName: 'Ana Paula Martins',
    surgeryType: 'Angioplastia Coronariana',
    urgency: 'emergency'
  },
  { 
    id: 'b4', 
    title: 'Cateterismo', 
    roomId: 'r2', 
    date: sampleDate, 
    start: '15:00', 
    end: '16:30',
    doctorName: 'Dr. Roberto Cardoso',
    patientName: 'Fernando Silva',
    surgeryType: 'Cateterismo Cardíaco',
    urgency: 'medium'
  },

  // Centro Cardíaco - Room 3
  { 
    id: 'b5', 
    title: 'Marcapasso', 
    roomId: 'r3', 
    date: sampleDate, 
    start: '10:00', 
    end: '12:00',
    doctorName: 'Dra. Beatriz Coração',
    patientName: 'Antônio Rodrigues',
    surgeryType: 'Implante de Marcapasso',
    urgency: 'medium'
  },
  
  // Centro Neurocirúrgico - Room 1
  { 
    id: 'b6', 
    title: 'Craniotomia', 
    roomId: 'r4', 
    date: sampleDate, 
    start: '07:00', 
    end: '13:00',
    doctorName: 'Dr. Pedro Lima',
    patientName: 'Carlos Ferreira',
    surgeryType: 'Craniotomia para Tumor',
    urgency: 'high'
  },
  { 
    id: 'b7', 
    title: 'Cirurgia de Coluna', 
    roomId: 'r4', 
    date: sampleDate, 
    start: '15:00', 
    end: '17:30',
    doctorName: 'Dra. Lucia Neuro',
    patientName: 'Ricardo Almeida',
    surgeryType: 'Descompressão Medular',
    urgency: 'medium'
  },

  // Centro Neurocirúrgico - Room 2
  { 
    id: 'b8', 
    title: 'Aneurisma Cerebral', 
    roomId: 'r5', 
    date: sampleDate, 
    start: '08:30', 
    end: '14:00',
    doctorName: 'Dr. Marcos Neuro',
    patientName: 'Paula Mendes',
    surgeryType: 'Clipagem de Aneurisma',
    urgency: 'emergency'
  },
  { 
    id: 'b9', 
    title: 'Hérnia de Disco', 
    roomId: 'r5', 
    date: sampleDate, 
    start: '16:00', 
    end: '18:00',
    doctorName: 'Dr. Marcos Neuro',
    patientName: 'Juliana Costa',
    surgeryType: 'Microdiscectomia',
    urgency: 'low'
  },
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