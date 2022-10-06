import { Injectable, Logger } from '@nestjs/common'
import { readdir, readFileSync } from 'fs'
import { join, parse } from 'path'
import { cwd } from 'process'
import {
  CreateRegistryRequest,
  GithubRegistryDetails,
  GitlabRegistryDetails,
  GoogleRegistryDetails,
  HubRegistryDetails,
  TemplateResponse,
  V2RegistryDetails,
} from 'src/grpc/protobuf/proto/crux'
import { UniqueKeyValue } from 'src/shared/model'
import { templateSchema } from 'src/shared/validation'
import * as yup from 'yup'

const TEMPLATES_FOLDER = 'templates'

export interface TemplateDetail {
  name: string
  description: string
  registries?: TemplateRegistry[]
  product: TemplateProduct
}

export type TemplateRegistry = Omit<CreateRegistryRequest, 'accessedBy'>

export interface TemplateProduct {
  description: string
  type: string
  versions: TemplateVersion[]
}

export interface TemplateVersion {
  name?: string
  type?: string
  images: TemplateImage[]
}

export interface TemplateImage {
  name: string
  registryName: string
  image: string
  tag: string
  capabilities: UniqueKeyValue[]
  config: any
  environment: UniqueKeyValue[]
  secrets: UniqueKeyValue[]
}

@Injectable()
export default class TemplateFileService {
  private readonly logger = new Logger(TemplateFileService.name)

  constructor() {}

  getTemplates(): Promise<TemplateResponse[]> {
    const folder = join(cwd(), TEMPLATES_FOLDER)

    return new Promise((resolve, reject) => {
      readdir(folder, (err, files) => {
        if (err != null) {
          reject(err)
        }

        const validTemplates: TemplateResponse[] = []

        files
          .filter(it => parse(it).ext.toLowerCase() == '.json')
          .forEach(it => {
            const templateContent = readFileSync(join(folder, it), 'utf8')
            const template = JSON.parse(templateContent) as TemplateResponse

            try {
              templateSchema.validateSync(template)

              validTemplates.push({
                id: parse(it).name,
                ...template,
              })
            } catch (error) {
              const validationError = error as yup.ValidationError
              this.logger.error(
                `Failed to validate '${it}' template file '${
                  validationError.path
                }', errors: '${validationError.errors.join(', ')}'`,
              )
            }
          })

        resolve(validTemplates)
      })
    })
  }

  async getTemplateById(id: string): Promise<TemplateDetail> {
    const folder = join(cwd(), TEMPLATES_FOLDER)
    const templateContent = readFileSync(join(folder, id) + '.json', 'utf8')

    return JSON.parse(templateContent) as TemplateDetail
  }

  getTemplatePath(id: string): string {
    const folder = join(cwd(), TEMPLATES_FOLDER)

    return join(folder, id) + '.json'
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
        `Failed to validate '${it}' template file '${validationError.path}', errors: '${validationError.errors.join(
          ', ',
        )}'`,
      )
    }

    return null
  }
}
