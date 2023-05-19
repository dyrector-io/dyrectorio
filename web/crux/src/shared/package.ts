import { ConfigService } from '@nestjs/config'
import { coerce, major, minor } from 'semver'

export const getPackageVersion = (config: ConfigService) => config.get<string>('npm_package_version')

export const getAgentVersionFromPackage = (config: ConfigService) => {
  const packageVersion = coerce(getPackageVersion(config))

  return packageVersion ? `${major(packageVersion)}.${minor(packageVersion)}` : 'stable'
}
