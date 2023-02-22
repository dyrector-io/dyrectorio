import { Injectable } from '@nestjs/common'
import AgentService from 'src/app/agent/agent.service'
import BodyPipeTransform from 'src/decorators/grpc.pipe'
import { checkDeploymentDeployability } from 'src/domain/deployment'
import { PreconditionFailedException } from 'src/exception/errors'
import { IdRequest, NodeConnectionStatus } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import { UniqueSecretKey, UniqueSecretKeyValue } from 'src/shared/models'
import { deploymentSchema, yupValidate } from 'src/shared/validation'

@Injectable()
export default class DeployStartValidationPipe extends BodyPipeTransform<IdRequest> {
  constructor(private prisma: PrismaService, private agentService: AgentService) {
    super()
  }

  async transformBody(value: IdRequest) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      include: {
        version: true,
        instances: {
          include: {
            config: true,
            image: {
              include: {
                config: true,
              },
            },
          },
        },
      },
      where: {
        id: value.id,
      },
    })

    if (!checkDeploymentDeployability(deployment.status, deployment.version.type)) {
      throw new PreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    yupValidate(deploymentSchema, deployment)

    const node = this.agentService.getById(deployment.nodeId)
    if (!node || node.getConnectionStatus() !== NodeConnectionStatus.CONNECTED) {
      throw new PreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    const secretsHaveValue = deployment.instances.every(it => {
      const imageSecrets = (it.image.config.secrets as UniqueSecretKey[]) ?? []
      const requiredSecrets = imageSecrets.filter(imageSecret => imageSecret.required).map(secret => secret.key)

      const instanceSecrets = (it.config?.secrets as UniqueSecretKeyValue[]) ?? []
      const hasSecrets = requiredSecrets.every(requiredSecret => {
        const instanceSecret = instanceSecrets.find(secret => secret.key === requiredSecret)
        if (!instanceSecret) {
          return false
        }

        return instanceSecret.encrypted && instanceSecret.value.length > 0
      })

      return hasSecrets
    })

    if (!secretsHaveValue) {
      throw new PreconditionFailedException({
        message: 'Required secrets must have values!',
        property: 'deploymentId',
        value: deployment.id,
      })
    }

    return value
  }
}
