/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import { Page, expect } from '@playwright/test'
import { TEAM_ROUTES } from './common'
import { waitSocketRef, wsPatchSent } from './websocket'
import { PatchConfigMessage, WS_TYPE_PATCH_CONFIG } from '@app/models'

const matchPatchEnvironment = (expected: Record<string, string>) => (message: PatchConfigMessage) =>
  Object.entries(expected).every(
    ([key, value]) => message.config?.environment?.find(it => it.key === key && it.value === value),
  )

export const createConfigBundle = async (page: Page, name: string, data: Record<string, string>): Promise<string> => {
  await page.goto(TEAM_ROUTES.configBundle.list())
  await page.waitForSelector('h2:text-is("Config bundles")')

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4')).toContainText('New config bundle')
  await page.locator('input[name=name] >> visible=true').fill(name)

  const sock = waitSocketRef(page)
  await page.locator('text=Save').click()
  await page.waitForURL(`${TEAM_ROUTES.configBundle.list()}/**`)
  await page.waitForSelector(`h4:text-is("View ${name}")`)

  const configBundleId = page.url().split('/').pop()

  const ws = await sock
  const wsRoute = TEAM_ROUTES.configBundle.detailsSocket(configBundleId)

  await page.locator('button:has-text("Edit")').click()

  const wsPatchReceived = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, matchPatchEnvironment(data))

  const entries = Object.entries(data)
  for (let i = 0; i < entries.length; i++) {
    const [envKey, envValue] = entries[i]

    await page.locator('input[placeholder="Key"]').nth(i).fill(envKey)
    await page.locator('input[placeholder="Value"]').nth(i).fill(envValue)
  }

  await wsPatchReceived

  return configBundleId
}
