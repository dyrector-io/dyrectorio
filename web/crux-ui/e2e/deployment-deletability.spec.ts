import { deploymentUrl, projectUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { deployWithDagent } from './utils/node-helper'
import { createImage, createProject, createVersion } from './utils/projects'

test('In progress deployment should be not deletable', async ({ page }) => {
  const projectName = 'project-delete-test-1'

  const projectId = await createProject(page, projectName, 'Complex')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const deploymentId = await deployWithDagent(page, 'pw-complex-deletability', projectId, versionId, true)

  await page.goto(deploymentUrl(deploymentId))

  await expect(await page.getByText('In progress')).toHaveCount(1)
  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
})

test('Delete deployment should work', async ({ page }, testInfo) => {
  const projectName = 'project-delete-test-2'

  const projectId = await createProject(page, projectName, 'Complex')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const deploymentId = await deployWithDagent(page, 'pw-complex-delete', projectId, versionId, false, testInfo.title)

  await page.goto(deploymentUrl(deploymentId))

  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(1)

  await page.locator('button:has-text("Delete")').click()

  await page.waitForSelector('h4:has-text("Are you sure you want to delete Deployment?")')

  await page.locator('button:has-text("Delete")').nth(1).click()
  await page.waitForURL(`${projectUrl(projectId)}**`)
})
