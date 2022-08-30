import { InvalidArgumentException } from 'src/exception/errors'
import * as yup from 'yup'

export const yupValidate = (schema: yup.AnySchema, candidate: any) => {
  try {
    schema.validateSync(candidate)
  } catch (error) {
    const validationError = error as yup.ValidationError
    throw new InvalidArgumentException({
      message: 'Validation failed',
      property: validationError.path,
      value: validationError.errors,
    })
  }
}
