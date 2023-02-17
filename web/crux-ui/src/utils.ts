import { Session, UiContainer, UiNodeInputAttributes } from '@ory/kratos-client'
import {
  identityWasRecovered,
  IncomingMessageWithSession,
  obtainSessionFromRequest,
  userVerified,
} from '@server/kratos'
import { FormikErrors, FormikHandlers, FormikState } from 'formik'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextPageContext,
} from 'next'
import { Translate } from 'next-translate'
import { NextRouter } from 'next/router'
import toast, { ToastOptions } from 'react-hot-toast'
import { MessageType } from './elements/dyo-input'
import { AxiosError, DyoApiError, DyoErrorDto, DyoFetchError, RegistryDetails } from './models'
import { Timestamp } from './models/grpc/google/protobuf/timestamp'
import { ROUTE_404, ROUTE_INDEX, ROUTE_LOGIN, ROUTE_NEW_PASSWORD, ROUTE_STATUS, ROUTE_VERIFICATION } from './routes'

export type AsyncVoidFunction = () => Promise<void>

export const isServerSide = () => typeof window === 'undefined'

// date
export const dateToUtcTime = (date: Date): number =>
  Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  )

export const utcNow = (): number => dateToUtcTime(new Date())

// TODO: singular time formats
export const timeAgo = (t: Translate, seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) {
    return t('common:secondsAgo', { seconds })
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 1) {
    return t('common:minutesAgo', { minutes })
  }

  const days = Math.floor(hours / 24)
  if (days < 1) {
    return t('common:hoursAgo', { hours })
  }

  return t('common:daysAgo', { days })
}

export const terminalDateFormat = (date: Date): string => {
  const numberFormat = {
    minimumIntegerDigits: 2,
    useGrouping: true,
  }

  return `${date.getDate().toLocaleString(undefined, numberFormat)}/${(date.getMonth() + 1).toLocaleString(
    undefined,
    numberFormat,
  )}/${date.getFullYear()} ${date.getHours().toLocaleString(undefined, numberFormat)}:${date
    .getMinutes()
    .toLocaleString(undefined, numberFormat)}:${date.getSeconds().toLocaleString(undefined, numberFormat)}`
}

export const timestampToUTC = (timestamp: Timestamp): string => {
  if (!timestamp) {
    return null
  }

  let millis = timestamp.seconds * 1_000
  millis += timestamp.nanos / 1_000_000
  return new Date(millis).toUTCString()
}

// TODO(@m8vago): check after react and update if there is still a hydration error with narrow spaces
export const utcDateToLocale = (date: string) => new Date(date).toLocaleString().replace(/\u202f/g, ' ')

export const getUserDateFormat = (fallback: string) => {
  let dateFormat: string
  if (!isServerSide()) {
    dateFormat = new Intl.DateTimeFormat(window.navigator.language)
      .formatToParts(new Date(0))
      .map(o => {
        switch (o.type) {
          case 'day':
            return o.value.length > 1 ? 'dd' : 'd' // checking if there is a leading zero to single digits
          case 'month':
            return o.value.length > 1 ? 'MM' : 'M'
          case 'year':
            return 'yyyy'
          default: // separator character(s)
            return o.value
        }
      })
      .join('')
  }
  return dateFormat?.indexOf('yyyy') > -1 ? dateFormat : fallback // if the format is invalid, use fallback
}

// array
export const fold = <T, R>(items: T[], initialValue: R, combine: (previous: R, current: T) => R): R => {
  let value = initialValue
  for (let i = 0; i < items.length; i++) {
    value = combine(value, items[i])
  }
  return value
}

export const distinct = <T>(items: T[]): T[] => Array.from(new Set(items))

// auth related
export const findAttributes = (ui: UiContainer, name: string): UiNodeInputAttributes => {
  const node = ui.nodes.find(it => (it.attributes as UiNodeInputAttributes).name === name)
  return node.attributes as UiNodeInputAttributes
}

export const findMessage = (ui: UiContainer, name: string): string => {
  const node = ui.nodes.find(it => (it.attributes as UiNodeInputAttributes).name === name)
  if (!node) {
    return null
  }

  const errors = node.messages.filter(it => it.type === 'error')
  const infos = node.messages.filter(it => it.type === 'info')

  const text = errors.length > 0 ? errors[0] : infos.length > 0 ? infos[0] : null
  return text?.text
}

export const findUiMessage = (ui: UiContainer, type: MessageType): string => {
  const message = ui?.messages?.find(it => it.type === type)
  return message?.text
}

// errors
export const isDyoError = (instance: any) => 'error' in instance && 'description' in instance
export const isDyoApiError = (instance: any): instance is DyoApiError => isDyoError(instance) && 'status' in instance

export const findError = (errors: DyoErrorDto[], name: string, converter?: (error: DyoErrorDto) => string): string => {
  const error = errors.find(it => it.property === name)
  if (error && converter) {
    return converter(error)
  }

  return error?.error
}

export const upsertDyoError = (errors: DyoErrorDto[], error: DyoErrorDto): DyoErrorDto[] => {
  const index = errors.findIndex(it => it.property === error.property)
  if (index > -1) {
    const result = [...errors]
    result[index] = error
    return result
  }

  return [...errors, error]
}

export const upsertError = (errors: DyoErrorDto[], name: string, error: string, description?: string): DyoErrorDto[] =>
  upsertDyoError(errors, {
    description: description ?? 'Ui error.',
    error,
    property: name,
  })

export const removeError = (errors: DyoErrorDto[], name: string): DyoErrorDto[] =>
  errors.filter(it => it.property !== name)

// fetch
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

    return res.json()
  }
}

export const fetcher = configuredFetcher()

