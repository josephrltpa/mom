# Quick Setup Guide for Your Mom's Health Companion

## 🎯 Getting Started

The app comes with sample data that you can completely customize for your mom. Everything is editable!

### 1. **Edit Mom's Profile**
- On the Home screen, tap the **Settings icon** (⚙️) or tap her name
- Update:
  - **Name**: Change from "Mom" to her actual name or how you'd like to address her
  - **Date of Birth**: Add her DOB for age tracking
  - **Emergency Contact**: Add your phone number or another family member's

### 2. **Customize Medications**
The app starts with sample medications. You can:

**Add New Medicine:**
- Tap the **"+ Add"** button next to "Medications"
- Fill in:
  - Medicine name (e.g., "Amlodipine")
  - Dosage (e.g., "5mg")
  - Schedule: Morning 🌅 / Afternoon ☀️ / Night 🌙
  - Meal timing: Before meal / After meal / Anytime
  - Condition: BP 🔴 / Sugar 🔵 / Liver 🟣 / Other ⚪

**Edit Existing Medicine:**
- Tap the **Edit icon** (✏️) on any medicine card
- Update any field and save

**Delete Medicine:**
- Tap Edit, then tap the red "Delete this medicine" button
- Or tap the **Trash icon** (🗑️) directly

**Mark as Taken:**
- Tap the **✓ button** on each medicine when she takes it
- It turns green when marked

### 3. **Log Daily Vitals**

**Blood Pressure:**
- Tap the BP card on Home screen
- Enter Systolic (top number) and Diastolic (bottom number)
- Color indicator shows: 🟢 Normal / 🟡 Borderline / 🔴 Consult Doctor
- Tap Save

**Blood Sugar:**
- Tap the Sugar card on Home screen
- Choose type: Fasting / After Meal / Random
- Enter the value in mg/dL
- Color indicator shows status
- Tap Save

### 4. **Manage Lab Reports & Documents**

Go to **Records** tab:

**Add Lab Report:**
- Tap "Add Lab Report"
- Fill in:
  - Title (e.g., "LFT Report - Jan 2024")
  - Category: LFT / HbA1c / Lipid / KFT / Imaging
  - Date of test
  - Doctor name (optional)
  - Status: Active or Past
  - Key values (e.g., "SGPT=68, SGOT=52, Bilirubin=1.2")

**Add Prescription:**
- Switch to "Rx" tab
- Tap "Add Prescription"
- Fill in details and mark as Active or Past

**Edit/Delete:**
- Tap Edit (✏️) or Delete (🗑️) icons on any document

### 5. **Manage Appointments**

Go to **Records** → **Appts** tab:

**Add Appointment:**
- Tap "Add Appointment"
- Fill in:
  - Doctor name
  - Specialty (e.g., Diabetologist, Hepatologist)
  - Clinic name
  - Date
  - Notes (purpose of visit)

**Edit/Delete:**
- Use Edit and Delete icons on each appointment

### 6. **Doctor View (Clinic Summary)**

The **Doctor** tab shows a one-page summary perfect for clinic visits:
- All active medications with dosages
- 7-day and 30-day BP and Sugar averages
- Latest lab results (LFT, HbA1c, etc.)
- Latest prescription
- Next appointment

**Share/Export:**
- Tap "Share Summary" to send via WhatsApp/Email
- Or "PDF" to save as document

### 7. **Language Toggle**

- Tap the **Globe icon** (🌐) in the bottom navigation
- Switch between English and Mizo

---

## 💾 Data Storage

All your data is saved locally in your browser's localStorage. This means:
- ✅ Works offline
- ✅ Data persists between sessions
- ✅ Private - stays on your device
- ⚠️ Clearing browser data will reset everything

**Tip:** Use the "Share Summary" feature regularly to backup important information!

---

## 🎨 Features for Elderly Users

- **Large fonts** (18px+ for readability)
- **High contrast** colors
- **Big touch targets** (48px+ buttons)
- **Color-coded alerts** (Green/Yellow/Red)
- **Simple 3-tab navigation**
- **Minimal clutter**

---

## 📱 Tips for Daily Use

1. **Morning Routine:**
   - Log fasting blood sugar
   - Mark morning medications as taken
   - Check BP if needed

2. **After Meals:**
   - Mark after-meal medications
   - Log post-meal sugar if required

3. **Night Routine:**
   - Mark night medications
   - Log evening BP if needed

4. **Before Doctor Visit:**
   - Open Doctor View tab
   - Review the summary
   - Share/Export for the doctor

---

## 🔧 Customization Ideas

- Change the default name to your mom's name
- Remove sample medications and add her actual prescriptions
- Add her real doctors and clinic details
- Upload actual lab reports (when Supabase storage is connected)
- Set up recurring appointment reminders

---

## 🚀 Next Steps (When Connected to Supabase)

When you connect to Supabase backend:
- Data syncs across devices
- Caregivers can view remotely
- Automatic backups
- Push notifications for medications
- Photo uploads for prescriptions

---

**Need Help?**
All data is editable anytime. Just tap the edit icons or use the add buttons to customize everything for your mom's specific needs!
