import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import UuidParams from 'src/decorators/api-params.decorator'
import VersionTeamAccessGuard from './guards/version.team-access.guard'
import { VersionChainDto } from './version.dto'
import VersionService from './version.service'

const PARAM_TEAM_SLUG = 'teamSlug'
const PARAM_PROJECT_ID = 'projectId'
const ProjectId = () => Param(PARAM_PROJECT_ID)
const TeamSlug = () => Param(PARAM_TEAM_SLUG)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_PROJECTS = 'projects'
const ROUTE_PROJECT_ID = ':projectId'
const ROUTE_VERSION_CHAINS = 'version-chains'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_PROJECTS}/${ROUTE_PROJECT_ID}/${ROUTE_VERSION_CHAINS}`)
@ApiTags(ROUTE_VERSION_CHAINS)
@UseGuards(VersionTeamAccessGuard)
export default class VersionChainHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Returns an array containing the every incremental version chain that belong to a project. `teamSlug` and `projectId` must be included in URL. The response includes the `earliest` and `latest` versions and the `chainId` which is equal to earliest version's id in the chain.",
    summary: 'Fetch the list of all version chains under a project.',
  })
  @ApiOkResponse({
    type: VersionChainDto,
    isArray: true,
    description: 'Returns an array with every version chain of a project.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for project version chains.' })
  @UuidParams(PARAM_PROJECT_ID)
  async getVersions(@TeamSlug() _: string, @ProjectId() projectId: string): Promise<VersionChainDto[]> {
    return await this.service.getVersionChainsByProject(projectId)
  }
}
