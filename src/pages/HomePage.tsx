import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { getBPStatus, getSugarStatus, getStatusColor, getStatusDotColor, getStatusLabel, getRecentVitals, getAverageBP, getAverageSugar, getDaysUntil, formatDate, formatTime } from '../utils/vitals';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Heart, Droplets, Pill, Calendar, Clock, Check } from 'lucide-react';

export default function HomePage() {
  const { language, medicines, vitals, appointments, medicationStatus, addVital, markMedicineTaken } = useApp();
  const t = translations[language];
  const [showBPModal, setShowBPModal] = useState(false);
  const [showSugarModal, setShowSugarModal] = useState(false);
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [sugarValue, setSugarValue] = useState('');
  const [sugarType, setSugarType] = useState<'fasting_sugar' | 'pp_sugar' | 'random_sugar'>('fasting_sugar');

  const todayVitals = getRecentVitals(vitals, 1);
  const latestBP = todayVitals.find(v => v.type === 'bp');
  const latestSugar = todayVitals.find(v => v.type !== 'bp');
  const bp7 = getAverageBP(vitals, 7);
  const sugar7 = getAverageSugar(vitals, 7);
  
  const upcomingAppointments = appointments
    .filter(a => !a.is_completed)
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  const activeMedicines = medicines.filter(m => m.is_active);
  const morningMeds = activeMedicines.filter(m => m.schedule === 'morning');
  const afternoonMeds = activeMedicines.filter(m => m.schedule === 'afternoon');
  const nightMeds = activeMedicines.filter(m => m.schedule === 'night');

  const isTaken = (medId: string, schedule: string) => {
    return medicationStatus.some(s => s.medicineId === medId && s.schedule === schedule && s.taken);
  };

  // Chart data for last 7 days
  const chartData = getRecentVitals(vitals, 7)
    .filter(v => v.type === 'bp' && v.systolic)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(v => ({
      date: new Date(v.timestamp).toLocaleDateString('en', { weekday: 'short' }),
      systolic: v.systolic,
      diastolic: v.diastolic,
    }));

  const sugarChartData = getRecentVitals(vitals, 7)
    .filter(v => v.type !== 'bp' && v.glucose_value)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(v => ({
      date: new Date(v.timestamp).toLocaleDateString('en', { weekday: 'short' }),
      value: v.glucose_value,
    }));

  const handleSaveBP = () => {
    const sys = parseInt(bpSystolic);
    const dia = parseInt(bpDiastolic);
    if (sys && dia) {
      addVital({
        id: `v_${Date.now()}`,
        type: 'bp',
        systolic: sys,
        diastolic: dia,
        timestamp: new Date().toISOString(),
      });
      setBpSystolic('');
      setBpDiastolic('');
      setShowBPModal(false);
    }
  };

  const handleSaveSugar = () => {
    const val = parseInt(sugarValue);
    if (val) {
      addVital({
        id: `v_${Date.now()}`,
        type: sugarType,
        glucose_value: val,
        timestamp: new Date().toISOString(),
      });
      setSugarValue('');
      setShowSugarModal(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  const getConditionBadge = (category: string) => {
    switch (category) {
      case 'bp': return { label: 'BP', color: 'bg-red-100 text-red-700' };
      case 'diabetes': return { label: 'Sugar', color: 'bg-blue-100 text-blue-700' };
      case 'liver': return { label: 'Liver', color: 'bg-purple-100 text-purple-700' };
      default: return { label: 'Other', color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()},</h1>
          <p className="text-lg text-gray-600">Pa (Dad)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Quick Vitals Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowBPModal(true)}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-base font-semibold text-gray-700">{t.bloodPressure}</span>
          </div>
          {latestBP ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{latestBP.systolic}/{latestBP.diastolic}</span>
                <span className="text-sm text-gray-500">{t.mmHg}</span>
              </div>
              <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}`}>
                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}`}></div>
                {getStatusLabel(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-base">--/--</div>
          )}
          <div className="text-xs text-gray-500 mt-1">+ Log Reading</div>
        </button>

        <button
          onClick={() => setShowSugarModal(true)}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-6 h-6 text-blue-500" />
            <span className="text-base font-semibold text-gray-700">{t.bloodSugar}</span>
          </div>
          {latestSugar ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{latestSugar.glucose_value}</span>
                <span className="text-sm text-gray-500">{t.mgdl}</span>
              </div>
              <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getSugarStatus(latestSugar.glucose_value!, latestSugar.type === 'fasting_sugar' ? 'fasting' : 'pp'))}`}>
                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(getSugarStatus(latestSugar.glucose_value!, latestSugar.type === 'fasting_sugar' ? 'fasting' : 'pp'))}`}></div>
                {getStatusLabel(getSugarStatus(latestSugar.glucose_value!, latestSugar.type === 'fasting_sugar' ? 'fasting' : 'pp'))}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-base">-- {t.mgdl}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">+ Log Reading</div>
        </button>
      </div>

      {/* 7-Day Averages */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 mb-6 border border-indigo-100">
        <h3 className="text-base font-semibold text-gray-700 mb-3">7-Day Averages</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">BP Average</p>
            <p className="text-2xl font-bold text-gray-900">
              {bp7.count > 0 ? `${bp7.systolic}/${bp7.diastolic}` : '--'}
            </p>
            <p className="text-xs text-gray-500">{bp7.count} readings</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sugar (Fasting)</p>
            <p className="text-2xl font-bold text-gray-900">
              {sugar7.count > 0 ? sugar7.value : '--'}
            </p>
            <p className="text-xs text-gray-500">{sugar7.count} readings</p>
          </div>
        </div>
      </div>

      {/* BP Trend Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-3">BP Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 11 }} width={35} />
              <Tooltip />
              <Line type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sugar Trend Chart */}
      {sugarChartData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Sugar Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={sugarChartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{ fontSize: 11 }} width={35} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Medications Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">{t.medications}</h2>
          <Pill className="w-6 h-6 text-indigo-500" />
        </div>

        {/* Morning */}
        {morningMeds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🌅</span> {t.morning}
            </h3>
            {morningMeds.map(med => {
              const taken = isTaken(med.id, 'morning');
              const badge = getConditionBadge(med.condition_category);
              return (
                <div key={med.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-2 ${taken ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">{med.name}</span>
                      <span className="text-base text-gray-600">{med.dosage}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{med.meal_relation === 'before_meal' ? t.beforeMeal : t.afterMeal}</p>
                  </div>
                  <button
                    onClick={() => markMedicineTaken(med.id, 'morning')}
                    className={`px-4 py-3 rounded-xl font-semibold text-base transition-all ${
                      taken
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-500 text-white active:scale-95'
                    }`}
                  >
                    {taken ? <Check className="w-6 h-6" /> : t.markTaken}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Afternoon */}
        {afternoonMeds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <span className="text-lg">☀️</span> {t.afternoon}
            </h3>
            {afternoonMeds.map(med => {
              const taken = isTaken(med.id, 'afternoon');
              const badge = getConditionBadge(med.condition_category);
              return (
                <div key={med.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-2 ${taken ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">{med.name}</span>
                      <span className="text-base text-gray-600">{med.dosage}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{med.meal_relation === 'before_meal' ? t.beforeMeal : t.afterMeal}</p>
                  </div>
                  <button
                    onClick={() => markMedicineTaken(med.id, 'afternoon')}
                    className={`px-4 py-3 rounded-xl font-semibold text-base transition-all ${
                      taken
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-500 text-white active:scale-95'
                    }`}
                  >
                    {taken ? <Check className="w-6 h-6" /> : t.markTaken}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Night */}
        {nightMeds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🌙</span> {t.night}
            </h3>
            {nightMeds.map(med => {
              const taken = isTaken(med.id, 'night');
              const badge = getConditionBadge(med.condition_category);
              return (
                <div key={med.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-2 ${taken ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">{med.name}</span>
                      <span className="text-base text-gray-600">{med.dosage}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{med.meal_relation === 'before_meal' ? t.beforeMeal : med.meal_relation === 'after_meal' ? t.afterMeal : t.anytime}</p>
                  </div>
                  <button
                    onClick={() => markMedicineTaken(med.id, 'night')}
                    className={`px-4 py-3 rounded-xl font-semibold text-base transition-all ${
                      taken
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-500 text-white active:scale-95'
                    }`}
                  >
                    {taken ? <Check className="w-6 h-6" /> : t.markTaken}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">{t.upcomingAppointments}</h2>
          <Calendar className="w-6 h-6 text-indigo-500" />
        </div>
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 text-base">{t.noAppointments}</p>
        ) : (
          upcomingAppointments.map(apt => {
            const days = getDaysUntil(apt.appointment_date);
            return (
              <div key={apt.id} className="bg-white rounded-xl p-4 mb-2 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{apt.doctor_name}</p>
                    <p className="text-base text-indigo-600 font-medium">{apt.specialty}</p>
                    <p className="text-sm text-gray-500">{apt.clinic}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${days <= 1 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {days <= 0 ? 'Today' : `${days}d`}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(apt.appointment_date)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BP Log Modal */}
      {showBPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.logBP}</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">{t.systolic}</label>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full text-3xl font-bold text-center border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">{t.diastolic}</label>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full text-3xl font-bold text-center border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="80"
                />
              </div>
            </div>
            {bpSystolic && bpDiastolic && (
              <div className={`mb-4 p-3 rounded-xl ${getStatusColor(getBPStatus(parseInt(bpSystolic), parseInt(bpDiastolic)))}`}>
                <p className="text-base font-semibold">
                  {getStatusLabel(getBPStatus(parseInt(bpSystolic), parseInt(bpDiastolic)))}
                  {getBPStatus(parseInt(bpSystolic), parseInt(bpDiastolic)) === 'critical' && ' ⚠️'}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowBPModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">
                {t.cancel}
              </button>
              <button onClick={handleSaveBP} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl active:scale-95">
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sugar Log Modal */}
      {showSugarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.logSugar}</h3>
            <div className="flex gap-2 mb-4">
              {(['fasting_sugar', 'pp_sugar', 'random_sugar'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSugarType(type)}
                  className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all ${
                    sugarType === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type === 'fasting_sugar' ? t.fasting : type === 'pp_sugar' ? t.postprandial : t.random}
                </button>
              ))}
            </div>
            <div className="mb-6">
              <input
                type="number"
                value={sugarValue}
                onChange={(e) => setSugarValue(e.target.value)}
                className="w-full text-4xl font-bold text-center border-2 border-gray-300 rounded-xl p-4 focus:border-indigo-500 focus:outline-none"
                placeholder="120"
              />
              <p className="text-center text-base text-gray-500 mt-2">{t.mgdl}</p>
            </div>
            {sugarValue && (
              <div className={`mb-4 p-3 rounded-xl ${getStatusColor(getSugarStatus(parseInt(sugarValue), sugarType === 'fasting_sugar' ? 'fasting' : 'pp'))}`}>
                <p className="text-base font-semibold">
                  {getStatusLabel(getSugarStatus(parseInt(sugarValue), sugarType === 'fasting_sugar' ? 'fasting' : 'pp'))}
                  {getSugarStatus(parseInt(sugarValue), sugarType === 'fasting_sugar' ? 'fasting' : 'pp') === 'critical' && ' ⚠️'}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSugarModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">
                {t.cancel}
              </button>
              <button onClick={handleSaveSugar} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl active:scale-95">
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
