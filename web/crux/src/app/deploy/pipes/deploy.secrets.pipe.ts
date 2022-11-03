import { Injectable, PipeTransform, Logger } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import AgentService from 'src/app/agent/agent.service'
import { UniqueSecretKeyValue } from 'src/shared/model'

@Injectable()
export default class DeploySecretsValidationPipe implements PipeTransform {
  private readonly logger = new Logger(DeploySecretsValidationPipe.name)

  constructor(private prisma: PrismaService, private agentService: AgentService) {}

  async transform(value: IdRequest) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: value.id,
      },
      select: {
        nodeId: true,
      },
    })

    const publicKey = this.agentService.getById(deployment.nodeId)?.publicKey

    if (!publicKey) {
      return value
    }

    const deploymentConfig = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: value.id,
      },
      include: {
        instances: {
          include: {
            config: true,
          },
        },
      },
    })

    const tasks = deploymentConfig.instances
      .map(it => {
        if (!it.config) {
          return null
        }

        const secrets = it.config.secrets as UniqueSecretKeyValue[]

        if (secrets.every(secret => secret.publicKey === publicKey)) {
          return null
        }

        return this.prisma.instance.update({
          where: {
            id: it.id,
          },
          data: {
            config: {
              update: {
                secrets: secrets.map(secret => {
                  if (secret.publicKey === publicKey) {
                    return secret
                  }

                  this.logger.verbose(`Invalidated secret '${secret.id}'`)

                  return {
                    ...secret,
                    value: '',
                    encrypted: false,
                    publicKey,
                  }
                }),
              },
            },
          },
        })
      })
      .filter(it => it != null)

    if (tasks.length > 0) {
      await this.prisma.$transaction(tasks)
    }

    return value
  }
}
