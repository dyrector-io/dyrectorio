import { Product } from '@prisma/client'
import { DemoConstants } from '../../consts'

export enum ProductType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
}

export const buildProduct = (userId: string, teamId: string) => {
  return {
    id: DemoConstants.PRODUCT_ID,
    name: 'Google microservices demo',
    description:
      'Google uses this application to demonstrate use of technologies like Kubernetes/GKE, Istio, Stackdriver, gRPC and OpenCensus.',
    createdAt: new Date(),
    createdBy: userId,
    teamId: teamId,
    type: ProductType.COMPLEX,
  } as Product
}
