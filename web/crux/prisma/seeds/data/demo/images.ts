import { Image } from '@prisma/client'
import { DemoConstants } from '../../consts'

export const images = [
  {
    name: 'adservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 1,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'cartservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 2,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'checkoutservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 3,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'currencyservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 4,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'emailservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 5,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'frontend',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 6,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'loadgenerator',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 7,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'paymentservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 8,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'productcatalogservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 9,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'recommendationservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 10,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: 'shippingservice',
    tag: 'v0.3.9',
    registryId: DemoConstants.REGISTRY_ID,
    order: 11,
    versionId: DemoConstants.VERSION_ID,
  },
] as Image[]
