import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import VersionService from '../version.service'

@Injectable()
export default class VersionTeamAccessGuard implements CanActivate {
  constructor(private readonly service: VersionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const projectId = req.params.projectId as string
    const versionId = req.params.versionId as string

    return await this.service.checkProjectOrVersionIsInTeam(teamSlug, projectId, versionId)
  }
}
