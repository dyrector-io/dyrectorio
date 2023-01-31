import { WS_TYPE_PATCH_IMAGE } from '@app/models'
import { expect, Page, test, WebSocket } from '@playwright/test'
import { imageConfigUrl } from '../src/routes'
import { screenshotPath } from './utils/common'
import { createImage, createProduct, createVersion } from './utils/products'

const setup = async (
  page: Page,
  productName: string,
  versionName: string,
  imageName: string,
): Promise<{ productId: string; versionId: string; imageId: string }> => {
  const productId = await createProduct(page, productName, 'Complex')
  const versionId = await createVersion(page, productId, versionName, 'Incremental')
  const imageId = await createImage(page, productId, versionId, imageName)

  return {
    productId,
    versionId,
    imageId,
  }
}

test.describe('View state', () => {
  test('Editor state should show the configuration fields', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'editor-state-conf', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(productId, versionId, imageId))

    const editorButton = await page.waitForSelector('button:has-text("Editor")')

    await editorButton.click()

    const selector = await page.locator('label:has-text("Filters")').first()

    await page.screenshot({ path: screenshotPath('image-config-editor'), fullPage: true })

    await expect(selector).toBeVisible()
  })

  test('JSON state should show the json editor', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'editor-state-json', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(productId, versionId, imageId))

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')

    await jsonEditorButton.click()

    await page.screenshot({ path: screenshotPath('image-config-json'), fullPage: true })

    const jsonContainer = await page.locator('textarea')
    await expect(jsonContainer).toBeVisible()
  })
})

test.describe('Filters', () => {
  const randomFilter = () => {
    const mainFilters = [
      { base: 'Common', sub: 'Config container' },
      { base: 'Docker', sub: 'Network mode' },
      { base: 'Kubernetes', sub: 'Deployment strategy' },
    ]

    return mainFilters[Math.floor(Math.random() * mainFilters.length)]
  }

  test('All should be selected by default', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'filter-all', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(productId, versionId, imageId))

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).toHaveClass(/bg-dyo-turquoise/)
  })

  test('All should not be selected if one of the main filters are not selected', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'filter-select', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(productId, versionId, imageId))

    await page.locator(`button:has-text("${randomFilter().base}")`).first().click()

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('Main filter should not be selected if one of its sub filters are not selected', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'sub-filter', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(productId, versionId, imageId))

    const filter = randomFilter()
    const subFilter = await page.locator(`button:has-text("${filter.sub}")`)

    await subFilter.click()

    const mainFilter = await page.locator(`button:has-text("${filter.base}")`).first()

    await expect(mainFilter).not.toHaveClass(/bg-/)
  })

  test('Config field should be invisible if its sub filter is not selected', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'sub-deselect', '1.0.0', 'redis')

    await page.goto(imageConfigUrl(productId, versionId, imageId))

    const filter = randomFilter()
    const subFilter = await page.locator(`button:has-text("${filter.sub}")`)

    await subFilter.click()

    const configField = await page.locator(`label:has-text("${filter.sub.toUpperCase()}")`)

    await expect(configField).toHaveCount(0)
  })
})

const wsPatchSent = (ws: WebSocket) =>
  ws.waitForEvent('framesent', data => {
    const payload = JSON.parse(data.payload as string)
    return payload.type === WS_TYPE_PATCH_IMAGE
  })

test.describe('Image configurations', () => {
  test('Port should be saved after adding it from the config field', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'port-editor', '1.0.0', 'redis')

    const sock = page.waitForEvent('websocket')
    await page.goto(imageConfigUrl(productId, versionId, imageId))

    const ws = await sock
    let wsSent = wsPatchSent(ws)

    const addPortsButton = await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
    await addPortsButton.click()
    await wsSent

    const internalValue = '1000'
    const externalValue = '2000'

    wsSent = wsPatchSent(ws)
    const internal = page.locator('input[placeholder="Internal"]')
    const external = page.locator('input[placeholder="External"]')
    await internal.type(internalValue)
    await external.type(externalValue)
    await wsSent

    await page.reload()

    await expect(internal).toHaveValue(internalValue)
    await expect(external).toHaveValue(externalValue)
  })

  test('Port should be saved after adding it from the json editor', async ({ page }) => {
    const { productId, versionId, imageId } = await setup(page, 'port-json', '1.0.0', 'redis')

    const sock = page.waitForEvent('websocket')
    await page.goto(imageConfigUrl(productId, versionId, imageId))
    const ws = await sock

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')

    await jsonEditorButton.click()

    const internal = '2000'
    const external = '4000'

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.ports = [{ internal, external }]

    const wsSent = wsPatchSent(ws)
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })
})
