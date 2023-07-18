import { expect, test } from '@playwright/test'
import { TEAM_ROUTES } from 'e2e/utils/common'
import { deployWithDagent } from '../utils/node-helper'
import { createImage, createProject, createVersion } from '../utils/projects'
import { waitSocket, wsPatchSent } from '../utils/websocket'

test('In progress deployment should be not deletable', async ({ page }) => {
  const projectName = 'project-delete-test-1'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  const imageId = await createImage(page, projectId, versionId, 'nginx')

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

  const deploymentId = await deployWithDagent(page, 'versioned-deletability', projectId, versionId, true)

  await page.goto(routes.deployment.details(deploymentId))

  await expect(await page.getByText('In progress')).toHaveCount(1)
  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
})

test('Delete deployment should work', async ({ page }, testInfo) => {
  const projectName = 'project-delete-test-2'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const deploymentId = await deployWithDagent(page, 'versioned-delete', projectId, versionId, false, testInfo.title)

  await page.goto(routes.deployment.details(deploymentId))

  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(1)

  await page.locator('button:has-text("Delete")').click()

  await page.waitForSelector('h4:has-text("Are you sure you want to delete Deployment?")')

  await page.locator('button:has-text("Delete")').nth(1).click()
  await page.waitForURL(`${routes.project.details(projectId)}**`)
})
