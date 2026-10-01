import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatDate, formatTime, getBPStatus, getSugarStatus, getStatusColor, getStatusLabel } from '../utils/vitals';
import { FileText, FlaskConical, Activity, ScanLine, Plus, ChevronDown, ChevronUp, Heart, Droplets, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { Modal, ConfirmDialog } from '../components/Modal';
import { MedicalDocument, Appointment } from '../types';

export default function RecordsPage() {
  const { language, documents, vitals, appointments, addDocument, updateDocument, deleteDocument, addAppointment, updateAppointment, deleteAppointment } = useApp();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'labs' | 'prescriptions' | 'vitals' | 'appointments'>('labs');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [labFilter, setLabFilter] = useState<string>('all');

  // Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<MedicalDocument | null>(null);
  const [showAptModal, setShowAptModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'doc' | 'apt'; id: string } | null>(null);

  // Doc form
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<MedicalDocument['category']>('lft');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docDoctor, setDocDoctor] = useState('');
  const [docStatus, setDocStatus] = useState<'active' | 'past'>('active');
  const [docMetrics, setDocMetrics] = useState('');

  // Appointment form
  const [aptDoctor, setAptDoctor] = useState('');
  const [aptSpecialty, setAptSpecialty] = useState('');
  const [aptClinic, setAptClinic] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptNotes, setAptNotes] = useState('');

  const prescriptions = documents.filter(d => d.category === 'prescription');
  const labDocs = documents.filter(d => d.category !== 'prescription');
  const filteredLabs = labFilter === 'all' ? labDocs : labDocs.filter(d => d.category === labFilter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lft': return <FlaskConical className="w-5 h-5 text-purple-500" />;
      case 'hba1c': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'lipid': return <Activity className="w-5 h-5 text-orange-500" />;
      case 'kft': return <Activity className="w-5 h-5 text-green-500" />;
      case 'imaging': return <ScanLine className="w-5 h-5 text-indigo-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lft': return 'bg-purple-50 border-purple-200';
      case 'hba1c': return 'bg-blue-50 border-blue-200';
      case 'lipid': return 'bg-orange-50 border-orange-200';
      case 'kft': return 'bg-green-50 border-green-200';
      case 'imaging': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getLatestLabValue = (category: string, metric: string) => {
    const docs = labDocs.filter(d => d.category === category && d.metrics?.[metric] !== undefined);
    if (docs.length === 0) return null;
    const sorted = docs.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());
    return sorted[0].metrics?.[metric];
  };

  const openAddDoc = () => {
    setEditingDoc(null);
    setDocTitle(''); setDocCategory('lft'); setDocDate(new Date().toISOString().split('T')[0]);
    setDocDoctor(''); setDocStatus('active'); setDocMetrics('');
    setShowDocModal(true);
  };

  const openEditDoc = (doc: MedicalDocument) => {
    setEditingDoc(doc);
    setDocTitle(doc.title); setDocCategory(doc.category); setDocDate(doc.test_date);
    setDocDoctor(doc.prescribing_doctor || ''); setDocStatus(doc.status);
    setDocMetrics(doc.metrics ? Object.entries(doc.metrics).map(([k, v]) => `${k}=${v}`).join(', ') : '');
    setShowDocModal(true);
  };

  const handleSaveDoc = () => {
    if (!docTitle) return;
    const metrics: Record<string, number> = {};
    if (docMetrics) {
      docMetrics.split(',').forEach(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        if (key && val && !isNaN(parseFloat(val))) metrics[key] = parseFloat(val);
      });
    }
    if (editingDoc) {
      updateDocument(editingDoc.id, { title: docTitle, category: docCategory, test_date: docDate, prescribing_doctor: docDoctor, status: docStatus, metrics });
    } else {
      addDocument({ title: docTitle, category: docCategory, test_date: docDate, prescribing_doctor: docDoctor, status: docStatus, metrics });
    }
    setShowDocModal(false);
  };

  const openAddApt = () => {
    setEditingApt(null);
    setAptDoctor(''); setAptSpecialty(''); setAptClinic(''); setAptDate(''); setAptNotes('');
    setShowAptModal(true);
  };

  const openEditApt = (apt: Appointment) => {
    setEditingApt(apt);
    setAptDoctor(apt.doctor_name); setAptSpecialty(apt.specialty); setAptClinic(apt.clinic);
    setAptDate(apt.appointment_date.split('T')[0]); setAptNotes(apt.notes || '');
    setShowAptModal(true);
  };

  const handleSaveApt = () => {
    if (!aptDoctor || !aptDate) return;
    if (editingApt) {
      updateAppointment(editingApt.id, { doctor_name: aptDoctor, specialty: aptSpecialty, clinic: aptClinic, appointment_date: new Date(aptDate).toISOString(), notes: aptNotes });
    } else {
      addAppointment({ doctor_name: aptDoctor, specialty: aptSpecialty, clinic: aptClinic, appointment_date: new Date(aptDate).toISOString(), notes: aptNotes, is_completed: false });
    }
    setShowAptModal(false);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.records}</h1>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {[
          { key: 'labs', label: '🧪 Labs' },
          { key: 'vitals', label: '📊 Vitals' },
          { key: 'prescriptions', label: '📋 Rx' },
          { key: 'appointments', label: '📅 Appts' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* LABS TAB */}
      {activeTab === 'labs' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[{ key: 'all', label: 'All' }, { key: 'lft', label: 'LFT' }, { key: 'hba1c', label: 'HbA1c' }, { key: 'lipid', label: 'Lipid' }, { key: 'kft', label: 'KFT' }, { key: 'imaging', label: 'Imaging' }].map(filter => (
              <button key={filter.key} onClick={() => setLabFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${labFilter === filter.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {filter.label}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
            <h3 className="text-base font-semibold text-gray-700 mb-3">📊 Latest Lab Values</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500">HbA1c</p>
                <p className="text-2xl font-bold text-blue-700">{getLatestLabValue('hba1c', 'HbA1c') || '--'}%</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500">SGPT (ALT)</p>
                <p className="text-2xl font-bold text-purple-700">{getLatestLabValue('lft', 'SGPT') || '--'} U/L</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500">SGOT (AST)</p>
                <p className="text-2xl font-bold text-purple-700">{getLatestLabValue('lft', 'SGOT') || '--'} U/L</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Creatinine</p>
                <p className="text-2xl font-bold text-green-700">{getLatestLabValue('kft', 'Creatinine') || '--'} mg/dL</p>
              </div>
            </div>
          </div>

          {filteredLabs.map(doc => (
            <div key={doc.id} className={`rounded-2xl border-2 mb-3 overflow-hidden ${getCategoryColor(doc.category)}`}>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)} className="flex items-center gap-3 flex-1 text-left">
                    {getCategoryIcon(doc.category)}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(doc.test_date)}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditDoc(doc)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'doc', id: doc.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    {expandedDoc === doc.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              {expandedDoc === doc.id && doc.metrics && Object.keys(doc.metrics).length > 0 && (
                <div className="px-4 pb-4">
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Values:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(doc.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{key}:</span>
                          <span className="text-base font-bold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={openAddDoc} className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform mb-6">
            <Plus className="w-6 h-6" /> Add Lab Report
          </button>
        </>
      )}

      {/* VITALS TAB */}
      {activeTab === 'vitals' && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" /> Blood Pressure History
            </h3>
            {vitals.filter(v => v.type === 'bp').slice(0, 15).map(v => {
              const status = getBPStatus(v.systolic!, v.diastolic!);
              return (
                <div key={v.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-l-4 ${status === 'critical' ? 'border-red-500' : status === 'borderline' ? 'border-yellow-500' : 'border-green-500'} border border-gray-200`}>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{v.systolic}/{v.diastolic} <span className="text-sm font-normal text-gray-500">mmHg</span></p>
                    <p className="text-sm text-gray-500">{formatDate(v.timestamp)} • {formatTime(v.timestamp)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" /> Blood Sugar History
            </h3>
            {vitals.filter(v => v.type !== 'bp').slice(0, 15).map(v => {
              const sugarType = v.type === 'fasting_sugar' ? 'fasting' : 'pp';
              const status = getSugarStatus(v.glucose_value!, sugarType);
              const typeLabel = v.type === 'fasting_sugar' ? 'Fasting' : v.type === 'pp_sugar' ? 'After Meal' : 'Random';
              return (
                <div key={v.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-l-4 ${status === 'critical' ? 'border-red-500' : status === 'borderline' ? 'border-yellow-500' : 'border-green-500'} border border-gray-200`}>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{v.glucose_value} <span className="text-sm font-normal text-gray-500">mg/dL</span></p>
                    <p className="text-sm text-gray-500">{typeLabel} • {formatDate(v.timestamp)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeTab === 'prescriptions' && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🟢 Active</h3>
            {prescriptions.filter(p => p.status === 'active').map(doc => (
              <div key={doc.id} className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-base text-gray-600">Dr. {doc.prescribing_doctor}</p>
                    <p className="text-sm text-gray-500">{formatDate(doc.test_date)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditDoc(doc)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'doc', id: doc.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">⚫ Past</h3>
            {prescriptions.filter(p => p.status === 'past').map(doc => (
              <div key={doc.id} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3 opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">{doc.title}</p>
                    <p className="text-base text-gray-500">Dr. {doc.prescribing_doctor}</p>
                    <p className="text-sm text-gray-400">{formatDate(doc.test_date)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditDoc(doc)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'doc', id: doc.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={openAddDoc} className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform mb-6">
            <Plus className="w-6 h-6" /> Add Prescription
          </button>
        </>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📅 Upcoming</h3>
            {appointments.filter(a => !a.is_completed).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()).map(apt => (
              <div key={apt.id} className="bg-white border-2 border-indigo-100 rounded-2xl p-4 mb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">{apt.doctor_name}</p>
                    <p className="text-base text-indigo-600 font-medium">{apt.specialty}</p>
                    <p className="text-sm text-gray-500">{apt.clinic}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(apt.appointment_date)}</span>
                    </div>
                    {apt.notes && <p className="text-sm text-gray-500 mt-1">📝 {apt.notes}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEditApt(apt)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'apt', id: apt.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">✅ Completed</h3>
            {appointments.filter(a => a.is_completed).map(apt => (
              <div key={apt.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-3 opacity-60">
                <p className="text-lg font-semibold text-gray-700">{apt.doctor_name}</p>
                <p className="text-sm text-gray-500">{apt.specialty} • {formatDate(apt.appointment_date)}</p>
                {apt.notes && <p className="text-sm text-gray-400 mt-1">{apt.notes}</p>}
              </div>
            ))}
          </div>
          <button onClick={openAddApt} className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform mb-6">
            <Plus className="w-6 h-6" /> Add Appointment
          </button>
        </>
      )}

      {/* Document Modal */}
      <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title={editingDoc ? 'Edit Document' : 'Add Document'}>
        <div className="space-y-4">
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Title</label>
            <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="e.g. LFT Report" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-2 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {(['lft', 'hba1c', 'lipid', 'kft', 'imaging', 'prescription', 'other'] as const).map(cat => (
                <button key={cat} onClick={() => setDocCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase ${docCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Date</label>
            <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Doctor (optional)</label>
            <input type="text" value={docDoctor} onChange={(e) => setDocDoctor(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="Dr. Name" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Status</label>
            <div className="flex gap-2">
              <button onClick={() => setDocStatus('active')} className={`flex-1 py-3 rounded-xl font-semibold ${docStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Active</button>
              <button onClick={() => setDocStatus('past')} className={`flex-1 py-3 rounded-xl font-semibold ${docStatus === 'past' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Past</button>
            </div>
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Key Values (optional)</label>
            <input type="text" value={docMetrics} onChange={(e) => setDocMetrics(e.target.value)}
              className="w-full text-base border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="SGPT=68, SGOT=52, Bilirubin=1.2" />
            <p className="text-xs text-gray-400 mt-1">Format: Key=Value, Key=Value</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowDocModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleSaveDoc} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl">{editingDoc ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      {/* Appointment Modal */}
      <Modal isOpen={showAptModal} onClose={() => setShowAptModal(false)} title={editingApt ? 'Edit Appointment' : 'Add Appointment'}>
        <div className="space-y-4">
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Doctor Name</label>
            <input type="text" value={aptDoctor} onChange={(e) => setAptDoctor(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="Dr. Name" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Specialty</label>
            <input type="text" value={aptSpecialty} onChange={(e) => setAptSpecialty(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="e.g. Diabetologist" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Clinic</label>
            <input type="text" value={aptClinic} onChange={(e) => setAptClinic(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" placeholder="Clinic name" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Date</label>
            <input type="date" value={aptDate} onChange={(e) => setAptDate(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 mb-1 block">Notes</label>
            <textarea value={aptNotes} onChange={(e) => setAptNotes(e.target.value)}
              className="w-full text-lg border-2 border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none resize-none" rows={2} placeholder="Purpose of visit..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAptModal(false)} className="flex-1 py-4 text-lg font-semibold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleSaveApt} className="flex-1 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl">{editingApt ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm?.type === 'doc') deleteDocument(deleteConfirm.id);
          if (deleteConfirm?.type === 'apt') deleteAppointment(deleteConfirm.id);
        }}
        title="Delete?"
        message="This will be permanently removed. Are you sure?"
      />
    </div>
  );
}
