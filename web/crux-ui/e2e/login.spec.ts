import { expect, test } from '@playwright/test'
import { screenshotPath } from './common'

test('without cookie should redirect to the login page', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL('/auth/login')
  await expect(page.locator('h1')).toContainText('Log in')

  await page.screenshot({ path: screenshotPath('login'), fullPage: true })
})
