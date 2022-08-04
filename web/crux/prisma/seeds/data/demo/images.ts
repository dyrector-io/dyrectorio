import { Image } from '@prisma/client'
import { DemoConstants } from '../../consts'

export enum ImageName {
  Adservice = 'adservice',
  Cartservice = 'cartservice',
  Checkoutservice = 'checkoutservice',
  Currencyservice = 'currencyservice',
  Emailservice = 'emailservice',
  Frontend = 'frontend',
  Loadgenerator = 'loadgenerator',
  Paymentservice = 'paymentservice',
  Productcatalogservice = 'productcatalogservice',
  Recommendationservice = 'recommendationservice',
  Shippingservice = 'shippingservice',
  Redis = 'redis',
}

export const images = [
  {
    name: ImageName.Adservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 1,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Cartservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 2,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Checkoutservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 3,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Currencyservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 4,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Emailservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 5,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Frontend,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 6,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Loadgenerator,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 7,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Paymentservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 8,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Productcatalogservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 9,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Recommendationservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 10,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Shippingservice,
    tag: 'v0.3.9',
    registryId: DemoConstants.MICROSERVICES_REGISTRY_ID,
    order: 11,
    versionId: DemoConstants.VERSION_ID,
  },
  {
    name: ImageName.Redis,
    tag: 'alpine',
    registryId: DemoConstants.DOCKER_HUB_REGISTRY_ID,
    order: 12,
    versionId: DemoConstants.VERSION_ID,
  },
] as Image[]
