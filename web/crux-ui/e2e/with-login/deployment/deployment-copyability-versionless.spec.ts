import { ProjectType } from '@app/models'
import { deploymentUrl, ROUTE_DEPLOYMENTS } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { NGINX_TEST_IMAGE_WITH_TAG, waitForURLExcept } from '../../utils/common'
import { createNode } from '../../utils/nodes'
import {
  addDeploymentToVersionlessProject,
  addImageToVersionlessProject,
  createProject,
  fillDeploymentPrefix,
} from '../../utils/projects'

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
    await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
    await addDeploymentToVersionlessProject(page, projectId, nodeName, prefix)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(div:has-text("${projectName}"))`).first()
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await fillDeploymentPrefix(page, prefix)
    await page.locator('button:has-text("Copy")').click()

    const toast = page.getByRole('status')
    await toast.waitFor()

    await expect(toast).toHaveCount(1)
  })

  test('should be able to copy deployment to a different node', async ({ page }) => {
    const nodeName = 'versionless-copiability-diff-node'
    const otherNode = 'versionless-copiability-other-node'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName)
    await createNode(page, otherNode)

    await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefix)

    await page.goto(deploymentUrl(deploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${otherNode}")`).click()
    await fillDeploymentPrefix(page, prefix)

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

    await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, nodeName, prefix)

    await page.goto(deploymentUrl(deploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await fillDeploymentPrefix(page, `${prefix}-new-prefix`)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })
})
