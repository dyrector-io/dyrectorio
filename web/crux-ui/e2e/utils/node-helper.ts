// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test, Page } from '@playwright/test'
import { exec, ExecOptions } from 'child_process'
import { DAGENT_NODE, screenshotPath, TEAM_ROUTES } from './common'
import { fillDeploymentPrefix } from './projects'

export const installDagent = async (page: Page) => {
  await page.goto(TEAM_ROUTES.node.list())

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

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  exec(curl, getInstallScriptExecSettings(), logCmdOutput)

  await page.waitForSelector('div.bg-dyo-green')

  await page.screenshot({ path: screenshotPath('node-dagent-install-successful'), fullPage: true })
}

const waitForDeployment = async (page: Page) => {
  await page.waitForSelector('span:text-is("Successful"), span:text-is("Failed")')

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
  } else {
    await page.goto(TEAM_ROUTES.project.details(projectId))
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
  }

  const deploy = page.getByText('Deploy', {
    exact: true,
  })

  await deploy.click()
  await page.waitForURL(TEAM_ROUTES.deployment.deploy(deploymentId))

  if (ignoreResult) {
    return deploymentId
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
  }

  const deploy = page.getByText('Deploy', {
    exact: true,
  })

  await deploy.click()
  await page.waitForURL(TEAM_ROUTES.deployment.deploy(deploymentId))

  if (ignoreResult) {
    return deploymentId
  }

  expect(page.url()).toContain(TEAM_ROUTES.deployment.deploy(deploymentId))

  await waitForDeployment(page)

  return deploymentId
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
