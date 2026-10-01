import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Medicine, VitalLog, Appointment, MedicalDocument, DailyMedicationStatus } from '../types';
import { mockMedicines, mockVitals, mockAppointments, mockDocuments } from '../data/mockData';
import { Language } from '../i18n/translations';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  medicines: Medicine[];
  vitals: VitalLog[];
  appointments: Appointment[];
  documents: MedicalDocument[];
  medicationStatus: DailyMedicationStatus[];
  addVital: (vital: VitalLog) => void;
  markMedicineTaken: (medicineId: string, schedule: string) => void;
  addDocument: (doc: MedicalDocument) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [medicines] = useState<Medicine[]>(mockMedicines);
  const [vitals, setVitals] = useState<VitalLog[]>(mockVitals);
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [documents, setDocuments] = useState<MedicalDocument[]>(mockDocuments);
  const [medicationStatus, setMedicationStatus] = useState<DailyMedicationStatus[]>([]);

  const addVital = useCallback((vital: VitalLog) => {
    setVitals(prev => [vital, ...prev]);
  }, []);

  const markMedicineTaken = useCallback((medicineId: string, schedule: string) => {
    setMedicationStatus(prev => {
      const existing = prev.find(s => s.medicineId === medicineId && s.schedule === schedule);
      if (existing) {
        return prev.map(s =>
          s.medicineId === medicineId && s.schedule === schedule
            ? { ...s, taken: true, takenAt: new Date().toISOString() }
            : s
        );
      }
      return [...prev, { medicineId, schedule: schedule as any, taken: true, takenAt: new Date().toISOString() }];
    });
  }, []);

  const addDocument = useCallback((doc: MedicalDocument) => {
    setDocuments(prev => [doc, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      medicines, vitals, appointments, documents,
      medicationStatus, addVital, markMedicineTaken, addDocument,
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
