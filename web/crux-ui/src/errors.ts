import { Translate } from 'next-translate'
import toast from 'react-hot-toast'
import { fromApiError } from './error-responses'
import { DyoErrorDto, WsErrorMessage } from './models'

type Translation = {
  input?: string
  toast: string
}

type FormikSetErrorValue = (field: string, message: string | undefined) => void

type Translator = (stringId: string, status: number, dto: DyoErrorDto) => Translation

type CruxApiError = {
  message: string
  property?: string
  value?: string
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
    const toaster = message => toast.error(message)

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
      translation = translator(null, 500, null)
    }

    toaster(translation.toast)
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

export const defaultWsErrorHandler = (t: Translate) => wsErrorHandler(defaultTranslator(t))
