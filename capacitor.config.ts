
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adielmairani.desa',
  appName: 'DESA',
  webDir: 'public',
  server: {
    url: 'https://esa-dekut.vercel.app',
    cleartext: false,
  },
};

export default config;
