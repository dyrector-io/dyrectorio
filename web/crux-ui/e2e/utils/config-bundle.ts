import { PatchConfigMessage, WS_TYPE_PATCH_CONFIG } from '@app/models'
import { Page, expect } from '@playwright/test'
import { TEAM_ROUTES } from './common'
import { waitSocketRef, wsPatchSent } from './websocket'

const matchPatchEnvironment = (expected: Record<string, string>) => (message: PatchConfigMessage) =>
  Object.entries(expected).every(([key, value]) =>
    message.config?.environment?.find(it => it.key === key && it.value === value),
  )

// eslint-disable-next-line import-x/prefer-default-export
export const createConfigBundle = async (page: Page, name: string, data: Record<string, string>): Promise<string> => {
  await page.goto(TEAM_ROUTES.configBundle.list())
  await page.waitForSelector('h2:text-is("Config bundles")')

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4')).toContainText('New config bundle')
  await page.locator('input[name=name] >> visible=true').fill(name)

  await page.locator('text=Save').click()
  await page.waitForURL(`${TEAM_ROUTES.configBundle.list()}/**`)
  await page.waitForSelector(`h3:text-is("${name}")`)

  const configBundleId = page.url().split('/').pop()

  const sock = waitSocketRef(page)
  await page.locator('button:has-text("Config")').click()
  await page.waitForURL(TEAM_ROUTES.containerConfig.details('**'))

  const configId = page.url().split('/').pop()

  const ws = await sock
  const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(configId)

  await page.locator('button:has-text("Environment")').click()

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
