import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Copy, Check, X } from 'lucide-react';

interface FamilySetupProps {
  onComplete?: () => void;
}

export default function FamilySetup({ onComplete }: FamilySetupProps) {
  const { familyCode, setFamilyCode, profile } = useApp();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateFamily = () => {
    // Generate a unique family code
    const code = `FAM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setFamilyCode(code);
    setMode('create');
    // Auto-close after 3 seconds if onComplete is provided
    if (onComplete) {
      setTimeout(onComplete, 3000);
    }
  };

  const handleJoinFamily = () => {
    if (inputCode.trim()) {
      setFamilyCode(inputCode.trim().toUpperCase());
      setMode('join');
      // Auto-close after 3 seconds if onComplete is provided
      if (onComplete) {
        setTimeout(onComplete, 3000);
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (familyCode) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">Family Connected!</h2>
              <p className="text-sm opacity-90">All devices synced</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-xs opacity-75 mb-1">Family Code</p>
            <p className="text-2xl font-mono font-bold">{familyCode}</p>
          </div>
          <p className="text-sm mt-4 opacity-90">
            ✅ {profile.full_name || 'Patient'}'s data is now syncing across all devices
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">How to Add Another Device</h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
              <span>Open the app on the new device</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
              <span>Tap "Join Family" and enter this code: <strong className="font-mono">{familyCode}</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
              <span>All data will sync automatically!</span>
            </li>
          </ol>
        </div>

        {onComplete && (
          <button
            onClick={onComplete}
            className="w-full bg-indigo-600 text-white rounded-xl py-4 font-semibold text-lg hover:bg-indigo-700 transition-colors"
          >
            Continue to App →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
          <Users className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Setup</h1>
        <p className="text-base text-gray-600">Connect devices to share health data</p>
      </div>

      {mode === 'choose' && (
        <div className="space-y-4">
          <button
            onClick={handleCreateFamily}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 text-left active:scale-95 transition-transform"
          >
            <h3 className="text-xl font-bold mb-2">📱 Create Family</h3>
            <p className="text-sm opacity-90">
              I'm setting up for the patient (mom/dad). Generate a code to share with caregivers.
            </p>
          </button>

          <button
            onClick={() => setMode('join')}
            className="w-full bg-white border-2 border-indigo-200 text-indigo-700 rounded-2xl p-6 text-left active:scale-95 transition-transform"
          >
            <h3 className="text-xl font-bold mb-2">👨‍💼 Join Family</h3>
            <p className="text-sm">
              I'm a caregiver. I have a family code to join and monitor.
            </p>
          </button>
        </div>
      )}

      {mode === 'join' && !familyCode && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Family Code</h3>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="FAM-XXXXX-XXXX"
            className="w-full text-xl font-mono text-center border-2 border-gray-300 rounded-xl p-4 mb-4 focus:border-indigo-500 focus:outline-none uppercase"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setMode('choose')}
              className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl"
            >
              Back
            </button>
            <button
              onClick={handleJoinFamily}
              disabled={!inputCode.trim()}
              className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
