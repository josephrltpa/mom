import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { getBPStatus, getSugarStatus, getStatusColor, getStatusDotColor, getStatusLabel, getRecentVitals, getAverageBP, getAverageSugar, getDaysUntil, formatDate } from '../utils/vitals';
import { Sparkline, DualSparkline } from '../components/Sparkline';
import { Heart, Droplets, Pill, Calendar, Clock, Check, Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Medicine } from '../types';

export default function HomePage() {
  const { language, profile, updateProfile, medicines, vitals, appointments, medicationStatus, addVital, markMedicineTaken, addMedicine, updateMedicine, deleteMedicine } = useApp();
  const t = translations[language];

  // Modals
  const [showBPModal, setShowBPModal] = useState(false);
  const [showSugarModal, setShowSugarModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [sugarValue, setSugarValue] = useState('');
  const [sugarType, setSugarType] = useState<'fasting_sugar' | 'pp_sugar' | 'random_sugar'>('fasting_sugar');
  const [profileName, setProfileName] = useState(profile.full_name);
  const [profileDob, setProfileDob] = useState(profile.date_of_birth || '');
  const [profileEmergency, setProfileEmergency] = useState(profile.emergency_contact);

  // Medicine form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medSchedule, setMedSchedule] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [medMeal, setMedMeal] = useState<'before_meal' | 'after_meal' | 'anytime'>('after_meal');
  const [medCondition, setMedCondition] = useState<'bp' | 'diabetes' | 'liver' | 'general'>('bp');

  const latestBP = getRecentVitals(vitals, 1).find(v => v.type === 'bp');
  const latestSugar = getRecentVitals(vitals, 1).find(v => v.type !== 'bp');
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
      addVital({ id: `v_${Date.now()}`, type: 'bp', systolic: sys, diastolic: dia, timestamp: new Date().toISOString() });
      setBpSystolic(''); setBpDiastolic(''); setShowBPModal(false);
    }
  };

  const handleSaveSugar = () => {
    const val = parseInt(sugarValue);
    if (val) {
      addVital({ id: `v_${Date.now()}`, type: sugarType, glucose_value: val, timestamp: new Date().toISOString() });
      setSugarValue(''); setShowSugarModal(false);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({ full_name: profileName, date_of_birth: profileDob, emergency_contact: profileEmergency });
    setShowProfileModal(false);
  };

  const openAddMedicine = () => {
    setEditingMedicine(null);
    setMedName(''); setMedDosage(''); setMedSchedule('morning'); setMedMeal('after_meal'); setMedCondition('bp');
    setShowMedicineModal(true);
  };

  const openEditMedicine = (med: Medicine) => {
    setEditingMedicine(med);
    setMedName(med.name); setMedDosage(med.dosage); setMedSchedule(med.schedule);
    setMedMeal(med.meal_relation); setMedCondition(med.condition_category);
    setShowMedicineModal(true);
  };

  const handleSaveMedicine = () => {
    if (!medName || !medDosage) return;
    if (editingMedicine) {
      updateMedicine(editingMedicine.id, { name: medName, dosage: medDosage, schedule: medSchedule, meal_relation: medMeal, condition_category: medCondition });
    } else {
      addMedicine({ name: medName, dosage: medDosage, schedule: medSchedule, meal_relation: medMeal, condition_category: medCondition, is_active: true });
    }
    setShowMedicineModal(false);
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

  const renderMedCard = (med: Medicine, schedule: string) => {
    const taken = isTaken(med.id, schedule);
    const badge = getConditionBadge(med.condition_category);
    return (
      <div key={med.id} className={`bg-white rounded-xl p-3 mb-2 border-2 ${taken ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-gray-900">{med.name}</span>
              <span className="text-base text-gray-600">{med.dosage}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {med.meal_relation === 'before_meal' ? t.beforeMeal : med.meal_relation === 'after_meal' ? t.afterMeal : t.anytime}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => openEditMedicine(med)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => markMedicineTaken(med.id, schedule)}
              className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all ${taken ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white active:scale-95'}`}
            >
              {taken ? <Check className="w-5 h-5" /> : '✓'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()},</h1>
          <button onClick={() => { setProfileName(profile.full_name); setProfileDob(profile.date_of_birth || ''); setProfileEmergency(profile.emergency_contact || ''); setShowProfileModal(true); }} className="text-lg text-indigo-600 font-semibold flex items-center gap-1">
            {profile.full_name} <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => { setProfileName(profile.full_name); setProfileDob(profile.date_of_birth || ''); setProfileEmergency(profile.emergency_contact || ''); setShowProfileModal(true); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Vitals */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => setShowBPModal(true)} className="bg-white border-2 border-gray-200 rounded-2xl p-4 text-left active:scale-95 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-base font-semibold text-gray-700">BP</span>
          </div>
          {latestBP ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{latestBP.systolic}/{latestBP.diastolic}</span>
              </div>
              <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}`}>
                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}`}></div>
                {getStatusLabel(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-base">--/--</div>
          )}
          <div className="text-xs text-indigo-600 font-semibold mt-1">+ Log Reading</div>
        </button>

        <button onClick={() => setShowSugarModal(true)} className="bg-white border-2 border-gray-200 rounded-2xl p-4 text-left active:scale-95 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-6 h-6 text-blue-500" />
            <span className="text-base font-semibold text-gray-700">Sugar</span>
          </div>
          {latestSugar ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{latestSugar.glucose_value}</span>
                <span className="text-sm text-gray-500">mg/dL</span>
              </div>
              <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getSugarStatus(latestSugar.glucose_value!, latestSugar.type === 'fasting_sugar' ? 'fasting' : 'pp'))}`}>
                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(getSugarStatus(latestSugar.glucose_value!, latestSugar.type === 'fasting_sugar' ? 'fasting' : 'pp'))}`}></div>
                {getStatusLabel(getSugarStatus(latestSugar.glucose_value!, latestSugar.type === 'fasting_sugar' ? 'fasting' : 'pp'))}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-base">-- mg/dL</div>
          )}
          <div className="text-xs text-indigo-600 font-semibold mt-1">+ Log Reading</div>
        </button>
      </div>

      {/* 7-Day Averages */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 mb-6 border border-indigo-100">
        <h3 className="text-base font-semibold text-gray-700 mb-3">7-Day Averages</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">BP Average</p>
            <p className="text-2xl font-bold text-gray-900">{bp7.count > 0 ? `${bp7.systolic}/${bp7.diastolic}` : '--'}</p>
            <p className="text-xs text-gray-500">{bp7.count} readings</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sugar (Fasting)</p>
            <p className="text-2xl font-bold text-gray-900">{sugar7.count > 0 ? sugar7.value : '--'}</p>
            <p className="text-xs text-gray-500">{sugar7.count} readings</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-3">BP Trend (7 days)</h3>
          <div className="w-full overflow-x-auto">
            <DualSparkline
              data1={chartData.map(d => d.systolic as number)}
              data2={chartData.map(d => d.diastolic as number)}
              color1="#EF4444"
              color2="#3B82F6"
              width={Math.max(300, chartData.length * 50)}
              height={120}
              labels={chartData.map(d => d.date)}
              showLabels={true}
              legend1="Systolic"
              legend2="Diastolic"
            />
          </div>
        </div>
      )}

      {sugarChartData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Sugar Trend (7 days)</h3>
          <div className="w-full overflow-x-auto">
            <Sparkline
              data={sugarChartData.map(d => d.value as number)}
              color="#3B82F6"
              width={Math.max(300, sugarChartData.length * 50)}
              height={120}
              labels={sugarChartData.map(d => d.date)}
              showLabels={true}
            />
          </div>
        </div>
      )}

      {/* Medications Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">{t.medications}</h2>
          <button onClick={openAddMedicine} className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold active:scale-95">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {morningMeds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🌅</span> Morning
            </h3>
            {morningMeds.map(med => renderMedCard(med, 'morning'))}
          </div>
        )}

        {afternoonMeds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <span className="text-lg">☀️</span> Afternoon
            </h3>
            {afternoonMeds.map(med => renderMedCard(med, 'afternoon'))}
          </div>
        )}

        {nightMeds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🌙</span> Night
            </h3>
            {nightMeds.map(med => renderMedCard(med, 'night'))}
          </div>
        )}

        {activeMedicines.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-300">
            <Pill className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-base text-gray-500">No medications added yet</p>
            <button onClick={openAddMedicine} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
              + Add First Medicine
            </button>
          </div>
        )}
      </div>

      {/* Appointments */}
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

      {/* BP Modal */}
      <Modal isOpen={showBPModal} onClose={() => setShowBPModal(false)} title="Log Blood Pressure">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Systolic</label>
            <input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)}
              className="w-full text-3xl font-bold text-center border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="120" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Diastolic</label>
            <input type="number" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)}
              className="w-full text-3xl font-bold text-center border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="80" />
          </div>
        </div>
        {bpSystolic && bpDiastolic && (
          <div className={`mb-4 p-3 rounded-xl ${getStatusColor(getBPStatus(parseInt(bpSystolic), parseInt(bpDiastolic)))}`}>
            <p className="text-base font-semibold">{getStatusLabel(getBPStatus(parseInt(bpSystolic), parseInt(bpDiastolic)))}</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setShowBPModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
          <button onClick={handleSaveBP} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl">Save</button>
        </div>
      </Modal>

      {/* Sugar Modal */}
      <Modal isOpen={showSugarModal} onClose={() => setShowSugarModal(false)} title="Log Blood Sugar">
        <div className="flex gap-2 mb-4">
          {(['fasting_sugar', 'pp_sugar', 'random_sugar'] as const).map(type => (
            <button key={type} onClick={() => setSugarType(type)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold ${sugarType === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {type === 'fasting_sugar' ? 'Fasting' : type === 'pp_sugar' ? 'After Meal' : 'Random'}
            </button>
          ))}
        </div>
        <div className="mb-6">
          <input type="number" value={sugarValue} onChange={(e) => setSugarValue(e.target.value)}
            className="w-full text-4xl font-bold text-center border-2 border-gray-300 rounded-xl p-4 focus:border-indigo-500 focus:outline-none" placeholder="120" />
          <p className="text-center text-base text-gray-500 mt-2">mg/dL</p>
        </div>
        {sugarValue && (
          <div className={`mb-4 p-3 rounded-xl ${getStatusColor(getSugarStatus(parseInt(sugarValue), sugarType === 'fasting_sugar' ? 'fasting' : 'pp'))}`}>
            <p className="text-base font-semibold">{getStatusLabel(getSugarStatus(parseInt(sugarValue), sugarType === 'fasting_sugar' ? 'fasting' : 'pp'))}</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setShowSugarModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
          <button onClick={handleSaveSugar} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl">Save</button>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Name / Relation</label>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="Mom, Dad, etc." />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Date of Birth</label>
            <input type="date" value={profileDob} onChange={(e) => setProfileDob(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Emergency Contact</label>
            <input type="tel" value={profileEmergency} onChange={(e) => setProfileEmergency(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="+91 ..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowProfileModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleSaveProfile} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl">Save</button>
          </div>
        </div>
      </Modal>

      {/* Medicine Modal */}
      <Modal isOpen={showMedicineModal} onClose={() => setShowMedicineModal(false)} title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'}>
        <div className="space-y-4">
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Medicine Name</label>
            <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="e.g. Amlodipine" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Dosage</label>
            <input type="text" value={medDosage} onChange={(e) => setMedDosage(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="e.g. 5mg" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-2 block">Schedule</label>
            <div className="flex gap-2">
              {(['morning', 'afternoon', 'night'] as const).map(s => (
                <button key={s} onClick={() => setMedSchedule(s)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize ${medSchedule === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {s === 'morning' ? '🌅' : s === 'afternoon' ? '☀️' : '🌙'} {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-2 block">Meal Timing</label>
            <div className="flex gap-2">
              {(['before_meal', 'after_meal', 'anytime'] as const).map(m => (
                <button key={m} onClick={() => setMedMeal(m)}
                  className={`flex-1 py-3 rounded-xl text-xs font-semibold ${medMeal === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {m === 'before_meal' ? 'Before Meal' : m === 'after_meal' ? 'After Meal' : 'Anytime'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-2 block">Condition</label>
            <div className="flex gap-2 flex-wrap">
              {([
                { key: 'bp', label: '🔴 BP', color: 'bg-red-100 text-red-700 border-red-300' },
                { key: 'diabetes', label: '🔵 Sugar', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                { key: 'liver', label: '🟣 Liver', color: 'bg-purple-100 text-purple-700 border-purple-300' },
                { key: 'general', label: '⚪ Other', color: 'bg-gray-100 text-gray-700 border-gray-300' },
              ] as const).map(c => (
                <button key={c.key} onClick={() => setMedCondition(c.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${medCondition === c.key ? c.color + ' border-2' : 'bg-white text-gray-500 border-gray-200'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          {editingMedicine && (
            <button onClick={() => { setDeleteConfirm(editingMedicine.id); setShowMedicineModal(false); }}
              className="w-full py-3 text-base font-semibold text-red-600 bg-red-50 rounded-xl flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete this medicine
            </button>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowMedicineModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleSaveMedicine} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl">
              {editingMedicine ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) deleteMedicine(deleteConfirm); }}
        title="Delete Medicine?"
        message="This will remove the medicine from the list. This action cannot be undone."
      />
    </div>
  );
}
