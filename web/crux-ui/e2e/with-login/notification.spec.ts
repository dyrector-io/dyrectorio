import { expect, Page } from '@playwright/test'
import { test } from '../utils/test.fixture'
import { TEAM_ROUTES } from 'e2e/utils/common'

const testCreateNotification = async (page: Page, typeChipText: string, hookUrl: string) => {
  const notificationName = `TEST NOTIFICATION ${typeChipText.toUpperCase()}`

  await page.goto(TEAM_ROUTES.notification.list())
  await page.waitForSelector('h2:text-is("Notifications")')

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4')).toContainText('New notification')

  await page.locator('input[name=name] >> visible=true').fill(notificationName)
  await page.locator(`form >> text=${typeChipText}`).click()
  await page.locator('input[name=url]').fill(hookUrl)

  await page.locator('text=Save').click()

  await page.waitForURL(TEAM_ROUTES.notification.list())
  await page.waitForSelector('h2:text-is("Notifications")')

  await expect(page.locator(`h3:text("${notificationName}")`)).toHaveCount(1)
}

test('adding a new discord notification should work', async ({ page }) => {
  await testCreateNotification(
    page,
    'Discord',
    'https://discord.com/api/webhooks/0000000000000000000/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  )
})

test('adding a new slack notification should work', async ({ page }) => {
  await testCreateNotification(
    page,
    'slack',
    'https://hooks.slack.com/services/T0000000000/B0000000000/XXXXXXXXXXXXXXXXXXXXXXXX',
  )
})

test('adding a new teams notification should work', async ({ page }) => {
  await testCreateNotification(
    page,
    'teams',
    'https://xxxxxxxx.webhook.office.com/webhookb2/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa@aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/IncomingWebhook/',
  )
})

test('using an incorrect discord webhook url should give an error', async ({ page }) => {
  await testCreateNotification(page, 'Discord', 'https://discord.com/invalid/webhook')

  await expect(await page.locator('p.text-error-red')).toContainText('https://discord(app).com/api/webhooks/ID/TOKEN')
})

test('using an incorrect slack webhook url should give an error', async ({ page }) => {
  await testCreateNotification(page, 'slack', 'https://hooks.slack.com/invalid/test')

  await expect(await page.locator('p.text-error-red')).toContainText(
    'https://hooks.slack.com/services/T0000000000/B0000000000/XXXXXXXXXXXXXXXXXXXXXXXX/',
  )
})

test('using an incorrect teams webhook url should give an error', async ({ page }) => {
  await testCreateNotification(page, 'teams', 'https://test.invalid.office.com/test')

  await expect(await page.locator('p.text-error-red')).toContainText(
    'https://subdomain.webhook.office.com/webhookb2/GUID/IncomingWebhook/',
  )
})
