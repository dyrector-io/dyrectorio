import { ROUTE_LOGIN, ROUTE_TEAMS_CREATE } from '@app/routes'
import { expect } from '@playwright/test'
import { createUser, deleteUserByEmail, kratosFromConfig, screenshotPath } from '../utils/common'
import { test } from '../utils/test.fixture'

const LOGIN_TEST_USER = 'test-login@example.com'
const LOGIN_TEST_PASSWORD = 'TestPw23234'

// NOTE(@robot9706): beforeAll runs on each worker, so if tests are running in parallel beforeAll executes multiple times
test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ baseURL }) => {
  const kratos = kratosFromConfig(baseURL)

  try {
    await deleteUserByEmail(kratos, LOGIN_TEST_USER)
  } catch {
    /* empty */
  }

  await createUser(kratos, LOGIN_TEST_USER, LOGIN_TEST_PASSWORD, { verified: true })
})

test.afterAll(async ({ baseURL }) => {
  const kratos = kratosFromConfig(baseURL)
  await deleteUserByEmail(kratos, LOGIN_TEST_USER)
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

test('recovery navigates to the recovery page', async ({ page }) => {
  await page.goto(ROUTE_LOGIN)

  await page.locator('"Recovery"').click()

  await expect(page).toHaveURL('/auth/recovery')
  await expect(page.locator('h1')).toContainText('Account recovery')

  await page.screenshot({ path: screenshotPath('recovery'), fullPage: true })
})

test('should log in with valid credentials', async ({ page }) => {
  await page.goto(ROUTE_LOGIN)

  await page.locator('input[name=email]').fill(LOGIN_TEST_USER)
  await page.locator('input[name=password]').fill(LOGIN_TEST_PASSWORD)

  await page.locator('button[type=submit]').click()

  await page.screenshot({ path: screenshotPath('login-successful'), fullPage: true })

  await expect(page).toHaveURL(ROUTE_TEAMS_CREATE)
})
