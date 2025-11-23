import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thejerktrackerx.app',
  appName: 'JERK Tracker X',
  webDir: 'out',
  android: {
    webContentsDebuggingEnabled: true,
    allowMixedContent: true
  }
};

export default config;
