// src/dev/SchedulerPreview.tsx
import React, { useEffect, useState } from "react";
import Scheduler from "../components/Scheduler/Scheduler";
import { Button } from "@/components/ui/button";

export default function SchedulerPreview() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // --- MOCK do fetch para funcionar sem backend ---
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      // slots
      if (url.includes("/api/availability/slots")) {
        return new Response(
          JSON.stringify({
            slots: [
              {
                inicio: new Date().toISOString(),
                fim: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                medicoNome: "Dr. Marcos Mignon",
                salaNome: "Sala 13",
                salaId: 13,
              },
              {
                inicio: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                fim: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                medicoNome: "Dr. Pedro Maia",
                salaNome: "Sala 14",
                salaId: 14,
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // salas
      if (url.includes("/api/availability/salas")) {
        return new Response(
          JSON.stringify([{ id: 13, nome: "Sala 13" }, { id: 14, nome: "Sala 14" }]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // profissionais (lista medicos / busca funcionarios)
      if (url.includes("/api/availability/profissionais")) {
        return new Response(
          JSON.stringify([
            { id: 1, nome: "Dr. Marcos Mignon", interno: true, especialidades: [1], disponivel: true },
            { id: 2, nome: "Dr. Pedro Maia", interno: true, especialidades: [2], disponivel: true },
            { id: 3, nome: "Enf. Joana", interno: false, especialidades: [], disponivel: false, motivo: "Em outro procedimento" },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // recursos
      if (url.includes("/api/availability/recursos")) {
        return new Response(
          JSON.stringify([
            { id: 100, nome: "Torre de vídeo", externo: false, disponivel: true },
            { id: 101, nome: "Arco-C", externo: true, disponivel: false, motivo: "Reservado 09:00–11:00" },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // saldo de item
      if (/\/api\/estoque\/itens\/\d+\/disponivel/.test(url)) {
        return new Response(JSON.stringify({ disponivel: 25 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // validar
      if (url.includes("/api/procedimentos/validar")) {
        return new Response(JSON.stringify({ ok: true, conflitos: [], sugestoes: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // agendar
      if (url.includes("/api/procedimentos/agendar")) {
        return new Response(JSON.stringify({ procedimentoId: 98765 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // fallback para qualquer outra coisa
      return originalFetch(input, init);
    };

    return () => {
      // restaura fetch quando sair da tela
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <div className="min-h-screen p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Preview do Scheduler</h1>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      </div>

      {/* O modal já inicia aberto; clique no botão acima para reabrir depois de fechar */}
      <Scheduler open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
