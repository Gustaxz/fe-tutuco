import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Info } from "lucide-react";
import type { Medico, Sala, Slot } from "./types";
import { PatternFormat } from "react-number-format";
import { Button } from "../ui/button";

const fmtHour = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export interface StepOneProcedureSelectorProps {
  pacienteId: string;
  onPacienteId: (v: string) => void;
  procedimento: string;
  onProcedimento: (v: string) => void;
  duracaoHoras: number;
  onDuracaoHoras: (v: number) => void;
  data: string;
  onData: (v: string) => void;
  centroId?: string;
  onCentroId: (v?: string) => void;
  medicoRespId?: string;
  onMedicoRespId: (v?: string) => void;
  salaId?: string;
  onSalaId: (v?: string) => void;
  medicos: Medico[];
  salas: Sala[];
  slots: Slot[];
  slotSelecionado: Slot | null;
  onSlotSelecionado: (s: Slot | null) => void;
  onConsultar: () => void;
  slotsLoading?: boolean;
  centros: { id: string; nome: string }[];
}

export default function StepOneProcedureSelector({
  pacienteId,
  onPacienteId,
  procedimento,
  onProcedimento,
  duracaoHoras,
  onDuracaoHoras,
  data,
  onData,
  centroId,
  onCentroId,
  medicoRespId,
  onMedicoRespId,
  salaId,
  onSalaId,
  medicos,
  salas,
  slots,
  slotSelecionado,
  onSlotSelecionado,
  onConsultar,
  slotsLoading,
  centros,
}: StepOneProcedureSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dados, Filtros e Horários</CardTitle>
      </CardHeader>

      <CardContent className="px-8 flex flex-col items-center space-y-10">
        <div className="w-full max-w-[1200px] space-y-8">
          {/* 🟦 Linha 1 - CPF (2/12) e Procedimento (10/12) */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Paciente (CPF)
              </Label>
              <PatternFormat
                format="###.###.###-##"
                allowEmptyFormatting
                mask="_"
                value={pacienteId}
                onValueChange={(values) => onPacienteId(values.value)}
                customInput={Input}
                className="w-full h-12 text-base rounded-lg"
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>

            <div className="col-span-12 md:col-span-5">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Data
              </Label>
              <Input
                className="w-full h-12 text-base rounded-lg"
                type="date"
                value={data}
                onChange={(e) => onData(e.target.value)}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Duração (h)
              </Label>
              <Input
                className="w-full h-12 text-base rounded-lg"
                type="number"
                min={0.5}
                step={0.5}
                value={duracaoHoras}
                onChange={(e) => onDuracaoHoras(Number(e.target.value))}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Centro Cirúrgico
              </Label>
              <Select
                value={centroId ?? undefined}
                onValueChange={(v) => onCentroId(v)}
              >
                <SelectTrigger className="w-full h-12 text-base rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Centros</SelectLabel>
                    {centros.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Responsável
              </Label>
              <Select
                value={medicoRespId ?? undefined}
                onValueChange={(v) => onMedicoRespId(v)}
              >
                <SelectTrigger className="w-full h-12 text-base rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Médicos</SelectLabel>
                    {medicos.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Sala
              </Label>
              <Select
                value={salaId ?? undefined}
                onValueChange={(v) => onSalaId(v)}
              >
                <SelectTrigger className="w-full h-12 text-base rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Salas</SelectLabel>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-12 md:col-span-12">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Procedimento
              </Label>
              <Input
                className="w-full h-12 text-base rounded-lg"
                placeholder="Ex.: Colecistectomia"
                value={procedimento}
                onChange={(e) => onProcedimento(e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-12 flex justify-start mt-2">
            <Button
              className="h-11 px-5"
              onClick={onConsultar}
              disabled={
                !centroId ||
                !data ||
                Number(duracaoHoras) < 0.5 ||
                !!slotsLoading
              }
            >
              <Search className="mr-2 h-4 w-4" />
              {slotsLoading ? "Consultando..." : "Consultar horários"}
            </Button>
          </div>
        </div>

        {/* 🟩 Tabela de horários */}
        <div className="w-full max-w-[1200px]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Horários</span>
          </div>

          <div className="text-xs text-muted-foreground mb-2">
            Com apenas o Centro Cirúrgico selecionado, a busca retorna do mais
            recente ao mais antigo. Médico e Sala refinam no backend.
          </div>

          <div className="max-h-72 overflow-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="text-left">
                  <th className="p-2">Escolher</th>
                  <th>Hora</th>
                  <th>Médico</th>
                  <th>Sala</th>
                </tr>
              </thead>
              <tbody>
                {slotsLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-sm text-muted-foreground"
                    >
                      Carregando horários...
                    </td>
                  </tr>
                )}

                {!slotsLoading &&
                  slots.map((s) => (
                    <tr
                      key={`${s.inicio}-${s.salaId ?? "x"}`}
                      className={`border-t cursor-pointer transition-colors duration-150 ${
                        slotSelecionado?.inicio === s.inicio &&
                        slotSelecionado?.salaId === s.salaId
                          ? "bg-primary/15 border-l-4 border-l-primary text-primary font-medium"
                          : "hover:bg-accent/40"
                      }`}
                      onClick={() => {
                        if (
                          slotSelecionado?.inicio === s.inicio &&
                          slotSelecionado?.salaId === s.salaId
                        ) {
                          onSlotSelecionado(null); // ✅ desmarca se clicar no mesmo
                        } else {
                          onSlotSelecionado(s); // marca normalmente
                        }
                      }}
                    >
                      <td className="p-2">
                        <Checkbox
                          checked={
                            slotSelecionado?.inicio === s.inicio &&
                            slotSelecionado?.salaId === s.salaId
                          }
                          onCheckedChange={() => {
                            if (
                              slotSelecionado?.inicio === s.inicio &&
                              slotSelecionado?.salaId === s.salaId
                            ) {
                              onSlotSelecionado(null); // ✅ desmarca ao clicar novamente
                            } else {
                              onSlotSelecionado(s);
                            }
                          }}
                        />
                      </td>

                      <td className="py-2 pr-2">{fmtHour(s.inicio ?? "-")}</td>
                      <td className="py-2 pr-2">{s.medicoNome ?? "-"}</td>
                      <td className="py-2 pr-2">{s.salaNome ?? "-"}</td>
                    </tr>
                  ))}

                {!slotsLoading && slots.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-xs text-muted-foreground"
                    >
                      Nenhum slot encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
            <Info className="h-3 w-3" />
            Após selecionar, Centro, Responsável, Sala e Horário ficam definidos
            para as próximas etapas.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
