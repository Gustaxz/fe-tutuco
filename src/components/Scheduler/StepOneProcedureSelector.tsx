/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
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
  centroId?: number;
  onCentroId: (v?: number) => void;
  medicoRespId?: number;
  onMedicoRespId: (v?: number) => void;
  salaId?: number;
  onSalaId: (v?: number) => void;
  medicos: Medico[];
  salas: Sala[];
  slots: Slot[];
  slotSelecionado: Slot | null;
  onSlotSelecionado: (s: Slot) => void;
}

export default function StepOneProcedureSelector(
  props: StepOneProcedureSelectorProps
) {
  const {
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
  } = props;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dados, Filtros e Horários</CardTitle>
      </CardHeader>

      <CardContent className="space-y-10 px-8 flex flex-col items-center">
        <div className="w-full max-w-[1200px] space-y-6">
          {/* Linha 1 - Paciente / Duração / Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
            <div className="flex flex-col flex-1 min-w-0">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Paciente (CPF)
              </Label>
              <InputMask
                mask="999.999.999-99"
                value={pacienteId}
                onChange={(e: any) => onPacienteId(e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    className="w-full h-12 text-base rounded-lg"
                    placeholder="000.000.000-00"
                  />
                )}
              </InputMask>
            </div>

            <div className="md:col-span-2 flex flex-col flex-1 min-w-0">
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

            <div className="flex flex-col flex-1 min-w-0">
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
            <div className="flex flex-col flex-1 min-w-0">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Data
              </Label>
              <Input
                className="w-full h-12 text-base rounded-lg max-w-xs"
                type="date"
                value={data}
                onChange={(e) => onData(e.target.value)}
              />
            </div>
          </div>

          {/* Linha 3 - Centro / Médico / Sala */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-5 items-end">
            <div className="flex flex-col flex-1 min-w-0">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Centro Cirúrgico
              </Label>
              <Select
                value={centroId ? String(centroId) : undefined}
                onValueChange={(v) => onCentroId(Number(v))}
              >
                <SelectTrigger className="w-full h-12 text-base rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Centros</SelectLabel>
                    <SelectItem value="100">Centro A</SelectItem>
                    <SelectItem value="200">Centro B</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Médico responsável
              </Label>
              <Select
                value={medicoRespId ? String(medicoRespId) : undefined}
                onValueChange={(v) => onMedicoRespId(Number(v))}
              >
                <SelectTrigger className="w-full h-12 text-base rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Médicos</SelectLabel>
                    {medicos.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <Label className="text-sm font-medium text-muted-foreground mb-1.5">
                Sala
              </Label>
              <Select
                value={salaId ? String(salaId) : undefined}
                onValueChange={(v) => onSalaId(Number(v))}
              >
                <SelectTrigger className="w-full h-12 text-base rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Salas</SelectLabel>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Horários */}
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
                {slots.map((s) => (
                  <tr
                    key={`${s.inicio}-${s.salaId ?? "x"}`}
                    className={`border-t hover:bg-accent/40 cursor-pointer ${
                      slotSelecionado?.inicio === s.inicio
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onClick={() => onSlotSelecionado(s)}
                  >
                    <td className="p-2">
                      <Checkbox
                        checked={
                          slotSelecionado?.inicio === s.inicio &&
                          slotSelecionado?.salaId === s.salaId
                        }
                        onCheckedChange={() => onSlotSelecionado(s)}
                      />
                    </td>
                    <td className="py-2 pr-2">{fmtHour(s.inicio)}</td>
                    <td className="py-2 pr-2">{s.medicoNome ?? "-"}</td>
                    <td className="py-2 pr-2">{s.salaNome ?? "-"}</td>
                  </tr>
                ))}
                {slots.length === 0 && (
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
