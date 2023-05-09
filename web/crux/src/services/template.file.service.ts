import { Injectable, Logger } from '@nestjs/common'
import { createReadStream, readdir, readFileSync, ReadStream } from 'fs'
import { join, parse } from 'path'
import { cwd } from 'process'
import { CreateRegistryDto } from 'src/app/registry/registry.dto'
import { TemplateDto } from 'src/app/template/template.dto'
import { ContainerConfigData, UniqueKeyValue, UniqueSecretKey } from 'src/domain/container'
import { templateSchema } from 'src/domain/validation'
import { Port, Volume } from 'src/grpc/protobuf/proto/agent'
import { promisify } from 'util'
import * as yup from 'yup'

const TEMPLATES_FOLDER = join('assets', 'templates')

export interface TemplateDetail {
  name: string
  description: string
  technologies: string[]
  registries?: CreateRegistryDto[]
  images: TemplateImage[]
}

type TemplateVolume = Omit<Volume, 'type'> & {
  type: string
}

type TemplateConfig = {
  deploymentStatregy: string
  restartPolicy: string
  networkMode: string
  expose: string
  networks: string[]
  volumes: TemplateVolume[]
  ports: Port[]
  environment: UniqueKeyValue[]
  secrets: UniqueSecretKey[]
}

export type TemplateContainerConfig = Omit<ContainerConfigData, keyof TemplateConfig> & TemplateConfig

export interface TemplateImage {
  name: string
  registryName: string
  image: string
  tag: string
  capabilities: UniqueKeyValue[]
  config: TemplateContainerConfig
  environment: UniqueKeyValue[]
  secrets: UniqueSecretKey[]
}

@Injectable()
export default class TemplateFileService {
  private readonly logger = new Logger(TemplateFileService.name)

  private templatesFolder: string

  constructor() {
    this.templatesFolder = join(cwd(), TEMPLATES_FOLDER)
  }

  async getTemplates(): Promise<TemplateDto[]> {
    const files = await promisify<string, string[]>(readdir)(this.templatesFolder)

    return files
      .map(it => parse(it))
      .filter(it => it.ext.toLowerCase() === '.json')
      .map(it => {
        const template = this.readTemplate(it.name)
        return !template
          ? null
          : {
              id: it.name,
              ...template,
            }
      })
      .filter(it => it != null)
  }

  async getTemplateById(id: string): Promise<TemplateDetail> {
    const templateContent = readFileSync(this.getTemplatePath(id, 'json'), 'utf8')

    return JSON.parse(templateContent) as TemplateDetail
  }

  async getTemplateImageStreamById(id: string): Promise<ReadStream> {
    return createReadStream(this.getTemplatePath(id, 'jpg'))
  }

  getTemplatePath(id: string, extension: string): string {
    return `${join(this.templatesFolder, id)}.${extension}`
  }

  readTemplate(id: string): TemplateDto {
    const templateContent = readFileSync(this.getTemplatePath(id, 'json'), 'utf8')
    const template = JSON.parse(templateContent) as TemplateDto

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
