import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clientes (Pacientes) do sistema terapêutico
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: date("dateOfBirth"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  emergencyContact: varchar("emergencyContact", { length: 255 }),
  emergencyPhone: varchar("emergencyPhone", { length: 20 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Prontuário Terapêutico
 */
export const therapeuticRecords = mysqlTable("therapeutic_records", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  mainComplaint: text("mainComplaint"),
  medicalHistory: text("medicalHistory"),
  emotionalBlockages: text("emotionalBlockages"),
  personalGoals: text("personalGoals"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TherapeuticRecord = typeof therapeuticRecords.$inferSelect;
export type InsertTherapeuticRecord = typeof therapeuticRecords.$inferInsert;

/**
 * Sessões Terapêuticas
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  sessionDate: timestamp("sessionDate").notNull(),
  duration: int("duration"), // em minutos
  sessionNotes: text("sessionNotes"),
  emotionalState: varchar("emotionalState", { length: 100 }),
  techniques: text("techniques"),
  sessionType: mysqlEnum("sessionType", ["individual", "group", "online"]).default("individual"),
  price: decimal("price", { precision: 10, scale: 2 }),
  paid: boolean("paid").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Agenda de Agendamentos
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  appointmentDate: timestamp("appointmentDate").notNull(),
  duration: int("duration").default(60), // em minutos
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled"),
  notes: text("notes"),
  reminderSent: boolean("reminderSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Áudios (Meditações, Registros de Voz, etc)
 */
export const audioFiles = mysqlTable("audio_files", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  therapistId: int("therapistId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: text("audioUrl").notNull(),
  audioKey: varchar("audioKey", { length: 255 }).notNull(),
  duration: int("duration"), // em segundos
  fileType: varchar("fileType", { length: 50 }),
  fileSize: int("fileSize"), // em bytes
  audioType: mysqlEnum("audioType", ["meditation", "session_recording", "personal_note", "other"]).default("other"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AudioFile = typeof audioFiles.$inferSelect;
export type InsertAudioFile = typeof audioFiles.$inferInsert;

/**
 * Evolução Emocional
 */
export const emotionalEvolution = mysqlTable("emotional_evolution", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  recordDate: date("recordDate").notNull(),
  emotionalState: int("emotionalState"), // 1-10 scale
  anxiety: int("anxiety"), // 1-10 scale
  depression: int("depression"), // 1-10 scale
  wellbeing: int("wellbeing"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmotionalEvolution = typeof emotionalEvolution.$inferSelect;
export type InsertEmotionalEvolution = typeof emotionalEvolution.$inferInsert;

/**
 * Protocolos Personalizados
 */
export const protocols = mysqlTable("protocols", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  therapistId: int("therapistId").notNull(),
  protocolName: varchar("protocolName", { length: 255 }).notNull(),
  description: text("description"),
  steps: text("steps"),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = typeof protocols.$inferInsert;

/**
 * Meditações (Biblioteca)
 */
export const meditations = mysqlTable("meditations", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: text("audioUrl").notNull(),
  audioKey: varchar("audioKey", { length: 255 }).notNull(),
  duration: int("duration"), // em segundos
  category: varchar("category", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meditation = typeof meditations.$inferSelect;
export type InsertMeditation = typeof meditations.$inferInsert;

/**
 * Relação Cliente-Meditação (para rastrear meditações recomendadas)
 */
export const clientMeditations = mysqlTable("client_meditations", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  meditationId: int("meditationId").notNull(),
  recommendedDate: timestamp("recommendedDate").defaultNow(),
  completed: boolean("completed").default(false),
  completedDate: timestamp("completedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientMeditation = typeof clientMeditations.$inferSelect;
export type InsertClientMeditation = typeof clientMeditations.$inferInsert;

/**
 * Financeiro (Receitas e Pagamentos)
 */
export const financialRecords = mysqlTable("financial_records", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull(),
  sessionId: int("sessionId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }),
  recordType: mysqlEnum("recordType", ["income", "expense"]).default("income"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  recordDate: date("recordDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;
