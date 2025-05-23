import { expect } from '@playwright/test'
import { DAGENT_NODE, TEAM_ROUTES } from '../../utils/common'
import { deployWithDagent } from '../../utils/node-helper'
import { addDeploymentToVersion, createImage, createProject, createVersion } from '../../utils/projects'
import { test } from '../../utils/test.fixture'

const image = 'nginx'

test.describe('Versioned Project incremental version', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const projectId = await createProject(page, 'versioned-mutability-1', 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const { id } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

    await page.goto(TEAM_ROUTES.deployment.details(id))
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)

    const configButton = await page
      .locator(`[src="/concrete_container_config.svg"]:right-of(:has-text("${image}"))`)
      .first()
    await configButton.click()

    await page.locator('button:has-text("Name")').click()
    await page.waitForSelector('input[id="common.name"]')
    await expect(await page.locator('input[id="common.name"]')).toBeEditable()
  })

  test('successful deployment should be immutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'versioned-mutability-2', 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const deploymentId = await deployWithDagent(
      page,
      'versioned-mutability',
      projectId,
      versionId,
      false,
      testInfo.title,
    )

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)

    const configButton = await page
      .locator(`[src="/concrete_container_config.svg"]:right-of(:has-text("${image}"))`)
      .first()
    await configButton.click()

    await page.locator('button:has-text("Name")').click()
    await page.waitForSelector('input[id="common.name"]')
    await expect(await page.locator('input[id="common.name"]')).toBeDisabled()
  })

  test('obsolete deployment should be immutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'version-mutability-3', 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const deploymentId = await deployWithDagent(
      page,
      'versioned-mutability-obsolete',
      projectId,
      versionId,
      false,
      `${testInfo.title}1`,
    )

    await deployWithDagent(page, 'versioned-mutability-obsolete', projectId, versionId, false, `${testInfo.title}2`)

    await page.goto(TEAM_ROUTES.deployment.details(deploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)

    const configButton = await page
      .locator(`[src="/concrete_container_config.svg"]:right-of(:has-text("${image}"))`)
      .first()
    await configButton.click()

    await page.locator('button:has-text("Name")').click()
    await page.waitForSelector('input[id="common.name"]')
    await expect(await page.locator('input[id="common.name"]')).toBeDisabled()
  })
})
