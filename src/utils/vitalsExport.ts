import { VitalLog } from '../types';
import { formatDate, formatTime, getBPStatus, getSugarStatus, getStatusLabel } from '../utils/vitals';

export interface VitalsExport {
  patientName: string;
  dateOfBirth?: string;
  exportDate: string;
  bpReadings: Array<{
    date: string;
    time: string;
    systolic: number;
    diastolic: number;
    status: string;
  }>;
  sugarReadings: Array<{
    date: string;
    time: string;
    value: number;
    type: string;
    status: string;
  }>;
  summary: {
    totalBPReadings: number;
    avgBPSystolic: number;
    avgBPDiastolic: number;
    minBPSystolic: number;
    maxBPSystolic: number;
    totalSugarReadings: number;
    avgSugar: number;
    minSugar: number;
    maxSugar: number;
  };
}

export function generateVitalsReport(vitals: VitalLog[], patientName: string, dateOfBirth?: string): VitalsExport {
  // Separate BP and sugar readings
  const bpReadings = vitals
    .filter(v => v.type === 'bp' && v.systolic && v.diastolic)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(v => ({
      date: formatDate(v.timestamp),
      time: formatTime(v.timestamp),
      systolic: v.systolic!,
      diastolic: v.diastolic!,
      status: getStatusLabel(getBPStatus(v.systolic!, v.diastolic!)),
    }));

  const sugarReadings = vitals
    .filter(v => v.type !== 'bp' && v.glucose_value)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(v => ({
      date: formatDate(v.timestamp),
      time: formatTime(v.timestamp),
      value: v.glucose_value!,
      type: v.type === 'fasting_sugar' ? 'Fasting' : v.type === 'pp_sugar' ? 'After Meal' : 'Random',
      status: getStatusLabel(getSugarStatus(v.glucose_value!, v.type === 'fasting_sugar' ? 'fasting' : 'pp')),
    }));

  // Calculate summary statistics
  const bpSystolicValues = bpReadings.map(r => r.systolic);
  const bpDiastolicValues = bpReadings.map(r => r.diastolic);
  const sugarValues = sugarReadings.map(r => r.value);

  const summary = {
    totalBPReadings: bpReadings.length,
    avgBPSystolic: bpSystolicValues.length > 0 ? Math.round(bpSystolicValues.reduce((a, b) => a + b, 0) / bpSystolicValues.length) : 0,
    avgBPDiastolic: bpDiastolicValues.length > 0 ? Math.round(bpDiastolicValues.reduce((a, b) => a + b, 0) / bpDiastolicValues.length) : 0,
    minBPSystolic: bpSystolicValues.length > 0 ? Math.min(...bpSystolicValues) : 0,
    maxBPSystolic: bpSystolicValues.length > 0 ? Math.max(...bpSystolicValues) : 0,
    totalSugarReadings: sugarReadings.length,
    avgSugar: sugarValues.length > 0 ? Math.round(sugarValues.reduce((a, b) => a + b, 0) / sugarValues.length) : 0,
    minSugar: sugarValues.length > 0 ? Math.min(...sugarValues) : 0,
    maxSugar: sugarValues.length > 0 ? Math.max(...sugarValues) : 0,
  };

  return {
    patientName,
    dateOfBirth,
    exportDate: new Date().toLocaleString(),
    bpReadings,
    sugarReadings,
    summary,
  };
}

