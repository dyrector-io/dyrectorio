import { HEADER_SET_COOKIE } from '@app/const'
import { missingParameter } from '@app/error-responses'
import http from 'http'
import { GetServerSidePropsContext } from 'next'

export const cookieOf = (request: http.IncomingMessage): string => {
  const { cookie } = request.headers
  if (!cookie) {
    throw missingParameter('cookie')
  }

  return cookie
}

export const forwardCookieToResponse = (res: http.OutgoingMessage, from: { headers: any }) => {
  const cookie = from.headers[HEADER_SET_COOKIE]
  if (cookie) {
    res.setHeader(HEADER_SET_COOKIE, cookie)
  } else {
    res.removeHeader(HEADER_SET_COOKIE)
  }
}

export const forwardCookie = (context: GetServerSidePropsContext, from: { headers: any }) =>
  forwardCookieToResponse(context.res, from)

export const setCookie = (context: GetServerSidePropsContext, name: string, value: string) => {
  const { res } = context
  res.setHeader(HEADER_SET_COOKIE, `${name}=${value}; path=/; samesite=lax;`)
}

export const getCookie = (context: GetServerSidePropsContext, name: string): string => {
  const ssrContext = context as any as GetServerSidePropsContext
  return ssrContext.req.cookies[name]
}
