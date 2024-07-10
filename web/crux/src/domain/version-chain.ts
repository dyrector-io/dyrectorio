import { VersionChain } from '@prisma/client'
import { VersionWithName } from './version'

export type VersionWithNameAndConnections = VersionWithName & {
  parent?: {
    versionId: string
  }
  _count: {
    children: number
  }
}

export type VersionChainWithMembers = Pick<VersionChain, 'id'> & {
  members: VersionWithNameAndConnections[]
}

export type VersionChainWithEdges = {
  id: string
  earliest: VersionWithName
  latest: VersionWithName
}

export const versionChainMembersOf = (chain: VersionChainWithMembers): VersionChainWithEdges => {
  const earliest = chain.members.find(it => !it.parent)
  const latest = chain.members.find(it => it._count.children < 1) ?? earliest

  return {
    id: chain.id,
    earliest,
    latest,
  }
}
