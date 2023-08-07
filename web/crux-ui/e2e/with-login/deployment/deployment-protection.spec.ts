import { expect, Page, test } from '@playwright/test'
import { DAGENT_NODE, TEAM_ROUTES } from 'e2e/utils/common'
import { deploy } from 'e2e/utils/node-helper'
import { addDeploymentToVersion, createImage, createProject, createVersion } from '../../utils/projects'

const createProtectedDeployment = async (
  page: Page,
  projectId: string,
  versionId: string,
  prefix: string,
): Promise<string> => {
  const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, prefix)

  await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
  await page.locator('button:has-text("Edit")').click()

  await page.waitForSelector('h4:has-text("Edit Deployment")')
  await page.click('button:right-of(:has-text("Protected"))')

  await page.locator('button:has-text("Save")').click()

  return deploymentId
}

test('Deploying should fail while a protected deployment exists in the same version with the same node and prefix', async ({
  page,
}) => {
  const PROJECT_NAME = 'project-protect-test'
  const PREFIX = PROJECT_NAME

  const projectId = await createProject(page, PROJECT_NAME, 'versioned')
  const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const firstDeployment = await createProtectedDeployment(page, projectId, versionId, PREFIX)
  await deploy(page, firstDeployment)

  await createProtectedDeployment(page, projectId, versionId, PREFIX)

  const toast = page.getByRole('status')
  await toast.waitFor()

  await expect(toast).toHaveCount(1)
})

test('Deploying a non protected deployment should warn if a protected deployment already exists', async ({ page }) => {
  const PROJECT_NAME = 'project-protect-deploy-test'
  const PREFIX = PROJECT_NAME

  const projectId = await createProject(page, PROJECT_NAME, 'versioned')
  const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const firstDeployment = await createProtectedDeployment(page, projectId, versionId, PREFIX)
  await deploy(page, firstDeployment)

  const { id: secondDeployment } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, PREFIX)
  await page.goto(TEAM_ROUTES.deployment.details(secondDeployment))

  await page.click('button:has-text("Deploy")')

  const overlay = await page.locator('div[data-headlessui-state="open"]')
  await expect(overlay.locator('h4:has-text("Deployment protection")')).toHaveCount(1)
})
