// scheduleAdapter.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Slot } from "@/components/Scheduler/types";
import {
  ScheduleService,
  type SurgeryCenter,
  type Room,
  type Booking,
} from "./ScheduleMock";

export type Centro = { id: number; nome: string };
export type Sala = { id: number; nome: string; centroId: number };
export type Medico = { id: number; nome: string };

// --- Mapas internos estáveis ---
const centerStrToNum = new Map<string, number>();
const centerNumToStr = new Map<number, string>();
const roomStrToNum = new Map<string, number>();
const roomNumToStr = new Map<number, string>();
const roomIdToCenterNum = new Map<number, number>();

// Médicos mock
const MOCK_MEDICOS: Medico[] = [
  { id: 1, nome: "Dra. Ana Souza" },
  { id: 2, nome: "Dr. Bruno Lima" },
  { id: 3, nome: "Dra. Carla Melo" },
];

// Sala → médico (mock)
const roomToMedicoId = new Map<string, number>([
  ["r1", 1],
  ["r2", 2],
  ["r3", 3],
  ["r4", 1],
  ["r5", 2],
]);

export async function listMedicos(_: number | undefined = undefined): Promise<Medico[]> {
  return MOCK_MEDICOS;
}

let seededCenters = false;
function seedCenters(centers: SurgeryCenter[]) {
  if (seededCenters) return;
  centers.forEach((c, idx) => {
    const num = 100 + idx; // c1=100, c2=101...
    centerStrToNum.set(c.id, num);
    centerNumToStr.set(num, c.id);
  });
  seededCenters = true;
}

// ⚠️ Importante: semear salas com a LISTA COMPLETA para manter ids estáveis
let seededRooms = false;
async function seedAllRooms() {
  if (seededRooms) return;
  const allRooms = await ScheduleService.getRooms(undefined); // todas as salas
  allRooms.forEach((r, idx) => {
    if (!roomStrToNum.has(r.id)) {
      const num = 1000 + idx; // r1=1000, r2=1001...
      roomStrToNum.set(r.id, num);
      roomNumToStr.set(num, r.id);
    }
    const cNum = centerStrToNum.get(r.centerId);
    if (cNum != null) roomIdToCenterNum.set(roomStrToNum.get(r.id)!, cNum);
  });
  seededRooms = true;
}

function hhmmToIso(date: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(h, m, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
}

// === APIs expostas ===
export async function listCentros(): Promise<Centro[]> {
  const centers = await ScheduleService.getSurgeryCenters();
  seedCenters(centers);
  await seedAllRooms(); // garante mapas de sala estáveis
  return centers.map((c, idx) => ({ id: 100 + idx, nome: c.name }));
}

export async function listSalas(centroId?: number): Promise<Sala[]> {
  const centers = await ScheduleService.getSurgeryCenters();
  seedCenters(centers);
  await seedAllRooms();

  const centerStr = centroId != null ? centerNumToStr.get(centroId) : undefined;
  const filteredRooms = await ScheduleService.getRooms(centerStr);

  return filteredRooms.map((r) => ({
    id: roomStrToNum.get(r.id)!,           // já mapeado estavelmente
    nome: r.name,
    centroId: centerStrToNum.get(r.centerId)!,
  }));
}

export async function searchSlots({
  date,
  centroId,
  salaId,
  profissionalId,
}: {
  date: string;
  centroId?: number;
  salaId?: number;
  profissionalId?: number; // responsável
}): Promise<Slot[]> {
  const centers = await ScheduleService.getSurgeryCenters();
  seedCenters(centers);
  await seedAllRooms();

  const centerStr = centroId != null ? centerNumToStr.get(centroId) : undefined;
  const roomStrs = salaId != null ? [roomNumToStr.get(salaId)!] : undefined;

  const bookings: Booking[] = await ScheduleService.getBookingsByDate(
    date,
    centerStr,
    roomStrs
  );

  // Mapa de rooms (somente do centro — mas ids já estão semeados globalmente)
  const rooms = await ScheduleService.getRooms(centerStr);
  const roomById = new Map(rooms.map((r) => [r.id, r]));

  let slots: Slot[] = bookings.map((b) => {
    const room = roomById.get(b.roomId);
    const salaIdNum = roomStrToNum.get(b.roomId);
    const medicoId = roomToMedicoId.get(b.roomId) ?? 1;
    const medicoNome = MOCK_MEDICOS.find((m) => m.id === medicoId)?.nome ?? "-";

    return {
      inicio: hhmmToIso(b.date, b.start),
      fim: hhmmToIso(b.date, b.end),
      salaId: salaIdNum,
      salaNome: room?.name ?? "-",
      medicoNome: medicoNome ?? "-",
      score: 1,
    };
  });

  // Filtro por responsável (mock)
  if (profissionalId) {
    const nome = MOCK_MEDICOS.find((m) => m.id === profissionalId)?.nome;
    if (nome) slots = slots.filter((s) => s.medicoNome === nome);
  }

  // mais recente → mais antigo
  slots.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
  return slots;
}
