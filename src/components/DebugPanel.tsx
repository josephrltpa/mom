import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase, checkSupabaseConnection } from '../services/supabaseClient';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function DebugPanel() {
  const [status, setStatus] = useState<any>(null);
  const [envVars, setEnvVars] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const connection = await checkSupabaseConnection();
    setStatus({
      configured: isSupabaseConfigured,
      clientExists: !!supabase,
      connection,
    });
  };

  return (
    <div className="fixed bottom-20 left-2 right-2 bg-white border-2 border-gray-300 rounded-xl p-4 shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-900">🔧 Debug Info</h3>
        <button onClick={checkStatus} className="text-xs text-indigo-600 font-semibold">
          Refresh
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Env Vars */}
        <div className="flex items-start justify-between">
          <span className="text-gray-600">VITE_SUPABASE_URL:</span>
          <span className={`font-mono ${envVars.url === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
            {envVars.url === 'NOT SET' ? '❌ NOT SET' : '✅ Set'}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <span className="text-gray-600">VITE_SUPABASE_ANON_KEY:</span>
          <span className={`font-mono ${envVars.key === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
            {envVars.key === 'NOT SET' ? '❌ NOT SET' : '✅ Set'}
          </span>
        </div>

        <div className="border-t border-gray-200 my-2"></div>

        {/* Configuration Status */}
        <div className="flex items-start justify-between">
          <span className="text-gray-600">Supabase Configured:</span>
          <span className={`font-semibold ${status?.configured ? 'text-green-600' : 'text-red-600'}`}>
            {status?.configured ? '✅ Yes' : '❌ No'}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <span className="text-gray-600">Client Created:</span>
          <span className={`font-semibold ${status?.clientExists ? 'text-green-600' : 'text-red-600'}`}>
            {status?.clientExists ? '✅ Yes' : '❌ No'}
          </span>
        </div>

        {status?.connection && (
          <div className="flex items-start justify-between">
            <span className="text-gray-600">Connection Test:</span>
            <span className={`font-semibold ${status.connection.connected ? 'text-green-600' : 'text-red-600'}`}>
              {status.connection.connected ? '✅ Connected' : `❌ ${status.connection.error}`}
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-2">
          <strong>If you see ❌ NOT SET:</strong>
        </p>
        <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
          <li>Go to Vercel → Settings → Environment Variables</li>
          <li>Check names start with <code className="bg-gray-100 px-1">VITE_</code></li>
          <li>Check values have no extra spaces</li>
          <li>Click Deployments → ⋯ → Redeploy</li>
          <li>Hard refresh browser (Ctrl+Shift+R)</li>
        </ol>
      </div>

      <button
        onClick={() => {
          const el = document.getElementById('debug-panel');
          if (el) el.style.display = 'none';
        }}
        className="mt-3 w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold"
      >
        Hide Debug Panel
      </button>
    </div>
  );
}

// Toggle button to show/hide debug panel
export function DebugToggle() {
  const [show, setShow] = useState(false);

  return (
    <>
      {!show && (
        <button
          onClick={() => setShow(true)}
          className="fixed bottom-20 left-2 w-10 h-10 bg-gray-800 text-white rounded-full shadow-lg z-50 flex items-center justify-center text-xs font-bold"
          title="Show Debug Panel"
        >
          🐛
        </button>
      )}
      {show && <div id="debug-panel"><DebugPanel /></div>}
    </>
  );
}
