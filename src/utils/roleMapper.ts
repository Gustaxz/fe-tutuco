// Base role translation mapper (without contingency prefixes)
const baseRoleTranslations: Record<string, string> = {
  SURGEON: 'Cirurgião',
  ASSISTANT_SURGEON: 'Cirurgião Assistente',
  ANESTHESIOLOGIST: 'Anestesiologista',
  RESIDENT_DOCTOR: 'Médico Residente',

  SCRUB_NURSE: 'Enfermeiro Instrumentador',
  CIRCULATING_NURSE: 'Enfermeiro Circulante',
  RECOVERY_NURSE: 'Enfermeiro de Recuperação',

  SURGICAL_TECHNICIAN: 'Técnico Cirúrgico',
  RADIOLOGY_TECHNICIAN: 'Técnico de Radiologia',
  PERFUSIONIST: 'Perfusionista',
  STERILIZATION_TECH: 'Técnico de Esterilização',

  OPERATING_ROOM_COORDINATOR: 'Coordenador de Sala',
  SURGICAL_SCHEDULER: 'Agendador Cirúrgico',
  INVENTORY_CLERK: 'Auxiliar de Inventário',
}

export function translateRole(role: string): string {
  // Handle contingency prefixes by translating the base role and prefixing label
  if (role.startsWith('CONTINGENCY_A_')) {
    const base = role.replace('CONTINGENCY_A_', '')
    const translated = baseRoleTranslations[base] || base
    return `Contingência A - ${translated}`
  }
  if (role.startsWith('CONTINGENCY_B_')) {
    const base = role.replace('CONTINGENCY_B_', '')
    const translated = baseRoleTranslations[base] || base
    return `Contingência B - ${translated}`
  }

  return baseRoleTranslations[role] || role
}

export function translateRoles(roles: string[]): string {
  return roles.map(translateRole).join(', ')
}

