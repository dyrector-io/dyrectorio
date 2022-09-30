import { ROUTE_NOTIFICATIONS, ROUTE_REGISTRIES } from '@app/routes'
import { expect, Page, test } from '@playwright/test'

const testCreateNotification = async (page: Page, typeChipText: string, hookUrl: string) => {
  await page.goto(ROUTE_NOTIFICATIONS)
  await page.waitForURL(ROUTE_NOTIFICATIONS)

  await page.locator('button:has-text("Add")').click();
  await expect(page.locator('h4')).toContainText('New notification')

  await page.locator('input[name=name] >> visible=true').fill('TEST NOTIFICATION ' + typeChipText.toUpperCase())
  await page.locator(`form >> text=${typeChipText}`).click();
  await page.locator('input[name=url]').fill(hookUrl)

  await page.locator('text=Save').click();
}

test('adding a new discord notification should work', async ({ page }) => {
  await testCreateNotification(page, 'Discord', 'https://discord.com/api/webhooks/test')

  await page.waitForURL(ROUTE_NOTIFICATIONS)
})

test('adding a new slack notification should work', async ({ page }) => {
  await testCreateNotification(page, 'slack', 'https://hooks.slack.com/services/test')

  await page.waitForURL(ROUTE_NOTIFICATIONS)
})

test('adding a new teams notification should work', async ({ page }) => {
  await testCreateNotification(page, 'teams', 'https://test.webhook.office.com/test')

  await page.waitForURL(ROUTE_NOTIFICATIONS)
})

test('using an incorrect discord webhook url should give an error', async ({ page }) => {
  await testCreateNotification(page, 'Discord', 'https://discord.com/invalid/webhook')

  await expect(await page.locator('p.text-error-red')).toContainText('url must match the following: "/^https:\\/\\/(discord|discordapp).com\\/api\\/webhooks/"')
})

test('using an incorrect slack webhook url should give an error', async ({ page }) => {
  await testCreateNotification(page, 'slack', 'https://hooks.slack.com/invalid/test')

  await expect(await page.locator('p.text-error-red')).toContainText('url must match the following: "/^https:\\/\\/hooks.slack.com\\/services/"')
})

test('using an incorrect teams webhook url should give an error', async ({ page }) => {
  await testCreateNotification(page, 'teams', 'https://test.invalid.office.com/test')

  await expect(await page.locator('p.text-error-red')).toContainText('url must match the following: "/^https:\\/\\/[a-zA-Z]+.webhook.office.com/"')
})
