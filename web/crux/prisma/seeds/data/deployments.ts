import { Deployment, Prisma } from '@prisma/client'
import { constants } from '../consts'

export const deployments = [
  {
    id: constants.DEPLYOMENT_ID,
    note: 'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    nodeId: constants.NODE_ID,
    versionId: constants.VERSION_ID,
    environment: [{ id: 'FEF63E0B-D634-4AC8-BA8C-ECD673A92E25', key: 'key', value: 'value' }] as Prisma.JsonArray,
    prefix: 'test-namespace',
    status: 'preparing',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
  },
  {
    id: 'D2E10D2D-FA89-4CAF-BEAD-7635EC51C734',
    note: 'Test',
    nodeId: constants.NODE_ID,
    versionId: '5260B9D6-0BE0-491B-8808-836DC285B12C',
    environment: [{ id: 'FEF63E0B-D634-4AC8-BA8C-ECD673A92E25', key: 'key', value: 'value' }] as Prisma.JsonArray,
    prefix: 'test-namespace',
    status: 'preparing',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
  },
] as Deployment[]
