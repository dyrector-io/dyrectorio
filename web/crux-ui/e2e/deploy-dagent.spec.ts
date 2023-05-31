import { versionUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { screenshotPath } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import { createImage, createProject, createVersion } from './utils/projects'

const prefix = 'pw-first'
const prefixTwo = 'pw-second'
const image = 'nginx'

test('Deploy to node should be successful', async ({ page }, testInfo) => {
  const projectId = await createProject(page, 'PW-DEPLOY-TEST', 'Complex')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, image)

  await deployWithDagent(page, prefix, projectId, versionId, false, testInfo.title)

  await page.screenshot({ path: screenshotPath('successful-deployment'), fullPage: true })

  const deployStatus = page.getByText('Successful')
  await deployStatus.waitFor()

  await expect(deployStatus).toHaveCount(1)
})

test('Second successful deployment should make the first deployment obsolete', async ({ page }, testInfo) => {
  const projectId = await createProject(page, 'PW-OBSOLETE', 'Complex')
  const versionId = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, versionId, image)

  await deployWithDagent(page, prefixTwo, projectId, versionId, false, `${testInfo.title}1`)

  const firstDeployStatus = await page.getByText('Successful')
  await expect(firstDeployStatus).toHaveCount(1)

  await deployWithDagent(page, prefixTwo, projectId, versionId, false, `${testInfo.title}2`)

  const secondDeployStatus = await page.getByText('Successful')
  await expect(secondDeployStatus).toHaveCount(1)

  await page.goto(versionUrl(projectId, versionId, { section: 'deployments' }))
  await page.screenshot({ path: screenshotPath('deployment-should-be-obsolete'), fullPage: true })

  const deploymentsTableBody = await page.locator('.table-row-group')
  const deploymentsRows = await deploymentsTableBody.locator('.table-row')

  await expect(deploymentsRows).toHaveCount(2)

  const successfulDeployment = await deploymentsRows.getByText('Successful', { exact: true })
  const obsoleteDeployment = await deploymentsRows.getByText('Obsolete', { exact: true })

  await page.screenshot({ path: screenshotPath('deployment-should-be-obsolete-2'), fullPage: true })
  await expect(successfulDeployment).toHaveCount(1)
  await expect(obsoleteDeployment).toHaveCount(1)
})
