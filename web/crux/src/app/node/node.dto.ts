/* eslint-disable @typescript-eslint/lines-between-class-members */

import { NodeType } from 'src/shared/models'

// eslint-disable-next-line import/prefer-default-export
export class BasicNodeDto {
  id: string
  name: string
  type: NodeType
}

export class NodeDto extends BasicNodeDto {
  address: string
  version: string
}
