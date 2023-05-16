import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export default class RecaptchaService {
  constructor(private configService: ConfigService) {}

  public captchaEnabled(): boolean {
    return this.configService.get('DISABLE_RECAPTCHA') !== 'true'
  }

  public async validateCaptcha(captcha: string): Promise<boolean> {
    if (!this.captchaEnabled()) {
      return true
    }

    const secretKey = this.configService.get('RECAPTCHA_SECRET_KEY')
    const res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
      method: 'POST',
    })

    const dto = await res.json()
    return dto.success
  }
}
