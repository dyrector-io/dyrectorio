import { NextApiRequest, NextApiResponse } from 'next'
import { AnySchema, ValidationError } from 'yup'
import { invalidArgument } from './error-middleware'

export const useValidationMiddleware =
  (schema: AnySchema) =>
  async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>): Promise<void> => {
    const body = req.body
    try {
      schema.validateSync(body)
    } catch (error) {
      const validationError = error as ValidationError
      throw invalidArgument(validationError.path)
    }

    await next()
  }
