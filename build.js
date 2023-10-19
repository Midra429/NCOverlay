// @ts-check
const { globSync } = require('glob')
const fs = require('fs-extra')
const sass = require('sass')
const esbuild = require('esbuild')
const htmlMinifier = require('html-minifier-terser')
const CleanCSS = require('clean-css')
const terser = require('terser')
const archiver = require('archiver')

const cleanCSS = new CleanCSS()

const copyPaths = {
  manifest: 'manifest.json',
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

const manifest = fs.readJsonSync(`${inputDir}/${copyPaths.manifest}`)
const prodDir = `dist/NCOverlay_v${manifest.version}`

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

  archive.finalize()
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
  fs.writeFileSync(`${dir}/${copyPaths.manifest}`, JSON.stringify(manifest))

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
  await build()

  fs.copySync(outputDir, prodDir)

  await minify(prodDir)

  zip({
    path: prodDir,
    outfile: `${prodDir}.zip`,
  })

  // fs.removeSync(prodDir)
}

main()
