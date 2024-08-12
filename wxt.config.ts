import type { UserManifest } from 'wxt'

import { defineConfig } from 'wxt'

import { GITHUB_URL } from './src/constants'
import { uid } from './src/utils/uid'
import { name, displayName, version, description } from './package.json'

const EXT_BUILD_ID = JSON.stringify(uid())
const EXT_USER_AGENT = JSON.stringify(`${displayName}/${version}`)

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => {
    const permissions: UserManifest['permissions'] = [
      'storage',
      'unlimitedStorage',
      'tabs',
      'contextMenus',
      'clipboardWrite',
    ]

    let browser_specific_settings: UserManifest['browser_specific_settings']

    switch (browser) {
      case 'chrome':
        permissions.push('sidePanel')

        break

      case 'firefox':
        browser_specific_settings = {
          gecko: {
            id: `${name}@midra.me`,
            strict_min_version: '113.0',
          },
        }

        break
    }

    return {
      name: displayName,
      description,
      homepage_url: GITHUB_URL,
      permissions,
      host_permissions: ['<all_urls>'],
      browser_specific_settings,
    }
  },

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
    ssr: {
      noExternal: ['@webext-core/messaging', '@webext-core/proxy-service'],
    },
  }),
  modules: ['@wxt-dev/module-react'],
})
