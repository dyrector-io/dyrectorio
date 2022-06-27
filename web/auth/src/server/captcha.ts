import { internalError } from './error-middleware'

export const validateCaptcha = async (captcha: string): Promise<boolean> => {
  try {
    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        method: 'POST',
      },
    )

    const dto = await res.json()

    return dto.success
  } catch (error) {
    throw internalError(`Failed to validate captcha: ${error}`)
  }
}
