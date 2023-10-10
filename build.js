// @ts-check
const fs = require('fs-extra')
const sass = require('sass')
const esbuild = require('esbuild')
const archiver = require('archiver')

const inputDir = 'src'
const outputDir = 'dist/extension'

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
  if (fs.existsSync(outputDir)) {
    fs.removeSync(outputDir)
  }
  fs.mkdirSync(outputDir, { recursive: true })

  fs.copySync(`${inputDir}/manifest.json`, `${outputDir}/manifest.json`)
  fs.copySync(`${inputDir}/assets`, `${outputDir}/assets`)
  fs.copySync(`${inputDir}/styles`, `${outputDir}/styles`)
  fs.copySync(`${inputDir}/popup/index.html`, `${outputDir}/popup/index.html`)
  fs.copySync(
    `${inputDir}/side_panel/index.html`,
    `${outputDir}/side_panel/index.html`
  )

  // CSS
  const cssPaths = [
    `${inputDir}/popup/style/index.scss`,
    `${inputDir}/side_panel/style/index.scss`,
  ]
  for (const path of cssPaths) {
    const { css } = sass.compile(path)
    const filePath = path
      .replace(/^src(?=\/)/, outputDir)
      .replace(/(?<=.+)\/index(?=\.[a-z]+$)/i, '')
      .replace(/(?<=\.)(sass|scss)$/, 'css')
    fs.writeFileSync(filePath, css)
  }

  // JavaScript
  const jsPaths = [
    `${inputDir}/content_script/index.ts`,
    `${inputDir}/background/index.ts`,
    `${inputDir}/popup/script/index.ts`,
    `${inputDir}/side_panel/script/index.ts`,
  ]
  const { outputFiles } = await esbuild.build({
    entryPoints: jsPaths,
    outdir: outputDir,
    bundle: true,
    write: false,
  })
  for (const file of outputFiles) {
    const filePath = file.path.replace(/(?<=.+)\/index(?=\.[a-z]+$)/i, '')
    fs.createFileSync(filePath)
    fs.writeFileSync(filePath, file.text)
  }

  zip({
    path: outputDir,
    outfile: `${outputDir}.zip`,
  })
}

build()
