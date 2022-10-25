import { invalidArgument } from '@app/error-responses'
import { NextApiRequest, NextApiResponse } from 'next'
import { AnySchema, ValidationError } from 'yup'

const useValidationMiddleware =
  (schema: AnySchema) =>
  async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>): Promise<void> => {
    const { body } = req
    try {
      schema.validateSync(body)
    } catch (err) {
      const validationError = err as ValidationError
      throw invalidArgument(validationError.path)
    }

    await next()
  }

export default useValidationMiddleware
