import { deploymentUrl, projectUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { DAGENT_NODE, waitForURLExcept } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import { createNode } from './utils/nodes'
import {
  addDeploymentToSimpleProject,
  addDeploymentToVersion,
  addImageToSimpleProject,
  createImage,
  createProject,
  createVersion,
} from './utils/projects'

const setup = async (
  page: Page,
  nodeName: string,
  projectName: string,
  type: 'Simple' | 'Complex' = 'Simple',
): Promise<{ nodeId: string; projectId: string }> => {
  const nodeId = await createNode(page, nodeName)
  const projectId = await createProject(page, projectName, type)

  return {
    nodeId,
    projectId,
  }
}

test.describe('Simple project', () => {
  test('preparing deployment should be not copiable on deployment list', async ({ page }) => {
    const nodeName = 'NODE-TEST1'
    const projectName = 'project-copy-test-1'

    const { projectId } = await setup(page, nodeName, projectName)
    await addImageToSimpleProject(page, projectId, 'nginx')
    await addDeploymentToSimpleProject(page, projectId, nodeName, null)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(div:has-text("${projectName}"))`).first()
    await expect(copyButton).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment list in project', async ({ page }) => {
    const nodeName = 'NODE-TEST2'
    const projectName = 'project-copy-test-2'

    const { projectId } = await setup(page, nodeName, projectName)
    await addImageToSimpleProject(page, projectId, 'nginx')
    await addDeploymentToSimpleProject(page, projectId, nodeName, null)

    await page.goto(projectUrl(projectId))

    await page.locator('button:has-text("Deployments")').click()

    await page.waitForSelector('[alt="Copy"]')

    await expect(await page.locator('[alt="Copy"]')).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment details page', async ({ page }) => {
    const projectName = 'project-copy-test-3'

    const { projectId } = await setup(page, DAGENT_NODE, projectName)
    await addImageToSimpleProject(page, projectId, 'nginx')
    const { url } = await addDeploymentToSimpleProject(page, projectId, DAGENT_NODE, null)

    await page.goto(url)

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('successful deployment should be not copiable on deployment details page', async ({ page }, testInfo) => {
    const projectName = 'project-copy-test-4'

    const projectId = await createProject(page, projectName, 'Simple')
    await addImageToSimpleProject(page, projectId, 'nginx')

    const prefix = 'pw-simp-copy'

    const deploymentId = await deployWithDagent(page, prefix, projectId, '', false, testInfo.title)

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })
})

test.describe('Complex project', () => {
  test('preparing deployment should be not copiable on deployment list', async ({ page }) => {
    const projectName = 'project-copy-test-5'

    const { projectId } = await setup(page, DAGENT_NODE, projectName, 'Complex')
    const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')
    await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(div:has-text("${projectName}"))`).first()
    await expect(copyButton).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment list in project', async ({ page }) => {
    const projectName = 'project-copy-test-6'

    const { projectId } = await setup(page, DAGENT_NODE, projectName, 'Complex')
    const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')
    await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

    await page.goto(versionUrl(projectId, versionId, { section: 'deployments' }))

    await page.waitForSelector('button:has-text("Add image")')

    await expect(await page.locator('[alt="Copy"]')).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment details page', async ({ page }) => {
    const projectName = 'project-copy-test-7'

    const { projectId } = await setup(page, DAGENT_NODE, projectName, 'Complex')
    const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')

    const { id } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

    await page.goto(deploymentUrl(id))

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('should be able to copy successful deployment', async ({ page }, testInfo) => {
    const projectName = 'project-copy-test-8'

    const projectId = await createProject(page, projectName, 'Complex')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')

    const deploymentId = await deployWithDagent(
      page,
      'pw-complex-copibility',
      projectId,
      versionId,
      false,
      testInfo.title,
    )

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy obsolete deployment', async ({ page }, testInfo) => {
    const projectName = 'project-copy-test-9'

    const projectId = await createProject(page, projectName, 'Complex')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, 'nginx')

    const deploymentId = await deployWithDagent(
      page,
      'pw-complex-copibility-obsolete',
      projectId,
      versionId,
      false,
      `${testInfo.title}1`,
    )

    await deployWithDagent(page, 'pw-complex-copibility-obsolete', projectId, versionId, false, `${testInfo.title}2`)

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  // TODO (@m8vago): 'In Progress deployment should be not copiable'
  // create an image which takes at least 10 sec to be deployed, so we can test the upper mentioned check

  test('Can copy deployment while there is a preparing deployment on the same node with different prefix and should not overwrite it', async ({
    page,
  }, testInfo) => {
    const projectName = 'project-copy-test-11'
    const projectId = await createProject(page, projectName, 'Complex')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')

    await createImage(page, projectId, versionId, 'nginx')

    await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, 'pw-complex-first')

    await deployWithDagent(page, 'pw-complex-second', projectId, versionId, false, testInfo.title)

    await page.goto(versionUrl(projectId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    const copy = await page.locator(`[alt="Copy"]:right-of(:text("pw-complex-second"))`).first()

    const currentUrl = page.url()
    await copy.click()
    await waitForURLExcept(page, { startsWith: `${ROUTE_DEPLOYMENTS}/`, except: currentUrl })

    await page.goto(versionUrl(projectId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(2)
  })
})
