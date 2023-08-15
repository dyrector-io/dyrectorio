import { TEAM_ROUTES } from './common'
import { Page, expect } from '@playwright/test'
import { waitSocket, waitSocketReceived } from './websocket'
import { WS_TYPE_PATCH_RECEIVED } from '@app/models'

export const createConfigBundle = async (page: Page, name: string, data: Record<string, string>): Promise<string> => {
  await page.goto(TEAM_ROUTES.configBundles.list())
  await page.waitForURL(TEAM_ROUTES.configBundles.list())

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4')).toContainText('New config bundle')
  await page.locator('input[name=name] >> visible=true').fill(name)

  const sock = waitSocket(page)
  await page.locator('text=Save').click()
  await page.waitForURL(`${TEAM_ROUTES.configBundles.list()}/**`)

  const configBundleId = page.url().split('/').pop()

  const ws = await sock
  const wsRoute = TEAM_ROUTES.configBundles.detailsSocket(configBundleId)

  await expect(page.locator(`h4:text-is("View ${name}")`)).toHaveCount(1)

  await page.locator('button:has-text("Edit")').click()

  const wsPatchReceived = waitSocketReceived(ws, wsRoute, WS_TYPE_PATCH_RECEIVED)

  const entries = Object.entries(data)
  for (let i = 0; i < entries.length; i++) {
    const [envKey, envValue] = entries[i]

    await page.locator('input[placeholder="Key"]').nth(i).fill(envKey)
    await page.locator('input[placeholder="Value"]').nth(i).fill(envValue)
  }

  await wsPatchReceived

  return configBundleId
}
