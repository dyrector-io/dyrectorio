import { productUrl, ROUTE_NODES, versionUrl } from '@app/routes'
import { Page } from '@playwright/test'
import { exec, ExecOptions } from 'child_process'
import { DAGENT_NODE, screenshotPath } from './common'

export const installDagent = async (page: Page) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill(DAGENT_NODE)

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
}

export const deployWithDagent = async (
  page: Page,
  prefix: string,
  productId: string,
  versionId?: string,
  ignoreResult?: boolean,
) => {
  if (versionId) {
    await page.goto(versionUrl(productId, versionId))
  } else {
    await page.goto(productUrl(productId))
  }

  await page.locator('button:has-text("Add deployment")').click()

  await page.waitForSelector(`button:has-text("${DAGENT_NODE}")`)

  await page.locator(`button:has-text("${DAGENT_NODE}")`).click()

  await page.locator('input[name=prefix]').fill(prefix)

  await page.locator('button:has-text("Add")').click()

  await page.waitForNavigation()

  await page.locator('button:has-text("Deploy")').click()

  await page.waitForNavigation()

  if (!ignoreResult) {
    await page.waitForSelector('div.bg-dyo-green:has-text("Successful")')
  }
}

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
