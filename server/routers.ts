import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== CLIENTS =====
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientsByTherapist(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.clientId);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createClient(ctx.user.id, input);
      }),

    update: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { clientId, ...data } = input;
        return await db.updateClient(clientId, data);
      }),

    delete: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteClient(input.clientId);
      }),
  }),

  // ===== THERAPEUTIC RECORDS =====
  therapeuticRecords: router({
    get: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTherapeuticRecordByClient(input.clientId);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        mainComplaint: z.string().optional(),
        medicalHistory: z.string().optional(),
        emotionalBlockages: z.string().optional(),
        personalGoals: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return await db.createTherapeuticRecord(clientId, ctx.user.id, data);
      }),

    update: protectedProcedure
      .input(z.object({
        recordId: z.number(),
        mainComplaint: z.string().optional(),
        medicalHistory: z.string().optional(),
        emotionalBlockages: z.string().optional(),
        personalGoals: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { recordId, ...data } = input;
        return await db.updateTherapeuticRecord(recordId, data);
      }),
  }),

  // ===== SESSIONS =====
  sessions: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSessionsByClient(input.clientId);
      }),

    listByTherapist: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getSessionsByTherapist(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        sessionDate: z.date(),
        duration: z.number().optional(),
        sessionNotes: z.string().optional(),
        emotionalState: z.string().optional(),
        techniques: z.string().optional(),
        sessionType: z.enum(["individual", "group", "online"]).optional(),
        price: z.string().optional(),
        paid: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return await db.createSession(clientId, ctx.user.id, data);
      }),

    update: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        sessionDate: z.date().optional(),
        duration: z.number().optional(),
        sessionNotes: z.string().optional(),
        emotionalState: z.string().optional(),
        techniques: z.string().optional(),
        sessionType: z.enum(["individual", "group", "online"]).optional(),
        price: z.string().optional(),
        paid: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { sessionId, ...data } = input;
        return await db.updateSession(sessionId, data);
      }),
  }),

  // ===== APPOINTMENTS =====
  appointments: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAppointmentsByClient(input.clientId);
      }),

    listByTherapist: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getAppointmentsByTherapist(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        appointmentDate: z.date(),
        duration: z.number().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return await db.createAppointment(clientId, ctx.user.id, data);
      }),

    update: protectedProcedure
      .input(z.object({
        appointmentId: z.number(),
        appointmentDate: z.date().optional(),
        duration: z.number().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { appointmentId, ...data } = input;
        return await db.updateAppointment(appointmentId, data);
      }),
  }),

  // ===== AUDIO FILES =====
  audioFiles: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAudioFilesByClient(input.clientId);
      }),

    listByTherapist: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getAudioFilesByTherapist(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        audioUrl: z.string(),
        audioKey: z.string(),
        duration: z.number().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        audioType: z.enum(["meditation", "session_recording", "personal_note", "other"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAudioFile(ctx.user.id, input);
      }),
  }),

  // ===== EMOTIONAL EVOLUTION =====
  emotionalEvolution: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmotionalEvolutionByClient(input.clientId);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        recordDate: z.date(),
        emotionalState: z.number().optional(),
        anxiety: z.number().optional(),
        depression: z.number().optional(),
        wellbeing: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return await db.createEmotionalEvolution(clientId, ctx.user.id, data);
      }),
  }),

  // ===== PROTOCOLS =====
  protocols: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProtocolsByClient(input.clientId);
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        protocolName: z.string(),
        description: z.string().optional(),
        steps: z.string().optional(),
        frequency: z.string().optional(),
        duration: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { clientId, ...data } = input;
        return await db.createProtocol(clientId, ctx.user.id, data);
      }),

    update: protectedProcedure
      .input(z.object({
        protocolId: z.number(),
        protocolName: z.string().optional(),
        description: z.string().optional(),
        steps: z.string().optional(),
        frequency: z.string().optional(),
        duration: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { protocolId, ...data } = input;
        return await db.updateProtocol(protocolId, data);
      }),
  }),

  // ===== MEDITATIONS =====
  meditations: router({
    listByTherapist: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getMeditationsByTherapist(ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ meditationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMeditationById(input.meditationId);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        audioUrl: z.string(),
        audioKey: z.string(),
        duration: z.number().optional(),
        category: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createMeditation(ctx.user.id, input);
      }),
  }),

  // ===== CLIENT MEDITATIONS =====
  clientMeditations: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientMeditations(input.clientId);
      }),

    assign: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        meditationId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { clientId, meditationId, notes } = input;
        return await db.assignMeditationToClient(clientId, meditationId, { notes });
      }),

    markCompleted: protectedProcedure
      .input(z.object({
        clientMeditationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateClientMeditation(input.clientMeditationId, {
          completed: true,
          completedDate: new Date(),
        });
      }),
  }),

  // ===== FINANCIAL RECORDS =====
  financialRecords: router({
    listByTherapist: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getFinancialRecordsByTherapist(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        sessionId: z.number().optional(),
        amount: z.string(),
        description: z.string().optional(),
        recordType: z.enum(["income", "expense"]).optional(),
        paymentMethod: z.string().optional(),
        recordDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createFinancialRecord(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
