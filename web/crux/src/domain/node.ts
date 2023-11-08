import { Node, NodeToken } from 'prisma/prisma-client'

export type BasicNode = Pick<Node, 'id' | 'name' | 'type'>

export type NodeScriptType = 'shell' | 'powershell'

export type NodeWithToken = Node & {
  token?: NodeToken
}
