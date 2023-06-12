import { ProjectType } from '@app/models'
import { projectUrl, ROUTE_DASHBOARD, ROUTE_TEAMS } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { DAGENT_NODE, NGINX_TEST_IMAGE_WITH_TAG, USER_FULLNAME } from './utils/common'
import { createNode } from './utils/nodes'
import {
  addDeploymentToVersion,
  addDeploymentToVersionlessProject,
  addImageToVersion,
  addImageToVersionlessProject,
  createProject,
  createVersion,
} from './utils/projects'

const setup = async (
  page: Page,
  nodeName: string,
  projectName: string,
  type: ProjectType = 'versionless',
): Promise<{ nodeId: string; projectId: string }> => {
  const nodeId = await createNode(page, nodeName)
  const projectId = await createProject(page, projectName, type)

  return {
    nodeId,
    projectId,
  }
}

test('Can create multiple preparings to the same node with different prefixes', async ({ page }) => {
  const nodeName = 'NodeMultiPrefixes'
  const projectName = 'MultiPrefixesProject'
  const prefixOne = 'prefix-one'
  const prefixOther = 'prefix-other'

  const { projectId } = await setup(page, nodeName, projectName)
  await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
  const one = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefixOne)
  const other = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefixOther)

  await page.goto(one.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)

  await page.goto(other.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOther}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOther}")`)).toHaveCount(1)
})

test('Can not create multiple preparings to the same node with the same prefix', async ({ page }) => {
  const nodeName = 'NodePrefixCollision'
  const projectName = 'NodePrefixCollision'
  const prefixOne = 'prefix-one'

  const { projectId } = await setup(page, nodeName, projectName)
  await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
  const one = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefixOne)
  await page.goto(one.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)

  const other = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefixOne)

  expect(other.id, one.id)
  await page.goto(other.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)
})

test('Cannot create multiple deployments with the same node and prefix for a rolling version', async ({ page }) => {
  const projectName = 'RollingNodePrefixCollision'
  const versionName = '1.0.0'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Rolling')

  await addImageToVersion(page, projectId, versionId, 'nginx')

  const { url: firstDeploymentUrl } = await addDeploymentToVersion(
    page,
    projectId,
    versionId,
    DAGENT_NODE,
    'test-prefix',
  )

  const { url: secondDeploymentUrl } = await addDeploymentToVersion(
    page,
    projectId,
    versionId,
    DAGENT_NODE,
    'test-prefix',
  )

  await expect(page.url()).toEqual(firstDeploymentUrl)
  await expect(firstDeploymentUrl).toEqual(secondDeploymentUrl)
})

test('Select first node when adding a deployment if only one node exists', async ({ page }) => {
  const teamName = 'testDeploymentTeam'
  const projectName = 'deploymentNodeSelector'
  const nodeName = 'node0'

  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4:has-text("Create new team")')).toHaveCount(1)
  await page.locator('input[name=name] >> visible=true').type(teamName)
  await page.locator('button:has-text("Save")').click()

  await expect(page.locator(`h4:has-text("${teamName}")`)).toHaveCount(1)

  await page.goto(ROUTE_TEAMS)
  await page.locator(`label:has-text("${USER_FULLNAME}")`).click()
  await page.locator(`div:has-text("${teamName}"):right-of(img[alt="Team's avatar"])`).click()

  await page.waitForURL(ROUTE_DASHBOARD)

  const { projectId } = await setup(page, nodeName, projectName)
  await addImageToVersionlessProject(page, projectId, 'nginx')

  await page.goto(projectUrl(projectId))

  await page.locator('button:has-text("Add deployment")').click()
  await expect(page.locator('h4:has-text("Add deployment")')).toHaveCount(1)

  await expect(page.locator(`button:has-text("${nodeName}")`)).toHaveClass(/bg-dyo-turquoise/)
})
