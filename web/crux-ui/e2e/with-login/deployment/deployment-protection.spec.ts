import { expect } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { DAGENT_NODE, TEAM_ROUTES } from 'e2e/utils/common'
import { deploy } from 'e2e/utils/node-helper'
import {
  addDeploymentToVersion,
  addDeploymentToVersionlessProject,
  addImageToVersionlessProject,
  createImage,
  createProject,
  createVersion,
} from '../../utils/projects'

test('Protecting a deployment should fail while an incremental protected deployment exists in a different version with the same node and prefix', async ({
  page,
}) => {
  const PROJECT_NAME = 'project-incremental-protect-test'
  const PREFIX = PROJECT_NAME

  const projectId = await createProject(page, PROJECT_NAME, 'versioned')

  const firstVersion = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, firstVersion, 'nginx')
  const { id: firstDeployment } = await addDeploymentToVersion(page, projectId, firstVersion, DAGENT_NODE, {
    prefix: PREFIX,
    protected: true,
  })
  await deploy(page, firstDeployment)

  await createVersion(page, projectId, '2.0.0', 'Incremental')
  await page.click('button:text-is("Deployments")')

  const deploymentsRows = await page.locator('table.w-full >> tbody >> tr')
  await expect(deploymentsRows).not.toBeEmpty()
  await deploymentsRows.locator(`td:has-text("${PREFIX}")`).click()

  await page.waitForURL(`${TEAM_ROUTES.deployment.list()}/**`)
  await page.waitForSelector('h2:text-is("Deployments")')
  const editDeploymentId = page.url().split('/').pop()

  await page.click('button:text-is("Edit")')
  await page.click('button:right-of(:has-text("Protected"))')

  const patchRequest = page.waitForResponse(it =>
    it.url().includes(TEAM_ROUTES.deployment.api.details(editDeploymentId)),
  )
  await page.click('button:text-is("Save")')
  await patchRequest

  const toast = page.getByRole('status')
  await toast.waitFor()
  await expect(toast).toHaveCount(1)
})

test('Deploying should fail while a protected deployment exists with the same node and prefix', async ({ page }) => {
  const PREFIX = 'protected-deploy-test'

  const firstProject = await createProject(page, 'project-rolling-first', 'versionless')
  await addImageToVersionlessProject(page, firstProject, 'nginx')
  await addDeploymentToVersionlessProject(page, firstProject, DAGENT_NODE, { prefix: PREFIX, protected: true })

  const secondProject = await createProject(page, 'project-rolling-second', 'versionless')
  await addImageToVersionlessProject(page, secondProject, 'nginx')
  await addDeploymentToVersionlessProject(page, secondProject, DAGENT_NODE, { prefix: PREFIX })

  await page.click('button:text-is("Deploy")')

  await expect(page.locator('h4:text-is("Deployment protection")')).toBeVisible()
})
