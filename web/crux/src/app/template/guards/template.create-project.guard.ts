import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import TeamRepository from 'src/app/team/team.repository'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import { CreateProjectFromTemplateDto } from '../template.dto'

@Injectable()
export default class TemplateCreateProjectGuard implements CanActivate {
  constructor(private readonly teamRepository: TeamRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const dto = req.body as CreateProjectFromTemplateDto
    const identity = identityOfRequest(context)

    return await this.teamRepository.userIsInTeam(dto.teamSlug, identity.id)
  }
}
