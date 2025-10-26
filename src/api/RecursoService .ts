import type { Recurso } from "@/components/Scheduler/types"; 

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class RecursoService {
  static async search(params: {
    inicio: string;
    fim: string;
    externo?: boolean;
    grupoId?: number;
    nome?: string;
    disposable?: boolean; // 👈 novo filtro
  }): Promise<Recurso[]> {
    console.log("🔍 Mock RecursoService.search params:", params);
    await delay(500);

    // mock: mesmos "recursos", mas alguns têm disposable=true e estoque/unidade
    const recursos: Recurso[] = [
      // Reutilizáveis
      { id: 1, nome: "Mesa Cirúrgica A1", externo: false, disponivel: true, grupoId: 12 },
      { id: 2, nome: "Monitor Cardíaco", externo: false, disponivel: false, motivo: "Em uso na sala 3", grupoId: 10 },
      { id: 3, nome: "Ultrassom Portátil", externo: true, disponivel: true, grupoId: 13 },

      // Descartáveis (disposable = true) → com estoque/unidade
      { id: 101, nome: "Gaze Estéril 10x10", externo: false, disponivel: true, grupoId: 21, disposable: true, estoque: 250, unidade: "pct" },
      { id: 102, nome: "Luvas Cirúrgicas M", externo: false, disponivel: true, grupoId: 22, disposable: true, estoque: 80, unidade: "cx" },
      { id: 103, nome: "Soro Fisiológico 500ml", externo: true, disponivel: true, grupoId: 23, disposable: true, estoque: 0, unidade: "un" },
    ];

    let list = recursos;

    if (params.disposable !== undefined) {
      list = list.filter((r) => !!r.disposable === params.disposable);
    }

    if (params.externo !== undefined) {
      list = list.filter((r) => r.externo === params.externo);
    }

    if (params.grupoId) {
      list = list.filter((r) => r.grupoId === params.grupoId);
    }

    if (params.nome?.trim()) {
      const q = params.nome.toLowerCase();
      list = list.filter((r) => r.nome.toLowerCase().includes(q));
    }

    // ordena por nome
    return list.sort((a, b) => a.nome.localeCompare(b.nome));
  }
}
