import { HEADER_LOCATION } from '@app/const'
import { toKratosLocationChangeRequiredError } from '@app/models'
import { UpdateSettingsFlowWithOidcMethod } from '@ory/kratos-client'
import { cookieOf, forwardCookieToResponse } from '@server/cookie'
import kratos from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookie = cookieOf(req)

  const dto = req.body as any

  const body: UpdateSettingsFlowWithOidcMethod = {
    method: 'profile',
    flow: dto.flow,
    link: dto.provider,
  }

  try {
    const kratosRes = await kratos.updateSettingsFlow({
      flow: dto.flow,
      cookie,
      updateSettingsFlowBody: body,
    })

    forwardCookieToResponse(res, kratosRes)
    res.status(kratosRes.status).json(kratosRes.data)
  } catch (err) {
    const error = toKratosLocationChangeRequiredError(err)

    if (!error) {
      throw err
    }

    forwardCookieToResponse(res, error)
    res.status(201).setHeader(HEADER_LOCATION, error.data.redirect_browser_to).end()
  }
}

const onDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookie = cookieOf(req)

  const dto = req.body as any

  const body: UpdateSettingsFlowWithOidcMethod = {
    method: 'profile',
    flow: dto.flow,
    unlink: dto.provider,
  }

  const kratosRes = await kratos.updateSettingsFlow({
    flow: dto.flow,
    cookie,
    updateSettingsFlowBody: body,
  })

  res.status(kratosRes.status).json(kratosRes.data)
}

export default withMiddlewares(
  {
    onPost,
    onDelete,
  },
  [useKratosErrorMiddleware],
)
