import { CreateStorage } from '@app/models'
import { storageSchema } from '@app/validations/storage'
import crux from '@server/crux/crux'
import { withMiddlewares } from '@server/middlewares'
import useValidationMiddleware from '@server/validation-middleware'
import { NextApiRequest, NextApiResponse } from 'next'

const onGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const storages = await crux(req).storage.getAll()

  res.status(200).json(storages)
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateStorage

  const storage = await crux(req).storage.create(dto)

  res.status(201).json(storage)
}

export default withMiddlewares({
  onGet,
  onPost: {
    middlewares: [useValidationMiddleware(storageSchema)],
    endpoint: onPost,
  },
})
