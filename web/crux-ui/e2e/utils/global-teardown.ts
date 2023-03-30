import { exec, ExecOptions } from 'child_process'
/* eslint-disable import/no-extraneous-dependencies */
import { internalError } from '@app/error-responses'
import { UserMeta } from '@app/models'
import { API_USERS_ME, teamApiUrl } from '@app/routes'
import { isDyoError } from '@app/utils'
import { FullConfig } from '@playwright/test'
import {
  cruxUrlFromConfig,
  deleteUserByEmail,
  getUserByEmail,
  getUserSessionToken,
  kratosFromConfig,
  kratosFrontendFromConfig,
  USER_EMAIL,
} from './common'

const logInfo = (...messages: string[]) => console.info('[E2E]: Teardown -', ...messages)

export const fetchCruxFromBrowser = async (cookie: string, cruxUrl: string, url: string, init?: RequestInit) => {
  const res = await fetch(`${cruxUrl}${url}`, {
    ...(init ?? {}),
    headers: {
      ...(init?.headers ?? {}),
      cookie,
    },
  })

  if (!res.ok) {
    let body: any = null
    try {
      body = await res.json()
    } catch {
      console.error('[ERROR]: Crux fetch failed to parse error body of url', url)
    }

    if (body && isDyoError(body)) {
      throw body
    } else {
      console.error('[ERROR]: Crux fetch failed with status', res.status, body)
      throw internalError('Failed to fetch crux')
    }
  }

  return res
}

const globalTeardown = async (config: FullConfig) => {
  logInfo('started')

  const kratos = kratosFromConfig(config)
  const identity = await getUserByEmail(kratos, USER_EMAIL)
  if (!identity) {
    logInfo('skipped', 'No identity found.')
    return
  }

  const frontend = kratosFrontendFromConfig(config)
  const cookie = await getUserSessionToken(frontend)
  if (!cookie) {
    logInfo('skipped', 'No session found.')
    return
  }

  const cruxUrl = cruxUrlFromConfig(config)
  logInfo('using crux url', cruxUrl)

  logInfo('fetch', 'user meta')
  const userRes = await fetchCruxFromBrowser(cookie, cruxUrl, API_USERS_ME, {
    method: 'POST',
  })

  const user = (await userRes.json()) as UserMeta

  logInfo('fetch', 'delete teams')
  const deletes = user.teams.map(it =>
    fetchCruxFromBrowser(cookie, cruxUrl, teamApiUrl(it.id), {
      method: 'DELETE',
    }),
  )

  await Promise.all(deletes)

  logInfo('fetch', 'delete user')
  await deleteUserByEmail(kratos, USER_EMAIL)

  const settings: ExecOptions =
    process.platform === 'win32'
      ? {
          shell: 'C:\\Program Files\\git\\git-bash.exe',
        }
      : null

  logInfo('docker', 'remove stack')

  exec(`docker rm -f $(docker ps -a -q --filter "name=^pw")`, settings)
  exec('docker rm -f dagent', settings)
}

export default globalTeardown
