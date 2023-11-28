import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AzureDevOpsCredentials } from 'src/domain/pipeline'
import AzureDevOpsService from 'src/services/azure-devops.service'
import PrismaService from 'src/services/prisma.service'
import { CreatePipelineDto, UpdatePipelineDto } from '../pipeline.dto'
import PipelineMapper from '../pipeline.mapper'

@Injectable()
export default class PipelineAccessValidationGuard implements CanActivate {
  constructor(
    private readonly mapper: PipelineMapper,
    private readonly azureService: AzureDevOpsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Guard that the pipeline exists and the pat is valid
   *
   * @param context
   * @returns boolean
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const pipelineId = request.params.pipelineId as string

    const body = request.body as CreatePipelineDto | UpdatePipelineDto

    let { token } = body
    if (pipelineId) {
      // update

      const pipeline = await this.prisma.pipeline.findUnique({
        where: {
          id: pipelineId,
        },
        select: {
          token: true,
        },
      })

      token = pipeline.token
    }

    const creds: AzureDevOpsCredentials = {
      repo: this.mapper.azureRepositoryToDb(body.repository, null),
      token,
    }

    const azPipeline = await this.azureService.getPipeline(creds, body.trigger.name)
    return !!azPipeline
  }
}
