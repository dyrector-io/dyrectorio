/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { ROUTE_PROJECTS, ROUTE_TEMPLATES } from '@app/routes'
import { Page } from '@playwright/test'

export const createProjectFromTemplate = async (
  page: Page,
  templateName: string,
  projectName: string,
  projectType: 'Simple' | 'Complex',
): Promise<string> => {
  await page.goto(ROUTE_TEMPLATES)
  await page.waitForURL(ROUTE_TEMPLATES)

  const templateTitle = await page.waitForSelector(`h5:has-text("${templateName}")`)
  const templateCard = await templateTitle.$('xpath=../..')
  const addButton = await templateCard.$('button:has-text("Add")')

  await addButton.click()

  await page.waitForSelector(`h4:has-text("Create a Project from template '${templateName}'")`)

  await page.locator('input[name=name]').fill(projectName)
  await page.locator(`form >> text=${projectType}`).click()

  await page.locator('text=Add >> nth=0').click()
  await page.waitForURL(`${ROUTE_PROJECTS}/**`)

  return page.url().split('/').pop()
}
