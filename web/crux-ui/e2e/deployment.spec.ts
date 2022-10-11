import { productUrl, ROUTE_DEPLOYMENTS } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createNode } from './utils/nodes'
import { addDeploymentToSimpleProduct, addImageToSimpleProduct, createProduct } from './utils/products'

const setup = async (
  page: Page,
  nodeName: string,
  productName: string,
): Promise<{ nodeId: string; productId: string }> => {
  const nodeId = await createNode(page, nodeName)
  const productId = await createProduct(page, productName, 'Simple')

  return {
    nodeId,
    productId,
  }
}

test('preparing deployment is copyable on deployment list', async ({ page }) => {
  const { productId } = await setup(page, 'NODE-TEST1', 'PRODUCT-TEST1')
  await addImageToSimpleProduct(page, productId, 'nginx')
  await addDeploymentToSimpleProduct(page, productId, 'NODE-TEST1', null)

  await page.goto(ROUTE_DEPLOYMENTS)

  await expect(await page.locator('[alt="Copy"]')).not.toHaveClass('cursor-not-allowed')
})

test('preparing deployment is copyable on deployment list in product', async ({ page }) => {
  const { productId } = await setup(page, 'NODE-TEST2', 'PRODUCT-TEST2')
  await addImageToSimpleProduct(page, productId, 'nginx')
  await addDeploymentToSimpleProduct(page, productId, 'NODE-TEST2', null)

  await page.goto(productUrl(productId))

  await page.locator('button:has-text("Deployments")').click()

  await page.waitForSelector('[alt="Copy"]')

  await expect(await page.locator('[alt="Copy"]')).not.toHaveClass('cursor-not-allowed')
})

test('preparing deployment is copyable on deployment detail page', async ({ page }) => {
  const { productId } = await setup(page, 'NODE-TEST3', 'PRODUCT-TEST3')
  await addImageToSimpleProduct(page, productId, 'nginx')
  const { url } = await addDeploymentToSimpleProduct(page, productId, 'NODE-TEST3', null)

  await page.goto(url)

  await page.waitForSelector('button:has-text("Copy")')

  await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)
})
