import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import packageJson from './package.json'

const [major, minor, patch] = packageJson.version.split('.').map(Number)

let newVersion

switch (process.argv[2]) {
  case 'major':
    newVersion = `${major + 1}.0.0`

    break

  case 'minor':
    newVersion = `${major}.${minor + 1}.0`

    break

  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`

    break
}

if (newVersion) {
  packageJson.version = newVersion

  fs.writeFileSync(
    path.resolve(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  )

  execSync('git add package.json')
  execSync(`git commit -m "v${newVersion}"`)

  console.log(`Update to v${newVersion}`)
}
