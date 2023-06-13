import { projectUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createProjectFromTemplate } from '../utils/templates'

const testVersionlessTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  expectedImages: number,
): Promise<string> => {
  const projectId = await createProjectFromTemplate(page, templateName, projectName, 'versionless')

  await expect(page).toHaveURL(projectUrl(projectId))

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

  await expect(page).toHaveURL(projectUrl(projectId))

  await page.locator('text="Images"').click()
  await page.waitForURL(`${projectUrl(projectId)}/versions/**`)

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return projectId
}

test('creating a versionless project from a template should work (Google)', async ({ page }) => {
  await testVersionlessTemplate(page, 'Google Microservices Demo', 'Google-versionless', 12)
})

test('creating a versioned project from a template should work (Google)', async ({ page }) => {
  await testVersionedTemplate(page, 'Google Microservices Demo', 'Google-versioned', 12)
})

test('creating a versionless project from a template should work (Strapi)', async ({ page }) => {
  await testVersionlessTemplate(page, 'Strapi', 'Strapi-versionless', 2)
})

test('creating a versioned project from a template should work (Strapi)', async ({ page }) => {
  await testVersionedTemplate(page, 'Strapi', 'Strapi-versioned', 2)
})

test('creating a versionless project from a template should work (Gitlab)', async ({ page }) => {
  await testVersionlessTemplate(page, 'Self-managed GitLab', 'Gitlab-versionless', 1)
})

test('creating a versioned project from a template should work (Gitlab)', async ({ page }) => {
  await testVersionedTemplate(page, 'Self-managed GitLab', 'Gitlab-versioned', 1)
})

test('creating a versionless project from a template should work (WordPress)', async ({ page }) => {
  await testVersionlessTemplate(page, 'WordPress', 'WordPress-versionless', 2)
})

test('creating a versioned project from a template should work (WordPress)', async ({ page }) => {
  await testVersionedTemplate(page, 'WordPress', 'WordPress-versioned', 2)
})

test('creating a versionless project from a template should work (LinkAce)', async ({ page }) => {
  await testVersionlessTemplate(page, 'LinkAce', 'LinkAce-versionless', 2)
})

test('creating a versioned project from a template should work (LinkAce)', async ({ page }) => {
  await testVersionedTemplate(page, 'LinkAce', 'LinkAce-versioned', 2)
})

test('creating a versionless project from a template should work (Gitea)', async ({ page }) => {
  await testVersionlessTemplate(page, 'Gitea', 'Gitea-versionless', 2)
})

test('creating a versioned project from a template should work (Gitea)', async ({ page }) => {
  await testVersionedTemplate(page, 'Gitea', 'Gitea-versioned', 2)
})
