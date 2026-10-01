import { VitalLog, VitalStatus } from '../types';

export function getBPStatus(systolic: number, diastolic: number): VitalStatus {
  if (systolic >= 180 || diastolic >= 120) return 'critical';
  if (systolic >= 140 || diastolic >= 90) return 'borderline';
  if (systolic >= 120 || diastolic >= 80) return 'normal';
  return 'normal';
}

export function getSugarStatus(value: number, type: 'fasting' | 'pp' | 'random'): VitalStatus {
  if (type === 'fasting') {
    if (value >= 200) return 'critical';
    if (value >= 126) return 'borderline';
    return 'normal';
  }
  if (type === 'pp') {
    if (value >= 300) return 'critical';
    if (value >= 200) return 'borderline';
    return 'normal';
  }
  // random
  if (value >= 300) return 'critical';
  if (value >= 200) return 'borderline';
  return 'normal';
}

export function getStatusColor(status: VitalStatus): string {
  switch (status) {
    case 'normal': return 'bg-green-100 text-green-800 border-green-300';
    case 'borderline': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
  }
}

export function getStatusDotColor(status: VitalStatus): string {
  switch (status) {
    case 'normal': return 'bg-green-500';
    case 'borderline': return 'bg-yellow-500';
    case 'critical': return 'bg-red-500';
  }
}

export function getStatusLabel(status: VitalStatus): string {
  switch (status) {
    case 'normal': return 'Normal';
    case 'borderline': return 'Borderline';
    case 'critical': return 'Consult Doctor';
  }
}

export function getRecentVitals(vitals: VitalLog[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return vitals.filter(v => new Date(v.timestamp) >= cutoff);
}

export function getAverageBP(vitals: VitalLog[], days: number) {
  const recent = getRecentVitals(vitals, days).filter(v => v.type === 'bp' && v.systolic && v.diastolic);
  if (recent.length === 0) return { systolic: 0, diastolic: 0, count: 0 };
  const systolic = Math.round(recent.reduce((sum, v) => sum + (v.systolic || 0), 0) / recent.length);
  const diastolic = Math.round(recent.reduce((sum, v) => sum + (v.diastolic || 0), 0) / recent.length);
  return { systolic, diastolic, count: recent.length };
}

export function getAverageSugar(vitals: VitalLog[], days: number, type?: string) {
  const recent = getRecentVitals(vitals, days).filter(v => {
    if (type && v.type !== type) return false;
    return v.type !== 'bp' && v.glucose_value;
  });
  if (recent.length === 0) return { value: 0, count: 0 };
  const value = Math.round(recent.reduce((sum, v) => sum + (v.glucose_value || 0), 0) / recent.length);
  return { value, count: recent.length };
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
