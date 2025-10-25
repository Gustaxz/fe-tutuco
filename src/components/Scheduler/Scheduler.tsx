/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { AgendarPayload, Medico, Sala, Slot } from "./types";
import { getMedicos, getSalas, getSlots, validar, agendar } from "./api";
import EmployeeAvailabilitySelector from "./EmployeeAvailabilitySelector";
import EquipmentAvailabilitySelector from "./EquipmentAvailabilitySelector";
import StepOneProcedureSelector from "./StepOneProcedureSelector";

const addHours = (startIso: string, hours: number) =>
  new Date(new Date(startIso).getTime() + hours * 3600000).toISOString();
const clamp = (v: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  Math.max(min, Math.min(max, v));

export default function Scheduler({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 fields
  const [pacienteId, setPacienteId] = useState<string>("");
  const [procedimento, setProcedimento] = useState<string>("");
  const [duracaoHoras, setDuracaoHoras] = useState<number>(1);
  const [centroId, setCentroId] = useState<number | undefined>();
  const [medicoRespId, setMedicoRespId] = useState<number | undefined>();
  const [salaId, setSalaId] = useState<number | undefined>();
  const [data, setData] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSelecionado, setSlotSelecionado] = useState<Slot | null>(null);
  const janela = useMemo(() => {
    const start = new Date(`${data}T07:00:00`).toISOString();
    const end = new Date(`${data}T19:00:00`).toISOString();
    return { start, end };
  }, [data]);

  useEffect(() => {
    if (!centroId) return; // Centro é obrigatório para buscar
    const duracaoMin = clamp(Math.round(duracaoHoras * 60), 30, 12 * 60);
    getSlots({
      start: janela.start,
      end: janela.end,
      duracaoMin,
      salaId,
      profissionalId: medicoRespId,
      centroId,
    })
      .then(({ slots }) =>
        setSlots(
          [...slots].sort(
            (a, b) =>
              new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
          )
        )
      )
      .catch(() => setSlots([]));
  }, [centroId, medicoRespId, salaId, duracaoHoras, janela.start, janela.end]);

  const [salas, setSalas] = useState<Sala[]>([]);
  useEffect(() => {
    if (centroId)
      getSalas(centroId)
        .then(setSalas)
        .catch(() => setSalas([]));
  }, [centroId]);

  const [medicos, setMedicos] = useState<Medico[]>([]);
  useEffect(() => {
    getMedicos({})
      .then(setMedicos)
      .catch(() => setMedicos([]));
  }, []);

  // Step 2/3 state
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);

  const inicioSelecionado = slotSelecionado?.inicio ?? null;
  const fimSelecionado = inicioSelecionado
    ? addHours(inicioSelecionado, duracaoHoras)
    : null;

  const podeAvancar1 = !!(
    pacienteId &&
    procedimento &&
    duracaoHoras &&
    centroId &&
    slotSelecionado
  );
  const podeAgendar = !!podeAvancar1;

  const resetAll = () => {
    setStep(1);
    setPacienteId("");
    setProcedimento("");
    setDuracaoHoras(1);
    setCentroId(undefined);
    setMedicoRespId(undefined);
    setSalaId(undefined);
    setSlots([]);
    setSlotSelecionado(null);
    setFuncionarios([]);
    setRecursos([]);
    setItens([]);
  };
  const onCloseInternal = () => {
    resetAll();
    onClose();
  };

  const payload: AgendarPayload = {
    pacienteId: pacienteId ? Number(pacienteId) : null,
    responsavelProfissionalId: medicoRespId ?? null,
    procedimentoNome: procedimento,
    salaId: salaId ?? slotSelecionado?.salaId ?? null,
    inicio: inicioSelecionado,
    fim: fimSelecionado,
    profissionaisIds: [medicoRespId, ...funcionarios.map((f) => f.id)].filter(
      Boolean
    ) as number[],
    recursosIds: recursos.map((r) => r.id),
    itens: itens.map((i) => ({
      itemTipoId: i.itemTipoId,
      quantidade: i.quantidade,
    })),
  };

  const handleValidar = async () => {
    if (!podeAgendar) return;
    const res = await validar(payload);
    if (!res.ok) {
      alert("Conflitos detectados. Veja console.");
      console.log("Conflitos:", res.conflitos, "Sugestões:", res.sugestoes);
      return;
    }
    setStep(3);
  };

  const handleAgendar = async () => {
    if (!podeAgendar) return;
    const { procedimentoId } = await agendar(payload);
    alert(`Procedimento agendado! #${procedimentoId}`);
    onCloseInternal();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onCloseInternal() : null)}>
      <DialogContent className="w-[90vw max-h-[90vh] overflow-y-auto rounded-2xl p-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle>Cadastro de Cirurgia</DialogTitle>
            <DialogDescription>
              Preencha as 3 etapas para agendar o procedimento.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium shadow ${
                    step >= (s as any)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              <StepOneProcedureSelector
                pacienteId={pacienteId}
                onPacienteId={setPacienteId}
                procedimento={procedimento}
                onProcedimento={setProcedimento}
                duracaoHoras={duracaoHoras}
                onDuracaoHoras={setDuracaoHoras}
                data={data}
                onData={setData}
                centroId={centroId}
                onCentroId={setCentroId}
                medicoRespId={medicoRespId}
                onMedicoRespId={setMedicoRespId}
                salaId={salaId}
                onSalaId={setSalaId}
                medicos={medicos}
                salas={salas}
                slots={slots}
                slotSelecionado={slotSelecionado}
                onSlotSelecionado={setSlotSelecionado}
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onCloseInternal}>
                  Cancelar
                </Button>
                <Button disabled={!podeAvancar1} onClick={() => setStep(2)}>
                  Confirmar & avançar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              <Card className="p-4">
                <EmployeeAvailabilitySelector
                  janela={{
                    inicio: inicioSelecionado ?? new Date().toISOString(),
                    fim:
                      fimSelecionado ??
                      addHours(new Date().toISOString(), duracaoHoras),
                  }}
                  value={funcionarios}
                  onChange={setFuncionarios}
                />
              </Card>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleValidar}
                    disabled={!podeAgendar}
                  >
                    Validar
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!podeAgendar}>
                    Avançar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              <Card className="p-4">
                <EquipmentAvailabilitySelector
                  janela={{
                    inicio: inicioSelecionado ?? new Date().toISOString(),
                    fim:
                      fimSelecionado ??
                      addHours(new Date().toISOString(), duracaoHoras),
                  }}
                  recursos={recursos}
                  onChangeRecursos={setRecursos}
                  itens={itens}
                  onChangeItens={setItens}
                />
              </Card>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleValidar}
                    disabled={!podeAgendar}
                  >
                    Validar
                  </Button>
                  <Button onClick={handleAgendar} disabled={!podeAgendar}>
                    Agendar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
