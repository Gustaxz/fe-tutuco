import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Plus } from "lucide-react";
import type { Funcionario } from "./types";
import SearchEmployeesModal from "./modal/SearchEmployeesModal";

export interface EmployeeAvailabilitySelectorProps {
  janela: { inicio: string; fim: string };
  value: Funcionario[];
  onChange: (list: Funcionario[]) => void;
}

export default function EmployeeAvailabilitySelector({
  janela,
  value,
  onChange,
}: EmployeeAvailabilitySelectorProps) {
  const [open, setOpen] = useState(false);

  const remover = (id: number) => onChange(value.filter((v) => v.id !== id));

  const handleSelect = (picked: Funcionario[]) => {
    const ids = new Set(value.map((v) => v.id));
    const merged = [...value, ...picked.filter((p) => !ids.has(p.id))];
    onChange(merged);
    setOpen(false);
  };

  return (
    <div>
      {/* Cabeçalho interno */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Participantes</h3>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Tabela de participantes */}
      <div className="rounded-2xl border overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background">
            <tr className="text-left">
              <th className="p-3">Nome</th>
              <th>Vínculo</th>
              <th>Disponibilidade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {value.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-3">{f.nome}</td>
                <td>{f.interno ? "Interno" : "Externo"}</td>
                <td>
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
                <td className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remover(f.id)}
                  >
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
            {value.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-xs text-muted-foreground"
                >
                  Nenhum participante adicionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de busca controlado internamente */}
      <SearchEmployeesModal
        open={open}
        onClose={() => setOpen(false)}
        janela={janela}
        onSelect={handleSelect}
        especialidades={[
          { id: 1, nome: "Anestesia" },
          { id: 2, nome: "Cardiologia" },
          { id: 3, nome: "Ortopedia" },
        ]}
      />
    </div>
  );
}
