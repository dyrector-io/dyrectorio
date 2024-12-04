import { ProjectType, WS_TYPE_PATCH_RECEIVED } from '@app/models'
import { expect, Page } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { DAGENT_NODE, NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES } from '../../utils/common'
import { createNode } from '../../utils/nodes'
import {
  addDeploymentToVersion,
  addDeploymentToVersionlessProject,
  addImageToVersion,
  addImageToVersionlessProject,
  createProject,
  createVersion,
  fillDeploymentPrefix,
} from '../../utils/projects'
import { createConfigBundle } from 'e2e/utils/config-bundle'
import { waitSocketRef, waitSocketReceived } from 'e2e/utils/websocket'
import { deploy } from 'e2e/utils/node-helper'

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
  const one = await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix: prefixOne })
  const other = await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix: prefixOther })

  await page.goto(one.url)
  await page.waitForSelector('h2:text-is("Deployments")')
  await page.waitForSelector(`label:has-text("Prefix: pw-${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: pw-${prefixOne}")`)).toHaveCount(1)

  await page.goto(other.url)
  await page.waitForSelector('h2:text-is("Deployments")')
  await page.waitForSelector(`label:has-text("Prefix: pw-${prefixOther}")`)
  await expect(await page.locator(`label:has-text("Prefix: pw-${prefixOther}")`)).toHaveCount(1)
})

test('Can not create multiple preparings to the same node with the same prefix', async ({ page }) => {
  const nodeName = 'NodePrefixCollision'
  const projectName = 'NodePrefixCollision'
  const prefixOne = 'prefix-one'

  const { projectId } = await setup(page, nodeName, projectName)
  await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
  const one = await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix: prefixOne })
  await page.goto(one.url)
  await page.waitForSelector('h2:text-is("Deployments")')
  await page.waitForSelector(`label:has-text("Prefix: pw-${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: pw-${prefixOne}")`)).toHaveCount(1)

  const other = await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix: prefixOne })

  expect(other.id, one.id)
  await page.goto(other.url)
  await page.waitForSelector('h2:text-is("Deployments")')
  await page.waitForSelector(`label:has-text("Prefix: pw-${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: pw-${prefixOne}")`)).toHaveCount(1)
})

test('Cannot create multiple deployments with the same node and prefix for a rolling version', async ({ page }) => {
  const projectName = 'RollingNodePrefixCollision'
  const versionName = '1.0.0'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Rolling')

  await addImageToVersion(page, projectId, versionId, 'nginx')

  const { url: firstDeploymentUrl } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, {
    prefix: 'test-prefix',
  })

  const { url: secondDeploymentUrl } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, {
    prefix: 'test-prefix',
  })

  await expect(page.url()).toEqual(firstDeploymentUrl)
  await expect(firstDeploymentUrl).toEqual(secondDeploymentUrl)
})

test('Can create from deployments page', async ({ page }) => {
  const projectName = 'FullDeploymentCreate'
  const versionName = '1.0.0'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Rolling')
  await addImageToVersion(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)

  await page.goto(TEAM_ROUTES.deployment.list())
  await expect(page.locator('h2:has-text("Deployments")')).toBeVisible()

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4:has-text("Add")')).toBeVisible()

  await page.locator(`button:has-text("${DAGENT_NODE}")`).first().click()
  await page.locator(`button:has-text("${projectName}")`).click()
  await page.locator(`button:has-text("${versionName}")`).click()
  await fillDeploymentPrefix(page, projectName.toLowerCase())

  await page.locator('button:has-text("Add")').click()

  await page.waitForURL(`${TEAM_ROUTES.deployment.list()}/**`)
  await page.waitForSelector('h2:text-is("Deployments")')
  await expect(page.locator('span:has-text("Preparing")').first()).toBeVisible()
})

test('Select specific instances to deploy', async ({ page }) => {
  const projectName = 'select-instance'
  const prefix = projectName

  const projectId = await createProject(page, projectName, 'versionless')

  await addImageToVersionlessProject(page, projectId, 'nginx')
  await addImageToVersionlessProject(page, projectId, 'redis')

  const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, DAGENT_NODE, { prefix })

  const instanceRow = await page.locator('table.w-full >> tbody >> tr')

  await instanceRow.locator('img[alt="check"]:left-of(td:text-is("redis"))').click()

  await deploy(page, deploymentId, false, false)

  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('input[placeholder="Search"]').type(DAGENT_NODE)
  await page.click(`h3:has-text("${DAGENT_NODE}")`)

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.waitForSelector('button:text-is("Containers")')
  await page.locator('input[placeholder="Search"]').type(prefix)

  const nodeContainerRow = await page.locator('table.w-full >> tbody >> tr')
  await expect(nodeContainerRow).toHaveCount(1)
})

test('Incremental versions should keep config bundle environment after a successful deployment', async ({ page }) => {
  const bundleName = 'IncrementalConfigBundle'
  const projectName = 'IncrementalConfigBundleProject'
  const versionName = '1.0.0'

  const BUNDLE_ENV = 'BUNDLE_ENV'
  const BUNDLE_VALUE = 'BUNDLE_VALUE'

  await createConfigBundle(page, bundleName, {
    [BUNDLE_ENV]: BUNDLE_VALUE,
  })

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')

  await addImageToVersion(page, projectId, versionId, 'nginx')

  const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

  const sock = waitSocketRef(page)
  await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
  const ws = await sock

  const wsRoute = TEAM_ROUTES.deployment.detailsSocket(deploymentId)
  const wsPatchReceived = waitSocketReceived(ws, wsRoute, WS_TYPE_PATCH_RECEIVED)

  await page.click('label:text-is("None"):below(label:text-is("CONFIG BUNDLE"))')
  await page.click(`label:text-is("${bundleName}"):below(label:text-is("None"))`)

  await wsPatchReceived

  await deploy(page, deploymentId, false, false)

  await page.goto(TEAM_ROUTES.deployment.details(deploymentId))

  await expect(page.locator('label:text-is("None"):below(label:text-is("CONFIG BUNDLE"))')).toHaveCount(1)

  await expect(page.locator('input[placeholder="Key"]').first()).toHaveValue(BUNDLE_ENV)
  await expect(page.locator('input[placeholder="Value"]').first()).toHaveValue(BUNDLE_VALUE)
})
