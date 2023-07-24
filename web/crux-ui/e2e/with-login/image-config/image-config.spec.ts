import { imageConfigUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { screenshotPath } from '../../utils/common'
import { createImage, createProject, createVersion } from '../../utils/projects'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ projectId: string; versionId: string; imageId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageId = await createImage(page, projectId, versionId, imageName)

  return {
    projectId,
    versionId,
    imageId,
  }
}

test.describe('View state', () => {
  test('Editor state should show the configuration fields', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'editor-state-conf', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(projectId, versionId, imageId))

    const editorButton = await page.waitForSelector('button:has-text("Editor")')

    await editorButton.click()

    const selector = await page.locator('label:has-text("Filters")').first()

    await page.screenshot({ path: screenshotPath('image-config-editor'), fullPage: true })

    await expect(selector).toBeVisible()
  })

  test('JSON state should show the json editor', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'editor-state-json', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(projectId, versionId, imageId))

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')

    await jsonEditorButton.click()

    await page.screenshot({ path: screenshotPath('image-config-json'), fullPage: true })

    const jsonContainer = await page.locator('textarea')
    await expect(jsonContainer).toBeVisible()
  })
})

test.describe('Filters', () => {
  test('None should be selected by default', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'filter-all', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(projectId, versionId, imageId))

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).toHaveClass(/border-dyo-turquoise/)
    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('All should not be selected if one of the main filters are not selected', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'filter-select', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(projectId, versionId, imageId))

    await page.locator(`button:has-text("Common")`).first().click()

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('Main filter should not be selected if one of its sub filters are not selected', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'sub-filter', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(projectId, versionId, imageId))

    const subFilter = await page.locator(`button:has-text("Network mode")`)

    await subFilter.click()

    const mainFilter = await page.locator(`button:has-text("Docker")`).first()

    await expect(mainFilter).not.toHaveClass(/bg-/)
  })

  test('Config field should be invisible if its sub filter is not selected', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'sub-deselect', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(projectId, versionId, imageId))

    const subFilter = await page.locator(`button:has-text("Deployment strategy")`)

    await subFilter.click()

    const configField = await page.locator(`label:has-text("Kubernetes")`)

    await expect(configField).toHaveCount(0)
  })
})
