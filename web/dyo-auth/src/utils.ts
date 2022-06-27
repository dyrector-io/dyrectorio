import {
  Identity,
  Session,
  UiContainer,
  UiNodeInputAttributes,
  UiText,
  V0alpha2Api,
} from '@ory/kratos-client'
import { AxiosResponse } from 'axios'
import { OutgoingMessage } from 'http'
import { NextApiRequest, NextPageContext } from 'next'
import { HEADER_SET_COOKIE } from './const'
import { DyoErrorDto, DyoFetchError } from './server/models'

export const isDyoError = (instance: any) =>
  'error' in instance && 'description' in instance

export const obtainSessionWithCookie = async (
  context: NextPageContext,
  kratos: V0alpha2Api,
): Promise<[Session, string | undefined]> => {
  try {
    const cookie = context.req?.headers?.cookie
    if (!cookie) {
      return [null, null]
    }

    const res = await kratos.toSession(undefined, cookie)
    return res.data ? [res.data, cookie] : null
  } catch {
    return [null, null]
  }
}

export const obtainSession = async (
  context: NextPageContext,
  kratos: V0alpha2Api,
): Promise<Session> => {
  const [session, _] = await obtainSessionWithCookie(context, kratos)
  return session
}

export const forwardCookie = (
  context: NextPageContext,
  resOrCookie: AxiosResponse | string | undefined,
) => forwardCookieToResponse(context.res, resOrCookie)

export const forwardCookieToResponse = (
  res: OutgoingMessage,
  resOrCookie: AxiosResponse | string | undefined,
) => {
  const cookie =
    typeof resOrCookie === 'string' || undefined
      ? resOrCookie
      : resOrCookie.headers[HEADER_SET_COOKIE]
  if (cookie) {
    res.setHeader(HEADER_SET_COOKIE, cookie)
  } else {
    res.removeHeader(HEADER_SET_COOKIE)
  }
}

export const redirectTo = (destination: string, permanent = false) => {
  return {
    redirect: {
      destination,
      permanent,
    },
  }
}

export const findAttributes = (
  ui: UiContainer,
  name: string,
): UiNodeInputAttributes => {
  const node = ui.nodes.find(
    it => (it.attributes as UiNodeInputAttributes).name === name,
  )
  return node.attributes as UiNodeInputAttributes
}

export const findMessage = (ui: UiContainer, name: string): UiText => {
  const node = ui.nodes.find(
    it => (it.attributes as UiNodeInputAttributes).name === name,
  )
  if (!node) {
    return null
  }

  const errors = node.messages.filter(it => it.type === 'error')
  const infos = node.messages.filter(it => it.type === 'info')

  return errors.length > 0 ? errors[0] : infos.length > 0 ? infos[0] : null
}

export const findError = (
  errors: DyoErrorDto[],
  name: string,
  converter?: (error: DyoErrorDto) => string,
): string => {
  const error = errors.find(it => it.value === name)
  if (error && converter) {
    return converter(error)
  }

  return error?.error
}

export const upsertError = (
  errors: DyoErrorDto[],
  name: string,
  error: string,
  description?: string,
): DyoErrorDto[] => {
  return upsertDyoError(errors, {
    description: description ?? 'Ui error.',
    error,
    value: name,
  })
}

export const upsertDyoError = (
  errors: DyoErrorDto[],
  error: DyoErrorDto,
): DyoErrorDto[] => {
  const index = errors.findIndex(it => it.value === error.value)
  if (index > -1) {
    const result = [...errors]
    result[index] = error
    return result
  }

  return [...errors, error]
}

export const removeError = (
  errors: DyoErrorDto[],
  name: string,
): DyoErrorDto[] => {
  return errors.filter(it => it.value !== name)
}

export const configuredFetcher = (init?: RequestInit) => {
  if (init && init.method in ['POST', 'PUT'] && !init.headers['Content-Type']) {
    init.headers['Content-Type'] = 'application/json'
  }

  return async url => {
    const res = await fetch(url, init)

    if (!res.ok) {
      const dto = ((await res.json()) as DyoErrorDto) ?? {
        error: 'UNKNOWN',
        description: 'Unknown error',
      }
      const error: DyoFetchError = {
        ...dto,
        status: res.status,
      }

      throw error
    }

    return await res.json()
  }
}

export const fetcher = configuredFetcher()

export const paginationParams = (
  req: NextApiRequest,
  defaultTake: number = 100,
): [number, number] => {
  const skip = (req.query['skip'] ?? 0) as number
  const take = (req.query['take'] ?? defaultTake) as number
  return [skip, take]
}

export const usernameToString = (user: Identity) => {
  const first = user.traits.name?.first ?? ''
  const last = user.traits.name?.last ?? ''
  return first + ' ' + last
}

export const userVerified = (user: Identity) => {
  const email = user.traits.email as string
  const verifiable = user.verifiable_addresses ?? []
  return verifiable.find(it => it.value === email)?.verified
}
