import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import type { InsertUser, User } from "../drizzle/schema";

let supabase: SupabaseClient | null = null;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
}

function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

export function getSupabaseAdmin() {
  if (supabase) return supabase;

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel."
    );
  }

  supabase = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toDateOnly(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return value;
}

function toIso(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function removeUndefinedValues<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

const camelToSnakeMap: Record<string, string> = {
  openId: "open_id",
  loginMethod: "login_method",
  createdAt: "created_at",
  updatedAt: "updated_at",
  lastSignedIn: "last_signed_in",
  therapistId: "therapist_id",
  clientId: "client_id",
  dateOfBirth: "date_of_birth",
  zipCode: "zip_code",
  emergencyContact: "emergency_contact",
  emergencyPhone: "emergency_phone",
  isActive: "is_active",
  mainComplaint: "main_complaint",
  medicalHistory: "medical_history",
  emotionalBlockages: "emotional_blockages",
  personalGoals: "personal_goals",
  sessionDate: "session_date",
  sessionNotes: "session_notes",
  emotionalState: "emotional_state",
  energeticState: "energetic_state",
  sessionType: "session_type",
  appointmentDate: "appointment_date",
  reminderSent: "reminder_sent",
  audioUrl: "audio_url",
  audioKey: "audio_key",
  fileType: "file_type",
  fileSize: "file_size",
  audioType: "audio_type",
  recordDate: "record_date",
  energyNotes: "energy_notes",
  protocolName: "protocol_name",
  recommendedDate: "recommended_date",
  completedDate: "completed_date",
  meditationId: "meditation_id",
  clientMeditationId: "client_meditation_id",
  sessionId: "session_id",
  recordType: "record_type",
  paymentMethod: "payment_method",
  therapeuticSpaceId: "therapeutic_space_id",
  protocolId: "protocol_id",
  therapeuticRecordId: "therapeutic_record_id",
  fileName: "file_name",
  filePath: "file_path",
  fileUrl: "file_url",
  mimeType: "mime_type",
  isPrivate: "is_private",
  progressSummary: "progress_summary",
  therapeuticFocus: "therapeutic_focus",
  nextSteps: "next_steps",
  perceivedProgress: "perceived_progress",
};

const snakeToCamelMap = Object.fromEntries(
  Object.entries(camelToSnakeMap).map(([camel, snake]) => [snake, camel])
);

function camelToSnake(key: string) {
  return camelToSnakeMap[key] ?? key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(key: string) {
  return snakeToCamelMap[key] ?? key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toSnake(data: Record<string, unknown>) {
  const normalized = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [camelToSnake(key), normalizeOptionalString(value)])
  );

  if (typeof normalized.state === "string") {
    normalized.state = normalized.state.toUpperCase().slice(0, 2);
  }

  if ("date_of_birth" in normalized) normalized.date_of_birth = toDateOnly(normalized.date_of_birth);
  if ("record_date" in normalized) normalized.record_date = toDateOnly(normalized.record_date);
  if ("session_date" in normalized) normalized.session_date = toIso(normalized.session_date);
  if ("appointment_date" in normalized) normalized.appointment_date = toIso(normalized.appointment_date);
  if ("recommended_date" in normalized) normalized.recommended_date = toIso(normalized.recommended_date);
  if ("completed_date" in normalized) normalized.completed_date = toIso(normalized.completed_date);
  if ("last_signed_in" in normalized) normalized.last_signed_in = toIso(normalized.last_signed_in);

  return removeUndefinedValues(normalized);
}

function toCamel<T = any>(row: any): T {
  if (!row || typeof row !== "object") return row;
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [snakeToCamel(key), value])
  ) as T;
}

async function selectMany<T = any>(table: string, filters: Record<string, unknown> = {}) {
  let query = getSupabaseAdmin().from(table).select("*");
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(camelToSnake(key), value as any);
  });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => toCamel<T>(row));
}

async function selectOne<T = any>(table: string, filters: Record<string, unknown>) {
  let query = getSupabaseAdmin().from(table).select("*").limit(1);
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(camelToSnake(key), value as any);
  });
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? toCamel<T>(data) : null;
}

async function insertOne<T = any>(table: string, data: Record<string, unknown>) {
  const { data: inserted, error } = await getSupabaseAdmin()
    .from(table)
    .insert(toSnake(data))
    .select("*")
    .single();
  if (error) throw error;
  return toCamel<T>(inserted);
}

async function updateById<T = any>(table: string, id: number, data: Record<string, unknown>) {
  const { data: updated, error } = await getSupabaseAdmin()
    .from(table)
    .update(toSnake(data))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toCamel<T>(updated);
}

async function deleteById(table: string, id: number) {
  const { error } = await getSupabaseAdmin().from(table).delete().eq("id", id);
  if (error) throw error;
  return { success: true } as const;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const { error } = await getSupabaseAdmin()
    .from("users")
    .upsert(toSnake({ ...user, loginMethod: user.loginMethod ?? "local" }), {
      onConflict: "open_id",
    });

  if (error) throw error;
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const user = await selectOne<User>("users", { openId });
  return user ?? undefined;
}

export async function createClient(therapistId: number, data: any) {
  return insertOne("clients", { therapistId, ...data });
}