// forms
export const paginationParams = (req: NextApiRequest, defaultTake: 100): [number, number] => {
  const skip = (req.query.skip ?? 0) as number
  const take = (req.query.take ?? defaultTake) as number
  return [skip, take]
}

export type FormikSetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => Promise<FormikErrors<any>> | Promise<void>

export type FormikProps<T> = FormikState<T> &
  FormikHandlers & {
    setFieldValue: FormikSetFieldValue
  }

export type EditRegistryTypeProps<T = RegistryDetails> = {
  formik: FormikProps<T>
}

export const formikFieldValueConverter =
  <T>(formik: { setFieldValue: FormikSetFieldValue }, converter: (value: boolean) => T): FormikSetFieldValue =>
  (field, value, shouldValidate) =>
    formik.setFieldValue(field, converter(value), shouldValidate)

export const sendForm = async <Dto>(method: 'POST' | 'PUT', url: string, body: Dto): Promise<Response> =>
  await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

type Identifiable = {
  id: string
}

type UpsertByIdOptions<T> = {
  onUpdate?: (old: T) => T
}

export const upsertById = <T extends Identifiable>(curentItems: T[], item: T, options?: UpsertByIdOptions<T>): T[] => {
  if (!item) {
    return curentItems
  }

  const items = [...curentItems]
  const index = items.findIndex(it => it.id === item.id)
  if (index > -1) {
    const current = items[index]
    items[index] = options?.onUpdate?.call(this, current) ?? item
  } else {
    items.push(item)
  }

  return items
}

// routing
export const anchorLinkOf = (router: NextRouter): string => {
  const url = router.asPath ?? ''
  const parts = url.split('#')
  if (parts.length < 2) {
    return null
  }

  return `#${parts[1]}`
}

export const searchParamsOf = (context: NextPageContext): string => {
  const url = context.req?.url ?? ''
  const parts = url.split('?')
  if (parts.length < 2) {
    return ''
  }

  return `?${parts[1]}`
}

// page ssr
export const redirectTo = (destination: string, permanent = false): GetServerSidePropsResult<any> => ({
  redirect: {
    destination,
    permanent,
  },
})

export type CruxGetServerSideProps<T> = (context: NextPageContext) => Promise<GetServerSidePropsResult<T>>

const dyoApiErrorStatusToRedirectUrl = (status: number): string => {
  switch (status) {
    case 401:
      return ROUTE_LOGIN
    case 404:
      return ROUTE_404
    case 403:
      return ROUTE_404
    default:
      return ROUTE_STATUS
  }
}

export const setupContextSession = async (context: GetServerSidePropsContext | NextPageContext, session: Session) => {
  const req = context.req as IncomingMessageWithSession

  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  const recovered = await identityWasRecovered(session)
  if (recovered) {
    return redirectTo(ROUTE_NEW_PASSWORD)
  }

  if (!userVerified(session.identity)) {
    return redirectTo(ROUTE_VERIFICATION)
  }

  req.session = session

  return null
}

export const withContextErrorHandling =
  <T>(getServerSideProps: CruxGetServerSideProps<T>): GetServerSideProps<T> =>
  async (context: GetServerSidePropsContext) => {
    try {
      const props = await getServerSideProps(context as any as NextPageContext)
      return props
    } catch (err) {
      if (isDyoApiError(err)) {
        if (err.status === 404 && err.property === 'team') {
          return redirectTo(ROUTE_INDEX)
        }

        console.error(`[ERROR]: ${err.status} - prop: ${err.property}: ${err.value} - ${err.description}`)
        const url = dyoApiErrorStatusToRedirectUrl(err.status)
        return redirectTo(url)
      }

      if (err.response) {
        const error = err as AxiosError<any>
        const res = error.response
        console.error(`[ERROR]: ${res.status}`, res.data)
        return redirectTo(ROUTE_INDEX)
      }
      throw err
    }
  }

export const withContextAuthorization =
  <T>(getServerSideProps: CruxGetServerSideProps<T>): GetServerSideProps<T> =>
  async (context: GetServerSidePropsContext) => {
    const session = await obtainSessionFromRequest(context.req)
    const redirect = await setupContextSession(context, session)
    if (redirect) {
      return redirect
    }

    return withContextErrorHandling(getServerSideProps)(context)
  }

export const parseStringUnionType = <T>(value: string, fallback: T, validValues: ReadonlyArray<T>): T => {
  if (value) {
    const index = (validValues as unknown as ReadonlyArray<string>).indexOf(value)
    return validValues[index]
  }

  return fallback
}

export const writeToClipboard = async (t: Translate, content: string) => {
  if (window.isSecureContext) {
    await navigator.clipboard.writeText(content)
    toast(t('common:copied'))
  } else {
    toast(t('errors:insecure'))
  }
}

export const snakeToCamel = str =>
  str.toLowerCase().replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''))

export const toastWarning = (message: string, opts?: ToastOptions) => {
  toast(message, {
    ...opts,
    className: '!bg-warning-orange',
    style: {
      color: 'white',
    },
  })
}

export const toTimestamp = (date: Date): Timestamp => {
  const seconds = date.getTime() / 1_000
  const nanos = (date.getTime() % 1_000) * 1_000_000
  return { seconds, nanos }
}

export const nullify = <T>(target: T): T => {
  const values = Object.values(target)

  const notEmpty = values.some(it => {
    if (!it) {
      return typeof it === 'number' && it === 0
    }

    if (Array.isArray(it)) {
      return it.length > 0
    }

    if (typeof it === 'object') {
      return nullify(it)
    }

    return true
  })

  return notEmpty ? target : null
}

export const toNumber = (value: string, defaultValue: number = 0): number => {
  if (!value) {
    return null
  }

  return Number.isNaN(value) ? defaultValue : Number(value)
}
