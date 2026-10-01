import { Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

export function ConnectionStatus() {
  const { isCloudSynced } = useApp();

  // Determine status
  let status: 'connected' | 'local' | 'misconfigured';
  if (isCloudSynced) {
    status = 'connected';
  } else if (isSupabaseConfigured) {
    status = 'misconfigured'; // Configured but not signed in / error
  } else {
    status = 'local';
  }

  const config = {
    connected: { icon: Wifi, color: 'text-green-700', bg: 'bg-green-100 border-green-200', label: 'Cloud Synced' },
    local: { icon: WifiOff, color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', label: 'Local Only' },
    misconfigured: { icon: WifiOff, color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', label: 'Sign In Required' },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}
