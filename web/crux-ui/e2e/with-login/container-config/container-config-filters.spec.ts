import { expect, Page } from '@playwright/test'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES } from 'e2e/utils/common'
import { createImage, createProject, createVersion } from '../../utils/projects'
import { test } from '../../utils/test.fixture'

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

test.describe('Filters', () => {
  test('None should be selected by default', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'filter-all', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).toHaveClass(/border-dyo-turquoise/)
    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('All should not be selected if one of the main filters are not selected', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'filter-select', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    await page.locator(`button:has-text("Common")`).first().click()

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('Main filter should not be selected if one of its sub filters are not selected', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'sub-filter', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    const subFilter = await page.locator(`button:has-text("Network mode")`)

    await subFilter.click()

    const mainFilter = await page.locator(`button:has-text("Docker")`).first()

    await expect(mainFilter).not.toHaveClass(/bg-/)
  })

  test('Config field should be invisible if its sub filter is not selected', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'sub-deselect', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    const subFilter = await page.locator(`button:has-text("Deployment strategy")`)

    await subFilter.click()

    const configField = await page.locator(`label:has-text("Kubernetes")`)

    await expect(configField).toHaveCount(0)
  })
})
