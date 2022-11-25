import { productUrl, ROUTE_PRODUCTS, versionUrl } from '@app/routes'
import { expect, Page } from '@playwright/test'

export const createProduct = async (page: Page, name: string, type: 'Simple' | 'Complex') => {
  await page.goto(ROUTE_PRODUCTS)

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4:has-text("New product")')).toHaveCount(1)

  await page.locator('input[name=name] >> visible=true').fill(name)
  await page.locator(`form >> text=${type}`).click()

  await page.locator('button:has-text("Save")').click()

  const item = await page.waitForSelector(`a:has-text("${name}")`)

  await item.click()

  if (type === 'Simple') {
    await page.waitForSelector(`span:has-text("Changelog")`)
  }

  if (type === 'Complex') {
    await page.waitForNavigation()

    const productItem = await page.locator(`h5:has-text("${name}")`)
    await productItem.click()
    await page.waitForSelector(`button:has-text("Add version")`)
  }

  return page.url().split('/').pop()
}

export const createVersion = async (page: Page, productId: string, name: string, type: string) => {
  await page.goto(productUrl(productId))
  await page.waitForSelector(`button:has-text("Add version")`)

  await page.locator('button:has-text("Add version")').click()

  await page.locator('input[name=name] >> visible=true').fill(name)
  await page.locator(`form >> text=${type}`).click()

  await page.locator('button:has-text("Save")').click()

  const item = await page.waitForSelector(`h5:has-text("${name}")`)

  await item.click()

  await page.waitForSelector('button:has-text("Add image")')

  return page.url().split('/').pop()
}

export const createImage = async (page: Page, productId: string, versionId: string, image: string) => {
  await page.goto(versionUrl(productId, versionId))
  await page.waitForSelector('button:has-text("Add image")')

  await page.locator('button:has-text("Add image")').click()
  await page.locator('input[name=imageName] >> visible=true').type(image)

  const imageItem = await page.waitForSelector(`label:has-text("${image}")`)
  await imageItem.click()

  const addButton = await page.waitForSelector('button:has-text("Add")')
  await addButton.click()

  await page.waitForSelector('button:has-text("Add image")')

  const settingsButton = await page.waitForSelector(`[src="/settings.svg"]:right-of(:text("${image}"))`)
  await settingsButton.click()

  await page.waitForSelector(`h2:has-text("Image")`)

  return page.url().split('/').pop()
}

export const addImageToSimpleProduct = async (page: Page, productId: string, image: string) => {
  await page.goto(productUrl(productId))

  await page.locator('button:has-text("Add image")').click()
  await expect(page.locator('h4:has-text("Add image")')).toHaveCount(1)

  await page.locator('input[name=imageName] >> visible=true').type(image)

  const imageItem = await page.waitForSelector(`label:has-text("${image}")`)
  await imageItem.click()

  await page.locator('button:has-text("Add")').click()

  await page.waitForSelector(`a:has-text("${image}")`)
}

export const addDeploymentToSimpleProduct = async (
  page: Page,
  productId: string,
  nodeName: string,
  prefix: string | null,
): Promise<{ id: string; url: string }> => {
  await page.goto(productUrl(productId))

  await page.locator('button:has-text("Add deployment")').click()
  await expect(page.locator('h4:has-text("Add deployment")')).toHaveCount(1)

  if (prefix) {
    await page.locator('input[name=prefix] >> visible=true').fill(prefix)
  }

  await page.locator(`button:has-text("${nodeName}")`).click()

  await page.locator('button:has-text("Add")').click()

  await page.waitForNavigation()

  return {
    id: page.url().split('/').pop(),
    url: page.url(),
  }
}

export const addDeploymentToVersion = async (
  page: Page,
  productId: string,
  versionId: string,
  nodeName: string,
  prefix: string = null,
): Promise<{ id: string; url: string }> => {
  await page.goto(versionUrl(productId, versionId))

  await page.locator('button:has-text("Add deployment")').click()
  await expect(page.locator('h4:has-text("Add deployment")')).toHaveCount(1)

  if (prefix) {
    await page.locator('input[name=prefix] >> visible=true').fill(prefix)
  }

  await page.locator(`button:has-text("${nodeName}")`).click()
  await page.locator('button:has-text("Add")').click()

  await page.waitForNavigation()

  return {
    id: page.url().split('/').pop(),
    url: page.url(),
  }
}
