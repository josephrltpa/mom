import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime, getDaysUntil } from '../utils/vitals';
import { Heart, Droplets, Pill, Clock, AlertCircle, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function CaregiverDashboard() {
  const { profile, medicines, vitals, medicationStatus, appointments } = useApp();
  const [lastActivity, setLastActivity] = useState<string>('');

  useEffect(() => {
    // Calculate last activity from vitals and medication status
    const allTimestamps = [
      ...vitals.map(v => new Date(v.timestamp).getTime()),
      ...medicationStatus.filter(m => m.taken).map(m => new Date(m.takenAt!).getTime())
    ].filter(t => !isNaN(t));

    if (allTimestamps.length > 0) {
      const latest = Math.max(...allTimestamps);
      setLastActivity(new Date(latest).toISOString());
    }
  }, [vitals, medicationStatus]);

  const today = new Date().toISOString().split('T')[0];
  
  // Today's medication status
  const todayMedsStatus = medicines.filter(m => m.is_active).map(med => {
    const taken = medicationStatus.find(
      s => s.medicineId === med.id && s.taken && s.takenAt?.startsWith(today)
    );
    return {
      medicine: med,
      taken: !!taken,
      takenAt: taken?.takenAt
    };
  });

  const takenCount = todayMedsStatus.filter(m => m.taken).length;
  const totalCount = todayMedsStatus.length;
  const pendingCount = totalCount - takenCount;

  // Today's vitals
  const todayVitals = vitals.filter(v => v.timestamp.startsWith(today));
  const bpToday = todayVitals.find(v => v.type === 'bp');
  const sugarToday = todayVitals.find(v => v.type !== 'bp');

  // Recent activity (last 7 days)
  const recentVitals = vitals.slice(0, 10);

  // Upcoming appointments
  const upcomingAppointments = appointments
    .filter(a => !a.is_completed)
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    .slice(0, 3);

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Caregiver Dashboard</h1>
        <p className="text-base text-gray-600">Monitoring: {profile.full_name || 'Patient'}</p>
      </div>

      {/* Status Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-90">Last Activity</p>
            <p className="text-xl font-bold">
              {lastActivity ? getTimeSince(lastActivity) : 'No activity yet'}
            </p>
          </div>
          <Activity className="w-12 h-12 opacity-50" />
        </div>
        {lastActivity && (
          <p className="text-sm opacity-75">
            Last updated: {formatDate(lastActivity)} at {formatTime(lastActivity)}
          </p>
        )}
      </div>

      {/* Today's Medication Status */}
      <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-600" />
            Today's Medications
          </h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{takenCount}/{totalCount}</p>
            <p className="text-xs text-gray-500">taken</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
          ></div>
        </div>

        {/* Medication List */}
        <div className="space-y-2">
          {todayMedsStatus.map(({ medicine, taken, takenAt }) => (
            <div key={medicine.id} className={`flex items-center justify-between p-3 rounded-xl ${taken ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                {taken ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{medicine.name} {medicine.dosage}</p>
                  <p className="text-xs text-gray-500 capitalize">{medicine.schedule}</p>
                </div>
              </div>
              {taken && takenAt && (
                <p className="text-xs text-gray-500">{formatTime(takenAt)}</p>
              )}
            </div>
          ))}
        </div>

        {pendingCount > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              {pendingCount} medicine{pendingCount > 1 ? 's' : ''} still pending today
            </p>
          </div>
        )}

        {takenCount === totalCount && totalCount > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-semibold">
              ✅ All medications taken today!
            </p>
          </div>
        )}
      </div>

      {/* Today's Vitals */}
      <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Today's Vitals
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Blood Pressure */}
          <div className={`p-4 rounded-xl border-2 ${bpToday ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-gray-700">BP</span>
            </div>
            {bpToday ? (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {bpToday.systolic}/{bpToday.diastolic}
                </p>
                <p className="text-xs text-gray-500">{formatTime(bpToday.timestamp)}</p>
              </>
            ) : (
              <p className="text-gray-400 text-lg">Not logged</p>
            )}
          </div>

          {/* Blood Sugar */}
          <div className={`p-4 rounded-xl border-2 ${sugarToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Sugar</span>
            </div>
            {sugarToday ? (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {sugarToday.glucose_value}
                </p>
                <p className="text-xs text-gray-500">{formatTime(sugarToday.timestamp)}</p>
              </>
            ) : (
              <p className="text-gray-400 text-lg">Not logged</p>
            )}
          </div>
        </div>

        {!bpToday && !sugarToday && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              No vitals logged today yet
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Recent Activity
        </h2>

        {recentVitals.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentVitals.slice(0, 5).map(vital => (
              <div key={vital.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  vital.type === 'bp' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {vital.type === 'bp' ? (
                    <Heart className="w-5 h-5 text-red-600" />
                  ) : (
                    <Droplets className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {vital.type === 'bp' 
                      ? `BP: ${vital.systolic}/${vital.diastolic} mmHg`
                      : `Sugar: ${vital.glucose_value} mg/dL`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(vital.timestamp)} at {formatTime(vital.timestamp)}
                  </p>
                  {vital.notes && (
                    <p className="text-xs text-gray-400 mt-1">📝 {vital.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-2xl p-5 mb-4 border-2 border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Upcoming Appointments
          </h2>

          <div className="space-y-3">
            {upcomingAppointments.map(apt => {
              const days = getDaysUntil(apt.appointment_date);
              return (
                <div key={apt.id} className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{apt.doctor_name}</p>
                      <p className="text-sm text-purple-600">{apt.specialty}</p>
                      <p className="text-xs text-gray-500 mt-1">{apt.clinic}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      days <= 1 ? 'bg-red-100 text-red-700' : 
                      days <= 3 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {days <= 0 ? 'Today' : `${days}d`}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(apt.appointment_date)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Medicines</p>
            <p className="text-2xl font-bold text-gray-900">{medicines.filter(m => m.is_active).length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Vitals Logged</p>
            <p className="text-2xl font-bold text-gray-900">{vitals.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Today's Completion</p>
            <p className="text-2xl font-bold text-green-600">
              {totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Today</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
