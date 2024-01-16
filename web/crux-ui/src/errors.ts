import { Translate } from 'next-translate'
import toast, { ToastOptions } from 'react-hot-toast'
import { fromApiError } from './error-responses'
import { DyoErrorDto, WsErrorMessage } from './models'
import WebSocketClient from './websockets/websocket-client'
import { ROUTE_LOGIN } from './routes'
import { NextRouter } from 'next/router'

export type DyoApiErrorHandler = (res: Response, setErrorValue?: FormikSetErrorValue) => Promise<void>

type Translation = {
  input?: string
  toastOptions?: ToastOptions
  toast: string
}

type FormikSetErrorValue = (field: string, message: string | undefined) => void

type Translator = (stringId: string, status: number, dto: DyoErrorDto) => Translation

type CruxApiError = {
  message: string
  property?: string
  value?: string
  error: string
}

export const defaultTranslator: (t: Translate) => Translator = t => (stringId, status, dto) => {
  if (status < 500) {
    const translation = t(`errors.${stringId}`, dto, {
      fallback: `errors:${stringId}`,
      default: dto.description,
    })

    return {
      input: translation,
      toast: translation,
    }
  }
  return {
    toast: t('errors:oops'),
  }
}

export const apiErrorHandler =
  (translator: Translator) => async (res: Response, setErrorValue?: FormikSetErrorValue) => {
    const toaster = (message, options) => toast.error(message, options)

    const { status } = res
    let translation = null

    try {
      const cruxError = (await res.json()) as CruxApiError
      const dyoError = fromApiError(status, cruxError)

      translation = translator(dyoError.error, status, dyoError)

      if (setErrorValue && translation.input) {
        setErrorValue(dyoError.property, translation.input)
      }
    } catch (err) {
      console.error('Failed to handle api error', res.status, res.url)
      translation = translator(null, 500, null)
    }

    toaster(translation.toast, translation.toastOptions)
  }

export const defaultApiErrorHandler = (t: Translate) => apiErrorHandler(defaultTranslator(t))

export const wsErrorHandler = (translator: Translator) => (message: WsErrorMessage) => {
  const toaster = text => toast.error(text)

  // TODO(@m8vago): get rid of DyoApiError's error property and use the status and 'property' fields instead
  const translation = translator(message.property, message.status, {
    error: '',
    description: message.message,
    property: message.property,
    value: message.value,
  })
  toaster(translation.toast)
}

export const defaultWsErrorHandler = (t: Translate, router: NextRouter) => async (msg: WsErrorMessage) => {
  const defaultErrorHandler = wsErrorHandler(defaultTranslator(t))
  if (msg.status === WebSocketClient.ERROR_UNAUTHORIZE) {
    await router.push(ROUTE_LOGIN)
    return
  }
  defaultErrorHandler(msg)
}
