import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import RecordsPage from './pages/RecordsPage';
import DoctorViewPage from './pages/DoctorViewPage';
import { ConnectionStatus } from './components/ConnectionStatus';
import { AuthScreen } from './components/AuthScreen';
import { isSupabaseConfigured, supabase } from './services/supabaseClient';
import { Home, FileText, Stethoscope } from 'lucide-react';

type Tab = 'home' | 'records' | 'doctor';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { language, setLanguage, isCloudSynced } = useApp();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user needs to sign in
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setAuthChecked(true);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setNeedsAuth(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      
      setAuthChecked(true);
    };

    checkAuth();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (event === 'SIGNED_IN' && session) {
          setNeedsAuth(false);
        } else if (event === 'SIGNED_OUT') {
          setNeedsAuth(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSignIn = () => {
    setNeedsAuth(false);
  };

  const handleSkip = () => {
    setNeedsAuth(false);
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if Supabase is configured but user not signed in
  if (needsAuth && isSupabaseConfigured) {
    return <AuthScreen onSignIn={handleSignIn} onSkip={handleSkip} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Indicator */}
      <div className="fixed top-2 right-2 z-50">
        <ConnectionStatus />
      </div>

      {/* Debug Panel Toggle */}
      <DebugToggle />

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
              <span className="text-sm font-bold">{language === 'en' ? 'MZ' : 'EN'}</span>
            </div>
            <span className="text-[10px] font-semibold mt-0.5">{language === 'en' ? 'Mizo' : 'English'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// Simple debug toggle
function DebugToggle() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-20 left-2 w-10 h-10 bg-gray-800 text-white rounded-full shadow-lg z-50 flex items-center justify-center text-xs font-bold"
        title="Show Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-2 right-2 bg-white border-2 border-gray-300 rounded-xl p-4 shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-900">🔧 Debug Info</h3>
        <button onClick={() => setShow(false)} className="text-xs text-gray-500">Close</button>
      </div>
      <div className="text-xs space-y-1">
        <p>Supabase Configured: <strong>{isSupabaseConfigured ? '✅ Yes' : '❌ No'}</strong></p>
        <p>URL: <strong>{import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}</strong></p>
        <p>Key: <strong>{import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'NOT SET'}</strong></p>
      </div>
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
