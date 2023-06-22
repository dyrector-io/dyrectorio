import { deploymentUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, screenshotPath } from '../utils/common'
import { deployWithDagent } from '../utils/node-helper'
import {
  addDeploymentToVersion,
  addDeploymentToVersionlessProject,
  addImageToVersionlessProject,
  createImage,
  createProject,
  createVersion,
} from '../utils/projects'

const image = 'nginx'

test.describe('Versionless Project', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const projectId = await createProject(page, 'versionless-mutability-1', 'versionless')
    await addImageToVersionlessProject(page, projectId, image)
    await addDeploymentToVersionlessProject(page, projectId, DAGENT_NODE, 'versionless-preparing')

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)

    const configButton = await page.locator(`[alt="Settings"]:right-of(div:has-text("${image}"))`).first()
    await configButton.click()

    await page.waitForSelector('input[id="common.containerName"]')
    await expect(await page.locator('input[id="common.containerName"]')).toBeEditable()
  })

  test('successful deployment should be mutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'versionless-mutability-2', 'versionless')
    await addImageToVersionlessProject(page, projectId, image)

    const prefix = 'succ-versionless-mutability'

    const deploymentId = await deployWithDagent(page, prefix, projectId, '', false, testInfo.title)

    await page.goto(deploymentUrl(deploymentId))

    await page.screenshot({ path: screenshotPath('versionless-prod-successful-deployment'), fullPage: true })

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)

    const configButton = await page.locator(`[alt="Settings"]:right-of(div:has-text("${image}"))`).first()
    await configButton.click()

    await page.waitForSelector('input[id="common.containerName"]')
    await expect(await page.locator('input[id="common.containerName"]')).toBeEditable()
  })
})

test.describe('Versioned Project incremental version', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const projectId = await createProject(page, 'versioned-mutability-1', 'versioned')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const { id } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

    await page.goto(deploymentUrl(id))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)

    const configButton = await page.locator(`[alt="Settings"]:right-of(div:has-text("${image}"))`).first()
    await configButton.click()

    await page.waitForSelector('input[id="common.containerName"]')
    await expect(await page.locator('input[id="common.containerName"]')).toBeEditable()
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

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)

    const configButton = await page.locator(`[alt="Settings"]:right-of(div:has-text("${image}"))`).first()
    await configButton.click()

    await page.waitForSelector('input[id="common.containerName"]')
    await expect(await page.locator('input[id="common.containerName"]')).toBeDisabled()
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

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)

    const configButton = await page.locator(`[alt="Settings"]:right-of(div:has-text("${image}"))`).first()
    await configButton.click()

    await page.waitForSelector('input[id="common.containerName"]')
    await expect(await page.locator('input[id="common.containerName"]')).toBeDisabled()
  })
})
