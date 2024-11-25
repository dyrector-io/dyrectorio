import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import AgentService from 'src/app/agent/agent.service'
import { ImageValidation } from 'src/app/image/image.dto'
import { ConcreteContainerConfigData, ContainerConfigData, ContainerConfigDataWithId } from 'src/domain/container'
import { getConflictsForConcreteConfig } from 'src/domain/container-conflict'
import { mergeConfigsWithConcreteConfig } from 'src/domain/container-merge'
import { checkDeploymentDeployability } from 'src/domain/deployment'
import { parseDyrectorioEnvRules } from 'src/domain/image'
import { missingSecretsOf } from 'src/domain/start-deployment'
import { createStartDeploymentSchema, nullifyUndefinedProperties, yupValidate } from 'src/domain/validation'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { StartDeploymentDto } from '../deploy.dto'

@Injectable()
export default class DeployStartValidationInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string

    const dto = req.body as StartDeploymentDto

    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      include: {
        version: true,
        config: true,
        configBundles: {
          include: {
            configBundle: {
              include: {
                config: true,
              },
            },
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
          where: !dto.instances
            ? undefined
            : {
                id: {
                  in: dto.instances,
                },
              },
        },
      },
      where: {
        id: deploymentId,
      },
    })

    // deployment
    if (!checkDeploymentDeployability(deployment.status, deployment.version.type)) {
      throw new CruxPreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    // instances
    if (deployment.instances.length < 1) {
      throw new CruxPreconditionFailedException({
        message: 'There are no instances to deploy',
        property: 'instances',
      })
    }

    const instances = deployment.instances.map(it => ({
      ...it,
      config: mergeConfigsWithConcreteConfig(
        [it.image.config as any as ContainerConfigData],
        it.config as any as ConcreteContainerConfigData,
      ),
    }))

    const target = {
      ...deployment,
      instances,
    }

    const instanceValidations = instances.reduce((prev, it) => {
      const rules = parseDyrectorioEnvRules(it.image.labels as Record<string, string>)
      const validation: ImageValidation = {
        environmentRules: rules,
      }

      prev[it.id] = validation
      return prev
    }, {})

    nullifyUndefinedProperties(target.config)
    target.configBundles.forEach(it => nullifyUndefinedProperties(it.configBundle.config))
    target.instances.forEach(instance => {
      nullifyUndefinedProperties(instance.config)
      nullifyUndefinedProperties(instance.image.config)
    })
    yupValidate(createStartDeploymentSchema(instanceValidations), target)

    const missingSecrets = deployment.instances
      .map(it => {
        const imageConfig = it.image.config as any as ContainerConfigData
        const instanceConfig = it.config as any as ConcreteContainerConfigData
        const mergedConfig = mergeConfigsWithConcreteConfig([imageConfig], instanceConfig)

        return missingSecretsOf(it.configId, mergedConfig)
      })
      .filter(it => !!it)

    if (missingSecrets.length > 0) {
      throw new CruxPreconditionFailedException({
        message: 'Required secrets must have values!',
        property: 'instanceSecrets',
        value: missingSecrets,
      })
    }

    // config bundles
    if (deployment.configBundles.length > 0) {
      const configs = deployment.configBundles.map(it => it.configBundle.config as any as ContainerConfigDataWithId)
      const concreteConfig = deployment.config as any as ConcreteContainerConfigData
      const conflicts = getConflictsForConcreteConfig(configs, concreteConfig)
      if (conflicts) {
        throw new CruxPreconditionFailedException({
          message: 'Unresolved conflicts between config bundles',
          property: 'configBundles',
          value: Object.keys(conflicts).join(', '),
        })
      }

      const mergedConfig = mergeConfigsWithConcreteConfig(configs, concreteConfig)
      const missingInstanceSecrets = missingSecretsOf(deployment.configId, mergedConfig)
      if (missingInstanceSecrets) {
        throw new CruxPreconditionFailedException({
          message: 'Required secrets must have values!',
          property: 'deploymentSecrets',
          value: missingInstanceSecrets,
        })
      }
    }

    // node
    const node = this.agentService.getById(deployment.nodeId)
    if (!node) {
      throw new CruxPreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    if (!node.ready) {
      throw new CruxPreconditionFailedException({
        message: 'Node is busy',
        property: 'nodeId',
        value: deployment.nodeId,
      })
    }

    // deployment protection
    if (deployment.protected) {
      // this is a protected deployment no need to check for protected prefixes

      return next.handle()
    }

    const {
      query: { ignoreProtected },
    } = req

    if (ignoreProtected) {
      // force deploy

      return next.handle()
    }

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

    if (otherProtected) {
      throw new CruxPreconditionFailedException({
        message:
          deployment.version.type === 'incremental'
            ? "There's a protected deployment with the same node and prefix in a different version"
            : "There's a protected deployment with the same node and prefix",
        property: 'protectedDeploymentId',
        value: otherProtected.id,
      })
    }

    return next.handle()
  }
}
