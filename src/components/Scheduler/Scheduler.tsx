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
import StepOneProcedureSelector from "./StepOneProcedureSelector";
import EmployeeAvailabilitySelector from "./EmployeeAvailabilitySelector";
import EquipmentAvailabilitySelector from "./EquipmentAvailabilitySelector";
import type { Slot } from "./types";

// adapter
import {
  listCentros,
  listSalas,
  listMedicos,
  searchSlots,
} from "../../api/scheduleAdapter";
import SearchEmployeesModal from "./modal/SearchEmployeesModal";
import { DialogOverlay } from "@radix-ui/react-dialog";

const addHours = (startIso: string, hours: number) =>
  new Date(new Date(startIso).getTime() + hours * 3600000).toISOString();

export default function Scheduler({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [pacienteId, setPacienteId] = useState("12345678900");
  const [procedimento, setProcedimento] = useState("Colecistectomia");
  const [duracaoHoras, setDuracaoHoras] = useState(2);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  const [centroId, setCentroId] = useState<number | undefined>();
  const [medicoRespId, setMedicoRespId] = useState<number | undefined>();
  const [salaId, setSalaId] = useState<number | undefined>();

  const [centros, setCentros] = useState<{ id: number; nome: string }[]>([]);
  const [salas, setSalas] = useState<{ id: number; nome: string }[]>([]);
  const [medicos, setMedicos] = useState<{ id: number; nome: string }[]>([]);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSelecionado, setSlotSelecionado] = useState<Slot | null>(null);

  // Step 2/3
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // janela baseada na data
  const janela = useMemo(() => {
    const start = new Date(`${data}T07:00:00`).toISOString();
    const end = new Date(`${data}T19:00:00`).toISOString();
    return { start, end };
  }, [data]);

  // carregamentos
  useEffect(() => {
    listCentros()
      .then(setCentros)
      .catch(() => setCentros([]));
    listMedicos()
      .then(setMedicos)
      .catch(() => setMedicos([]));
  }, []);

  useEffect(() => {
    if (!centroId) {
      setSalas([]);
      setSalaId(undefined);
      return;
    }
    listSalas(centroId)
      .then((ss) => setSalas(ss.map((s) => ({ id: s.id, nome: s.nome }))))
      .catch(() => setSalas([]));
    setSalaId(undefined);
  }, [centroId]);

  // limpa slot ao mudar filtros
  useEffect(() => {
    setSlotSelecionado(null);
  }, [data, centroId, salaId, medicoRespId]);

  // consulta horários — envia só filtros definidos
  const [slotsLoading, setSlotsLoading] = useState(false);
  const handleConsultar = async () => {
    if (typeof centroId !== "number") return;
    setSlotsLoading(true);
    try {
      const params: any = {
        date: data,
        centroId,
        ...(typeof salaId === "number" ? { salaId } : {}),
        ...(typeof medicoRespId === "number"
          ? { profissionalId: medicoRespId }
          : {}),
      };
      const result = await searchSlots(params);
      setSlots(result);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const inicioSelecionado = slotSelecionado?.inicio ?? null;
  const fimSelecionado = inicioSelecionado
    ? addHours(inicioSelecionado, duracaoHoras)
    : null;

  const podeAvancar1 =
    !!pacienteId &&
    !!procedimento &&
    !!duracaoHoras &&
    !!centroId &&
    !!slotSelecionado;

  const podeAgendar = !!podeAvancar1;

  const resetAll = () => {
    setStep(1);
    setPacienteId("12345678900");
    setProcedimento("Colecistectomia");
    setDuracaoHoras(2);
    setData(new Date().toISOString().slice(0, 10));
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

  const handleValidar = () => {
    if (!podeAgendar) return;
    setStep(3);
  };
  const handleAgendar = () => {
    if (!podeAgendar) return;
    alert("(mock) Procedimento agendado!");
    onCloseInternal();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onCloseInternal() : null)}>
      <DialogOverlay className="w-[100vw]" />
      <DialogContent className="w-[90vw] max-w-none max-h-[95vh]  rounded-2xl p-8">
        <div className="overflow-y-auto max-h-[80vh]">
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Cadastro de Cirurgia</DialogTitle>
              <DialogDescription>
                Preencha as 3 etapas para agendar o procedimento (mock).
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* stepper */}
          <div className="px-6 pt-4 ">
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

          {/* conteúdo */}
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
                  onConsultar={handleConsultar}
                  slotsLoading={slotsLoading}
                  centros={centros}
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

                {/* modal de busca por cima */}
                <SearchEmployeesModal
                  open={searchOpen}
                  onClose={() => setSearchOpen(false)}
                  janela={{
                    inicio: inicioSelecionado ?? new Date().toISOString(),
                    fim:
                      fimSelecionado ??
                      addHours(new Date().toISOString(), duracaoHoras),
                  }}
                  onSelect={(novos) => {
                    setFuncionarios((prev) => {
                      const ids = new Set(prev.map((p: any) => p.id));
                      return [...prev, ...novos.filter((n) => !ids.has(n.id))];
                    });
                  }}
                />

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
