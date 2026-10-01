import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Medicine, VitalLog, Appointment, MedicalDocument, DailyMedicationStatus, Profile } from '../types';
import { Doctor } from '../types/Doctor';
import { mockMedicines, mockVitals, mockAppointments, mockDocuments } from '../data/mockData';
import { Language } from '../i18n/translations';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  medicines: Medicine[];
  addMedicine: (med: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  vitals: VitalLog[];
  addVital: (vital: VitalLog) => void;
  deleteVital: (id: string) => void;
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  documents: MedicalDocument[];
  addDocument: (doc: Omit<MedicalDocument, 'id'>) => void;
  updateDocument: (id: string, updates: Partial<MedicalDocument>) => void;
  deleteDocument: (id: string) => void;
  medicationStatus: DailyMedicationStatus[];
  markMedicineTaken: (medicineId: string, schedule: string) => void;
  // Doctors
  doctors: Doctor[];
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  getDoctorById: (id: string) => Doctor | undefined;
}

const defaultProfile: Profile = {
  id: 'user-1',
  full_name: 'Mom',
  date_of_birth: '',
  emergency_contact: '',
  language: 'en',
};

// Safe localStorage wrapper
const safeStorage = {
  get: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage errors
    }
  },
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  
  // Initialize state from localStorage
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = safeStorage.get('health_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = safeStorage.get('health_medicines');
    return saved ? JSON.parse(saved) : mockMedicines;
  });
  
  const [vitals, setVitals] = useState<VitalLog[]>(() => {
    const saved = safeStorage.get('health_vitals');
    return saved ? JSON.parse(saved) : mockVitals;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = safeStorage.get('health_appointments');
    return saved ? JSON.parse(saved) : mockAppointments;
  });
  
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => {
    const saved = safeStorage.get('health_documents');
    return saved ? JSON.parse(saved) : mockDocuments;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = safeStorage.get('health_doctors');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [medicationStatus, setMedicationStatus] = useState<DailyMedicationStatus[]>([]);

  // Save to localStorage
  const saveLocal = (key: string, data: unknown) => {
    safeStorage.set(key, JSON.stringify(data));
  };

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      saveLocal('health_profile', next);
      return next;
    });
  }, []);

  const addMedicine = useCallback((med: Omit<Medicine, 'id'>) => {
    setMedicines(prev => {
      const next = [...prev, { ...med, id: `med_${Date.now()}` }];
      saveLocal('health_medicines', next);
      return next;
    });
  }, []);

  const updateMedicine = useCallback((id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...updates } : m);
      saveLocal('health_medicines', next);
      return next;
    });
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines(prev => {
      const next = prev.filter(m => m.id !== id);
      saveLocal('health_medicines', next);
      return next;
    });
  }, []);

  const addVital = useCallback((vital: VitalLog) => {
    setVitals(prev => {
      const next = [vital, ...prev];
      saveLocal('health_vitals', next);
      return next;
    });
  }, []);

  const deleteVital = useCallback((id: string) => {
    setVitals(prev => {
      const next = prev.filter(v => v.id !== id);
      saveLocal('health_vitals', next);
      return next;
    });
  }, []);

  const addAppointment = useCallback((apt: Omit<Appointment, 'id'>) => {
    setAppointments(prev => {
      const next = [...prev, { ...apt, id: `apt_${Date.now()}` }];
      saveLocal('health_appointments', next);
      return next;
    });
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      saveLocal('health_appointments', next);
      return next;
    });
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => {
      const next = prev.filter(a => a.id !== id);
      saveLocal('health_appointments', next);
      return next;
    });
  }, []);

  const addDocument = useCallback((doc: Omit<MedicalDocument, 'id'>) => {
    setDocuments(prev => {
      const next = [{ ...doc, id: `doc_${Date.now()}` }, ...prev];
      saveLocal('health_documents', next);
      return next;
    });
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<MedicalDocument>) => {
    setDocuments(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...updates } : d);
      saveLocal('health_documents', next);
      return next;
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const next = prev.filter(d => d.id !== id);
      saveLocal('health_documents', next);
      return next;
    });
  }, []);

  const markMedicineTaken = useCallback((medicineId: string, schedule: string) => {
    setMedicationStatus(prev => {
      const existing = prev.find(s => s.medicineId === medicineId && s.schedule === schedule);
      if (existing) {
        return prev.map(s =>
          s.medicineId === medicineId && s.schedule === schedule
            ? { ...s, taken: !s.taken, takenAt: s.taken ? undefined : new Date().toISOString() }
            : s
        );
      }
      return [...prev, { medicineId, schedule: schedule as any, taken: true, takenAt: new Date().toISOString() }];
    });
  }, []);

  // Doctor management
  const addDoctor = useCallback((doctor: Omit<Doctor, 'id'>) => {
    setDoctors(prev => {
      const next = [...prev, { ...doctor, id: `doc_${Date.now()}` }];
      saveLocal('health_doctors', next);
      return next;
    });
  }, []);

  const updateDoctor = useCallback((id: string, updates: Partial<Doctor>) => {
    setDoctors(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...updates } : d);
      saveLocal('health_doctors', next);
      return next;
    });
  }, []);

  const deleteDoctor = useCallback((id: string) => {
    setDoctors(prev => {
      const next = prev.filter(d => d.id !== id);
      saveLocal('health_doctors', next);
      return next;
    });
  }, []);

  const getDoctorById = useCallback((id: string) => {
    return doctors.find(d => d.id === id);
  }, [doctors]);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      profile, updateProfile,
      medicines, addMedicine, updateMedicine, deleteMedicine,
      vitals, addVital, deleteVital,
      appointments, addAppointment, updateAppointment, deleteAppointment,
      documents, addDocument, updateDocument, deleteDocument,
      medicationStatus, markMedicineTaken,
      doctors, addDoctor, updateDoctor, deleteDoctor, getDoctorById,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
