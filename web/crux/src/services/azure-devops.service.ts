import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UniqueKeyValue } from 'src/domain/container'
import {
  AzureDevOpsCredentials,
  AzureDevOpsHook,
  AzureDevOpsListResponse,
  AzureDevOpsPipeline,
  AzureDevOpsProject,
  AzureDevOpsRun,
  AzureDevOpsVariable,
} from 'src/domain/pipeline'
import {
  CruxForbiddenException,
  CruxInternalServerErrorException,
  CruxNotFoundException,
} from 'src/exception/crux-exception'

type AzureDevOpsUrlOptions = {
  includeProject: boolean
}

@Injectable()
export default class AzureDevOpsService {
  private static API_VERSION = '7.1-preview.1'

  private static DEFAULT_URL_OPTIONS: AzureDevOpsUrlOptions = {
    includeProject: true,
  }

  private readonly logger = new Logger(AzureDevOpsService.name)

  constructor(private readonly config: ConfigService) {}

  async getPipeline(creds: AzureDevOpsCredentials, name: string): Promise<AzureDevOpsPipeline> {
    const res = await this.get(creds, '/pipelines')
    if (!res.ok) {
      const errorMessage = 'Failed to fetch pipelines'
      this.logger.error(errorMessage)

      throw new CruxInternalServerErrorException({
        message: errorMessage,
        property: 'name',
        value: name,
      })
    } else if (res.status === 203) {
      // azure's forbidden / not found
      throw new CruxForbiddenException({
        message: 'Invalid credentials',
        property: 'token',
      })
    }

    const pipelineList = (await res.json()) as AzureDevOpsListResponse<AzureDevOpsPipeline>
    const pipeline = pipelineList.value.find(it => it.name === name)
    if (!pipeline) {
      throw new CruxNotFoundException({
        message: 'Azure DevOps pipeline not found',
        property: 'trigger.name',
        value: name,
      })
    }

    return pipeline
  }

  async getProject(creds: AzureDevOpsCredentials): Promise<AzureDevOpsProject> {
    const res = await this.get(creds, '/projects', {
      includeProject: false,
    })

    const projectName = creds.repo.project

    if (!res.ok) {
      const errorMessage = 'Failed to fetch pipelines'
      this.logger.error(errorMessage)

      throw new CruxInternalServerErrorException({
        message: errorMessage,
        property: 'repository.organization',
        value: projectName,
      })
    }

    const projectList = (await res.json()) as AzureDevOpsListResponse<AzureDevOpsProject>
    const project = projectList.value.find(it => it.name === projectName)

    if (!project) {
      throw new CruxNotFoundException({
        message: 'Azure DevOps project not found',
        property: 'repository.project',
        value: projectName,
      })
    }

    return project
  }

  async trigger(creds: AzureDevOpsCredentials, name: string, inputs: UniqueKeyValue[]): Promise<AzureDevOpsRun> {
    const pipeline = await this.getPipeline(creds, name)

    const variables: Record<string, AzureDevOpsVariable> = inputs.reduce((result, it) => {
      const variable: AzureDevOpsVariable = {
        isSecret: false,
        value: it.value,
      }

      result[it.key] = variable
      return result
    }, {})

    const res = await this.post(creds, `/pipelines/${pipeline.id}/runs`, variables)
    if (!res.ok) {
      throw new CruxInternalServerErrorException({
        message: 'Failed to start pipeline',
        property: 'httpStatus',
        value: res.status,
      })
    }

    const run = (await res.json()) as AzureDevOpsRun
    return run
  }

