import { TEAM_ROUTES } from './common'
import { Page, expect } from '@playwright/test'
import { waitSocketRef, wsPatchSent } from './websocket'
import { PatchConfigBundleMessage, WS_TYPE_PATCH_CONFIG_BUNDLE } from '@app/models'

const matchPatchEnvironment = (expected: Record<string, string>) => (message: PatchConfigBundleMessage) =>
  Object.entries(expected).every(
    ([key, value]) => message.environment?.find(it => it.key === key && it.value === value),
  )

export const createConfigBundle = async (page: Page, name: string, data: Record<string, string>): Promise<string> => {
  await page.goto(TEAM_ROUTES.configBundles.list())
  await page.waitForSelector('h2:text-is("Config bundles")')

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4')).toContainText('New config bundle')
  await page.locator('input[name=name] >> visible=true').fill(name)

  const sock = waitSocketRef(page)
  await page.locator('text=Save').click()
  await page.waitForURL(`${TEAM_ROUTES.configBundles.list()}/**`)
  await page.waitForSelector(`h4:text-is("View ${name}")`)

  const configBundleId = page.url().split('/').pop()

  const ws = await sock
  const wsRoute = TEAM_ROUTES.configBundles.detailsSocket(configBundleId)

  await page.locator('button:has-text("Edit")').click()

  const wsPatchReceived = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG_BUNDLE, matchPatchEnvironment(data))

  const entries = Object.entries(data)
  for (let i = 0; i < entries.length; i++) {
    const [envKey, envValue] = entries[i]

    await page.locator('input[placeholder="Key"]').nth(i).fill(envKey)
    await page.locator('input[placeholder="Value"]').nth(i).fill(envValue)
  }

  await wsPatchReceived

  return configBundleId
}
