/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import { ATTRIB_CSRF, HEADER_SET_COOKIE } from '@app/const'
import { UpdateLoginWithPassword } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { findAttributes } from '@app/utils'
import { Configuration, FrontendApi, Identity, IdentityApi } from '@ory/kratos-client'
import { Locator, Page } from '@playwright/test'
import { ChildProcess, ExecException, ExecOptions, exec } from 'child_process'
import path from 'path'
import { v4 as uuid } from 'uuid'
import MailSlurper from './mail-slurper'

export const MAILSLURPER_TIMEOUT = 30000 // millis
export const USER_EMAIL = 'john.doe@example.com'
export const USER_PASSWORD = 'TestPw23233'
export const USER_TEAM = "John's Team"
export const USER_TEAM_SLUG = 'jot'
export const USER_FIRSTNAME = 'John'
export const USER_LASTNAME = 'Doe'
export const USER_FULLNAME = `${USER_FIRSTNAME} ${USER_LASTNAME}`

export const TEAM_ROUTES = new TeamRoutes(USER_TEAM_SLUG)

export const DAGENT_NODE = 'dagent-deployable'
export const SCREENSHOTS_FOLDER = 'screenshots'

export const GHCR_MIRROR = 'ghcr.io'
export const GHCR_PREFIX = 'dyrector-io/mirror'
export const NGINX_IMAGE_NAME = 'nginx'
export const NGINX_TEST_IMAGE_WITH_TAG = `${NGINX_IMAGE_NAME}:mainline-alpine`
export const REDIS_IMAGE_NAME = 'redis'
export const REDIS_TEST_IMAGE_WITH_TAG = `${REDIS_IMAGE_NAME}:latest`
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

export const cruxUrlFromEnv = (baseURL: string) => process.env.CRUX_URL ?? baseURL

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

export const kratosFromConfig = (baseURL: string) => kratosFromBaseURL(baseURL)

export const kratosFrontendFromConfig = (baseURL: string) => kratosFrontendFromBaseURL(baseURL)

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
          first: USER_FIRSTNAME,
          last: USER_LASTNAME,
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
  const cookie = flow.headers[HEADER_SET_COOKIE] as any as string
  const { data } = flow

  const body: UpdateLoginWithPassword = {
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

export const waitForURLExcept = async (page: Page, options: { startsWith: string; except: string }) =>
  await page.waitForURL(it => it.toString() !== options.except && it.pathname.startsWith(options.startsWith))

export const getExecOptions = (): ExecOptions =>
  process.platform === 'win32'
    ? {
        shell: 'C:\\Program Files\\git\\bin\\bash.exe',
      }
    : null

export const logCmdOutput = (logStdOut: boolean) => (err: Error, stdOut: string, stdErr: string) => {
  if (logStdOut) {
    console.info(stdOut)
  }

  if (err) {
    console.error(err)
  }

  if (stdErr) {
    console.error(stdErr)
  }
}

export const execAsync = (
  command: string,
  options: ExecOptions,
  callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
) =>
  new Promise<ChildProcess>(resolve => {
    const childProcess = exec(command, options, (error: ExecException | null, stdout: string, stderr: string) => {
      callback?.call(null, error, stdout, stderr)
      resolve(childProcess)
    })
  })

export const stopContainer = async (containerName: string) => {
  await execAsync(`docker stop ${containerName}`, getExecOptions())
}

export const startContainer = async (containerName: string) => {
  await execAsync(`docker start ${containerName}`, getExecOptions())
}
