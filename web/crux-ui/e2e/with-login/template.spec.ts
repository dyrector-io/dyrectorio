import { expect, Page, test } from '@playwright/test'
import { TEAM_ROUTES } from 'e2e/utils/common'
import { createProjectFromTemplate } from '../utils/templates'

const templates = [
  {
    name: 'Google Microservices Demo',
    images: 12,
  },
  {
    name: 'Strapi',
    images: 2,
  },
  {
    name: 'Self-managed GitLab',
    images: 1,
  },
  {
    name: 'WordPress',
    images: 2,
  },
  {
    name: 'LinkAce',
    images: 2,
  },
  {
    name: 'Gitea',
    images: 2,
  },
]

const testVersionlessTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  expectedImages: number,
): Promise<string> => {
  const projectId = await createProjectFromTemplate(page, templateName, projectName, 'versionless')

  await expect(page).toHaveURL(TEAM_ROUTES.project.details(projectId))

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return projectId
}

const testVersionedTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  expectedImages: number,
): Promise<string> => {
  const projectId = await createProjectFromTemplate(page, templateName, projectName, 'versioned')

  await expect(page).toHaveURL(TEAM_ROUTES.project.details(projectId))

  await page.locator('text="Images"').click()
  await page.waitForURL(`${TEAM_ROUTES.project.details(projectId)}/versions/**`)

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return projectId
}

// eslint-disable-next-line no-restricted-syntax
for (const template of templates) {
  const projectName = template.name.toLowerCase().replaceAll(' ', '_')

  test(`creating a versionless project from a template should work (${template.name})`, async ({ page }) => {
    await testVersionlessTemplate(page, template.name, `${projectName}-versionless`, template.images)
  })

  test(`creating a versioned project from a template should work (${template.name})`, async ({ page }) => {
    await testVersionedTemplate(page, template.name, `${projectName}-versioned`, template.images)
  })
}
