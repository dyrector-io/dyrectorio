import { ROUTE_NODES, versionUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { exec, ExecOptions } from 'child_process'
import { screenshotPath } from './utils/common'
import { createImage, createProduct, createVersion } from './utils/products'

const prefix = 'e2e-deploy'
const prefixTwo = 'second-deploy'
const nodeName = 'PW_DEPLOY'
const imageName = 'nginx'

const logCmdOutput = (err: Error, stdOut: string, stdErr: string, logStdOut?: boolean) => {
  if (logStdOut) {
    console.info(stdOut)
  }

  if (err) {
    console.error(err)
  }

  if (stdErr) {
    console.error(stdErr)
  }
}

const getInstallScriptExecSettings = (): ExecOptions => {
  switch (process.platform) {
    case 'darwin':
      return {
        env: { ...process.env },
      }
    case 'win32':
      return {
        shell: 'C:\\Program Files\\git\\git-bash.exe',
      }
    default:
      return {
        env: { ...process.env, ROOTLESS: 'true', PERSISTENCE_FOLDER: `${__dirname}/dagent` },
      }
  }
}

const deploy = async (page: Page, productId: string, versionId: string, prefix: string) => {
  await page.goto(versionUrl(productId, versionId))

  await page.locator('button:has-text("Add deployment")').click()

  await page.waitForSelector(`button:has-text("${nodeName}")`)

  await page.locator(`button:has-text("${nodeName}")`).click()

  await page.locator('input[name=prefix]').fill(prefix)

  await page.locator('button:has-text("Add")').click()

  await page.waitForNavigation()

  await page.locator('button:has-text("Deploy")').click()

  await page.waitForNavigation()

  await page.waitForSelector('div:has-text("Successful")')
}

test('Install dagent should be successful', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill(nodeName)

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const generateScriptButton = await page.locator('button:has-text("Generate script")')
  await generateScriptButton.click()

  await page.waitForSelector('input[readonly]')

  await page.screenshot({ path: screenshotPath('node-dagent-script'), fullPage: true })

  const commandInput = await page.locator('input[readonly]')
  const curl = await commandInput.inputValue()

  exec(curl, getInstallScriptExecSettings(), logCmdOutput)

  await page.waitForSelector('img[src="/circle-green.svg"]')

  await page.screenshot({ path: screenshotPath('node-dagent-install-succesful'), fullPage: true })

  await expect(await page.locator('span.text-light-eased:has-text("Running")').first()).toContainText('Running')
})

test('Deploy to node should be successful', async ({ page }) => {
  const productId = await createProduct(page, 'PW-DEPLOY-TEST', 'Complex')
  const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
  await createImage(page, productId, versionId, imageName)

  await deploy(page, productId, versionId, prefix)

  await page.screenshot({ path: screenshotPath('successful-deployment'), fullPage: true })

  await expect(await page.locator('.bg-dyo-green').first()).toContainText('Successful')
})

test('Second successful deployment should make the first deployment obsolete', async ({ page }) => {
  const productId = await createProduct(page, 'PW-OBSOLETE', 'Complex')
  const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
  await createImage(page, productId, versionId, imageName)

  await deploy(page, productId, versionId, prefixTwo)

  await expect(await page.locator('.bg-dyo-green').first()).toContainText('Successful')

  await deploy(page, productId, versionId, prefixTwo)

  await expect(await page.locator('.bg-dyo-green').first()).toContainText('Successful')

  await page.goto(versionUrl(productId, versionId, { section: 'deployments' }))

  await page.screenshot({ path: screenshotPath('deployment-should-be-obsolete'), fullPage: true })

  const deploymentsTableBody = await page.locator('.table-row-group')
  const deploymentsRows = await deploymentsTableBody.locator('.table-row')
  await expect(deploymentsRows).toHaveCount(2)
  await expect(await page.locator('.bg-dyo-purple')).toHaveCount(1)
  await expect(await page.locator('.bg-dyo-green')).toHaveCount(1)
})

test.afterAll(() => {
  const settings: ExecOptions =
    process.platform === 'win32'
      ? {
          shell: 'C:\\Program Files\\git\\git-bash.exe',
        }
      : null

  exec(`docker rm -f ${prefix}-${imageName}`, settings)
  exec(`docker rm -f ${prefixTwo}-${imageName}`, settings)
  exec('docker rm -f dagent', settings)
})
