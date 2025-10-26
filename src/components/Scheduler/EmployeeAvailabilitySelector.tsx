import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Plus } from "lucide-react";
import type { Funcionario } from "./types";
import SearchEmployeesModal from "./modal/SearchEmployeesModal";
import { translateRole } from "../../utils/roleMapper";

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
          // Roles mapped to numeric ids for selector (display translated)
          "SURGEON",
          "ASSISTANT_SURGEON",
          "ANESTHESIOLOGIST",
          "RESIDENT_DOCTOR",

          "SCRUB_NURSE",
          "CIRCULATING_NURSE",
          "RECOVERY_NURSE",

          "SURGICAL_TECHNICIAN",
          "RADIOLOGY_TECHNICIAN",
          "PERFUSIONIST",
          "STERILIZATION_TECH",

          "OPERATING_ROOM_COORDINATOR",
          "SURGICAL_SCHEDULER",
          "INVENTORY_CLERK",

          "CONTINGENCY_A_SURGEON",
          "CONTINGENCY_A_ASSISTANT_SURGEON",
          "CONTINGENCY_A_ANESTHESIOLOGIST",
          "CONTINGENCY_A_RESIDENT_DOCTOR",

          "CONTINGENCY_A_SCRUB_NURSE",
          "CONTINGENCY_A_CIRCULATING_NURSE",
          "CONTINGENCY_A_RECOVERY_NURSE",

          "CONTINGENCY_A_SURGICAL_TECHNICIAN",
          "CONTINGENCY_A_RADIOLOGY_TECHNICIAN",
          "CONTINGENCY_A_PERFUSIONIST",
          "CONTINGENCY_A_STERILIZATION_TECH",

          "CONTINGENCY_A_OPERATING_ROOM_COORDINATOR",
          "CONTINGENCY_A_SURGICAL_SCHEDULER",
          "CONTINGENCY_A_INVENTORY_CLERK",

          "CONTINGENCY_B_SURGEON",
          "CONTINGENCY_B_ASSISTANT_SURGEON",
          "CONTINGENCY_B_ANESTHESIOLOGIST",
          "CONTINGENCY_B_RESIDENT_DOCTOR",

          "CONTINGENCY_B_SCRUB_NURSE",
          "CONTINGENCY_B_CIRCULATING_NURSE",
          "CONTINGENCY_B_RECOVERY_NURSE",

          "CONTINGENCY_B_SURGICAL_TECHNICIAN",
          "CONTINGENCY_B_RADIOLOGY_TECHNICIAN",
          "CONTINGENCY_B_PERFUSIONIST",
          "CONTINGENCY_B_STERILIZATION_TECH",

          "CONTINGENCY_B_OPERATING_ROOM_COORDINATOR",
          "CONTINGENCY_B_SURGICAL_SCHEDULER",
          "CONTINGENCY_B_INVENTORY_CLERK",
        ].map((role, idx) => ({ id: idx + 1, nome: translateRole(role) }))}
      />
    </div>
  );
}
