const baseUrl = "/api";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --- Availability (Etapa 1)
export async function getSlots(params: {
  start: string; // ISO janela início
  end: string; // ISO janela fim
  duracaoMin: number;
  salaId?: number;
  profissionalId?: number;
  centroId: number;
}) {
  const q = new URLSearchParams({
    start: params.start,
    end: params.end,
    duracaoMin: String(params.duracaoMin),
    salaId: params.salaId ? String(params.salaId) : "",
    profissionalId: params.profissionalId ? String(params.profissionalId) : "",
    centroId: String(params.centroId),
  }).toString();
  return fetchJSON<{ slots: import("../components/Scheduler/types").Slot[] }>(
    `${baseUrl}/availability/slots?${q}`
  );
}

export async function getSalas(centroId: number) {
  return fetchJSON<import("../components/Scheduler/types").Sala[]>(
    `${baseUrl}/availability/salas?centroId=${centroId}`
  );
}

export async function getMedicos(params: {
  especialidadeIds?: number[];
  nome?: string;
}) {
  const q = new URLSearchParams({ nome: params.nome ?? "" }).toString();
  return fetchJSON<import("../components/Scheduler/types").Medico[]>(
    `${baseUrl}/availability/profissionais?${q}`
  );
}

// --- Funcionários (Etapa 2)
export async function searchFuncionarios(params: {
  inicio: string; // ISO
  fim: string; // ISO
  interno: boolean; // obrigatório
  especialidadeId?: number;
  nome?: string;
}) {
  const q = new URLSearchParams({
    inicio: params.inicio,
    fim: params.fim,
    interno: String(params.interno),
    especialidadeId: params.especialidadeId
      ? String(params.especialidadeId)
      : "",
    nome: params.nome ?? "",
  }).toString();
  return fetchJSON<import("../components/Scheduler/types").Funcionario[]>(
    `${baseUrl}/availability/profissionais?${q}`
  );
}

// --- Recursos reutilizáveis (Etapa 3)
export async function searchRecursos(params: {
  inicio: string;
  fim: string;
  grupoId?: number;
  externo?: boolean;
}) {
  const q = new URLSearchParams({
    inicio: params.inicio,
    fim: params.fim,
    grupoId: params.grupoId ? String(params.grupoId) : "",
    externo: params.externo != null ? String(params.externo) : "",
  }).toString();
  return fetchJSON<import("../components/Scheduler/types").Recurso[]>(
    `${baseUrl}/availability/recursos?${q}`
  );
}

// --- Itens descartáveis (Etapa 3)
export async function getItemSaldo(itemTipoId: number) {
  return fetchJSON<{ disponivel: number }>(
    `${baseUrl}/estoque/itens/${itemTipoId}/disponivel`
  );
}

// --- Validação & Agendamento (Etapas 2/3)
export async function validar(
  body: import("../components/Scheduler/types").AgendarPayload
) {
  return fetchJSON<{
    ok: boolean;
    conflitos?: unknown;
    sugestoes?: { inicio: string; fim: string }[];
  }>(`${baseUrl}/procedimentos/validar`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function agendar(
  body: import("../components/Scheduler/types").AgendarPayload
) {
  return fetchJSON<{ procedimentoId: number }>(
    `${baseUrl}/procedimentos/agendar`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}
