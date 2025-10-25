// Role translation mapper
export const roleMapper: Record<string, string> = {
  'SURGEON': 'Cirurgião',
  'OPERATING_ROOM_COORDINATOR': 'Coordenador de Sala',
  'SCRUB_NURSE': 'Enfermeiro Instrumentador',
  'CIRCULATING_NURSE': 'Enfermeiro Circulante',
  'ANESTHESIOLOGIST': 'Anestesiologista',
  'SURGICAL_TECHNICIAN': 'Técnico Cirúrgico',
  'INVENTORY_CLERK': 'Auxiliar de Inventário',
  'ASSISTANT_SURGEON': 'Cirurgião Assistente',
  'NURSE_ANESTHETIST': 'Enfermeiro Anestesista',
  'RADIOLOGIST': 'Radiologista',
}

export function translateRole(role: string): string {
  return roleMapper[role] || role
}

export function translateRoles(roles: string[]): string {
  return roles.map(role => translateRole(role)).join(', ')
}

