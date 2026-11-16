import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native shell configuration for Block Quest.
 * Android is configured on Windows; iOS is deferred to macOS (DEC-006).
 */
const config: CapacitorConfig = {
  appId: 'com.blockquest.game',
  appName: 'Block Quest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#F4F2FA',
  },
};

export default config;
