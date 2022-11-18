import { deploymentUrl, productUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createNode } from './utils/nodes'
import {
  addDeploymentToSimpleProduct,
  addDeploymentToVersion,
  addImageToSimpleProduct,
  createImage,
  createProduct,
  createVersion,
} from './utils/products'

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

test.describe('Simple product', () => {
  test('preparing deployment should be not copiable on deployment list', async ({ page }) => {
    const nodeName = 'NODE-TEST1'
    const productName = 'PRODUCT-TEST1'

    const { productId } = await setup(page, nodeName, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    await addDeploymentToSimpleProduct(page, productId, nodeName, null)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(a:has-text("${productName}"))`).first()
    await expect(copyButton).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment list in product', async ({ page }) => {
    const nodeName = 'NODE-TEST2'
    const productName = 'PRODUCT-TEST2'

    const { productId } = await setup(page, nodeName, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    await addDeploymentToSimpleProduct(page, productId, nodeName, null)

    await page.goto(productUrl(productId))

    await page.locator('button:has-text("Deployments")').click()

    await page.waitForSelector('[alt="Copy"]')

    await expect(await page.locator('[alt="Copy"]')).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment detail page', async ({ page }) => {
    const nodeName = 'NODE-TEST3'
    const productName = 'PRODUCT-TEST3'

    const { productId } = await setup(page, nodeName, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    const { url } = await addDeploymentToSimpleProduct(page, productId, nodeName, null)

    await page.goto(url)

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })
})

test.describe('Complex product', () => {
  test('preparing deployment should be not copiable on deployment list', async ({ page }) => {
    const nodeName = 'NODE-TEST4'
    const productName = 'PRODUCT-TEST4-COMPLEX'

    const { productId } = await setup(page, nodeName, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')
    await addDeploymentToVersion(page, productId, versionId, nodeName)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(a:has-text("${productName}"))`).first()
    await expect(copyButton).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment list in product', async ({ page }) => {
    const nodeName = 'NODE-TEST5'
    const productName = 'PRODUCT-TEST5-COMPLEX'

    const { productId } = await setup(page, nodeName, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')
    await addDeploymentToVersion(page, productId, versionId, nodeName)

    await page.goto(versionUrl(productId, versionId, { section: 'deployments' }))

    await page.waitForSelector('button:has-text("Add image")')

    await expect(await page.locator('[alt="Copy"]')).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment detail page', async ({ page }) => {
    const nodeName = 'NODE-TEST6'
    const productName = 'PRODUCT-TEST6-COMPLEX'

    const { productId } = await setup(page, nodeName, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')
    await addDeploymentToVersion(page, productId, versionId, nodeName)

    const { id } = await addDeploymentToVersion(page, productId, versionId, nodeName)

    await page.goto(deploymentUrl(productId, versionId, id))

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })
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
