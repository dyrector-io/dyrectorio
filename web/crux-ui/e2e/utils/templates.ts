import { ROUTE_TEMPLATES } from '@app/routes'
import { Page } from '@playwright/test'

export const createProductFromTemplate = async (
  page: Page,
  templateName: string,
  productName: string,
  productType: 'Simple' | 'Complex',
): Promise<string> => {
  await page.goto(ROUTE_TEMPLATES)
  await page.waitForURL(ROUTE_TEMPLATES)

  const templateTitle = await page.waitForSelector(`h5:has-text("${templateName}")`)
  const templateCard = await templateTitle.$('xpath=../..')
  const addButton = await templateCard.$('button:has-text("Add")')

  await addButton.click()

  await page.waitForSelector(`h4:has-text("Create a Product from template '${templateName}'")`)

  await page.locator('input[name=name]').fill(productName)
  await page.locator(`form >> text=${productType}`).click()

  await page.locator('text=Add >> nth=0').click()

  await page.waitForNavigation()

  return page.url().split('/').pop()
}
