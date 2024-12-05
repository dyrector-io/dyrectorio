import { ProjectType } from '@app/models'
import { expect, Page } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES, waitForURLExcept } from '../../utils/common'
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
    await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix })

    await page.goto(TEAM_ROUTES.deployment.list())
    await page.waitForSelector('h2:text-is("Deployments")')

    const copyButton = await page.locator(`[alt="Copy"]:right-of(:has-text("${projectName}"))`).first()
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}"):above(:has-text("Projects"))`).click()
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
    const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix })

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${otherNode}")`).click()
    await fillDeploymentPrefix(page, prefix)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${TEAM_ROUTES.deployment.list()}/`, except: currentUrl })
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy deployment with a different prefix', async ({ page }) => {
    const nodeName = 'versionless-copiability-diff-prefix'
    const projectName = nodeName
    const prefix = projectName

    const { projectId } = await setup(page, nodeName, projectName)

    await addImageToVersionlessProject(page, projectId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, nodeName, { prefix })

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${nodeName}")`).click()
    await fillDeploymentPrefix(page, `${prefix}-new-prefix`)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${TEAM_ROUTES.deployment.list()}/`, except: currentUrl })
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(await page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })
})
