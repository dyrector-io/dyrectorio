import { Session, UiContainer, UiNodeInputAttributes } from '@ory/kratos-client'
import { getCookie, setCookie } from '@server/cookie'
import { postCruxFromContext } from '@server/crux-api'
import {
  IncomingMessageWithSession,
  identityWasRecovered,
  obtainSessionFromRequest,
  verifiableEmailOfIdentity,
} from '@server/kratos'
import { FormikErrors, FormikHandlers, FormikState } from 'formik'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, NextApiRequest } from 'next'
import { Translate } from 'next-translate'
import { NextRouter } from 'next/router'
import { QASettings, QA_SETTINGS_PROP, fetchQualityAssuranceSettings } from 'quality-assurance'
import toast, { ToastOptions } from 'react-hot-toast'
import { COOKIE_TEAM_SLUG } from './const'
import { MessageType } from './elements/dyo-input'
import { Audit, AxiosError, DyoApiError, DyoErrorDto, OidcAvailability, RegistryDetails, UserMeta } from './models'
import {
  API_USERS_ME,
  ROUTE_404,
  ROUTE_INDEX,
  ROUTE_LOGIN,
  ROUTE_NEW_PASSWORD,
  ROUTE_STATUS,
  verificationUrl,
} from './routes'

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

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toLocaleString(undefined, numberFormat)
  const day = date.getDate().toLocaleString(undefined, numberFormat)
  const hours = date.getHours().toLocaleString(undefined, numberFormat)
  const minutes = date.getMinutes().toLocaleString(undefined, numberFormat)
  const seconds = date.getSeconds().toLocaleString(undefined, numberFormat)

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// TODO(@m8vago): check after react update if there is still a hydration error with narrow spaces
export const utcDateToLocale = (date: string) => new Date(date).toLocaleString().replace(/\u202f/g, ' ')

export const auditToLocaleDate = (audit: Audit) => utcDateToLocale(audit.updatedAt ?? audit.createdAt)

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

// auth related
export const findAttributes = (ui: UiContainer, name: string): UiNodeInputAttributes => {
  const node = ui.nodes.find(it => (it.attributes as UiNodeInputAttributes).name === name)
  return node?.attributes as UiNodeInputAttributes
}

export const findAttributesByValue = (ui: UiContainer, value: string): UiNodeInputAttributes => {
  const node = ui.nodes.find(it => (it.attributes as UiNodeInputAttributes).value === value)
  return node?.attributes as UiNodeInputAttributes
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

export const mapOidcAvailability = (ui: UiContainer): OidcAvailability => ({
  gitlab: !!findAttributesByValue(ui, 'gitlab'),
  github: !!findAttributesByValue(ui, 'github'),
  google: !!findAttributesByValue(ui, 'google'),
  azure: !!findAttributesByValue(ui, 'azure'),
})

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
      const dto: DyoErrorDto = (await res.json()) ?? {
        error: 'UNKNOWN',
        description: 'Unknown error',
      }

      const error: DyoApiError = {
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

export const formikSetFieldValueOrIgnore =
  (formik: { setFieldValue: FormikSetFieldValue }, ignore: boolean): FormikSetFieldValue =>
  (field, value, shouldValidate) => {
    if (ignore) {
      return undefined
    }

    return formik.setFieldValue(field, value, shouldValidate)
  }

export const sendForm = async <Dto>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  body?: Dto,
): Promise<Response> => {
  try {
    const data = await fetch(url, {
      method,
      headers: body
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
      body: body ? JSON.stringify(body) : null,
    })

    return data
  } catch (err) {
    console.error('sendFormError', err)
    throw err
  }
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

export const searchParamsOf = (context: GetServerSidePropsContext): string => {
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

export type CruxGetServerSideProps<T> = (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>

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

export const teamSlugOrFirstTeam = async (context: GetServerSidePropsContext): Promise<string> => {
  let teamSlug = getCookie(context, COOKIE_TEAM_SLUG)
  if (!teamSlug) {
    const meta = await postCruxFromContext<UserMeta>(context, API_USERS_ME)
    if (!meta || meta.teams.length < 1) {
      return null
    }

    teamSlug = meta.teams[0].slug
  }

  return teamSlug
}

export const setupContextSession = async (
  context: GetServerSidePropsContext,
  session: Session,
): Promise<GetServerSidePropsResult<any>> => {
  const req = context.req as IncomingMessageWithSession

  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  const recovered = identityWasRecovered(session)
  if (recovered) {
    return redirectTo(ROUTE_NEW_PASSWORD)
  }

  const verifiableEmail = verifiableEmailOfIdentity(session.identity)
  if (verifiableEmail && !verifiableEmail.verified) {
    return redirectTo(verificationUrl({ email: verifiableEmail.value }))
  }

  req.session = session

  return null
}

export const withContextErrorHandling =
  <T>(getServerSideProps: CruxGetServerSideProps<T>): GetServerSideProps<T> =>
  async (context: GetServerSidePropsContext) => {
    try {
      return await getServerSideProps(context)
    } catch (err) {
      if (isDyoApiError(err)) {
        console.error(`[ERROR]: ${err.status} - prop: ${err.property}: ${err.value} - ${err.description}`)

        if (err.status === 404 && err.property === 'team') {
          return redirectTo(ROUTE_INDEX)
        }

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

const KEY_PROPS = 'props'
const appendToServerSideProps = async <T>(
  serverSideProps: GetServerSidePropsResult<T>,
  name: string,
  value: any,
): Promise<GetServerSidePropsResult<T>> => {
  const innerProps: any = serverSideProps[KEY_PROPS]
  if (!innerProps) {
    return serverSideProps
  }

  innerProps[name] = value

  return {
    ...serverSideProps,
    props: innerProps,
  }
}

const withQualityAssurance =
  <T>(getServerSideProps: CruxGetServerSideProps<T>): GetServerSideProps<T> =>
  async (context: GetServerSidePropsContext) => {
    let qaSettings: QASettings = null

    try {
      qaSettings = await fetchQualityAssuranceSettings(context)
    } catch (err) {
      if (err.status !== 403) {
        console.error('[ERROR]: Failed to fetch QA settings')
        console.error(err)
      }
    }

    const props = await getServerSideProps(context)
    return await appendToServerSideProps(props, QA_SETTINGS_PROP, qaSettings)
  }

export const withContextAuthorization =
  <T>(getServerSideProps: CruxGetServerSideProps<T>): GetServerSideProps<T> =>
  async (context: GetServerSidePropsContext) => {
    const session = await obtainSessionFromRequest(context.req)
    const redirect = await setupContextSession(context, session)
    if (redirect) {
      return redirect
    }

    const teamSlug = context.query.teamSlug as string
    if (teamSlug) {
      setCookie(context, COOKIE_TEAM_SLUG, teamSlug)
    }

    const ssr = withContextErrorHandling(withQualityAssurance(getServerSideProps))
    return await ssr(context)
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

export const snakeToCamel = (str: string): string =>
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

export const toNumber = (value: string): number => {
  if (!value) {
    return null
  }

  const parsedValue = Number(value)

  if (Number.isNaN(parsedValue)) {
    return NaN
  }

  return parsedValue
}

export const getEndOfToday = () => {
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  return endOfToday
}
