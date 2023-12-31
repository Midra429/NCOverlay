// @ts-check
const { globSync } = require('glob')
const fs = require('fs-extra')
const deepmerge = require('deepmerge')
const sass = require('sass')
const esbuild = require('esbuild')
const htmlMinifier = require('html-minifier-terser')
const CleanCSS = require('clean-css')
const terser = require('terser')
const archiver = require('archiver')

const cleanCSS = new CleanCSS()

const manifestPaths = {
  base: 'manifest/base.json',
  chrome: 'manifest/chrome.json',
  firefox: 'manifest/firefox.json',
}

const copyPaths = {
  assets: 'assets',
  styles: 'styles',
  popup: 'popup/index.html',
  side_panel: 'side_panel/index.html',
}

const cssPaths = {
  'styles/main': 'styles/main.scss',
  'popup/style': 'popup/style/index.scss',
  'side_panel/style': 'side_panel/style/index.scss',
}

const jsPaths = {
  'content_script': 'content_script/index.ts',
  'background': 'background/index.ts',
  'popup/script': 'popup/script/index.ts',
  'side_panel/script': 'side_panel/script/index.ts',
}

const inputDir = 'src'
const outputDir = 'dist/extension'
const outputDirChrome = `${outputDir}-chrome`
const outputDirFirefox = `${outputDir}-firefox`

const manifest_base = fs.readJsonSync(`${inputDir}/${manifestPaths.base}`)
const manifest_chrome = deepmerge(
  manifest_base,
  fs.readJsonSync(`${inputDir}/${manifestPaths.chrome}`)
)
const manifest_firefox = deepmerge(
  manifest_base,
  fs.readJsonSync(`${inputDir}/${manifestPaths.firefox}`)
)

const prodDir = `dist/NCOverlay_v${manifest_base.version}`
const prodDirChrome = `${prodDir}-chrome`
const prodDirFirefox = `${prodDir}-firefox`

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

const build = async () => {
  if (fs.existsSync('dist')) {
    fs.removeSync('dist')
  }
  fs.mkdirSync('dist', { recursive: true })

  // copy
  for (const path of Object.values(copyPaths)) {
    fs.copySync(`${inputDir}/${path}`, `${outputDir}/${path}`)
  }

  // CSS
  for (const path of Object.values(cssPaths)) {
    const { css } = sass.compile(`${inputDir}/${path}`)
    const filePath = `${outputDir}/${path}`
      .replace(/(?<=.+)\/index(?=\.[a-z]+$)/i, '')
      .replace(/(?<=\.)(sass|scss)$/, 'css')
    fs.writeFileSync(filePath, css)
  }

  // JavaScript
  const { outputFiles } = await esbuild.build({
    entryPoints: Object.values(jsPaths).map((v) => `${inputDir}/${v}`),
    outdir: outputDir,
    bundle: true,
    write: false,
  })
  for (const file of outputFiles) {
    const filePath = file.path.replace(/(?<=.+)\/index(?=\.[a-z]+$)/i, '')
    fs.createFileSync(filePath)
    fs.writeFileSync(filePath, file.text)
  }

  for (const path of globSync(`${outputDir}/**/*.{sass,scss,ts}`)) {
    fs.removeSync(path)
  }
}

/**
 * @param {string} dir
 */
const minify = async (dir) => {
  const paths = globSync(`${dir}/**/*.{html,css,js}`)
  for (const path of paths) {
    const file = fs.readFileSync(path, 'utf8')

    let output = file

    if (path.endsWith('.html')) {
      output = await htmlMinifier.minify(file, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeComments: true,
      })
    }

    if (path.endsWith('.css')) {
      const { styles } = cleanCSS.minify(file)
      output = styles
    }

    if (path.endsWith('.js')) {
      const { code } = await terser.minify(file, {
        compress: true,
        mangle: true,
        format: {
          ascii_only: true,
        },
      })
      output = code ?? ''
    }

    fs.writeFileSync(path, output)
  }
}

const main = async () => {
  // dist/extension
  await build()

  globSync('dist/**/.DS_Store').forEach(fs.removeSync)

  fs.copySync(outputDir, prodDir)

  fs.copySync(outputDir, outputDirChrome)
  fs.copySync(outputDir, outputDirFirefox)

  fs.removeSync(outputDir)
  fs.removeSync(`${outputDirFirefox}/side_panel`)

  // dist/NCOverlay_v0.0.0
  await minify(prodDir)

  fs.copySync(prodDir, prodDirChrome)
  fs.copySync(prodDir, prodDirFirefox)

  fs.removeSync(prodDir)
  fs.removeSync(`${prodDirFirefox}/side_panel`)

  // manifest.json
  const manifestChrome = JSON.stringify(manifest_chrome)
  const manifestFirefox = JSON.stringify(manifest_firefox)

  fs.writeFileSync(`${outputDirChrome}/manifest.json`, manifestChrome)
  fs.writeFileSync(`${outputDirFirefox}/manifest.json`, manifestFirefox)

  fs.writeFileSync(`${prodDirChrome}/manifest.json`, manifestChrome)
  fs.writeFileSync(`${prodDirFirefox}/manifest.json`, manifestFirefox)

  await zip({
    path: `${prodDirChrome}`,
    outfile: `${prodDirChrome}.zip`,
  })
  await zip({
    path: `${prodDirFirefox}`,
    outfile: `${prodDirFirefox}.zip`,
  })
}

main()
