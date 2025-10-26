const API_BASE_URL = 'https://project.freshroots.com.br'

export interface Professional {
  id: string
  name: string
  role: string[]
  status: 'disponivel' | 'cirurgia' | 'consulta'
  sala?: string
}

// Role mapping from enum to Portuguese
const roleMapping: Record<string, string> = {
  SURGEON: 'Cirurgião',
  ASSISTANT_SURGEON: 'Cirurgião auxiliar',
  ANESTHESIOLOGIST: 'Anestesiologista',
  RESIDENT_DOCTOR: 'Médico residente',
  
  SCRUB_NURSE: 'Enfermeiro instrumentador',
  CIRCULATING_NURSE: 'Enfermeiro circulante',
  RECOVERY_NURSE: 'Enfermeiro de recuperação',
  
  SURGICAL_TECHNICIAN: 'Técnico cirúrgico',
  RADIOLOGY_TECHNICIAN: 'Técnico em radiologia',
  PERFUSIONIST: 'Perfusionista',
  STERILIZATION_TECH: 'Técnico em esterilização',
  
  OPERATING_ROOM_COORDINATOR: 'Coordenador de sala cirúrgica',
  SURGICAL_SCHEDULER: 'Agendador cirúrgico',
  INVENTORY_CLERK: 'Auxiliar de estoque'
}

// mapRole kept for future use; avoid unused warnings by exporting
export function mapRole(role: string): string {
  return roleMapping[role] || role
}

// Dashboard API Service
export const DashboardApiService = {
  async getProfessionals(): Promise<Professional[]> {
    try {
      const url = `${API_BASE_URL}/professionals`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform API response to Professional format
      return data.map((prof: any) => ({
        id: prof.id || Math.random().toString(),
        name: prof.name || 'Nome não informado',
        role: prof.role,
        status: prof.status || 'disponivel',
        sala: prof.room || prof.sala
      }))
    } catch (error) {
      console.error('Error fetching professionals:', error)
      // Return mock data with enum roles
      return [
        { id: '1', name: 'Dr. Silva', role: ['SURGEON'], status: 'disponivel', sala: 'C01' },
        { id: '2', name: 'Dr. Costa', role: ['ASSISTANT_SURGEON'], status: 'cirurgia', sala: 'C02' },
        { id: '3', name: 'Dr. Santos', role: ['ANESTHESIOLOGIST'], status: 'disponivel', sala: 'C03' },
        { id: '4', name: 'Dr. Lima', role: ['RESIDENT_DOCTOR'], status: 'consulta' },
        { id: '5', name: 'Enf. Ana', role: ['SCRUB_NURSE'], status: 'cirurgia', sala: 'C01' },
        { id: '6', name: 'Enf. João', role: ['CIRCULATING_NURSE'], status: 'disponivel', sala: 'C02' },
        { id: '7', name: 'Enf. Maria', role: ['RECOVERY_NURSE'], status: 'disponivel' },
        { id: '8', name: 'Tec. Pedro', role: ['SURGICAL_TECHNICIAN'], status: 'disponivel', sala: 'C03' },
        { id: '9', name: 'Tec. Carla', role: ['RADIOLOGY_TECHNICIAN'], status: 'consulta' },
        { id: '10', name: 'José Perfusão', role: ['PERFUSIONIST'], status: 'disponivel' },
        { id: '11', name: 'Tec. Bruno', role: ['STERILIZATION_TECH'], status: 'disponivel' },
        { id: '12', name: 'Coord. Laura', role: ['OPERATING_ROOM_COORDINATOR'], status: 'disponivel' },
        { id: '13', name: 'Agenda. Paulo', role: ['SURGICAL_SCHEDULER'], status: 'disponivel' },
        { id: '14', name: 'Aux. Rita', role: ['INVENTORY_CLERK'], status: 'disponivel' }
      ]
    }
  },
}