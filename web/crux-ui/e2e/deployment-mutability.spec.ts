import { deploymentUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, extractDeploymentUrl, screenshotPath } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import {
  addDeploymentToSimpleProduct,
  addDeploymentToVersion,
  addImageToSimpleProduct,
  createImage,
  createProduct,
  createVersion,
} from './utils/products'

const image = 'nginx'

test.describe('Simple product', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const productId = await createProduct(page, 'PW-SIMPLE-MUTABILITY-1', 'Simple')
    await addImageToSimpleProduct(page, productId, image)
    await addDeploymentToSimpleProduct(page, productId, DAGENT_NODE, 'pw-simple-preparing')

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeEditable()
  })

  test('successful deployment should be mutable', async ({ page }, testInfo) => {
    const productId = await createProduct(page, 'PW-SIMPLE-MUTABILITY-2', 'Simple')
    await addImageToSimpleProduct(page, productId, image)

    const prefix = 'pw-simp-mut'

    await deployWithDagent(page, prefix, productId, "",  false, testInfo.title)

    const { versionId, deploymentId } = extractDeploymentUrl(page.url())

    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await page.screenshot({ path: screenshotPath('simple-prod-successful-deployment'), fullPage: true })

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeEditable()
  })
})

test.describe('Complex product incremental version', () => {
  test('preparing deployment should be mutable', async ({ page }) => {
    const productId = await createProduct(page, 'PW-COMP-MUTABILITY-1', 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, image)

    const { id } = await addDeploymentToVersion(page, productId, versionId, DAGENT_NODE)

    await page.goto(deploymentUrl(productId, versionId, id))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(1)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeEditable()
  })

  test('successful deployment should be immutable', async ({ page }, testInfo) => {
    const productId = await createProduct(page, 'PW-COMP-MUTABILITY-2', 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, image)

    await deployWithDagent(page, 'pw-complex-mutability', productId, versionId,  false, testInfo.title)

    const { deploymentId } = extractDeploymentUrl(page.url())

    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeDisabled()
  })

  test('obsolete deployment should be immutable', async ({ page }, testInfo) => {
    const productId = await createProduct(page, 'PW-COMP-MUTABILITY-3', 'Complex')
    const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
    await createImage(page, productId, versionId, image)

    await deployWithDagent(page, 'pw-complex-mutability-obsolete', productId, versionId, false, testInfo.title + "1")

    const { deploymentId } = extractDeploymentUrl(page.url())

    await deployWithDagent(page, 'pw-complex-mutability-obsolete', productId, versionId, false, testInfo.title + "2")

    await page.goto(deploymentUrl(productId, versionId, deploymentId))

    await expect(await page.locator('button:has-text("Edit")')).toHaveCount(0)
    await page.locator("img[src='/view_tile.svg']").click()

    await page.waitForSelector('input[id=name]')
    await expect(await page.locator('input[id=name]')).toBeDisabled()
  })
})
