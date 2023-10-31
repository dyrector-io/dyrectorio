import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import PrismaService from 'src/services/prisma.service'
import { productionEnvironment } from 'src/shared/config'
import { QualityAssuranceDto } from './quality-assurance.dto'

@Injectable()
export default class QualityAssuranceService {
  private readonly logger = new Logger(QualityAssuranceService.name)

  private config: QualityAssuranceDto = {
    disabled: true,
  }

  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getQualityAssurance(): Promise<QualityAssuranceDto> {
    return this.config
  }

  async bootstrap() {
    const optOut = this.configService.get<boolean>('QA_OPT_OUT', false)

    if (optOut || !productionEnvironment(this.configService)) {
      return
    }

    const envGroupName = this.configService.get<string>('QA_GROUP_NAME', '').trim()
    const groupName = envGroupName !== '' ? envGroupName : null

    let config = await this.prisma.qualityAssuranceConfig.findFirst()
    if (!config) {
      config = await this.prisma.qualityAssuranceConfig.create({
        data: {
          name: groupName,
        },
      })
    } else if (config.name !== groupName) {
      config = await this.prisma.qualityAssuranceConfig.update({
        where: {
          id: config.id,
        },
        data: {
          name: groupName,
        },
      })
    }

    this.config = {
      disabled: false,
      group: {
        id: config.id,
        name: config.name,
      },
    }
  }

  logState() {
    const { disabled } = this.config
    this.logger.warn(`Quality Assurance is ${disabled ? 'disabled' : 'enabled'}.`)

    if (!disabled) {
      this.logger.warn('You can opt out by declaring the environment variable: QA_OPT_OUT=true')
    }
  }
}
