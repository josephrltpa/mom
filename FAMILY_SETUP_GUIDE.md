# 🏥 Health Companion - Family Setup Guide

## 🎯 What is Family Code?

The **Family Code** system allows multiple devices to sync and share the same health data. This is perfect for:
- **Mom/Dad** using the app on their phone to log vitals and medications
- **You (caregiver)** monitoring their health from your phone or PC
- **Other family members** who want to help monitor

All devices with the same Family Code will see the **exact same data** in real-time!

---

## 🚀 How to Set Up (Step-by-Step)

### Step 1: Create Family Code (On Mom's Phone)

1. **Open the app** on mom's phone
2. **Tap the "Family" tab** (👥 icon) in the bottom navigation
3. **Tap "Create Family"**
4. **You'll see a unique code** like: `FAM-M5X8K2-9P3Q`
5. **Share this code** with yourself (screenshot, text message, email, etc.)

> 💡 **Important:** This code is like a password - only share it with trusted family members!

---

### Step 2: Join Family (On Your Phone/PC)

1. **Open the app** on your device (phone or PC browser)
2. **Tap the "Family" tab** (👥 icon)
3. **Tap "Join Family"**
4. **Enter the code** your mom shared with you
5. **Tap "Join"**

✅ **Done!** Both devices are now connected and will sync all data automatically.

---

## 📊 What Gets Synced?

When devices are connected with the same Family Code, they share:

| Data Type | Synced? | Description |
|-----------|---------|-------------|
| ✅ Profile | Yes | Name, DOB, emergency contact |
| ✅ Medications | Yes | All medicines, schedules, reminders |
| ✅ Vitals | Yes | BP readings, blood sugar logs |
| ✅ Appointments | Yes | Doctor visits, reminders |
| ✅ Medical Documents | Yes | Prescriptions, lab reports |
| ✅ Doctors | Yes | Doctor contact information |
| ✅ Medication Tracking | Yes | Which meds were taken and when |

---

## 🔄 How Real-Time Sync Works

### On Mom's Phone:
1. Mom logs her BP: `140/85 mmHg`
2. App automatically syncs to Supabase cloud (every 2 seconds)
3. Data is stored with the Family Code as the identifier

### On Your Device:
1. You open the **Monitor tab** (👁️ icon)
2. App loads data from Supabase using the same Family Code
3. You see Mom's latest BP reading: `140/85 mmHg`
4. **Real-time updates** - no manual refresh needed!

---

## 📱 Using the Monitor Tab

Once connected, you can monitor Mom's health from anywhere:

### What You Can See:
- ✅ **Last Activity** - When Mom last used the app
- ✅ **Today's Medications** - Which meds she took (green ✓) vs pending (red ✗)
- ✅ **Progress Bar** - Visual completion percentage
- ✅ **Today's Vitals** - Latest BP and blood sugar readings
- ✅ **Recent Activity** - Last 10 vitals entries with timestamps
- ✅ **Upcoming Appointments** - Next 3 doctor visits
- ✅ **Quick Stats** - Total meds, vitals logged, completion rate

### Example Scenario:
```
Last Activity: 2 hours ago

Today's Medications: 3/4 taken (75%)
✅ Amlodipine 5mg - 8:15 AM
✅ Metformin 500mg - 8:20 AM
❌ Eye Drops - PENDING
✅ Silymarin - 1:30 PM

Today's Vitals:
BP: 138/85 mmHg (9:00 AM)
Sugar: 142 mg/dL (7:30 AM)
```

---

## 🔒 Privacy & Security

### How It Works:
- **Family Code** is the only thing needed to access data
- **No personal login** required (no email/password)
- **Supabase RLS** (Row Level Security) ensures data isolation
- **Encrypted connection** (HTTPS) for all data transfers

### Best Practices:
1. ✅ Only share Family Code with trusted family members
2. ✅ If someone leaves the family, create a new code
3. ✅ Don't share the code publicly (social media, etc.)
4. ✅ Each family should have their own unique code

---

## 🛠️ Troubleshooting

### Problem: "Data not syncing between devices"

**Solution:**
1. Check both devices have the **same Family Code**
2. Go to **Family tab** on both devices and verify the code matches
3. Make sure **Supabase is configured** (check Vercel environment variables)
4. Wait 5-10 seconds for sync to complete
5. Refresh the page/app

### Problem: "I see different data on each device"

**Solution:**
1. This means devices are using **different user IDs**
2. Go to **Family tab** and make sure both devices have the **same Family Code**
3. If codes are different, one device needs to **rejoin** with the correct code
4. After rejoining, data will sync automatically

### Problem: "Monitor tab shows empty data"

**Solution:**
1. Make sure Mom has **actually logged some data** (vitals, medications, etc.)
2. Check that both devices are using the **same Family Code**
3. Verify **Supabase connection** is working (check Vercel logs)
4. Try refreshing the page

---

## 🎓 Advanced: How It Works Technically

### User ID Generation:
- **Without Family Code:** `user_<timestamp>_<random>` (unique per device)
- **With Family Code:** `family_<FAMILY_CODE>` (same across all devices)

### Data Flow:
```
Mom's Phone → Supabase Cloud ← Your Phone
     ↓              ↓              ↓
  Local DB    Shared DB       Local DB
  (backup)    (source of      (backup)
               truth)
```

### Sync Process:
1. **Every 2 seconds**, app checks for local changes
2. If changes detected, **sync to Supabase** using Family Code as user ID
3. **Every page load**, app fetches latest data from Supabase
4. **Real-time updates** via Supabase subscriptions (future enhancement)

---

## 📞 Need Help?

### Common Questions:

**Q: Can I have multiple family codes?**  
A: No, each app instance can only be part of one family at a time.

**Q: What if I lose the Family Code?**  
A: Go to the Family tab on any connected device - the code is displayed there.

**Q: Can I remove a device from the family?**  
A: Yes, go to Family tab → tap the code → tap "Leave Family". The device will switch to individual mode.

**Q: Does it work offline?**  
A: Yes! Data is stored locally. When you reconnect to the internet, it syncs automatically.

**Q: Is my data secure?**  
A: Yes! Supabase uses encryption at rest and in transit. RLS policies ensure only devices with the correct Family Code can access the data.

---

## 🎉 You're All Set!

Now you can:
- ✅ Monitor Mom's health from anywhere
- ✅ See real-time medication adherence
- ✅ Track vitals and trends
- ✅ Get peace of mind knowing you're connected

**Happy monitoring!** 🏥💙
