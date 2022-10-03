import { ROUTE_VERIFICATION } from '@app/routes'
import { expect, test } from '@playwright/test'
import {
  createUser,
  deleteUserByEmail,
  kratosFromBaseURL,
  screenshotPath,
  USER_EMAIL,
  USER_PASSWORD,
} from './utils/common'

const VERIFYABLE_EMAIL = `v.${USER_EMAIL}`
const VERIFYABLE_PASSWORD = `v.${USER_PASSWORD}`

test.use({
  storageState: {
    cookies:[],
    origins: []
  }
})

test('should verify address', async ({ page }) => {
  await page.goto(ROUTE_VERIFICATION)

  await expect(page).toHaveURL('/auth/verify')
  await expect(page.locator('h1')).toContainText('Account verification')

  await page.screenshot({ path: screenshotPath('verify'), fullPage: true })
})

test.beforeAll(async ({ baseURL }) => {
  const kratos = kratosFromBaseURL(baseURL)
  createUser(kratos, VERIFYABLE_EMAIL, VERIFYABLE_PASSWORD)
})

test.afterAll(async ({ baseURL }) => {
  const kratos = kratosFromBaseURL(baseURL)
  deleteUserByEmail(kratos, VERIFYABLE_EMAIL)
})
