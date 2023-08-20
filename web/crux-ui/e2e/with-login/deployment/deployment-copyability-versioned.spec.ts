import { ProjectType } from '@app/models'
import { expect, Page, test } from '@playwright/test'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES, waitForURLExcept } from '../../utils/common'
import { deployWithDagent } from '../../utils/node-helper'
import { createNode } from '../../utils/nodes'
import {
  addDeploymentToVersion,
  createImage,
  createProject,
  createVersion,
  fillDeploymentPrefix,
} from '../../utils/projects'
import { waitSocket, wsPatchSent } from '../../utils/websocket'

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

test.describe('Versioned Project', () => {
  test('should be able to copy to a different node', async ({ page }) => {
    const nodeName = 'versioned-copiability-to-diff-node'
    const otherNode = 'versioned-copiability-to-other-node'
    const projectName = nodeName
    const prefix = projectName

    await createNode(page, otherNode)

    const { projectId } = await setup(page, nodeName, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)

    const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, nodeName, { prefix })
    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${otherNode}")`).click()
    await fillDeploymentPrefix(page, prefix)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${TEAM_ROUTES.deployment.list()}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy with a different prefix', async ({ page }) => {
    const nodeName = 'versioned-copiability-diff-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, nodeName, { prefix })

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))

    const copyButton = await page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await fillDeploymentPrefix(page, `${prefix}-new-prefix`)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${TEAM_ROUTES.deployment.list()}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('deployment should not be copiable to the same node with the same prefix', async ({ page }) => {
    const nodeName = 'versioned-copiability-same-node-same-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
    await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)
    await addDeploymentToVersion(page, projectId, versionId, nodeName, { prefix })

    await page.goto(TEAM_ROUTES.deployment.list())

    const copyButton = await page.locator(`[alt="Copy"]:right-of(div:has-text("${projectName}"))`).first()
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await fillDeploymentPrefix(page, prefix)
    await page.locator('button:has-text("Copy")').click()

    const toast = page.getByRole('status')
    await toast.waitFor()

    await expect(toast).toHaveCount(1)
  })

  test('In progress deployment should not be copiable', async ({ page }) => {
    const nodeName = 'versioned-copiability-inprogress'
    const projectName = nodeName

    const projectId = await createProject(page, projectName, 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    const imageId = await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

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

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))

    await expect(await page.getByText('In progress')).toHaveCount(1)
    await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
  })
})
