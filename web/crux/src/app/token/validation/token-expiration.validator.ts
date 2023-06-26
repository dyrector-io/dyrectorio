import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ name: 'token-expiration', async: false })
export default class IsTokenExpiration implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value === 'number') {
      return value > 0
    }

    if (typeof value !== 'string') {
      return false
    }

    return value === 'never'
  }

  defaultMessage(): string {
    return "$property must be a number in days (at least 1) or 'never'"
  }
}
