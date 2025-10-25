
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Filter, X } from "lucide-react";
import type { Funcionario } from "../types";
import { searchFuncionarios } from "../api";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";

export default function SearchEmployeesModal({ open, onClose, onSelect, janela }: { open: boolean; onClose: () => void; onSelect: (funcs: Funcionario[]) => void; janela: { inicio: string; fim: string } }) {
  const [interno, setInterno] = useState<boolean | undefined>();
  const [especialidadeId, setEspecialidadeId] = useState<number | undefined>();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Funcionario[]>([]);
  const [selecionados, setSelecionados] = useState<Record<number, boolean>>({});

  const buscar = async () => {
    if (interno === undefined) return; // obrigatório
    setLoading(true);
    try {
      const lista = await searchFuncionarios({ inicio: janela.inicio, fim: janela.fim, interno, especialidadeId, nome });
      lista.sort((a, b) => Number(b.disponivel) - Number(a.disponivel) || a.nome.localeCompare(b.nome));
      setResultado(lista);
    } finally { setLoading(false); }
  };

  const confirmar = () => {
    const picked = resultado.filter((f) => selecionados[f.id]);
    onSelect(picked);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Buscar Funcionários</DialogTitle>
          <DialogDescription>Selecione vínculo (obrigatório), e opcionalmente especialidade e nome.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="col-span-1">
            <Label>Vínculo</Label>
            <Tabs value={interno === undefined ? "" : interno ? "interno" : "externo"} onValueChange={(v) => setInterno(v === "interno" ? true : v === "externo" ? false : undefined)}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="interno">Interno</TabsTrigger>
                <TabsTrigger value="externo">Externo</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="col-span-1">
            <Label>Especialidade (opcional)</Label>
            <Input placeholder="ID ex.: 3" inputMode="numeric" onChange={(e) => setEspecialidadeId(e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="col-span-2">
            <Label>Nome (opcional)</Label>
            <div className="flex gap-2">
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite um nome" />
              <Button onClick={buscar} disabled={interno === undefined || loading}><Filter className="h-4 w-4 mr-2"/> Buscar</Button>
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-80 overflow-auto rounded-2xl border">
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
                    <td className="p-3"><Checkbox disabled={!habilitado} checked={!!selecionados[f.id]} onCheckedChange={(v) => setSelecionados((s) => ({ ...s, [f.id]: !!v }))} /></td>
                    <td className="py-2 pr-2">{f.nome}</td>
                    <td className="py-2 pr-2">{f.disponivel ? <span className="text-green-600 text-xs inline-flex items-center gap-1"><Check className="h-3 w-3"/>Disponível</span> : <span className="text-red-600 text-xs inline-flex items-center gap-1"><X className="h-3 w-3"/>Bloqueado</span>}</td>
                    <td className="py-2 pr-2 text-xs text-muted-foreground">{f.motivo ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={confirmar} disabled={!Object.values(selecionados).some(Boolean)}>Adicionar selecionados</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
