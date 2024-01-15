import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AzureDevOpsCredentials } from 'src/domain/pipeline'
import AzureDevOpsService from 'src/services/azure-devops.service'
import EncryptionService from 'src/services/encryption.service'
import PrismaService from 'src/services/prisma.service'
import { CreatePipelineDto, UpdatePipelineDto } from '../pipeline.dto'
import PipelineMapper from '../pipeline.mapper'

@Injectable()
export default class PipelineAccessValidationGuard implements CanActivate {
  constructor(
    private readonly mapper: PipelineMapper,
    private readonly azureService: AzureDevOpsService,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Guard that ensures wether the pipeline exists and the PAT is valid
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

      if (!token) {
        token = this.encryptionService.decrypt(pipeline.token)
      }
    }

    const creds: AzureDevOpsCredentials = {
      repo: this.mapper.azureRepositoryToDb(body.repository, null),
      token,
    }

    const azurePipeline = await this.azureService.getPipeline(creds, body.trigger.name)
    return !!azurePipeline
  }
}
