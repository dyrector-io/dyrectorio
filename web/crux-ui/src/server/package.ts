import pkg from 'package.json'

export type PackageInfo = {
  version: string
}

const packageInfo: PackageInfo = {
  version: pkg.version,
}

export default packageInfo
