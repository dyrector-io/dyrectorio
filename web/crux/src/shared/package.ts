import { major, minor } from 'semver'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json')

export const getAgentVersionFromPackage = () => {
  const packageVersion = pkg?.version

  return packageVersion ? `${major(packageVersion)}.${minor(packageVersion)}` : 'stable'
}

export type PackageInfo = {
  version: string
}

const packageInfo: PackageInfo = {
  version: pkg.version,
}

export default packageInfo
