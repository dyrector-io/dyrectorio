import { expect } from '@playwright/test'
import { test } from '../utils/test.fixture'
import { DAGENT_NODE, NGINX_TEST_IMAGE_WITH_TAG, screenshotPath, TEAM_ROUTES } from '../utils/common'
import { deployWithDagent } from '../utils/node-helper'
import {
  addDeploymentToVersionlessProject,
  addImageToVersionlessProject,
  createImage,
  createProject,
  createVersion,
} from '../utils/projects'

const PREFIX = 'first'
const PREFIX_TWO = 'second'

test('Deploy to node should be successful', async ({ page }, testInfo) => {
  const projectId = await createProject(page, 'deploy-test', 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)

  await deployWithDagent(page, PREFIX, projectId, versionId, false, testInfo.title)

  await page.screenshot({ path: screenshotPath('succ-deployment'), fullPage: true })

  const deployStatus = page.getByText('Successful')
  await deployStatus.waitFor()

  await expect(deployStatus).toHaveCount(1)
})

test('Second successful deployment should make the first deployment obsolete', async ({ page }, testInfo) => {
  const projectId = await createProject(page, 'obsolete', 'versioned')
  const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)

  await deployWithDagent(page, PREFIX_TWO, projectId, versionId, false, `${testInfo.title}1`)

  const firstDeployStatus = await page.getByText('Successful')
  await expect(firstDeployStatus).toHaveCount(1)

  await deployWithDagent(page, PREFIX_TWO, projectId, versionId, false, `${testInfo.title}2`)

  const secondDeployStatus = await page.getByText('Successful')
  await expect(secondDeployStatus).toHaveCount(1)

  await page.goto(TEAM_ROUTES.project.versions(projectId).details(versionId, { section: 'deployments' }))
  await page.waitForSelector('h2:text-is("Versions")')
  await page.screenshot({ path: screenshotPath('deployment-should-be-obsolete'), fullPage: true })

  await page.pause()

  const deploymentsRows = await page.locator('table.w-full >> tbody >> tr')

  await expect(deploymentsRows).toHaveCount(2)

  const successfulDeployment = await deploymentsRows.getByText('Successful', { exact: true })
  const obsoleteDeployment = await deploymentsRows.getByText('Obsolete', { exact: true })

  await page.screenshot({ path: screenshotPath('deployment-should-be-obsolete-2'), fullPage: true })
  await expect(successfulDeployment).toHaveCount(1)
  await expect(obsoleteDeployment).toHaveCount(1)
})

test('Container log should appear after a successful deployment', async ({ page }) => {
  const prefix = 'deploy-log'
  const imageName = 'nginx'

  const projectId = await createProject(page, 'deploy-log-test', 'versionless')
  await addImageToVersionlessProject(page, projectId, imageName)
  const { url, id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, DAGENT_NODE, { prefix })

  await page.goto(url)
  await page.waitForSelector('h2:text-is("Deployments")')

  const deployButtonSelector = 'button:text-is("Deploy")'
  await page.waitForSelector(deployButtonSelector)

  await page.locator(deployButtonSelector).click()
  await page.waitForURL(TEAM_ROUTES.deployment.deploy(deploymentId))
  await page.waitForSelector('h2:text-is("Deployments")')

  const containerRow = page.locator(`div:text-is("${imageName}") >> xpath=../..`)
  await expect(containerRow).toBeVisible()

  const runningTag = containerRow.locator(':text-is("Running")')
  await expect(runningTag).toBeVisible()

  const showLogs = containerRow.locator('[src="/note.svg"]')

  await showLogs.click()
  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**/log**`)
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.waitForSelector('div.font-roboto')
  const terminal = page.locator('div.font-roboto')
  await expect(await terminal.locator('span')).not.toHaveCount(0)
})

test('Container log should appear on a node container', async ({ page }) => {
  const prefix = 'node-deploy-log'
  const imageName = 'nginx'

  const porjectId = await createProject(page, 'node-deploy-log-test', 'versionless')
  await addImageToVersionlessProject(page, porjectId, imageName)
  const { url, id: deploymentId } = await addDeploymentToVersionlessProject(page, porjectId, DAGENT_NODE, { prefix })

  await page.goto(url)
  await page.waitForSelector('h2:text-is("Deployments")')

  const deployButtonSelector = 'button:text-is("Deploy")'
  await page.waitForSelector(deployButtonSelector)

  await page.locator(deployButtonSelector).click()
  await page.waitForURL(TEAM_ROUTES.deployment.deploy(deploymentId))
  await page.waitForSelector('h2:text-is("Deployments")')

  const containerRow = await page.locator(`div:text-is("${imageName}") >> xpath=../..`)
  await expect(containerRow).toBeVisible()

  const runningTag = await containerRow.locator(':text-is("Running")')
  await expect(runningTag).toBeVisible()

  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.waitForSelector('button:text-is("Containers")')
  await page.locator('input[placeholder="Search"]').type(`pw-${prefix}-${imageName}`)

  const nodeContainerRow = await page.locator(`td:text-is("pw-${prefix}-${imageName}") >> xpath=../..`)
  await expect(nodeContainerRow).toHaveCount(1)

  const logButton = await nodeContainerRow.locator('img[src*="/note.svg"]')
  await expect(logButton).toBeVisible()

  const nodeId = page.url().split('/').pop()

  await logButton.click()
  await page.waitForURL(
    TEAM_ROUTES.node.containerLog(nodeId, {
      name: `pw-${prefix}-${imageName}`,
    }),
  )
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.waitForSelector('div.font-roboto')
  const terminal = await page.locator('div.font-roboto')
  await expect(await terminal.locator('span')).not.toHaveCount(0)
})

test('Container list should show containers on the node screen', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('input[placeholder="Search"]').type(`dagent`)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  const nodeContainerRow = await page.locator('table.w-full >> tbody >> tr')
  await nodeContainerRow.nth(0).waitFor()

  const containerRows = await nodeContainerRow.count()

  await expect(containerRows).toBeGreaterThanOrEqual(1)
})
