import { Registry } from '@prisma/client'
import { DemoConstants } from '../../consts'

export const buildRegistry = (userId: string, teamId: string) => {
  return [
    {
      id: DemoConstants.MICROSERVICES_REGISTRY_ID,
      name: 'Google microservices registry',
      description: 'Google microservices demo registry',
      createdAt: new Date(),
      createdBy: userId,
      icon: 'shark',
      url: 'gcr.io',
      imageNamePrefix: 'google-samples/microservices-demo',
      teamId: teamId,
      type: 'google',
      token: null,
      user: null,
    },
    {
      id: DemoConstants.DOCKER_HUB_REGISTRY_ID,
      name: 'Docker hub for google demo',
      description: 'Docker hub for google demo',
      createdAt: new Date(),
      createdBy: userId,
      icon: 'shark',
      url: 'hub.docker.com',
      teamId: teamId,
      type: 'hub',
      token: null,
      user: null,
      imageNamePrefix: 'library',
    },
  ] as Registry[]
}
