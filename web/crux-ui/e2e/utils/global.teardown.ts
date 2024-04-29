/* eslint-disable import/no-extraneous-dependencies */
import { internalError } from '@app/error-responses'
import { UserMeta } from '@app/models'
import { API_USERS_ME, teamApiUrl } from '@app/routes'
import { isDyoError } from '@app/utils'
import { BASE_URL } from '../../playwright.config'
import {
  cruxUrlFromEnv,
  deleteUserByEmail,
  execAsync,
  getExecOptions,
  getUserByEmail,
  getUserSessionToken,
  kratosFromConfig,
  kratosFrontendFromConfig,
  logCmdOutput,
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
    } catch (e: any) {
      console.error('[ERROR]: Crux fetch failed to parse error body of url', url, e)
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

export const globalTeardown = async () => {
  logInfo('started')

  const kratos = kratosFromConfig(BASE_URL)
  const identity = await getUserByEmail(kratos, USER_EMAIL)
  if (!identity) {
    logInfo('skipped', 'No identity found.')
    return
  }

  const frontend = kratosFrontendFromConfig(BASE_URL)
  const cookie = await getUserSessionToken(frontend)
  if (!cookie) {
    logInfo('skipped', 'No session found.')
    return
  }

  const cruxUrl = cruxUrlFromEnv(BASE_URL)
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

  const settings = getExecOptions()

  logInfo('docker', 'remove stack')

  await execAsync(`docker rm -f $(docker ps -a -q --filter "name=^pw")`, settings)

  if (!process.env.CI) {
    // When running in CI a pipeline step will gather the dagent logs
    const dagentInspect = await execAsync('docker inspect dagent', settings)
    if (dagentInspect.exitCode === 0) {
      logInfo('Saved dagent logs to ./e2e_results/dagent.log')
      await execAsync('docker logs dagent > ./e2e_results/dagent.log 2>&1', settings, logCmdOutput(true))
    }
    await execAsync('docker rm -f dagent', settings)
  }
}
