import { ROUTE_LOGIN, ROUTE_VERIFICATION } from '@app/routes'
import { expect, test as base } from '@playwright/test'
import {
  createUser,
  deleteUserByEmail,
  extractKratosLinkFromMail,
  kratosFromBaseURL,
  mailslurperFromBaseURL,
  screenshotPath,
  USER_PASSWORD,
} from '../utils/common'

const VERIFYABLE_PASSWORD = `v.${USER_PASSWORD}`

type VerifyFixture = {
  email: string
}

let emailIndex = 0

const test = base.extend<VerifyFixture>({
  email: async ({ acceptDownloads: _ }, use) => {
    await use(`${emailIndex++}.verify@example.com`)
  },
})

test('should be able to navigate to verify without cookie', async ({ page }) => {
  await page.goto(ROUTE_VERIFICATION)

  await expect(page).toHaveURL('/auth/verify')
  await expect(page.locator('h1')).toContainText('Account verification')
})

test('should verify address', async ({ baseURL, page, email }) => {
  await page.goto(ROUTE_VERIFICATION)

  await expect(page).toHaveURL('/auth/verify')
  await expect(page.locator('h1')).toContainText('Account verification')

  await page.goto(ROUTE_VERIFICATION)
  await page.locator('input[name=email]').fill(email)
  await page.locator('button[type=submit]').click()
  await page.screenshot({ path: screenshotPath('verify-email'), fullPage: true })

  await page.waitForTimeout(1000)
  const mailSlurper = mailslurperFromBaseURL(baseURL)
  const mail = await mailSlurper.getMail({
    toAddress: email,
  })

  const verificationLink = extractKratosLinkFromMail(mail.body)
  const code = new URL(verificationLink).searchParams.get('code')
  expect(code).not.toBeNull()

  await page.locator('input[name=code]').fill(code)
  await page.locator('button[type=submit]').click()

  await page.screenshot({ path: screenshotPath('verify-code'), fullPage: true })

  await page.waitForURL(ROUTE_LOGIN)
  await expect(page.locator('h1')).toContainText('Log in')
})

test.beforeEach(async ({ baseURL, email }) => {
  const kratos = kratosFromBaseURL(baseURL)
  createUser(kratos, email, VERIFYABLE_PASSWORD)
})

test.afterEach(async ({ baseURL, email }) => {
  const kratos = kratosFromBaseURL(baseURL)
  deleteUserByEmail(kratos, email)
})
