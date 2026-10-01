# 🚀 Quick Start: Build Android APK

## ⚡ Fast Track (30 minutes)

### What You Need to Install First

1. **Android Studio** (2GB download, 10 min install)
   - Download: https://developer.android.com/studio
   - Install with default settings

2. **Java JDK 17** (100MB, 2 min install)
   - Download: https://adoptium.net/
   - Install and restart computer

---

## 📱 Build Your APK (Step-by-Step)

### Step 1: Open Terminal in Your Project Folder

```bash
cd path/to/your/project
```

### Step 2: Initialize Capacitor

```bash
npx cap init
```

When asked:
- App name: `Health Companion`
- App ID: `com.healthcompanion.app`
- Web asset directory: `dist`

### Step 3: Add Android Platform

```bash
npx cap add android
```

### Step 4: Build Web App

```bash
npm run build
```

### Step 5: Sync to Android

```bash
npx cap sync android
```

### Step 6: Open Android Studio

```bash
npx cap open android
```

### Step 7: Build APK in Android Studio

1. Wait for Gradle sync (first time: 5-10 minutes)
2. Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build (2-3 minutes)
4. Click **"locate"** in popup
5. APK is at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 8: Install on Phone

**Option A: USB Cable**
1. Enable USB debugging on phone (Settings → Developer options)
2. Connect phone to computer
3. In Android Studio, click **Run** button (▶️)

**Option B: Transfer APK**
1. Email the APK to yourself
2. Open on phone
3. Tap "Install"

---

## ✅ That's It!

Your app is now an Android app! 🎉

---

## 🔄 When You Update the Web App

```bash
npm run build
npx cap sync android
# Then rebuild APK in Android Studio
```

---

## 🆘 Common Issues

**"JAVA_HOME not set"**
→ Restart computer after installing Java

**"SDK not found"**
→ Open Android Studio → Tools → SDK Manager → Install SDK

**"Gradle sync failed"**
→ Wait longer (first time is slow)
→ Or: File → Invalidate Caches / Restart

---

## 📚 Need More Help?

See `BUILD_ANDROID_APP.md` for detailed instructions.
