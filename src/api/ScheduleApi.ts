import axios from 'axios'
import type { Booking, TeamMember, SurgeryStatus } from './ScheduleMock'

const API_BASE_URL = 'https://project.freshroots.com.br'
const HOSPITAL_ID = ''

// API Response Types
interface ApiRoom {
  id: string
  id_surgical_center: string
  name: string
  type: string
  createdAt: string
  updatedAt: string
}

interface ApiSurgeryCenter {
  id: string
  id_hospital: string
  responsible_name: string
  name: string
  local: string
  type_surigical_center: string
  createdAt: string
  updatedAt: string
}

interface ApiTeamMember {
  id: string
  schedule_surgery_id: string
  hospital_id: string
  name: string
  role: string[]
  type: 'OWNED' | 'THIRD_PARTY'
  createdAt: string
  updatedAt: string
  ocupation_id: string
}

interface ApiOcupation {
  id: string
  id_surgical_center: string
  id_room: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface ApiScheduleSurgery {
  id: string
  id_ocupation: string
  id_hospital: string
  date_start: string
  date_end: string
  time_additional: number
  createdAt: string
  updatedAt: string
  ocupation: ApiOcupation
  team: ApiTeamMember[]
  equipment: unknown[]
}

// Application Types (matching the existing structure)
export interface SurgeryCenter {
  id: string
  name: string
  responsibleName?: string
  location?: string
  type?: string
}

export interface Room {
  id: string
  name: string
  centerId: string
  type?: string
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API Service
export const ScheduleApiService = {
  async getSurgeryCenters(): Promise<SurgeryCenter[]> {
    try {
      const response = await api.get<ApiSurgeryCenter[]>('/surgical-center')
      // Transform API response to match application structure
      return response.data.map(center => ({
        id: center.id,
        name: center.name,
        responsibleName: center.responsible_name,
        location: center.local,
        type: center.type_surigical_center,
      }))
    } catch (error) {
      console.error('Error fetching surgery centers:', error)
      throw new Error('Failed to fetch surgery centers')
    }
  },

  async getRooms(centerId?: string): Promise<Room[]> {
    try {
      const response = await api.get<ApiRoom[]>('/room')
      // Transform API response to match application structure
      const rooms = response.data.map(room => ({
        id: room.id,
        name: room.name,
        centerId: room.id_surgical_center,
        type: room.type,
      }))
      
      // Filter by centerId if provided
      if (centerId) {
        return rooms.filter(r => r.centerId === centerId)
      }
      
      return rooms
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw new Error('Failed to fetch rooms')
    }
  },

  async getBookingsByDate(date: string, centerId?: string, roomIds?: string[]): Promise<Booking[]> {
    try {
      const response = await api.get<ApiScheduleSurgery[]>('/schedule-surgery', {
        params: {
          hospital_id: HOSPITAL_ID,
        },
      })
      // Transform API response to Booking format
      let bookings = response.data.map(surgery => {
        // Find the surgeon from the team
        const surgeon = surgery.team.find(member => member.role.includes('SURGEON'))
        const doctorName = surgeon?.name || 'Médico não definido'

        // Convert ISO dates to date and time strings
        const startDate = new Date(surgery.date_start)
        const endDate = new Date(surgery.date_end)
        
        const dateStr = startDate.toISOString().split('T')[0] // YYYY-MM-DD
        const startTime = startDate.toTimeString().substring(0, 5) // HH:MM
        const endTime = endDate.toTimeString().substring(0, 5) // HH:MM

        // Determine urgency based on time_additional or default to medium
        let urgency: 'low' | 'medium' | 'high' | 'emergency' = 'medium'
        if (surgery.time_additional > 0) {
          urgency = 'high'
        }

        // Transform team members with mock availability status
        const team: TeamMember[] = surgery.team.map(member => ({
          id: member.id,
          name: member.name,
          roles: member.role,
          type: member.type,
          available: Math.random() > 0.2, // Mock: 80% chance of being available
        }))

        // Mock status based on current time comparison (will be from API later)
        const now = new Date()
        let status: SurgeryStatus = 'SCHEDULED'
        if (startDate < now && endDate > now) {
          status = 'IN_PROGRESS'
        } else if (endDate < now) {
          status = 'COMPLETED'
        }

        
        
        return {
            id: surgery.id,
            title: `Cirurgia - ${surgery.ocupation.id_room}`,
            roomId: surgery.ocupation.id_room,
            date: dateStr,
            start: startTime,
            end: endTime,
            doctorName,
            patientName: 'Paciente', // Not provided by API, placeholder
            surgeryType: 'Cirurgia Geral', // Not provided by API, placeholder
            urgency,
            status,
            team,
        } as Booking
    })
    
    // Filter by date
    console.log("respona", bookings)
    bookings = bookings.filter(b => b.date === date)

      // Filter by center if provided
      if (centerId) {
        const roomsInCenter = await this.getRooms(centerId)
        const roomIdsInCenter = new Set(roomsInCenter.map(r => r.id))
        bookings = bookings.filter(b => roomIdsInCenter.has(b.roomId))
      }

      // Filter by room IDs if provided
      if (roomIds && roomIds.length > 0) {
        const roomIdSet = new Set(roomIds)
        bookings = bookings.filter(b => roomIdSet.has(b.roomId))
      }

      return bookings
    } catch (error) {
      console.error('Error fetching schedule surgeries:', error)
      // Return empty array on error instead of throwing
      return []
    }
  },
}

