import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import RecordsPage from './pages/RecordsPage';
import DoctorViewPage from './pages/DoctorViewPage';
import DoctorsPage from './pages/DoctorsPage';
import { ConnectionStatus } from './components/ConnectionStatus';
import { requestNotificationPermission, reminderService } from './services/notifications';
import { Home, FileText, Stethoscope, UserCircle } from 'lucide-react';

type Tab = 'home' | 'records' | 'doctors' | 'doctor';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { language, setLanguage, medicines } = useApp();

  // Initialize notification reminders
  useEffect(() => {
    // Request notification permission
    requestNotificationPermission();

    // Sync medicine reminders
    medicines.forEach(med => {
      if (med.reminder_time && med.is_active) {
        reminderService.addReminder({
          id: `${med.id}_${med.schedule}`,
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          schedule: med.schedule,
          reminderTime: med.reminder_time,
          enabled: true,
        });
      }
    });
  }, [medicines]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Indicator */}
      <div className="fixed top-2 right-2 z-50">
        <ConnectionStatus />
      </div>

      {/* Main Content */}
      <main className="pt-safe">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'records' && <RecordsPage />}
        {activeTab === 'doctors' && <DoctorsPage />}
        {activeTab === 'doctor' && <DoctorViewPage />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-40">
        <div className="max-w-lg mx-auto flex items-end">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center py-2 px-1 transition-all ${
              activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'home' ? 'bg-indigo-100' : ''
            }`}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 flex flex-col items-center py-2 px-1 transition-all ${
              activeTab === 'records' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'records' ? 'bg-indigo-100' : ''
            }`}>
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Records</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 flex flex-col items-center py-2 px-1 transition-all ${
              activeTab === 'doctors' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'doctors' ? 'bg-indigo-100' : ''
            }`}>
              <UserCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Doctors</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex-1 flex flex-col items-center py-2 px-1 transition-all ${
              activeTab === 'doctor' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'doctor' ? 'bg-indigo-100' : ''
            }`}>
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Visit</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'mizo' : 'en')}
            className="flex flex-col items-center py-2 px-2 text-gray-500 hover:text-indigo-600 transition-all"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100">
              <span className="text-xs font-bold">{language === 'en' ? 'MZ' : 'EN'}</span>
            </div>
            <span className="text-[9px] font-semibold mt-0.5">{language === 'en' ? 'Mizo' : 'Eng'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
