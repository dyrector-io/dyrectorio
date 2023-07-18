/* eslint-disable import/no-extraneous-dependencies */
import { ROUTE_DASHBOARD, ROUTE_LOGIN, ROUTE_REGISTRIES, ROUTE_TEAMS_CREATE } from '@app/routes'
import { test } from '@playwright/test'
import { BASE_URL, STORAGE_STATE } from '../../playwright.config'
import {
  createUser,
  GHCR_MIRROR,
  kratosFromConfig,
  REGISTRY_NAME,
  USER_EMAIL,
  USER_PASSWORD,
  USER_TEAM,
  USER_TEAM_SLUG,
} from './common'
import { globalTeardown } from './global.teardown'
import { installDagent } from './node-helper'

const logInfo = (...messages: string[]) => console.info('[E2E]: Setup -', ...messages)

test('global setup', async ({ page }) => {
  await globalTeardown()

  logInfo('creating user')
  const kratos = kratosFromConfig(BASE_URL)
  await createUser(kratos, USER_EMAIL, USER_PASSWORD, {
    verified: true,
  })

  logInfo('logging in')
  await page.goto(ROUTE_LOGIN)
  await page.locator('input[name=email]').fill(USER_EMAIL)
  await page.locator('input[name=password]').fill(USER_PASSWORD)
  await page.locator('button[type=submit]').click()

  logInfo('creating team')
  await page.waitForURL(ROUTE_TEAMS_CREATE)
  await page.locator('input[name=name]').fill(USER_TEAM)
  await page.locator('input[name=slug]').fill(USER_TEAM_SLUG)
  await page.locator('button[type=submit]').click()

  await page.waitForURL(ROUTE_DASHBOARD)

  logInfo('saving storage state')
  await page.context().storageState({ path: STORAGE_STATE as string })

  logInfo('changing registry to ghcr')
  await page.goto(ROUTE_REGISTRIES)
  await page.click('h3:has-text("Docker Hub Library")')
  await page.waitForURL(`${ROUTE_REGISTRIES}/**`)
  await page.click('button:has-text("Edit")')
  await page.click('button:has-text("Unchecked")')
  await page.locator('input[name=name]').fill(REGISTRY_NAME)
  await page.locator('input[name=url]').fill(GHCR_MIRROR)
  await page.click('button:has-text("Save")')

  logInfo('installing dagent')
  await installDagent(page)
})
