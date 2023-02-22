import { productUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { versionUrl } from './../src/routes'
import { DAGENT_NODE } from './utils/common'
import { addDeploymentToVersion, createImage, createProduct, createVersion } from './utils/products'

test('Add incremental version should work', async ({ page }) => {
  const productId = await createProduct(page, 'PW-INCREMENTAL', 'Complex')
  await createVersion(page, productId, '1.0.0', 'Incremental')

  await page.goto(productUrl(productId))

  await expect(await page.locator('h5:has-text("1.0.0")')).toBeVisible()
})

test('Add rolling version should work', async ({ page }) => {
  const productId = await createProduct(page, 'PW-COMPLEX', 'Complex')
  await createVersion(page, productId, '1.0.0', 'Rolling')

  await page.goto(productUrl(productId))

  await expect(await page.locator('h5:has-text("1.0.0")')).toBeVisible()
})

test("New version should get the default version's images and deployments", async ({ page }) => {
  const productId = await createProduct(page, 'PW-NEW-CHILD', 'Complex')
  const parentVersion = await createVersion(page, productId, '1.0.0', 'Incremental')
  await createImage(page, productId, parentVersion, 'nginx')
  await addDeploymentToVersion(page, productId, parentVersion, DAGENT_NODE)

  const childVersion = await createVersion(page, productId, '2.0.0', 'Incremental')

  await page.goto(productUrl(productId))

  await expect(page.locator('div.bg-dyo-blue:has-text("Incremental")')).toHaveCount(2)
  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):right-of(h5:has-text("1.0.0"))`)).toHaveCount(1)
  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):right-of(h5:has-text("2.0.0"))`)).toHaveCount(0)

  await page.goto(versionUrl(productId, childVersion, { section: 'images' }))

  const imagesTableBody = await page.locator('.table-row-group')
  const imagesRows = await imagesTableBody.locator('.table-row')

  await expect(imagesRows).toHaveCount(1)

  await page.goto(versionUrl(productId, childVersion, { section: 'deployments' }))

  await expect(await page.locator(`h3:has-text("You haven't added a deployment to this version")`)).toHaveCount(0)
})

test('Change default version should work', async ({ page }) => {
  const productId = await createProduct(page, 'PW-CHANGE-DEFAULT', 'Complex')
  const versionOne = await createVersion(page, productId, '1.0.0', 'Incremental')
  const versionTwo = await createVersion(page, productId, '2.0.0', 'Incremental')
  await createImage(page, productId, versionOne, 'nginx')
  await createImage(page, productId, versionTwo, 'redis')

  await page.goto(productUrl(productId))

  await page.locator('img[src="/home_bold.svg"]:below(h5:has-text("2.0.0"))').first().click()

  await page.waitForSelector('button:has-text("Confirm")')
  await page.locator('button:has-text("Confirm")').click()

  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):left-of(h5:has-text("2.0.0"))`)).toHaveCount(0)
  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):right-of(h5:has-text("2.0.0"))`)).toHaveCount(1)

  const versionThree = await createVersion(page, productId, '3.0.0', 'Incremental')
  await page.goto(versionUrl(productId, versionThree, { section: 'images' }))

  const imagesTableBody = await page.locator('.table-row-group')
  const imagesRows = await imagesTableBody.locator('.table-row')

  await expect(imagesRows).toHaveCount(1)
  await expect(await page.locator('div.table-cell:has-text("redis")').first()).toBeVisible()
  await expect(await page.locator('div.table-cell:has-text("nginx")')).toHaveCount(0)
})

test('Increase version should work', async ({ page }) => {
  const productId = await createProduct(page, 'PW-INCREASE-VERSION', 'Complex')
  const versionOne = await createVersion(page, productId, '1.0.0', 'Incremental')
  await createImage(page, productId, versionOne, 'nginx')
  await addDeploymentToVersion(page, productId, versionOne, DAGENT_NODE)

  await page.goto(productUrl(productId))

  await page.locator('img[src="/arrow_up_bold.svg"]:below(h5:has-text("1.0.0"))').first().click()

  await page.waitForSelector('h4:has-text("Increase 1.0.0")')
  await page.locator('input[name=name]').fill('2.0.0')

  const navigation = page.waitForNavigation({ url: `**${productUrl(productId)}/versions/**` })
  await page.locator('button:has-text("Save")').click()
  await navigation

  const imagesTableBody = await page.locator('.table-row-group')
  const imagesRows = await imagesTableBody.locator('.table-row')

  await expect(imagesRows).toHaveCount(1)
  await expect(await page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()

  const deploymentsTableBody = await page.locator('.table-row-group')
  const deploymentsRow = await deploymentsTableBody.locator('.table-row')

  await expect(deploymentsRow).toHaveCount(1)
})
