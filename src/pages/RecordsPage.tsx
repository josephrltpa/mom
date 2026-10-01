import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatDate, formatTime, getBPStatus, getSugarStatus, getStatusColor, getStatusDotColor, getStatusLabel } from '../utils/vitals';
import { FileText, FlaskConical, Activity, Pill, ScanLine, Plus, ChevronDown, ChevronUp, Heart, Droplets } from 'lucide-react';
import { MedicalDocument } from '../types';

export default function RecordsPage() {
  const { language, documents, vitals } = useApp();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'labs' | 'prescriptions' | 'vitals'>('labs');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [labFilter, setLabFilter] = useState<string>('all');

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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'lft': return 'Liver Function (LFT)';
      case 'hba1c': return 'HbA1c / Diabetes';
      case 'lipid': return 'Lipid Profile';
      case 'kft': return 'Renal Function (KFT)';
      case 'imaging': return 'Imaging / Ultrasound';
      case 'prescription': return 'Prescription';
      default: return category;
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

  // Get latest lab values for display
  const getLatestLabValue = (category: string, metric: string) => {
    const docs = labDocs.filter(d => d.category === category && d.metrics?.[metric] !== undefined);
    if (docs.length === 0) return null;
    const sorted = docs.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());
    return sorted[0].metrics?.[metric];
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.records}</h1>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('labs')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'labs' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          🧪 Labs
        </button>
        <button
          onClick={() => setActiveTab('vitals')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'vitals' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          📊 Vitals
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'prescriptions' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          📋 Rx
        </button>
      </div>

      {activeTab === 'labs' && (
        <>
          {/* Lab Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'lft', label: 'LFT' },
              { key: 'hba1c', label: 'HbA1c' },
              { key: 'lipid', label: 'Lipid' },
              { key: 'kft', label: 'KFT' },
              { key: 'imaging', label: 'Imaging' },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setLabFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  labFilter === filter.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Lab Results Summary */}
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

          {/* Lab Documents List */}
          {filteredLabs.map(doc => (
            <div
              key={doc.id}
              className={`rounded-2xl border-2 mb-3 overflow-hidden ${getCategoryColor(doc.category)}`}
            >
              <button
                onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(doc.category)}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(doc.test_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {doc.status === 'active' ? t.active : t.past}
                    </span>
                    {expandedDoc === doc.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>
              
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
                  {/* Simulated document preview */}
                  <div className="mt-3 bg-white rounded-xl p-4 border border-dashed border-gray-300 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Document Image Preview</p>
                    <p className="text-xs text-gray-400">(Upload via Supabase Storage)</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {activeTab === 'vitals' && (
        <>
          {/* Vitals History */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" /> Blood Pressure History
            </h3>
            {vitals.filter(v => v.type === 'bp').slice(0, 10).map(v => {
              const status = getBPStatus(v.systolic!, v.diastolic!);
              return (
                <div key={v.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-l-4 ${
                  status === 'critical' ? 'border-red-500' : status === 'borderline' ? 'border-yellow-500' : 'border-green-500'
                } border border-gray-200`}>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{v.systolic}/{v.diastolic} <span className="text-sm font-normal text-gray-500">{t.mmHg}</span></p>
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
            {vitals.filter(v => v.type !== 'bp').slice(0, 10).map(v => {
              const sugarType = v.type === 'fasting_sugar' ? 'fasting' : 'pp';
              const status = getSugarStatus(v.glucose_value!, sugarType);
              const typeLabel = v.type === 'fasting_sugar' ? 'Fasting' : v.type === 'pp_sugar' ? 'After Meal' : 'Random';
              return (
                <div key={v.id} className={`flex items-center justify-between bg-white rounded-xl p-3 mb-2 border-l-4 ${
                  status === 'critical' ? 'border-red-500' : status === 'borderline' ? 'border-yellow-500' : 'border-green-500'
                } border border-gray-200`}>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{v.glucose_value} <span className="text-sm font-normal text-gray-500">{t.mgdl}</span></p>
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

      {activeTab === 'prescriptions' && (
        <>
          {/* Active Prescriptions */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🟢 {t.active}</h3>
            {prescriptions.filter(p => p.status === 'active').map(doc => (
              <div key={doc.id} className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-base text-gray-600">Dr. {doc.prescribing_doctor}</p>
                    <p className="text-sm text-gray-500">{formatDate(doc.test_date)}</p>
                  </div>
                  <Pill className="w-6 h-6 text-green-600" />
                </div>
                <div className="mt-3 bg-white rounded-xl p-4 border border-dashed border-gray-300 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Prescription Image</p>
                </div>
              </div>
            ))}
          </div>

          {/* Past Prescriptions */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">⚫ {t.past}</h3>
            {prescriptions.filter(p => p.status === 'past').map(doc => (
              <div key={doc.id} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3 opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">{doc.title}</p>
                    <p className="text-base text-gray-500">Dr. {doc.prescribing_doctor}</p>
                    <p className="text-sm text-gray-400">{formatDate(doc.test_date)}</p>
                  </div>
                  <Pill className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Button */}
      <button className="w-full py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform mb-6">
        <Plus className="w-6 h-6" />
        {t.uploadDocument}
      </button>
    </div>
  );
}
