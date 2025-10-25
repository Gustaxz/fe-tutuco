export type Sala = { id: number; nome: string };
export type Medico = { id: number; nome: string };
export type CentroCirurgico = { id: number; nome: string };
export type Slot = {
  inicio: string; // ISO
  fim: string; // ISO
  score?: number;
  salaId?: number;
  responsavelId?: number;
  medicoNome?: string;
  salaNome?: string;
};

export type Funcionario = {
  id: number;
  nome: string;
  interno: boolean;
  especialidades: number[];
  disponivel: boolean;
  motivo?: string;
};

export type Recurso = {
  id: number;
  nome: string;
  externo: boolean; // true = externo, false = próprio
  disponivel: boolean;
  motivo?: string;
  grupoId?: number;
};

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