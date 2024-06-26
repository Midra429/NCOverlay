import { defineConfig } from 'wxt'
import react from '@vitejs/plugin-react-swc'

import { GITHUB_URL } from './src/constants'
import { uid } from './src/utils/uid'
import { displayName, version } from './package.json'

const EXT_BUILD_ID = JSON.stringify(uid())
const EXT_USER_AGENT = JSON.stringify(`${displayName}/${version}`)

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: displayName,
    description:
      '動画配信サービスの再生画面にニコニコのコメントを表示する拡張機能',
    homepage_url: GITHUB_URL,
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

  hooks: {
    'entrypoints:resolved'(wxt, entrypoints) {
      if (wxt.config.browser === 'firefox') {
        for (let i = 0; i < entrypoints.length; i++) {
          const entrypoint = entrypoints[i]

          if (
            entrypoint.type === 'content-script' &&
            entrypoint.options.world === 'MAIN'
          ) {
            entrypoints.splice(i, 1)
          }
        }
      }
    },
  },

  srcDir: 'src',
  imports: false,
  vite: () => ({
    define: {
      EXT_BUILD_ID,
      EXT_USER_AGENT,
    },
    build: {
      chunkSizeWarningLimit: 1024,
    },
    plugins: [react()],
  }),
})
