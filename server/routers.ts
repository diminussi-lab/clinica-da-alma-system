import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import {
  createLocalSessionToken,
  getConfiguredLocalCredentials,
  validateLocalPassword,
} from "./_core/localSession";

const optionalTrimmedString = z
  .union([z.string().trim().min(1), z.literal("")])
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalEmail = z
  .union([z.string().trim().email(), z.literal("")])
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const clientInputSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: optionalEmail,
  phone: optionalTrimmedString,
  dateOfBirth: optionalTrimmedString,
  address: optionalTrimmedString,
  city: optionalTrimmedString,
  state: optionalTrimmedString,
  zipCode: optionalTrimmedString,
  emergencyContact: optionalTrimmedString,
  emergencyPhone: optionalTrimmedString,
  notes: optionalTrimmedString,
});

const spaceInputSchema = z.object({
  name: z.string().trim().min(2),
  spaceType: optionalTrimmedString,
  description: optionalTrimmedString,
  address: optionalTrimmedString,
  city: optionalTrimmedString,
  state: optionalTrimmedString,
  onlineUrl: optionalTrimmedString,
  isActive: z.boolean().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),

    login: publicProcedure
      .input(
        z.object({
          password: z.string().min(1, "Informe a senha"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!validateLocalPassword(input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha inválida" });
        }

        const credentials = getConfiguredLocalCredentials();
        await db.upsertUser({
          openId: credentials.openId,
          name: credentials.name,
          email: credentials.email,
          loginMethod: "local",
          role: "admin",
          lastSignedIn: new Date(),
        });

        const user = await db.getUserByOpenId(credentials.openId);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível criar a sessão local.",
          });
        }

        const token = createLocalSessionToken(credentials.openId);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });

        return user;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getClientsByTherapist(ctx.user.id)),
    get: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getClientById(input.clientId)),
    create: protectedProcedure
      .input(clientInputSchema)
      .mutation(async ({ ctx, input }) => db.createClient(ctx.user.id, input)),
    update: protectedProcedure
      .input(clientInputSchema.partial().extend({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        const { clientId, ...data } = input;
        return db.updateClient(clientId, data);
      }),
    delete: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => db.deleteClient(input.clientId)),
  }),

  therapeuticSpaces: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getTherapeuticSpacesByTherapist(ctx.user.id)),
    create: protectedProcedure
      .input(spaceInputSchema)
      .mutation(async ({ ctx, input }) => db.createTherapeuticSpace(ctx.user.id, input)),
    update: protectedProcedure
      .input(spaceInputSchema.partial().extend({ spaceId: z.number() }))
      .mutation(async ({ input }) => {
        const { spaceId, ...data } = input;
        return db.updateTherapeuticSpace(spaceId, data);
      }),
  }),

  therapeuticRecords: router({
    get: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getTherapeuticRecordByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        mainComplaint: optionalTrimmedString,
        medicalHistory: optionalTrimmedString,
        emotionalBlockages: optionalTrimmedString,
        personalGoals: optionalTrimmedString,
        notes: optionalTrimmedString,
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createTherapeuticRecord(clientId, ctx.user.id, data);
      }),
    update: protectedProcedure
      .input(z.object({
        recordId: z.number(),
        mainComplaint: optionalTrimmedString,
        medicalHistory: optionalTrimmedString,
        emotionalBlockages: optionalTrimmedString,
        personalGoals: optionalTrimmedString,
        notes: optionalTrimmedString,
      }))
      .mutation(async ({ input }) => {
        const { recordId, ...data } = input;
        return db.updateTherapeuticRecord(recordId, data);
      }),
  }),

  sessions: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getSessionsByClient(input.clientId)),
    listByTherapist: protectedProcedure.query(async ({ ctx }) => db.getSessionsByTherapist(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        therapeuticSpaceId: z.number().optional(),
        sessionDate: z.date(),
        duration: z.number().optional(),
        sessionNotes: optionalTrimmedString,
        emotionalState: optionalTrimmedString,
        energeticState: optionalTrimmedString,
        techniques: optionalTrimmedString,
        sessionType: z.enum(["individual", "group", "online"]).optional(),
        price: z.string().optional(),
        paid: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createSession(clientId, ctx.user.id, data);
      }),
    update: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        therapeuticSpaceId: z.number().optional(),
        sessionDate: z.date().optional(),
        duration: z.number().optional(),
        sessionNotes: optionalTrimmedString,
        emotionalState: optionalTrimmedString,
        energeticState: optionalTrimmedString,
        techniques: optionalTrimmedString,
        sessionType: z.enum(["individual", "group", "online"]).optional(),
        price: z.string().optional(),
        paid: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { sessionId, ...data } = input;
        return db.updateSession(sessionId, data);
      }),
  }),

  appointments: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getAppointmentsByClient(input.clientId)),
    listByTherapist: protectedProcedure.query(async ({ ctx }) => db.getAppointmentsByTherapist(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        therapeuticSpaceId: z.number().optional(),
        appointmentDate: z.date(),
        duration: z.number().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        notes: optionalTrimmedString,
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createAppointment(clientId, ctx.user.id, data);
      }),
    update: protectedProcedure
      .input(z.object({
        appointmentId: z.number(),
        therapeuticSpaceId: z.number().optional(),
        appointmentDate: z.date().optional(),
        duration: z.number().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        notes: optionalTrimmedString,
      }))
      .mutation(async ({ input }) => {
        const { appointmentId, ...data } = input;
        return db.updateAppointment(appointmentId, data);
      }),
  }),

  audioFiles: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getAudioFilesByClient(input.clientId)),
    listByTherapist: protectedProcedure.query(async ({ ctx }) => db.getAudioFilesByTherapist(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        sessionId: z.number().optional(),
        protocolId: z.number().optional(),
        title: z.string(),
        description: optionalTrimmedString,
        audioUrl: z.string(),
        audioKey: z.string(),
        duration: z.number().optional(),
        fileType: optionalTrimmedString,
        fileSize: z.number().optional(),
        audioType: z.enum(["meditation", "session_recording", "personal_note", "protocol_audio", "other"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => db.createAudioFile(ctx.user.id, input)),
  }),

  emotionalEvolution: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getEmotionalEvolutionByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        recordDate: z.date(),
        emotionalState: z.number().min(1).max(10).optional(),
        anxiety: z.number().min(1).max(10).optional(),
        depression: z.number().min(1).max(10).optional(),
        wellbeing: z.number().min(1).max(10).optional(),
        energeticState: z.number().min(1).max(10).optional(),
        energyNotes: optionalTrimmedString,
        notes: optionalTrimmedString,
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createEmotionalEvolution(clientId, ctx.user.id, data);
      }),
  }),

  therapistObservations: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getTherapistObservationsByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        sessionId: z.number().optional(),
        title: optionalTrimmedString,
        observation: z.string().trim().min(1),
        isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createTherapistObservation(clientId, ctx.user.id, data);
      }),
  }),

  treatmentEvolution: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getTreatmentEvolutionByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        sessionId: z.number().optional(),
        recordDate: z.date().optional(),
        progressSummary: optionalTrimmedString,
        therapeuticFocus: optionalTrimmedString,
        nextSteps: optionalTrimmedString,
        perceivedProgress: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createTreatmentEvolution(clientId, ctx.user.id, data);
      }),
  }),

  protocols: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getProtocolsByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        protocolName: z.string(),
        description: optionalTrimmedString,
        steps: optionalTrimmedString,
        frequency: optionalTrimmedString,
        duration: optionalTrimmedString,
        isActive: z.boolean().optional(),
        status: z.enum(["active", "paused", "completed", "archived"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return db.createProtocol(clientId, ctx.user.id, data);
      }),
    update: protectedProcedure
      .input(z.object({
        protocolId: z.number(),
        protocolName: z.string().optional(),
        description: optionalTrimmedString,
        steps: optionalTrimmedString,
        frequency: optionalTrimmedString,
        duration: optionalTrimmedString,
        isActive: z.boolean().optional(),
        status: z.enum(["active", "paused", "completed", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { protocolId, ...data } = input;
        return db.updateProtocol(protocolId, data);
      }),
  }),

  meditations: router({
    listByTherapist: protectedProcedure.query(async ({ ctx }) => db.getMeditationsByTherapist(ctx.user.id)),
    get: protectedProcedure
      .input(z.object({ meditationId: z.number() }))
      .query(async ({ input }) => db.getMeditationById(input.meditationId)),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: optionalTrimmedString,
        audioUrl: z.string(),
        audioKey: z.string(),
        duration: z.number().optional(),
        category: optionalTrimmedString,
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => db.createMeditation(ctx.user.id, input)),
  }),

  clientMeditations: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getClientMeditations(input.clientId)),
    assign: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        meditationId: z.number(),
        notes: optionalTrimmedString,
      }))
      .mutation(async ({ input }) => {
        const { clientId, meditationId, notes } = input;
        return db.assignMeditationToClient(clientId, meditationId, { notes });
      }),
    markCompleted: protectedProcedure
      .input(z.object({ clientMeditationId: z.number() }))
      .mutation(async ({ input }) => db.updateClientMeditation(input.clientMeditationId, {
        completed: true,
        completedDate: new Date(),
      })),
  }),

  uploads: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => db.getUploadsByClient(input.clientId)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        sessionId: z.number().optional(),
        therapeuticRecordId: z.number().optional(),
        title: optionalTrimmedString,
        fileName: z.string(),
        filePath: z.string(),
        fileUrl: optionalTrimmedString,
        mimeType: optionalTrimmedString,
        fileSize: z.number().optional(),
        kind: z.enum(["document", "image", "audio", "video", "report", "contract", "other"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => db.createUpload(ctx.user.id, input)),
  }),

  financialRecords: router({
    listByTherapist: protectedProcedure.query(async ({ ctx }) => db.getFinancialRecordsByTherapist(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        sessionId: z.number().optional(),
        amount: z.string(),
        description: optionalTrimmedString,
        recordType: z.enum(["income", "expense"]).optional(),
        paymentMethod: optionalTrimmedString,
        recordDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => db.createFinancialRecord(ctx.user.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
