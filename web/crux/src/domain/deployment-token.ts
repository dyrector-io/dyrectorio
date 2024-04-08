import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { join } from 'path'
import { cwd } from 'process'

export class DeploymentTokenScriptGenerator {
  private compileCurl: HandlebarsTemplateDelegate

  constructor(private readonly configService: ConfigService) {
    const scriptFile = readFileSync(join(cwd(), 'assets', 'cicd', 'deployment-token.curl.hbr'), 'utf8')
    this.compileCurl = Handlebars.compile(scriptFile)
  }

  getCurlCommand(options: Omit<DeploymentTokenOptions, 'cruxUiUrl'>): string {
    const context: DeploymentTokenOptions = {
      ...options,
      cruxUiUrl: this.configService.get<string>('CRUX_UI_URL'),
    }

    return this.compileCurl(context)
  }
}

export type DeploymentTokenOptions = {
  token: string
  cruxUiUrl: string
  teamSlug: string
  deploymentId: string
}
