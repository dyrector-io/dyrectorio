/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { ProjectType } from '@app/models'
import { ROUTE_TEMPLATES } from '@app/routes'
import { Page } from '@playwright/test'
import { TEAM_ROUTES } from './common'

export const createProjectFromTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  projectType: ProjectType,
): Promise<string> => {
  await page.goto(ROUTE_TEMPLATES)
  await page.waitForURL(ROUTE_TEMPLATES)

  const templateTitle = await page.waitForSelector(`h5:has-text("${templateName}")`)
  const templateCard = await templateTitle.$('xpath=../..')
  const addButton = await templateCard.$('button:has-text("Add")')

  await addButton.click()

  await page.waitForSelector(`h4:has-text("Create a Project from template '${templateName}'")`)

  await page.locator('input[name=name]').fill(projectName)
  if (projectType === 'versioned') {
    await page.locator(`button[role=switch]:right-of(:text("Versioning"))`).click()
  }

  await page.locator('text=Add >> nth=0').click()
  await page.waitForURL(`${TEAM_ROUTES.project.list()}/**`)

  return page.url().split('/').pop()
}
