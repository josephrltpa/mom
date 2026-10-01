# Complete Setup Guide: Linking Vercel + Supabase

## 🎯 Overview

You have:
- ✅ GitHub repo with the code
- ✅ Vercel project (deployed)
- ✅ Supabase project (created)

Now let's connect them all together!

---

## 📋 Step-by-Step Instructions

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/)
2. Click on your project
3. In the left sidebar, click **Settings** (gear icon ⚙️)
4. Click **API**
5. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

**Copy both of these - you'll need them in Step 4**

---

### Step 2: Run the Database Schema

1. In Supabase sidebar, click **SQL Editor** (icon: `>_`)
2. Click **+ New query** button
3. Open your GitHub repo and find the file: `public/schema.sql`
4. **Copy ALL the content** from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see: ✅ "Success. No rows returned"

**What this does:**
- Creates all the database tables (profiles, medicines, vitals, etc.)
- Sets up security policies (RLS)
- Creates storage buckets for images

---

### Step 3: Create Storage Buckets

1. In Supabase sidebar, click **Storage** (icon looks like a folder)
2. Click **New bucket**
3. Create these 3 buckets:

**Bucket 1:**
- Name: `prescriptions`
- Toggle **Public bucket** to OFF (keep it private)
- Click **Create bucket**

**Bucket 2:**
- Name: `lab-reports`
- Toggle **Public bucket** to OFF
- Click **Create bucket**

**Bucket 3:**
- Name: `medicine-photos`
- Toggle **Public bucket** to OFF
- Click **Create bucket**

You should now see 3 buckets in your Storage section.

---

### Step 4: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Click **Settings** tab (top menu)
4. Click **Environment Variables** (left sidebar)
5. Click **Add** button

**Add first variable:**
- Name: `VITE_SUPABASE_URL`
- Value: (paste your Project URL from Step 1)
- Environment: ✅ Production ✅ Preview ✅ Development
- Click **Save**

**Add second variable:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: (paste your anon public key from Step 1)
- Environment: ✅ Production ✅ Preview ✅ Development
- Click **Save**

You should now see both variables listed.

---

### Step 5: Redeploy to Vercel

1. In Vercel dashboard, click **Deployments** tab
2. Find the latest deployment (top of the list)
3. Click the **three dots (...)** on the right
4. Click **Redeploy**
5. Confirm the redeploy

**Wait 1-2 minutes for deployment to complete.**

---

### Step 6: Verify Connection

1. Open your deployed site (the Vercel URL)
2. Look at the **top-right corner** - you should see a status indicator:
   - 🟢 **"Cloud Synced"** = Connected to Supabase ✅
   - 🟡 **"Local Only"** = Still using localStorage (check your env vars)
   - 🔴 **"Sync Error"** = Connection failed (check credentials)

3. Click the status indicator to see details

---

## 🎉 That's It!

Your app is now:
- ✅ Deployed on Vercel (accessible from any device)
- ✅ Connected to Supabase (cloud database)
- ✅ Ready for image uploads (storage buckets created)
- ✅ Data is backed up in the cloud

---

## 📱 Next Steps (Optional)

### Make it a PWA (Install on Phone)

Add this to `public/manifest.json`:
```json
{
  "name": "Health Companion",
  "short_name": "Health",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Then add to `index.html` `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#4F46E5" />
```

### Enable Image Upload

The app already has image upload UI ready. Once Supabase is connected:
1. Go to Records tab
2. Click "Add Lab Report" or "Add Prescription"
3. You'll see an upload button (currently placeholder)
4. The code is ready - just need to implement the actual upload logic

---

## 🔧 Troubleshooting

### "Local Only" status shows up

**Problem:** Environment variables not set correctly

**Solution:**
1. Check Vercel → Settings → Environment Variables
2. Make sure names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Make sure you selected all 3 environments (Production, Preview, Development)
4. **Redeploy** after adding variables

### "Sync Error" status

**Problem:** Supabase connection failed

**Solution:**
1. Check if you ran the SQL schema (Step 2)
2. Check if storage buckets exist (Step 3)
3. Verify the URL and key are correct (no extra spaces)
4. Try clicking "Retry Connection" on the status indicator

### Data not syncing between devices

**Problem:** Still using localStorage instead of Supabase

**Solution:**
1. Check the connection status (should be green "Cloud Synced")
2. If it shows "Local Only", follow the troubleshooting above
3. Clear browser cache and reload

---

## 📞 Need Help?

If you get stuck:
1. Check the connection status indicator (top-right)
2. Click it to see detailed error messages
3. Verify all steps above are completed
4. Check browser console (F12) for error messages

---

## 🎯 What You've Accomplished

- ✅ Cross-platform health management app
- ✅ Cloud database with automatic backups
- ✅ Secure authentication-ready architecture
- ✅ Image storage for prescriptions/labs
- ✅ Deployed and accessible from anywhere
- ✅ Free tier (no costs until you exceed limits)

**Your mom can now access her health data from any device, and it's safely backed up in the cloud!** 🎉
