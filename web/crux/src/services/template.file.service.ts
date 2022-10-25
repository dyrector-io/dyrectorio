import { Injectable, Logger } from '@nestjs/common'
import { readdir, readFileSync } from 'fs'
import { join, parse } from 'path'
import { cwd } from 'process'
import { CraneContainerConfig, DagentContainerConfig, ExplicitContainerConfig } from 'src/grpc/protobuf/proto/common'
import { CreateRegistryRequest, TemplateResponse } from 'src/grpc/protobuf/proto/crux'
import { UniqueKeyValue } from 'src/shared/model'
import { templateSchema } from 'src/shared/validation'
import { promisify } from 'util'
import * as yup from 'yup'

const TEMPLATES_FOLDER = 'templates'

export interface TemplateDetail {
  name: string
  description: string
  registries?: TemplateRegistry[]
  images: TemplateImage[]
}

export type TemplateRegistry = Omit<CreateRegistryRequest, 'accessedBy'>

export type TemplateCraneConfig = Omit<CraneContainerConfig, 'deploymentStatregy'> & {
  deploymentStatregy: string
}
export type TemplateDagentConfig = Omit<DagentContainerConfig, 'restartPolicy' | 'networkMode'> & {
  restartPolicy: string
  networkMode: string
}
export type TemplateContainerConfig = Omit<ExplicitContainerConfig, 'crane' | 'dagent'> & {
  crane?: TemplateCraneConfig
  dagent?: TemplateDagentConfig
}

export interface TemplateImage {
  name: string
  registryName: string
  image: string
  tag: string
  capabilities: UniqueKeyValue[]
  config: TemplateContainerConfig
  environment: UniqueKeyValue[]
}

@Injectable()
export default class TemplateFileService {
  private readonly logger = new Logger(TemplateFileService.name)

  private templatesFolder: string

  constructor() {
    this.templatesFolder = join(cwd(), TEMPLATES_FOLDER)
  }

  getTemplates(): Promise<TemplateResponse[]> {
    return promisify<string, string[]>(readdir)(this.templatesFolder).then(files =>
      files
        .map(it => parse(it))
        .filter(it => it.ext.toLowerCase() === '.json')
        .map(it => {
          const template = this.readTemplate(it.name)
          return template == null
            ? null
            : {
                id: it.name,
                ...template,
              }
        })
        .filter(it => it != null),
    )
  }

  async getTemplateById(id: string): Promise<TemplateDetail> {
    const templateContent = readFileSync(this.getTemplatePath(id), 'utf8')

    return JSON.parse(templateContent) as TemplateDetail
  }

  getTemplatePath(id: string): string {
    return `${join(this.templatesFolder, id)}.json`
  }

  readTemplate(id: string): TemplateDetail | null {
    const templateContent = readFileSync(this.getTemplatePath(id), 'utf8')
    const template = JSON.parse(templateContent) as TemplateDetail

    try {
      templateSchema.validateSync(template)

      return template
    } catch (error) {
      const validationError = error as yup.ValidationError
      this.logger.error(
        `Failed to validate '${id}' template file '${validationError.path}', errors: '${validationError.errors.join(
          ', ',
        )}'`,
      )
    }

    return null
  }
}
