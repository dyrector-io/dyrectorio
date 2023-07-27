import { Injectable, PipeTransform } from '@nestjs/common'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeleteNodeValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(id: string) {
    const deploymentExists = await this.prisma.deployment.findFirst({
      where: {
        nodeId: id,
      },
    })

    if (deploymentExists) {
      throw new CruxPreconditionFailedException({
        property: 'id',
        value: id,
        message: 'Node is already in use.',
      })
    }

    return id
  }
}
