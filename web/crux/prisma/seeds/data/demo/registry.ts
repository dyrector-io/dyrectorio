import { Registry } from '@prisma/client'
import { DemoConstants } from '../../consts'

export const registry = (userId: string, teamId: string) => {
  return {
    id: DemoConstants.REGISTRY_ID,
    name: 'Google microservices registry',
    description: 'Google microservices demo registry',
    createdAt: new Date(),
    createdBy: userId,
    icon: 'shark',
    url: 'google-samples/microservices-demo',
    teamId: teamId,
    type: 'google',
    token: null,
    user: null,
  } as Registry
}
