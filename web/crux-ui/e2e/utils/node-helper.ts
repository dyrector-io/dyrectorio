// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, Page } from '@playwright/test'
import { ExecOptions } from 'child_process'
import { DAGENT_NODE, execAsync, getExecOptions, screenshotPath, TEAM_ROUTES } from './common'
import { fillDeploymentPrefix } from './projects'

export const installDagent = async (page: Page) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.waitForTimeout(1000)

  page.addListener('framenavigated', frame => console.info('PW navigated', frame.url()))
  await page.locator('button:text-is("Add")').click()
  await page.waitForSelector('h4:text-is("New node")')

  await page.locator('input[name=name] >> visible=true').fill(DAGENT_NODE)

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)

  await page.waitForSelector('h4:has-text("Technology")')

  const generateScriptButton = await page.locator('button:has-text("Generate script")')
  await generateScriptButton.click()

  await page.waitForSelector('input[readonly]')

  await page.screenshot({ path: screenshotPath('node-dagent-script'), fullPage: true })

  const commandInput = await page.locator('input[readonly]')
  const curl = await commandInput.inputValue()

  const installOutput: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await execAsync(curl, getInstallScriptExecSettings(), storeCmdOutput(installOutput))

  try {
    await page.waitForSelector('div.bg-dyo-green')
  } catch (err) {
    console.info('[E2E] Agent install failed, script output:')
    installOutput.forEach(it => console.error(it))
    throw err
  }

  await page.screenshot({ path: screenshotPath('node-dagent-install-successful'), fullPage: true })
}

const waitForDeployment = async (page: Page) => {
  await page.waitForSelector('span:text-is("Successful"), span:text-is("Failed")', { timeout: 2 * 60 * 1000 })

  if (await page.isVisible('span:text-is("Failed")')) {
    await page.pause()
    throw new Error('Deployment failed')
  }
}

export const deployWithDagent = async (
  page: Page,
  prefix: string,
  projectId: string,
  versionId?: string,
  ignoreResult?: boolean,
  testName?: string,
): Promise<string> => {
  if (versionId) {
    await page.goto(TEAM_ROUTES.project.versions(projectId).details(versionId))
    await page.waitForSelector('h2:text-is("Versions")')
  } else {
    await page.goto(TEAM_ROUTES.project.details(projectId))
    await page.waitForSelector('h2:text-is("Projects")')
  }

  await page.locator('button:has-text("Add deployment")').click()

  await page.waitForSelector(`button:has-text("${DAGENT_NODE}")`)

  await page.locator(`button:has-text("${DAGENT_NODE}")`).click()

  await fillDeploymentPrefix(page, prefix)

  await page.locator('button:has-text("Add")').click()
  await page.waitForURL(`${TEAM_ROUTES.deployment.list()}/**`)

  const deploymentId = page.url().split('/').pop()

  const deploy = page.getByText('Deploy', {
    exact: true,
  })

  await deploy.click()
  await page.waitForURL(TEAM_ROUTES.deployment.deploy(deploymentId))

  if (ignoreResult) {
    return deploymentId
  }

  if (testName) {
    await page.waitForTimeout(1000)
    await page.screenshot({ path: screenshotPath(`dagent-deploy-after-1s-${testName}`), fullPage: true })
  }

  expect(page.url()).toContain(TEAM_ROUTES.deployment.deploy(deploymentId))

  await waitForDeployment(page)

  return deploymentId
}

export const deploy = async (
  page: Page,
  deploymentId: string,
  ignoreResult?: boolean,
  navigate?: boolean,
): Promise<string> => {
  if (navigate !== false) {
    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')
  }

  const deployButton = page.getByText('Deploy', {
    exact: true,
  })

  await deployButton.click()
  await page.waitForURL(TEAM_ROUTES.deployment.deploy(deploymentId))
  await page.waitForLoadState('networkidle')

  if (ignoreResult) {
    return deploymentId
  }

  expect(page.url()).toContain(TEAM_ROUTES.deployment.deploy(deploymentId))

  await waitForDeployment(page)

  return deploymentId
}

const getInstallScriptExecSettings = (): ExecOptions => ({
  ...getExecOptions(),
  ...(process.platform === 'darwin'
    ? {
        env: { ...process.env },
      }
    : process.platform === 'win32'
    ? null
    : {
        env: { ...process.env, ROOTLESS: 'true', PERSISTENCE_FOLDER: `${__dirname}/dagent` },
      }),
})

export const storeCmdOutput = (storage: string[]) => (err: Error, stdOut: string, stdErr: string) => {
  storage.push(stdOut)

  if (err) {
    storage.push(`${err.message} at ${err.stack}`)
  }

  if (stdErr) {
    storage.push(stdErr)
  }
}
