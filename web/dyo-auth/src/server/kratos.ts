import { Configuration, V0alpha2Api } from '@ory/kratos-client'

const kratos = new V0alpha2Api(
  new Configuration({ basePath: process.env.KRATOS_URL }),
)

export const assambleKratosRecoveryUrl = (
  flow: string,
  token: string,
): string =>
  `${process.env.KRATOS_URL}/self-service/recovery?flow=${flow}&token=${token}`

export const disassambleKratosRecoveryUrl = (recoveryLink: string): string => {
  const url = new URL(recoveryLink)
  const flow = url.searchParams.get('flow')
  const token = url.searchParams.get('token')
  return `${process.env.AUTH_URL}/invite?flow=${flow}&token=${token}`
}

export default kratos
