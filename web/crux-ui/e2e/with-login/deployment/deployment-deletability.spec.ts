import { expect } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES } from 'e2e/utils/common'
import { deployWithDagent } from '../../utils/node-helper'
import { addImageToVersion, createImage, createProject, createVersion } from '../../utils/projects'
import { waitSocketRef, wsPatchSent } from '../../utils/websocket'
import { WS_TYPE_PATCH_CONFIG } from '@app/models'

test('In progress deployment should be not deletable', async ({ page }) => {
  const projectName = 'project-delete-test-1'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  const imageConfigId = await createImage(page, projectId, versionId, 'nginx')

  const sock = waitSocketRef(page)
  await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
  await page.waitForSelector('h2:text-is("Image config")')
  const ws = await sock
  const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

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
      command: ['sleep', '20'],
      volumes: [],
      environment: {},
      useParentConfig: false,
    },
  ]
  const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG)
  await jsonContainer.fill(JSON.stringify(configObject))
  await wsSent

  await deployWithDagent(page, 'versioned-deletability', projectId, versionId, true)

  await expect(await page.getByText('In progress')).toHaveCount(1)
  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
})

test('Delete deployment should work', async ({ page }, testInfo) => {
  const projectName = 'project-delete-test-2'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const deploymentId = await deployWithDagent(page, 'versioned-delete', projectId, versionId, false, testInfo.title)

  await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
  await page.waitForSelector('h2:text-is("Deployments")')

  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(1)

  await page.locator('button:has-text("Delete")').click()

  await page.waitForSelector('h4:has-text("Are you sure you want to delete Deployment?")')

  await page.locator('button:has-text("Delete")').nth(1).click()
  await page.waitForURL(`${TEAM_ROUTES.project.details(projectId)}**`)
  await page.waitForSelector('h2:text-is("Projects")')
})

test('Deleting a deployment should refresh deployment list', async ({ page }) => {
  const projectName = 'project-delete-refresh-test'

  const projId = await createProject(page, projectName, 'versioned')
  const baseVersion = await createVersion(page, projId, '1.0.0', 'Incremental')
  await addImageToVersion(page, projId, baseVersion, NGINX_TEST_IMAGE_WITH_TAG)
  await deployWithDagent(page, projectName, projId, baseVersion)
  await createVersion(page, projId, '1.0.1', 'Incremental')

  const deleteRefreshDeployment = async () => {
    await page.locator(`img[src="/trash-can.svg"]:right-of(.p-2:has-text('pw-${projectName}'))`).first().click()
    await page.locator('h4:has-text("Are you sure?")')
    await page.locator('button:has-text("Delete")').click()
  }

  await page.goto(TEAM_ROUTES.deployment.list())
  await page.waitForSelector('h2:text-is("Deployments")')

  await deleteRefreshDeployment()
  await expect(page.locator(`.p-2:has-text('pw-${projectName}')`)).toHaveCount(1)
  await deleteRefreshDeployment()
  await expect(page.locator(`.p-2:has-text('pw-${projectName}')`)).toHaveCount(0)
})
