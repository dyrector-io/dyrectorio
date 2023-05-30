import { deploymentUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, screenshotPath } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import {
  addDeploymentToSimpleProject,
  addDeploymentToVersion,
  addImageToSimpleProject,
  createImage,
  createProject,
  createVersion,
} from './utils/projects'

const image = 'nginx'

test.describe('Simple project', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const projectId = await createProject(page, 'PW-SIMPLE-MUTABILITY-1', 'Simple')
    await addImageToSimpleProject(page, projectId, image)
    await addDeploymentToSimpleProject(page, projectId, DAGENT_NODE, 'pw-simple-preparing')

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeEditable()
  })

  test('successful deployment should be mutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'PW-SIMPLE-MUTABILITY-2', 'Simple')
    await addImageToSimpleProject(page, projectId, image)

    const prefix = 'pw-simp-mut'

    const deploymentId = await deployWithDagent(page, prefix, projectId, '', false, testInfo.title)

    await page.goto(deploymentUrl(deploymentId))

    await page.screenshot({ path: screenshotPath('simple-prod-successful-deployment'), fullPage: true })

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeEditable()
  })
})

test.describe('Complex project incremental version', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const projectId = await createProject(page, 'PW-COMP-MUTABILITY-1', 'Complex')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const { id } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE)

    await page.goto(deploymentUrl(id))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeEditable()
  })

  test('successful deployment should be immutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'PW-COMP-MUTABILITY-2', 'Complex')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const deploymentId = await deployWithDagent(
      page,
      'pw-complex-mutability',
      projectId,
      versionId,
      false,
      testInfo.title,
    )

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeDisabled()
  })

  test('obsolete deployment should be immutable', async ({ page }, testInfo) => {
    const projectId = await createProject(page, 'PW-COMP-MUTABILITY-3', 'Complex')
    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    await createImage(page, projectId, versionId, image)

    const deploymentId = await deployWithDagent(
      page,
      'pw-complex-mutability-obsolete',
      projectId,
      versionId,
      false,
      `${testInfo.title}1`,
    )

    await deployWithDagent(page, 'pw-complex-mutability-obsolete', projectId, versionId, false, `${testInfo.title}2`)

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeDisabled()
  })
})
