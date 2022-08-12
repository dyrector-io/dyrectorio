import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { mapNotFoundError } from 'src/exception/errors'

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query'> implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const notFoundMappings = PrismaService.generateNotFoundErrorMappings()

    super({
      rejectOnNotFound: {
        findFirst: notFoundMappings,
        findUnique: notFoundMappings,
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    })

    this.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.debug(`${event.query}`)
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }

  static generateNotFoundErrorMappings(): Prisma.RejectPerModel {
    const rejects: Prisma.RejectPerModel = {}
    Object.entries(this.NOT_FOUND_ERRORS).forEach(entry => {
      const [key, value] = entry

      rejects[key] = mapNotFoundError(value)
    })

    return rejects
  }

  static readonly NOT_FOUND_ERRORS: NotFoundErrorMappings = {
    Registry: 'registry',
    Node: 'node',
    Product: 'product',
    Version: 'version',
    Image: 'image',
    ContainerConfig: 'containerConfig',
    Deployment: 'deployment',
    DeploymentEvent: 'deploymentEvent',
    Instance: 'instance',
    InstanceContainerConfig: 'instanceConfig',
    UserInvitation: 'invitation',
    VersionsOnParentVersion: 'versionRelation',
    UsersOnTeams: 'team',
    Team: 'team',
  }
}

type NotFoundErrorMappings = { [P in Prisma.ModelName]?: string }
