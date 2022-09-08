/* eslint-disable import/no-extraneous-dependencies */
import { ROUTE_LOGIN, ROUTE_PRODUCTS, ROUTE_TEAMS_CREATE, verificationUrl } from '@app/routes'
import { chromium, FullConfig } from '@playwright/test'
import {
  createUser,
  extractKratosLinkFromMail,
  kratosFromConfig,
  mailslurpFromConfig,
  screenshotPath,
  USER_EMAIL,
  USER_PASSWORD,
  USER_TEAM,
} from './common'
import globalTeardown from './global-teardown'

const globalSetup = async (config: FullConfig) => {
  await globalTeardown(config)

  const kratos = kratosFromConfig(config)
  await createUser(kratos, USER_EMAIL, USER_PASSWORD)

  const { baseURL, storageState } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage({
    baseURL,
  })

  await page.goto(verificationUrl(USER_EMAIL))
  await page.locator('button[type=submit]').click()

  await page.waitForTimeout(1000)
  const mailSlurper = mailslurpFromConfig(config)
  const mail = await mailSlurper.getAndDelete({
    toAddress: USER_EMAIL,
  })
  const verificationLink = extractKratosLinkFromMail(mail.body)

  await page.goto(verificationLink)
  await page.waitForURL(ROUTE_LOGIN)
  await page.locator('input[name=email]').fill(USER_EMAIL)
  await page.locator('input[name=password]').fill(USER_PASSWORD)
  await page.locator('button[type=submit]').click()

  await page.waitForURL(ROUTE_TEAMS_CREATE)
  await page.locator('input[name=name]').fill(USER_TEAM)
  await page.locator('button[type=submit]').click()

  await page.screenshot({ path: screenshotPath('cica'), fullPage: true })
  await page.waitForURL(ROUTE_PRODUCTS)

  await page.context().storageState({ path: storageState as string })

  await browser.close()
}

export default globalSetup
