
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Plus } from "lucide-react";
import type { Recurso } from "./types";
import SearchEquipmentModal from "./modal/SearchEquipmentModal";
import SearchDisposableModal from "./modal/SearchDisposableModal";

export interface EquipmentAvailabilitySelectorProps {
  janela: { inicio: string; fim: string };
  recursos: Recurso[];
  onChangeRecursos: (list: Recurso[]) => void;
  itens: { itemTipoId: number; nome: string; unidade: string; quantidade: number; disponivel: number }[];
  onChangeItens: (list: { itemTipoId: number; nome: string; unidade: string; quantidade: number; disponivel: number }[]) => void;
}

export default function EquipmentAvailabilitySelector(props: EquipmentAvailabilitySelectorProps) {
  const { janela, recursos, onChangeRecursos, itens, onChangeItens } = props;
  const [openRec, setOpenRec] = React.useState(false);
  const [openDesc, setOpenDesc] = React.useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Recursos Reutilizáveis */}
      <div>
        <div className="flex justify-end mb-3">
          <Button onClick={() => setOpenRec(true)}><Plus className="h-4 w-4 mr-2"/>Adicionar</Button>
        </div>
        <div className="rounded-2xl border overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="text-left">
                <th className="p-3">Recurso</th>
                <th>Origem</th>
                <th>Disponibilidade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.nome}</td>
                  <td>{r.externo ? "Externo" : "Próprio"}</td>
                  <td>{r.disponivel ? <span className="text-green-600 text-xs inline-flex items-center gap-1"><Check className="h-3 w-3"/>Disponível</span> : <span className="text-red-600 text-xs inline-flex items-center gap-1"><X className="h-3 w-3"/>Bloqueado</span>}</td>
                  <td className="text-right"><Button variant="ghost" size="sm" onClick={() => onChangeRecursos(recursos.filter((x) => x.id !== r.id))}>Remover</Button></td>
                </tr>
              ))}
              {recursos.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-xs text-muted-foreground">Nenhum recurso adicionado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itens Descartáveis */}
      <div>
        <div className="flex justify-end mb-3">
          <Button onClick={() => setOpenDesc(true)}><Plus className="h-4 w-4 mr-2"/>Adicionar</Button>
        </div>
        <div className="rounded-2xl border overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="text-left">
                <th className="p-3">Item</th>
                <th>Unid.</th>
                <th>Qtd</th>
                <th>Disponível</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.itemTipoId} className="border-t">
                  <td className="p-3">{i.nome}</td>
                  <td>{i.unidade}</td>
                  <td>{i.quantidade}</td>
                  <td>{i.disponivel}</td>
                  <td className="text-right"><Button variant="ghost" size="sm" onClick={() => onChangeItens(itens.filter((x) => x.itemTipoId !== i.itemTipoId))}>Remover</Button></td>
                </tr>
              ))}
              {itens.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">Nenhum item adicionado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <SearchEquipmentModal
        open={openRec}
        onClose={() => setOpenRec(false)}
        janela={janela}
        onSelect={(lista) => {
          const ids = new Set(recursos.map((a) => a.id));
          onChangeRecursos([...recursos, ...lista.filter((n) => !ids.has(n.id))]);
        }}
      />
      <SearchDisposableModal
        open={openDesc}
        onClose={() => setOpenDesc(false)}
        onAdd={(item) => onChangeItens([...itens, item])}
      />
    </div>
  );
}
