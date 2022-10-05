import { ROUTE_LOGIN } from '@app/routes'
import { expect, test } from '@playwright/test'
import { screenshotPath, USER_EMAIL, USER_PASSWORD } from './utils/common'

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
})

test('without cookie should redirect to the login page', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(ROUTE_LOGIN)
  await expect(page.locator('h1')).toContainText('Log in')

  await page.screenshot({ path: screenshotPath('login'), fullPage: true })
})

test('sign up navigates to the register page', async ({ page }) => {
  await page.goto(ROUTE_LOGIN)

  await page.locator('"Sign up"').click()

  await expect(page).toHaveURL('/auth/register')
})

test('forgot password navigates to the recovery page', async ({ page }) => {
  await page.goto(ROUTE_LOGIN)

  await page.locator('"Forgot your password?"').click()

  await expect(page).toHaveURL('/auth/recovery')
  await expect(page.locator('h1')).toContainText('Account recovery')

  await page.screenshot({ path: screenshotPath('recovery'), fullPage: true })
})

test('should log in with valid credentials', async ({ page }) => {
  await page.goto(ROUTE_LOGIN)

  await page.locator('input[name=email]').fill(USER_EMAIL)
  await page.locator('input[name=password]').fill(USER_PASSWORD)

  await page.locator('button[type=submit]').click()

  await page.screenshot({ path: screenshotPath('login-successful'), fullPage: true })

  await expect(page).toHaveURL(`/products`)
})
