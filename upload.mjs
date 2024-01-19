// @ts-check
import { globSync } from 'glob'
import fs from 'fs-extra'
import archiver from 'archiver'
import { fileFromPath } from 'formdata-node/file-from-path'
import { ChromeWebstoreAPI } from '@plasmohq/chrome-webstore-api'
import { MozillaAddonsAPI } from '@plasmohq/mozilla-addons-api'

void (await import('dotenv')).config()

/**
 * @param {{ path: string; outfile: string; }} options
 */
const zip = (options) => {
  const output = fs.createWriteStream(options.outfile)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })

  archive.pipe(output)
  archive.directory(options.path, false)

  return archive.finalize()
}

const cliArgs = process.argv.slice(2)

const chromeExtPath =
  cliArgs.includes('--chrome') && globSync('./dist/*-chrome.zip')[0]
const firefoxExtPath =
  cliArgs.includes('--firefox') && globSync('./dist/*-firefox.zip')[0]

/**
 * Chrome Web Store
 */
if (chromeExtPath) {
  const client = new ChromeWebstoreAPI({
    extId: process.env.CWS_EXTENSION_ID ?? '',
    clientId: process.env.CWS_CLIENT_ID ?? '',
    clientSecret: process.env.CWS_CLIENT_SECRET ?? '',
    refreshToken: process.env.CWS_REFRESH_TOKEN ?? '',
  })

  try {
    const result = await client.submit({
      filePath: chromeExtPath,
    })

    console.log('[Chrome Web Store]', result)
  } catch (e) {
    console.error(e)
  }
}

/**
 * Firefox Add-ons
 */
if (firefoxExtPath) {
  const client = new MozillaAddonsAPI({
    extId: process.env.AMO_EXTENSION_ID ?? '',
    apiKey: process.env.AMO_API_KEY ?? '',
    apiSecret: process.env.AMO_API_SECRET ?? '',
    license: process.env.WEBEXT_LICENSE,
  })

  // 拡張機能のファイルをアップロード
  const uploadResponse = await client.uploadFile({
    filePath: firefoxExtPath,
  })

  // ソースコードをZIPに圧縮
  const tmpSourcePath = `../tmp-${crypto.randomUUID()}`
  const sourceZipPath = `${tmpSourcePath}.zip`

  fs.copySync('./', tmpSourcePath)
  fs.removeSync(`${tmpSourcePath}/node_modules`)
  fs.removeSync(`${tmpSourcePath}/dist`)

  await zip({
    path: tmpSourcePath,
    outfile: sourceZipPath,
  })

  fs.removeSync(tmpSourcePath)

  // ソースコードをアップロード
  const formData = new FormData()
  formData.append('source', await fileFromPath(sourceZipPath))
  formData.append('upload', uploadResponse.uuid)
  if (process.env.WEBEXT_LICENSE) {
    formData.append('license', process.env.WEBEXT_LICENSE)
  }

  try {
    await fetch(new URL('/versions/', client.productEndpoint), {
      method: 'POST',
      headers: {
        Authorization: `JWT ${await client.getAccessToken()}`,
      },
      body: formData,
    })

    // バージョンを作成
    const versionResponse = await client.createVersion({
      uploadUuid: uploadResponse.uuid,
      version: uploadResponse.version,
    })

    console.log('[Firefox Add-ons]', versionResponse)
  } catch (e) {
    console.error(e)
  }

  fs.removeSync(sourceZipPath)
}
