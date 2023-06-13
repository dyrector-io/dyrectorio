import { ProjectType } from '@app/models'
import { deploymentUrl, imageConfigUrl, ROUTE_DEPLOYMENTS, versionWsUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { waitForURLExcept } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import { createNode } from './utils/nodes'
import {
  addDeploymentToVersion,
  addDeploymentToVersionlessProject,
  addImageToVersionlessProject,
  createImage,
  createProject,
  createVersion,
} from './utils/projects'
import { waitSocket, wsPatchSent } from './utils/websocket'

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

test.describe('Versionless Project', () => {
  test('deployment should not be copiable to the same node with the same prefix', async ({ page }) => {
    const nodeName = 'versionless-copiability-same-node-same-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName)
    await addImageToVersionlessProject(page, projectId, 'nginx')
    await addDeploymentToVersionlessProject(page, projectId, nodeName, prefix)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(div:has-text("${projectName}"))`).first()
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await page.locator('input[name=prefix]').fill(prefix)
    await page.locator('button:has-text("Copy")').click()

    const toast = page.getByRole('status')
    await toast.waitFor()

    expect(toast).toHaveCount(1)
  })

  test('should be able to copy deployment to a different node', async ({ page }) => {
    const nodeName = 'versionless-copiability-diff-node'
    const otherNode = 'versionless-copiability-other-node'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName)
    await createNode(page, otherNode)

    await addImageToVersionlessProject(page, projectId, 'nginx')
    const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefix)

    await page.goto(deploymentUrl(deploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${otherNode}")`).click()
    await page.locator('input[name=prefix]').fill(prefix)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy deployment with a different prefix', async ({ page }) => {
    const nodeName = 'versionless-copiability-diff-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName)

    await addImageToVersionlessProject(page, projectId, 'nginx')
    const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefix)

    await page.goto(deploymentUrl(deploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await page.locator('input[name=prefix]').fill(`${prefix}-new-prefix`)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })
})

test.describe('Versioned Project', () => {
  test('deployment should not be copiable to the same node with the same prefix', async ({ page }) => {
    const nodeName = 'versioned-copiability-same-node-same-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')
    await addDeploymentToVersion(page, projectId, versionId, prefix)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(div:has-text("${projectName}"))`).first()
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await page.locator('input[name=prefix]').fill(prefix)
    await page.locator('button:has-text("Copy")').click()

    const toast = page.getByRole('status')
    await toast.waitFor()

    expect(toast).toHaveCount(1)
  })

  test('should be able to copy to a different node', async ({ page }) => {
    const nodeName = 'versioned-copiability-to-diff-node'
    const otherNode = 'versioned-copiability-to-other-node'
    const projectName = nodeName
    const prefix = projectName

    await createNode(page, otherNode)

    const { projectId } = await setup(page, nodeName, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')

    const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, nodeName, prefix)
    await page.goto(deploymentUrl(deploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${otherNode}")`).click()
    await page.locator('input[name=prefix]').fill(prefix)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy with a different prefix', async ({ page }) => {
    const nodeName = 'versioned-copiability-diff-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')
    const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, nodeName, prefix)

    await page.goto(deploymentUrl(deploymentId))

    const copyButton = await page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await page.locator('input[name=prefix]').fill(`${prefix}-new-prefix`)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('In progress deployment should not be copiable', async ({ page }) => {
    const nodeName = 'versioned-copiability-inprogress'
    const projectName = nodeName

    const projectId = await createProject(page, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    const imageId = await createImage(page, projectId, versionId, 'nginx')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    const editorButton = await page.waitForSelector('button:has-text("JSON")')
    await editorButton.click()

    const jsonContainer = await page.locator('textarea')
    await expect(jsonContainer).toBeVisible()

    const json = await jsonContainer.textContent()
    const configObject = JSON.parse(json)
    configObject.initContainers = [
      {
        args: [],
        name: 'sleep',
        image: 'alpine:3.14',
        command: ['sleep', '2'],
        volumes: [],
        environment: {},
        useParentConfig: false,
      },
    ]
    const wsSent = wsPatchSent(ws, wsRoute)
    await jsonContainer.fill(JSON.stringify(configObject))
    await wsSent

    const deploymentId = await deployWithDagent(page, 'versioned-copiability-inprogress', projectId, versionId, true)

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.getByText('In progress')).toHaveCount(1)
    await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
  })
})
