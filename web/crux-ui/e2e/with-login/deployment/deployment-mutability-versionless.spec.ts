import { expect } from '@playwright/test'
import { DAGENT_NODE, screenshotPath, TEAM_ROUTES } from '../../utils/common'
import { deployWithDagent } from '../../utils/node-helper'
import { addDeploymentToVersionlessProject, addImageToVersionlessProject, createProject } from '../../utils/projects'
import { test } from '../../utils/test.fixture'

const image = 'nginx'

test.describe('Versionless Project', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const projectId = await createProject(page, 'versionless-mutability-1', 'versionless')
    await addImageToVersionlessProject(page, projectId, image)
    await addDeploymentToVersionlessProject(page, projectId, DAGENT_NODE, { prefix: 'versionless-preparing' })

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)

    const configButton = await page
      .locator(`[src="/concrete_container_config.svg"]:right-of(:has-text("${image}"))`)
      .first()
    await configButton.click()

    await page.locator('button:has-text("Name")').click()
    await page.waitForSelector('input[id="common.name"]')
    await expect(await page.locator('input[id="common.name"]')).toBeEditable()
  })

  test('successful deployment should be mutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'versionless-mutability-2', 'versionless')
    await addImageToVersionlessProject(page, projectId, image)

    const prefix = 'succ-versionless-mutability'

    const deploymentId = await deployWithDagent(page, prefix, projectId, '', false, testInfo.title)

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    await page.screenshot({ path: screenshotPath('versionless-prod-successful-deployment'), fullPage: true })

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)

    const configButton = await page
      .locator(`[src="/concrete_container_config.svg"]:right-of(:has-text("${image}"))`)
      .first()
    await configButton.click()

    await page.locator('button:has-text("Name")').click()
    await page.waitForSelector('input[id="common.name"]')
    await expect(await page.locator('input[id="common.name"]')).toBeEditable()
  })
})
