
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Filter, X } from "lucide-react";
import type { Recurso } from "../types";
import { searchRecursos } from "../api";

export default function SearchEquipmentModal({ open, onClose, onSelect, janela }: { open: boolean; onClose: () => void; onSelect: (r: Recurso[]) => void; janela: { inicio: string; fim: string } }) {
  const [externo, setExterno] = useState<boolean | undefined>();
  const [grupoId, setGrupoId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Recurso[]>([]);
  const [selecionados, setSelecionados] = useState<Record<number, boolean>>({});

  const buscar = async () => {
    setLoading(true);
    try {
      const lista = await searchRecursos({ inicio: janela.inicio, fim: janela.fim, grupoId, externo });
      lista.sort((a, b) => Number(b.disponivel) - Number(a.disponivel) || a.nome.localeCompare(b.nome));
      setResultado(lista);
    } finally { setLoading(false); }
  };

  const confirmar = () => {
    const picked = resultado.filter((r) => selecionados[r.id]);
    onSelect(picked);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Buscar Recursos</DialogTitle>
          <DialogDescription>Disponíveis aparecem primeiro; indisponíveis bloqueados.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Origem</Label>
            <Tabs value={externo === undefined ? "" : externo ? "externo" : "proprio"} onValueChange={(v) => setExterno(v === "externo" ? true : v === "proprio" ? false : undefined)}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="proprio">Próprio</TabsTrigger>
                <TabsTrigger value="externo">Externo</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="md:col-span-2">
            <Label>Grupo</Label>
            <Input placeholder="ID ex.: 12" inputMode="numeric" onChange={(e) => setGrupoId(e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>
        <div className="mt-3"><Button onClick={buscar} disabled={loading}><Filter className="h-4 w-4 mr-2"/> Buscar</Button></div>

        <div className="mt-4 max-h-80 overflow-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="text-left">
                <th className="p-3">Selecionar</th>
                <th>Recurso</th>
                <th>Situação</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r) => {
                const habilitado = r.disponivel;
                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-3"><Checkbox disabled={!habilitado} checked={!!selecionados[r.id]} onCheckedChange={(v) => setSelecionados((s) => ({ ...s, [r.id]: !!v }))} /></td>
                    <td className="py-2 pr-2">{r.nome}</td>
                    <td className="py-2 pr-2">{r.disponivel ? <span className="text-green-600 text-xs inline-flex items-center gap-1"><Check className="h-3 w-3"/>Disponível</span> : <span className="text-red-600 text-xs inline-flex items-center gap-1"><X className="h-3 w-3"/>Bloqueado</span>}</td>
                    <td className="py-2 pr-2 text-xs text-muted-foreground">{r.motivo ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={confirmar} disabled={!Object.values(selecionados).some(Boolean)}>Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
