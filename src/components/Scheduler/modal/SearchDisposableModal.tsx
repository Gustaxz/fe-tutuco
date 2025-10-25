
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getItemSaldo } from "../api";

export default function SearchDisposableModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (item: { itemTipoId: number; nome: string; unidade: string; quantidade: number; disponivel: number }) => void }) {
  const [id, setId] = useState<number | undefined>();
  const [nome, setNome] = useState("");
  const [un, setUn] = useState("un");
  const [qtd, setQtd] = useState(1);

  const confirmar = async () => {
    if (!id) return;
    const { disponivel } = await getItemSaldo(id);
    const q = Math.max(1, Math.min(qtd, disponivel));
    onAdd({ itemTipoId: id, nome: nome || `Item ${id}`, unidade: un || "un", quantidade: q, disponivel });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Item Descartável</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 items-end">
          <div>
            <Label>ID</Label>
            <Input inputMode="numeric" placeholder="4001" value={id ?? ""} onChange={(e) => setId(e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div>
            <Label>Nome</Label>
            <Input placeholder="Ex.: Gaze" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>Unid.</Label>
            <Input placeholder="un" value={un} onChange={(e) => setUn(e.target.value)} />
          </div>
          <div>
            <Label>Qtd</Label>
            <Input type="number" min={1} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={confirmar}>Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}