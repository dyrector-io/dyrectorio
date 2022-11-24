import { expect, Page, test } from '@playwright/test'
import { createNode } from './utils/nodes'
import { addDeploymentToSimpleProduct, addImageToSimpleProduct, createProduct } from './utils/products'

const setup = async (
  page: Page,
  nodeName: string,
  productName: string,
  type: 'Simple' | 'Complex' = 'Simple',
): Promise<{ nodeId: string; productId: string }> => {
  const nodeId = await createNode(page, nodeName)
  const productId = await createProduct(page, productName, type)

  return {
    nodeId,
    productId,
  }
}

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

test('can not create multiple preparings to the same node with the same prefix', async ({ page }) => {
  const nodeName = 'NodePrefixCollision'
  const productName = 'NodePrefixCollision'
  const prefixOne = 'prefix-one'

  const { productId } = await setup(page, nodeName, productName)
  await addImageToSimpleProduct(page, productId, 'nginx')
  const one = await addDeploymentToSimpleProduct(page, productId, nodeName, prefixOne)
  await page.goto(one.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)

  const other = await addDeploymentToSimpleProduct(page, productId, nodeName, prefixOne)

  expect(other.id, one.id)
  await page.goto(other.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)
})
