import { supabase, isSupabaseConfigured } from './supabaseClient';

// Sync data to Supabase
export async function syncToSupabase(userId: string, data: {
  profile?: any;
  medicines?: any[];
  vitals?: any[];
  appointments?: any[];
  documents?: any[];
  medicationStatus?: any[];
  doctors?: any[];
}) {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured, skipping sync');
    return { success: false, error: 'Not configured' };
  }

  try {
    // Sync profile
    if (data.profile) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...data.profile });
      if (error) console.error('Profile sync error:', error);
    }

    // Sync medicines
    if (data.medicines) {
      const { error } = await supabase
        .from('medicines')
        .upsert(data.medicines.map(m => ({ ...m, user_id: userId })));
      if (error) console.error('Medicines sync error:', error);
    }

    // Sync vitals
    if (data.vitals) {
      const { error } = await supabase
        .from('vitals_logs')
        .upsert(data.vitals.map(v => ({ ...v, user_id: userId })));
      if (error) console.error('Vitals sync error:', error);
    }

    // Sync appointments
    if (data.appointments) {
      const { error } = await supabase
        .from('appointments')
        .upsert(data.appointments.map(a => ({ ...a, user_id: userId })));
      if (error) console.error('Appointments sync error:', error);
    }

    // Sync documents
    if (data.documents) {
      const { error } = await supabase
        .from('medical_documents')
        .upsert(data.documents.map(d => ({ ...d, user_id: userId })));
      if (error) console.error('Documents sync error:', error);
    }

    // Sync doctors
    if (data.doctors) {
      const { error } = await supabase
        .from('doctors')
        .upsert(data.doctors.map(d => ({ ...d, user_id: userId })));
      if (error) console.error('Doctors sync error:', error);
    }

    console.log('✅ Data synced to Supabase');
    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: String(error) };
  }
}

// Load data from Supabase
export async function loadFromSupabase(userId: string) {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured, skipping load');
    return null;
  }

  try {
    // Load profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile load error:', profileError);
    }

    // Load medicines
    const { data: medicines, error: medsError } = await supabase
      .from('medicines')
      .select('*')
      .eq('user_id', userId);

    if (medsError) console.error('Medicines load error:', medsError);

    // Load vitals
    const { data: vitals, error: vitalsError } = await supabase
      .from('vitals_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (vitalsError) console.error('Vitals load error:', vitalsError);

    // Load appointments
    const { data: appointments, error: apptsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId);

    if (apptsError) console.error('Appointments load error:', apptsError);

    // Load documents
    const { data: documents, error: docsError } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('user_id', userId);

    if (docsError) console.error('Documents load error:', docsError);

    // Load doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId);

    if (doctorsError) console.error('Doctors load error:', doctorsError);

    console.log('✅ Data loaded from Supabase');
    return {
      profile: profile || undefined,
      medicines: medicines || [],
      vitals: vitals || [],
      appointments: appointments || [],
      documents: documents || [],
      doctors: doctors || [],
    };
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
}
