/// <reference types="vite/client" />

/**
 * 拡張機能のビルド時に生成されるID
 */
declare const EXT_BUILD_ID: string

/**
 * @see https://wxt.dev/guide/key-concepts/web-extension-polyfill.html#environment-variables
 */
interface ImportMetaEnv {
  /**
   * The target browser
   */
  readonly BROWSER: string

  /**
   * The target manifest version
   */
  readonly MANIFEST_VERSION: 2 | 3

  /**
   * equivalent to `import.meta.env.BROWSER === "chrome"`
   */
  readonly CHROME: boolean

  /**
   * equivalent to `import.meta.env.BROWSER === "firefox"`
   */
  readonly FIREFOX: boolean

  /**
   * equivalent to `import.meta.env.BROWSER === "safari"`
   */
  readonly SAFARI: boolean

  /**
   * equivalent to `import.meta.env.BROWSER === "edge"`
   */
  readonly EDGE: boolean

  /**
   * equivalent to `import.meta.env.BROWSER === "opera"`
   */
  readonly OPERA: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
