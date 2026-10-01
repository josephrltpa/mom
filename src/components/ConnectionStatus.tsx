import { useState, useEffect } from 'react';
import { isSupabaseConfigured, checkSupabaseConnection } from '../services/supabaseClient';
import { Wifi, WifiOff, Database, Settings } from 'lucide-react';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'local' | 'error'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (!isSupabaseConfigured) {
      setStatus('local');
      return;
    }

    setStatus('checking');
    const result = await checkSupabaseConnection();
    setStatus(result.connected ? 'connected' : 'error');
  };

  const statusConfig = {
    checking: { icon: Database, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Checking...' },
    connected: { icon: Wifi, color: 'text-green-600', bg: 'bg-green-100', label: 'Cloud Synced' },
    local: { icon: WifiOff, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Local Only' },
    error: { icon: WifiOff, color: 'text-red-600', bg: 'bg-red-100', label: 'Sync Error' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </button>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <h4 className="font-bold text-sm text-gray-900 mb-2">Data Storage Status</h4>
          
          {status === 'connected' && (
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected to Supabase Cloud
              </p>
              <p className="text-xs text-gray-500">Your data is safely backed up in the cloud and syncs across devices.</p>
            </div>
          )}

          {status === 'local' && (
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Using Local Storage Only
              </p>
              <p className="text-xs text-gray-500">Data is saved on this device only. To enable cloud sync:</p>
              <ol className="text-xs text-gray-500 list-decimal pl-4 space-y-1">
                <li>Create a free Supabase project</li>
                <li>Run the SQL schema</li>
                <li>Add env vars to Vercel</li>
                <li>Redeploy</li>
              </ol>
            </div>
          )}

          {status === 'error' && (
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Connection Error
              </p>
              <p className="text-xs text-gray-500">Supabase is configured but connection failed. Check your environment variables.</p>
              <button onClick={checkConnection} className="text-xs text-indigo-600 font-semibold">
                Retry Connection
              </button>
            </div>
          )}

          {status === 'checking' && (
            <p className="text-sm text-gray-500">Checking connection...</p>
          )}

          <button
            onClick={() => setShowDetails(false)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
