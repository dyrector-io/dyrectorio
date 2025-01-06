import { expect, Page } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { NGINX_TEST_IMAGE_WITH_TAG, screenshotPath, TEAM_ROUTES } from '../../utils/common'
import { createImage, createProject, createVersion } from '../../utils/projects'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ imageConfigId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageConfigId = await createImage(page, projectId, versionId, imageName)

  return { imageConfigId }
}

test.describe('View state', () => {
  test('Editor state should show the configuration fields', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'editor-state-conf', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    const editorButton = await page.waitForSelector('button:has-text("Editor")')

    await editorButton.click()

    const selector = await page.locator('label:has-text("Filters")').first()

    await page.screenshot({ path: screenshotPath('image-config-editor'), fullPage: true })

    await expect(selector).toBeVisible()
  })

  test('JSON state should show the json editor', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'editor-state-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')

    await jsonEditorButton.click()

    await page.screenshot({ path: screenshotPath('image-config-json'), fullPage: true })

    const jsonContainer = await page.locator('textarea')
    await expect(jsonContainer).toBeVisible()
  })
})
