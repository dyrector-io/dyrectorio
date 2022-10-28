/* eslint-disable import/no-extraneous-dependencies */
import { Configuration, Identity, V0alpha2Api } from '@ory/kratos-client'
import { FullConfig } from '@playwright/test'
import path from 'path'
import MailSlurper from './mail-slurper'

export const MAILSLURPER_TIMEOUT = 30000 // millis
export const USER_EMAIL = 'john.doe@example.com'
export const USER_PASSWORD = 'TestPw23233'
export const USER_TEAM = "John's Team"

export const SCREENSHOTS_FOLDER = 'screenshots'

const replacePort = (address: string, port: string): string => {
  const index = address.lastIndexOf(':')
  const url = address.substring(0, index)
  return `${url}:${port}`
}

export const mailslurperFromBaseURL = (baseURL: string): MailSlurper => {
  const url = replacePort(baseURL, '4437')
  return new MailSlurper(url)
}

export const mailslurperFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  return mailslurperFromBaseURL(baseURL)
}

export const cruxAddressFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  const address = baseURL.substring(baseURL.indexOf('//') + 2)
  return replacePort(address, '5001')
}

export const extractKratosLinkFromMail = (body: string): string => {
  const start = body.indexOf('http')
  const slice = body.substring(start)
  const end = slice.indexOf('</div>')
  return slice.substring(0, end).replace('&amp;', '&')
}

export const kratosFromBaseURL = (baseURL: string) => {
  const url = replacePort(baseURL, '4434')

  const kratosConfig = new Configuration({
    basePath: url,
  })

  return new V0alpha2Api(kratosConfig)
}

export const kratosFromConfig = (config: FullConfig) => {
  const { baseURL } = config.projects[0].use
  return kratosFromBaseURL(baseURL)
}

export const createUser = async (kratos: V0alpha2Api, email: string, password: string): Promise<Identity> => {
  const res = await kratos.adminCreateIdentity({
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
  })

  return res.data
}

export const getUserByEmail = async (kratos: V0alpha2Api, email: string) => {
  const identitites = (await kratos.adminListIdentities()).data
  const identity = identitites.find(it => it.traits.email === email)
  return identity
}

export const deleteUserByEmail = async (kratos: V0alpha2Api, email: string) => {
  const identity = await getUserByEmail(kratos, email)
  if (!identity) {
    return
  }

  await kratos.adminDeleteIdentity(identity.id)
}

export const screenshotPath = (name: string) => path.join(__dirname, '..', SCREENSHOTS_FOLDER, `${name}.png`)
