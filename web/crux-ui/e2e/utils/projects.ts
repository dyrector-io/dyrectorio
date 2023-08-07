/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */
import { ProjectType } from '@app/models'
import { expect, Page } from '@playwright/test'
import { REGISTRY_NAME, TEAM_ROUTES } from './common'

export const createProject = async (page: Page, name: string, type: ProjectType) => {
  await page.goto(TEAM_ROUTES.project.list())

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4:has-text("New project")')).toHaveCount(1)

  await page.locator('input[name=name] >> visible=true').fill(name)
  if (type === 'versionless') {
    await page.locator(`button[role=switch]:right-of(:text("Versioning"))`).click()
  }

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.project.list()}/**`)

  if (type === 'versionless') {
    await page.waitForSelector(`span:has-text("Changelog")`)
  } else {
    // Versioned
    await page.waitForSelector(`button:has-text("Add version")`)
  }

  return page.url().split('/').pop()
}

export const createVersion = async (page: Page, projectId: string, name: string, type: 'Incremental' | 'Rolling') => {
  await page.goto(TEAM_ROUTES.project.details(projectId))
  await page.waitForSelector(`button:has-text("Add version")`)

  await page.locator('button:has-text("Add version")').click()

  await page.locator('input[name=name] >> visible=true').fill(name)
  await page.locator(`form >> text=${type}`).click()

  await page.locator('button:has-text("Save")').click()

  const item = await page.waitForSelector(`h5:has-text("${name}")`)

  await item.click()

  await page.waitForSelector('button:has-text("Add image")')

  return page.url().split('/').pop()
}

export const createImage = async (page: Page, projectId: string, versionId: string, image: string) => {
  await page.goto(TEAM_ROUTES.project.versions(projectId).details(versionId))

  const addImage = await page.waitForSelector('button:has-text("Add image")')
  await addImage.click()

  const registry = await page.waitForSelector(`button:has-text("${REGISTRY_NAME}")`)
  await registry.click()

  await page.locator('input[name=imageName] >> visible=true').fill(image)

  const addButton = await page.waitForSelector('button:has-text("Add")')
  await addButton.click()

  await page.waitForSelector('button:has-text("Add image")')

  const settingsButton = await page.waitForSelector(`[src="/settings.svg"]:right-of(:text("${image}"))`)
  await settingsButton.click()

  await page.waitForSelector(`h2:has-text("Image")`)

  return page.url().split('/').pop()
}

export const addImageToVersion = async (page: Page, projectId: string, versionId: string, image: string) => {
  await page.goto(TEAM_ROUTES.project.versions(projectId).details(versionId))

  await page.locator('button:has-text("Add image")').click()
  await expect(page.locator('h4:has-text("Add image")')).toHaveCount(1)

  const registry = await page.waitForSelector(`button:has-text("${REGISTRY_NAME}")`)
  await registry.click()

  await page.locator('input[name=imageName] >> visible=true').fill(image)
  await page.locator('button:has-text("Add")').click()
  await page.waitForSelector(`div:has-text("${image}")`)
}

export const addImageToVersionlessProject = async (page: Page, projectId: string, image: string) => {
  await page.goto(TEAM_ROUTES.project.details(projectId))

  await page.locator('button:has-text("Add image")').click()
  await expect(page.locator('h4:has-text("Add image")')).toHaveCount(1)

  const registry = await page.waitForSelector(`button:has-text("${REGISTRY_NAME}")`)
  await registry.click()

  await page.locator('input[name=imageName] >> visible=true').fill(image)
  await page.locator('button:has-text("Add")').click()
  await page.waitForSelector(`div:has-text("${image}")`)
}

export const addDeploymentToVersionlessProject = async (
  page: Page,
  projectId: string,
  nodeName: string,
  prefix: string | null,
): Promise<{ id: string; url: string }> => {
  await page.goto(TEAM_ROUTES.project.details(projectId))

  await page.locator('button:has-text("Add deployment")').click()
  await expect(page.locator('h4:has-text("Add deployment")')).toHaveCount(1)

  await fillDeploymentPrefix(page, prefix)

  await page.locator(`button:has-text("${nodeName}")`).click()

  await page.locator('button:has-text("Add")').click()
  await page.waitForURL(`${TEAM_ROUTES.deployment.list()}/**`)

  const deploymentId = page.url().split('/').pop()
  return {
    id: deploymentId,
    url: page.url(),
  }
}

export const addDeploymentToVersion = async (
  page: Page,
  projectId: string,
  versionId: string,
  nodeName: string,
  prefix: string = null,
): Promise<{ id: string; url: string }> => {
  await page.goto(TEAM_ROUTES.project.versions(projectId).details(versionId))

  await page.locator('button:has-text("Add deployment")').click()
  await expect(page.locator('h4:has-text("Add deployment")')).toHaveCount(1)

  await fillDeploymentPrefix(page, prefix)

  await page.locator(`button:has-text("${nodeName}")`).click()

  await page.locator('button:has-text("Add")').click()
  await page.waitForURL(`${TEAM_ROUTES.deployment.list()}/**`)

  return {
    id: page.url().split('/').pop(),
    url: page.url(),
  }
}

export const fillDeploymentPrefix = async (page: Page, prefix: string) => {
  const prefixInput = await page.waitForSelector('input[name=prefix] >> visible=true')
  await prefixInput.fill(`pw-${prefix ?? (await prefixInput.inputValue())}`)
}

export const deleteProject = async (page: Page, projectId: string): Promise<void> => {
  await page.goto(TEAM_ROUTES.project.details(projectId))
  await page.locator('button:has-text("Delete")').click()
  await page.locator('div[role="dialog"] button:has-text("Delete")').click()
  await page.waitForURL(TEAM_ROUTES.project.list())
}
