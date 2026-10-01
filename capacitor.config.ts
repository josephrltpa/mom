import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.healthcompanion.app',
  appName: 'Health Companion',
  webDir: 'dist',
  server: {
    // For production, comment out the url line below
    // url: 'https://mom-one-ashy.vercel.app', // Use your deployed URL
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4F46E5',
      showSpinner: false,
    }
  }
};

export default config;
