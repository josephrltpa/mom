# Health Companion - Personalized Health Management App

A cross-platform mobile application tailored as a personalized health management companion for elderly parents diagnosed with **Hypertension (BP)**, **Type 2 Diabetes**, and **Liver conditions**.

## 🏗️ Architecture Overview

This project provides:
1. **Web Demo (React/Vite)** - Fully functional web prototype demonstrating all features
2. **Flutter Architecture** - Complete project structure and implementation guide
3. **Supabase Schema** - Production-ready PostgreSQL schema with RLS policies

---

## 📱 Flutter Project Structure

```
health_companion/
├── lib/
│   ├── main.dart                          # App entry point
│   ├── app.dart                           # MaterialApp configuration
│   │
│   ├── core/                              # Core utilities
│   │   ├── constants/
│   │   │   ├── app_colors.dart            # High-contrast color palette
│   │   │   ├── app_text_styles.dart       # Elderly-friendly typography
│   │   │   └── app_dimensions.dart        # Touch target sizes (48dp min)
│   │   ├── theme/
│   │   │   └── app_theme.dart             # Material theme configuration
│   │   ├── utils/
│   │   │   ├── vitals_calculator.dart     # BP/Sugar status calculations
│   │   │   ├── date_utils.dart            # Date formatting helpers
│   │   │   └── image_compressor.dart      # Image compression before upload
│   │   └── network/
│   │       └── supabase_client.dart       # Supabase initialization
│   │
│   ├── data/                              # Data layer
│   │   ├── models/
│   │   │   ├── profile_model.dart
│   │   │   ├── medicine_model.dart
│   │   │   ├── vital_log_model.dart
│   │   │   ├── appointment_model.dart
│   │   │   └── medical_document_model.dart
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── vitals_repository.dart
│   │   │   ├── medicines_repository.dart
│   │   │   ├── appointments_repository.dart
│   │   │   └── documents_repository.dart
│   │   └── local/
│   │       ├── hive_service.dart          # Hive local storage
│   │       └── cache_manager.dart         # Offline cache management
│   │
│   ├── domain/                            # Business logic
│   │   ├── entities/
│   │   │   ├── profile.dart
│   │   │   ├── medicine.dart
│   │   │   ├── vital_log.dart
│   │   │   ├── appointment.dart
│   │   │   └── medical_document.dart
│   │   └── usecases/
│   │       ├── get_vitals_summary.dart
│   │       ├── log_vital_reading.dart
│   │       ├── get_medications_schedule.dart
│   │       ├── generate_clinic_summary.dart
│   │       └── upload_medical_document.dart
│   │
│   ├── presentation/                      # UI layer
│   │   ├── common/
│   │   │   ├── widgets/
│   │   │   │   ├── large_button.dart      # 48dp+ touch targets
│   │   │   │   ├── vital_status_badge.dart # Color-coded status
│   │   │   │   ├── medication_card.dart
│   │   │   │   └── section_header.dart
│   │   │   └── bottom_nav_bar.dart        # 3-tab navigation
│   │   │
│   │   ├── home/                          # Home/Today Screen
│   │   │   ├── home_screen.dart
│   │   │   ├── widgets/
│   │   │   │   ├── vitals_quick_log.dart
│   │   │   │   ├── medications_today.dart
│   │   │   │   ├── appointments_countdown.dart
│   │   │   │   └── vitals_trend_chart.dart
│   │   │   └── controllers/
│   │   │       └── home_controller.dart   # Riverpod/Bloc state
│   │   │
│   │   ├── records/                       # Records & Labs Screen
│   │   │   ├── records_screen.dart
│   │   │   ├── widgets/
│   │   │   │   ├── lab_results_summary.dart
│   │   │   │   ├── document_list.dart
│   │   │   │   ├── prescription_archive.dart
│   │   │   │   └── vitals_history.dart
│   │   │   └── controllers/
│   │   │       └── records_controller.dart
│   │   │
│   │   ├── doctor_view/                   # Doctor Mode Screen
│   │   │   ├── doctor_view_screen.dart
│   │   │   ├── widgets/
│   │   │   │   ├── medications_summary.dart
│   │   │   │   ├── vitals_averages.dart
│   │   │   │   ├── latest_labs.dart
│   │   │   │   └── export_summary_button.dart
│   │   │   └── controllers/
│   │   │       └── doctor_view_controller.dart
│   │   │
│   │   └── shared/
│   │       ├── bp_log_dialog.dart
│   │       ├── sugar_log_dialog.dart
│   │       └── document_upload_sheet.dart
│   │
│   ├── services/                          # External services
│   │   ├── supabase_service.dart          # Auth, DB, Storage
│   │   ├── notification_service.dart      # Local notifications
│   │   └── pdf_generator.dart             # Clinic summary PDF
│   │
│   └── l10n/                              # Localization
│       ├── app_en.arb                     # English strings
│       └── app_mizo.arb                   # Mizo strings
│
├── assets/
│   ├── images/
│   │   ├── medicine_icons/
│   │   └── app_icons/
│   └── fonts/
│
├── test/
│   ├── unit/
│   │   └── vitals_calculator_test.dart
│   └── widget/
│       └── home_screen_test.dart
│
├── pubspec.yaml
└── README.md
```

