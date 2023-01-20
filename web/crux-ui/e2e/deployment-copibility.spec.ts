import { deploymentUrl, productUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { DAGENT_NODE, extractDeploymentUrl } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
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
    const productName = 'PRODUCT-COPY-TEST1'

    const { productId } = await setup(page, nodeName, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    await addDeploymentToSimpleProduct(page, productId, nodeName, null)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(a:has-text("${productName}"))`).first()
    await expect(copyButton).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment list in product', async ({ page }) => {
    const nodeName = 'NODE-TEST2'
    const productName = 'PRODUCT-COPY-TEST2'

    const { productId } = await setup(page, nodeName, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    await addDeploymentToSimpleProduct(page, productId, nodeName, null)

    await page.goto(productUrl(productId))

    await page.locator('button:has-text("Deployments")').click()

    await page.waitForSelector('[alt="Copy"]')

    await expect(await page.locator('[alt="Copy"]')).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment detail page', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST3'

    const { productId } = await setup(page, DAGENT_NODE, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    const { url } = await addDeploymentToSimpleProduct(page, productId, DAGENT_NODE, null)

    await page.goto(url)

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('successful deployment should be not copiable on deployment detail page', async ({ page }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST4'

    const productId = await createProduct(page, productName, 'Simple')
    await addImageToSimpleProduct(page, productId, 'nginx')

    const prefix = 'pw-simp-copy'

    await deployWithDagent(page, prefix, productId, "",  false, testInfo.title)

    const { versionId, deploymentId } = extractDeploymentUrl(page.url())

    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })
})

test.describe('Complex product', () => {
  test('preparing deployment should be not copiable on deployment list', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST5'

    const { productId } = await setup(page, DAGENT_NODE, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')
    await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE)

    await page.goto(ROUTE_DEPLOYMENTS)

    const copyButton = await page.locator(`[alt="Copy"]:right-of(a:has-text("${productName}"))`).first()
    await expect(copyButton).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment list in product', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST6'

    const { productId } = await setup(page, DAGENT_NODE, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')
    await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE)

    await page.goto(versionUrl(productId, versionId, { section: 'deployments' }))

    await page.waitForSelector('button:has-text("Add image")')

    await expect(await page.locator('[alt="Copy"]')).toHaveClass(/cursor-not-allowed/)
  })

  test('preparing deployment should be not copiable on deployment detail page', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST7'

    const { productId } = await setup(page, DAGENT_NODE, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')
    await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE)

    const { id } = await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE)

    await page.goto(deploymentUrl(productId, versionId, id))

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('should be able to copy successful deployment', async ({ page }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST8'

    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')

    await deployWithDagent(page, 'pw-complex-copibility', productId, versionId,  false, testInfo.title)

    const { deploymentId } = extractDeploymentUrl(page.url())

    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)

    const navigation = page.waitForNavigation({ url: `**${versionUrl(productId, versionId)}/deployments/**` })
    await page.locator('button:has-text("Copy")').click()
    await navigation

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy obsolete deployment', async ({ page }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST9'

    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')

    await deployWithDagent(page, 'pw-complex-copibility-obsolete', productId, versionId,  false, testInfo.title + "1")

    const { deploymentId } = extractDeploymentUrl(page.url())

    await deployWithDagent(page, 'pw-complex-copibility-obsolete', productId, versionId,  false, testInfo.title + "2")

    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)

    const navigation = page.waitForNavigation({ url: `**${versionUrl(productId, versionId)}/deployments/**` })
    await page.locator('button:has-text("Copy")').click()
    await navigation

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('Inprogress deployment should be not copiable', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST10'

    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')

    await deployWithDagent(page, 'pw-complex-copibility-inprogress', productId, versionId, true)

    const { deploymentId } = extractDeploymentUrl(page.url())
    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await expect(await page.getByText('In progress')).toHaveCount(1, { timeout: 10000 })
    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('Can copy deployment while there is a preparing deployment on the same node with different prefix and should not overwrite it', async ({
    page,
  }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST11'
    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')

    await createImage(page, productId, versionId, 'nginx')

    await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE, 'pw-complex-first')

    await deployWithDagent(page, 'pw-complex-second', productId, versionId,  false, testInfo.title)

    await page.goto(versionUrl(productId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    const copy = await page.locator(`[alt="Copy"]:right-of(:text("pw-complex-second"))`).first()

    const navigation = page.waitForNavigation({ url: `**${versionUrl(productId, versionId)}/deployments/**` })
    await copy.click()
    await navigation

    await page.goto(versionUrl(productId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(2)
  })
})
