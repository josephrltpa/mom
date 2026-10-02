export interface Profile {
  id: string;
  full_name: string;
  date_of_birth?: string;
  emergency_contact?: string;
  caregiver_link?: string;
  language: 'en' | 'mizo';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  schedule: 'morning' | 'afternoon' | 'night' | 'custom';
  meal_relation: 'before_meal' | 'after_meal' | 'anytime';
  condition_category: 'bp' | 'diabetes' | 'liver' | 'general';
  photo_url?: string;
  is_active: boolean;
  color?: string;
  doctor_id?: string;
  reminder_times?: string[]; // Array of HH:MM format times for multiple daily reminders
}

export interface VitalLog {
  id: string;
  type: 'bp' | 'fasting_sugar' | 'pp_sugar' | 'random_sugar';
  systolic?: number;
  diastolic?: number;
  glucose_value?: number;
  timestamp: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string;
  clinic: string;
  location?: string;
  contact_number?: string;
  appointment_date: string;
  notes?: string;
  is_completed: boolean;
}

export interface MedicalDocument {
  id: string;
  category: 'prescription' | 'lft' | 'hba1c' | 'lipid' | 'kft' | 'imaging' | 'other';
  title: string;
  file_url?: string;
  test_date: string;
  prescribing_doctor?: string;
  status: 'active' | 'past';
  metrics?: Record<string, number>;
}

export type VitalStatus = 'normal' | 'borderline' | 'critical';

export interface DailyMedicationStatus {
  medicineId: string;
  schedule: 'morning' | 'afternoon' | 'night';
  taken: boolean;
  takenAt?: string;
}
