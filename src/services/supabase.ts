/**
 * Supabase Service Client
 * 
 * This module provides the service layer for interacting with Supabase.
 * It handles authentication, data operations, and file storage.
 * 
 * Configuration:
 * - Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * - Or configure directly in the createClient call
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Medicine, VitalLog, Appointment, MedicalDocument, Profile } from '../types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client with local storage for auth persistence
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// ============================================================
// AUTH SERVICE
// ============================================================
export const authService = {
  // Sign up with email
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { data, error };
  },

  // Sign in with email
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};

// ============================================================
// VITALS SERVICE
// ============================================================
export const vitalsService = {
  // Get vitals for date range
  async getVitals(startDate?: string, endDate?: string) {
    let query = supabase
      .from('vitals_logs')
      .select('*')
      .order('logged_at', { ascending: false });

    if (startDate) query = query.gte('logged_at', startDate);
    if (endDate) query = query.lte('logged_at', endDate);

    const { data, error } = await query;
    return { data: data as VitalLog[], error };
  },

  // Log a new vital reading
  async logVital(vital: Omit<VitalLog, 'id'>) {
    const { data, error } = await supabase
      .from('vitals_logs')
      .insert([vital])
      .select()
      .single();
    return { data, error };
  },

  // Get BP readings for chart
  async getBPReadings(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('vitals_logs')
      .select('*')
      .eq('type', 'bp')
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true });

    return { data: data as VitalLog[], error };
  },

  // Get sugar readings for chart
  async getSugarReadings(days: number = 7, type?: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('vitals_logs')
      .select('*')
      .neq('type', 'bp')
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true });

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    return { data: data as VitalLog[], error };
  },
};

// ============================================================
// MEDICINES SERVICE
// ============================================================
export const medicinesService = {
  // Get active medicines
  async getActiveMedicines() {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('is_active', true)
      .order('schedule');
    return { data: data as Medicine[], error };
  },

  // Get all medicines
  async getAllMedicines() {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as Medicine[], error };
  },

  // Add new medicine
  async addMedicine(medicine: Omit<Medicine, 'id'>) {
    const { data, error } = await supabase
      .from('medicines')
      .insert([medicine])
      .select()
      .single();
    return { data, error };
  },

  // Update medicine
  async updateMedicine(id: string, updates: Partial<Medicine>) {
    const { data, error } = await supabase
      .from('medicines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Toggle medicine active status
  async toggleActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('medicines')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Track medication taken
  async markTaken(medicineId: string, schedule: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('medication_tracking')
      .upsert({
        medicine_id: medicineId,
        scheduled_date: today,
        schedule,
        taken: true,
        taken_at: new Date().toISOString(),
      }, {
        onConflict: 'medicine_id,scheduled_date,schedule',
      })
      .select()
      .single();
    return { data, error };
  },

  // Get today's medication status
  async getTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('medication_tracking')
      .select('*')
      .eq('scheduled_date', today);
    return { data, error };
  },
};

// ============================================================
// APPOINTMENTS SERVICE
// ============================================================
export const appointmentsService = {
  // Get upcoming appointments
  async getUpcoming() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('is_completed', false)
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true });
    return { data: data as Appointment[], error };
  },

  // Get all appointments
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });
    return { data: data as Appointment[], error };
  },

  // Create appointment
  async create(appointment: Omit<Appointment, 'id'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    return { data, error };
  },

  // Mark as completed
  async markCompleted(id: string, notes?: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ is_completed: true, follow_up_notes: notes })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
};

// ============================================================
// DOCUMENTS SERVICE
// ============================================================
export const documentsService = {
  // Get documents by category
  async getByCategory(category?: string) {
    let query = supabase
      .from('medical_documents')
      .select('*')
      .order('test_date', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    return { data: data as MedicalDocument[], error };
  },

  // Upload document with compressed image
  async uploadDocument(
    file: File,
    metadata: {
      category: MedicalDocument['category'];
      title: string;
      test_date: string;
      prescribing_doctor?: string;
      metrics?: Record<string, number>;
    }
  ) {
    // Compress image before upload (client-side)
    // In production, use flutter_image_compress equivalent
    const compressedFile = await compressImage(file);

    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const bucket = metadata.category === 'prescription' ? 'prescriptions' : 'lab-reports';
    const filePath = `${supabase.auth.getUser()}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) return { data: null, error: uploadError };

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // Create document record
    const { data: docData, error: docError } = await supabase
      .from('medical_documents')
      .insert([{
        ...metadata,
        file_url: publicUrl,
        file_type: file.type.startsWith('image') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'other',
      }])
      .select()
      .single();

    return { data: docData, error: docError };
  },

  // Get latest lab results
  async getLatestLabs() {
    const categories = ['lft', 'hba1c', 'lipid', 'kft'];
    const results: Record<string, MedicalDocument | null> = {};

    for (const category of categories) {
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .order('test_date', { ascending: false })
        .limit(1)
        .single();

      results[category] = data as MedicalDocument;
    }

    return results;
  },
};

// ============================================================
// PROFILE SERVICE
// ============================================================
export const profileService = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data: data as Profile, error };
  },

  async updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  },
};

// ============================================================
// HELPER: Image Compression
// ============================================================
async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// ============================================================
// DOCTOR VIEW SUMMARY GENERATOR
// ============================================================
export const summaryService = {
  async generateClinicSummary() {
    // Fetch all needed data in parallel
    const [medicinesResult, bpResult, sugarResult, labsResult] = await Promise.all([
      medicinesService.getActiveMedicines(),
      vitalsService.getBPReadings(30),
      vitalsService.getSugarReadings(30, 'fasting_sugar'),
      documentsService.getLatestLabs(),
    ]);

    const bp7 = bpResult.data?.filter(v => {
      const d = new Date(v.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }) || [];

    const bp30 = bpResult.data || [];
    const sugar7 = sugarResult.data?.filter(v => {
      const d = new Date(v.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }) || [];

    const sugar30 = sugarResult.data || [];

    return {
      medications: medicinesResult.data || [],
      bp: {
        avg7: calculateAverage(bp7, 'systolic', 'diastolic'),
        avg30: calculateAverage(bp30, 'systolic', 'diastolic'),
      },
      sugar: {
        avg7: calculateSugarAverage(sugar7),
        avg30: calculateSugarAverage(sugar30),
      },
      labs: labsResult,
      generatedAt: new Date().toISOString(),
    };
  },
};

function calculateAverage(readings: VitalLog[], _sysKey: string, _diaKey: string) {
  if (readings.length === 0) return { systolic: 0, diastolic: 0, count: 0 };
  const systolic = Math.round(readings.reduce((sum, v) => sum + (v.systolic || 0), 0) / readings.length);
  const diastolic = Math.round(readings.reduce((sum, v) => sum + (v.diastolic || 0), 0) / readings.length);
  return { systolic, diastolic, count: readings.length };
}

function calculateSugarAverage(readings: VitalLog[]) {
  if (readings.length === 0) return { value: 0, count: 0 };
  const value = Math.round(readings.reduce((sum, v) => sum + (v.glucose_value || 0), 0) / readings.length);
  return { value, count: readings.length };
}
