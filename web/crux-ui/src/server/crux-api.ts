import { fromApiError } from '@app/error-responses'
import http from 'http'
import { NextPageContext } from 'next'

export const fetchCrux = async (
  requestOrCookie: http.IncomingMessage | string | null,
  url: string,
  init?: RequestInit,
) => {
  const cruxUrl = process.env.CRUX_URL ?? process.env.CRUX_UI_URL

  const cookie: string = requestOrCookie
    ? typeof requestOrCookie === 'string'
      ? requestOrCookie
      : requestOrCookie.headers.cookie
    : null

  const res = await fetch(`${cruxUrl}${url}`, {
    ...(init ?? {}),
    headers: {
      ...(init?.headers ?? {}),
      cookie,
    },
  })

  if (!res.ok) {
    let body: any = null
    try {
      body = await res.json()
    } catch {
      console.error('[ERROR]: Crux fetch failed to parse error body of url', url)
    }

    const apiError = fromApiError(res.status, body ?? {})
    throw apiError
  }

  return res
}

export const getCrux = async <Res>(req: http.IncomingMessage, url: string): Promise<Res> => {
  const res = await fetchCrux(req, url)
  const body = await res.json()

  return body
}

export const getCruxFromContext = <Res>(context: Pick<NextPageContext, 'req'>, url: string): Promise<Res> =>
  getCrux<Res>(context.req, url)

export const postCruxFromContext = async <Res>(context: Pick<NextPageContext, 'req'>, url: string): Promise<Res> => {
  const res = await fetchCrux(context.req, url, {
    method: 'POST',
  })

  return await res.json()
}
