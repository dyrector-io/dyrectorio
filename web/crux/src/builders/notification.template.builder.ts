import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import Handlebars from 'handlebars'
import { CruxBadRequestException } from 'src/exception/crux-exception'

type TemplateEntry = {
  text?: string
  file?: string
}

type TemplateFile = { [key: string]: TemplateEntry }

export type TemplateType = 'email' | 'notificationTemplates'

export type ProcessedTemplate = { [key: string]: string }

@Injectable()
export default class NotificationTemplateBuilder {
  private processTemplateEntry<T>(entry: TemplateEntry, data: T): string {
    let templateText = entry.text
    if (entry.file) {
      templateText = readFileSync(join(cwd(), 'assets', 'email', entry.file), 'utf8')
    }

    if (!templateText) {
      throw new CruxBadRequestException({
        property: 'template',
        value: 'undefined',
        message: `Invalid template`,
      })
    }

    return Handlebars.compile(templateText)(data)
  }

  processTemplate<T>(type: TemplateType, name: string, parameters: T): ProcessedTemplate {
    const templateFilePath = readFileSync(join(cwd(), 'assets', type, `${name}.json`), 'utf8')
    const template = JSON.parse(templateFilePath) as TemplateFile

    const result: ProcessedTemplate = Object.entries(template).reduce(
      (prev, [key, value]) => ({ ...prev, [key]: this.processTemplateEntry(value, parameters) }),
      {},
    )

    return result
  }
}