export function exportVitalsAsCSV(report: VitalsExport): string {
  let csv = `Health Companion - Vitals Report\n`;
  csv += `Patient: ${report.patientName}\n`;
  if (report.dateOfBirth) {
    csv += `Date of Birth: ${new Date(report.dateOfBirth).toLocaleDateString()}\n`;
  }
  csv += `Export Date: ${report.exportDate}\n\n`;

  // Summary section
  csv += `SUMMARY\n`;
  csv += `Total BP Readings,${report.summary.totalBPReadings}\n`;
  csv += `Average BP,${report.summary.avgBPSystolic}/${report.summary.avgBPDiastolic} mmHg\n`;
  csv += `BP Range,${report.summary.minBPSystolic}-${report.summary.maxBPSystolic} mmHg\n`;
  csv += `Total Sugar Readings,${report.summary.totalSugarReadings}\n`;
  csv += `Average Sugar,${report.summary.avgSugar} mg/dL\n`;
  csv += `Sugar Range,${report.summary.minSugar}-${report.summary.maxSugar} mg/dL\n\n`;

  // BP Readings
  csv += `BLOOD PRESSURE READINGS\n`;
  csv += `Date,Time,Systolic (mmHg),Diastolic (mmHg),Status\n`;
  report.bpReadings.forEach(r => {
    csv += `${r.date},${r.time},${r.systolic},${r.diastolic},${r.status}\n`;
  });
  csv += `\n`;

  // Sugar Readings
  csv += `BLOOD SUGAR READINGS\n`;
  csv += `Date,Time,Value (mg/dL),Type,Status\n`;
  report.sugarReadings.forEach(r => {
    csv += `${r.date},${r.time},${r.value},${r.type},${r.status}\n`;
  });

  return csv;
}

export function exportVitalsAsText(report: VitalsExport): string {
  let text = `═══════════════════════════════════════\n`;
  text += `   HEALTH COMPANION - VITALS REPORT\n`;
  text += `═══════════════════════════════════════\n\n`;
  
  text += `Patient: ${report.patientName}\n`;
  if (report.dateOfBirth) {
    text += `Date of Birth: ${new Date(report.dateOfBirth).toLocaleDateString()}\n`;
  }
  text += `Export Date: ${report.exportDate}\n\n`;

  // Summary
  text += `───────────────────────────────────────\n`;
  text += `SUMMARY\n`;
  text += `───────────────────────────────────────\n`;
  text += `Blood Pressure:\n`;
  text += `  • Total Readings: ${report.summary.totalBPReadings}\n`;
  text += `  • Average: ${report.summary.avgBPSystolic}/${report.summary.avgBPDiastolic} mmHg\n`;
  text += `  • Range: ${report.summary.minBPSystolic}-${report.summary.maxBPSystolic} mmHg\n\n`;
  
  text += `Blood Sugar:\n`;
  text += `  • Total Readings: ${report.summary.totalSugarReadings}\n`;
  text += `  • Average: ${report.summary.avgSugar} mg/dL\n`;
  text += `  • Range: ${report.summary.minSugar}-${report.summary.maxSugar} mg/dL\n\n`;

  // BP Readings
  text += `───────────────────────────────────────\n`;
  text += `BLOOD PRESSURE READINGS (${report.bpReadings.length})\n`;
  text += `───────────────────────────────────────\n`;
  report.bpReadings.forEach(r => {
    text += `${r.date} ${r.time} | ${r.systolic}/${r.diastolic} mmHg | ${r.status}\n`;
  });
  text += `\n`;

  // Sugar Readings
  text += `───────────────────────────────────────\n`;
  text += `BLOOD SUGAR READINGS (${report.sugarReadings.length})\n`;
  text += `───────────────────────────────────────\n`;
  report.sugarReadings.forEach(r => {
    text += `${r.date} ${r.time} | ${r.value} mg/dL | ${r.type} | ${r.status}\n`;
  });

  text += `\n═══════════════════════════════════════\n`;
  text += `Generated by Health Companion App\n`;
  text += `═══════════════════════════════════════\n`;

  return text;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function shareVitalsReport(report: VitalsExport) {
  const textContent = exportVitalsAsText(report);
  
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: `Vitals Report - ${report.patientName}`,
      text: textContent,
    }).catch(() => {
      // Fallback to clipboard
      copyToClipboard(textContent);
    });
  } else {
    copyToClipboard(textContent);
  }
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Vitals report copied to clipboard!\n\nYou can now paste it in WhatsApp, email, or any messaging app.');
    }).catch(() => {
      alert('❌ Could not copy to clipboard. Please try again.');
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('✅ Vitals report copied to clipboard!');
  }
}
