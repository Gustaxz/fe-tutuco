import axios from 'axios'
import type { Booking, TeamMember, SurgeryStatus } from './ScheduleMock'

const API_BASE_URL = 'https://project.freshroots.com.br'
const HOSPITAL_ID = '10e960a9-4acd-4daf-b188-7b94b6ecf74b'

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
  ocupations_check: string[]
  patient: ApiPatient
  updatedAt: string
  deletedAt: string | null
}

interface ApiProfessional {
  id: string
  name: string
  role: string[]
  email?: string
  phone?: string
  type?: string
}

interface ApiEquipment {
  id: string
  id_room: string
  id_hospital: string
  id_group_equipment: string
  name: string
  type: 'OWNED' | 'THIRD_PARTY'
  disposable: boolean
}

interface ApiPatient {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface ApiScheduleSurgery {
  id: string
  id_ocupation: string
  id_hospital: string
  date_start: string
  status: SurgeryStatus
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

  async getProfessionalsByRole(role: string): Promise<Array<{ id: string; name: string; roles: string[] }>> {
    try {
      const response = await api.get<ApiProfessional[]>('/professionals', {
        params: { roles: role },
      })
      return response.data.map(p => ({ id: p.id, name: p.name, roles: p.role }))
    } catch (error) {
      console.error('Error fetching professionals by role:', error)
      return []
    }
  },

  async getProfessionals(params: { available?: boolean; roles?: string; type?: 'OWNED' | 'THIRD_PARTY' }): Promise<Array<{ id: string; name: string; roles: string[]; type?: string }>> {
    try {
      const response = await api.get<ApiProfessional[]>('/professionals', {
        params: {
          ...(params.available !== undefined ? { available: params.available } : {}),
          ...(params.roles ? { roles: params.roles } : {}),
          ...(params.type ? { type: params.type } : {}),
        },
      })
      return response.data.map(p => ({ id: p.id, name: p.name, roles: p.role, type: p.type }))
    } catch (error) {
      console.error('Error fetching professionals:', error)
      return []
    }
  },
  

  async getEquipment(params?: { type?: 'OWNED' | 'THIRD_PARTY' }): Promise<Array<{
    id: string
    name: string
    type: 'OWNED' | 'THIRD_PARTY'
    disposable: boolean
  }>> {
    try {
      const response = await api.get<ApiEquipment[]>('/equipment', {
        params: {
          ...(params?.type ? { type: params.type } : {}),
        },
      })

      return response.data.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        disposable: e.disposable,
      }))
    } catch (error) {
      console.error('Error fetching equipment:', error)
      return []
    }
  },

  async getBookingsByDate(date: string, centerId?: string, roomIds?: string[]): Promise<Booking[]> {
    try {
      const response = await api.get<ApiScheduleSurgery[]>('/schedule-surgery', {
        
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
          available: surgery.ocupation.ocupations_check.includes(member.id), // Mock: 80% chance of being available
        }))
        
        
        return {
            id: surgery.id,
            title: `Cirurgia - ${surgery.ocupation.patient.name}`,
            roomId: surgery.ocupation.id_room,
            date: dateStr,
            start: startTime,
            end: endTime,
            doctorName,
            patientName: surgery.ocupation.patient.name, // Not provided by API, placeholder
            surgeryType: 'Cirurgia Geral', // Not provided by API, placeholder
            urgency,
            status: surgery.status,
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

  async updateSurgeryStatus(scheduleSurgeryId: string, status: SurgeryStatus): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/schedule-surgery/${scheduleSurgeryId}`, {
        status,
      })
    } catch (error) {
      console.error('Error updating surgery status:', error)
      throw error
    }
  },

  async getAvailability(params: {
    surgical_center_id: string
    hospital_id?: string
    room_id?: string
    room_type?: string
    date_from: string
    date_to: string
    duration_minutes?: number
    required_professionals?: string[]
    required_roles?: string[]
    required_equipment?: string[]
    required_equipment_groups?: string[]
    max_suggestions?: number
    buffer_time?: number
  }): Promise<{
    slots: Array<{
      start_time: string
      end_time: string
      room: {
        id: string
        name: string
        type: string
        surgical_center_id: string
      }
      available_professionals: Array<{
        id: string
        name: string
        role: string[]
        email?: string
        phone?: string
      }>
      available_equipment: Array<{
        id: string
        name: string
        type: string
        group_name?: string
      }>
      conflicts: any[]
      score: number
    }>
    filters_applied: any
    summary: {
      total_slots_found: number
      average_score: number
    }
  }> {
    try {
      const response = await api.post('/schedule-surgery/availability', {
        surgical_center_id: params.surgical_center_id,
        hospital_id: params.hospital_id || HOSPITAL_ID,
        ...(params.room_id && { room_id: params.room_id }),
        ...(params.room_type && { room_type: params.room_type }),
        date_from: params.date_from,
        date_to: params.date_to,
        ...(params.duration_minutes && { duration_minutes: params.duration_minutes }),
        ...(params.required_professionals && { required_professionals: params.required_professionals }),
        ...(params.required_roles && { required_roles: params.required_roles }),
        ...(params.required_equipment && { required_equipment: params.required_equipment }),
        ...(params.required_equipment_groups && { required_equipment_groups: params.required_equipment_groups }),
        max_suggestions: params.max_suggestions ?? 5,
        buffer_time: params.buffer_time ?? 30,
      })
      return response.data
    } catch (error) {
      console.error('Error fetching availability:', error)
      throw error
    }
  },

  async createScheduleSurgery(payload: {
    id_ocupation: string | null
    id_room: string
    id_hospital: string
    date_start: string
    date_end: string
    time_additional: number
    teamIds: string[]
    equipmentIds: string[]
    id_patient: string
  }): Promise<{ id: string }> {
    try {
      const response = await api.post('/schedule-surgery', {
        ...payload,
        id_patient: undefined,
        cpf_patient: payload.id_patient,
        id_hospital: HOSPITAL_ID,
      })
      return response.data
    } catch (error) {
      console.error('Error creating schedule surgery:', error)
      throw error
    }
  },
}
