import { versionUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { screenshotPath } from './utils/common'
import { deployWithDagent } from './utils/node-helper'
import { createImage, createProduct, createVersion } from './utils/products'

const prefix = 'pw-first'
const prefixTwo = 'pw-second'
const image = 'nginx'

test('Deploy to node should be successful', async ({ page }) => {
  const productId = await createProduct(page, 'PW-DEPLOY-TEST', 'Complex')
  const versionId = await createVersion(page, productId, '0.1.0', 'Incremental')
  await createImage(page, productId, versionId, image)

  await deployWithDagent(page, productId, versionId, prefix)

  await page.screenshot({ path: screenshotPath('successful-deployment'), fullPage: true })

  await expect(await page.locator('.bg-dyo-green').first()).toContainText('Successful')
})

test('Second successful deployment should make the first deployment obsolete', async ({ page }) => {
  const productId = await createProduct(page, 'PW-OBSOLETE', 'Complex')
  const versionId = await createVersion(page, productId, '1.0.0', 'Incremental')
  await createImage(page, productId, versionId, image)

  await deployWithDagent(page, productId, versionId, prefixTwo)

  await expect(await page.locator('.bg-dyo-green').first()).toContainText('Successful')

  await deployWithDagent(page, productId, versionId, prefixTwo)

  await expect(await page.locator('.bg-dyo-green').first()).toContainText('Successful')

  await page.goto(versionUrl(productId, versionId, { section: 'deployments' }))
  await page.screenshot({ path: screenshotPath('deployment-should-be-obsolete'), fullPage: true })

  const deploymentsTableBody = await page.locator('.table-row-group')
  const deploymentsRows = await deploymentsTableBody.locator('.table-row')

  await expect(deploymentsRows).toHaveCount(2)
  await expect(await page.locator('.bg-dyo-purple')).toHaveCount(1)
  await expect(await page.locator('.bg-dyo-green')).toHaveCount(1)
})
