import { ROUTE_STORAGES, storageUrl } from '@app/routes'
import { Page } from 'playwright'

export const createStorage = async (page: Page, name: string, url: string, accessKey: string, secretKey: string) => {
  await page.goto(ROUTE_STORAGES)
  await page.locator('button:has-text("Add")').click()
  await page.locator('div.card h4:has-text("New storage") >> visible=true')
  await page.locator('input[id="name"]').fill(name)
  await page.locator('input[id="url"]').fill(url)
  await page.locator('input[id="accessKey"]').fill(accessKey)
  await page.locator('input[id="secretKey"]').fill(secretKey)
  await page.locator('button:has-text("Save")').click()
  await page.locator(`div.card h3:has-text('${name}')`).click()
  await page.waitForURL(`${ROUTE_STORAGES}/**`)
  return page.url().split('/').pop()
}

export const deleteStorage = async (page: Page, storageId: string) => {
  await page.goto(storageUrl(storageId))
  await page.locator('button:has-text("Delete")').click()
  await page.locator('div[role=dialog] button:has-text("Delete")').click()
  await page.waitForURL(`${ROUTE_STORAGES}`)
}
