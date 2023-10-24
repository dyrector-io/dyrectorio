import { expect, test } from '@playwright/test'
import { TEAM_ROUTES } from 'e2e/utils/common'
import { createConfigBundle } from 'e2e/utils/config-bundle'

test('Creating a config bundle', async ({ page }) => {
  const BUNDLE_NAME = 'test-bundle'

  const ENV_KEY = 'BUNDLE_KEY'
  const ENV_VALUE = 'bundle-value'

  const configBundleId = await createConfigBundle(page, BUNDLE_NAME, {
    [ENV_KEY]: ENV_VALUE,
  })

  await page.goto(TEAM_ROUTES.configBundles.details(configBundleId))

  const keyInput = page.locator('input[placeholder="Key"]').first()
  await expect(keyInput).toBeDisabled()
  await expect(keyInput).toHaveValue(ENV_KEY)

  const valueInput = page.locator('input[placeholder="Value"]').first()
  await expect(valueInput).toBeDisabled()
  await expect(valueInput).toHaveValue(ENV_VALUE)
})
