import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, sessions, appointments, therapeuticRecords, audioFiles, emotionalEvolution, protocols, meditations, clientMeditations, financialRecords } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== CLIENTS =====
export async function createClient(therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clients).values({
    therapistId,
    ...data,
  });
  return result;
}

export async function getClientsByTherapist(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).where(eq(clients.therapistId, therapistId));
}

export async function getClientById(clientId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateClient(clientId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(clients).set(data).where(eq(clients.id, clientId));
}

export async function deleteClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(clients).where(eq(clients.id, clientId));
}

// ===== THERAPEUTIC RECORDS =====
export async function createTherapeuticRecord(clientId: number, therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(therapeuticRecords).values({
    clientId,
    therapistId,
    ...data,
  });
}

export async function getTherapeuticRecordByClient(clientId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(therapeuticRecords).where(eq(therapeuticRecords.clientId, clientId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTherapeuticRecord(recordId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(therapeuticRecords).set(data).where(eq(therapeuticRecords.id, recordId));
}

// ===== SESSIONS =====
export async function createSession(clientId: number, therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(sessions).values({
    clientId,
    therapistId,
    ...data,
  });
}

export async function getSessionsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessions).where(eq(sessions.clientId, clientId));
}

export async function getSessionsByTherapist(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessions).where(eq(sessions.therapistId, therapistId));
}

export async function updateSession(sessionId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(sessions).set(data).where(eq(sessions.id, sessionId));
}

// ===== APPOINTMENTS =====
export async function createAppointment(clientId: number, therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(appointments).values({
    clientId,
    therapistId,
    ...data,
  });
}

export async function getAppointmentsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments).where(eq(appointments.clientId, clientId));
}

export async function getAppointmentsByTherapist(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments).where(eq(appointments.therapistId, therapistId));
}

export async function updateAppointment(appointmentId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(appointments).set(data).where(eq(appointments.id, appointmentId));
}

// ===== AUDIO FILES =====
export async function createAudioFile(therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(audioFiles).values({
    therapistId,
    ...data,
  });
}

export async function getAudioFilesByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(audioFiles).where(eq(audioFiles.clientId, clientId));
}

export async function getAudioFilesByTherapist(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(audioFiles).where(eq(audioFiles.therapistId, therapistId));
}

// ===== EMOTIONAL EVOLUTION =====
export async function createEmotionalEvolution(clientId: number, therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(emotionalEvolution).values({
    clientId,
    therapistId,
    ...data,
  });
}

export async function getEmotionalEvolutionByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(emotionalEvolution).where(eq(emotionalEvolution.clientId, clientId));
}

// ===== PROTOCOLS =====
export async function createProtocol(clientId: number, therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(protocols).values({
    clientId,
    therapistId,
    ...data,
  });
}

export async function getProtocolsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(protocols).where(eq(protocols.clientId, clientId));
}

export async function updateProtocol(protocolId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(protocols).set(data).where(eq(protocols.id, protocolId));
}

// ===== MEDITATIONS =====
export async function createMeditation(therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(meditations).values({
    therapistId,
    ...data,
  });
}

export async function getMeditationsByTherapist(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(meditations).where(eq(meditations.therapistId, therapistId));
}

export async function getMeditationById(meditationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(meditations).where(eq(meditations.id, meditationId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== CLIENT MEDITATIONS =====
export async function assignMeditationToClient(clientId: number, meditationId: number, data: any = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(clientMeditations).values({
    clientId,
    meditationId,
    ...data,
  });
}

export async function getClientMeditations(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clientMeditations).where(eq(clientMeditations.clientId, clientId));
}

export async function updateClientMeditation(clientMeditationId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(clientMeditations).set(data).where(eq(clientMeditations.id, clientMeditationId));
}

// ===== FINANCIAL RECORDS =====
export async function createFinancialRecord(therapistId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(financialRecords).values({
    therapistId,
    ...data,
  });
}

export async function getFinancialRecordsByTherapist(therapistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialRecords).where(eq(financialRecords.therapistId, therapistId));
}

export async function getFinancialRecordsByDateRange(therapistId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialRecords).where(
    and(
      eq(financialRecords.therapistId, therapistId),
    )
  );
}
