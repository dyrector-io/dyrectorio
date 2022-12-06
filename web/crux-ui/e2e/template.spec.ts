import { productUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createProductFromTemplate } from './utils/templates'

const testSimpleTemplate = async (
  page: Page,
  templateName: string,
  productName: string,
  expectedImages: number,
): Promise<string> => {
  const productId = await createProductFromTemplate(page, templateName, productName, 'Simple')

  await expect(page).toHaveURL(productUrl(productId))

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return productId
}

const testComplexTemplate = async (
  page: Page,
  templateName: string,
  productName: string,
  expectedImages: number,
): Promise<string> => {
  const productId = await createProductFromTemplate(page, templateName, productName, 'Complex')

  await expect(page).toHaveURL(productUrl(productId))

  await page.locator('text="Images"').click()
  await page.waitForNavigation()

  const imageTableBody = await page.locator('.table-row-group')
  const imageRows = await imageTableBody.locator('.table-row')
  await expect(imageRows).toHaveCount(expectedImages)

  return productId
}

test('creating a simple product from a template should work (Google)', async ({ page }) => {
  await testSimpleTemplate(page, 'Google Microservices Demo', 'Google-simple', 12)
})

test('creating a complex product from a template should work (Google)', async ({ page }) => {
  await testComplexTemplate(page, 'Google Microservices Demo', 'Google-complex', 12)
})

test('creating a simple product from a template should work (Strapi)', async ({ page }) => {
  await testSimpleTemplate(page, 'Strapi', 'Strapi-simple', 2)
})

test('creating a complex product from a template should work (Strapi)', async ({ page }) => {
  await testComplexTemplate(page, 'Strapi', 'Strapi-complex', 2)
})

test('creating a simple product from a template should work (WordPress)', async ({ page }) => {
  await testSimpleTemplate(page, 'WordPress', 'WordPress-simple', 2)
})

test('creating a complex product from a template should work (WordPress)', async ({ page }) => {
  await testComplexTemplate(page, 'WordPress', 'WordPress-complex', 2)
})
