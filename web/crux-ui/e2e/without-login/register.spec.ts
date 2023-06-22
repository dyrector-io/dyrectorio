import { ROUTE_LOGIN, ROUTE_REGISTER, verificationUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { deleteUserByEmail, kratosFromBaseURL, screenshotPath, USER_EMAIL, USER_PASSWORD } from '../utils/common'

const REGISTERED_USER_EMAIL = `r.${USER_EMAIL}`
const REGISTERED_USER_PASSWORD = `r.${USER_PASSWORD}`
const REGISTERED_USER_FIRST_NAME = 'r.John'

test('should navigate to login when clicking on log in', async ({ page }) => {
  await page.goto(ROUTE_REGISTER)

  await page.locator('"Log in"').click()

  await expect(page).toHaveURL(ROUTE_LOGIN)
})

test('should register with eligible credentials', async ({ page }) => {
  await page.goto(ROUTE_REGISTER)

  await expect(page).toHaveURL(ROUTE_REGISTER)
  await expect(page.locator('h1')).toContainText('Sign up')

  await page.screenshot({ path: screenshotPath('register'), fullPage: true })

  await page.locator('input[name=email]').fill(REGISTERED_USER_EMAIL)
  await page.locator('input[name=password]').fill(REGISTERED_USER_PASSWORD)
  await page.locator('input[name=confirmPassword]').fill(REGISTERED_USER_PASSWORD)
  await page.locator('input[name=firstName]').fill(REGISTERED_USER_FIRST_NAME)

  await page.locator('button[type=submit]').click()

  await page.screenshot({ path: screenshotPath('register-successful'), fullPage: true })

  await expect(page).toHaveURL(verificationUrl(REGISTERED_USER_EMAIL))
})

test.afterAll(async ({ baseURL }) => {
  const kratos = kratosFromBaseURL(baseURL)
  deleteUserByEmail(kratos, REGISTERED_USER_EMAIL)
})
