import { HttpException } from '@nestjs/common'
import { CruxExceptionOptions } from './crux-exception'

export type WebSocketExceptionOptions = CruxExceptionOptions & {
  status: number
}

export const convertHttpExceptionToWsExceptionOptions = (exception: HttpException): WebSocketExceptionOptions => {
  const status = exception.getStatus()
  const res = exception.getResponse() as string | CruxExceptionOptions
  if (typeof res === 'string') {
    return {
      status,
      message: res,
    }
  }

  return {
    ...res,
    status,
  }
}
