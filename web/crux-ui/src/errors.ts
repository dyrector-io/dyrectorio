import { Translate } from 'next-translate'
import toast from 'react-hot-toast'
import { DyoErrorDto, DyoErrorMessage } from './models'

type Translation = {
  input?: string
  toast: string
}

type FormikSetErrorValue = (field: string, message: string | undefined) => void

type Translator = (stringId: string, status: number, dto: DyoErrorDto) => Translation

export const defaultTranslator: (t: Translate) => Translator = (t: Translate) => (stringId, status, dto) => {
  if (status < 500) {
    const translation = t(`errors.${stringId}`, dto, {
      fallback: `errors:${stringId}`,
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
      const dto = (await res.json()) as DyoErrorDto
      translation = translator(dto.error, status, dto)

      if (setErrorValue && translation.input) {
        setErrorValue(dto.property, translation.input)
      }
    } catch (err) {
      translation = translator(null, 500, null)
    }

    toaster(translation.toast)
  }

export const defaultApiErrorHandler = (t: Translate) => apiErrorHandler(defaultTranslator(t))

export const wsErrorHandler = (translator: Translator) => (message: DyoErrorMessage) => {
  const toaster = text => toast.error(text)

  const translation = translator(message.error, message.status, message)
  toaster(translation.toast)
}

export const defaultWsErrorHandler = (t: Translate) => wsErrorHandler(defaultTranslator(t))
