import { ROUTE_NODES } from '@app/routes'
import { expect, test } from '@playwright/test'
import { screenshotPath } from './utils/common'

test('After adding a new node the setup process should be shown', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill('PW_NEW_NODE')

  await page.screenshot({ path: screenshotPath('new-node'), fullPage: true })

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  const kubernetesCluster = await page.locator('button:has-text("Kubernetes Cluster")')
  const generateScript = await page.locator('button:has-text("Generate script")')

  await expect(dockerHost).toBeVisible()
  await expect(kubernetesCluster).toBeVisible()
  await expect(generateScript).toBeVisible()
})

test('Should not create the new node if the name already exist', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill('PW_NEW_NODE')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('p.text-error-red')

  const error = await page.locator('p.text-error-red')

  await expect(error).toContainText('Already exists')
})

test('Generate script should show the curl command and the script ', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_SCRIPT')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  await dockerHost.click()

  const rootPath = await page.locator('input[placeholder="Optional, leave empty for default paths"]')
  await expect(rootPath).toBeVisible()

  const generateScript = await page.locator('button:has-text("Generate script")')
  await generateScript.click()

  await page.waitForSelector('input[readonly]')

  await page.screenshot({ path: screenshotPath('node-script'), fullPage: true })

  const curl = await page.locator('input[readonly]')
  const script = await page.locator('textarea[readonly]')
  const timer = await page.locator('label.text-dyo-turquoise')
  const discardButton = await page.locator('button:has-text("Discard")').first()
  const copyButton = await page.locator('button:has-text("Copy")')

  await expect(curl).toBeVisible()
  await expect(curl).toHaveValue(/curl/)
  await expect(script).toBeVisible()
  await expect(timer).toBeVisible()
  await expect(discardButton).toBeVisible()
  await expect(copyButton).toBeVisible()
})
