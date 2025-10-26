/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Filter, X, Loader2, RotateCcw } from "lucide-react";
import type { Funcionario } from "../types";
//import { searchFuncionarios } from "../api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

// shadcn/ui Select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { translateRole } from "../../../utils/roleMapper";
import { FuncionarioService } from "@/api/FuncionarioService";
import { ScheduleApiService } from "@/api/ScheduleApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (funcs: Funcionario[]) => void;
  janela: { inicio: string; fim: string };
  especialidades?: { id: number; nome: string }[];
};

export default function SearchEmployeesModal({
  open,
  onClose,
  onSelect,
  janela,
  especialidades = [],
}: Props) {
  const [interno, setInterno] = useState<boolean>(true); // ✅ padrão interno
  const [especialidadeId, setEspecialidadeId] = useState<number | undefined>();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Funcionario[]>([]);
  const [selecionados, setSelecionados] = useState<Record<number, boolean>>({});
  const [buscouAoMenosUmaVez, setBuscouAoMenosUmaVez] = useState(false);

  const limpar = () => {
    setInterno(true); // ✅ redefine vínculo para interno
    setEspecialidadeId(undefined);
    setNome("");
    setResultado([]);
    setSelecionados({});
    setBuscouAoMenosUmaVez(false);
  };

  const fechar = () => {
    limpar();
    onClose();
  };

  const buscar = async () => {
    setLoading(true);
    setBuscouAoMenosUmaVez(true);
    try {
      // Map filters to API query params
      const type = interno ? 'OWNED' : 'THIRD_PARTY'
      const roles = especialidadeId ? String(especialidadeId) : undefined // id here encodes index; upstream caller provides mapping

      const pros = await ScheduleApiService.getProfessionals({
        available: true,
        ...(roles ? { roles } : {}),
        type,
      })

      // Adapt professionals to Funcionario shape used by this modal
      const lista: Funcionario[] = pros.map((p, idx) => ({
        id: idx + 1, // local id for selection purposes
        nome: p.name,
        interno: (p.type ?? 'OWNED') === 'OWNED',
        disponivel: true,
        especialidades: [],
      }))

      lista.sort((a, b) => a.nome.localeCompare(b.nome))
      setResultado(lista)
      setSelecionados((prev) => {
        const next: Record<number, boolean> = {}
        for (const f of lista) next[f.id] = !!prev[f.id]
        return next
      })
    } finally {
      setLoading(false);
    }
  };

  const confirmar = () => {
    const picked = resultado.filter((f) => selecionados[f.id]);
    onSelect(picked);
    fechar();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") buscar();
  };

  const resultadosSelecionados = Object.values(selecionados).filter(Boolean)
    .length;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? fechar() : null)}>
      <DialogPortal>
        <DialogOverlay className="z-[60]" />
        <DialogContent className="w-[90vw]  max-w-3xl max-h-[95vh]  rounded-2xl  z-[61]">
                  <div className="overflow-y-auto max-h-[85vh] ">
          {/* Cabeçalho */}
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Buscar Funcionários</DialogTitle>
              <DialogDescription>
                Defina o vínculo e, opcionalmente, especialidade e nome.{" "}
                Janela:&nbsp;
                <span className="font-medium">
                  {new Date(janela.inicio).toLocaleString()} —{" "}
                  {new Date(janela.fim).toLocaleString()}
                </span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Corpo */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 grid gap-4"
          >
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Vínculo */}
              <div className="col-span-12">
                <Label>Vínculo</Label>
                <Tabs
                  value={interno ? "interno" : "externo"}
                  onValueChange={(v) => setInterno(v === "interno")}
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="interno">Interno</TabsTrigger>
                    <TabsTrigger value="externo">Externo</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Cargo (Select funcional) */}
              <div className="col-span-12">
                <Label>Cargo (opcional)</Label>
                <Select
                  value={
                    especialidadeId === undefined
                      ? "todas"
                      : String(especialidadeId)
                  }
                  onValueChange={(v) =>
                    setEspecialidadeId(v === "todas" ? undefined : Number(v))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="todas">Todos</SelectItem>
                    {especialidades?.map((esp) => (
                      <SelectItem key={esp.id} value={String(esp.id)}>
                        {translateRole(esp.nome)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="col-span-12">
                <Label>Nome (opcional)</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={handleEnter}
                  placeholder="Digite um nome e pressione Enter"
                />
              </div>
            </div>

            {/* Botões alinhados à direita */}
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

              <Button
                type="button"
                variant="outline"
                onClick={limpar}
                disabled={loading && !buscouAoMenosUmaVez}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>

            {/* Contagem de resultados */}
            <div className="text-xs text-muted-foreground">
              {buscouAoMenosUmaVez ? (
                <>
                  {resultado.length} resultado{resultado.length !== 1 ? "s" : ""}.
                  {resultadosSelecionados > 0 && (
                    <>
                      {" "}
                      {resultadosSelecionados} selecionado
                      {resultadosSelecionados !== 1 ? "s" : ""}.
                    </>
                  )}
                </>
              ) : (
                <>Preencha os filtros e clique em Buscar.</>
              )}
            </div>

            {/* Tabela / Mensagens */}
            <div className="mt-1 max-h-80 overflow-auto rounded-2xl border">
              {loading ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando funcionários...
                </div>
              ) : resultado.length === 0 && buscouAoMenosUmaVez ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground text-sm border-t">
                  Nenhum funcionário encontrado.
                </div>
              ) : resultado.length === 0 && !buscouAoMenosUmaVez ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground text-sm border-t">
                  Preencha os filtros e clique em Buscar.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="text-left">
                      <th className="p-3">Selecionar</th>
                      <th>Nome</th>
                      <th>Situação</th>
                      <th>Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.map((f) => {
                      const habilitado = f.disponivel;
                      return (
                        <tr key={f.id} className="border-t">
                          <td className="p-3">
                            <Checkbox
                              disabled={!habilitado}
                              checked={!!selecionados[f.id]}
                              onCheckedChange={(v) =>
                                setSelecionados((s) => ({ ...s, [f.id]: !!v }))
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">{f.nome}</td>
                          <td className="py-2 pr-2">
                            {f.disponivel ? (
                              <span className="text-green-600 text-xs inline-flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Disponível
                              </span>
                            ) : (
                              <span className="text-red-600 text-xs inline-flex items-center gap-1">
                                <X className="h-3 w-3" />
                                Bloqueado
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-2 text-xs text-muted-foreground">
                            {f.motivo ?? ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Ações finais */}
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
