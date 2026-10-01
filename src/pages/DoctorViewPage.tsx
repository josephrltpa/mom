import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { getAverageBP, getAverageSugar, getBPStatus, getSugarStatus, getStatusColor, getStatusDotColor, getStatusLabel, formatDate } from '../utils/vitals';
import { Stethoscope, Pill, Heart, Droplets, FileText, Share2, Download, Calendar } from 'lucide-react';

export default function DoctorViewPage() {
  const { language, profile, medicines, vitals, documents, appointments } = useApp();
  const t = translations[language];

  const activeMedicines = medicines.filter(m => m.is_active);
  const bp7 = getAverageBP(vitals, 7);
  const bp30 = getAverageBP(vitals, 30);
  const sugar7 = getAverageSugar(vitals, 7, 'fasting_sugar');
  const sugar30 = getAverageSugar(vitals, 30, 'fasting_sugar');

  const latestLFT = documents
    .filter(d => d.category === 'lft' && d.status === 'active')
    .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0];

  const latestHbA1c = documents
    .filter(d => d.category === 'hba1c' && d.status === 'active')
    .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0];

  const latestPrescription = documents
    .filter(d => d.category === 'prescription' && d.status === 'active')
    .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0];

  const nextAppointment = appointments
    .filter(a => !a.is_completed)
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

  const bpMedicines = activeMedicines.filter(m => m.condition_category === 'bp');
  const diabetesMedicines = activeMedicines.filter(m => m.condition_category === 'diabetes');
  const liverMedicines = activeMedicines.filter(m => m.condition_category === 'liver');
  const otherMedicines = activeMedicines.filter(m => m.condition_category === 'general');

  const handleShare = () => {
    // Generate summary text
    const summary = `
CLINIC SUMMARY - Health Companion
================================
Patient: ${profile.full_name}
${profile.date_of_birth ? `DOB: ${new Date(profile.date_of_birth).toLocaleDateString()}` : ''}
Generated: ${new Date().toLocaleDateString()}

ACTIVE MEDICATIONS:
${activeMedicines.map(m => `• ${m.name} ${m.dosage} - ${m.schedule} (${m.condition_category})`).join('\n')}

VITALS SUMMARY:
• BP 7-day avg: ${bp7.systolic}/${bp7.diastolic} mmHg (${bp7.count} readings)
• BP 30-day avg: ${bp30.systolic}/${bp30.diastolic} mmHg (${bp30.count} readings)
• Fasting Sugar 7-day avg: ${sugar7.value} mg/dL (${sugar7.count} readings)
• Fasting Sugar 30-day avg: ${sugar30.value} mg/dL (${sugar30.count} readings)

LATEST LAB RESULTS:
${latestLFT ? `• LFT (${formatDate(latestLFT.test_date)}): SGPT=${latestLFT.metrics?.SGPT}, SGOT=${latestLFT.metrics?.SGOT}, Bilirubin=${latestLFT.metrics?.Bilirubin}` : ''}
${latestHbA1c ? `• HbA1c (${formatDate(latestHbA1c.test_date)}): ${latestHbA1c.metrics?.['HbA1c']}%` : ''}

Next Appointment: ${nextAppointment ? `${nextAppointment.doctor_name} - ${formatDate(nextAppointment.appointment_date)}` : 'None scheduled'}
    `.trim();

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Health Summary', text: summary }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
        alert('Summary copied to clipboard!');
      }).catch(() => {
        alert('Could not copy to clipboard');
      });
    } else {
      alert('Summary:\n\n' + summary);
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.clinicSummary}</h1>
            <p className="text-base text-gray-500">One-tap view for doctors</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleShare}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Share2 className="w-5 h-5" />
          {t.shareSummary}
        </button>
        <button
          onClick={handleShare}
          className="py-3 px-4 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Download className="w-5 h-5" />
          PDF
        </button>
      </div>

      {/* Patient Info */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
        <p className="text-base text-gray-500">Patient</p>
        <p className="text-xl font-bold text-gray-900">{profile.full_name}</p>
        {profile.date_of_birth && profile.date_of_birth.length > 0 && (
          <p className="text-sm text-gray-500">DOB: {new Date(profile.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        )}
        <p className="text-base text-gray-600 mt-1">Conditions: Hypertension, Type 2 Diabetes, Liver Disease</p>
        {profile.emergency_contact && (
          <p className="text-sm text-gray-500 mt-1">📞 Emergency: {profile.emergency_contact}</p>
        )}
      </div>

      {/* Active Medications */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Pill className="w-5 h-5 text-indigo-500" />
          {t.activeMedications}
        </h2>

        {bpMedicines.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-red-600 mb-1">🔴 BP Medications</p>
            {bpMedicines.map(m => (
              <div key={m.id} className="flex justify-between items-center py-1 pl-2">
                <span className="text-base text-gray-900">{m.name} {m.dosage}</span>
                <span className="text-sm text-gray-500">{m.schedule}</span>
              </div>
            ))}
          </div>
        )}

        {diabetesMedicines.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-blue-600 mb-1">🔵 Diabetes Medications</p>
            {diabetesMedicines.map(m => (
              <div key={m.id} className="flex justify-between items-center py-1 pl-2">
                <span className="text-base text-gray-900">{m.name} {m.dosage}</span>
                <span className="text-sm text-gray-500">{m.schedule}</span>
              </div>
            ))}
          </div>
        )}

        {liverMedicines.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-purple-600 mb-1">🟣 Liver Medications</p>
            {liverMedicines.map(m => (
              <div key={m.id} className="flex justify-between items-center py-1 pl-2">
                <span className="text-base text-gray-900">{m.name} {m.dosage}</span>
                <span className="text-sm text-gray-500">{m.schedule}</span>
              </div>
            ))}
          </div>
        )}

        {otherMedicines.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">⚪ Other</p>
            {otherMedicines.map(m => (
              <div key={m.id} className="flex justify-between items-center py-1 pl-2">
                <span className="text-base text-gray-900">{m.name} {m.dosage}</span>
                <span className="text-sm text-gray-500">{m.schedule}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vitals Summary */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          {t.recentVitals}
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-xs text-red-600 font-semibold">{t.avg7Days}</p>
            <p className="text-2xl font-bold text-gray-900">
              {bp7.count > 0 ? `${bp7.systolic}/${bp7.diastolic}` : '--'}
            </p>
            <p className="text-xs text-gray-500">{t.mmHg} ({bp7.count} readings)</p>
            {bp7.count > 0 && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getBPStatus(bp7.systolic, bp7.diastolic))}`}>
                {getStatusLabel(getBPStatus(bp7.systolic, bp7.diastolic))}
              </span>
            )}
          </div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-xs text-red-600 font-semibold">{t.avg30Days}</p>
            <p className="text-2xl font-bold text-gray-900">
              {bp30.count > 0 ? `${bp30.systolic}/${bp30.diastolic}` : '--'}
            </p>
            <p className="text-xs text-gray-500">{t.mmHg} ({bp30.count} readings)</p>
            {bp30.count > 0 && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getBPStatus(bp30.systolic, bp30.diastolic))}`}>
                {getStatusLabel(getBPStatus(bp30.systolic, bp30.diastolic))}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold">{t.avg7Days}</p>
            <p className="text-2xl font-bold text-gray-900">
              {sugar7.count > 0 ? sugar7.value : '--'}
            </p>
            <p className="text-xs text-gray-500">{t.mgdl} ({sugar7.count} readings)</p>
            {sugar7.count > 0 && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getSugarStatus(sugar7.value, 'fasting'))}`}>
                {getStatusLabel(getSugarStatus(sugar7.value, 'fasting'))}
              </span>
            )}
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold">{t.avg30Days}</p>
            <p className="text-2xl font-bold text-gray-900">
              {sugar30.count > 0 ? sugar30.value : '--'}
            </p>
            <p className="text-xs text-gray-500">{t.mgdl} ({sugar30.count} readings)</p>
            {sugar30.count > 0 && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getSugarStatus(sugar30.value, 'fasting'))}`}>
                {getStatusLabel(getSugarStatus(sugar30.value, 'fasting'))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Latest Lab Results */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          {t.latestLabs}
        </h2>

        {latestLFT && (
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">LFT ({formatDate(latestLFT.test_date)})</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">SGPT (ALT)</p>
                <p className="text-lg font-bold text-purple-700">{latestLFT.metrics?.SGPT} U/L</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">SGOT (AST)</p>
                <p className="text-lg font-bold text-purple-700">{latestLFT.metrics?.SGOT} U/L</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Bilirubin</p>
                <p className="text-lg font-bold text-purple-700">{latestLFT.metrics?.Bilirubin} mg/dL</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Albumin</p>
                <p className="text-lg font-bold text-purple-700">{latestLFT.metrics?.Albumin} g/dL</p>
              </div>
            </div>
          </div>
        )}

        {latestHbA1c && (
          <div>
            <p className="text-sm text-gray-500 mb-1">HbA1c ({formatDate(latestHbA1c.test_date)})</p>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-700">HbA1c</span>
                <span className="text-2xl font-bold text-blue-700">{latestHbA1c.metrics?.['HbA1c']}%</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-base text-gray-700">Fasting Sugar</span>
                <span className="text-lg font-bold text-blue-600">{latestHbA1c.metrics?.['Fasting Sugar']} mg/dL</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Latest Prescription */}
      {latestPrescription && (
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            {t.latestPrescription}
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
            <div className="text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-gray-700">{latestPrescription.title}</p>
              <p className="text-sm text-gray-500">Dr. {latestPrescription.prescribing_doctor}</p>
              <p className="text-xs text-gray-400">{formatDate(latestPrescription.test_date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Appointment */}
      {nextAppointment && (
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Next Appointment
          </h2>
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p className="text-lg font-semibold text-gray-900">{nextAppointment.doctor_name}</p>
            <p className="text-base text-indigo-600">{nextAppointment.specialty}</p>
            <p className="text-sm text-gray-600">{nextAppointment.clinic}</p>
            <p className="text-sm text-gray-500 mt-1">{formatDate(nextAppointment.appointment_date)}</p>
            {nextAppointment.notes && <p className="text-sm text-gray-500 mt-1">📝 {nextAppointment.notes}</p>}
          </div>
        </div>
      )}

      {/* Share Button at Bottom */}
      <button
        onClick={handleShare}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg mb-6"
      >
        <Share2 className="w-6 h-6" />
        {t.exportPDF} / {t.shareSummary}
      </button>
    </div>
  );
}
