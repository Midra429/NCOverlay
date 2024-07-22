import { defineConfig } from 'wxt'

import { GITHUB_URL } from './src/constants'
import { uid } from './src/utils/uid'
import { displayName, version, description } from './package.json'

const EXT_BUILD_ID = JSON.stringify(uid())
const EXT_USER_AGENT = JSON.stringify(`${displayName}/${version}`)

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: displayName,
    description,
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

    // commands: {
    //   'globalOffset:increase': {
    //     suggested_key: {
    //       default: 'Ctrl+Shift+Right',
    //     },
    //     description: '全体のオフセットを増やす',
    //   },

    //   'globalOffset:decrease': {
    //     suggested_key: {
    //       default: 'Ctrl+Shift+Left',
    //     },
    //     description: '全体のオフセットを減らす',
    //   },

    //   'jumpMarker:A': {
    //     suggested_key: {
    //       default: 'Ctrl+Shift+A',
    //     },
    //     description: 'オフセットを「Aパート」に飛ばす',
    //   },
    //   'jumpMarker:B': {
    //     suggested_key: {
    //       default: 'Ctrl+Shift+B',
    //     },
    //     description: 'オフセットを「Bパート」に飛ばす',
    //   },
    // },

    host_permissions: ['<all_urls>'],
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
