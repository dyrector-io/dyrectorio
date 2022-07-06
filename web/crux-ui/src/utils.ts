import { isDyoApiError } from '@server/error-middleware'
import { IncomingMessageWithSession, obtainKratosSession, userVerified } from '@server/kratos'
import { FormikErrors } from 'formik'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextPageContext,
} from 'next'
import { Translate } from 'next-translate'
import { NextRouter } from 'next/router'
import toast from 'react-hot-toast'
import { DyoErrorDto, DyoFetchError } from './models'
import { Timestamp } from './models/grpc/google/protobuf/timestamp'
import { ROUTE_404, ROUTE_500, ROUTE_AUTH, ROUTE_INDEX } from './routes'

// date
export const dateToUtcTime = (date: Date): number => {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  )
}

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

export const utcDateToLocale = (date: string) => new Date(date).toLocaleString()

// array
export const fold = <T, R>(items: T[], initialValue: R, combine: (previous: R, current: T) => R): R => {
  let value = initialValue
  for (let i = 0; i < items.length; i++) {
    value = combine(value, items[i])
  }
  return value
}

export const distinct = <T>(items: T[]): T[] => Array.from(new Set(items))

// errors
export const isDyoError = (instance: any) => 'error' in instance && 'description' in instance

export const findError = (errors: DyoErrorDto[], name: string, converter?: (error: DyoErrorDto) => string): string => {
  const error = errors.find(it => it.property === name)
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
    property: name,
  })
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

export const removeError = (errors: DyoErrorDto[], name: string): DyoErrorDto[] => {
  return errors.filter(it => it.property !== name)
}

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

    return await res.json()
  }
}

export const fetcher = configuredFetcher()

// forms
export const paginationParams = (req: NextApiRequest, defaultTake: number = 100): [number, number] => {
  const skip = (req.query['skip'] ?? 0) as number
  const take = (req.query['take'] ?? defaultTake) as number
  return [skip, take]
}

export type FormikSetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined,
) => Promise<FormikErrors<any>> | Promise<void>

export const formikFieldValueConverter =
  <T>(formik: { setFieldValue: FormikSetFieldValue }, converter: (value: boolean) => T): FormikSetFieldValue =>
  (field, value, shouldValidate) =>
    formik.setFieldValue(field, converter(value), shouldValidate)

export const sendForm = async <Dto>(method: 'POST' | 'PUT', url: string, body: Dto): Promise<Response> => {
  return await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

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

export type CruxUrlParams = {
  anchor?: string
}

export const appendUrlParams = <T extends CruxUrlParams>(url: string, params: T): string => {
  let result = url
  let paramMap: Map<string, any> = new Map()
  const anchor = params?.anchor

  if (params) {
    delete params.anchor

    Object.entries(params).map(entry => {
      const [key, value] = entry
      if (key) {
        paramMap.set(key, value)
      }
    })
  }

  if (paramMap.size > 0) {
    const entries = Array.from(paramMap.entries())
    const [firstKey, firstValue] = entries[0]
    result = `${result}?${firstKey}=${firstValue}`

    if (entries.length > 1) {
      const rest = entries.slice(1)

      result = fold(rest, result, (prev, it) => {
        const [key, value] = it
        return `${prev}&${key}=${value}`
      })
    }
  }

  return anchor ? `${result}#${anchor}` : result
}

// page ssr
export const redirectTo = (destination: string, permanent = false): GetServerSidePropsResult<any> => {
  return {
    redirect: {
      destination,
      permanent,
    },
  }
}

export type CruxGetServerSideProps<T> = (context: NextPageContext) => Promise<GetServerSidePropsResult<T>>

const dyoApiErrorStatusToRedirectUrl = (status: number): string => {
  switch (status) {
    case 401:
      return ROUTE_AUTH
    case 404:
      return ROUTE_404
    case 403:
      return ROUTE_404
    default:
      return ROUTE_500
  }
}

export const withContextAuthorization =
  <T>(getServerSideProps: CruxGetServerSideProps<T>): GetServerSideProps<T> =>
  async (context: GetServerSidePropsContext) => {
    const req = context.req as IncomingMessageWithSession

    const session = await obtainKratosSession(req)
    if (!session || !userVerified(session.identity)) {
      return redirectTo(ROUTE_AUTH)
    }

    req.session = session

    try {
      const props = await getServerSideProps(context as any as NextPageContext)
      return props
    } catch (err) {
      console.error('Error while accessing', req.url)
      console.error(err)

      if (isDyoApiError(err)) {
        if (err.status === 404 && err.property === 'team') {
          return redirectTo(ROUTE_INDEX)
        }

        const url = dyoApiErrorStatusToRedirectUrl(err.status)
        return redirectTo(url)
      } else {
        throw err
      }
    }
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

export const isServerSide = () => typeof window === 'undefined'
