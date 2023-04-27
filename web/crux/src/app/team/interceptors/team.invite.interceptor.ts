import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import RecaptchaService from 'src/app/shared/recaptcha.service'
import {
  CruxBadRequestException,
  CruxConflictException,
  CruxInternalServerErrorException,
} from 'src/exception/crux-exception'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { InviteUserDto } from '../team.dto'

@Injectable()
export default class TeamInviteUserValitationInterceptor implements NestInterceptor {
  private readonly logger = new Logger()

  constructor(private prisma: PrismaService, private kratos: KratosService, private recaptcha: RecaptchaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const teamId = req.params.teamId as string
    const body = req.body as InviteUserDto

    const user = await this.kratos.getIdentityByEmail(body.email)
    if (!user) {
      return next.handle()
    }

    if (this.recaptcha.captchaEnabled()) {
      if (!body.captcha) {
        throw new CruxBadRequestException({ message: 'Missing captcha.' })
      }

      try {
        const captchaValid = await this.recaptcha.validateCaptcha(body.captcha)
        if (!captchaValid) {
          throw new CruxBadRequestException({ message: 'Invalid captcha.' })
        }
      } catch (err) {
        this.logger.error(err)
        throw new CruxInternalServerErrorException({ message: `Failed to validate captcha.` })
      }
    }

    const userOnTeam = await this.prisma.usersOnTeams.findFirst({
      where: {
        userId: user.id,
        teamId,
      },
    })

    if (userOnTeam) {
      throw new CruxConflictException({
        message: 'User is already in the team',
        property: 'email',
      })
    }

    return next.handle()
  }
}
