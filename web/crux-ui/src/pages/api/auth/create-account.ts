import { HEADER_LOCATION } from '@app/const'
import { missingParameter } from '@app/error-responses'
import { CreateAccount, UpdateRecoveryWithCode, toKratosLocationChangeRequiredError } from '@app/models'
import { userInvitationApiUrl } from '@app/routes'
import { cookieOf, forwardCookieToResponse } from '@server/cookie'
import { fetchCrux } from '@server/crux-api'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { flowOfUrl, identityRecovered, obtainSessionFromResponse } from '@server/kratos'
import useKratosErrorMiddleware from '@server/kratos-error-middleware'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'

const acceptInvitation = async (cookie: string, teamId: string): Promise<void> => {
  try {
    await fetchCrux(cookie, userInvitationApiUrl(teamId), {
      method: 'POST',
    })
  } catch (err) {
    console.error('[ERROR][TEAM]: Failed to accept invitation', err)
  }
}

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const dto = req.body as CreateAccount
  if (!dto.team) {
    throw missingParameter('team')
  }

  let cookie = cookieOf(req)

  const body: UpdateRecoveryWithCode = {
    method: 'code',
    code: dto.code,
  }

  try {
    const kratosRes = await kratos.updateRecoveryFlow({
      flow: dto.flow,
      cookie,
      updateRecoveryFlowBody: body,
    })

    forwardCookieToResponse(res, kratosRes)
    res.status(kratosRes.status).json(kratosRes.data)
  } catch (err) {
    const error = toKratosLocationChangeRequiredError(err)

    if (!error) {
      throw err
    }

    forwardCookieToResponse(res, error)
    const settingsFlow = flowOfUrl(error.data.redirect_browser_to)

    const cookieHeader = error.headers['set-cookie'] as string | string[]
    if (typeof cookieHeader === 'string') {
      cookie = cookieHeader
    } else {
      cookie = (cookieHeader as string[]).find(it => it.startsWith('ory_kratos_session'))
    }

    const session = await obtainSessionFromResponse(error)
    await identityRecovered(session, settingsFlow)

    await acceptInvitation(cookie, dto.team)

    res.status(201).setHeader(HEADER_LOCATION, error.data.redirect_browser_to).end()
  }
}

export default withMiddlewares(
  {
    onPost,
  },
  [useErrorMiddleware, useKratosErrorMiddleware],
  false,
)
