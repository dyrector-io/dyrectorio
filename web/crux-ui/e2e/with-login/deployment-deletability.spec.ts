import { deploymentUrl, imageConfigUrl, projectUrl, versionWsUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { deployWithDagent } from '../utils/node-helper'
import { createImage, createProject, createVersion } from '../utils/projects'
import { waitSocket, wsPatchSent } from '../utils/websocket'

test('In progress deployment should be not deletable', async ({ page }) => {
  const projectName = 'project-delete-test-1'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  const imageId = await createImage(page, projectId, versionId, 'nginx')

  const sock = waitSocket(page)
  await page.goto(imageConfigUrl(projectId, versionId, imageId))
  const ws = await sock
  const wsRoute = versionWsUrl(versionId)

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

  await page.goto(deploymentUrl(deploymentId))

  await expect(await page.getByText('In progress')).toHaveCount(1)
  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
})

test('Delete deployment should work', async ({ page }, testInfo) => {
  const projectName = 'project-delete-test-2'

  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
  await createImage(page, projectId, versionId, 'nginx')

  const deploymentId = await deployWithDagent(page, 'versioned-delete', projectId, versionId, false, testInfo.title)

  await page.goto(deploymentUrl(deploymentId))

  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(1)

  await page.locator('button:has-text("Delete")').click()

  await page.waitForSelector('h4:has-text("Are you sure you want to delete Deployment?")')

  await page.locator('button:has-text("Delete")').nth(1).click()
  await page.waitForURL(`${projectUrl(projectId)}**`)
})

/*test('Deleting a deployment should refresh deployment list', async ({page})=>{
  const projectName="project-delete-refresh-test"

  const projId = await createProject(page,projectName,"versioned")
  const baseVersion = await createVersion(page,projId,"1.0.0","Incremental")
  await addImageToVersion(page,projId,baseVersion,NGINX_TEST_IMAGE_WITH_TAG)
  await deployWithDagent(page,projectName,projId,baseVersion)
  await createVersion(page,projId,"1.0.1",'Incremental')

  await page.goto(ROUTE_DEPLOYMENTS)
  deleteRefreshDeployment(page,projectName)
  await expect(page.locator(`div.p-2:has-text('pw-${projectName}')`)).toHaveCount(1)
  deleteRefreshDeployment(page,projectName)
  await expect(page.locator(`div.p-2:has-text('pw-${projectName}')`)).toHaveCount(0)
})*/

const deleteRefreshDeployment = async (page: Page, projectName: string): Promise<void> => {
  await page.locator(`img[src="/trash-can.svg"]:right-of(div.p-2:has-text('pw-${projectName}'))`).first().click()
  await page.locator('h4:has-text("Are you sure?")')
  await page.locator('button:has-text("Delete")').click()
}
