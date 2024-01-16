import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'

export class RegistryTokenScriptGenerator {
  private compileCurl: HandlebarsTemplateDelegate

  constructor(private readonly configService: ConfigService) {
    const scriptFile = readFileSync(join(cwd(), 'assets', 'registry', 'v2-config.yaml.hbr'), 'utf8')
    this.compileCurl = Handlebars.compile(scriptFile)
  }

  getV2ConfigYaml(options: Omit<RegistryTokenOptions, 'cruxUiUrl'>): string {
    const context: RegistryTokenOptions = {
      ...options,
      cruxUiUrl: this.configService.get<string>('CRUX_UI_URL'),
    }

    return this.compileCurl(context)
  }
}

export type RegistryTokenOptions = {
  token: string
  cruxUiUrl: string
  teamSlug: string
  registryId: string
}

export type RegistryTokenPayload = {
  sub: string
  registryId: string
  nonce: string
}
