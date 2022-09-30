import { ROUTE_LOGIN, ROUTE_REGISTRIES } from '@app/routes'
import { expect, test } from '@playwright/test'
import { screenshotPath, USER_EMAIL, USER_PASSWORD } from './utils/common'

test('adding a new registry should work', async ({ page }) => {
  await page.goto(ROUTE_REGISTRIES)

  await page.locator('text=Add').click();
  await expect(page.locator('h4')).toContainText('New registry')

  await page.locator('input[name=name] >> visible=true').fill('TEST REGISTRY')
  await page.locator('form >> text=Docker Hub').click();
  await expect(await page.locator('label[for=imageNamePrefix]')).toContainText('Organization name or username')
  await page.locator('input[name=imageNamePrefix]').fill('library')

  await page.screenshot({ path: screenshotPath('registry_new_filled'), fullPage: true })

  await page.locator('text=Save').click();

  await page.waitForURL(ROUTE_REGISTRIES)

  await page.screenshot({ path: screenshotPath('registry_new'), fullPage: true })
})

test('minimum name length requirement should work', async ({ page }) => {
  await page.goto(ROUTE_REGISTRIES)

  await page.locator('text=Add').click();
  await expect(page.locator('h4')).toContainText('New registry')

  await page.locator('input[name=name]').fill('12')
  await page.locator('form >> text=Docker Hub').click();
  await expect(await page.locator('label[for=imageNamePrefix]')).toContainText('Organization name or username')
  await page.locator('input[name=imageNamePrefix]').fill('library')

  await page.locator('text=Save').click();

  await expect(await page.locator('p.text-error-red')).toContainText('name must be at least 3 characters')

  await page.screenshot({ path: screenshotPath('registry_new_name_length'), fullPage: true })
})