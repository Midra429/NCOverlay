import { defineConfig } from 'wxt'
import react from '@vitejs/plugin-react'

import { uid } from './src/utils/uid'
import { name, version } from './package.json'

const EXT_BUILD_ID = JSON.stringify(`${name}/${version}-${uid()}`)

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'NCOverlay',
    description:
      '動画配信サービスの再生画面にニコニコのコメントを表示する拡張機能',
    homepage_url: 'https://github.com/Midra429/NCOverlay',
    browser_specific_settings:
      browser === 'firefox'
        ? {
            gecko: {
              id: 'ncoverlay@midra.me',
              strict_min_version: '113.0',
            },
            gecko_android: {
              strict_min_version: '113.0',
            },
          }
        : undefined,
    permissions: ['storage', 'unlimitedStorage', 'tabs'],
  }),

  srcDir: 'src',
  outDir: 'dist',
  imports: false,
  vite: () => ({
    define: {
      EXT_BUILD_ID,
    },
    build: {
      chunkSizeWarningLimit: 1024,
    },
    plugins: [react()],
  }),
})
