import { projectUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createProjectFromTemplate } from './utils/templates'

const testSimpleTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  expectedImages: number,
): Promise<string> => {
  const projectId = await createProjectFromTemplate(page, templateName, projectName, 'Simple')

  await expect(page).toHaveURL(projectUrl(projectId))

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return projectId
}

const testComplexTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  expectedImages: number,
): Promise<string> => {
  const projectId = await createProjectFromTemplate(page, templateName, projectName, 'Complex')

  await expect(page).toHaveURL(projectUrl(projectId))

  await page.locator('text="Images"').click()
  await page.waitForURL(`${projectUrl(projectId)}/versions/**`)

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return projectId
}

test('creating a simple project from a template should work (Google)', async ({ page }) => {
  await testSimpleTemplate(page, 'Google Microservices Demo', 'Google-simple', 12)
})

test('creating a complex project from a template should work (Google)', async ({ page }) => {
  await testComplexTemplate(page, 'Google Microservices Demo', 'Google-complex', 12)
})

test('creating a simple project from a template should work (Strapi)', async ({ page }) => {
  await testSimpleTemplate(page, 'Strapi', 'Strapi-simple', 2)
})

test('creating a complex project from a template should work (Strapi)', async ({ page }) => {
  await testComplexTemplate(page, 'Strapi', 'Strapi-complex', 2)
})

test('creating a simple project from a template should work (Gitlab)', async ({ page }) => {
  await testSimpleTemplate(page, 'Self-managed GitLab', 'Gitlab-simple', 1)
})

test('creating a complex project from a template should work (Gitlab)', async ({ page }) => {
  await testComplexTemplate(page, 'Self-managed GitLab', 'Gitlab-complex', 1)
})

test('creating a simple project from a template should work (WordPress)', async ({ page }) => {
  await testSimpleTemplate(page, 'WordPress', 'WordPress-simple', 2)
})

test('creating a complex project from a template should work (WordPress)', async ({ page }) => {
  await testComplexTemplate(page, 'WordPress', 'WordPress-complex', 2)
})

test('creating a simple project from a template should work (LinkAce)', async ({ page }) => {
  await testSimpleTemplate(page, 'LinkAce', 'LinkAce-simple', 2)
})

test('creating a complex project from a template should work (LinkAce)', async ({ page }) => {
  await testComplexTemplate(page, 'LinkAce', 'LinkAce-complex', 2)
})

test('creating a simple project from a template should work (Gitea)', async ({ page }) => {
  await testSimpleTemplate(page, 'Gitea', 'Gitea-simple', 2)
})

test('creating a complex project from a template should work (Gitea)', async ({ page }) => {
  await testComplexTemplate(page, 'Gitea', 'Gitea-complex', 2)
})