export async function getClientsByTherapist(therapistId: number) {
  return selectMany("clients", { therapistId });
}

export async function getClientById(clientId: number) {
  return selectOne("clients", { id: clientId });
}

export async function updateClient(clientId: number, data: any) {
  return updateById("clients", clientId, data);
}

export async function deleteClient(clientId: number) {
  return deleteById("clients", clientId);
}

export async function createTherapeuticSpace(therapistId: number, data: any) {
  return insertOne("therapeutic_spaces", { therapistId, ...data });
}

export async function getTherapeuticSpacesByTherapist(therapistId: number) {
  return selectMany("therapeutic_spaces", { therapistId });
}

export async function updateTherapeuticSpace(spaceId: number, data: any) {
  return updateById("therapeutic_spaces", spaceId, data);
}

export async function createTherapeuticRecord(clientId: number, therapistId: number, data: any) {
  return insertOne("therapeutic_records", { clientId, therapistId, ...data });
}

export async function getTherapeuticRecordByClient(clientId: number) {
  return selectOne("therapeutic_records", { clientId });
}

export async function updateTherapeuticRecord(recordId: number, data: any) {
  return updateById("therapeutic_records", recordId, data);
}

export async function createSession(clientId: number, therapistId: number, data: any) {
  return insertOne("sessions", { clientId, therapistId, ...data });
}

export async function getSessionsByClient(clientId: number) {
  return selectMany("sessions", { clientId });
}

export async function getSessionsByTherapist(therapistId: number) {
  return selectMany("sessions", { therapistId });
}

export async function updateSession(sessionId: number, data: any) {
  return updateById("sessions", sessionId, data);
}

export async function createAppointment(clientId: number, therapistId: number, data: any) {
  return insertOne("appointments", { clientId, therapistId, ...data });
}

export async function getAppointmentsByClient(clientId: number) {
  return selectMany("appointments", { clientId });
}

export async function getAppointmentsByTherapist(therapistId: number) {
  return selectMany("appointments", { therapistId });
}

export async function updateAppointment(appointmentId: number, data: any) {
  return updateById("appointments", appointmentId, data);
}

export async function createAudioFile(therapistId: number, data: any) {
  return insertOne("audio_files", { therapistId, ...data });
}

export async function getAudioFilesByClient(clientId: number) {
  return selectMany("audio_files", { clientId });
}

export async function getAudioFilesByTherapist(therapistId: number) {
  return selectMany("audio_files", { therapistId });
}

export async function createEmotionalEvolution(clientId: number, therapistId: number, data: any) {
  return insertOne("emotional_evolution", { clientId, therapistId, ...data });
}

export async function getEmotionalEvolutionByClient(clientId: number) {
  return selectMany("emotional_evolution", { clientId });
}

export async function createTherapistObservation(clientId: number, therapistId: number, data: any) {
  return insertOne("therapist_observations", { clientId, therapistId, ...data });
}

export async function getTherapistObservationsByClient(clientId: number) {
  return selectMany("therapist_observations", { clientId });
}

export async function createTreatmentEvolution(clientId: number, therapistId: number, data: any) {
  return insertOne("treatment_evolution", { clientId, therapistId, ...data });
}

export async function getTreatmentEvolutionByClient(clientId: number) {
  return selectMany("treatment_evolution", { clientId });
}

export async function createProtocol(clientId: number, therapistId: number, data: any) {
  return insertOne("protocols", { clientId, therapistId, ...data });
}

export async function getProtocolsByClient(clientId: number) {
  return selectMany("protocols", { clientId });
}

export async function updateProtocol(protocolId: number, data: any) {
  return updateById("protocols", protocolId, data);
}

export async function createMeditation(therapistId: number, data: any) {
  return insertOne("meditations", { therapistId, ...data });
}

export async function getMeditationsByTherapist(therapistId: number) {
  return selectMany("meditations", { therapistId });
}

export async function getMeditationById(meditationId: number) {
  return selectOne("meditations", { id: meditationId });
}

export async function assignMeditationToClient(clientId: number, meditationId: number, data: any = {}) {
  return insertOne("client_meditations", { clientId, meditationId, ...data });
}

export async function getClientMeditations(clientId: number) {
  return selectMany("client_meditations", { clientId });
}

export async function updateClientMeditation(clientMeditationId: number, data: any) {
  return updateById("client_meditations", clientMeditationId, data);
}

export async function createUpload(therapistId: number, data: any) {
  return insertOne("uploads", { therapistId, ...data });
}

export async function getUploadsByClient(clientId: number) {
  return selectMany("uploads", { clientId });
}

export async function createFinancialRecord(therapistId: number, data: any) {
  return insertOne("financial_records", { therapistId, ...data });
}

export async function getFinancialRecordsByTherapist(therapistId: number) {
  return selectMany("financial_records", { therapistId });
}

export async function getFinancialRecordsByDateRange(therapistId: number, startDate: Date, endDate: Date) {
  const { data, error } = await getSupabaseAdmin()
    .from("financial_records")
    .select("*")
    .eq("therapist_id", therapistId)
    .gte("record_date", toDateOnly(startDate))
    .lte("record_date", toDateOnly(endDate));

  if (error) throw error;
  return (data ?? []).map((row) => toCamel(row));
}
