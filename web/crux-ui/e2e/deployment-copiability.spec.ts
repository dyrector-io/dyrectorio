import { deploymentUrl, productUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { DAGENT_NODE } from './utils/common'
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

  test('preparing deployment should be not copiable on deployment details page', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST3'

    const { productId } = await setup(page, DAGENT_NODE, productName)
    await addImageToSimpleProduct(page, productId, 'nginx')
    const { url } = await addDeploymentToSimpleProduct(page, productId, DAGENT_NODE, null)

    await page.goto(url)

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('successful deployment should be not copiable on deployment details page', async ({ page }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST4'

    const productId = await createProduct(page, productName, 'Simple')
    await addImageToSimpleProduct(page, productId, 'nginx')

    const prefix = 'pw-simp-copy'

    const deploymentId = await deployWithDagent(page, prefix, productId, '', false, testInfo.title)

    await page.goto(deploymentUrl(deploymentId))

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

  test('preparing deployment should be not copiable on deployment details page', async ({ page }) => {
    const productName = 'PRODUCT-COPY-TEST7'

    const { productId } = await setup(page, DAGENT_NODE, productName, 'Complex')
    const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')

    const { id } = await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE)

    await page.goto(deploymentUrl(id))

    await page.waitForSelector('button:has-text("Edit")')

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(0)
  })

  test('should be able to copy successful deployment', async ({ page }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST8'

    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')

    const deploymentId = await deployWithDagent(
      page,
      'pw-complex-copibility',
      productId,
      versionId,
      false,
      testInfo.title,
    )

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)

    await page.locator('button:has-text("Copy")').click()
    await page.waitForURL(`**/deployments/**`)

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  test('should be able to copy obsolete deployment', async ({ page }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST9'

    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, 'nginx')

    const deploymentId = await deployWithDagent(
      page,
      'pw-complex-copibility-obsolete',
      productId,
      versionId,
      false,
      `${testInfo.title}1`,
    )

    await deployWithDagent(page, 'pw-complex-copibility-obsolete', productId, versionId, false, `${testInfo.title}2`)

    await page.goto(deploymentUrl(deploymentId))

    await expect(await page.locator('button:has-text("Copy")')).toHaveCount(1)

    await page.locator('button:has-text("Copy")').click()
    await page.waitForURL(`**/deployments/**`)

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)
  })

  // TODO (@m8vago): 'In Progress deployment should be not copiable'
  // create an image which takes at least 10 sec to be deployed, so we can test the upper mentioned check

  test('Can copy deployment while there is a preparing deployment on the same node with different prefix and should not overwrite it', async ({
    page,
  }, testInfo) => {
    const productName = 'PRODUCT-COPY-TEST11'
    const productId = await createProduct(page, productName, 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')

    await createImage(page, productId, versionId, 'nginx')

    await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE, 'pw-complex-first')

    await deployWithDagent(page, 'pw-complex-second', productId, versionId, false, testInfo.title)

    await page.goto(versionUrl(productId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    const copy = await page.locator(`[alt="Copy"]:right-of(:text("pw-complex-second"))`).first()

    await copy.click()
    await page.waitForURL(`**/deployments/**`)

    await page.goto(versionUrl(productId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    await expect(await page.locator('div.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(2)
  })
})
