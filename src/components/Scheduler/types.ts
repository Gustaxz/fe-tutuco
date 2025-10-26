export type Sala = { id: string; nome: string };

export type Medico = { id: string; nome: string };

export type CentroCirurgico = { id: string; nome: string };

export type Slot = {
  inicio: string; // ISO
  fim: string; // ISO
  score?: number;
  salaId?: string;
  responsavelId?: string;
  medicoNome?: string;
  salaNome?: string;
};

export interface Funcionario {
  id: number;
  nome: string;
  interno: boolean;
  disponivel: boolean;
  motivo?: string;
  especialidades: { id: number; nome: string }[];
}

/**
 * Recurso físico ou material — usado tanto para reutilizáveis
 * quanto para descartáveis (disposable = true)
 */
export interface Recurso {
  id: number;
  nome: string;
  externo: boolean; // true = externo, false = próprio
  disponivel: boolean;
  motivo?: string;
  grupoId?: number;

  // campos opcionais usados quando for um recurso descartável
  disposable?: boolean; // true → recurso descartável
  estoque?: number; // quantidade disponível em estoque
  unidade?: string; // unidade de medida (ex.: 'cx', 'pct', 'un')
}

export type ItemDescartavel = {
  id: number;
  nome: string;
  unidade: string;
  disponivel: number;
};

export interface AgendarPayload {
  pacienteId: number | null;
  responsavelProfissionalId: number | null;
  procedimentoNome?: string;
  salaId: number | null;
  inicio: string | null;
  fim: string | null;
  profissionaisIds: number[]; // inclui o responsável + participantes
  recursosIds: number[];
  itens: { itemTipoId: number; quantidade: number }[];
}
