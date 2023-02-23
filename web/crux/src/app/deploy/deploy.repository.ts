import { Injectable, NotFoundException } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployRepository {
  constructor(private prisma: PrismaService) {}

  async findDeploymentEventsById(deploymentId: string): Promise<any> {
    try {
      const deploymentEvents = await this.prisma.deploymentEvent.findMany({
        where: {
          deploymentId,
        },
      })

      if (deploymentEvents.length === 0) {
        throw new NotFoundException({
          property: 'deploymentId',
          value: deploymentId,
          message: 'Deployment events not found with the given ID.',
        })
      }

      return deploymentEvents
    } catch (error) {
      throw new Error('Failed to query the deployment events from the database.')
    }
  }
}