---

## 🔧 Key Flutter Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.9
  # or: flutter_bloc: ^8.1.3
  
  # Supabase
  supabase_flutter: ^2.3.4
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  # or: isar: ^3.1.0+1
  
  # Image Compression
  flutter_image_compress: ^2.1.0
  image_picker: ^1.0.7
  
  # Charts
  fl_chart: ^0.66.0
  # or: syncfusion_flutter_charts
  
  # PDF Generation
  pdf: ^3.10.7
  printing: ^5.12.0
  
  # Notifications
  flutter_local_notifications: ^17.0.0
  
  # Utilities
  intl: ^0.19.0
  uuid: ^4.3.3
  share_plus: ^7.2.1
  
  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
```

---

## 🗄️ Supabase Schema

The complete PostgreSQL schema is available at `public/schema.sql` and includes:

### Tables:
1. **profiles** - User info, caregiver links, emergency contacts
2. **medicines** - Active medications with schedule, dosage, condition category
3. **vitals_logs** - BP and Blood Glucose readings with timestamps
4. **medication_tracking** - Daily medication taken/missed tracking
5. **appointments** - Doctor visits with countdown alerts
6. **doctors** - Doctor profiles for quick reference
7. **medical_documents** - Prescriptions, lab reports with JSONB metrics
8. **visit_notes** - Notes from completed doctor visits

### Storage Buckets:
- `prescriptions` - Prescription images/PDFs (5MB limit)
- `lab-reports` - Lab report images (5MB limit)
- `medicine-photos` - Medicine pill photos (2MB limit)

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Caregiver access via `caregiver_link` field
- Storage policies scoped per user folder

---

## 🎨 UI/UX Design Principles

### Elderly-Friendly Design:
- **Minimum font size**: 18sp for body text, 24sp+ for headers
- **Touch targets**: Minimum 48x48dp for all interactive elements
- **High contrast**: Bold color differences between text and background
- **Color-coded alerts**: Green (Normal), Yellow (Borderline), Red (Critical)
- **Minimal navigation**: Only 3 tabs - Home, Records, Doctor View
- **Bilingual support**: English + Mizo localization

### Color System:
```dart
// High-contrast palette for elderly users
class AppColors {
  static const primary = Color(0xFF4F46E5);      // Indigo - Primary actions
  static const success = Color(0xFF16A34A);      // Green - Normal/Success
  static const warning = Color(0xFFCA8A04);      // Yellow - Borderline
  static const danger = Color(0xFFDC2626);       // Red - Critical
  static const background = Color(0xFFF9FAFB);   // Light gray background
  static const surface = Color(0xFFFFFFFF);      // White cards
  static const textPrimary = Color(0xFF111827);  // Near-black text
  static const textSecondary = Color(0xFF6B7280); // Gray secondary text
}
```

---

## 📊 Vitals Status Thresholds

### Blood Pressure:
| Status | Systolic | Diastolic |
|--------|----------|-----------|
| Normal | < 130 | < 85 |
| Borderline | 130-139 | 85-89 |
| Critical | ≥ 140 | ≥ 90 |
| Emergency | ≥ 180 | ≥ 120 |

### Blood Sugar (Fasting):
| Status | Value (mg/dL) |
|--------|---------------|
| Normal | < 100 |
| Borderline | 100-125 |
| Critical | ≥ 126 |

### Blood Sugar (Postprandial):
| Status | Value (mg/dL) |
|--------|---------------|
| Normal | < 140 |
| Borderline | 140-199 |
| Critical | ≥ 200 |

---

## 🚀 Getting Started (Web Demo)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 Setting Up Flutter Project

```bash
# Create Flutter project
flutter create health_companion

# Add dependencies (see pubspec.yaml above)
flutter pub add supabase_flutter flutter_riverpod hive_flutter fl_chart

# Initialize Supabase
# Add to lib/main.dart:
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);

# Run the schema
# Copy public/schema.sql to Supabase SQL Editor and execute
```

---

## 🔑 Supabase Configuration

Create `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📋 Features Checklist

- [x] Daily Vitals Tracker (BP & Blood Glucose)
- [x] Color-coded status indicators
- [x] 7-day and 30-day trend charts
- [x] Medication Manager with schedule grouping
- [x] Medication taken tracking
- [x] Medical Document Vault
- [x] Lab results with key metrics (LFT, HbA1c, Lipid, KFT)
- [x] Prescription archive (Active/Past)
- [x] Doctor Appointments with countdown
- [x] Doctor View (One-tap clinic summary)
- [x] Export/Share summary
- [x] Bilingual support (English/Mizo)
- [x] Elderly-friendly UI (large fonts, high contrast)
- [x] Offline caching capability
- [x] Image compression for storage conservation
- [x] Complete Supabase schema with RLS
- [x] Storage bucket configuration

---

## 📄 License

This project is built for personal/family use. The Supabase schema and Flutter architecture are provided as-is for healthcare management purposes.
