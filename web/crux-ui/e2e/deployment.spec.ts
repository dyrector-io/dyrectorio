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
  const nodeName = 'NODE-TEST1'
  const productName = 'PRODUCT-TEST1'

  const { productId } = await setup(page, nodeName, productName)
  await addImageToSimpleProduct(page, productId, 'nginx')
  await addDeploymentToSimpleProduct(page, productId, nodeName, null)

  await page.goto(ROUTE_DEPLOYMENTS)

  await expect(await page.locator('[alt="Copy"]')).not.toHaveClass('cursor-not-allowed')
})

test('preparing deployment is copyable on deployment list in product', async ({ page }) => {
  const nodeName = 'NODE-TEST2'
  const productName = 'PRODUCT-TEST2'

  const { productId } = await setup(page, nodeName, productName)
  await addImageToSimpleProduct(page, productId, 'nginx')
  await addDeploymentToSimpleProduct(page, productId, nodeName, null)

  await page.goto(productUrl(productId))

  await page.locator('button:has-text("Deployments")').click()

  await page.waitForSelector('[alt="Copy"]')

  await expect(await page.locator('[alt="Copy"]')).not.toHaveClass('cursor-not-allowed')
})

test('preparing deployment is copyable on deployment detail page', async ({ page }) => {
  const nodeName = 'NODE-TEST3'
  const productName = 'PRODUCT-TEST3'

  const { productId } = await setup(page, nodeName, productName)
  await addImageToSimpleProduct(page, productId, 'nginx')
  const { url } = await addDeploymentToSimpleProduct(page, productId, nodeName, null)

  await page.goto(url)

  await page.waitForSelector('button:has-text("Copy")')

  await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)
})

test('can create multiple preparings to the same node with different prefixes', async ({ page }) => {
  const nodeName = 'NodeMultiPrefixes'
  const productName = 'MultiPrefixesProduct'
  const prefixOne = 'prefix-one'
  const prefixOther = 'prefix-other'

  const { productId } = await setup(page, nodeName, productName)
  await addImageToSimpleProduct(page, productId, 'nginx')
  const one = await addDeploymentToSimpleProduct(page, productId, nodeName, prefixOne)
  const other = await addDeploymentToSimpleProduct(page, productId, nodeName, prefixOther)

  await page.goto(one.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)

  await page.goto(other.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOther}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOther}")`)).toHaveCount(1)
})
