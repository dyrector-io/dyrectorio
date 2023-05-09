/* eslint-disable import/no-extraneous-dependencies */
import { ROUTE_DASHBOARD, ROUTE_LOGIN, ROUTE_TEAMS_CREATE } from '@app/routes'
import { chromium, FullConfig } from '@playwright/test'
import { createUser, kratosFromConfig, USER_EMAIL, USER_PASSWORD, USER_TEAM } from './common'
import globalTeardown from './global-teardown'
import { installDagent } from './node-helper'

const globalSetup = async (config: FullConfig) => {
  await globalTeardown(config)

  const kratos = kratosFromConfig(config)
  await createUser(kratos, USER_EMAIL, USER_PASSWORD, {
    verified: true,
  })

  const project = config.projects[0].use
  const { baseURL, storageState } = project
  const browser = await chromium.launch()
  const page = await browser.newPage({
    baseURL,
  })

  await page.goto(ROUTE_LOGIN)
  await page.locator('input[name=email]').fill(USER_EMAIL)
  await page.locator('input[name=password]').fill(USER_PASSWORD)
  await page.locator('button[type=submit]').click()

  await page.waitForURL(ROUTE_TEAMS_CREATE)
  await page.locator('input[name=name]').fill(USER_TEAM)
  await page.locator('button[type=submit]').click()

  await page.waitForURL(ROUTE_DASHBOARD)

  await page.context().storageState({ path: storageState as string })

  // setup a deployable node
  // await installDagent(page)

  await browser.close()
}

export default globalSetup
