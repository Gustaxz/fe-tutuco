/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Loader2, RotateCcw } from "lucide-react";
import { RecursoService } from "@/api/RecursoService ";
import type { Recurso } from "../types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (
    items: {
      itemTipoId: number;
      nome: string;
      unidade: string;
      quantidade: number;
      disponivel: number;
    }[]
  ) => void;
  janela: { inicio: string; fim: string };
  grupos?: { id: number; nome: string }[];
};

export default function SearchDisposableModal({
  open,
  onClose,
  onSelect,
  janela,
  grupos = [
    { id: 21, nome: "Materiais Estéreis" },
    { id: 22, nome: "Luvas e EPIs" },
    { id: 23, nome: "Soluções" },
  ],
}: Props) {
  const [externo, setExterno] = useState<boolean | undefined>();
  const [grupoId, setGrupoId] = useState<number | undefined>();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Recurso[]>([]);
  const [selecionados, setSelecionados] = useState<Record<number, boolean>>({});
  const [buscou, setBuscou] = useState(false);

  const limpar = () => {
    setExterno(undefined);
    setGrupoId(undefined);
    setNome("");
    setResultado([]);
    setSelecionados({});
    setBuscou(false);
  };

  const fechar = () => {
    limpar();
    onClose();
  };

  const buscar = async () => {
    setLoading(true);
    setBuscou(true);
    try {
      const lista = await RecursoService.search({
        inicio: janela.inicio,
        fim: janela.fim,
        externo,
        grupoId,
        nome,
        disposable: true,
      });
      setResultado(lista);
      setSelecionados((prev) => {
        const next: Record<number, boolean> = {};
        for (const r of lista) next[r.id] = !!prev[r.id];
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmar = () => {
    const selecionadosList = resultado
      .filter((r) => selecionados[r.id])
      .map((r) => ({
        itemTipoId: r.id,
        nome: r.nome,
        unidade: r.unidade ?? "un",
        quantidade: 1, // 👈 sempre 1 por padrão
        disponivel: r.estoque ?? 0,
      }));

    onSelect(selecionadosList);
    fechar();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? fechar() : null)}>
      <DialogPortal>
        <DialogOverlay className="z-[60]" />
        <DialogContent className="w-[90vw]  max-w-3xl max-h-[95vh]  rounded-2xl  z-[61]">
          <div className="overflow-y-auto max-h-[85vh] ">
          {/* Cabeçalho */}
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Buscar Itens Descartáveis</DialogTitle>
              <DialogDescription>
                Selecione um ou mais itens descartáveis disponíveis para o
                procedimento. Janela:&nbsp;
                <span className="font-medium">
                  {new Date(janela.inicio).toLocaleString()} —{" "}
                  {new Date(janela.fim).toLocaleString()}
                </span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 grid gap-4"
          >
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Origem */}
              <div className="col-span-12">
                <Label>Origem</Label>
                <Tabs
                  value={
                    externo === undefined ? "" : externo ? "externo" : "proprio"
                  }
                  onValueChange={(v) =>
                    setExterno(
                      v === "externo"
                        ? true
                        : v === "proprio"
                        ? false
                        : undefined
                    )
                  }
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="proprio">Próprio</TabsTrigger>
                    <TabsTrigger value="externo">Externo</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Grupo */}
              <div className="col-span-12">
                <Label>Grupo (opcional)</Label>
                <Select
                  value={grupoId === undefined ? "todos" : String(grupoId)}
                  onValueChange={(v) =>
                    setGrupoId(v === "todos" ? undefined : Number(v))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="todos">Todos</SelectItem>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="col-span-12">
                <Label>Nome (opcional)</Label>
                <Input
                  placeholder="Digite parte do nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscar()}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2">
              <Button onClick={buscar} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={limpar} disabled={loading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>

            {/* Resultados (sempre renderiza a tabela) */}
            <div className="mt-1 max-h-80 overflow-auto rounded-2xl border relative">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-20" />
                  <col />
                  <col className="w-20" />
                  <col className="w-20" />
                </colgroup>

                <thead className="sticky top-0 z-20 border-b bg-background supports-[backdrop-filter]:bg-background/80 backdrop-blur">
                  <tr className="text-left">
                    <th className="p-3 whitespace-nowrap bg-inherit">
                      Selecionar
                    </th>
                    <th className="p-3 whitespace-nowrap bg-inherit">Item</th>
                    <th className="p-3 whitespace-nowrap bg-inherit">Unid.</th>
                    <th className="p-3 whitespace-nowrap bg-inherit">
                      Disponível
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-sm text-muted-foreground"
                      >
                        <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                        Buscando itens...
                      </td>
                    </tr>
                  ) : resultado.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-sm text-muted-foreground"
                      >
                        <span className="font-medium">
                          {buscou
                            ? "Nenhum item encontrado"
                            : "Defina filtros e clique em Buscar."}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    resultado.map((r) => {
                      const estoque = r.estoque ?? 0;
                      const unidade = r.unidade ?? "un";
                      const selecionavel = estoque > 0;
                      return (
                        <tr key={r.id} className="border-t">
                          <td className="p-3">
                            <Checkbox
                              disabled={!selecionavel}
                              checked={!!selecionados[r.id]}
                              onCheckedChange={(v) =>
                                setSelecionados((s) => ({
                                  ...s,
                                  [r.id]: !!v,
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 pr-2 truncate">{r.nome}</td>
                          <td className="py-2 pr-2">{unidade}</td>
                          <td className="py-2 pr-2">{estoque}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={fechar}>
                Cancelar
              </Button>
              <Button
                onClick={confirmar}
                disabled={!Object.values(selecionados).some(Boolean)}
              >
                Adicionar selecionados
              </Button>
            </div>
          </motion.div>
        </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
