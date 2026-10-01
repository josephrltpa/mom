# 📱 Build Android App Guide

Your web app is ready! Now let's convert it into a native Android app using Capacitor.

## 🎯 What You'll Get

- ✅ Native Android app (APK file)
- ✅ Install on any Android phone
- ✅ Works offline
- ✅ Can publish to Google Play Store
- ✅ Access to native features (camera, notifications, etc.)

---

## 📋 Prerequisites

### 1. Install Android Studio
Download from: https://developer.android.com/studio

**During installation:**
- ✅ Check "Android Virtual Device"
- ✅ Check "Android SDK"
- ✅ Accept all default options

### 2. Install Java JDK 17
Download from: https://adoptium.net/

**After installation:**
- Set `JAVA_HOME` environment variable
- Add to PATH: `%JAVA_HOME%\bin`

### 3. Verify Installation
Open terminal/command prompt:
```bash
java -version
# Should show: openjdk version "17.x.x"

adb --version
# Should show Android Debug Bridge version
```

---

## 🚀 Step-by-Step Build Process

### Step 1: Initialize Capacitor (One-time setup)

```bash
npx cap init
```

When prompted:
- **App name:** Health Companion
- **App ID:** com.healthcompanion.app
- **Web asset directory:** dist

### Step 2: Add Android Platform

```bash
npx cap add android
```

This creates an `android/` folder with native Android code.

### Step 3: Build Your Web App

```bash
npm run build
```

This creates the `dist/` folder with your optimized web app.

### Step 4: Sync Web Assets to Android

```bash
npx cap sync android
```

This copies your web app into the Android project.

### Step 5: Open in Android Studio

```bash
npx cap open android
```

Android Studio will open with your project.

---

## 🔨 Building the APK

### Option A: Debug APK (For Testing)

In Android Studio:
1. Wait for Gradle sync to complete (first time takes 5-10 minutes)
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. Click **"locate"** in the notification popup
5. Find the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Transfer to phone:**
- Email the APK to yourself
- Or use USB cable
- Or use cloud storage (Google Drive, Dropbox)

**Install on phone:**
- Open the APK file on your phone
- Allow "Install from unknown sources" if prompted
- Tap "Install"

### Option B: Release APK (For Distribution)

In Android Studio:
1. Click **Build** → **Generate Signed Bundle / APK**
2. Select **APK** → Click **Next**
3. Create a new keystore (or use existing):
   - **Key store path:** Choose a location (e.g., `my-release-key.jks`)
   - **Password:** Create a strong password (SAVE THIS!)
   - **Alias:** my-key-alias
   - **Password:** Create password (SAVE THIS!)
   - **Validity:** 25 years
   - **Certificate:** Fill in your details
4. Click **Next**
5. Select **release** → Click **Finish**
6. Find APK at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📲 Testing on Your Phone

### Method 1: USB Debugging (Recommended)

1. **Enable Developer Options on phone:**
   - Go to Settings → About phone
   - Tap "Build number" 7 times
   - Developer options enabled!

2. **Enable USB Debugging:**
   - Go to Settings → Developer options
   - Enable "USB debugging"

3. **Connect phone to computer:**
   - Use USB cable
   - Accept "Allow USB debugging" prompt on phone

4. **Run app directly:**
   ```bash
   npx cap run android
   ```
   Or in Android Studio: Click the **Run** button (▶️)

### Method 2: Install APK Manually

1. Build the APK (see above)
2. Transfer APK to phone (email, cloud, USB)
3. Open APK file on phone
4. Tap "Install"

---

## 🎨 Customizing Your App

### Change App Icon

1. Create an icon image (1024x1024 PNG)
2. Use this tool: https://icon.kitchen/
3. Download the generated icons
4. Replace files in: `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Change App Name

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Health Companion</string>
```

### Change App Colors

Edit `android/app/src/main/res/values/colors.xml`:
```xml
<color name="colorPrimary">#4F46E5</color>
<color name="colorPrimaryDark">#4338CA</color>
<color name="colorAccent">#6366F1</color>
```

---

## 🔄 Updating Your App

When you make changes to your web app:

```bash
# 1. Build web app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Rebuild APK
# In Android Studio: Build → Build APK
```

---

## 📦 Publishing to Google Play Store (Optional)

### Step 1: Create Developer Account
- Go to: https://play.google.com/console
- Pay one-time $25 fee
- Complete account setup

### Step 2: Prepare App Listing
You'll need:
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2)
- App description
- Privacy policy URL

### Step 3: Upload APK
1. Go to Play Console → Create app
2. Fill in store listing
3. Upload your signed APK
4. Set pricing and distribution
5. Submit for review (takes 1-7 days)

---

## 🐛 Troubleshooting

### "JAVA_HOME not set"
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x"

# Mac/Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

### "SDK not found"
- Open Android Studio
- Tools → SDK Manager
- Install Android SDK Platform 33 or higher

### "Gradle sync failed"
- File → Invalidate Caches / Restart
- Delete `.gradle` folder in project root
- Try sync again

### "App not installing"
- Uninstall previous version first
- Check APK architecture (arm64 vs x86)
- Enable "Install from unknown sources" in phone settings

---

## 📚 Quick Reference Commands

```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Run on connected device
npx cap run android

# Copy web assets only
npx cap copy android

# Update native plugins
npx cap update android
```

---

## ✅ Checklist

Before building:
- [ ] Android Studio installed
- [ ] Java JDK 17 installed
- [ ] `JAVA_HOME` set
- [ ] Android SDK installed
- [ ] Web app builds successfully (`npm run build`)
- [ ] Capacitor initialized (`npx cap init`)
- [ ] Android platform added (`npx cap add android`)

Building APK:
- [ ] Web app built (`npm run build`)
- [ ] Assets synced (`npx cap sync android`)
- [ ] Android Studio opened (`npx cap open android`)
- [ ] Gradle sync completed
- [ ] APK built successfully

Testing:
- [ ] APK transferred to phone
- [ ] App installs successfully
- [ ] App opens without errors
- [ ] All features work correctly

---

## 🎉 That's It!

Your web app is now a native Android app! You can:
- Install it on any Android phone
- Share the APK with family/friends
- Publish to Google Play Store
- Access native device features

**Next step:** Follow the steps above to build your first APK! 🚀
