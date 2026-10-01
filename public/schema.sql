-- ============================================================
-- Health Companion - Supabase PostgreSQL Schema
-- Personalized Health Management for Elderly Patients
-- Conditions: Hypertension, Type 2 Diabetes, Liver Disease
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- User information, caregiver links, emergency contacts
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  caregiver_link UUID REFERENCES public.profiles(id),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'mizo')),
  conditions JSONB DEFAULT '[]'::jsonb, -- Array of condition codes: ['hypertension', 'diabetes_t2', 'liver']
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. MEDICINES TABLE
-- Active medications with schedule and condition categorization
-- ============================================================
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule TEXT NOT NULL CHECK (schedule IN ('morning', 'afternoon', 'night')),
  meal_relation TEXT NOT NULL CHECK (meal_relation IN ('before_meal', 'after_meal', 'anytime')),
  condition_category TEXT NOT NULL CHECK (condition_category IN ('bp', 'diabetes', 'liver', 'general')),
  photo_url TEXT,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. VITALS LOGS TABLE
-- Blood Pressure and Blood Glucose readings
-- ============================================================
CREATE TABLE public.vitals_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bp', 'fasting_sugar', 'pp_sugar', 'random_sugar')),
  systolic INTEGER CHECK (systolic >= 0 AND systolic <= 300),
  diastolic INTEGER CHECK (diastolic >= 0 AND diastolic <= 200),
  glucose_value NUMERIC(5,1) CHECK (glucose_value >= 0 AND glucose_value <= 1000),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure BP readings have both values
  CONSTRAINT bp_requires_both CHECK (
    type != 'bp' OR (systolic IS NOT NULL AND diastolic IS NOT NULL)
  ),
  -- Ensure sugar readings have glucose value
  CONSTRAINT sugar_requires_value CHECK (
    type = 'bp' OR glucose_value IS NOT NULL
  )
);

-- ============================================================
-- 4. MEDICATION TRACKING TABLE
-- Daily medication taken/missed tracking
-- ============================================================
CREATE TABLE public.medication_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  schedule TEXT NOT NULL CHECK (schedule IN ('morning', 'afternoon', 'night')),
  taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(medicine_id, scheduled_date, schedule)
);

-- ============================================================
-- 5. APPOINTMENTS TABLE
-- Doctor visits and clinic appointments
-- ============================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  clinic TEXT,
  location TEXT,
  contact_number TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. DOCTORS TABLE
-- Doctor profiles for quick reference
-- ============================================================
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  clinic TEXT,
  location TEXT,
  contact_number TEXT,
  email TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. MEDICAL DOCUMENTS TABLE
-- Prescriptions, lab reports, imaging - with JSONB metrics
-- ============================================================
CREATE TABLE public.medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('prescription', 'lft', 'hba1c', 'lipid', 'kft', 'imaging', 'other')),
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'pdf', 'other')),
  test_date DATE,
  prescribing_doctor TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past')),
  metrics JSONB DEFAULT '{}'::jsonb, -- Key-value pairs for lab values
  notes TEXT,
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. VISIT NOTES TABLE
-- Notes from completed doctor visits
-- ============================================================
CREATE TABLE public.visit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  doctor_name TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT,
  diagnosis TEXT,
  advice TEXT,
  next_visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for Performance
-- ============================================================
CREATE INDEX idx_medicines_user_active ON public.medicines(user_id, is_active);
CREATE INDEX idx_vitals_user_type_date ON public.vitals_logs(user_id, type, logged_at DESC);
CREATE INDEX idx_vitals_user_date ON public.vitals_logs(user_id, logged_at DESC);
CREATE INDEX idx_appointments_user_date ON public.appointments(user_id, appointment_date);
CREATE INDEX idx_appointments_user_upcoming ON public.appointments(user_id, appointment_date) WHERE is_completed = false;
CREATE INDEX idx_documents_user_category ON public.medical_documents(user_id, category, test_date DESC);
CREATE INDEX idx_documents_user_status ON public.medical_documents(user_id, status);
CREATE INDEX idx_medication_tracking_user_date ON public.medication_tracking(user_id, scheduled_date);
CREATE INDEX idx_doctors_user ON public.doctors(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_notes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile and their caregiver's profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() = caregiver_link);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Medicines: Full CRUD for own records
CREATE POLICY "Users can view own medicines" ON public.medicines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own medicines" ON public.medicines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medicines" ON public.medicines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medicines" ON public.medicines
  FOR DELETE USING (auth.uid() = user_id);

-- Vitals Logs: Full CRUD for own records
CREATE POLICY "Users can view own vitals" ON public.vitals_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vitals" ON public.vitals_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals" ON public.vitals_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals" ON public.vitals_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Medication Tracking
CREATE POLICY "Users can view own tracking" ON public.medication_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tracking" ON public.medication_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracking" ON public.medication_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Appointments
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Doctors
CREATE POLICY "Users can view own doctors" ON public.doctors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own doctors" ON public.doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doctors" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own doctors" ON public.doctors
  FOR DELETE USING (auth.uid() = user_id);

-- Medical Documents
CREATE POLICY "Users can view own documents" ON public.medical_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" ON public.medical_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.medical_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.medical_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Visit Notes
CREATE POLICY "Users can view own visit notes" ON public.visit_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own visit notes" ON public.visit_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visit notes" ON public.visit_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS SETUP
-- ============================================================

-- Create storage buckets for different document types
-- Note: Run these in Supabase Dashboard > Storage or via API

-- Bucket for prescription images (compressed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('prescriptions', 'prescriptions', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']);

-- Bucket for lab report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lab-reports', 'lab-reports', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']);

-- Bucket for medicine photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('medicine-photos', 'medicine-photos', false, 2097152, ARRAY['image/jpeg', 'image/png']);

-- Storage RLS Policies
CREATE POLICY "Users can upload prescriptions" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own prescriptions" ON storage.objects
  FOR SELECT USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own prescriptions" ON storage.objects
  FOR DELETE USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload lab reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own lab reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own lab reports" ON storage.objects
  FOR DELETE USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload medicine photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medicine-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view medicine photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'medicine-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.medical_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA (Optional - for testing)
-- ============================================================
-- Insert sample data for development/testing
-- Replace 'YOUR_USER_UUID' with actual auth user UUID

/*
INSERT INTO public.medicines (user_id, name, dosage, schedule, meal_relation, condition_category, is_active) VALUES
('YOUR_USER_UUID', 'Amlodipine', '5mg', 'morning', 'before_meal', 'bp', true),
('YOUR_USER_UUID', 'Telmisartan', '40mg', 'morning', 'after_meal', 'bp', true),
('YOUR_USER_UUID', 'Metformin', '500mg', 'morning', 'after_meal', 'diabetes', true),
('YOUR_USER_UUID', 'Metformin', '500mg', 'night', 'after_meal', 'diabetes', true),
('YOUR_USER_UUID', 'Glimepiride', '1mg', 'morning', 'before_meal', 'diabetes', true),
('YOUR_USER_UUID', 'Ursodeoxycholic Acid', '300mg', 'night', 'after_meal', 'liver', true),
('YOUR_USER_UUID', 'Silymarin', '140mg', 'afternoon', 'after_meal', 'liver', true),
('YOUR_USER_UUID', 'Atorvastatin', '10mg', 'night', 'anytime', 'general', true);
*/
