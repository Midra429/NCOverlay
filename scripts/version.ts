import path from 'path'
import fs from 'fs'
import packageJson from '../package.json'

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
  default:
    newVersion = `${major}.${minor}.${patch + 1}`
    break
}

packageJson.version = newVersion

fs.writeFileSync(
  path.resolve(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
)

console.log(`Update to v${newVersion}`)
