import * as yup from 'yup'
import { DYO_ICONS } from '../elements/dyo-icon-picker'

export const getValidationError = (schema: yup.AnySchema, candidate: any): yup.ValidationError => {
  try {
    schema.validateSync(candidate)
    return null
  } catch (err) {
    return err
  }
}

export const stringStringMapRule = yup.object().test(it => {
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

export const nameRule = yup.string().required().trim().min(3).max(70)
export const descriptionRule = yup.string().optional()
