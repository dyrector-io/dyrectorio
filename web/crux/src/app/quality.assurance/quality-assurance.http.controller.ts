import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { QualityAssuranceDto } from './quality-assurance.dto'
import QualityAssuranceService from './quality-assurance.service'

const ROUTE_QUALITY_ASSURANCE = 'quality-assurance'

@Controller(ROUTE_QUALITY_ASSURANCE)
@ApiTags(ROUTE_QUALITY_ASSURANCE)
export default class QualityAssuranceController {
  constructor(private readonly service: QualityAssuranceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Returns the quality assurance settings.',
  })
  @ApiOkResponse({
    type: QualityAssuranceDto,
    description: 'Quality assurance settings.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for fetching the qa settings' })
  async getQualityAssurance(): Promise<QualityAssuranceDto> {
    return this.service.getQualityAssurance()
  }
}
