import { defineConfig } from 'wxt'

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
            // gecko_android: {
            //   strict_min_version: '113.0',
            // },
          }
        : undefined,
    permissions: ['storage', 'unlimitedStorage', 'tabs'],
  }),

  hooks: {
    'build:manifestGenerated'(_, manifest) {
      if (manifest.content_scripts) {
        manifest.content_scripts.forEach((script, idx, ary) => {
          // @ts-ignore
          if (script.world === 'MAIN' && script.js) {
            manifest.web_accessible_resources ??= []
            // @ts-ignore
            manifest.web_accessible_resources.push({
              matches: script.matches.map((v) => `${new URL(v).origin}/*`),
              resources: script.js,
            })

            delete ary[idx]
          }
        })

        manifest.content_scripts = manifest.content_scripts.filter(Boolean)
      }
    },
  },

  srcDir: 'src',
  outDir: 'dist',
  imports: false,
  vite: () => ({
    define: {
      EXT_BUILD_ID,
      EXT_USER_AGENT,
    },
    build: {
      chunkSizeWarningLimit: 1024,
    },
  }),
  modules: ['@wxt-dev/module-react'],
})
