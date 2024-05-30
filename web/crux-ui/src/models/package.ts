import { DyoNode } from './node'
import { BasicProject } from './project'
import { VersionChain } from './version'

export type PackageEnvironment = {
  id: string
  name: string
  node: DyoNode
  prefix: string
}

export type PackageVersionChain = VersionChain & {
  project: BasicProject
}

export type Package = {
  id: string
  name: string
  description: string
  icon?: string
  versionChains: PackageVersionChain[]
  environments: string[]
}

export type PackageDetails = Omit<Package, 'environments'> & {
  environments: PackageEnvironment[]
}

export type UpdatePackage = {
  name: string
  description?: string
  icon?: string
  chainIds: string[]
}

export type CreatePackage = UpdatePackage

export type UpdatePackageEnvironment = {
  name: string
  nodeId: string
  prefix: string
}

export type CreatePackageEnvironment = UpdatePackageEnvironment

export const packageDetailsToPackage = (pack: PackageDetails): Package => ({
  ...pack,
  environments: pack.environments.map(it => it.name),
})
