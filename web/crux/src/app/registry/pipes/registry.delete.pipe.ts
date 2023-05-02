import { Injectable, PipeTransform } from '@nestjs/common'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeleteRegistryValidationPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(id: string) {
    const used = await this.prisma.image.count({
      where: {
        registryId: id,
      },
      take: 1,
    })

    if (used > 0) {
      throw new CruxPreconditionFailedException({
        property: 'id',
        value: id,
        message: 'Registry is already in use.',
      })
    }

    return id
  }
}
