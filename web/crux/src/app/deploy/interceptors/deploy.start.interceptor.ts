import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import AgentService from 'src/app/agent/agent.service'
import { UniqueSecretKey, UniqueSecretKeyValue } from 'src/domain/container'
import { checkDeploymentDeployability } from 'src/domain/deployment'
import { deploymentSchema, yupValidate } from 'src/domain/validation'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployStartValidationInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string

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
        id: deploymentId,
      },
    })

    if (deployment.instances.length < 1) {
      throw new CruxPreconditionFailedException({
        message: 'There is no instances to deploy',
        property: 'instances',
      })
    }

    if (!checkDeploymentDeployability(deployment.status, deployment.version.type)) {
      throw new CruxPreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    yupValidate(deploymentSchema, deployment)

    const node = this.agentService.getById(deployment.nodeId)
    if (!node?.connected) {
      throw new CruxPreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    const missingSecrets = deployment.instances.filter(it => {
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

      return !hasSecrets
    })

    if (missingSecrets.length > 0) {
      throw new CruxPreconditionFailedException({
        message: 'Required secrets must have values!',
        property: 'instanceIds',
        value: missingSecrets.map(it => ({
          id: it.id,
          name: it.config?.name ?? it.image.name,
        })),
      })
    }

    if (!deployment.protected) {
      const {
        query: { ignoreProtected },
      } = req

      if (!ignoreProtected || ignoreProtected === false) {
        const otherProtected = await this.prisma.deployment.findFirst({
          where: {
            protected: true,
            versionId: deployment.versionId,
            nodeId: deployment.nodeId,
            prefix: deployment.prefix,
          },
        })

        if (otherProtected != null) {
          throw new CruxPreconditionFailedException({
            message: "There's a protected deployment in the version with the same node and prefix",
            property: 'protectedDeploymentId',
            value: otherProtected.id,
          })
        }
      }
    }

    return next.handle()
  }
}
