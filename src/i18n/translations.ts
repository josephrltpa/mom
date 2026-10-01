export const translations = {
  en: {
    // Navigation
    home: 'Home',
    today: 'Today',
    records: 'Records & Labs',
    doctorMode: 'Doctor View',
    
    // Home
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    vitalsToday: "Today's Vitals",
    logBP: 'Log Blood Pressure',
    logSugar: 'Log Blood Sugar',
    medications: 'Medications',
    taken: 'Taken ✓',
    markTaken: 'Mark as Taken',
    upcomingAppointments: 'Upcoming Appointments',
    noAppointments: 'No upcoming appointments',
    
    // Vitals
    bloodPressure: 'Blood Pressure',
    bloodSugar: 'Blood Sugar',
    systolic: 'Systolic',
    diastolic: 'Diastolic',
    fasting: 'Fasting',
    postprandial: 'After Meal',
    random: 'Random',
    normal: 'Normal',
    borderline: 'Borderline',
    critical: 'Consult Doctor',
    mmHg: 'mmHg',
    mgdl: 'mg/dL',
    logReading: 'Log Reading',
    save: 'Save',
    cancel: 'Cancel',
    
    // Medications
    morning: 'Morning',
    afternoon: 'Afternoon',
    night: 'Night',
    beforeMeal: 'Before Meal',
    afterMeal: 'After Meal',
    anytime: 'Anytime',
    bpMedicines: 'BP Medicines',
    diabetesMedicines: 'Diabetes Medicines',
    liverMedicines: 'Liver Medicines',
    
    // Records
    prescriptions: 'Prescriptions',
    labReports: 'Lab Reports',
    lft: 'Liver Function Test',
    hba1c: 'HbA1c',
    lipidProfile: 'Lipid Profile',
    renalFunction: 'Renal Function',
    imaging: 'Imaging/Ultrasound',
    active: 'Active',
    past: 'Past',
    uploadDocument: 'Upload Document',
    
    // Doctor View
    clinicSummary: 'Clinic Summary',
    activeMedications: 'Active Medications',
    recentVitals: 'Recent Vitals',
    avg7Days: '7-Day Average',
    avg30Days: '30-Day Average',
    latestPrescription: 'Latest Prescription',
    latestLabs: 'Latest Lab Results',
    exportPDF: 'Export Summary',
    shareSummary: 'Share Summary',
    
    // Common
    loading: 'Loading...',
    error: 'Error occurred',
    retry: 'Retry',
    days: 'days',
    ago: 'ago',
    todayLabel: 'Today',
  },
  mizo: {
    // Navigation
    home: 'In',
    today: 'Vawiin',
    records: 'Records & Labs',
    doctorMode: 'Sappui Hmanna',
    
    // Home
    goodMorning: 'Zing chibai',
    goodAfternoon: 'Chhun chibai',
    goodEvening: 'Tlai Chibai',
    vitalsToday: "Tunhnai Vitals",
    logBP: 'BP zat ziak la',
    logSugar: 'Sugar zat Ziak la',
    medications: 'Damdawi chawh',
    taken: 'Ei/ti tawh ✓',
    markTaken: 'Ei/ti zo tawh',
    upcomingAppointments: 'Appointments lo kal tur',
    noAppointments: 'Appointment a awm lo',
    
    // Vitals
    bloodPressure: 'Blood Pressure',
    bloodSugar: 'Blood Sugar',
    systolic: 'Systolic',
    diastolic: 'Diastolic',
    fasting: 'Chawnghei',
    postprandial: 'Chaw ei kham',
    random: 'Hun bi awm lem lo',
    normal: 'A pangai',
    borderline: 'A border ah a awm',
    critical: 'A sang/hniam hle',
    mmHg: 'mmHg',
    mgdl: 'mg/dL',
    logReading: 'Log Reading',
    save: 'Save',
    cancel: 'cancel',
    
    // Medications
    morning: 'Zing',
    afternoon: 'Chawhnu',
    night: 'Zan',
    beforeMeal: 'Chaw ei hma',
    afterMeal: 'Chaw ei hnu',
    anytime: 'engtik hunah pawh',
    bpMedicines: 'BP Damdawi',
    diabetesMedicines: 'Sugar Damdawi',
    liverMedicines: 'Kal Damdawi',
    
    // Records
    prescriptions: 'Prescriptions',
    labReports: 'Lab Reports',
    lft: 'Liver Function Test',
    hba1c: 'HbA1c',
    lipidProfile: 'Lipid Profile',
    renalFunction: 'Renal Function',
    imaging: 'Imaging/Ultrasound',
    active: 'Hman lai',
    past: 'Kal Tawh',
    uploadDocument: 'Document Upload la',
    
    // Doctor View
    clinicSummary: 'Clinic Summary',
    activeMedications: 'Damdawi Hman lai',
    recentVitals: 'Tun hnai Vitals',
    avg7Days: 'Ni 7 Average',
    avg30Days: 'Ni 30 Average',
    latestPrescription: 'Prescription Thar',
    latestLabs: 'Lab Result Thar',
    exportPDF: 'PDF Export',
    shareSummary: 'Summary Share',
    
    // Common
    loading: 'Loading...',
    error: 'Error a awm',
    retry: 'Tum leh la',
    days: 'ni',
    ago: 'hnuai',
    todayLabel: 'Tunhnai',
  }
};

export type Language = 'en' | 'mizo';
export type TranslationKey = keyof typeof translations.en;
