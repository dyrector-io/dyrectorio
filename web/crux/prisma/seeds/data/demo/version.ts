import { Version } from '@prisma/client'
import { DemoConstants } from '../../consts'

export enum VersionType {
  INCREMENTAL = 'incremental',
  ROLLING = 'rolling',
}

export const version = (userId: string) => {
  return {
    id: DemoConstants.VERSION_ID,
    createdBy: userId,
    name: 'V1.0.0-demo',
    changelog: 'Mauris quis augue accumsan, molestie quam ut, tincidunt leo.',
    createdAt: new Date(),
    productId: DemoConstants.PRODUCT_ID,
    type: VersionType.INCREMENTAL,
    default: false,
  } as Version
}
