/* eslint-disable import/no-extraneous-dependencies */
import { ROUTE_DASHBOARD, ROUTE_LOGIN, ROUTE_TEAMS_CREATE } from '@app/routes'
import { chromium, FullConfig } from '@playwright/test'
import { createUser, kratosFromConfig, USER_EMAIL, USER_PASSWORD, USER_TEAM } from './common'
import globalTeardown from './global-teardown'
import { installDagent } from './node-helper'

const logInfo = (...messages: string[]) => console.info('[E2E]: Setup -', ...messages)

const globalSetup = async (config: FullConfig) => {
  await globalTeardown(config)

  logInfo('creating user')
  const kratos = kratosFromConfig(config)
  await createUser(kratos, USER_EMAIL, USER_PASSWORD, {
    verified: true,
  })

  logInfo('launching browser')
  const project = config.projects[0].use
  const { baseURL, storageState } = project
  const browser = await chromium.launch()
  const page = await browser.newPage({
    baseURL,
  })

  logInfo('logging in')
  await page.goto(ROUTE_LOGIN)
  await page.locator('input[name=email]').fill(USER_EMAIL)
  await page.locator('input[name=password]').fill(USER_PASSWORD)
  await page.locator('button[type=submit]').click()

  logInfo('creating team')
  await page.waitForURL(ROUTE_TEAMS_CREATE)
  await page.locator('input[name=name]').fill(USER_TEAM)
  await page.locator('button[type=submit]').click()

  await page.waitForURL(ROUTE_DASHBOARD)

  logInfo('saving storage state')
  await page.context().storageState({ path: storageState as string })

  logInfo('installing dagent')
  await installDagent(page)

  logInfo('closing browser')
  await browser.close()
}

export default globalSetup
