import { NextApiRequest, NextApiResponse } from 'next'
import { INVITE_LINK_EXPIRATION } from '@app/const'
import { useAuthorizeAdminMiddleware as useAuthorizeAdminMiddleware } from '@server/auth-middleware'
import { useErrorMiddleware } from '@server/error-middleware'
import kratos, { disassambleKratosRecoveryUrl } from '@server/kratos'
import { useMiddlewares } from '@server/middlewares'
import { InviteUserDto, UserInvitiedDto } from '@server/models'
import { paginationParams } from '@app/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      await useMiddlewares(
        [useErrorMiddleware, useAuthorizeAdminMiddleware],
        req,
        res,
        async () => {
          const [skip, take] = paginationParams(req)

          const kratosRes = await kratos.adminListIdentities(
            take,
            Math.floor(skip / take),
          )
          res.status(200).json(kratosRes.data)
        },
      )
      break
    case 'POST':
      await useMiddlewares(
        [useErrorMiddleware, useAuthorizeAdminMiddleware],
        req,
        res,
        async () => {
          const dto = req.body as InviteUserDto

          const createRes = await kratos.adminCreateIdentity({
            schema_id: 'default',
            traits: {
              email: dto.email,
            },
          })

          const userId = createRes.data.id

          const recoveryRes = await kratos.adminCreateSelfServiceRecoveryLink({
            identity_id: userId,
            expires_in: INVITE_LINK_EXPIRATION,
          })

          const resDto: UserInvitiedDto = {
            identity: createRes.data,
            inviteUrl: disassambleKratosRecoveryUrl(
              recoveryRes.data.recovery_link,
            ),
          }

          res.status(201).json(resDto)
        },
      )
      break
    default:
      res.status(405).end()
      break
  }
}
