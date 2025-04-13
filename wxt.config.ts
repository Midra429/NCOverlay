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
      'clipboardRead',
      'downloads',
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
      default_locale: 'ja',
      homepage_url: GITHUB_URL,
      permissions,
      host_permissions: ['<all_urls>'],
      browser_specific_settings,
    }
  },

  srcDir: 'src',
  outDir: 'dist',
  autoIcons: {
    baseIconPath: '../assets/icon.png',
    sizes: [512],
    grayscaleOnDevelopment: false,
  },
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
      noExternal: ['@webext-core/messaging'],
    },
  }),
  modules: [
    '@wxt-dev/webextension-polyfill',
    '@wxt-dev/auto-icons',
    '@wxt-dev/module-react',
  ],
})
