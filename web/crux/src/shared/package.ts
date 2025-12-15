import { ConfigService } from '@nestjs/config'
import { execSync } from 'child_process'
import { coerce, major, minor } from 'semver'

export const getPackageVersion = (config: ConfigService) => {
  const packageVersion = config.get<string>('npm_package_version')
  if (!packageVersion.includes('-') && process.env.NODE_ENV === 'development') {
    const commitHash = execSync('git rev-parse --short HEAD:../../golang').toString()

    if (commitHash && commitHash.length > 0) {
      return `${packageVersion}-${commitHash}`
    }
  }

  return packageVersion
}

export const getCommitHash = (version: string, length?: number): string | null => {
  const parts = version.split('-')
  if (parts.length < 2) {
    return null
  }

  const hash = parts[1]
  if (typeof length !== 'number' || hash.length <= length) {
    return hash
  }

  return hash.substring(0, length)
}

export const getAgentVersionFromPackage = (config: ConfigService) => {
  const packageVersion = coerce(getPackageVersion(config))

  return packageVersion ? `${major(packageVersion)}.${minor(packageVersion)}` : 'stable'
}
