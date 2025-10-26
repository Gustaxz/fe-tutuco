import type { SurgeryStatus } from '../api/ScheduleMock'

// Status translation mapper
export const statusMapper: Record<SurgeryStatus, string> = {
  'SCHEDULED': 'Agendada',
  'IN_PROGRESS': 'Em Andamento',
  'COMPLETED': 'Concluída',
  'CANCELED': 'Cancelada',
}

// Status color classes
export const statusColors: Record<SurgeryStatus, { bg: string, text: string, icon: string }> = {
  'SCHEDULED': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: '📅',
  },
  'IN_PROGRESS': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: '⚡',
  },
  'COMPLETED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: '✅',
  },
  'CANCELED': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: '❌',
  },
}

export function translateStatus(status: SurgeryStatus): string {
  return statusMapper[status] || status
}

export function getStatusColors(status: SurgeryStatus) {
  return statusColors[status] || statusColors.SCHEDULED
}

