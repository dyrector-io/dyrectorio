import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable } from 'rxjs'
import { CruxForbiddenException } from 'src/exception/crux-exception'

@Injectable()
export default class TeamCreatinDisabledInterceptor implements NestInterceptor {
  protected readonly teamCreationDisabled: boolean

  constructor(appConfig: ConfigService) {
    this.teamCreationDisabled = appConfig.get('DISABLE_TEAM_CREATION')
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (this.teamCreationDisabled) {
      throw new CruxForbiddenException({
        message: 'Team creation is disabled',
      })
    }

    return next.handle()
  }
}
