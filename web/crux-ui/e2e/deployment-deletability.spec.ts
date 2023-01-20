import { deploymentUrl, productUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { extractDeploymentUrl } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import { createImage, createProduct, createVersion } from './utils/products'

test('Inprogress deployment should be not deletable', async ({ page }) => {
  const productName = 'PRODUCT-TEST1-DELETE'

  const productId = await createProduct(page, productName, 'Complex')
  const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
  await createImage(page, productId, versionId, 'nginx')

  await deployWithDagent(page, 'pw-complex-deletability', productId, versionId, true)

  const { deploymentId } = extractDeploymentUrl(page.url())
  await page.goto(deploymentUrl(productId, versionId, deploymentId))

  await expect(await page.getByText('In progress')).toHaveCount(1, { timeout: 10000 })
  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(0)
})

test('Delete deployment should work', async ({ page }, testInfo) => {
  const productName = 'PRODUCT-TEST2-DELETE'

  const productId = await createProduct(page, productName, 'Complex')
  const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
  await createImage(page, productId, versionId, 'nginx')

  await deployWithDagent(page, 'pw-complex-delete', productId, versionId, false, testInfo.title)

  const { deploymentId } = extractDeploymentUrl(page.url())
  await page.goto(deploymentUrl(productId, versionId, deploymentId))

  await expect(await page.locator('button:has-text("Delete")')).toHaveCount(1)

  await page.locator('button:has-text("Delete")').click()

  await page.waitForSelector('h4:has-text("Are you sure you want to delete Deployment?")')

  const navigation = page.waitForNavigation({ url: `**${productUrl(productId)}**` })
  await page.locator('button:has-text("Delete")').nth(1).click()
  await navigation
})
