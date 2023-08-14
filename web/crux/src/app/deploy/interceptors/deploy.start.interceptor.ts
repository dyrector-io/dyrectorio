import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import AgentService from 'src/app/agent/agent.service'
import { UniqueKeyValue, UniqueSecretKey, UniqueSecretKeyValue } from 'src/domain/container'
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
        configBundles: {
          include: {
            configBundle: true,
          },
        },
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
        message: 'There are no instances to deploy',
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

      if (!ignoreProtected) {
        const otherProtected = await this.prisma.deployment.findFirst({
          where: {
            protected: true,
            nodeId: deployment.nodeId,
            prefix: deployment.prefix,
            versionId:
              deployment.version.type === 'incremental'
                ? {
                    not: deployment.versionId,
                  }
                : undefined,
          },
        })

        if (otherProtected != null) {
          throw new CruxPreconditionFailedException({
            message:
              deployment.version.type === 'incremental'
                ? "There's a protected deployment with the same node and prefix in a different version"
                : "There's a protected deployment with the same node and prefix",
            property: 'protectedDeploymentId',
            value: otherProtected.id,
          })
        }
      }
    }

    if (deployment.configBundles.length > 0) {
      const deploymentEnv = (deployment.environment as UniqueKeyValue[]) ?? []
      const deploymentEnvKeys = deploymentEnv.map(it => it.key)

      const seenKeys: Record<string, string> = {} // Environment key -> config bundle name

      deployment.configBundles.forEach(it => {
        const bundleEnv = (it.configBundle.data as UniqueKeyValue[]) ?? []

        bundleEnv.forEach(env => {
          if (deploymentEnvKeys.includes(env.key)) {
            return
          }
          if (seenKeys[env.key]) {
            throw new CruxPreconditionFailedException({
              message: `Environment variable ${env.key} in ${it.configBundle.name} is already defined by ${
                seenKeys[env.key]
              }. Please define the key in the deployment or resolve the conflict in the bundles.`,
              property: 'configBundleId',
              value: it.configBundle.id,
            })
          }

          seenKeys[env.key] = it.configBundle.name
        })
      })
    }

    return next.handle()
  }
}
