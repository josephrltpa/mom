import { Database } from 'lucide-react';

export function ConnectionStatus() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 border border-green-200 text-green-700">
      <Database className="w-3.5 h-3.5" />
      Ready to Use
    </div>
  );
}
