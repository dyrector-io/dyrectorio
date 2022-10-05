import { Injectable, Logger } from '@nestjs/common'
import { readdir, readFileSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { TemplateResponse } from 'src/grpc/protobuf/proto/crux'
import { templateSchema } from 'src/shared/validation'
import * as yup from 'yup'

const TEMPLATES_FOLDER = "templates"

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

        files.filter(it => it.split('.').pop().toLowerCase() == "json").forEach(it => {
          const templateContent = readFileSync(join(folder, it), 'utf8')
          const template = JSON.parse(templateContent) as TemplateResponse

          try {
            templateSchema.validateSync(template)

            validTemplates.push(template)
          } catch (error) {
            const validationError = error as yup.ValidationError
            this.logger.error(`Failed to validate '${it}' template file '${validationError.path}', errors: '${validationError.errors.join(', ')}'`)
          }
        })

        resolve(validTemplates)
      })
    })
  }
}
