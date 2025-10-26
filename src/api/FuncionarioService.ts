import type { Funcionario } from "../types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class FuncionarioService {
  static async search(params: {
    inicio: string;
    fim: string;
    interno?: boolean;
    especialidadeId?: number;
    nome?: string;
  }): Promise<Funcionario[]> {
    console.log("🔍 Mock FuncionarioService.search params:", params);

    await delay(800); // simula tempo de rede

    const funcionarios: Funcionario[] = [
      {
        id: 1,
        nome: "Dr. Marcos Mignoni",
        interno: true,
        disponivel: true,
        especialidades: [
          { id: 1, nome: "Anestesia" },
          { id: 3, nome: "Ortopedia" },
        ],
      },
      {
        id: 2,
        nome: "Dra. Fernanda Lopes",
        interno: true,
        disponivel: false,
        motivo: "Em procedimento até 14h",
        especialidades: [{ id: 2, nome: "Cardiologia" }],
      },
      {
        id: 3,
        nome: "Dr. Pedro Maia",
        interno: false,
        disponivel: true,
        especialidades: [
          { id: 1, nome: "Anestesia" },
          { id: 2, nome: "Cardiologia" },
        ],
      },
      {
        id: 4,
        nome: "Dra. Julia Ribeiro",
        interno: false,
        disponivel: true,
        especialidades: [{ id: 3, nome: "Ortopedia" }],
      },
      {
        id: 5,
        nome: "Dr. Rafael Costa",
        interno: true,
        disponivel: false,
        motivo: "Férias até dia 30",
        especialidades: [
          { id: 1, nome: "Anestesia" },
          { id: 2, nome: "Cardiologia" },
        ],
      },
    ];

    let filtrados = funcionarios;

    if (params.interno !== undefined) {
      filtrados = filtrados.filter((f) => f.interno === params.interno);
    }

    if (params.nome) {
      filtrados = filtrados.filter((f) =>
        f.nome.toLowerCase().includes(params.nome.toLowerCase())
      );
    }

    if (params.especialidadeId) {
      filtrados = filtrados.filter((f) =>
        f.especialidades.some((e) => e.id === params.especialidadeId)
      );
    }

    return filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
  }
}
