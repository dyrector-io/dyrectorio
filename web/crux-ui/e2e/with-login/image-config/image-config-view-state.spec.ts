import { expect, Page } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { screenshotPath, TEAM_ROUTES } from '../../utils/common'
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

    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    await page.waitForSelector('h2:text-is("Image")')

    const editorButton = await page.waitForSelector('button:has-text("Editor")')

    await editorButton.click()

    const selector = await page.locator('label:has-text("Filters")').first()

    await page.screenshot({ path: screenshotPath('image-config-editor'), fullPage: true })

    await expect(selector).toBeVisible()
  })

  test('JSON state should show the json editor', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'editor-state-json', '1.0.0', 'redis')

    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    await page.waitForSelector('h2:text-is("Image")')

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')

    await jsonEditorButton.click()

    await page.screenshot({ path: screenshotPath('image-config-json'), fullPage: true })

    const jsonContainer = await page.locator('textarea')
    await expect(jsonContainer).toBeVisible()
  })
})
