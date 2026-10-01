import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import RecordsPage from './pages/RecordsPage';
import DoctorViewPage from './pages/DoctorViewPage';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Home, FileText, Stethoscope, Globe } from 'lucide-react';

type Tab = 'home' | 'records' | 'doctor';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { language, setLanguage } = useApp();

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
        {activeTab === 'doctor' && <DoctorViewPage />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-40">
        <div className="max-w-lg mx-auto flex items-end">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center py-2 px-2 transition-all ${
              activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'home' ? 'bg-indigo-100' : ''
            }`}>
              <Home className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 flex flex-col items-center py-2 px-2 transition-all ${
              activeTab === 'records' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'records' ? 'bg-indigo-100' : ''
            }`}>
              <FileText className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold mt-0.5">Records</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex-1 flex flex-col items-center py-2 px-2 transition-all ${
              activeTab === 'doctor' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
              activeTab === 'doctor' ? 'bg-indigo-100' : ''
            }`}>
              <Stethoscope className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold mt-0.5">Doctor</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'mizo' : 'en')}
            className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-indigo-600 transition-all"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">{language === 'en' ? 'Mizo' : 'EN'}</span>
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
