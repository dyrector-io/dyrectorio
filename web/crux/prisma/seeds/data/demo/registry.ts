import { Registry } from '@prisma/client'
import { DemoConstants } from '../../consts'

export const buildRegistry = (userId: string, teamId: string) => {
  return [
    {
      id: DemoConstants.MICROSERVICES_REGISTRY_ID,
      name: 'Google Microservices Demo Registry',
      description: `Google uses this application to demonstrate use of technologies like Kubernetes/GKE, Istio, Stackdriver, gRPC and OpenCensus. This application works on any Kubernetes cluster, as well as Google Kubernetes Engine. It’s easy to deploy with little to no configuration.`,
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
      name: 'Docker Hub',
      description: `Docker Hub is the world's easiest way to create, manage, and deliver your team's container applications.`,
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
