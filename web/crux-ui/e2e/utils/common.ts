/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import { ATTRIB_CSRF, HEADER_SET_COOKIE } from '@app/const'
import { findAttributes } from '@app/utils'
import {
  Configuration,
  FrontendApi,
  Identity,
  IdentityApi,
  UpdateLoginFlowWithPasswordMethod,
} from '@ory/kratos-client'
import { FullConfig, Locator, Page } from '@playwright/test'
import path from 'path'
import { v4 as uuid } from 'uuid'
import MailSlurper from './mail-slurper'

export const MAILSLURPER_TIMEOUT = 30000 // millis
export const USER_EMAIL = 'john.doe@example.com'
export const USER_PASSWORD = 'TestPw23233'
export const USER_TEAM = "John's Team"

export const DAGENT_NODE = 'dagent-deployable'
export const SCREENSHOTS_FOLDER = 'screenshots'

export const GHCR_MIRROR = 'ghcr.io/dyrector-io/mirror'
export const NGINX_TEST_IMAGE = 'nginx:mainline-alpine'
export const EXPANDED_IMAGE_NAME = `${GHCR_MIRROR}/${NGINX_TEST_IMAGE}`
export const REGISTRY_NAME = 'ghcr for testing'

const replacePort = (address: string, port: string): string => {
  const index = address.lastIndexOf(':')
  const url = address.substring(0, index)
  return `${url}:${port}`
}

export const mailslurperFromBaseURL = (baseURL: string): MailSlurper => {
  const url = process.env.MAILSLURPER_URL || replacePort(baseURL, '4437')
  return new MailSlurper(url)
}

export const cruxUrlFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  return process.env.CRUX_URL ?? baseURL
}

export const extractKratosLinkFromMail = (body: string): string => {
  const start = body.indexOf('http')
  const slice = body.substring(start)
  const end = slice.indexOf('"')
  return slice.substring(0, end).replace('&amp;', '&')
}

export const kratosFromBaseURL = (baseURL: string) => {
  const url = process.env.KRATOS_ADMIN_URL || replacePort(baseURL, '4434')

  const kratosConfig = new Configuration({
    basePath: url,
  })

  return new IdentityApi(kratosConfig)
}

export const kratosFrontendFromBaseURL = (baseURL?: string) => {
  const url = process.env.KRATOS_URL || replacePort(baseURL, '4433')

  const kratosConfig = new Configuration({
    basePath: url,
  })

  return new FrontendApi(kratosConfig)
}

export const kratosFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  return kratosFromBaseURL(baseURL)
}

export const kratosFrontendFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  return kratosFrontendFromBaseURL(baseURL)
}

export const createUser = async (
  kratos: IdentityApi,
  email: string,
  password: string,
  options?: {
    verified: boolean
  },
): Promise<Identity> => {
  const res = await kratos.createIdentity({
    createIdentityBody: {
      schema_id: 'default',
      state: 'active',
      traits: {
        email,
        name: {
          first: 'John',
          last: 'Doe',
        },
      },
      credentials: {
        password: {
          config: {
            password,
          },
        },
      },
      verifiable_addresses: !options?.verified
        ? []
        : [
            {
              id: uuid(),
              status: 'completed',
              value: email,
              verified: true,
              via: 'email',
            },
          ],
    },
  })

  return res.data
}

export const getUserByEmail = async (kratos: IdentityApi, email: string) => {
  const identitites = (await kratos.listIdentities()).data
  const identity = identitites.find(it => it.traits.email === email)
  return identity
}

export const deleteUserByEmail = async (kratos: IdentityApi, email: string) => {
  const identity = await getUserByEmail(kratos, email)
  if (!identity) {
    return
  }

  await kratos.deleteIdentity({
    id: identity.id,
  })
}

export const getUserSessionToken = async (frontend: FrontendApi) => {
  const flow = await frontend.createBrowserLoginFlow()
  const cookie = flow.headers[HEADER_SET_COOKIE]
  const { data } = flow

  const body: UpdateLoginFlowWithPasswordMethod = {
    method: 'password',
    csrf_token: findAttributes(data.ui, ATTRIB_CSRF)?.value,
    identifier: USER_EMAIL,
    password: USER_PASSWORD,
  }

  const kratosRes = await frontend.updateLoginFlow({
    flow: data.id,
    updateLoginFlowBody: body,
    cookie,
  })

  const sessionCookieHeader = kratosRes.headers[HEADER_SET_COOKIE] as string[]
  return sessionCookieHeader.find(it => it.startsWith('ory_kratos_session'))
}

export const screenshotPath = (name: string) => path.join(__dirname, '..', SCREENSHOTS_FOLDER, `${name}.png`)

export const clearInput = async (input: Locator) => {
  await input.fill('')
  await input.press('Backspace')
}

export const waitForURLExcept = (page: Page, options: { startsWith: string; except: string }) =>
  page.waitForURL(it => it.toString() !== options.except && it.pathname.startsWith(options.startsWith))
