import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.efe.dilhane',
  appName: 'Dilhane',
  webDir: 'dist',
  android: {
    // Mikrofon ve ses için gerekli
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
