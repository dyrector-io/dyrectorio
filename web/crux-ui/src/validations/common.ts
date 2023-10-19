import { DYO_ICONS } from '@app/elements/dyo-icon-picker'
import yup from './yup'
import { Translate } from 'next-translate'
import { ValidationError } from 'yup'

export type ErrorWithPath = {
  path: string
  message: string
}

type ErrorMessage =
  | string
  | {
      regex: string
    }

export const yupErrorTranslate = (error: yup.ValidationError, t: Translate): yup.ValidationError => {
  const tMessage = (message: ErrorMessage, values: ValidationError) => {
    const { label, path } = values.params as any
    const params = {
      ...values.params,
      path: label ? t(label) : path,
    }

    const messageKey = typeof message === 'string' ? message : message?.regex

    return t(messageKey, params)
  }

  if (error.inner.length === 0) {
    return {
      ...error,
      message: tMessage(error.message, error),
      errors: error.errors.map(it => tMessage(it, error)),
    }
  }

  const errors = error.inner.map(it => {
    const message = tMessage(it.message, it)
    return {
      ...it,
      message,
      errors: [message],
    }
  })
  return {
    ...error,
    inner: errors,
    errors: errors.map(it => it.message),
    message: errors.length === 1 ? errors[0].message : `${errors.length} errors occurred`,
  }
}

export const getValidationError = (
  schema: yup.Schema,
  candidate: any,
  options?: yup.ValidateOptions,
  t?: Translate,
): yup.ValidationError => {
  try {
    schema.validateSync(candidate, options)
    return null
  } catch (err) {
    return t ? yupErrorTranslate(err, t) : err
  }
}

export const stringStringMapRule = yup.object().test(it => {
  if (!it) {
    return true
  }

  const entries = Object.entries(it)
  const strings = entries.filter(entry => {
    const [key, value] = entry
    return typeof key === 'string' && typeof value === 'string'
  })

  return entries.length === strings.length
})

export const iconRule = yup
  .string()
  .oneOf([null, ...DYO_ICONS])
  .nullable()
  .label('common:icon')

export const nameRule = yup.string().required().trim().min(3).max(70).label('common:name')
export const descriptionRule = yup.string().optional().label('common:description')
export const identityNameRule = yup.string().trim().max(16)
export const passwordLengthRule = yup.string().min(8).max(70).label('common:password')

const REGEX_ERROR_NO_WHITESPACES = { regex: 'errors:yup.string.notContainWhitespaces' }

export const matchNoWhitespace = (schema: yup.StringSchema<string, yup.AnyObject, undefined>) =>
  schema.matches(/^\S+$/g, { message: REGEX_ERROR_NO_WHITESPACES }) // all characters are non-whitespaces

export const matchNoTrailingWhitespace = (schema: yup.StringSchema<string, yup.AnyObject, undefined>) =>
  schema.matches(/^[^\s]+(\s+[^\s]+)*$/g, { message: REGEX_ERROR_NO_WHITESPACES }) // any characters but no trailing whitespaces
