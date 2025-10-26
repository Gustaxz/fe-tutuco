import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { Recurso } from "./types";
// import SearchEquipmentModal from "./modal/SearchEquipmentModal";
import SearchDisposableModal from "./modal/SearchDisposableModal";

export interface EquipmentAvailabilitySelectorProps {
  janela: { inicio: string; fim: string };
  recursos: Recurso[];
  onChangeRecursos: (list: Recurso[]) => void;
  itens: {
    itemTipoId: number;
    nome: string;
    unidade: string;
    quantidade: number;
    disponivel: number;
  }[];
  onChangeItens: (
    list: {
      itemTipoId: number;
      nome: string;
      unidade: string;
      quantidade: number;
      disponivel: number;
    }[]
  ) => void;
}

export default function EquipmentAvailabilitySelector({
  janela,
  recursos,
  onChangeRecursos,
  itens,
  onChangeItens,
}: EquipmentAvailabilitySelectorProps) {
  const [openRec, setOpenRec] = useState(false);
  const [openDesc, setOpenDesc] = useState(false);

  const removerRecurso = (id: number) =>
    onChangeRecursos(recursos.filter((x) => x.id !== id));

  const removerItem = (id: number) =>
    onChangeItens(itens.filter((x) => x.itemTipoId !== id));

  const setQuantidade = (itemTipoId: number, value: string) => {
    const parsed = Math.floor(Number(value) || 0);
    onChangeItens(
      itens.map((i) => {
        if (i.itemTipoId !== itemTipoId) return i;
        const min = 1;
        const max = Number.isFinite(i.disponivel)
          ? Math.max(1, i.disponivel)
          : undefined;
        const clamped =
          parsed < min ? min : max ? Math.min(parsed, max) : parsed;
        return { ...i, quantidade: clamped };
      })
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6">

      {/* Itens Descartáveis */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Itens</h3>
          <Button onClick={() => setOpenDesc(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </div>

        <div className="rounded-2xl border overflow-auto max-h-80 relative">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[55%]" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead className="sticky top-0 z-20 border-b bg-background supports-[backdrop-filter]:bg-background/80 backdrop-blur">
              <tr className="text-left">
                <th className="p-3 whitespace-nowrap bg-inherit">Item</th>
                <th className="p-3 whitespace-nowrap bg-inherit">Unid.</th>
                <th className="p-3 whitespace-nowrap bg-inherit">Qtd</th>
                <th className="p-3 whitespace-nowrap bg-inherit">Disponível</th>
                <th className="p-3 whitespace-nowrap bg-inherit"></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.itemTipoId} className="border-t">
                  <td className="p-3">{i.nome}</td>
                  <td>{i.unidade}</td>
                  <td className="w-24">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={i.quantidade}
                      onChange={(e) =>
                        setQuantidade(i.itemTipoId, e.target.value)
                      }
                      className="h-8 w-16 text-center"
                    />
                  </td>
                  <td>{i.disponivel}</td>
                  <td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(i.itemTipoId)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}

              {itens.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-xs text-muted-foreground"
                  >
                    Nenhum item adicionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


      <SearchDisposableModal
        open={openDesc}
        onClose={() => setOpenDesc(false)}
        janela={janela}
        onSelect={(lista) => {
          const ids = new Set(itens.map((x) => x.itemTipoId));
          const novos = lista.filter((n) => !ids.has(n.itemTipoId));
          onChangeItens([...itens, ...novos]);
        }}
      />
    </div>
  );
}
