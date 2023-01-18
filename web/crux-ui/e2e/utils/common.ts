/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import { Configuration, Identity, IdentityApi } from '@ory/kratos-client'
import { FullConfig } from '@playwright/test'
import path from 'path'
import { v4 as uuid } from 'uuid'
import MailSlurper from './mail-slurper'

export const MAILSLURPER_TIMEOUT = 30000 // millis
export const USER_EMAIL = 'john.doe@example.com'
export const USER_PASSWORD = 'TestPw23233'
export const USER_TEAM = "John's Team"

export const DAGENT_NODE = 'dagent-deployable'
export const SCREENSHOTS_FOLDER = 'screenshots'

const replacePort = (address: string, port: string): string => {
  const index = address.lastIndexOf(':')
  const url = address.substring(0, index)
  return `${url}:${port}`
}

export const mailslurperFromBaseURL = (baseURL: string): MailSlurper => {
  const url = process.env.MAILSLURPER_URL || replacePort(baseURL, '4437')
  return new MailSlurper(url)
}

export const cruxAddressFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  const address = baseURL.substring(baseURL.indexOf('//') + 2)

  return process.env.CRUX_URL ?? replacePort(address, '5001')
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

export const kratosFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  return kratosFromBaseURL(baseURL)
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

export const screenshotPath = (name: string) => path.join(__dirname, '..', SCREENSHOTS_FOLDER, `${name}.png`)

export const extractDeploymentUrl = (url: string): { versionId: string; deploymentId: string } => {
  const urlParts = url.split('/')
  urlParts.pop()
  const deploymentId = urlParts.pop()
  urlParts.pop()
  const versionId = urlParts.pop()

  return {
    versionId,
    deploymentId,
  }
}
