import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// Initialize Supabase client for server-side operations
export const supabase = createClient(
  ENV.supabaseUrl || "",
  ENV.supabaseAnonKey || "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper functions for database operations
export const supabaseDb = {
  // Clients table operations
  async getClients(userId: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("therapist_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getClient(clientId: string, userId: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("therapist_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async createClient(clientData: any) {
    const { data, error } = await supabase
      .from("clients")
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClient(clientId: string, updates: any) {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Sessions table operations
  async getSessions(clientId: string) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("client_id", clientId)
      .order("session_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createSession(sessionData: any) {
    const { data, error } = await supabase
      .from("sessions")
      .insert([sessionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Emotional evolution table operations
  async getEmotionalEvolution(clientId: string) {
    const { data, error } = await supabase
      .from("emotional_evolution")
      .select("*")
      .eq("client_id", clientId)
      .order("recorded_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async recordEmotionalState(evolutionData: any) {
    const { data, error } = await supabase
      .from("emotional_evolution")
      .insert([evolutionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Meditations table operations
  async getMeditations(userId: string) {
    const { data, error } = await supabase
      .from("meditations")
      .select("*")
      .eq("therapist_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createMeditation(meditationData: any) {
    const { data, error } = await supabase
      .from("meditations")
      .insert([meditationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Financial records table operations
  async getFinancialRecords(userId: string) {
    const { data, error } = await supabase
      .from("financial_records")
      .select("*")
      .eq("therapist_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createFinancialRecord(recordData: any) {
    const { data, error } = await supabase
      .from("financial_records")
      .insert([recordData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Therapeutic records table operations
  async getTherapeuticRecord(clientId: string) {
    const { data, error } = await supabase
      .from("therapeutic_records")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // 404 is ok
    return data;
  },

  async createTherapeuticRecord(recordData: any) {
    const { data, error } = await supabase
      .from("therapeutic_records")
      .insert([recordData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTherapeuticRecord(recordId: string, updates: any) {
    const { data, error } = await supabase
      .from("therapeutic_records")
      .update(updates)
      .eq("id", recordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
