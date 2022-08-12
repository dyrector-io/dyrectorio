import { DeploymentEvent } from '@prisma/client'
import { constants } from '../consts'

export const deploymentEvents = [
  {
    createdAt: new Date(),
    type: 'log',
    deploymentId: constants.DEPLYOMENT_ID,
    value: '',
  },
  {
    createdAt: new Date(),
    type: 'deploymentStatus',
    deploymentId: constants.DEPLYOMENT_ID,
    value: '',
  },
] as DeploymentEvent[]