  async createHook(
    creds: AzureDevOpsCredentials,
    pipelineId: string,
    pipelineName: string,
    jwt: string,
  ): Promise<AzureDevOpsHook> {
    const pipeline = await this.getPipeline(creds, pipelineName)
    const project = await this.getProject(creds)

    const req = {
      consumerActionId: 'httpRequest',
      consumerId: 'webHooks',
      consumerInputs: {
        url: `${this.config.getOrThrow('CRUX_UI_URL')}/api/dyo/pipelines/${pipelineId}/hooks/azure/pipeline-state`,
        httpHeaders: `Authorization: Bearer ${jwt}`,
        messagesToSend: 'none',
        detailedMessagesToSend: 'none',
      },
      eventType: 'ms.vss-pipelines.run-state-changed-event',
      publisherId: 'pipelines',
      publisherInputs: {
        pipelineId: pipeline.id,
        runStateId: '',
        runResultId: '',
        projectId: project.id,
      },
      resourceVersion: '5.1-preview.1',
      scope: 1,
    }

    const res = await this.post(creds, '/hooks/subscriptions', req, {
      includeProject: false,
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new CruxForbiddenException({
          message: 'Failed to create Azure DevOps hook',
          property: 'hook',
        })
      } else if (res.status === 404) {
        throw new CruxNotFoundException({
          message: 'Azure DevOps project not found',
        })
      }

      this.logger.error(`status: ${res.status}`)
      this.logger.error(await res.json())
      throw new CruxInternalServerErrorException({
        message: 'Failed to create Azure DevOps hook',
        property: 'hook',
      })
    }

    const hook = (await res.json()) as AzureDevOpsHook
    return hook
  }

  async deleteHook(creds: AzureDevOpsCredentials, hook: AzureDevOpsHook): Promise<void> {
    const res = await this.delete(creds, `/hooks/subscriptions/${hook.id}`, {
      includeProject: false,
    })

    if (!res.ok) {
      throw new CruxInternalServerErrorException({
        message: 'Failed to delete Azure DevOps hook',
        property: 'hookId',
        value: hook.id,
      })
    }
  }

  private async get(
    creds: AzureDevOpsCredentials,
    path: string,
    options: AzureDevOpsUrlOptions = AzureDevOpsService.DEFAULT_URL_OPTIONS,
  ): Promise<Response> {
    const url = this.assembleUrl(creds, path, options)

    const res = await fetch(url, {
      headers: this.assembleHeaders(creds),
    })

    return res
  }

  private async post(
    creds: AzureDevOpsCredentials,
    path: string,
    body: any,
    options: AzureDevOpsUrlOptions = AzureDevOpsService.DEFAULT_URL_OPTIONS,
  ): Promise<Response> {
    const url = this.assembleUrl(creds, path, options)

    const res = await fetch(url, {
      headers: this.assembleHeaders(creds),
      method: 'POST',
      body: JSON.stringify(body),
    })

    return res
  }

  private async delete(
    creds: AzureDevOpsCredentials,
    path: string,
    options: AzureDevOpsUrlOptions = AzureDevOpsService.DEFAULT_URL_OPTIONS,
  ): Promise<Response> {
    const url = this.assembleUrl(creds, path, options)

    const res = await fetch(url, {
      headers: this.assembleHeaders(creds),
      method: 'DELETE',
    })

    return res
  }

  private assembleUrl(
    creds: AzureDevOpsCredentials,
    path: string = '/',
    options: AzureDevOpsUrlOptions = AzureDevOpsService.DEFAULT_URL_OPTIONS,
  ): string {
    const apiVersionQuerySymbol = !path.includes('?') ? '?' : '&'
    const apiVersion = `${apiVersionQuerySymbol}api-version=${AzureDevOpsService.API_VERSION}`

    let baseUrl = `https://dev.azure.com/${creds.repo.organization}`
    if (options.includeProject) {
      baseUrl += `/${creds.repo.project}`
    }

    return `${baseUrl}/_apis${path}${apiVersion}`
  }

  private assembleHeaders(creds: AzureDevOpsCredentials): HeadersInit {
    const auth = Buffer.from(`:${creds.token}`).toString('base64')

    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    }
  }
}
