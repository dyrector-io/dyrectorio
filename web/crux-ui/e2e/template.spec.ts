import { productUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createProductFromTemplate } from './utils/templates'

test('creating a product from a template should work', async ({ page }) => {
  const productId = await createProductFromTemplate(page, "Strapi", "Strapi-test", "Simple")

  await expect(page).toHaveURL(productUrl(productId))

  const imageTableBody = await page.locator(".table-row-group")
  const imageRows = await imageTableBody.locator(".table-row")
  await expect(imageRows).toHaveCount(2)
})
